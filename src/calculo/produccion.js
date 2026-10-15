// Secciones con el detalle del algoritmo en producción: plataformas y campañas, CRM por dentro, redes,
// competencia, sitio. Funciones puras sobre data + detalle; armarVista las llama y las ubica en su capa.

import { rango, sumarDias, diaSemana, diasEntre } from '../muestra/calendario.js';
import { detallar } from '../muestra/detalle.js';
import { suma, razon, cambioPct, mayorResto, indices, dentro, ventanaCrm, sumarMeses, semanaEn, ETAPAS, plataformaDe, objetivoPlataforma, porHoraDelDia, diaDestacado } from './base.js';
import { agruparAnuncios, anuncioDeMuestra } from './anuncios.js';


const cache = new WeakMap();
export const detalleDe = (data) => { if (!cache.has(data)) cache.set(data, detallar(data)); return cache.get(data); };

// ══════════ 1.1 Pauta pagada: plataformas, campañas, palabras, programática ══════════
export function leePlataformas(data, P) {
  const cfg = data.config, det = detalleDe(data), ix = indices(data);
  const fechas = rango(P.desde, P.hasta);
  const sumaCampanas = (canal, desde, hasta) => {
    const lista = cfg.campanas[canal];
    const acc = lista.map((c) => ({ id: c.id, nombre: c.nombre, producto: c.producto, canal, inversion: 0, impresiones: 0, clics: 0, leads: 0 }));
    let medidos = 0, sinDato = 0;
    det.campanas[canal].forEach((r) => {
      if (r.fecha < desde || r.fecha > hasta) return;
      if (r.sinDato) { sinDato++; return; }
      medidos++;
      r.porCampana.forEach((x, i) => { acc[i].inversion += x.inversion; acc[i].impresiones += x.impresiones; acc[i].clics += x.clics; acc[i].leads += x.leads; });
    });
    return { campanas: acc, medidos, sinDato };
  };
  const plataformas = cfg.plataformas.map((pl) => {
    const actual = pl.canales.map((c) => sumaCampanas(c, P.desde, P.hasta));
    const previo = pl.canales.map((c) => sumaCampanas(c, P.compararDesde, P.compararHasta));
    const campanas = actual.flatMap((a) => a.campanas).filter((c) => c.inversion > 0)
      .map((c) => ({ ...c, cpl: c.leads ? c.inversion / c.leads : null, ctr: razon(c.clics, c.impresiones) })).sort((a, b) => b.inversion - a.inversion);
    const tot = (lista, k) => suma(lista.flatMap((a) => a.campanas), (c) => c[k]);
    const inversion = tot(actual, 'inversion'), leads = tot(actual, 'leads');
    const invPrevio = tot(previo, 'inversion'), leadsPrevio = tot(previo, 'leads');
    const medidos = Math.min(...actual.map((a) => a.medidos)), medidosPrevio = Math.min(...previo.map((a) => a.medidos));
    const invCanal = (id) => suma(actual[pl.canales.indexOf(id)].campanas, (c) => c.inversion);
    return {
      id: pl.id, nombre: pl.nombre, canales: pl.canales, inversion, leads, cpl: razon(inversion, leads), ctr: razon(tot(actual, 'clics'), tot(actual, 'impresiones')),
      cplPrevio: medidosPrevio ? razon(invPrevio, leadsPrevio) : null,
      cambioCpl: medidosPrevio && P.compararDesde >= cfg.desde ? cambioPct(razon(inversion, leads), razon(invPrevio, leadsPrevio)) : null,
      objetivo: objetivoPlataforma(cfg, pl, invCanal),
      difObjetivo: razon(inversion, leads) != null ? razon(inversion, leads) - objetivoPlataforma(cfg, pl, invCanal) : null, // + paga más que su objetivo
      diasSinDato: Math.max(...actual.map((a) => a.sinDato)), medidos,
      campanas,
      porDia: fechas.map((d) => {
        const filas = pl.canales.map((c) => ix.pautaDia[c].get(d));
        const ok = filas.every((p) => p && !p.sinDato);
        return { fecha: d, inversion: ok ? suma(filas, (p) => p.inversion) : null, leads: ok ? suma(filas, (p) => p.leads) : null };
      }),
    };
  });

  // Palabras clave y términos de Search
  const tablaSearch = (lista, lectura) => {
    const acc = lista.map((k) => ({ texto: k.texto, concordancia: k.concordancia, resto: !!k.resto, clics: 0, leads: 0, inversion: 0 }));
    lectura.forEach((r) => {
      if (r.fecha < P.desde || r.fecha > P.hasta || r.sinDato) return;
      r.clics.forEach((v, i) => { acc[i].clics += v; acc[i].leads += r.leads[i]; acc[i].inversion += r.inversion[i] || 0; });
    });
    return acc.map((k) => ({ ...k, cpc: razon(k.inversion, k.clics), cpl: k.leads ? k.inversion / k.leads : null }));
  };
  const palabras = tablaSearch(cfg.palabrasClave, det.palabras);
  const nombradas = palabras.filter((k) => !k.resto && k.clics > 0).sort((a, b) => b.inversion - a.inversion);
  const sinConversion = nombradas.filter((k) => k.inversion > 0 && razon(k.leads, k.clics) < 0.25 * razon(suma(nombradas, (x) => x.leads), suma(nombradas, (x) => x.clics)));
  const terminos = tablaSearch(cfg.terminosBusqueda, det.terminos).filter((k) => k.clics > 0);

  // Programática: no sigue el período; se dice si se cruza con él
  const pr = det.programatica;
  const programatica = {
    ...pr, cruza: pr.desde <= P.hasta && pr.hasta >= P.desde,
    impresiones: suma(pr.formatos, (f) => f.impresiones), clics: suma(pr.formatos, (f) => f.clics), consumo: suma(pr.formatos, (f) => f.consumo),
    formatos: pr.formatos.map((f) => ({ ...f, ctr: razon(f.clics, f.impresiones) })),
  };

  const pctInv = mayorResto(plataformas.map((p) => p.inversion));
  return {
    plataformas: plataformas.map((p, i) => ({ ...p, pctInversion: pctInv[i] })),
    palabras: { nombradas, resto: palabras.find((k) => k.resto), sinConversion, gastoSinConversion: suma(sinConversion, (k) => k.inversion), inversionSearch: suma(palabras, (k) => k.inversion) },
    terminos: terminos.filter((t) => !t.resto).sort((a, b) => b.clics - a.clics), terminosResto: terminos.find((t) => t.resto),
    programatica,
  };
}

// ══════════ 1.2 CRM por dentro ══════════
export function leeCrmDetalle(data, P) {
  const cfg = data.config, det = detalleDe(data), ix = indices(data);
  const c = cfg.crm;
  const fechas = rango(P.desde, P.hasta);
  const desfase = diasEntre(P.compararDesde, P.desde);
  const leadsDia = (d) => (dentro(data, d) ? suma(Object.values(ix.crmDia.get(d) || {}), (v) => v.leads) : null);
  const serie = fechas.map((d) => ({ fecha: d, valor: leadsDia(d) }));
  const seriePrevia = fechas.map((d) => { const f = sumarDias(d, -desfase); return { fecha: f, valor: leadsDia(f) }; });
  let a = 0, b = 0;
  const acumulado = serie.map((p, i) => { a += p.valor ?? 0; b += seriePrevia[i].valor ?? 0; return { fecha: p.fecha, valor: a, previo: seriePrevia[i].valor == null ? null : b }; });
  const total = suma(serie, (p) => p.valor ?? 0);
  const totalPrevio = seriePrevia.every((p) => p.valor != null) ? suma(seriePrevia, (p) => p.valor) : null;

  // De dónde llegan: último clic (pauta por plataforma; el sitio por su fuente)
  // det.crm[i] detalla a data.cohortes[i] (mismo orden, que no es por fecha)
  const cohortes = data.cohortes;
  const filas = [];
  const porFuente = {};
  const sumar = (id, v) => { const o = porFuente[id] || (porFuente[id] = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 }); for (const e of ETAPAS) o[e] += v[e]; };
  det.crm.forEach((x, i) => {
    if (x.fecha < P.desde || x.fecha > P.hasta) return;
    filas.push(x);
    if (x.porFuente) Object.entries(x.porFuente).forEach(([f, v]) => sumar(f, v));
    else sumar(plataformaDe(cfg, x.canal).id, cohortes[i]);
  });
  const plataforma = (id) => cfg.plataformas.find((p) => p.id === id);
  const nombreFuente = (id) => plataforma(id)?.nombre || cfg.web.fuentes.find((f) => f.id === id)?.nombre || id;
  const fuentes = Object.entries(porFuente).map(([id, v]) => ({ id, nombre: nombreFuente(id), pauta: !!plataforma(id), ...v })).sort((p, q) => q.leads - p.leads);
  const pctFuentes = mayorResto(fuentes.map((f) => f.leads));

  // Etapas hoy: dónde están los leads creados en el período
  const enEtapa = [0, 0, 0, 0], edadEnEtapa = [0, 0, 0, 0];
  let descartados = 0;
  const motivos = new Array(c.motivosDescarte.length).fill(0);
  const tramos = new Array(c.tramosContacto.length).fill(0);
  const tramosFinDe = new Array(c.tramosContacto.length).fill(0), tramosLab = new Array(c.tramosContacto.length).fill(0);
  let sinRegistro = 0;
  const intentos = new Array(c.intentos.length).fill(0);
  filas.forEach((x) => {
    const edad = diasEntre(x.fecha, cfg.corte);
    x.abiertos.forEach((n, k) => { enEtapa[k] += n; edadEnEtapa[k] += n * edad; });
    descartados += x.descartados;
    x.motivos.forEach((n, k) => { motivos[k] += n; });
    x.primerContacto.forEach((n, k) => { tramos[k] += n; (diaSemana(x.fecha) >= 5 ? tramosFinDe : tramosLab)[k] += n; });
    sinRegistro += x.sinRegistro;
    x.intentos.forEach((n, k) => { intentos[k] += n; });
  });
  const co = ventanaCrm(data, P.desde, P.hasta);
  const entraron = ETAPAS.map((e) => co[e]);
  const etapas = c.etapas.map((nombre, k) => ({
    nombre, entraron: entraron[k],
    estan: k < 4 ? enEtapa[k] : null,
    diasAhi: k < 4 && enEtapa[k] ? edadEnEtapa[k] / enEtapa[k] : null, // piso: siguen ahí
  }));
  const conRegistro = suma(tramos, (v) => v);
  const pctTramos = mayorResto(tramos);
  const masDeUnDia = (t) => razon(t[3] + t[4], suma(t, (v) => v)); // primer contacto después de 24 horas
  // mediana de intentos: el tramo donde se llega a la mitad
  let acc = 0, medianaIntentos = null;
  const totalIntentos = suma(intentos, (v) => v);
  for (let k = 0; k < intentos.length; k++) { acc += intentos[k]; if (acc >= totalIntentos / 2) { medianaIntentos = k + 1; break; } }

  // Campañas del CRM que se cruzan con el período, con su acumulado desde que empezaron hasta el corte
  const campanas = c.campanas.filter((k) => k.desde <= P.hasta && k.hasta >= P.desde).map((k) => {
    let leads = 0, altas = 0;
    for (const x of det.crm) if (x.campana?.id === k.id) { leads += x.campana.leads; altas += x.campana.altas; }
    return { ...k, leads, altas, valor: altas * c.ticketInscripcion, enCurso: k.hasta >= cfg.corte };
  });

  return {
    serie, seriePrevia, acumulado, total, totalPrevio,
    cambio: totalPrevio != null && P.compararDesde >= cfg.desde ? cambioPct(total, totalPrevio) : null,
    fuentes: fuentes.map((f, i) => ({ ...f, pct: pctFuentes[i] })),
    etapas, salidas: { inscritos: co.altas, descartados },
    abierta: diasEntre(P.hasta, cfg.corte) < Math.max(...c.plazoAbierto),
    atencion: {
      tramos: c.tramosContacto.map((nombre, k) => ({ nombre, valor: tramos[k], pct: pctTramos[k] })), conRegistro, sinRegistro,
      enElDia: razon(tramos[0] + tramos[1] + tramos[2], conRegistro), masDeUnDiaLaborable: masDeUnDia(tramosLab), masDeUnDiaFinDeSemana: masDeUnDia(tramosFinDe),
      intentos: intentos.map((v, k) => ({ nombre: k === intentos.length - 1 ? `${k + 1} o más` : String(k + 1), valor: v })), medianaIntentos,
      cambioDesde: c.contactoLento.desde <= P.hasta && c.contactoLento.desde >= P.desde ? c.contactoLento : null,
    },
    descarte: { total: descartados, motivos: c.motivosDescarte.map((m, k) => ({ nombre: m.motivo, valor: motivos[k] })).sort((p, q) => q.valor - p.valor), de100: null },
    campanas,
  };
}

// ══════════ 1.3 Búsquedas: palabras con su cambio en tres meses y regiones ══════════
export function leeBusquedasDetalle(data, P) {
  const det = detalleDe(data);
  const semPer = data.semanas.filter((s) => semanaEn(s, P.desde, P.hasta));
  const atras = (s) => sumarDias(s, -91);
  const prom = (b, ss) => (ss.length ? suma(ss, (s) => b.semanas.find((x) => x.semana === s)?.indice ?? 0) / ss.length : null);
  const semAtras = semPer.map(atras).filter((s) => data.semanas.includes(s));
  const mes = P.hasta.slice(0, 7);
  return {
    palabras: data.busquedas.map((b) => {
      const actual = prom(b, semPer), antes = semAtras.length === semPer.length ? prom(b, semAtras) : null;
      const sinBase = antes != null && antes < 5;
      return {
        id: b.id, termino: b.termino, propia: b.propia, actual,
        cambio3m: antes != null && !sinBase ? cambioPct(actual, antes) : null,
        sinBase, subiendo: sinBase && actual > antes * 1.5,
        regiones: det.regiones.find((r) => r.id === b.id)?.meses.find((m) => m.mes === mes)?.top || [],
      };
    }).sort((p, q) => q.actual - p.actual),
  };
}

// ══════════ 1.4 Redes: hashtags del rubro en TikTok ══════════
export function leeRedes(data, P) {
  const det = detalleDe(data);
  const mes = P.hasta.slice(0, 7), mesComp = P.compararHasta.slice(0, 7);
  const hashtags = det.hashtags.map((h) => {
    const m = h.meses.find((x) => x.mes === mes), c = h.meses.find((x) => x.mes === mesComp);
    return { tag: h.tag, propia: h.propia, ...m, interaccion: razon(m.interacciones, m.vistas), interaccionPrevia: c ? razon(c.interacciones, c.vistas) : null };
  }).sort((a, b) => b.interaccion - a.interaccion);
  return { mes, hashtags };
}

// ══════════ 1.5 Competencia: lectura del mes, sin comparación ══════════
// Como en producción: publicaciones del mes y anuncios activos de la biblioteca de Meta. No hay historia de la
// competencia, así que no se compara con otro período.
// Sentimiento de 0 a 100: 50 + 50 × (positivos − negativos) / total. 0 es todo negativo, 50 neutro, 100 todo positivo
export const indiceSentimiento = (positivos, negativos, total) => (total ? Math.round(50 + (50 * (positivos - negativos)) / total) : null);
function sentimientoDe({ positivos, neutros, negativos }) {
  const total = positivos + neutros + negativos;
  const [pctPos, pctNeu, pctNeg] = total ? mayorResto([positivos, neutros, negativos]) : [null, null, null];
  return { positivos, neutros, negativos, total, pctPos, pctNeu, pctNeg, indice: indiceSentimiento(positivos, negativos, total) };
}

export function leeCompetencia(data, P) {
  const det = detalleDe(data);
  const mes = P.hasta.slice(0, 7);
  const marcas = det.redes.map((r) => {
    const m = r.meses.find((x) => x.mes === mes);
    return {
      id: r.id, nombre: r.nombre, propia: r.propia, publicaciones: m.publicaciones, interacciones: m.interacciones,
      porPublicacion: razon(m.interacciones, m.publicaciones), anuncios: m.anuncios, formatos: m.formatos, sentimiento: sentimientoDe(m.sentimiento), palabras: r.palabras,
    };
  }).sort((a, b) => b.interacciones - a.interacciones);
  return { mes, formatos: data.config.formatosAnuncio.map((f) => f.nombre), marcas };
}

// Anuncios activos de cada marca en el mes de la lectura, agrupados (la muestra no trae piezas: solo tema y formato)
export function leeAnuncios(data, P) {
  const mes = P.hasta.slice(0, 7);
  const m = detalleDe(data).anuncios.find((x) => x.mes === mes);
  if (!m) return null;
  return { mes, ...agruparAnuncios(m.marcas.map((x) => ({ nombre: x.nombre, propia: x.propia, anuncios: x.anuncios.map(anuncioDeMuestra) }))) };
}

// ══════════ 1.6 Sitio (GA4): tráfico, sin leads ══════════
// GA4 mide tráfico: usuarios, sesiones, interacción, páginas y horas. No mide ventas ni leads (esos viven en el CRM).
export function leeGa4(data, P) {
  const cfg = data.config, det = detalleDe(data);
  const detDia = new Map(det.web.map((w) => [w.fecha, w]));
  const crudo = new Map(data.web.map((w) => [w.fecha, w]));
  const ids = cfg.web.fuentes.map((f) => f.id);
  const ventana = (desde, hasta) => {
    const c = Object.fromEntries(ids.map((id) => [id, { sesiones: 0, usuarios: 0, conInteraccion: 0, segundos: 0, movil: 0 }]));
    const vistas = cfg.web.paginas.map(() => 0);
    let dias = 0;
    for (const d of rango(desde, hasta)) {
      const w = crudo.get(d), x = detDia.get(d);
      if (!w || !x) continue;
      dias++;
      for (const id of ids) {
        c[id].sesiones += w.fuentes[id].sesiones; c[id].movil += w.fuentes[id].movil;
        c[id].usuarios += x.usuarios[id]; c[id].conInteraccion += x.conInteraccion[id]; c[id].segundos += x.segundos[id];
      }
      x.vistas.forEach((n, i) => { vistas[i] += n; });
    }
    const t = (k) => suma(ids, (id) => c[id][k]);
    return { c, vistas, dias, sesiones: t('sesiones'), usuarios: t('usuarios'), conInteraccion: t('conInteraccion'), segundos: t('segundos'), movil: t('movil') };
  };
  const a = ventana(P.desde, P.hasta), b = ventana(P.compararDesde, P.compararHasta);
  const porDia = (v, k) => (v.dias ? v[k] / v.dias : null);
  const pct = mayorResto(ids.map((id) => a.c[id].sesiones));
  const canales = cfg.web.fuentes.map((f, i) => {
    const x = a.c[f.id];
    return { id: f.id, nombre: f.nombre, pauta: !!f.deClics, sesiones: x.sesiones, pct: pct[i], usuarios: x.usuarios, tasa: razon(x.conInteraccion, x.sesiones), segundos: razon(x.segundos, x.conInteraccion) };
  }).sort((p, q) => q.sesiones - p.sesiones);
  const totalVistas = suma(a.vistas, (n) => n);
  const pctVistas = mayorResto(a.vistas);
  const paginas = cfg.web.paginas.map((p, i) => ({ id: p.id, ruta: p.ruta, nombre: p.nombre, vistas: a.vistas[i], pct: pctVistas[i], desde: p.desde }))
    .filter((p) => p.vistas > 0).sort((p, q) => q.vistas - p.vistas);
  // Cuándo: usuarios activos promedio en cada hora del día, y usuarios activos al día según el día de la semana.
  // Por día se usa el total diario de GA4: sumar las horas contaría dos veces a quien entra en dos horas distintas.
  const matriz = Array.from({ length: 7 }, () => new Array(24).fill(0)), veces = new Array(7).fill(0);
  const fechas = rango(P.desde, P.hasta);
  fechas.forEach((d) => { const x = detDia.get(d); if (!x) return; const w = diaSemana(d); veces[w]++; x.usuariosPorHora.forEach((n, h) => { matriz[w][h] += n; }); });
  const usuariosDia = (d) => { const x = detDia.get(d); return x ? suma(ids, (id) => x.usuarios[id]) : null; };
  const horas = porHoraDelDia(matriz, veces);
  const porDiaSemana = Array.from({ length: 7 }, (_, w) => { const ds = fechas.filter((d) => diaSemana(d) === w && usuariosDia(d) != null); return ds.length ? suma(ds, usuariosDia) / ds.length : null; });
  const desfase = diasEntre(P.compararDesde, P.desde);
  return {
    sesiones: a.sesiones, usuariosPorDia: porDia(a, 'usuarios'), usuariosPorDiaPrevio: porDia(b, 'usuarios'),
    cambioUsuarios: cambioPct(porDia(a, 'usuarios'), porDia(b, 'usuarios')), cambioSesiones: cambioPct(porDia(a, 'sesiones'), porDia(b, 'sesiones')),
    conInteraccion: a.conInteraccion, tasaInteraccion: razon(a.conInteraccion, a.sesiones), tasaInteraccionPrevia: razon(b.conInteraccion, b.sesiones),
    segundosMedios: razon(a.segundos, a.conInteraccion), movil: razon(a.movil, a.sesiones),
    vistas: totalVistas, canales, paginas, porHora: horas.porHora, horasAltas: horas.altas, porDiaSemana, diaMayor: diaDestacado(porDiaSemana, cfg.metodo.margenParecido),
    serie: fechas.map((d) => ({ fecha: d, valor: usuariosDia(d) })),
    seriePrevia: fechas.map((d) => { const f = sumarDias(d, -desfase); return { fecha: f, valor: usuariosDia(f) }; }),
  };
}

// Interacción de un canal del sitio en dos ventanas de días (para las alertas)
export function interaccionCanal(data, id, desde, hasta) {
  const det = detalleDe(data);
  const crudo = new Map(data.web.map((w) => [w.fecha, w]));
  let s = 0, q = 0;
  det.web.forEach((x) => { if (x.fecha < desde || x.fecha > hasta) return; s += crudo.get(x.fecha).fuentes[id].sesiones; q += x.conInteraccion[id]; });
  return { sesiones: s, tasa: razon(q, s) };
}

// ══════════ 2.1 Reparto por producto y por canal contra objetivo ══════════
export function analizaReparto(data, P, plataformas) {
  const cfg = data.config;
  const productos = Object.entries(cfg.productos).map(([id, nombre]) => {
    const porPlataforma = plataformas.map((p) => suma(p.campanas.filter((c) => c.producto === id), (c) => c.inversion));
    return { id, nombre, porPlataforma, total: suma(porPlataforma, (v) => v) };
  });
  return { productos, plataformas: plataformas.map((p) => ({ id: p.id, nombre: p.nombre })) };
}

// ══════════ 2.2 De la pauta al CRM ══════════
export function analizaPautaCrm(data, P, plataformas) {
  const co = ventanaCrm(data, P.desde, P.hasta);
  return plataformas.map((p) => {
    const crm = p.canales.reduce((o, c) => { const v = co.porOrigen[c] || {}; for (const e of ETAPAS) o[e] += v[e] || 0; return o; }, { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 });
    return {
      id: p.id, nombre: p.nombre, inversion: p.inversion, reportados: p.leads, enCrm: crm.leads, inscritosHastaHoy: crm.altas,
      porCadaReportado: razon(crm.leads, p.leads), costoCrm: razon(p.inversion, crm.leads),
      cplReportado: razon(p.inversion, p.leads), costoInscrito: razon(p.inversion, crm.altas),
    };
  });
}
