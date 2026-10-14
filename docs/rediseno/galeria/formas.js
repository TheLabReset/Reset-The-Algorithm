// Formas en SVG propio para la galería. Cada marca lleva data-valor para que una prueba
// cruce lo dibujado contra la capa de cálculo. Los colores son variables CSS (tokens).
// Ningún componente calcula: reciben la vista ya armada.

import { numero, compacto, porcentaje, fechaCorta, mesCorto, soles, variacion } from './muestra/formato.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const diasEntreIso = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
// Margen para rótulos de fila: el texto más largo (≈ 6,9 px por carácter a 12 px), con tope de 45 % del ancho
const margenRotulos = (nombres, ancho) => Math.min(Math.round(ancho * 0.45), 14 + Math.ceil(Math.max(...nombres.map((n) => String(n).length)) * 6.9));
// Recorta un rótulo que no cabe en su margen, con puntos suspensivos
const recortar = (t, px) => { const max = Math.max(4, Math.floor((px - 14) / 6.9)); t = String(t); return t.length > max ? t.slice(0, max - 1) + '…' : t; };
const lineal = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

// Marcas de eje «bonitas»: 1, 2 o 5 por potencia de 10
export function marcas(max, n = 4, min = 0) {
  const paso0 = (max - min) / n;
  const p = 10 ** Math.floor(Math.log10(paso0 || 1));
  const paso = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= paso0) || paso0;
  const out = [];
  for (let v = Math.floor(min / paso) * paso; v <= max + paso * 0.001; v += paso) out.push(+v.toFixed(10));
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + paso);
  return out;
}

const svg = (w, h, cuerpo, etiqueta) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(etiqueta)}" class="g">${cuerpo}</svg>`;

// ───────────────────────── Línea con período anterior en gris ─────────────────────────
// serie: [{fecha, valor|null}], previa: misma longitud, alineada por posición
export function linea({ serie, previa, alto = 220, ancho = 640, formatoY = compacto, eventos = [], meta = null, etiqueta }) {
  const m = { t: 16, r: 64, b: 26, l: 44 };
  const vals = [...serie, ...(previa || [])].map((p) => p.valor).filter((v) => v != null);
  const ys = marcas(Math.max(...vals, meta ?? 0));
  const x = lineal(0, serie.length - 1, m.l, ancho - m.r);
  const y = lineal(0, ys[ys.length - 1], alto - m.b, m.t);
  const camino = (s) => {
    let d = '', abierto = false;
    s.forEach((p, i) => {
      if (p.valor == null) { abierto = false; return; } // un día sin dato corta la línea: no se inventa
      d += `${abierto ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`; abierto = true;
    });
    return d;
  };
  let c = '';
  ys.forEach((v) => { c += `<line class="rejilla" x1="${m.l}" x2="${ancho - m.r}" y1="${y(v)}" y2="${y(v)}"/><text class="eje" x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${formatoY(v)}</text>`; });
  // marcas del eje x: primer día de cada mes, o cada 7 días si el rango es corto
  serie.forEach((p, i) => {
    const mensual = serie.length <= 24 && serie.length > 1 && diasEntreIso(serie[0].fecha, serie[1].fecha) >= 28;
    const corto = serie.length <= 45;
    if (mensual) { const paso = Math.ceil(30 / Math.max(1, x(1) - x(0))); if (i % paso === 0) c += `<text class="eje" x="${x(i)}" y="${alto - 8}" text-anchor="middle">${mesCorto(+p.fecha.slice(5, 7))}</text>`; return; }
    if ((corto && i % 7 === 0) || (!corto && p.fecha.endsWith('-01'))) c += `<text class="eje" x="${x(i)}" y="${alto - 8}" text-anchor="middle">${corto ? fechaCorta(p.fecha) : mesCorto(+p.fecha.slice(5, 7))}</text>`;
  });
  if (meta != null) c += `<line class="meta" x1="${m.l}" x2="${ancho - m.r}" y1="${y(meta)}" y2="${y(meta)}"/><text class="rotulo-meta" x="${ancho - m.r + 6}" y="${y(meta) + 4}">meta ${formatoY(meta)}</text>`;
  eventos.forEach((e) => {
    const i = serie.findIndex((p) => p.fecha === e.fecha);
    if (i < 0) return;
    c += `<line class="evento" x1="${x(i)}" x2="${x(i)}" y1="${m.t}" y2="${alto - m.b}"/><text class="rotulo-evento" x="${x(i) + 4}" y="${m.t + 10}">${esc(e.texto)}</text>`;
  });
  if (previa) c += `<path class="serie-previa" d="${camino(previa)}"/>`;
  c += `<path class="serie-1" d="${camino(serie)}"/>`;
  serie.forEach((p, i) => { if (p.valor != null) c += `<circle class="punto-oculto" cx="${x(i)}" cy="${y(p.valor)}" r="3" data-fecha="${p.fecha}" data-valor="${p.valor}"/>`; });
  const ult = [...serie].reverse().find((p) => p.valor != null);
  const iu = serie.lastIndexOf(ult);
  c += `<circle class="punto-final" cx="${x(iu)}" cy="${y(ult.valor)}" r="4"/><text class="rotulo-final" x="${x(iu) + 8}" y="${y(ult.valor) + 4}">${formatoY(ult.valor)}</text>`;
  if (previa) {
    const up = [...previa].reverse().find((p) => p.valor != null);
    if (up) { let yp = y(up.valor) + 4; const ya = y(ult.valor) + 4; if (Math.abs(yp - ya) < 14) yp = yp >= ya ? ya + 14 : ya - 14; c += `<text class="rotulo-previo" x="${x(previa.lastIndexOf(up)) + 8}" y="${yp}">${formatoY(up.valor)}</text>`; }
  }
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Small multiples con eje común ─────────────────────────
export function pequenosMultiplos({ paneles, ancho = 200, alto = 90, formatoY = compacto }) {
  const max = Math.max(...paneles.flatMap((p) => p.serie.map((s) => s.valor ?? 0)));
  const ys = marcas(max, 2);
  return `<div class="multiplos">${paneles.map((p) => {
    const m = { t: 6, r: 36, b: 4, l: 4 };
    const x = lineal(0, p.serie.length - 1, m.l, ancho - m.r);
    const y = lineal(0, ys[ys.length - 1], alto - m.b, m.t);
    let d = '', ab = false;
    p.serie.forEach((s, i) => { if (s.valor == null) { ab = false; return; } d += `${ab ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.valor).toFixed(1)}`; ab = true; });
    const u = p.serie[p.serie.length - 1];
    const c = `<line class="rejilla" x1="${m.l}" x2="${ancho - m.r}" y1="${y(0)}" y2="${y(0)}"/><path class="serie-1" d="${d}"/>` +
      `<circle class="punto-final" cx="${x(p.serie.length - 1)}" cy="${y(u.valor)}" r="3" data-valor="${u.valor}"/>` +
      `<text class="rotulo-final" x="${x(p.serie.length - 1) + 6}" y="${y(u.valor) + 4}">${formatoY(u.valor)}</text>`;
    return `<figure class="multiplo"><figcaption><span class="nombre">${esc(p.nombre)}</span><span class="cambio ${p.tono || ''}">${esc(p.cambio || '')}</span></figcaption>${svg(ancho, alto, c, p.nombre)}</figure>`;
  }).join('')}</div>`;
}

// ───────────────────────── Dumbbell: antes contra ahora ─────────────────────────
export function dumbbell({ filas, formato = (v) => porcentaje(v), max, etiqueta, ancho = 640, rotuloA = 'antes', rotuloB = 'ahora' }) {
  const fila = 30, m = { t: 24, r: 70, b: 8, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
  const alto = m.t + filas.length * fila + m.b;
  const tope = max ?? Math.max(...filas.flatMap((f) => [f.a, f.b]));
  const x = lineal(0, marcas(tope, 4).at(-1), m.l, ancho - m.r);
  let c = `<text class="eje" x="${m.l}" y="12">${esc(rotuloA)} <tspan class="leyenda-b">● ${esc(rotuloB)}</tspan></text>`;
  filas.forEach((f, i) => {
    const cy = m.t + i * fila + fila / 2;
    const sube = f.b >= f.a;
    c += `<text class="rotulo-fila" x="${m.l - 10}" y="${cy + 4}" text-anchor="end">${esc(recortar(f.nombre, m.l))}<title>${esc(f.nombre)}</title></text>`;
    c += `<line class="rejilla" x1="${m.l}" x2="${ancho - m.r}" y1="${cy}" y2="${cy}"/>`;
    c += `<line class="dumbbell ${f.tono || ''}" x1="${x(f.a)}" x2="${x(f.b)}" y1="${cy}" y2="${cy}"/>`;
    c += `<circle class="punto-previo" cx="${x(f.a)}" cy="${cy}" r="5" data-valor="${f.a}"/>`;
    c += `<circle class="punto-actual" cx="${x(f.b)}" cy="${cy}" r="6" data-valor="${f.b}"/>`;
    c += `<text class="rotulo-valor" x="${x(Math.max(f.a, f.b)) + 10}" y="${cy + 4}">${formato(f.b)}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Slope chart: dos momentos, una escala ─────────────────────────
export function pendiente({ filas, formato = compacto, etiqueta, rotuloA, rotuloB, ancho = 420, alto = 300, resaltar = [] }) {
  const m = { t: 30, r: 150, b: 16, l: 150 };
  const tope = Math.max(...filas.flatMap((f) => [f.a, f.b]));
  const y = lineal(0, tope, alto - m.b, m.t);
  const xa = m.l, xb = ancho - m.r;
  let c = `<text class="eje" x="${xa}" y="14" text-anchor="middle">${esc(rotuloA)}</text><text class="eje" x="${xb}" y="14" text-anchor="middle">${esc(rotuloB)}</text>`;
  // separa rótulos que chocan: empuja hacia abajo de a 14 px
  const empuja = (vals) => { const o = vals.map((v, i) => ({ v, i })).sort((p, q) => p.v - q.v); for (let k = 1; k < o.length; k++) if (o[k].v < o[k - 1].v + 14) o[k].v = o[k - 1].v + 14; return o.sort((p, q) => p.i - q.i).map((p) => p.v); };
  const la = empuja(filas.map((f) => y(f.a))), lb = empuja(filas.map((f) => y(f.b)));
  filas.forEach((f, i) => {
    const r = resaltar.includes(f.nombre);
    c += `<line class="${r ? 'pendiente-resaltada' : 'pendiente'}" x1="${xa}" y1="${y(f.a)}" x2="${xb}" y2="${y(f.b)}"/>`;
    c += `<circle class="${r ? 'punto-actual' : 'punto-previo'}" cx="${xa}" cy="${y(f.a)}" r="4" data-valor="${f.a}"/><circle class="${r ? 'punto-actual' : 'punto-previo'}" cx="${xb}" cy="${y(f.b)}" r="4" data-valor="${f.b}"/>`;
    c += `<text class="${r ? 'rotulo-fila fuerte' : 'rotulo-fila'}" x="${xa - 8}" y="${la[i] + 4}" text-anchor="end">${esc(f.nombre)} ${formato(f.a)}</text>`;
    c += `<text class="${r ? 'rotulo-fila fuerte' : 'rotulo-fila'}" x="${xb + 8}" y="${lb[i] + 4}">${formato(f.b)} ${esc(f.nombre)}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Bump chart: ranking que cambia ─────────────────────────
// series: [{nombre, rangos:[1..n por semana], propia:bool}]; semanas: [iso]
export function bump({ series, semanas, etiqueta, ancho = 640, alto = 240 }) {
  const n = series.length, m = { t: 16, r: 120, b: 24, l: 30 };
  const x = lineal(0, semanas.length - 1, m.l, ancho - m.r);
  const y = lineal(1, n, m.t, alto - m.b);
  let c = '';
  for (let r = 1; r <= n; r++) c += `<text class="eje" x="${m.l - 10}" y="${y(r) + 4}" text-anchor="end">${r}</text>`;
  semanas.forEach((s, i) => { if (i % 4 === 0) c += `<text class="eje" x="${x(i)}" y="${alto - 6}" text-anchor="middle">${fechaCorta(s)}</text>`; });
  series.forEach((s) => {
    const d = s.rangos.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r).toFixed(1)}`).join('');
    c += `<path class="${s.propia ? 'bump-propia' : 'bump'}" d="${d}"/>`;
    s.rangos.forEach((r, i) => { c += `<circle class="${s.propia ? 'punto-actual' : 'punto-bump'}" cx="${x(i)}" cy="${y(r)}" r="${s.propia ? 4 : 3}" data-valor="${r}"/>`; });
    const ul = s.rangos.at(-1);
    c += `<text class="${s.propia ? 'rotulo-fila fuerte' : 'rotulo-fila'}" x="${x(semanas.length - 1) + 10}" y="${y(ul) + 4}">${esc(s.nombre)}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Mapa de calor hora × día ─────────────────────────
// matriz[dia 0..6][hora]; filas = días, columnas = horas
export function calorHoraDia({ matriz, horas, etiqueta, ancho = 640, formato = numero }) {
  const m = { t: 22, r: 8, b: 8, l: 76 };
  const cw = (ancho - m.l - m.r) / horas.length, ch = 24;
  const alto = m.t + 7 * ch + m.b;
  const max = Math.max(...matriz.flat());
  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  let c = '';
  horas.forEach((h, j) => { if (h % 3 === 0) c += `<text class="eje" x="${m.l + j * cw + cw / 2}" y="14" text-anchor="middle">${h} h</text>`; });
  matriz.forEach((fila, i) => {
    c += `<text class="rotulo-fila" x="${m.l - 8}" y="${m.t + i * ch + ch / 2 + 4}" text-anchor="end">${dias[i]}</text>`;
    fila.forEach((v, j) => {
      const paso = Math.min(6, Math.floor((v / max) * 7)); // 7 escalones de un solo tono
      c += `<rect class="celda sec-${paso}" x="${m.l + j * cw + 1}" y="${m.t + i * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="2" data-valor="${v}"><title>${dias[i]} ${horas[j]} h: ${formato(v)}</title></rect>`;
    });
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Calendario de un año (día como celda) ─────────────────────────
export function calendario({ dias, etiqueta, ancho = 760, formato = numero }) {
  // dias: [{fecha, valor, diaSemana, semana}] semana = índice de columna
  const cols = Math.max(...dias.map((d) => d.semana)) + 1;
  const m = { t: 18, l: 30 }, celda = Math.min(13, (ancho - m.l) / cols);
  const alto = m.t + 7 * celda + 4;
  const vals = dias.map((d) => d.valor).filter((v) => v != null);
  const max = Math.max(...vals);
  let c = '';
  ['l', '', 'm', '', 'v', '', 'd'].forEach((t, i) => { if (t) c += `<text class="eje" x="${m.l - 6}" y="${m.t + i * celda + celda - 2}" text-anchor="end">${t}</text>`; });
  let ultimoRotulo = -99;
  dias.forEach((d) => {
    if (d.fecha.endsWith('-01') && (d.semana - ultimoRotulo) * celda >= 26 && (ultimoRotulo = d.semana) >= 0) c += `<text class="eje" x="${m.l + d.semana * celda}" y="12">${mesCorto(+d.fecha.slice(5, 7))}</text>`;
    const cls = d.valor == null ? 'celda sin-dato' : `celda sec-${Math.min(6, Math.floor((d.valor / max) * 7))}`;
    c += `<rect class="${cls}" x="${m.l + d.semana * celda}" y="${m.t + d.diaSemana * celda}" width="${celda - 1.5}" height="${celda - 1.5}" rx="1.5" data-fecha="${d.fecha}" data-valor="${d.valor ?? ''}"><title>${d.fecha}: ${formato(d.valor)}</title></rect>`;
  });
  return svg(m.l + cols * celda + 4, alto, c, etiqueta);
}

// ───────────────────────── Bullet graph (Few 2013) ─────────────────────────
// bandas: [{hasta, nombre}] en escala; valor; marca (meta o valor anterior)
export function bala({ filas, max, formato = (v) => soles(v), etiqueta, ancho = 640, menosEsMejor = true }) {
  const fila = 40, m = { t: 8, r: 80, b: 22, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
  const alto = m.t + filas.length * fila + m.b;
  const x = lineal(0, max, m.l, ancho - m.r);
  let c = '';
  marcas(max, 4).forEach((v) => { c += `<text class="eje" x="${x(v)}" y="${alto - 6}" text-anchor="middle">${formato(v)}</text>`; });
  filas.forEach((f, i) => {
    const cy = m.t + i * fila;
    let desde = 0;
    f.bandas.forEach((b, k) => { c += `<rect class="banda b-${k}" x="${x(desde)}" y="${cy + 4}" width="${x(Math.min(b.hasta, max)) - x(desde)}" height="${fila - 14}"/>`; desde = b.hasta; });
    const pasa = menosEsMejor == null ? false : menosEsMejor ? f.valor > f.meta : f.valor < f.meta;
    c += `<rect class="${pasa ? 'barra-empeora' : 'barra-valor'}" x="${x(0)}" y="${cy + 12}" width="${x(f.valor) - x(0)}" height="${fila - 30}" data-valor="${f.valor}"/>`;
    c += `<line class="marca-meta" x1="${x(f.meta)}" x2="${x(f.meta)}" y1="${cy + 6}" y2="${cy + fila - 12}" data-valor="${f.meta}"/>`;
    c += `<text class="rotulo-fila" x="${m.l - 10}" y="${cy + fila / 2 + 1}" text-anchor="end">${esc(recortar(f.nombre, m.l))}</text>`;
    c += `<text class="${pasa ? 'rotulo-valor empeora' : 'rotulo-valor'}" x="${x(Math.max(f.valor, f.meta)) + 8}" y="${cy + fila / 2 + 1}">${formato(f.valor)}${pasa ? ' ▲ sobre meta' : ''}</text>`;
    if (f.rotuloMarca) c += `<text class="nota" x="${x(f.meta)}" y="${cy + fila - 2}" text-anchor="middle">${esc(f.rotuloMarca)}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Barras horizontales ordenadas, con período anterior ─────────────────────────
export function barras({ filas, formato = numero, etiqueta, ancho = 640, resaltar = null }) {
  const fila = 28, m = { t: 6, r: filas.some((f) => f.nota) ? 150 : 70, b: 6, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
  const alto = m.t + filas.length * fila + m.b;
  const max = Math.max(...filas.flatMap((f) => [f.valor, f.previo ?? 0]));
  const x = lineal(0, max, m.l, ancho - m.r);
  let c = '';
  filas.forEach((f, i) => {
    const cy = m.t + i * fila;
    const r = resaltar === f.nombre;
    c += `<text class="rotulo-fila ${r ? 'fuerte' : ''}" x="${m.l - 10}" y="${cy + fila / 2 + 4}" text-anchor="end">${esc(recortar(f.nombre, m.l))}</text>`;
    if (f.valor > 0) c += `<rect class="${r ? 'barra-acento' : 'barra'}" x="${x(0)}" y="${cy + 6}" width="${x(f.valor) - x(0)}" height="${fila - 12}" rx="2" data-valor="${f.valor}"/>`;
    if (f.previo != null) c += `<line class="marca-previa" x1="${x(f.previo)}" x2="${x(f.previo)}" y1="${cy + 3}" y2="${cy + fila - 3}" data-valor="${f.previo}"/>`;
    c += `<text class="rotulo-valor" x="${x(Math.max(f.valor, f.previo ?? 0)) + 8}" y="${cy + fila / 2 + 4}">${formato(f.valor)}${f.nota ? `<tspan class="nota"> · ${esc(f.nota)}</tspan>` : ''}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Franja de proporción (partes de un todo) ─────────────────────────
export function franja({ partes, etiqueta, ancho = 640, formato = (p) => porcentaje(p), leyenda = false }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const alto = 64;
  let x0 = 0, c = '';
  partes.forEach((p, i) => {
    const w = (p.valor / total) * ancho;
    c += `<rect class="parte p-${i}" x="${x0 + (i ? 1 : 0)}" y="26" width="${Math.max(0, w - (i ? 1 : 0))}" height="22" data-valor="${p.valor}"/>`;
    if (w > 70) c += `<text class="rotulo-fila" x="${x0 + 2}" y="18">${esc(p.nombre)} ${formato((p.valor / total) * 100)}</text>`;
    x0 += w;
  });
  const pct = mayorRestoLocal(partes.map((p) => p.valor));
  return svg(ancho, alto, c, etiqueta) + (leyenda ? `<ul class="leyenda">${partes.map((p, i) => `<li><span class="muestra p-${i}"></span>${esc(p.nombre)} <b data-valor="${pct[i]}">${porcentaje(pct[i])}</b></li>`).join('')}</ul>` : '');
}
// solo para rotular: el reparto oficial lo hace la capa de cálculo; acá se reusa el mismo método
function mayorRestoLocal(v) { const s = v.reduce((a, b) => a + b, 0); const e = v.map((x) => (x / s) * 100); const b = e.map(Math.floor); let r = 100 - b.reduce((a, c) => a + c, 0); e.map((x, i) => [x - Math.floor(x), i]).sort((a, c) => c[0] - a[0]).forEach(([, i]) => { if (r > 0) { b[i]++; r--; } }); return b; }

// ───────────────────────── Dispersión con rótulo directo ─────────────────────────
export function dispersion({ puntos, fx, fy, rx, ry, refX, refY, etiqueta, ancho = 560, alto = 340, resaltar = [] }) {
  const m = { t: 18, r: 110, b: 34, l: 50 };
  const xs = marcas(Math.max(...puntos.map((p) => p.x)), 4), ys = marcas(Math.max(...puntos.map((p) => p.y)), 4, Math.min(0, ...puntos.map((p) => p.y)));
  const x = lineal(xs[0], xs.at(-1), m.l, ancho - m.r), y = lineal(ys[0], ys.at(-1), alto - m.b, m.t);
  let c = '';
  ys.forEach((v) => { c += `<line class="rejilla" x1="${m.l}" x2="${ancho - m.r}" y1="${y(v)}" y2="${y(v)}"/><text class="eje" x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${fy(v)}</text>`; });
  xs.forEach((v) => { c += `<text class="eje" x="${x(v)}" y="${alto - 16}" text-anchor="middle">${fx(v)}</text>`; });
  c += `<text class="eje" x="${ancho - m.r}" y="${alto - 2}" text-anchor="end">${esc(rx)} →</text><text class="eje" x="${m.l}" y="10">↑ ${esc(ry)}</text>`;
  if (refX != null) c += `<line class="referencia" x1="${x(refX)}" x2="${x(refX)}" y1="${m.t}" y2="${alto - m.b}"/>`;
  if (refY != null) c += `<line class="referencia" x1="${m.l}" x2="${ancho - m.r}" y1="${y(refY)}" y2="${y(refY)}"/>`;
  puntos.forEach((p) => {
    const r = resaltar.includes(p.nombre);
    c += `<circle class="${r ? 'punto-actual' : 'punto-disp'}" cx="${x(p.x)}" cy="${y(p.y)}" r="${r ? 6 : 5}" data-x="${p.x}" data-y="${p.y}"/>`;
    c += `<text class="rotulo-fila ${r ? 'fuerte' : ''}" x="${x(p.x) + 9}" y="${y(p.y) + 4}">${esc(p.nombre)}</text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Etapas de cohorte (barras desde base común) ─────────────────────────
export function etapas({ filas, etiqueta, ancho = 640 }) {
  const fila = 40, m = { t: 6, r: Math.min(160, Math.round(ancho * 0.36)), b: 6, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
  const alto = m.t + filas.length * fila + m.b;
  const x = lineal(0, filas[0].valor, m.l, ancho - m.r);
  let c = '';
  filas.forEach((f, i) => {
    const cy = m.t + i * fila;
    c += `<text class="rotulo-fila" x="${m.l - 10}" y="${cy + fila / 2 + 4}" text-anchor="end">${esc(recortar(f.nombre, m.l))}</text>`;
    c += `<rect class="${i === filas.length - 1 ? 'barra-acento' : 'barra'}" x="${x(0)}" y="${cy + 8}" width="${Math.max(1, x(f.valor) - x(0))}" height="${fila - 16}" rx="2" data-valor="${f.valor}"/>`;
    const tasa = i ? ` · ${porcentaje((f.valor / filas[i - 1].valor) * 100, f.valor / filas[i - 1].valor < 0.1 ? 1 : 0)} de la anterior` : '';
    c += `<text class="rotulo-valor" x="${x(f.valor) + 8}" y="${cy + fila / 2 + 4}">${numero(f.valor)}<tspan class="nota">${tasa}</tspan></text>`;
  });
  return svg(ancho, alto, c, etiqueta);
}

// ───────────────────────── Retícula de 100 (método del mayor resto) ─────────────────────────
export function reticula({ partes, etiqueta, lado = 18 }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const exactos = partes.map((p) => (p.valor / total) * 100);
  const cuadros = exactos.map(Math.floor);
  const resto = 100 - cuadros.reduce((a, b) => a + b, 0);
  exactos.map((e, i) => [e - Math.floor(e), i]).sort((a, b) => b[0] - a[0]).slice(0, resto).forEach(([, i]) => { cuadros[i] += 1; });
  let c = '', k = 0;
  const clase = (i) => (i === 0 ? 'p-0' : `g-${i}`);
  cuadros.forEach((n, i) => { for (let j = 0; j < n; j++, k++) c += `<rect class="parte ${clase(i)}" x="${(k % 10) * lado}" y="${Math.floor(k / 10) * lado}" width="${lado - 3}" height="${lado - 3}" rx="2"/>`; });
  return svg(10 * lado, 10 * lado, c, etiqueta) + `<ul class="leyenda">${partes.map((p, i) => `<li><span class="muestra ${i === 0 ? 'p-0' : 'g-' + i}"></span>${esc(p.nombre)} <b data-valor="${cuadros[i]}">${cuadros[i]}</b> de cada 100</li>`).join('')}</ul>`;
}

// ───────────────────────── Teselas de distritos ─────────────────────────
// teselas: [{nombre, col, fila, valor, cambio}]; una tesela por distrito, todas del mismo tamaño
export function teselas({ items, etiqueta, lado = 74, formato = numero }) {
  const cols = Math.max(...items.map((t) => t.col)) + 1, filas = Math.max(...items.map((t) => t.fila)) + 1;
  const max = Math.max(...items.map((t) => t.valor ?? 0));
  let c = '';
  items.forEach((t) => {
    const x = t.col * lado, y = t.fila * lado;
    const paso = t.valor == null ? null : Math.min(6, Math.floor((t.valor / max) * 7));
    c += `<rect class="${paso == null ? 'celda sin-dato' : 'celda sec-' + paso}" x="${x + 2}" y="${y + 2}" width="${lado - 4}" height="${lado - 4}" rx="4" data-valor="${t.valor ?? ''}"/>`;
    const claro = paso != null && paso >= 4;
    c += `<text class="tesela-nombre ${claro ? 'sobre-oscuro' : ''}" x="${x + 8}" y="${y + 20}">${esc(t.corto || t.nombre)}</text>`;
    c += `<text class="tesela-valor ${claro ? 'sobre-oscuro' : ''}" x="${x + 8}" y="${y + 42}">${formato(t.valor)}</text>`;
    if (t.cambio != null) c += `<text class="tesela-cambio ${claro ? 'sobre-oscuro' : ''}" x="${x + 8}" y="${y + 60}">${variacion(t.cambio)}</text>`;
  });
  return svg(cols * lado, filas * lado, c, etiqueta);
}

// ───────────────────────── Aluvial: canal → destino, de una cohorte cerrada ─────────────────────────
// origenes: [{nombre, destinos:{id:n}}]; destinos: [{id, nombre}]. Cada cinta es un conteo real de la cohorte.
export function aluvial({ origenes, destinos, etiqueta, ancho = 640, alto = 300 }) {
  const m = { t: 8, b: 8 }, nodoW = 10, hueco = 8;
  const colIzq = Math.min(130, ancho * 0.28), colDer = ancho - Math.min(170, ancho * 0.36);
  const total = origenes.reduce((s, o) => s + Object.values(o.destinos).reduce((a, b) => a + b, 0), 0);
  const util = alto - m.t - m.b - hueco * (Math.max(origenes.length, destinos.length) - 1);
  const k = util / total;
  let c = '';
  // nodos de origen
  let y = m.t; const yo = origenes.map((o, i) => { const h = Object.values(o.destinos).reduce((a, b) => a + b, 0) * k; const r = { y, h, cursor: y }; y += h + hueco; return r; });
  y = m.t; const totD = destinos.map((d) => origenes.reduce((s, o) => s + (o.destinos[d.id] || 0), 0));
  const yd = destinos.map((d, j) => { const h = totD[j] * k; const r = { y, h, cursor: y }; y += h + hueco; return r; });
  origenes.forEach((o, i) => {
    destinos.forEach((d, j) => {
      const n = o.destinos[d.id] || 0; if (!n) return;
      const h = n * k, y0 = yo[i].cursor, y1 = yd[j].cursor; yo[i].cursor += h; yd[j].cursor += h;
      const x0 = colIzq + nodoW, x1 = colDer, xm = (x0 + x1) / 2;
      c += `<path class="cinta ${d.id === 'alta' ? 'cinta-alta' : ''}" d="M${x0},${y0}C${xm},${y0} ${xm},${y1} ${x1},${y1}L${x1},${y1 + h}C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}Z" data-valor="${n}"><title>${esc(o.nombre)} → ${esc(d.nombre)}: ${numero(n)}</title></path>`;
    });
  });
  origenes.forEach((o, i) => { c += `<rect class="nodo" x="${colIzq}" y="${yo[i].y}" width="${nodoW}" height="${Math.max(1, yo[i].h)}"/><text class="rotulo-fila" x="${colIzq - 8}" y="${yo[i].y + yo[i].h / 2 + 4}" text-anchor="end">${esc(o.nombre)}</text>`; });
  destinos.forEach((d, j) => { c += `<rect class="${d.id === 'alta' ? 'nodo nodo-alta' : 'nodo'}" x="${colDer}" y="${yd[j].y}" width="${nodoW}" height="${Math.max(1, yd[j].h)}"/><text class="rotulo-fila ${d.id === 'alta' ? 'fuerte' : ''}" x="${colDer + nodoW + 8}" y="${yd[j].y + yd[j].h / 2 + 4}">${esc(d.nombre)} ${numero(totD[j])}</text>`; });
  return svg(ancho, alto, c, etiqueta);
}
