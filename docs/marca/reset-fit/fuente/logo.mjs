// Logo de Reset Fit: geometría exacta y logotipo convertido a trazos (no depende de fuentes instaladas).
// Uso: node logo.mjs <carpeta de salida>
import * as fontkit from 'fontkit';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const f = (n) => +n.toFixed(2);
const pol = (cx, cy, r, a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];

// ── Símbolo, grilla de 100 × 100 ──
// Un anillo abierto arriba (el ciclo que vuelve a empezar) cuyos extremos se abren como brazos en alto,
// y una cabeza en la abertura. Se lee como persona que celebra y como pesa rusa.
export const G = { cy: 62, r: 28, trazo: 12, medioHueco: 40, brazo: 16, desvio: 6, cabeza: { cx: 50, cy: 24, r: 8 } };
const [x0, y0] = pol(50, G.cy, G.r, G.medioHueco), [x1, y1] = pol(50, G.cy, G.r, 360 - G.medioHueco);
const [ax, ay] = pol(50, G.cy, G.r + G.brazo, G.medioHueco - G.desvio), [bx, by] = pol(50, G.cy, G.r + G.brazo, 360 - G.medioHueco + G.desvio);
export const D_CUERPO = `M${f(ax)} ${f(ay)}L${f(x0)} ${f(y0)}A${G.r} ${G.r} 0 1 1 ${f(x1)} ${f(y1)}L${f(bx)} ${f(by)}`;
const simbolo = (color) => `<path d="${D_CUERPO}" fill="none" stroke="${color}" stroke-width="${G.trazo}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${G.cabeza.cx}" cy="${G.cabeza.cy}" r="${G.cabeza.r}" fill="${color}"/>`;
// Caja real del símbolo (con medio trazo de redondeo): se mide para centrar y para el área de reserva
const caja = { x0: Math.min(ax, bx) - G.trazo / 2, x1: Math.max(ax, bx) + G.trazo / 2, y0: Math.min(ay, by, G.cabeza.cy - G.cabeza.r) - G.trazo / 2, y1: G.cy + G.r + G.trazo / 2 };
caja.y0 = Math.min(caja.y0, G.cabeza.cy - G.cabeza.r);

// ── Logotipo: RESET FIT en Barlow Condensed 800 (OFL), a trazos ──
const fuente = fontkit.openSync(new URL('./node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff', import.meta.url).pathname);
function texto(t, tam, tracking = 0) {
  const run = fuente.layout(t);
  const e = tam / fuente.unitsPerEm;
  let x = 0, d = '';
  run.glyphs.forEach((g, i) => { d += g.path.scale(e, -e).translate(x + run.positions[i].xOffset * e, 0).toSVG(); x += run.positions[i].xAdvance * e + tracking; });
  return { d, ancho: x - tracking, cap: fuente.capHeight * e };
}
const palabra = texto('RESET FIT', 100, 5);
const cap = palabra.cap;

// ── Composiciones ──
const svg = (w, h, cuerpo, t = 'Reset Fit') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${t}"><title>${t}</title>${cuerpo}</svg>\n`;
const R = G.cabeza.r; // área de reserva: el radio de la cabeza, a escala del símbolo
const simW = caja.x1 - caja.x0, simH = caja.y1 - caja.y0;
const soloSimbolo = (c) => svg(simW + 2 * R, simH + 2 * R, `<g transform="translate(${f(R - caja.x0)} ${f(R - caja.y0)})">${simbolo(c)}</g>`);

// Horizontal: el símbolo mide 1,6 veces la altura de mayúscula; la palabra queda centrada en el aro
const e = (cap * 1.6) / simH;
const hueco = cap * 0.42;
const centroAro = (G.cy - caja.y0) * e;
const horiz = { w: simW * e + hueco + palabra.ancho + 2 * R * e, h: simH * e + 2 * R * e };
const horizontal = (cs, ct) => svg(horiz.w, horiz.h,
  `<g transform="translate(${f(R * e)} ${f(R * e)})"><g transform="scale(${f(e)}) translate(${f(-caja.x0)} ${f(-caja.y0)})">${simbolo(cs)}</g><path fill="${ct}" transform="translate(${f(simW * e + hueco)} ${f(centroAro + cap / 2)})" d="${palabra.d}"/></g>`);

// Apilada: símbolo centrado sobre la palabra
const eA = (palabra.ancho * 0.36) / simW;
const sepA = cap * 0.5;
const apil = { w: palabra.ancho + 2 * R * eA, h: simH * eA + sepA + cap + 2 * R * eA };
const apilada = (cs, ct) => svg(apil.w, apil.h,
  `<g transform="translate(${f(R * eA)} ${f(R * eA)})"><g transform="translate(${f((palabra.ancho - simW * eA) / 2)} 0) scale(${f(eA)}) translate(${f(-caja.x0)} ${f(-caja.y0)})">${simbolo(cs)}</g><path fill="${ct}" transform="translate(0 ${f(simH * eA + sepA + cap)})" d="${palabra.d}"/></g>`);

// Ícono de app: símbolo en negativo sobre el rojo, en un cuadrado de 1024 con esquinas del sistema operativo (las pone la plataforma)
const icono = (fondo, c) => svg(1024, 1024, `<rect width="1024" height="1024" fill="${fondo}"/><g transform="translate(512 512) scale(6.4) translate(${f(-(caja.x0 + simW / 2))} ${f(-(caja.y0 + simH / 2))})">${simbolo(c)}</g>`, 'Reset Fit');

export const COLORES = { rojo: '#ff4a2b', rojoTexto: '#c42c15', tinta: '#121318', cal: '#f4f4f1', arena: '#e6ded2', pizarra: '#575a63', niebla: '#a3a6ad' };
const C = COLORES;
const archivos = {
  'reset-fit-simbolo.svg': soloSimbolo(C.rojo),
  'reset-fit-simbolo-monocromo.svg': soloSimbolo('currentColor'),
  'reset-fit-horizontal.svg': horizontal(C.rojo, C.tinta),
  'reset-fit-horizontal-negativo.svg': horizontal(C.rojo, C.cal),
  'reset-fit-horizontal-monocromo.svg': horizontal('currentColor', 'currentColor'),
  'reset-fit-apilada.svg': apilada(C.rojo, C.tinta),
  'reset-fit-apilada-negativo.svg': apilada(C.rojo, C.cal),
  'reset-fit-icono.svg': icono(C.rojo, C.cal),
};
for (const [n, s] of Object.entries(archivos)) writeFileSync(`${OUT}/${n}`, s);
writeFileSync(`${OUT}/geometria.json`, JSON.stringify({ G, caja, simW, simH, cap, palabra: palabra.d, palabraAncho: palabra.ancho, D_CUERPO, horiz, apil, e }, null, 1));
console.log(`símbolo ${f(simW)} × ${f(simH)} · mayúscula ${f(cap)} · horizontal ${f(horiz.w)} × ${f(horiz.h)} (proporción ${f(horiz.w / horiz.h)})`);
