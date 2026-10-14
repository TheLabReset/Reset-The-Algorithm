// Capa de cálculo pura: armarVista(data, opciones) devuelve todo lo que la pantalla pinta.
// Reglas (heredadas del método de referencia y del informe 06):
//  - las razones se calculan Σ/Σ, nunca promediando razones (R4)
//  - un día sin fila no es un cero: si una fuente no entregó, el total de ese día no existe
//  - las comparaciones son por día medido (ventanas de distinto largo o con huecos no se comparan en sumas)
//  - un delta solo con ≥ 60 % de días medidos en las DOS ventanas
//  - el embudo se lee en cohortes cerradas; una cohorte que no maduró se declara
//  - proporciones visibles con el método del mayor resto, para que sumen 100

import { rango, sumarDias, diaSemana, diasEntre, mes } from './calendario.js';

const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
export const razon = (num, den) => (den > 0 ? num / den : null);
export const cambioPct = (actual, previo) => (actual != null && previo > 0 ? ((actual - previo) / previo) * 100 : null);
const COBERTURA_MINIMA = 0.6;

// Reparte un total entre partes por el mayor resto: la suma visible da el total exacto
export function mayorResto(valores, total = 100) {
  const s = valores.reduce((a, b) => a + b, 0);
  if (!(s > 0)) return valores.map(() => 0);
  const exactos = valores.map((v) => (v / s) * total);
  const base = exactos.map(Math.floor);
  let resto = total - base.reduce((a, b) => a + b, 0);
  exactos.map((e, i) => [e - Math.floor(e), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (resto > 0) { base[i] += 1; resto--; } });
  return base;
}

// Índices por fecha, armados una vez por data (no cambian el resultado, solo el costo)
const cache = new WeakMap();
function indices(data) {
  if (cache.has(data)) return cache.get(data);
  const pautaDia = {};
  for (const c of data.config.canales) pautaDia[c.id] = new Map(data.pauta[c.id].map((p) => [p.fecha, p]));
  const cohDia = new Map();
  for (const x of data.cohortes) { const k = cohDia.get(x.fecha) || { leads: 0, altas: 0 }; k.leads += x.leads; k.altas += x.altas; cohDia.set(x.fecha, k); }
  const ix = { pautaDia, cohDia };
  cache.set(data, ix);
  return ix;
}

// Una ventana de un canal: sumas solo de días medidos, y cuántos días se midieron
function ventanaCanal(data, canal, desde, hasta) {
  const ix = indices(data);
  let inversion = 0, impresiones = 0, clics = 0, leads = 0, medidos = 0;
  const sinDato = [];
  for (const d of rango(desde, hasta)) {
    const p = ix.pautaDia[canal].get(d);
    if (!p) continue; // fuera de la serie
    if (p.sinDato) { sinDato.push(d); continue; }
    inversion += p.inversion; impresiones += p.impresiones; clics += p.clics; leads += p.leads; medidos++;
  }
  const dias = diasEntre(desde, hasta) + 1;
  return { inversion, impresiones, clics, leads, medidos, dias, cobertura: medidos / dias, sinDato, leadsPorDia: razon(leads, medidos) };
}

// Total de todos los canales: un día cuenta solo si TODOS los canales lo midieron
function ventanaTotal(data, desde, hasta) {
  const ix = indices(data);
  const canales = data.config.canales;
  let inversion = 0, clics = 0, leads = 0, medidos = 0;
  const parciales = [];
  for (const d of rango(desde, hasta)) {
    const filas = canales.map((c) => ix.pautaDia[c.id].get(d));
    if (filas.some((p) => !p)) continue;
    if (filas.some((p) => p.sinDato)) { parciales.push(d); continue; }
    inversion += suma(filas, (p) => p.inversion); clics += suma(filas, (p) => p.clics); leads += suma(filas, (p) => p.leads); medidos++;
  }
  const dias = diasEntre(desde, hasta) + 1;
  return { inversion, clics, leads, medidos, dias, cobertura: medidos / dias, parciales, leadsPorDia: razon(leads, medidos) };
}

const esMesCompleto = (desde, hasta) => desde.endsWith('-01') && sumarDias(hasta, 1).endsWith('-01') && desde.slice(0, 7) === hasta.slice(0, 7);

export function armarVista(data, { desde, hasta, compararDesde, compararHasta, cohorteDesde, cohorteHasta }) {
  const cfg = data.config;
  if (hasta > cfg.corte) throw new Error('El período no puede pasar el corte de la muestra');
  const ix = indices(data);
  const actual = ventanaTotal(data, desde, hasta);
  const previo = ventanaTotal(data, compararDesde, compararHasta);
  const comparable = actual.cobertura >= COBERTURA_MINIMA && previo.cobertura >= COBERTURA_MINIMA;
  const tipoComparacion = compararDesde.slice(5) === desde.slice(5) && compararHasta.slice(5) === hasta.slice(5) && +desde.slice(0, 4) - +compararDesde.slice(0, 4) === 1 ? 'anio' : 'otro';

  // ── 1. Resultados ──
  const leadsDia = (d) => {
    const filas = cfg.canales.map((c) => ix.pautaDia[c.id].get(d));
    if (filas.some((p) => !p || p.sinDato)) return null; // un canal sin dato: el total del día no se conoce
    return suma(filas, (p) => p.leads);
  };
  const fechas = rango(desde, hasta);
  const desfase = diasEntre(compararDesde, desde);
  const resultados = {
    leads: actual.leads, leadsPrevio: previo.leads, diasMedidos: actual.medidos, diasParciales: actual.parciales,
    cambio: comparable ? cambioPct(actual.leadsPorDia, previo.leadsPorDia) : null, // por día medido
    porDia: actual.leadsPorDia, mismoLargo: actual.medidos === previo.medidos,
    cpl: razon(actual.inversion, actual.leads), cplPrevio: razon(previo.inversion, previo.leads),
    inversion: actual.inversion,
    serie: fechas.map((d) => ({ fecha: d, valor: leadsDia(d) })),
    seriePrevia: fechas.map((d) => ({ fecha: sumarDias(d, -desfase), valor: leadsDia(sumarDias(d, -desfase)) })),
    porCanal: cfg.canales.map((c) => {
      const a = ventanaCanal(data, c.id, desde, hasta), b = ventanaCanal(data, c.id, compararDesde, compararHasta);
      const ok = a.cobertura >= COBERTURA_MINIMA && b.cobertura >= COBERTURA_MINIMA;
      return {
        id: c.id, nombre: c.nombre, total: a.leads, previo: b.leads, sinDato: a.sinDato,
        cambio: ok ? cambioPct(a.leadsPorDia, b.leadsPorDia) : null,
        serie: fechas.map((d) => { const p = ix.pautaDia[c.id].get(d); return { fecha: d, valor: p && !p.sinDato ? p.leads : null }; }),
      };
    }),
    calendario: (() => {
      const inicio = sumarDias(cfg.corte, -364);
      const lunes0 = sumarDias(inicio, -diaSemana(inicio));
      return rango(inicio, cfg.corte).map((d) => ({ fecha: d, valor: leadsDia(d), diaSemana: diaSemana(d), semana: Math.floor(diasEntre(lunes0, d) / 7) }));
    })(),
    eventos: cfg.eventos.filter((e) => e.fecha >= desde && e.fecha <= hasta),
  };

  // ── 2. Canales ──
  const porCanal = cfg.canales.map((c) => {
    const a = ventanaCanal(data, c.id, desde, hasta), b = ventanaCanal(data, c.id, compararDesde, compararHasta);
    return { id: c.id, nombre: c.nombre, inversion: a.inversion, leads: a.leads, cpl: razon(a.inversion, a.leads), cplPrevio: razon(b.inversion, b.leads), metaCpl: c.metaCpl, cobertura: a.cobertura, sinDato: a.sinDato };
  });
  // Las participaciones solo se calculan sobre días que todos los canales midieron: un canal caído no «pierde» peso
  const diasComunes = fechas.filter((d) => leadsDia(d) != null);
  const sumaComun = (id, k) => suma(diasComunes, (d) => ix.pautaDia[id].get(d)[k]);
  const pctInv = mayorResto(porCanal.map((c) => sumaComun(c.id, 'inversion')));
  const pctLeads = mayorResto(porCanal.map((c) => sumaComun(c.id, 'leads')));
  const canales = porCanal.map((c, i) => ({ ...c, pctInversion: pctInv[i], pctLeads: pctLeads[i] }));

  // ── 3. Embudo de cohorte ──
  const coh = data.cohortes.filter((x) => x.fecha >= cohorteDesde && x.fecha <= cohorteHasta);
  const cerrada = diasEntre(cohorteHasta, cfg.corte) >= cfg.embudo.rezagoAltaMax;
  const etapas = ['leads', 'contactos', 'citas', 'asisten', 'altas'].map((k) => ({ id: k, valor: suma(coh, (x) => x[k]) }));
  const [L, C, Ci, A, Al] = etapas.map((e) => e.valor);
  const exclusivas = [
    { id: 'alta', nombre: 'Se inscribió', valor: Al },
    { id: 'asistio', nombre: 'Fue y no se inscribió', valor: A - Al },
    { id: 'cita', nombre: 'Agendó y no fue', valor: Ci - A },
    { id: 'contacto', nombre: 'Contactado sin cita', valor: C - Ci },
    { id: 'sin', nombre: 'No se logró contactar', valor: L - C },
  ];
  const deCada100 = mayorResto(exclusivas.map((e) => e.valor));
  const porCanalCohorte = cfg.canales.map((c) => {
    const cc = coh.filter((x) => x.canal === c.id);
    const t = { leads: suma(cc, (x) => x.leads), contactos: suma(cc, (x) => x.contactos), citas: suma(cc, (x) => x.citas), asisten: suma(cc, (x) => x.asisten), altas: suma(cc, (x) => x.altas) };
    const destinos = { alta: t.altas, asistio: t.asisten - t.altas, cita: t.citas - t.asisten, contacto: t.contactos - t.citas, sin: t.leads - t.contactos };
    return { id: c.id, nombre: c.nombre, ...t, destinos, tasaAlta: razon(t.altas, t.leads) };
  });
  const embudo = { cerrada, desde: cohorteDesde, hasta: cohorteHasta, etapas, exclusivas: exclusivas.map((e, i) => ({ ...e, de100: deCada100[i] })), porCanal: porCanalCohorte, tasaAlta: razon(Al, L) };

  // ── 4. Índice: contra el día anterior al período, con esa fecha nombrada ──
  const indice = calcularIndice(data, hasta);
  const fechaPrevio = sumarDias(desde, -1);
  const indicePrevio = fechaPrevio >= cfg.desde ? calcularIndice(data, fechaPrevio) : { valor: null };
  const historia = [];
  for (let k = 11; k >= 0; k--) {
    const fin = finDeMes(sumarMeses(hasta.slice(0, 7), -k));
    if (fin > cfg.corte || fin < cfg.desde) continue;
    const i = calcularIndice(data, fin);
    historia.push({ fecha: fin, valor: i.completo ? i.valor : null }); // un mes con un componente sin medir no se grafica junto a los completos
  }

  // ── 5. Sedes: una sede que no abrió no tiene valor; una que abrió dentro de una ventana no se compara ──
  const parcialA = new Set(actual.parciales), parcialB = new Set(previo.parciales);
  const sedes = cfg.sedes.map((s) => {
    const abiertaTodo = (d0) => !s.abre || s.abre <= d0;
    const abiertaAlgo = (d1) => !s.abre || s.abre <= d1;
    // los mismos días que el total: un día con una fuente caída no entra (así las sedes suman el total)
    const a = data.cohortes.filter((x) => x.sede === s.id && x.fecha >= desde && x.fecha <= hasta && !parcialA.has(x.fecha));
    const b = data.cohortes.filter((x) => x.sede === s.id && x.fecha >= compararDesde && x.fecha <= compararHasta && !parcialB.has(x.fecha));
    const leads = abiertaAlgo(hasta) ? suma(a, (x) => x.leads) : null;
    const leadsPrevio = abiertaTodo(compararDesde) ? suma(b, (x) => x.leads) : null;
    const seCompara = comparable && abiertaTodo(desde) && leadsPrevio != null && leadsPrevio > 0;
    return {
      id: s.id, nombre: s.distrito, corto: s.corto, col: s.col, fila: s.fila, zona: s.zona, abre: s.abre || null,
      leads, leadsPrevio, cambio: seCompara ? cambioPct(leads / actual.medidos, leadsPrevio / previo.medidos) : null,
      estado: leads == null ? 'sin-abrir' : !abiertaTodo(desde) ? 'abrio-en-el-periodo' : leadsPrevio == null ? 'sin-anterior' : 'normal',
    };
  });

  // ── 6. Conversación (marcas reales, dato de muestra). Solo meses con data ──
  const meses = [];
  for (let k = 11; k >= 0; k--) meses.push(sumarMeses(hasta.slice(0, 7), -k));
  const sovMes = meses.map((m) => {
    const tot = data.conversacion.map((b) => suma(b.semanas.filter((s) => sumarDias(s.semana, 3).slice(0, 7) === m), (s) => s.menciones));
    return { mes: m, tot };
  }).filter((x) => x.tot.reduce((a, b) => a + b, 0) > 0).map(({ mes: m, tot }) => {
    const pct = mayorResto(tot);
    return { mes: m, marcas: data.conversacion.map((b, i) => ({ id: b.id, nombre: b.nombre, propia: b.propia, menciones: tot[i], pct: pct[i] })) };
  });
  const sinOtros = (mm) => mm.marcas.filter((x) => x.id !== 'otros').sort((p, q) => q.menciones - p.menciones);
  const ranking = data.conversacion.filter((b) => b.id !== 'otros').map((b) => ({
    nombre: b.nombre, propia: b.propia,
    rangos: sovMes.map((mm) => sinOtros(mm).findIndex((x) => x.id === b.id) + 1),
  }));

  // ── 7. Hora × día: promedio por día (un mes tiene 4 o 5 de cada día de la semana) ──
  const sumaHD = Array.from({ length: 7 }, () => new Array(24).fill(0));
  const veces = new Array(7).fill(0);
  data.porHora.filter((h) => h.fecha >= desde && h.fecha <= hasta && leadsDia(h.fecha) != null).forEach((h) => {
    veces[diaSemana(h.fecha)]++;
    h.horas.forEach((v, j) => { sumaHD[diaSemana(h.fecha)][j] += v; });
  });
  const matriz = sumaHD.map((fila, i) => fila.map((v) => (veces[i] ? v / veces[i] : null)));

  // ── Lecturas: lo que dicen los títulos. Si la condición no se cumple, el título cae al descriptivo ──
  const brecha = canales.map((c) => ({ ...c, brecha: c.pctLeads - c.pctInversion })).sort((a, b) => b.brecha - a.brecha);
  const comparables = sedes.filter((s) => s.cambio != null).sort((a, b) => b.cambio - a.cambio);
  const mediana = (v) => { const o = [...v].sort((a, b) => a - b); return o[Math.floor(o.length / 2)]; };
  const rp = ranking.find((x) => x.propia).rangos;
  const sostenido = rp.length >= 6 ? { antes: mediana(rp.slice(0, 3)), ahora: mediana(rp.slice(-3)), mejor3: Math.min(...rp.slice(-3)), peor3: Math.max(...rp.slice(-3)), actual: rp[rp.length - 1] } : null; // el puesto tiene que sostenerse 3 meses
  const ultimo = sovMes[sovMes.length - 1], primero = sovMes[0];
  const etapas2 = embudo.etapas;
  let caida = null;
  for (let i = 1; i < etapas2.length; i++) { const p = 1 - etapas2[i].valor / etapas2[i - 1].valor; if (!caida || p > caida.proporcion) caida = { de: etapas2[i - 1].id, a: etapas2[i].id, proporcion: p }; }
  const enPersonas = [...embudo.exclusivas].filter((e) => e.id !== 'alta').sort((a, b) => b.valor - a.valor)[0];
  let pico = { v: -1 };
  matriz.forEach((f, i) => f.forEach((v, j) => { if (v != null && v > pico.v) pico = { v, dia: i, hora: j }; }));
  const lecturas = {
    canalQueRinde: brecha[0].brecha >= 5 ? brecha[0] : null,
    sobreMeta: canales.filter((c) => c.cpl != null && c.cpl > c.metaCpl),
    sedeQueMasCrece: comparables[0] && comparables[0].cambio > 0 ? comparables[0] : null,
    sedesNuevas: sedes.filter((s) => s.estado === 'abrio-en-el-periodo' || s.estado === 'sin-anterior'),
    sedesSinAbrir: sedes.filter((s) => s.estado === 'sin-abrir'),
    caidaProporcional: caida,
    caidaEnPersonas: enPersonas,
    sovPropio: { actual: ultimo?.marcas.find((x) => x.propia).pct ?? null, inicio: primero?.marcas.find((x) => x.propia).pct ?? null, sostenido, meses: sovMes.length },
    horaPico: pico,
  };

  return {
    lecturas,
    periodo: { desde, hasta, dias: actual.dias, compararDesde, compararHasta, comparable, tipoComparacion, mesCompleto: esMesCompleto(desde, hasta), corte: cfg.corte, fechaPrevioIndice: fechaPrevio },
    resultados, canales, embudo,
    indice: { ...indice, previo: indicePrevio.valor, cambio: indicePrevio.valor == null ? null : indice.valor - indicePrevio.valor, historia },
    sedes, conversacion: { meses: sovMes, ranking }, horaDia: matriz,
  };
}

// ── Índice de oportunidad ──
function sumarMeses(aaaamm, n) { const [a, m] = aaaamm.split('-').map(Number); const t = a * 12 + (m - 1) + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`; }
function finDeMes(aaaamm) { const [a, m] = aaaamm.split('-').map(Number); return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10); }
const acotar = (v) => Math.max(0, Math.min(100, v));
const posicion = (v, min, max) => (max > min ? acotar(((v - min) / (max - min)) * 100) : 50);

export const PESOS_INDICE = [
  { id: 'demanda', nombre: 'Demanda de búsqueda', peso: 0.25 },
  { id: 'eficiencia', nombre: 'Costo por lead contra meta', peso: 0.25 },
  { id: 'conversion', nombre: 'Conversión a socio', peso: 0.2 },
  { id: 'conversacion', nombre: 'Conversación propia', peso: 0.15 },
  { id: 'temporada', nombre: 'Temporada del mes siguiente', peso: 0.15 },
];

export function calcularIndice(data, fecha) {
  const cfg = data.config;
  // demanda: últimas 4 semanas de «gimnasio» dentro de su rango de 52 semanas; con menos de 52 semanas no se mide
  const g = data.busquedas.find((b) => b.id === 'gimnasio').semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const ult4 = g.slice(-4), ult52 = g.slice(-52);
  const demanda = ult52.length < 52 ? null : posicion(suma(ult4, (s) => s.indice) / ult4.length, Math.min(...ult52.map((s) => s.indice)), Math.max(...ult52.map((s) => s.indice)));
  // eficiencia: CPL de 28 días contra la meta combinada Σinv / Σ(inv/meta); 100 si está 30 % bajo meta, 50 en la meta, 0 si está 30 % sobre
  const d0 = sumarDias(fecha, -27);
  const tot = ventanaTotal(data, d0, fecha);
  const leadsMeta = suma(cfg.canales, (c) => ventanaCanal(data, c.id, d0, fecha).inversion / c.metaCpl);
  const metaComb = razon(tot.inversion, leadsMeta);
  const cpl = razon(tot.inversion, tot.leads);
  const eficiencia = cpl == null || metaComb == null ? null : acotar(((1.3 - cpl / metaComb) / 0.6) * 100);
  // conversión: tasa lead → alta de la última ventana de 28 días ya cerrada, contra las 12 anteriores (todas con data)
  const { cohDia } = indices(data);
  const cierre = sumarDias(fecha, -cfg.embudo.rezagoAltaMax);
  const tasa = (h) => { if (sumarDias(h, -27) < cfg.desde) return null; let l = 0, a = 0; for (let k = 0; k < 28; k++) { const x = cohDia.get(sumarDias(h, -k)); if (x) { l += x.leads; a += x.altas; } } return razon(a, l); };
  const tasas = Array.from({ length: 13 }, (_, k) => tasa(sumarDias(cierre, -28 * k)));
  const conversion = tasas.every((v) => v != null) ? posicion(tasas[0], Math.min(...tasas), Math.max(...tasas)) : null;
  // conversación propia: share of voice Σ/Σ de las últimas 4 semanas contra el rango semanal de 52
  const prop = data.conversacion.find((b) => b.propia).semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const totSem = (s) => suma(data.conversacion, (b) => b.semanas.find((x) => x.semana === s)?.menciones || 0);
  const ult4p = prop.slice(-4);
  const sov4 = razon(suma(ult4p, (s) => s.menciones), suma(ult4p, (s) => totSem(s.semana)));
  const sov52 = prop.slice(-52).map((s) => s.menciones / (totSem(s.semana) || 1));
  const conversacion = prop.length < 52 || sov4 == null ? null : posicion(sov4, Math.min(...sov52), Math.max(...sov52));
  // temporada: factor estacional del mes siguiente dentro del rango del año
  const mSig = (mes(fecha) % 12) + 1;
  const temporada = posicion(cfg.estacionalidad[mSig - 1], Math.min(...cfg.estacionalidad), Math.max(...cfg.estacionalidad));

  const valores = { demanda, eficiencia, conversion, conversacion, temporada };
  // un componente que no se pudo medir sale y su peso se reparte entre los que sí (no entra como cero)
  const medidos = PESOS_INDICE.filter((p) => valores[p.id] != null);
  const pesoTotal = suma(medidos, (p) => p.peso);
  const aportesExactos = medidos.map((p) => (p.peso / pesoTotal) * valores[p.id]);
  const exacto = suma(aportesExactos, (a) => a);
  return {
    valor: Math.round(exacto), exacto, fecha, completo: medidos.length === PESOS_INDICE.length,
    componentes: PESOS_INDICE.map((p) => {
      const i = medidos.indexOf(p);
      return { ...p, puntaje: valores[p.id] == null ? null : valores[p.id], aporte: i >= 0 ? aportesExactos[i] : null, pesoEfectivo: i >= 0 ? p.peso / pesoTotal : 0 };
    }),
  };
}
