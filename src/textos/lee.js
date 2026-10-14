// Lecturas de la capa Lee. Cada función recibe la vista y devuelve frases que observan, no ordenan.
// Si el dato no sostiene una conclusión, la frase lo dice o se queda en lo descriptivo.
import { numero, dolares, porcentaje, compacto, diaSemanaLargo } from '../sistema/formato.js';
import { periodoTexto, comparacionTexto, frente, cuanto, capital, lista } from './comun.js';

const P = (v) => v.periodo;

export function pautaResumen(v) {
  const p = v.lee.pauta;
  const base = `En ${periodoTexto(P(v))} las plataformas reportaron ${numero(p.leads)} leads con ${dolares(p.inversion)} de inversión: un lead cada ${dolares(p.cpl, 2)}.`;
  if (p.cambio == null) return { titulo: 'Leads que reportan las plataformas', lectura: `${base} Sin comparación: no hay días medidos suficientes en las dos ventanas.` };
  return { titulo: 'Leads que reportan las plataformas', lectura: `${base} Por día, ${frente(p.cambio, P(v))}.` };
}

export function plataformasLectura(v) {
  const ps = v.lee.plataformas.plataformas;
  const sobre = ps.filter((p) => p.cpl != null && p.objetivo != null && p.cpl > p.objetivo);
  const titulo = 'Costo por lead contra el objetivo';
  if (!sobre.length) return { titulo, lectura: `Las ${numero(ps.length)} plataformas quedan bajo su objetivo de costo por lead en ${periodoTexto(P(v))}.` };
  return { titulo, lectura: `${lista(sobre.map((p) => p.nombre))} ${sobre.length === 1 ? 'paga' : 'pagan'} más por lead que su objetivo en ${periodoTexto(P(v))}.` };
}

export function campanasLectura(v) {
  const todas = v.lee.plataformas.plataformas.flatMap((p) => p.campanas.map((c) => ({ ...c, plataforma: p.nombre })));
  const conLeads = todas.filter((c) => c.leads > 0);
  const sin = todas.filter((c) => c.leads === 0 && c.inversion > 0);
  const barata = [...conLeads].sort((a, b) => a.cpl - b.cpl)[0];
  let lectura = barata ? `La campaña con el lead más barato es «${barata.nombre}», a ${dolares(barata.cpl, 2)}.` : 'Ninguna campaña reportó leads.';
  if (sin.length) lectura += ` ${capital(numero(sin.length))} ${sin.length === 1 ? 'campaña es' : 'campañas son'} de alcance y no buscan leads: ${dolares(sin.reduce((s, c) => s + c.inversion, 0))} en el período.`;
  return { titulo: 'Campañas con gasto en el período', lectura };
}

export function palabrasLectura(v) {
  const k = v.lee.plataformas.palabras;
  const titulo = 'Palabras clave de Google Search';
  if (!k.sinConversion.length) return { titulo, lectura: 'Todas las palabras con gasto trajeron leads en una proporción parecida a la del resto.' };
  return { titulo, lectura: `${capital(lista(k.sinConversion.map((x) => `«${x.texto}»`)))} ${k.sinConversion.length === 1 ? 'gastó' : 'gastaron'} ${dolares(k.gastoSinConversion)} (${porcentaje((k.gastoSinConversion / k.inversionSearch) * 100)} de Search) con muy pocas conversiones.` };
}

export function terminosLectura(v) {
  const t = v.lee.plataformas.terminos;
  const comp = t.filter((x) => /smart fit|b2|bio ritmo|mega force/i.test(x.texto));
  const titulo = 'Lo que de verdad se buscó';
  if (!comp.length) return { titulo, lectura: 'Los términos que activaron anuncios, ordenados por clics.' };
  return { titulo, lectura: `Entre los términos que activaron anuncios aparece ${lista(comp.map((x) => `«${x.texto}»`))}: búsquedas de otra marca que convierten poco.` };
}

export function crmPorDia(v) {
  const c = v.lee.crmDetalle;
  const base = `${capital(numero(c.total))} leads entraron al CRM en ${periodoTexto(P(v))}, de pauta y del sitio sin pauta.`;
  return { titulo: 'Leads en el CRM, día por día', lectura: c.cambio == null ? base : `${base} Son ${frente(c.cambio, P(v))}.` };
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
  const base = `${porcentaje(a.rapidos * 100)} de los leads se contactó en menos de 5 minutos. El fin de semana, ${porcentaje(a.lentosFinDeSemana * 100)} esperó más de 2 horas; entre semana, ${porcentaje(a.lentosLaborable * 100)}.`;
  return { titulo: 'Atención del equipo', lectura: a.cambioDesde ? `${base} Desde el ${Number(a.cambioDesde.desde.slice(8, 10))} hay un cambio registrado: ${a.cambioDesde.texto.toLowerCase()}.` : base };
}

export function crmDescarte(v) {
  const d = v.lee.crmDetalle.descarte;
  const top = d.motivos[0];
  return { titulo: 'Por qué se descartan', lectura: `${capital(numero(d.total))} leads del período se descartaron. El motivo más frecuente: «${top.nombre.toLowerCase()}», ${numero(Math.round((top.valor / d.total) * 100))} de cada 100.` };
}

export function busquedasLectura(v) {
  const b = v.lee.busquedas;
  const base = `El interés por «gimnasio» promedia ${numero(b.demanda)} de 100 en las semanas de ${periodoTexto(P(v))}.`;
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

export function redesTemas(v) {
  const r = v.lee.redes;
  const t = r.pideLectura;
  const titulo = 'Qué se dice de Fit Lab';
  if (!t) return { titulo, lectura: `${capital(numero(r.menciones))} menciones en el mes. Ningún tema con casos suficientes tiene sentimiento claramente negativo.` };
  const giro = t.tonoPrevio != null && t.tonoPrevio - t.tono > 0.15 ? `; en ${comparacionTexto(P(v))} el sentimiento era mejor` : '';
  return { titulo, lectura: `«${t.nombre}» es el tema con peor sentimiento: ${numero(t.negativas)} de sus ${numero(t.menciones)} menciones son negativas${giro}.` };
}

export function competenciaLectura(v) {
  const m = v.lee.competencia.marcas;
  const propia = m.find((x) => x.propia);
  const puesto = m.indexOf(propia) + 1;
  const mejor = [...m].sort((a, b) => b.sentimiento.indice - a.sentimiento.indice)[0];
  const extra = mejor.id === propia.id ? ', el más alto de las marcas leídas' : '';
  return { titulo: 'Interacción y sentimiento en Facebook', lectura: `${m[0].nombre} junta la mayor interacción del mes. Fit Lab queda en el puesto ${numero(puesto)} de ${numero(m.length)}; ${numero(propia.sentimiento.pctPos)} de cada 100 comentarios en sus publicaciones son positivos y su sentimiento es de ${numero(propia.sentimiento.indice)} de 100${extra}.` };
}

export function competenciaAnuncios(v) {
  const m = [...v.lee.competencia.marcas].sort((a, b) => b.anuncios - a.anuncios);
  const propia = m.find((x) => x.propia);
  return { titulo: 'Publicaciones y anuncios activos', lectura: `${m[0].nombre} tiene más anuncios activos (${numero(m[0].anuncios)}). Fit Lab tiene ${numero(propia.anuncios)} y publicó ${numero(propia.publicaciones)} veces en el mes.` };
}

// Sitio (GA4): tráfico. Nunca leads: GA4 no mide ventas y los leads del sitio están en el CRM
export function webLectura(v) {
  const w = v.lee.web;
  const base = `${capital(numero(Math.round(w.usuariosPorDia)))} usuarios activos al día en ${periodoTexto(P(v))}`;
  return { titulo: 'Quién entra al sitio', lectura: w.cambioUsuarios == null ? `${base}.` : `${base}: ${frente(w.cambioUsuarios, P(v))}. ${porcentaje(w.tasaInteraccion * 100)} de las sesiones tuvo interacción.` };
}

export function webCanales(v) {
  const c = v.lee.web.canales;
  const peor = [...c].filter((x) => x.pauta && x.sesiones > 500).sort((a, b) => a.tasa - b.tasa)[0];
  const base = `${c[0].nombre} trae ${numero(c[0].pct)} de cada 100 sesiones; ${c[1].nombre.toLowerCase()}, ${numero(c[1].pct)}.`;
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
  return { titulo: 'Cuándo están activos', lectura: `El pico es el ${diaSemanaLargo(w.pico.dia)} a las ${w.pico.hora}:00, con ${numero(w.pico.v)} usuarios activos en promedio. Las noches de semana también concentran visitas.` };
}
