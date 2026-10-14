// Capa de cálculo pura: armarVista(data, opciones) devuelve todo lo que la pantalla pinta.
// Reglas (heredadas del método de referencia y del informe 06):
//  - las razones se calculan Σ/Σ, nunca promediando razones diarias (R4)
//  - un día sin fila no es un cero; un delta solo con ≥ 60 % de días medidos en las DOS ventanas
//  - el embudo se lee en cohortes cerradas; una cohorte que no maduró se declara, no se compara
//  - proporciones visibles con el método del mayor resto, para que sumen 100

import { rango, sumarDias, diaSemana, diasEntre, mes } from './calendario.js';

const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
export const razon = (num, den) => (den > 0 ? num / den : null);
export const cambioPct = (actual, previo) => (actual != null && previo > 0 ? ((actual - previo) / previo) * 100 : null);

// Reparte 100 entre partes por el mayor resto: la suma visible da 100 exacto
export function mayorResto(valores, total = 100) {
  const s = valores.reduce((a, b) => a + b, 0);
  if (!(s > 0)) return valores.map(() => 0);
  const exactos = valores.map((v) => (v / s) * total);
  const base = exactos.map(Math.floor);
  let resto = total - base.reduce((a, b) => a + b, 0);
  exactos.map((e, i) => [e - Math.floor(e), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (resto > 0) { base[i] += 1; resto--; } });
  return base;
}

function ventanaPauta(data, canal, desde, hasta) {
  const filas = data.pauta[canal].filter((p) => p.fecha >= desde && p.fecha <= hasta);
  const medidas = filas.filter((p) => !p.sinDato);
  const dias = diasEntre(desde, hasta) + 1;
  return {
    inversion: suma(medidas, (p) => p.inversion), impresiones: suma(medidas, (p) => p.impresiones),
    clics: suma(medidas, (p) => p.clics), leads: suma(medidas, (p) => p.leads),
    cobertura: medidas.length / dias, diasSinDato: filas.filter((p) => p.sinDato).map((p) => p.fecha),
  };
}

function totalPauta(data, desde, hasta) {
  const partes = data.config.canales.map((c) => ventanaPauta(data, c.id, desde, hasta));
  return {
    inversion: suma(partes, (p) => p.inversion), clics: suma(partes, (p) => p.clics), leads: suma(partes, (p) => p.leads),
    impresiones: suma(partes, (p) => p.impresiones), cobertura: Math.min(...partes.map((p) => p.cobertura)),
  };
}

const COBERTURA_MINIMA = 0.6;

// Índices por fecha, armados una vez por data (no cambian el resultado, solo el costo)
const cache = new WeakMap();
function indices(data) {
  if (cache.has(data)) return cache.get(data);
  const pautaDia = {};
  for (const c of data.config.canales) { pautaDia[c.id] = new Map(data.pauta[c.id].map((p) => [p.fecha, p])); }
  const cohDia = new Map();
  for (const x of data.cohortes) { const k = cohDia.get(x.fecha) || { leads: 0, altas: 0 }; k.leads += x.leads; k.altas += x.altas; cohDia.set(x.fecha, k); }
  const ix = { pautaDia, cohDia };
  cache.set(data, ix);
  return ix;
}

export function armarVista(data, { desde, hasta, compararDesde, compararHasta, cohorteDesde, cohorteHasta }) {
  const cfg = data.config;
  if (hasta > cfg.corte) throw new Error('El período no puede pasar el corte de la muestra');
  const dias = diasEntre(desde, hasta) + 1;
  const actual = totalPauta(data, desde, hasta);
  const previo = totalPauta(data, compararDesde, compararHasta);
  const comparable = actual.cobertura >= COBERTURA_MINIMA && previo.cobertura >= COBERTURA_MINIMA;

  // ── 1. Resultados: leads diarios contra el mismo tramo del año anterior ──
  const ix = indices(data);
  const leadsDia = (d) => {
    let total = 0, alguno = false;
    for (const c of cfg.canales) { const p = ix.pautaDia[c.id].get(d); if (p && !p.sinDato) { total += p.leads; alguno = true; } }
    return alguno ? total : null;
  };
  const fechas = rango(desde, hasta);
  const desfase = diasEntre(compararDesde, desde);
  const resultados = {
    leads: actual.leads, leadsPrevio: previo.leads, cambio: comparable ? cambioPct(actual.leads, previo.leads) : null,
    cpl: razon(actual.inversion, actual.leads), cplPrevio: razon(previo.inversion, previo.leads),
    inversion: actual.inversion,
    serie: fechas.map((d) => ({ fecha: d, valor: leadsDia(d) })),
    seriePrevia: fechas.map((d) => ({ fecha: sumarDias(d, -desfase), valor: leadsDia(sumarDias(d, -desfase)) })),
    porCanal: cfg.canales.map((c) => ({
      id: c.id, nombre: c.nombre,
      serie: fechas.map((d) => { const p = ix.pautaDia[c.id].get(d); return { fecha: d, valor: p && !p.sinDato ? p.leads : null }; }),
      total: ventanaPauta(data, c.id, desde, hasta).leads,
      previo: ventanaPauta(data, c.id, compararDesde, compararHasta).leads,
    })).map((c) => ({ ...c, cambio: comparable ? cambioPct(c.total, c.previo) : null })),
    calendario: (() => {
      const inicio = sumarDias(cfg.corte, -364);
      const lunes0 = sumarDias(inicio, -diaSemana(inicio));
      return rango(inicio, cfg.corte).map((d) => ({ fecha: d, valor: leadsDia(d), diaSemana: diaSemana(d), semana: Math.floor(diasEntre(lunes0, d) / 7) }));
    })(),
    eventos: cfg.eventos.filter((e) => e.fecha >= desde && e.fecha <= hasta),
  };

  // ── 2. Canales: peso en inversión contra peso en leads, CPL contra meta ──
  const porCanal = cfg.canales.map((c) => {
    const a = ventanaPauta(data, c.id, desde, hasta), b = ventanaPauta(data, c.id, compararDesde, compararHasta);
    return { id: c.id, nombre: c.nombre, inversion: a.inversion, leads: a.leads, cpl: razon(a.inversion, a.leads), cplPrevio: razon(b.inversion, b.leads), metaCpl: c.metaCpl, cobertura: a.cobertura };
  });
  const pctInv = mayorResto(porCanal.map((c) => c.inversion));
  const pctLeads = mayorResto(porCanal.map((c) => c.leads));
  const canales = porCanal.map((c, i) => ({ ...c, pctInversion: pctInv[i], pctLeads: pctLeads[i] }));

  // ── 3. Embudo de una cohorte cerrada (todas sus altas ya pudieron ocurrir al corte) ──
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
    // los mismos cinco destinos excluyentes, por canal: suman los leads del canal
    const destinos = { alta: t.altas, asistio: t.asisten - t.altas, cita: t.citas - t.asisten, contacto: t.contactos - t.citas, sin: t.leads - t.contactos };
    return { id: c.id, nombre: c.nombre, ...t, destinos, tasaAlta: razon(t.altas, t.leads) };
  });
  const embudo = { cerrada, desde: cohorteDesde, hasta: cohorteHasta, etapas, exclusivas: exclusivas.map((e, i) => ({ ...e, de100: deCada100[i] })), porCanal: porCanalCohorte, tasaAlta: razon(Al, L) };

  // ── 4. Índice de oportunidad: suma ponderada exacta de componentes 0 a 100 ──
  const indice = calcularIndice(data, hasta);
  const indicePrevio = calcularIndice(data, sumarDias(desde, -1));
  const historia = [];
  for (let k = 11; k >= 0; k--) {
    const fin = finDeMes(sumarMeses(hasta.slice(0, 7), -k));
    if (fin <= cfg.corte) historia.push({ fecha: fin, valor: calcularIndice(data, fin).valor });
  }

  // ── 5. Sedes ──
  const sedes = cfg.sedes.map((s) => {
    const a = data.cohortes.filter((x) => x.sede === s.id && x.fecha >= desde && x.fecha <= hasta);
    const b = data.cohortes.filter((x) => x.sede === s.id && x.fecha >= compararDesde && x.fecha <= compararHasta);
    const abiertaEnComparacion = !s.abre || s.abre <= compararDesde;
    const leads = suma(a, (x) => x.leads), leadsPrevio = abiertaEnComparacion ? suma(b, (x) => x.leads) : null;
    return { id: s.id, nombre: s.distrito, corto: s.corto, col: s.col, fila: s.fila, abre: s.abre || null, leads, leadsPrevio, cambio: leadsPrevio != null ? cambioPct(leads, leadsPrevio) : null, zona: s.fila <= 0 ? 'Lima Norte' : s.col >= 3 ? 'Lima Este' : 'Lima Moderna' };
  });

  // ── 6. Conversación: share of voice mensual (marcas reales, dato de muestra) ──
  const meses = [];
  for (let k = 11; k >= 0; k--) meses.push(sumarMeses(hasta.slice(0, 7), -k));
  const sovMes = meses.map((m) => {
    const tot = data.conversacion.map((b) => suma(b.semanas.filter((s) => sumarDias(s.semana, 3).slice(0, 7) === m), (s) => s.menciones));
    const pct = mayorResto(tot);
    return { mes: m, marcas: data.conversacion.map((b, i) => ({ id: b.id, nombre: b.nombre, propia: b.propia, menciones: tot[i], pct: pct[i] })) };
  });
  const sinOtros = (mm) => mm.marcas.filter((x) => x.id !== 'otros').sort((p, q) => q.menciones - p.menciones);
  const ranking = data.conversacion.filter((b) => b.id !== 'otros').map((b) => ({
    nombre: b.nombre, propia: b.propia,
    rangos: sovMes.map((mm) => sinOtros(mm).findIndex((x) => x.id === b.id) + 1),
  }));

  // ── 7. Hora × día de la semana ──
  const matriz = Array.from({ length: 7 }, () => new Array(24).fill(0));
  data.porHora.filter((h) => h.fecha >= desde && h.fecha <= hasta).forEach((h) => { h.horas.forEach((v, j) => { matriz[diaSemana(h.fecha)][j] += v; }); });

  // ── Lecturas: lo que dicen los títulos. Si la condición no se cumple, el título cae al descriptivo ──
  const brecha = canales.map((c) => ({ ...c, brecha: c.pctLeads - c.pctInversion })).sort((a, b) => b.brecha - a.brecha);
  const comparables = sedes.filter((s) => s.cambio != null).sort((a, b) => b.cambio - a.cambio);
  const ultimoMes = sovMes[sovMes.length - 1], primerMes = sovMes[0];
  const propia = (mm) => mm.marcas.find((x) => x.propia);
  const rangoPropio = ranking.find((x) => x.propia);
  const lecturas = {
    canalQueRinde: brecha[0].brecha >= 5 ? brecha[0] : null,
    canalQueNoRinde: brecha[brecha.length - 1].brecha <= -5 ? brecha[brecha.length - 1] : null,
    sobreMeta: canales.filter((c) => c.cpl != null && c.cpl > c.metaCpl),
    sedeQueMasCrece: comparables[0] && comparables[0].cambio > 0 ? comparables[0] : null,
    sedesNuevas: sedes.filter((s) => s.leadsPrevio == null),
    sedesQueBajan: comparables.filter((s) => s.cambio < 0).length,
    etapaConMasPerdida: (() => { const e = embudo.etapas; let peor = null; for (let i = 1; i < e.length; i++) { const p = 1 - e[i].valor / e[i - 1].valor; if (!peor || p > peor.perdida) peor = { de: e[i - 1].id, a: e[i].id, perdida: p }; } return peor; })(),
    sovPropio: { actual: propia(ultimoMes).pct, inicio: propia(primerMes).pct, rangoActual: rangoPropio.rangos.at(-1), rangoInicio: rangoPropio.rangos[0], mejorRango: Math.min(...rangoPropio.rangos) },
    horaPico: (() => { let m = { v: -1 }; matriz.forEach((f, i) => f.forEach((v, j) => { if (v > m.v) m = { v, dia: i, hora: j }; })); return m; })(),
  };

  return {
    lecturas,
    periodo: { desde, hasta, dias, compararDesde, compararHasta, comparable, corte: cfg.corte },
    resultados, canales, embudo,
    indice: { ...indice, previo: indicePrevio.valor, cambio: indice.valor - indicePrevio.valor, historia },
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
  // demanda: últimas 4 semanas de «gimnasio» dentro de su rango de 52 semanas
  const g = data.busquedas.find((b) => b.id === 'gimnasio').semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const ult4 = g.slice(-4), ult52 = g.slice(-52);
  const media4 = suma(ult4, (s) => s.indice) / (ult4.length || 1);
  const demanda = posicion(media4, Math.min(...ult52.map((s) => s.indice)), Math.max(...ult52.map((s) => s.indice)));
  // eficiencia: CPL de los últimos 28 días contra la meta ponderada por inversión; 100 si está 30 % bajo meta, 0 si está 30 % sobre
  const d0 = sumarDias(fecha, -27);
  const tot = totalPauta(data, d0, fecha);
  const metaPond = suma(cfg.canales, (c) => ventanaPauta(data, c.id, d0, fecha).inversion * c.metaCpl) / (tot.inversion || 1);
  const cpl = razon(tot.inversion, tot.leads);
  const eficiencia = cpl == null ? null : acotar(((1.3 - cpl / metaPond) / 0.6) * 100);
  // conversión: tasa lead → alta de la última cohorte de 28 días ya cerrada, contra las 12 anteriores
  const cierre = sumarDias(fecha, -cfg.embudo.rezagoAltaMax);
  const { cohDia } = indices(data);
  const tasa = (h) => { let l = 0, a = 0; for (let k = 0; k < 28; k++) { const x = cohDia.get(sumarDias(h, -k)); if (x) { l += x.leads; a += x.altas; } } return razon(a, l); };
  const tasas = Array.from({ length: 13 }, (_, k) => tasa(sumarDias(cierre, -28 * k))).filter((v) => v != null);
  const conversion = tasas.length > 2 ? posicion(tasas[0], Math.min(...tasas), Math.max(...tasas)) : null;
  // conversación propia: share of voice de las últimas 4 semanas contra su rango de 52
  const prop = data.conversacion.find((b) => b.propia).semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const totSem = (s) => suma(data.conversacion, (b) => b.semanas.find((x) => x.semana === s)?.menciones || 0);
  const sov = prop.map((s) => s.menciones / (totSem(s.semana) || 1));
  const sov4 = suma(sov.slice(-4), (v) => v) / Math.max(1, Math.min(4, sov.length));
  const conversacion = posicion(sov4, Math.min(...sov.slice(-52)), Math.max(...sov.slice(-52)));
  // temporada: factor estacional del mes siguiente dentro del rango del año
  const mSig = (mes(fecha) % 12) + 1;
  const temporada = posicion(cfg.estacionalidad[mSig - 1], Math.min(...cfg.estacionalidad), Math.max(...cfg.estacionalidad));

  const valores = { demanda, eficiencia, conversion, conversacion, temporada };
  // un componente que no se pudo medir sale y su peso se reparte entre los que sí (no entra como cero)
  const medidos = PESOS_INDICE.filter((p) => valores[p.id] != null);
  const pesoTotal = suma(medidos, (p) => p.peso);
  const aportesExactos = medidos.map((p) => (p.peso / pesoTotal) * valores[p.id]);
  const valor = Math.round(suma(aportesExactos, (a) => a));
  const aportes = mayorResto(aportesExactos, valor); // los aportes visibles suman el índice visible
  return {
    valor, fecha,
    componentes: PESOS_INDICE.map((p) => {
      const i = medidos.indexOf(p);
      return { ...p, puntaje: valores[p.id] == null ? null : Math.round(valores[p.id]), aporte: i >= 0 ? aportes[i] : null, pesoEfectivo: i >= 0 ? p.peso / pesoTotal : 0 };
    }),
  };
}
