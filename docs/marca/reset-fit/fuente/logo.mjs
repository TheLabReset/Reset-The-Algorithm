// Logo de Reset Fit v2: «la pesa con vida». Geometría exacta y logotipo convertido a trazos.
// Uso: node logo.mjs <carpeta de salida>   (necesita fontkit y @fontsource/bricolage-grotesque instalados junto al script)
//
// Por qué una pesa y no una persona (docs/marca/reset-fit/investigacion/03): una figura humana con un aro de torso
// se lee como un cuerpo grande; una pesa rusa se espera redonda. El asa entera asegura que se lea como objeto;
// los brazos finos y la cara mínima la vuelven personaje. El logo es estable; el humor vive en las poses.
import * as fontkit from 'fontkit';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2];
mkdirSync(OUT + '/poses', { recursive: true });
const f = (n) => +n.toFixed(2);

export const COLORES = { rojo: '#f5332a', menta: '#3ee6b0', tinta: '#121318', cal: '#f4f4f1', blanco: '#ffffff', pizarra: '#4a4d55', niebla: '#a3a6ad' };
const C = COLORES;

// ── Geometría, grilla de 100 × 100 ──
export const G = { cx: 50, cy: 60, r: 28, base: 84, asa: { medio: 20, alto: 13, pie: 44, trazo: 9 }, brazo: 6, mano: 5.2, giro: -6 };
const dyBase = G.base - G.cy, dxBase = Math.sqrt(G.r ** 2 - dyBase ** 2);
const CAMPANA = `M${f(G.cx - dxBase)} ${G.base}A${G.r} ${G.r} 0 1 1 ${f(G.cx + dxBase)} ${G.base}Z`;
const ASA = `M${50 - G.asa.medio} ${G.asa.pie}C${50 - G.asa.medio - 3} ${G.asa.alto} ${50 + G.asa.medio + 3} ${G.asa.alto} ${50 + G.asa.medio} ${G.asa.pie}`;
const trazo = (d, w = G.brazo, color = 'currentColor') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const punto = (x, y, r = G.mano, color = 'currentColor') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;

// Caras: siempre del color «cara» (calado sobre la pesa)
const CARAS = {
  feliz: punto(41.5, 60, 3.5, 'var(--cara)') + punto(58.5, 60, 3.5, 'var(--cara)') + trazo('M44.5 68.5Q50 74 55.5 68.5', 3.2, 'var(--cara)'),
  dormida: trazo('M37.5 61Q41.5 64.5 45.5 61M54.5 61Q58.5 64.5 62.5 61', 3.2, 'var(--cara)') + trazo('M47.5 70.5Q50 72 52.5 70.5', 2.8, 'var(--cara)'),
  concentrada: punto(41.5, 60, 3.5, 'var(--cara)') + punto(58.5, 60, 3.5, 'var(--cara)') + trazo('M45.5 70H54.5', 3.2, 'var(--cara)'),
  guino: trazo('M37.5 60.5Q41.5 57 45.5 60.5', 3.2, 'var(--cara)') + punto(58.5, 60, 3.5, 'var(--cara)') + trazo('M44.5 68.5Q50 74 55.5 68.5', 3.2, 'var(--cara)'),
  serena: trazo('M37.5 60Q41.5 63 45.5 60M54.5 60Q58.5 63 62.5 60', 3.2, 'var(--cara)') + trazo('M45.5 69Q50 72.5 54.5 69', 3, 'var(--cara)'),
  duda: punto(41.5, 60, 3.5, 'var(--cara)') + punto(58.5, 60, 3.5, 'var(--cara)') + `<circle cx="50" cy="70" r="2.6" fill="none" stroke="var(--cara)" stroke-width="2.6"/>`,
  minima: punto(41, 61, 4.6, 'var(--cara)') + punto(59, 61, 4.6, 'var(--cara)'),
};

// Brazos: salen de los costados de la pesa (y = 60)
const BRAZOS = {
  celebra: trazo('M23.5 60Q11 49 12 32M76.5 60Q90 47 87 26') + punto(12, 30) + punto(87, 24),
  saluda: trazo('M23.5 62Q14 70 15 80M76.5 60Q90 47 86 28') + punto(15, 81) + punto(86, 26),
  abajo: trazo('M23.5 62Q14 70 15 80M76.5 62Q86 70 85 80') + punto(15, 81) + punto(85, 81),
  estira: trazo('M23.5 62Q14 70 15 80M76.5 56Q82 34 80 8') + punto(15, 81) + punto(80, 6),
  arriba: trazo('M23.5 58Q12 30 33 3M76.5 58Q88 30 67 3') + punto(34, 2) + punto(66, 2), // sostiene algo por encima del asa
  medita: trazo('M23.5 64Q13 68 7 76M76.5 64Q87 68 93 76') + `<circle cx="6" cy="79" r="4.6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="94" cy="79" r="4.6" fill="none" stroke="currentColor" stroke-width="3"/>`,
  piensa: trazo('M23.5 62Q14 70 15 80M76.5 60Q93 54 86 38') + punto(85, 36),
  sostiene: trazo('M23.5 62Q14 70 15 80M76.5 60Q90 50 88 38') + punto(88, 36),
  minima: trazo('M23 60Q11 49 13 32M77 60Q90 47 87 27', 8.5) + punto(13, 29, 6.4) + punto(87, 24, 6.4),
};

// Objetos de las poses: en el color «acento» (tinta sobre fondo claro, menta sobre fondo oscuro). Nunca tocan la pesa
// ni las manos: siempre queda aire de fondo entre el objeto y el rojo (lo verifica la prueba de la guía).
const A = 'var(--acento)';
const EXTRAS = {
  zetas: `<g fill="none" stroke="${A}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M76 0H86L76 10H86"/><path d="M90 -10H96L90 -4H96"/></g>`,
  cafe: `<g fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M80 26H94V36Q94 42 87 42Q80 42 80 36Z"/><path d="M94 29Q99 29 99 33Q99 37 94 37"/><path d="M84 21Q82 18 84 15M90 21Q88 18 90 15"/></g>`,
  pesita: `<g transform="translate(34 -33) scale(0.32)"><path d="${ASA}" fill="none" stroke="${A}" stroke-width="12" stroke-linecap="round"/><path d="${CAMPANA}" fill="${A}"/></g>`,
  movimiento: `<g fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"><path d="M-6 50H1M-9 60H-2M-5 70H2"/></g>`,
  piernas: trazo('M40 83Q36 92 28 93M60 83Q68 88 72 96', 6) + punto(27, 93, 4.2) + punto(73, 96, 4.2),
  tomatodo: `<g fill="none" stroke="${A}" stroke-width="3" stroke-linejoin="round"><rect x="84" y="1" width="11" height="21" rx="3.5"/><path d="M86 1V-4H93V1M84 9H95"/></g>`,
  lentes: `<g fill="var(--cara)"><rect x="34" y="55" width="14" height="9" rx="4"/><rect x="52" y="55" width="14" height="9" rx="4"/></g>` + trazo('M48 58.5H52', 2.4, 'var(--cara)'),
  puntos: `<g fill="${A}"><circle cx="80" cy="20" r="3"/><circle cx="89" cy="14" r="3"/><circle cx="98" cy="8" r="3"/></g>`,
  pregunta: `<g fill="none" stroke="${A}" stroke-width="3.6" stroke-linecap="round"><path d="M80 14Q80 6 87 6Q94 6 94 13Q94 18 87 20V25"/></g><circle cx="87" cy="32" r="2.4" fill="${A}"/>`,
  hoja: `<g fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"><path d="M50 -6Q42 0 50 8Q58 0 50 -6ZM50 8V-1"/></g>`,
};

const pesa = (cara, brazos, extras = '', giro = G.giro) => `<g transform="rotate(${giro} 50 60)"><path d="${ASA}" fill="none" stroke="currentColor" stroke-width="${G.asa.trazo}" stroke-linecap="round"/><path d="${CAMPANA}" fill="currentColor"/>${BRAZOS[brazos]}${CARAS[cara]}</g>${extras}`;

// ── Las 12 poses: el humor del sistema. Cada una con su uso. ──
export const POSES = [
  { id: 'celebra', nombre: 'Celebra', uso: 'La firma. Logros: la tercera semana seguida, la primera clase', dibujo: pesa('feliz', 'celebra') },
  { id: 'hola', nombre: 'Hola', uso: 'Bienvenida en recepción, primer correo, primera visita a la app', dibujo: pesa('guino', 'saluda') },
  { id: 'siesta', nombre: 'Siesta', uso: 'Sede cerrada, fuera de horario, domingo por la tarde', dibujo: pesa('dormida', 'abajo', EXTRAS.zetas, 8) },
  { id: 'madruga', nombre: 'Madruga', uso: 'Clases de las 5 a. m., mensajes temprano', dibujo: pesa('concentrada', 'abajo', EXTRAS.cafe) },
  { id: 'calienta', nombre: 'Calienta', uso: 'Antes de clase, recordatorios de estiramiento', dibujo: pesa('concentrada', 'estira', '', -14) },
  { id: 'corre', nombre: 'Corre', uso: 'Cardio, retos de pasos, clases de ciclo', dibujo: pesa('feliz', 'celebra', EXTRAS.piernas + EXTRAS.movimiento, -14) },
  { id: 'levanta', nombre: 'Levanta', uso: 'Fuerza, sala de pesas: la pesa levanta a su sobrina', dibujo: pesa('concentrada', 'arriba', EXTRAS.pesita, 0) },
  { id: 'medita', nombre: 'Medita', uso: 'Yoga, vuelta a la calma, descanso activo', dibujo: pesa('serena', 'medita', EXTRAS.hoja, 0) },
  { id: 'hidrata', nombre: 'Hidrata', uso: 'Tomatodo, verano, avisos de agua en la sala', dibujo: pesa('feliz', 'sostiene', EXTRAS.tomatodo) },
  { id: 'verano', nombre: 'Verano', uso: 'Campañas de temporada, horarios de verano', dibujo: pesa('feliz', 'celebra', EXTRAS.lentes) },
  { id: 'piensa', nombre: 'Piensa', uso: 'Cargando, «un momento», respuestas que tardan', dibujo: pesa('concentrada', 'piensa', EXTRAS.puntos) },
  { id: 'duda', nombre: 'Duda', uso: 'Errores, página no encontrada, formularios incompletos', dibujo: pesa('duda', 'abajo', EXTRAS.pregunta, 4) },
];
export const MINIMA = pesa('minima', 'minima');
// Encuadre común de las poses: la unión de las cajas de las 12 poses (medida con getBBox) más 5 unidades por los trazos
export const ENCUADRE = { x: -14, y: -32, w: 120, h: 137 };
const vbE = `${ENCUADRE.x} ${ENCUADRE.y} ${ENCUADRE.w} ${ENCUADRE.h}`;

// ── Logotipo: «reset fit» en Bricolage Grotesque 800 (OFL), a trazos ──
const fuente = fontkit.openSync(new URL('./node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff', import.meta.url).pathname);
function texto(t, tam, tracking = 0) {
  const run = fuente.layout(t);
  const e = tam / fuente.unitsPerEm;
  let x = 0, d = '';
  run.glyphs.forEach((g, i) => { d += g.path.scale(e, -e).translate(x + run.positions[i].xOffset * e, 0).toSVG(); x += run.positions[i].xAdvance * e + tracking; });
  return { d, ancho: x - tracking, x: fuente.xHeight * e, asc: fuente.capHeight * e };
}
const palabra = texto('reset fit', 100, -2);

// Caja del símbolo canónico y de la versión mínima, medidas con getBBox en Chromium (incluyen el giro y las manos)
const caja = { x0: 2.7, y0: 14.6, x1: 94.5, y1: 88.4 };
const cajaMinima = { x0: 2.4, y0: 13.3, x1: 95.7, y1: 88.4 };
const cxM = (cajaMinima.x0 + cajaMinima.x1) / 2, cyM = (cajaMinima.y0 + cajaMinima.y1) / 2, wM = cajaMinima.x1 - cajaMinima.x0;
const simW = caja.x1 - caja.x0, simH = caja.y1 - caja.y0;
const estilo = (pesaColor, cara, acento) => `style="color:${pesaColor};--cara:${cara};--acento:${acento}"`;
const svg = (w, h, cuerpo, t = 'Reset Fit') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${t}"><title>${t}</title>${cuerpo}</svg>\n`;
// Los SVG sueltos no heredan variables CSS de una página: se resuelven a colores fijos al escribir el archivo
const fijar = (s, pesaColor, cara, acento) => s.replaceAll('currentColor', pesaColor).replaceAll('var(--cara)', cara).replaceAll('var(--acento)', acento);

const P = POSES[0].dibujo;
const reserva = 12; // área de protección: la altura del asa sobre la pesa (12 unidades de la grilla)
// Monocromo: la cara se cala con una máscara (sin color de cara, deja ver el fondo)
const calado = (dibujo, id) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="250" height="250"><rect x="-50" y="-50" width="250" height="250" fill="#fff"/>${fijar(dibujo, '#fff', '#000', '#000')}</mask></defs><g mask="url(#${id})">${fijar(dibujo, 'currentColor', 'currentColor', 'currentColor')}</g>`;
const conCara = (dibujo, cp, cc, id) => (cc === 'none' ? calado(dibujo, id) : fijar(dibujo, cp, cc, cc));
const soloSimbolo = (cp, cc) => svg(simW + 2 * reserva, simH + 2 * reserva, conCara(`<g transform="translate(${reserva - caja.x0} ${reserva - caja.y0})">${P}</g>`, cp, cc, 'rf-cara-s'));

// Horizontal: la pesa mide 1,9 veces la altura de x; la palabra se apoya en la base de la pesa
const e = (palabra.x * 1.9) / simH;
const hueco = palabra.x * 0.38;
const horiz = { w: simW * e + hueco + palabra.ancho + 2 * reserva * e, h: Math.max(simH * e, palabra.asc) + 2 * reserva * e };
const baseY = reserva * e + (G.base - caja.y0) * e;
const horizontal = (cp, cc, ct) => svg(horiz.w, horiz.h, conCara(`<g transform="translate(${f(reserva * e)} ${f(reserva * e)}) scale(${f(e)}) translate(${-caja.x0} ${-caja.y0})">${P}</g>`, cp, cc, 'rf-cara-h') + `<path fill="${ct}" transform="translate(${f(reserva * e + simW * e + hueco)} ${f(baseY)})" d="${palabra.d}"/>`);

// Apilada
const eA = (palabra.ancho * 0.42) / simW;
const sepA = palabra.x * 0.42;
const apil = { w: palabra.ancho + 2 * reserva * eA, h: simH * eA + sepA + palabra.asc + 2 * reserva * eA };
const apilada = (cp, cc, ct) => svg(apil.w, apil.h, fijar(`<g transform="translate(${f(reserva * eA + (palabra.ancho - simW * eA) / 2)} ${f(reserva * eA)}) scale(${f(eA)}) translate(${-caja.x0} ${-caja.y0})">${P}</g>`, cp, cc, cc) + `<path fill="${ct}" transform="translate(${f(reserva * eA)} ${f(reserva * eA + simH * eA + sepA + palabra.asc)})" d="${palabra.d}"/>`);

// Ícono de app y favicon (versión mínima: brazos más gruesos, sin sonrisa)
// Ícono: la pesa ocupa el 68 % del ancho, centrada por su caja medida (margen de seguridad de 16 % por lado)
const icono = (fondo, cp, cc) => svg(1024, 1024, `<rect width="1024" height="1024" fill="${fondo}"/>` + fijar(`<g transform="translate(512 512) scale(${f((1024 * 0.68) / wM)}) translate(${f(-cxM)} ${f(-cyM)})">${MINIMA}</g>`, cp, cc, cc));
const favicon = svg(100, 100, fijar(`<g transform="translate(50 50) scale(${f(96 / wM)}) translate(${f(-cxM)} ${f(-cyM)})">${MINIMA}</g>`, C.rojo, C.cal, C.cal));

const archivos = {
  'reset-fit-simbolo.svg': soloSimbolo(C.rojo, C.cal),
  'reset-fit-simbolo-negativo.svg': soloSimbolo(C.rojo, C.tinta),
  'reset-fit-simbolo-monocromo.svg': soloSimbolo('currentColor', 'none'),
  'reset-fit-horizontal.svg': horizontal(C.rojo, C.cal, C.tinta),
  'reset-fit-horizontal-negativo.svg': horizontal(C.rojo, C.tinta, C.cal),
  'reset-fit-horizontal-monocromo.svg': horizontal('currentColor', 'none', 'currentColor'),
  'reset-fit-apilada.svg': apilada(C.rojo, C.cal, C.tinta),
  'reset-fit-apilada-negativo.svg': apilada(C.rojo, C.tinta, C.cal),
  'reset-fit-icono.svg': icono(C.rojo, C.cal, C.rojo),
  'reset-fit-favicon.svg': favicon,
};
for (const [n, s] of Object.entries(archivos)) writeFileSync(`${OUT}/${n}`, s);
for (const p of POSES) {
  const poseSvg = (cara, acento) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbE}" role="img" aria-label="Reset Fit · ${p.nombre}"><title>Reset Fit · ${p.nombre}</title>${fijar(p.dibujo, C.rojo, cara, acento)}</svg>\n`;
  writeFileSync(`${OUT}/poses/${p.id}.svg`, poseSvg(C.cal, C.tinta));
  writeFileSync(`${OUT}/poses/${p.id}-negativo.svg`, poseSvg(C.tinta, C.menta));
}
writeFileSync(`${OUT}/geometria.json`, JSON.stringify({ G, caja, cajaMinima, encuadre: ENCUADRE, simW, simH, palabra: palabra.d, palabraAncho: palabra.ancho, alturaX: palabra.x, CAMPANA, ASA, horiz, apil, e, reserva, poses: POSES.map(({ id, nombre, uso, dibujo }) => ({ id, nombre, uso, dibujo })), minima: MINIMA }, null, 1));
console.log(`símbolo ${simW} × ${simH} · altura x ${f(palabra.x)} · horizontal ${f(horiz.w)} × ${f(horiz.h)} · ${POSES.length} poses`);
