// Secciones con el detalle del algoritmo en producción: plataformas y campañas, CRM por dentro, redes,
// competencia, sitio. Funciones puras sobre data + detalle; armarVista las llama y las ubica en su capa.

import { rango, sumarDias, diaSemana, diasEntre } from '../muestra/calendario.js';
import { detallar } from '../muestra/detalle.js';
import { suma, razon, cambioPct, mayorResto, indices, dentro, ventanaCrm, sumarMeses, semanaEn, ETAPAS } from './base.js';

const cache = new WeakMap();
export const detalleDe = (data) => { if (!cache.has(data)) cache.set(data, detallar(data)); return cache.get(data); };

// Plataformas como las ve el cliente: Google Ads agrupa Search y Display
export const PLATAFORMAS = [
  { id: 'google', nombre: 'Google Ads', canales: ['search', 'display'] },
  { id: 'meta', nombre: 'Meta Ads', canales: ['meta'] },
  { id: 'tiktok', nombre: 'TikTok Ads', canales: ['tiktok'] },
];
const NOMBRE_FUENTE = { meta: 'Meta Ads', search: 'Google Search', tiktok: 'TikTok Ads', display: 'Google Display' };

// Objetivo combinado de varios canales: el CPL que cumpliría cada uno su objetivo con su propia inversión (Σ/Σ)
const objetivoCombinado = (cfg, ids, inversionDe) => {
  const inv = suma(ids, inversionDe);
  const leadsMeta = suma(ids, (id) => inversionDe(id) / cfg.canales.find((c) => c.id === id).metaCpl);
  return razon(inv, leadsMeta);
};

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
  const plataformas = PLATAFORMAS.map((pl) => {
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
      id: pl.id, nombre: pl.nombre, canales: pl.canales, inversion, leads, cpl: razon(inversion, leads),
      cplPrevio: medidosPrevio ? razon(invPrevio, leadsPrevio) : null,
      cambioCpl: medidosPrevio && P.compararDesde >= cfg.desde ? cambioPct(razon(inversion, leads), razon(invPrevio, leadsPrevio)) : null,
      objetivo: objetivoCombinado(cfg, pl.canales, invCanal),
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

  // De dónde llegan: último clic (pauta por canal; el sitio por su fuente)
  // det.crm[i] detalla a data.cohortes[i] (mismo orden, que no es por fecha)
  const cohortes = data.cohortes;
  const filas = [];
  const porFuente = {};
  const sumar = (id, v) => { const o = porFuente[id] || (porFuente[id] = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 }); for (const e of ETAPAS) o[e] += v[e]; };
  det.crm.forEach((x, i) => {
    if (x.fecha < P.desde || x.fecha > P.hasta) return;
    filas.push(x);
    if (x.porFuente) Object.entries(x.porFuente).forEach(([f, v]) => sumar(f, v));
    else sumar(x.canal, cohortes[i]);
  });
  const nombreFuente = (id) => NOMBRE_FUENTE[id] || cfg.web.fuentes.find((f) => f.id === id)?.nombre || id;
  const fuentes = Object.entries(porFuente).map(([id, v]) => ({ id, nombre: nombreFuente(id), pauta: !!NOMBRE_FUENTE[id], ...v })).sort((p, q) => q.leads - p.leads);
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
  const lentos = (t) => razon(t[3] + t[4], suma(t, (v) => v)); // más de 2 horas
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
      rapidos: razon(tramos[0], conRegistro), lentosLaborable: lentos(tramosLab), lentosFinDeSemana: lentos(tramosFinDe),
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

// ══════════ 1.4 Redes: TikTok y temas de la marca ══════════
export function leeRedes(data, P) {
  const det = detalleDe(data);
  const mes = P.hasta.slice(0, 7), mesComp = P.compararHasta.slice(0, 7);
  const hashtags = det.hashtags.map((h) => {
    const m = h.meses.find((x) => x.mes === mes), c = h.meses.find((x) => x.mes === mesComp);
    return { tag: h.tag, propia: h.propia, ...m, interaccion: razon(m.interacciones, m.vistas), interaccionPrevia: c ? razon(c.interacciones, c.vistas) : null };
  }).sort((a, b) => b.interaccion - a.interaccion);
  const t = det.temas.find((x) => x.mes === mes), tc = det.temas.find((x) => x.mes === mesComp);
  const tono = (x) => (x.menciones ? (x.positivas - x.negativas) / x.menciones : null);
  const temas = data.config.temas.map((cfgT, i) => {
    const x = t.porTema[i], y = tc?.porTema[i];
    return { id: cfgT.id, nombre: cfgT.nombre, menciones: x.menciones, positivas: x.positivas, negativas: x.negativas, neutras: x.neutras, tono: tono(x), tonoPrevio: y ? tono(y) : null };
  }).sort((a, b) => b.menciones - a.menciones);
  const peor = [...temas].filter((x) => x.tono != null && x.menciones >= data.config.metodo.casosMinimos).sort((a, b) => a.tono - b.tono)[0];
  return { mes, hashtags, temas, menciones: t.menciones, sinTema: t.sinTema, pideLectura: peor && peor.tono <= -0.25 ? peor : null };
}

// ══════════ 1.5 Competencia: actividad en redes (sin tono) ══════════
export function leeCompetencia(data, P) {
  const det = detalleDe(data);
  const mes = P.hasta.slice(0, 7), mesComp = P.compararHasta.slice(0, 7);
  return {
    mes, formatos: data.config.formatosAnuncio.map((f) => f.nombre),
    marcas: det.redes.map((r) => {
      const m = r.meses.find((x) => x.mes === mes), c = r.meses.find((x) => x.mes === mesComp);
      return {
        id: r.id, nombre: r.nombre, propia: r.propia, publicaciones: m.publicaciones, anuncios: m.anuncios, formatos: m.formatos,
        porPublicacion: razon(m.interacciones, m.publicaciones), porPublicacionPrevia: c ? razon(c.interacciones, c.publicaciones) : null,
      };
    }).sort((a, b) => b.porPublicacion - a.porPublicacion),
  };
}

// ══════════ 1.6 Sitio: interacción, por día, por hora y por día de semana ══════════
export function leeWebDetalle(data, P) {
  const det = detalleDe(data), ix = indices(data);
  const fechas = rango(P.desde, P.hasta);
  const desfase = diasEntre(P.compararDesde, P.desde);
  const sesionesDia = (d) => { const w = ix.webDia.get(d); return w ? suma(Object.values(w.fuentes), (f) => f.sesiones) : null; };
  const detDia = new Map(det.web.map((w) => [w.fecha, w]));
  let conInteraccion = 0, sesiones = 0;
  const porHora = new Array(24).fill(0);
  const porDiaSemana = new Array(7).fill(0), veces = new Array(7).fill(0);
  fechas.forEach((d) => {
    const w = detDia.get(d); if (!w) return;
    conInteraccion += suma(Object.values(w.conInteraccion), (v) => v);
    w.porHora.forEach((v, h) => { porHora[h] += v; });
    const s = sesionesDia(d); sesiones += s; porDiaSemana[diaSemana(d)] += s; veces[diaSemana(d)]++;
  });
  const top4 = [...porHora.map((v, h) => ({ v, h }))].sort((a, b) => b.v - a.v).slice(0, 4).map((x) => x.h);
  return {
    conInteraccion, tasaInteraccion: razon(conInteraccion, sesiones),
    serie: fechas.map((d) => ({ fecha: d, valor: sesionesDia(d) })),
    seriePrevia: fechas.map((d) => { const f = sumarDias(d, -desfase); return { fecha: f, valor: sesionesDia(f) }; }),
    porHora, horasPico: top4, pctHorasPico: razon(suma(top4, (h) => porHora[h]), sesiones),
    porDiaSemana: porDiaSemana.map((v, i) => (veces[i] ? v / veces[i] : null)),
  };
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
    };
  });
}
