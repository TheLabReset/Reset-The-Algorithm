// Lecturas de cada fuente por separado (Captura, Activación y Rendimiento). Cada función recibe la vista y devuelve frases que observan, no ordenan.
// Si el dato no sostiene una conclusión, la frase lo dice o se queda en lo descriptivo.
import { numero, dolares, porcentaje, compacto, diaSemanaLargo, mesLargo, fecha } from '../sistema/formato.js';
import { periodoTexto, comparacionTexto, frente, cuanto, capital, lista, enLetras, variacionFrase, horasTexto, diasTexto, enElPeriodo, delPeriodo } from './comun.js';
import { CLIENTE } from '../cliente.js';

const P = (v) => v.periodo;

export function pautaResumen(v) {
  const p = v.lee.pauta;
  const titulo = 'Leads que reportan las plataformas';
  if (p.cambio == null) return { titulo, lectura: `Un lead cada ${dolares(p.cpl, 2)}. No hay días medidos suficientes para comparar con ${comparacionTexto(P(v))}.` };
  return { titulo, lectura: `${variacionFrase('Los leads por día', p.cambio, P(v))}. Cada lead costó ${dolares(p.cpl, 2)}.` };
}

export function inversionDia(v) {
  const s = v.lee.pauta.serieInversion.filter((p) => p.valor != null);
  const titulo = 'Inversión por día';
  if (!s.length) return { titulo, lectura: 'Ningún día del período tiene el dato de las tres plataformas.' };
  const prom = s.reduce((t, p) => t + p.valor, 0) / s.length;
  const alto = s.reduce((a, p) => (p.valor > a.valor ? p : a));
  return { titulo, lectura: `Unos ${dolares(Math.round(prom))} al día. El más alto fue el ${fecha(alto.fecha).replace(/ de \d{4}$/, '')}, con ${dolares(Math.round(alto.valor))}.` };
}

export function plataformasLectura(v) {
  const ps = v.lee.plataformas.plataformas;
  const sobre = ps.filter((p) => p.cpl != null && p.objetivo != null && p.cpl > p.objetivo);
  const titulo = 'Costo por lead contra el objetivo';
  if (!sobre.length) {
    const justa = [...ps].filter((p) => p.cpl != null && p.objetivo).sort((a, b) => b.cpl / b.objetivo - a.cpl / a.objetivo)[0];
    return { titulo, lectura: `Las ${enLetras(ps.length, true)} plataformas quedan bajo su objetivo ${enElPeriodo(P(v))}. ${justa.nombre} es la más ajustada: ${dolares(justa.cpl, 2)} con un objetivo de ${dolares(justa.objetivo, 2)}.` };
  }
  return { titulo, lectura: `${lista(sobre.map((p) => p.nombre))} ${sobre.length === 1 ? 'paga' : 'pagan'} más por lead que su objetivo en ${periodoTexto(P(v))}.` };
}

export function campanasLectura(v) {
  const todas = v.lee.plataformas.plataformas.flatMap((p) => p.campanas.map((c) => ({ ...c, plataforma: p.nombre })));
  const conLeads = todas.filter((c) => c.leads > 0);
  const sin = todas.filter((c) => c.leads === 0 && c.inversion > 0);
  const barata = [...conLeads].sort((a, b) => a.cpl - b.cpl)[0];
  let lectura = barata ? `La campaña con el lead más barato es «${barata.nombre}», a ${dolares(barata.cpl, 2)}.` : 'Ninguna campaña reportó leads.';
  if (sin.length) lectura += ` ${capital(enLetras(sin.length, true))} ${sin.length === 1 ? 'campaña es' : 'campañas son'} de alcance y no ${sin.length === 1 ? 'busca' : 'buscan'} leads: ${dolares(sin.reduce((s, c) => s + c.inversion, 0))} ${enElPeriodo(P(v))}.`;
  return { titulo: 'Campañas con gasto en el período', lectura };
}

export function palabrasLectura(v) {
  const k = v.lee.plataformas.palabras;
  const titulo = 'Palabras clave en Google Ads';
  if (!k.sinConversion.length) return { titulo, lectura: 'Todas las palabras con gasto trajeron leads en una proporción parecida a la del resto.' };
  return { titulo, lectura: `${capital(lista(k.sinConversion.map((x) => `«${x.texto}»`)))} ${k.sinConversion.length === 1 ? 'gastó' : 'gastaron'} ${dolares(k.gastoSinConversion)} ${enElPeriodo(P(v))} y casi no ${k.sinConversion.length === 1 ? 'trajo' : 'trajeron'} leads.` };
}

export function terminosLectura(v) {
  const t = v.lee.plataformas.terminos;
  const comp = t.filter((x) => /smart fit|b2|bio ritmo|mega force/i.test(x.texto));
  const titulo = 'Términos que activaron anuncios';
  if (!comp.length) return { titulo, lectura: `Lo que el público escribió en Google antes de ver un anuncio de ${CLIENTE.nombre}.` };
  return { titulo, lectura: `Aparece ${lista(comp.map((x) => `«${x.texto}»`))}: quien buscaba otra marca vio el anuncio de ${CLIENTE.nombre}, y esas búsquedas traen pocos leads.` };
}

export function crmPorDia(v) {
  const c = v.lee.crmDetalle;
  const base = 'Se cuentan los leads de pauta y los que llegan por el sitio sin pauta.';
  return { titulo: 'Leads en el CRM, día por día', lectura: c.cambio == null ? base : `${variacionFrase('Los leads por día', c.cambio, P(v))}. ${base}` };
}

export function crmFuentes(v) {
  const f = v.lee.crmDetalle.fuentes;
  return { titulo: 'De dónde llegan', lectura: `${f[0].nombre} trae ${numero(f[0].pct)} de cada 100 leads; ${f[1].nombre}, ${numero(f[1].pct)}. Fuente por último clic registrada en el CRM.` };
}

export function crmEtapas(v) {
  const c = v.lee.crmDetalle;
  const abiertos = c.etapas.slice(0, 4).reduce((s, e) => s + e.estan, 0);
  return { titulo: 'Dónde están hoy los leads del período', lectura: `De ${numero(c.etapas[0].entraron)} leads, ${numero(c.salidas.inscritos)} ya se inscribieron, ${numero(c.salidas.descartados)} se descartaron y ${numero(abiertos)} siguen en alguna etapa.` };
}

export function crmCohorte(v) {
  const c = v.lee.crm;
  const alta = c.exclusivas.find((e) => e.id === 'alta');
  return { titulo: 'Del lead a la inscripción', lectura: `De cada 100 leads de la cohorte, ${numero(alta.de100)} se inscribieron. La mayor pérdida está en «${c.exclusivas.filter((e) => e.id !== 'alta').sort((a, b) => b.valor - a.valor)[0].nombre.toLowerCase()}».` };
}

export function crmAtencion(v) {
  const a = v.lee.crmDetalle.atencion;
  const base = `${numero(Math.round(a.enElDia * 100))} de cada 100 leads recibió su primer contacto en menos de un día.`;
  const finde = `El fin de semana, ${numero(Math.round(a.masDeUnDiaFinDeSemana * 100))} de cada 100 esperó más`;
  return { titulo: 'Primer contacto', lectura: a.cambioDesde ? `${base} ${finde}. Desde el ${Number(a.cambioDesde.desde.slice(8, 10))} de ${mesLargo(+a.cambioDesde.desde.slice(5, 7))} el CRM registra ${a.cambioDesde.texto.toLowerCase()}.` : `${base} ${finde}.` };
}

export function crmDescarte(v) {
  const d = v.lee.crmDetalle.descarte;
  const top = d.motivos[0];
  return { titulo: 'Por qué se descartan', lectura: `${capital(numero(d.total))} leads del período se descartaron. El motivo más frecuente: «${top.nombre.toLowerCase()}», ${numero(Math.round((top.valor / d.total) * 100))} de cada 100.` };
}

export function busquedasLectura(v) {
  const b = v.lee.busquedas;
  const base = `El interés por «${CLIENTE.busqueda}» promedia ${numero(b.demanda)} de 100 en ${b.semanas === 1 ? 'la semana' : `las ${numero(b.semanas)} semanas`} ${delPeriodo(P(v))}.`;
  return { titulo: 'Interés de búsqueda en el último año', lectura: b.cambio == null ? base : `${base} Es ${frente(b.cambio, P(v))}.` };
}

export function palabrasBusqueda(v) {
  const sube = v.lee.busquedas.palabras.filter((p) => !p.propia && p.cambio3m != null).sort((a, b) => b.cambio3m - a.cambio3m)[0];
  return { titulo: 'Palabras que se siguen', lectura: sube && sube.cambio3m > 20 ? `«${sube.termino}» es la que más sube: ${cuanto(sube.cambio3m)} interés que hace tres meses.` : 'Interés de cada palabra y su cambio en tres meses.' };
}

export function redesTiktok(v) {
  const h = v.lee.redes.hashtags[0];
  return { titulo: 'Hashtags del rubro en TikTok', lectura: `${h.tag} tiene la mayor interacción del mes: ${porcentaje(h.interaccion * 100, 1)} de las vistas, en ${numero(h.publicaciones)} publicaciones.` };
}

export function competenciaLectura(v) {
  const m = v.lee.competencia.marcas;
  const propia = m.find((x) => x.propia);
  const puesto = m.indexOf(propia) + 1;
  const mejor = [...m].sort((a, b) => b.sentimiento.indice - a.sentimiento.indice)[0];
  const extra = mejor.id === propia.id ? ', el más alto de las marcas comparadas' : '';
  return { titulo: 'Interacción y sentimiento en Facebook', lectura: `${m[0].nombre} junta la mayor interacción del mes y ${CLIENTE.nombre} queda en el puesto ${numero(puesto)} de ${numero(m.length)}. En los comentarios de sus publicaciones, ${CLIENTE.nombre} tiene un sentimiento de ${numero(propia.sentimiento.indice)} de 100${extra}.` };
}

export function competenciaAnuncios(v) {
  const m = [...v.lee.competencia.marcas].sort((a, b) => b.anuncios - a.anuncios);
  const propia = m.find((x) => x.propia);
  return { titulo: 'Publicaciones y anuncios activos', lectura: `${m[0].nombre} tiene más anuncios activos (${numero(m[0].anuncios)}). ${CLIENTE.nombre} tiene ${numero(propia.anuncios)} y publicó ${numero(propia.publicaciones)} veces en el mes.` };
}

// Sitio (GA4): tráfico. Nunca leads: GA4 no mide ventas y los leads del sitio están en el CRM
export function webLectura(v) {
  const w = v.lee.web;
  const interaccion = `De cada 100 sesiones, ${numero(Math.round(w.tasaInteraccion * 100))} tuvo interacción${w.tasaInteraccionPrevia ? `; en ${comparacionTexto(P(v))}, ${numero(Math.round(w.tasaInteraccionPrevia * 100))}` : ''}.`;
  return { titulo: 'Quién entra al sitio', lectura: w.cambioUsuarios == null ? interaccion : `${variacionFrase('Los usuarios activos por día', w.cambioUsuarios, P(v))}. ${interaccion}` };
}

export function webCanales(v) {
  const c = v.lee.web.canales;
  const peor = [...c].filter((x) => x.pauta && x.sesiones > 500).sort((a, b) => a.tasa - b.tasa)[0];
  const base = `Desde ${c[0].nombre.toLowerCase()} llegan ${numero(c[0].pct)} de cada 100 sesiones; desde ${c[1].nombre.toLowerCase()}, ${numero(c[1].pct)}.`;
  return { titulo: 'De dónde llegan', lectura: peor ? `${base} De los canales pagados, ${peor.nombre.toLowerCase()} es el que menos interactúa: ${numero(Math.round(peor.tasa * 100))} de cada 100 sesiones.` : base };
}

export function webPaginas(v) {
  const p = v.lee.web.paginas;
  const nueva = p.find((x) => x.desde);
  const base = `«${p[0].ruta}» junta más vistas: ${numero(p[0].pct)} de cada 100.`;
  return { titulo: 'Qué páginas se ven', lectura: nueva ? `${base} «${nueva.ruta}», publicada el ${Number(nueva.desde.slice(8, 10))}, ya suma ${numero(nueva.pct)} de cada 100.` : base };
}

export function webHoras(v) {
  const w = v.lee.web;
  return { titulo: 'Cuándo están activos', lectura: `Hay más usuarios activos ${horasTexto(w.horasAltas)}. ${diasTexto(w.porDiaSemana, w.diaMayor, 'usuarios activos al día', (n) => numero(Math.round(n)))}` };
}
