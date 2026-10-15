// Piezas comunes de la capa de cálculo. Todas puras.
// Reglas: razones Σ/Σ; un día sin fila no es cero; comparaciones por día medido; proporciones por mayor resto.

import { rango, diasEntre, sumarDias } from '../muestra/calendario.js';

export const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
export const razon = (num, den) => (den > 0 ? num / den : null);
export const cambioPct = (actual, previo) => (actual != null && previo != null && previo > 0 ? ((actual - previo) / previo) * 100 : null);

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

export function cuantil(valores, q) {
  const o = [...valores].sort((a, b) => a - b);
  if (!o.length) return null;
  const p = (o.length - 1) * q, i = Math.floor(p);
  return o[i] + (o[Math.min(i + 1, o.length - 1)] - o[i]) * (p - i);
}

export function correlacion(a, b) {
  const pares = a.map((x, i) => [x, b[i]]).filter(([x, y]) => x != null && y != null);
  if (pares.length < 8) return null;
  const mx = suma(pares, (p) => p[0]) / pares.length, my = suma(pares, (p) => p[1]) / pares.length;
  const cov = suma(pares, ([x, y]) => (x - mx) * (y - my));
  const vx = suma(pares, ([x]) => (x - mx) ** 2), vy = suma(pares, ([, y]) => (y - my) ** 2);
  return vx > 0 && vy > 0 ? cov / Math.sqrt(vx * vy) : null;
}

// Índices por fecha, armados una vez por data (no cambian el resultado, solo el costo)
const cache = new WeakMap();
export function indices(data) {
  if (cache.has(data)) return cache.get(data);
  const pautaDia = {};
  for (const c of data.config.canales) pautaDia[c.id] = new Map(data.pauta[c.id].map((p) => [p.fecha, p]));
  const webDia = new Map(data.web.map((w) => [w.fecha, w]));
  const crmDia = new Map(); // fecha → {canal → {leads, contactos, citas, asisten, altas}}
  for (const x of data.cohortes) {
    if (!crmDia.has(x.fecha)) crmDia.set(x.fecha, {});
    const k = crmDia.get(x.fecha);
    const c = k[x.canal] || (k[x.canal] = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 });
    c.leads += x.leads; c.contactos += x.contactos; c.citas += x.citas; c.asisten += x.asisten; c.altas += x.altas;
  }
  const horaDia = new Map(data.porHora.map((h) => [h.fecha, h.horas]));
  const ix = { pautaDia, webDia, crmDia, horaDia };
  cache.set(data, ix);
  return ix;
}

export const dentro = (data, d) => d >= data.config.desde && d <= data.config.corte;

// ── Pauta: un canal, sumas solo de días medidos ──
export function ventanaCanal(data, canal, desde, hasta) {
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
  return { inversion, impresiones, clics, leads, medidos, dias, cobertura: medidos / dias, sinDato, leadsPorDia: razon(leads, medidos), cpl: razon(inversion, leads), ctr: razon(clics, impresiones) };
}

// ── Hora del día: promedio de cada hora sobre todos los días medidos, y las cuatro horas más altas ──
// sumaHD[díaDeSemana][hora] = suma del período; veces[díaDeSemana] = cuántos días de ese tipo entraron
export function porHoraDelDia(sumaHD, veces) {
  const n = veces.reduce((s, v) => s + v, 0);
  const porHora = Array.from({ length: 24 }, (_, h) => (n ? sumaHD.reduce((s, f) => s + f[h], 0) / n : null));
  const altas = porHora.map((v, h) => ({ v, h })).filter((x) => x.v != null).sort((a, b) => b.v - a.v).slice(0, 4).map((x) => x.h).sort((a, b) => a - b);
  return { porHora, altas };
}

// El día de la semana con más: solo si se separa del más bajo por más del margen; si no, los días se parecen (null)
export function diaDestacado(porDiaSemana, margen) {
  const xs = porDiaSemana.map((v, i) => ({ v, i })).filter((x) => x.v != null).sort((a, b) => b.v - a.v);
  return xs.length > 1 && xs[0].v / xs.at(-1).v - 1 >= margen ? xs[0].i : null;
}

// ── Pauta: una plataforma (Google Ads junta Search y Display). Un día cuenta solo si todos sus canales lo midieron ──
export const plataformaDe = (cfg, canal) => cfg.plataformas.find((p) => p.canales.includes(canal));
export function ventanaPlataforma(data, pl, desde, hasta) {
  const ix = indices(data);
  let inversion = 0, impresiones = 0, clics = 0, leads = 0, medidos = 0;
  const sinDato = [];
  for (const d of rango(desde, hasta)) {
    const filas = pl.canales.map((c) => ix.pautaDia[c].get(d));
    if (filas.some((p) => !p)) continue; // fuera de la serie
    if (filas.some((p) => p.sinDato)) { sinDato.push(d); continue; }
    for (const p of filas) { inversion += p.inversion; impresiones += p.impresiones; clics += p.clics; leads += p.leads; }
    medidos++;
  }
  const dias = diasEntre(desde, hasta) + 1;
  return { inversion, impresiones, clics, leads, medidos, dias, cobertura: medidos / dias, sinDato, leadsPorDia: razon(leads, medidos), cpl: razon(inversion, leads), ctr: razon(clics, impresiones) };
}
// Objetivo de costo por lead de una plataforma: el que cumpliría cada canal con su propia inversión (Σ/Σ)
export function objetivoPlataforma(cfg, pl, inversionDe) {
  const inv = suma(pl.canales, inversionDe);
  return razon(inv, suma(pl.canales, (id) => inversionDe(id) / cfg.canales.find((c) => c.id === id).metaCpl));
}

// ── Pauta total: un día cuenta solo si TODOS los canales lo midieron ──
export function ventanaPauta(data, desde, hasta) {
  const ix = indices(data);
  const canales = data.config.canales;
  let inversion = 0, clics = 0, impresiones = 0, leads = 0, medidos = 0;
  const parciales = [];
  for (const d of rango(desde, hasta)) {
    const filas = canales.map((c) => ix.pautaDia[c.id].get(d));
    if (filas.some((p) => !p)) continue;
    if (filas.some((p) => p.sinDato)) { parciales.push(d); continue; }
    inversion += suma(filas, (p) => p.inversion); clics += suma(filas, (p) => p.clics); impresiones += suma(filas, (p) => p.impresiones); leads += suma(filas, (p) => p.leads); medidos++;
  }
  const dias = diasEntre(desde, hasta) + 1;
  return { inversion, clics, impresiones, leads, medidos, dias, cobertura: medidos / dias, parciales, leadsPorDia: razon(leads, medidos), cpl: razon(inversion, leads) };
}

export function leadsPautaDia(data, d) {
  const ix = indices(data);
  const filas = data.config.canales.map((c) => ix.pautaDia[c.id].get(d));
  if (filas.some((p) => !p || p.sinDato)) return null; // un canal sin dato: el total del día no se conoce
  return suma(filas, (p) => p.leads);
}

// ── CRM: leads que entraron (de pauta y del sitio), por origen y etapa ──
export const ETAPAS = ['leads', 'contactos', 'citas', 'asisten', 'altas'];
export function ventanaCrm(data, desde, hasta, filtro = () => true) {
  const ix = indices(data);
  const tot = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 };
  const porOrigen = {};
  let dias = 0;
  for (const d of rango(desde, hasta)) {
    if (!dentro(data, d)) continue;
    dias++;
    const k = ix.crmDia.get(d) || {};
    for (const [canal, v] of Object.entries(k)) {
      if (!filtro(canal)) continue;
      const o = porOrigen[canal] || (porOrigen[canal] = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 });
      for (const e of ETAPAS) { o[e] += v[e]; tot[e] += v[e]; }
    }
  }
  return { ...tot, porOrigen, dias, cobertura: dias / (diasEntre(desde, hasta) + 1) };
}

// ── Web: sesiones, móviles y solicitudes por fuente; páginas ──
export function ventanaWeb(data, desde, hasta) {
  const ix = indices(data);
  const fuentes = Object.fromEntries(data.config.web.fuentes.map((f) => [f.id, { sesiones: 0, movil: 0, solicitudes: 0 }]));
  const paginas = data.config.web.paginas.map(() => ({ sesiones: 0, solicitudes: 0 }));
  let dias = 0;
  for (const d of rango(desde, hasta)) {
    const w = ix.webDia.get(d);
    if (!w) continue;
    dias++;
    for (const [id, v] of Object.entries(w.fuentes)) { fuentes[id].sesiones += v.sesiones; fuentes[id].movil += v.movil; fuentes[id].solicitudes += v.solicitudes; }
    w.paginas.forEach((n, i) => { paginas[i].sesiones += n; });
    w.solicitudesPorPagina.forEach((n, i) => { paginas[i].solicitudes += n; });
  }
  const sesiones = suma(Object.values(fuentes), (f) => f.sesiones);
  return { fuentes, paginas, sesiones, movil: suma(Object.values(fuentes), (f) => f.movil), solicitudes: suma(Object.values(fuentes), (f) => f.solicitudes), dias, cobertura: dias / (diasEntre(desde, hasta) + 1) };
}

// ── Fechas ──
export function sumarMeses(aaaamm, n) { const [a, m] = aaaamm.split('-').map(Number); const t = a * 12 + (m - 1) + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`; }
export function finDeMes(aaaamm) { const [a, m] = aaaamm.split('-').map(Number); return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10); }
export const diasDelMes = (aaaamm) => +finDeMes(aaaamm).slice(8, 10);
export const semanaEn = (s, desde, hasta) => sumarDias(s, 3) >= desde && sumarDias(s, 3) <= hasta; // la semana pertenece al período por su jueves
