// Arma la guía de marca de Reset Fit v2 en un solo HTML, con los SVG en línea.
// Uso: node armar-guia.mjs <carpeta con la salida de logo.mjs> <archivo html>
// Ningún contraste se escribe a mano: se mide acá (WCAG 2.x) y con simulación de deuteranopía (Machado 2009).
import { readFileSync, writeFileSync } from 'node:fs';

const D = process.argv[2].replace(/\/?$/, '/');
const geo = JSON.parse(readFileSync(D + 'geometria.json', 'utf8'));
const leer = (n) => readFileSync(D + n, 'utf8').replace(/<\?xml[^>]*>/, '').trim();
const interior = (n) => leer(n).replace(/<\/?svg[^>]*>|<title>[^<]*<\/title>/g, '');
const f = (n) => +n.toFixed(2);
const C = { rojo: '#f5332a', menta: '#3ee6b0', tinta: '#121318', cal: '#f4f4f1', blanco: '#ffffff', pizarra: '#4a4d55', niebla: '#a3a6ad', rojoTexto: '#b51e17' };

// ── Medición de color ──
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (l) => 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
const ratio = (a, b) => { const [x, y] = [a, b].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const contraste = (a, b) => ratio(lum(rgb(a).map(lin)), lum(rgb(b).map(lin)));
const MD = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]];
const deut = (h) => { const l = rgb(h).map(lin); return MD.map((r) => Math.min(1, Math.max(0, r[0] * l[0] + r[1] * l[1] + r[2] * l[2]))); };
const contrasteDeut = (a, b) => ratio(lum(deut(a)), lum(deut(b)));
const coma = (n, d = 1) => n.toFixed(d).replace('.', ',');
const num = (n) => String(n).replace('.', ',').replace('-', '−'); // número tal cual, con coma decimal y signo menos

// ── Piezas de dibujo ──
// Sin argumentos, la pose hereda --cara y --acento del tema (no se redeclaran: una variable que se nombra a sí misma queda inválida)
const pose = (id, tam = 120, { cara, acento, pesa = 'var(--rf-rojo)' } = {}) => {
  const p = geo.poses.find((x) => x.id === id);
  const estilo = `color:${pesa}` + (cara ? `;--cara:${cara}` : '') + (acento ? `;--acento:${acento}` : '');
  const E = geo.encuadre;
  return `<svg class="pose" viewBox="${E.x} ${E.y} ${E.w} ${E.h}" width="${tam}" height="${f((tam * E.h) / E.w)}" role="img" aria-label="La pesa: ${p.nombre}" style="${estilo}">${p.dibujo}</svg>`;
};
const poseG = (id, x, y, s, { cara = C.cal, acento = C.tinta, pesa = C.rojo } = {}) => {
  const p = geo.poses.find((q) => q.id === id);
  return `<g transform="translate(${x} ${y}) scale(${s})" style="color:${pesa};--cara:${cara};--acento:${acento}">${p.dibujo}</g>`;
};
const palabra = (x, y, alto, color) => `<path transform="translate(${x} ${y}) scale(${f(alto / geo.alturaX)})" d="${geo.palabra}" fill="${color}"/>`;
const horizontalG = (x, y, ancho, negativo = false) => `<g transform="translate(${x} ${y}) scale(${f(ancho / geo.horiz.w)})">${interior(negativo ? 'reset-fit-horizontal-negativo.svg' : 'reset-fit-horizontal.svg')}</g>`;
const minimaG = (x, y, s, pesa = C.rojo, cara = C.cal) => `<g transform="translate(${x} ${y}) scale(${s})" style="color:${pesa};--cara:${cara}">${geo.minima}</g>`;

// ── Construcción del símbolo ──
let grilla = '';
for (let i = 0; i <= 100; i += 10) grilla += `<line x1="${i}" y1="0" x2="${i}" y2="100" class="g-linea"/><line x1="0" y1="${i}" x2="100" y2="${i}" class="g-linea"/>`;
const G = geo.G;
const construccion = `<svg viewBox="-6 -8 150 120" role="img" aria-label="Construcción del símbolo sobre una grilla de 100 módulos">${grilla}
<g style="color:var(--rf-rojo);--cara:var(--rf-cal)" opacity="0.88" transform="rotate(${-G.giro} 50 60)">${geo.poses[0].dibujo}</g>
<g class="g-cota"><circle cx="50" cy="${G.cy}" r="${G.r}" fill="none" stroke-dasharray="1.5 1.5"/><circle cx="50" cy="${G.cy}" r="0.9"/>
<line x1="50" y1="${G.cy}" x2="104" y2="${G.cy}" stroke-dasharray="0.6 0.8"/><text x="106" y="${G.cy + 1.3}">círculo r ${G.r}</text>
<line x1="${50 - 26}" y1="${G.base}" x2="104" y2="${G.base}" stroke-dasharray="1 1"/><text x="106" y="${G.base + 1.3}">base plana, y ${G.base}</text>
<line x1="62" y1="22" x2="104" y2="12"/><text x="106" y="13.3">asa, trazo ${G.asa.trazo}</text>
<line x1="90" y1="44" x2="104" y2="38"/><text x="106" y="39.3">brazo, trazo ${num(G.brazo)}</text>
<line x1="92.5" y1="24" x2="104" y2="24" stroke-dasharray="0.6 0.8"/><text x="106" y="25.3">mano, r ${num(G.mano)}</text>
<text x="106" y="96">dibujo sin giro;</text><text x="106" y="101">en la firma, ${num(G.giro)}°</text></g>
${[0, 50, 100].map((v) => `<text class="g-num" x="${v}" y="-3" text-anchor="middle">${v}</text>`).join('')}
</svg>`;

// ── Usos incorrectos (dibujados mal a propósito) ──
const P0 = geo.poses[0].dibujo;
const malSvg = (cuerpo, etiqueta) => `<svg viewBox="-10 -10 120 120" role="img" aria-label="${etiqueta}">${cuerpo}</svg>`;
const mal = [
  { t: 'No se estira ni se aplasta', s: malSvg(`<g transform="translate(-14 18) scale(1.3 0.72)" style="color:${C.rojo};--cara:${C.cal}">${P0}</g>`, 'Símbolo estirado') },
  { t: 'No se le da cuerpo de persona', d: 'La pesa no lleva torso ni piernas fijas: el gesto es de una pesa, no de un cuerpo.', s: malSvg(`<g style="color:${C.rojo};--cara:${C.cal}">${P0}<path d="M37 84 Q35 94 31 101 M63 84 Q65 94 69 101" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"/></g>`, 'Símbolo con piernas') },
  { t: 'No cambia de color', s: malSvg(`<g style="color:#6f42c1;--cara:${C.cal}">${P0}</g>`, 'Símbolo en violeta') },
  { t: 'No va sobre rojo y menta juntos', d: `En deuteranopía, rojo y menta quedan a ${coma(contrasteDeut(C.rojo, C.menta))}:1.`, s: malSvg(`<rect x="-10" y="-10" width="120" height="120" fill="${C.menta}"/><g style="color:${C.rojo};--cara:${C.cal}">${P0}</g>`, 'Símbolo rojo sobre menta') },
  { t: 'No lleva sombras ni contornos', s: malSvg(`<g style="color:${C.tinta};--cara:${C.tinta}" transform="translate(4 4)" opacity="0.35">${P0}</g><g style="color:${C.rojo};--cara:${C.cal}">${P0}</g>`, 'Símbolo con sombra') },
  { t: 'No se gira más de lo que ya está', s: malSvg(`<g transform="rotate(38 50 55)" style="color:${C.rojo};--cara:${C.cal}">${P0}</g>`, 'Símbolo girado') },
];

// ── Aplicaciones ──
// Reglas que siguen todas: márgenes iguales a los cuatro lados de cada pieza, nada a menos de 24 px de un borde,
// la firma siempre con su símbolo, y ningún texto editorial impreso dentro de la pieza (va en el pie).
const T = (x, y, t, { tam = 24, peso = 400, color = C.tinta, fam = 'texto', ancla = 'start' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${ancla}" font-family="${fam === 'titulo' ? 'Bricolage Grotesque, sans-serif' : 'Atkinson Hyperlegible Next, sans-serif'}" font-weight="${peso}" font-size="${tam}" fill="${color}">${t}</text>`;
// Firma horizontal dibujada con el símbolo completo (la versión mínima es solo para ícono y favicon).
// «alto» es la altura de x de la palabra; el símbolo mide 1,9 veces eso, igual que en reset-fit-horizontal.svg.
const firma = (x, y, alto, color, pesa = C.rojo, cara = C.cal) => {
  const k = geo.caja, s = (alto * 1.9) / (k.y1 - k.y0);
  return `${poseG('celebra', f(x - k.x0 * s), f(y - geo.G.base * s), f(s), { pesa, cara, acento: cara })}${palabra(f(x + (k.x1 - k.x0) * s + alto * 0.38), y, alto, color)}`;
};

const anchoFirma = (alto) => ((geo.caja.x1 - geo.caja.x0) * alto * 1.9) / (geo.caja.y1 - geo.caja.y0) + alto * 0.38 + (geo.palabraAncho * alto) / geo.alturaX;
const firmaCentrada = (cx, y, alto, color, pesa, cara) => firma(f(cx - anchoFirma(alto) / 2), y, alto, color, pesa, cara);

const fachada = `<svg viewBox="0 0 1200 640" role="img" aria-label="Fachada de la sede Los Olivos de noche">
<defs><linearGradient id="fa-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07080b"/><stop offset="1" stop-color="#11131a"/></linearGradient>
<linearGradient id="fa-luz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3140"/><stop offset="1" stop-color="#1c2029"/></linearGradient></defs>
<rect width="1200" height="640" fill="url(#fa-cielo)"/>
<rect x="80" y="100" width="1040" height="440" fill="#191b22"/>
<rect x="80" y="100" width="1040" height="150" fill="${C.tinta}"/><rect x="80" y="246" width="1040" height="6" fill="${C.rojo}"/>
${firma(128, 210, 46, C.cal, C.rojo, C.tinta)}
${T(1072, 210, 'Los Olivos', { tam: 40, peso: 700, color: C.cal, fam: 'titulo', ancla: 'end' })}
<rect x="120" y="290" width="400" height="250" fill="url(#fa-luz)"/><rect x="680" y="290" width="400" height="250" fill="url(#fa-luz)"/>
<rect x="548" y="300" width="104" height="240" fill="#232733" stroke="#3a3f4c" stroke-width="4"/><line x1="600" y1="300" x2="600" y2="540" stroke="#3a3f4c" stroke-width="3"/>
<rect x="584" y="400" width="6" height="40" rx="3" fill="#8c919c"/><rect x="610" y="400" width="6" height="40" rx="3" fill="#8c919c"/>
${poseG('hola', 140, 322, 1.55, { acento: C.menta, cara: C.tinta })}
${T(318, 404, 'Ven como', { tam: 44, peso: 800, color: C.cal, fam: 'titulo' })}${T(318, 454, 'estés.', { tam: 44, peso: 800, color: C.menta, fam: 'titulo' })}
<rect x="712" y="330" width="336" height="170" rx="14" fill="${C.cal}"/>
${T(736, 370, 'Horario', { tam: 24, peso: 700 })}${T(736, 408, 'Lunes a viernes: 5:00 a 23:00', { tam: 20 })}${T(736, 440, 'Sábado y domingo: 7:00 a 19:00', { tam: 20 })}${T(736, 474, 'Feriados: 7:00 a 15:00', { tam: 18, color: C.pizarra })}
<rect x="1120" y="150" width="34" height="8" fill="#5b606c"/><rect x="1120" y="330" width="34" height="8" fill="#5b606c"/>
<rect x="1140" y="128" width="46" height="232" rx="10" fill="${C.rojo}"/>${minimaG(1143, 216, 0.42, C.cal, C.rojo)}
<rect x="0" y="540" width="1200" height="100" fill="#20232b"/><rect x="0" y="540" width="1200" height="6" fill="#2d313b"/>
</svg>`;

const senal = (titulo, lineas, id, fondo, tinta, acento, zona) => `<svg viewBox="0 0 420 560" role="img" aria-label="Señal de sala: ${titulo}">
<rect width="420" height="560" rx="18" fill="${fondo}"/>${poseG(id, 102, 54, 2.1, { cara: fondo, acento, pesa: C.rojo })}
${T(40, 344, titulo, { tam: 44, peso: 800, color: tinta, fam: 'titulo' })}
${lineas.map((l, i) => T(40, 392 + i * 34, l, { tam: 25, color: tinta })).join('')}
<line x1="40" y1="492" x2="380" y2="492" stroke="${tinta}" stroke-opacity="0.18" stroke-width="2"/>
${minimaG(36, 502, 0.36, C.rojo, fondo)}${T(380, 530, zona, { tam: 18, peso: 700, color: tinta, ancla: 'end' })}</svg>`;

// Salida: pictograma de evacuación sin pesa ni humor (en obra se usa el de la norma técnica vigente)
const salida = `<svg viewBox="0 0 420 560" role="img" aria-label="Señal de salida">
<rect width="420" height="560" rx="18" fill="#0a7d3b"/><rect x="36" y="40" width="348" height="320" rx="12" fill="none" stroke="#fff" stroke-width="6"/>
<rect x="268" y="96" width="78" height="210" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
<circle cx="196" cy="118" r="23" fill="#fff"/>
<g fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">
<path d="M186 152 L162 232"/><path d="M182 166 L218 186 L242 168"/><path d="M182 166 L150 190 L132 220"/>
<path d="M162 232 L204 256 L214 300"/><path d="M162 232 L134 268 L96 272"/></g>
<path d="M72 330 H160 M136 308 L162 330 L136 352" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
${T(40, 448, 'SALIDA', { tam: 64, peso: 800, color: '#fff' })}${T(40, 496, 'Ruta de evacuación', { tam: 26, color: '#fff' })}</svg>`;

// Polos: frente y espalda. El logo nunca va del mismo color que la tela.
const siluetaPolo = 'M130 40 C150 58 250 58 270 40 L342 68 L382 150 L330 174 L312 142 L312 420 C240 434 160 434 88 420 L88 142 L70 174 L18 150 L58 68 Z';
const polo = (base, rib, x0, espalda) => `<g transform="translate(${x0} 0)">
<path d="${siluetaPolo}" fill="${base}"/>
<path d="M140 44 Q200 ${espalda ? 60 : 80} 260 44" fill="none" stroke="${rib}" stroke-width="9" stroke-linecap="round"/>
<path d="M30 140 L66 156 M370 140 L334 156" stroke="${rib}" stroke-width="7" stroke-linecap="round"/>`;
const polos = (rol, base, letra, rib, pesa) => `<svg viewBox="0 0 860 460" role="img" aria-label="Polo del equipo, ${rol}: frente y espalda">
${polo(base, rib, 20, false)}${minimaG(228, 104, 0.4, pesa, base)}${T(248, 162, rol, { tam: 16, peso: 700, color: letra, ancla: 'middle' })}</g>
${polo(base, rib, 440, true)}
${palabra(f(200 - (geo.palabraAncho * 18) / geo.alturaX / 2), 104, 18, letra)}${T(200, 250, rol, { tam: Math.min(58, Math.floor(180 / (rol.length * 0.56))), peso: 800, color: letra, fam: 'titulo', ancla: 'middle' })}</g>
${T(220, 452, 'Frente', { tam: 16, color: C.pizarra, ancla: 'middle' })}${T(640, 452, 'Espalda', { tam: 16, color: C.pizarra, ancla: 'middle' })}</svg>`;

const tarjeta = `<svg viewBox="0 0 856 540" role="img" aria-label="Tarjeta de socia">
<defs><clipPath id="tarjeta-corte"><rect width="856" height="540" rx="34"/></clipPath></defs>
<rect width="856" height="540" rx="34" fill="${C.rojo}"/>
<g clip-path="url(#tarjeta-corte)">${poseG('celebra', 548, 190, 3.05, { cara: C.rojo, pesa: C.cal, acento: C.tinta })}</g>
${firma(56, 110, 34, C.tinta, C.tinta, C.rojo)}
${T(56, 404, 'Socia desde marzo de 2026', { tam: 24 })}
${T(56, 462, 'Nombre Apellido', { tam: 46, peso: 800, fam: 'titulo' })}
${T(56, 500, 'Todas las sedes', { tam: 20, color: C.tinta })}</svg>`;

// QR de muestra: módulos al azar con los tres cuadros de posición bien formados; no codifica nada
const qrMuestra = (x, y, lado, color) => {
  const n = 25, m = lado / n;
  let s = `<g transform="translate(${x} ${y})" fill="${color}" shape-rendering="crispEdges">`, a = 11;
  const enOjo = (i, j) => (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);
  const ojo = (i, j) => { const r = Math.max(Math.abs(i - 3), Math.abs(j - 3)); return r === 3 || r <= 1; };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    let lleno;
    if (enOjo(i, j)) { const ii = i >= n - 8 ? i - (n - 7) : i, jj = j >= n - 8 ? j - (n - 7) : j; lleno = ii >= 0 && jj >= 0 && ii < 7 && jj < 7 && ojo(ii, jj); }
    else { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; lleno = ((a >>> 16) & 1) === 1; } // entero de 32 bits: sin pérdida de precisión
    if (lleno) s += `<rect x="${f(j * m)}" y="${f(i * m)}" width="${f(m)}" height="${f(m)}"/>`;
  }
  return s + '</g>';
};
const billetera = `<svg viewBox="0 0 360 580" role="img" aria-label="Tarjeta en la billetera del celular, con QR de muestra">
<rect width="360" height="580" rx="26" fill="${C.tinta}"/>${firma(28, 64, 22, C.cal, C.rojo, C.tinta)}
${T(28, 118, 'Socia', { tam: 16, color: C.niebla })}${T(28, 150, 'Nombre Apellido', { tam: 28, peso: 800, color: C.cal, fam: 'titulo' })}
${T(28, 192, 'Próxima clase', { tam: 16, color: C.niebla })}${T(28, 220, 'Ciclo · jueves 19:00', { tam: 21, peso: 700, color: C.menta })}${T(28, 246, 'San Borja', { tam: 18, color: C.cal })}
<rect x="70" y="272" width="220" height="220" rx="14" fill="${C.cal}"/>${qrMuestra(88, 290, 184, C.tinta)}
${T(180, 528, 'QR de muestra: no lleva a ningún lado', { tam: 15, color: C.niebla, ancla: 'middle' })}</svg>`;

// App: barra de estado, contenido y barra de pestañas iguales en las tres pantallas
const icTab = {
  inicio: 'M-9 1 L0 -8 L9 1 V10 H-9 Z',
  clases: 'M-10 -6 H10 V9 H-10 Z M-10 -1 H10 M-5 -9 V-4 M5 -9 V-4',
  reservas: 'M-8 -9 H8 V10 L0 5 L-8 10 Z',
  perfil: 'M0 -9.5 A4.5 4.5 0 1 1 -0.01 -9.5 M-8.5 10 Q0 -1 8.5 10',
};
const barraTabs = (activa) => `<rect x="12" y="540" width="276" height="68" fill="#fff"/><line x1="12" y1="540" x2="288" y2="540" stroke="#dcdcd6"/>
${['inicio', 'clases', 'reservas', 'perfil'].map((k, i) => { const x = 46 + i * 69, on = k === activa; return `<g transform="translate(${x} 562)"><path d="${icTab[k]}" fill="none" stroke="${on ? C.tinta : C.niebla}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></g>${T(x, 594, k[0].toUpperCase() + k.slice(1), { tam: 11, peso: on ? 700 : 400, color: on ? C.tinta : C.pizarra, ancla: 'middle' })}`; }).join('')}`;
const telefono = (titulo, cuerpo, activa) => `<svg viewBox="0 0 300 620" role="img" aria-label="Pantalla de la app: ${titulo}">
<defs><clipPath id="pantalla-${activa}"><rect x="12" y="12" width="276" height="596" rx="32"/></clipPath></defs>
<rect width="300" height="620" rx="42" fill="#0b0c10"/><g clip-path="url(#pantalla-${activa})"><rect x="12" y="12" width="276" height="596" fill="${C.cal}"/>
${T(40, 40, '7:42', { tam: 13, peso: 700 })}<rect x="246" y="30" width="22" height="11" rx="3" fill="none" stroke="${C.tinta}" stroke-width="1.5"/><rect x="248" y="32" width="15" height="7" rx="1.5" fill="${C.tinta}"/>
${cuerpo}${barraTabs(activa)}</g><rect x="110" y="22" width="80" height="22" rx="11" fill="#0b0c10"/></svg>`;
const appInicio = telefono('Inicio', `${firma(30, 92, 16, C.tinta)}
${T(30, 140, 'Hola, Nombre', { tam: 26, peso: 800, fam: 'titulo' })}${T(30, 166, 'Llevas 3 semanas seguidas.', { tam: 15, color: C.pizarra })}
<rect x="30" y="184" width="240" height="140" rx="18" fill="${C.tinta}"/>${poseG('celebra', 172, 198, 0.86, { cara: C.tinta, acento: C.menta })}
${T(50, 222, 'Tu racha', { tam: 14, color: C.niebla })}${T(50, 278, '3', { tam: 52, peso: 800, color: C.cal, fam: 'titulo' })}${T(50, 306, 'semanas: ya es costumbre', { tam: 14, color: C.cal })}
${T(30, 360, 'Próxima clase', { tam: 18, peso: 700, fam: 'titulo' })}
<rect x="30" y="374" width="240" height="72" rx="14" fill="#fff" stroke="#dcdcd6"/>${T(46, 404, 'Ciclo · jueves 19:00', { tam: 17, peso: 700 })}${T(46, 430, 'San Borja · quedan 4 bicis', { tam: 15, color: C.pizarra })}
<rect x="30" y="464" width="240" height="50" rx="25" fill="${C.rojo}"/>${T(150, 495, 'Reservar otra clase', { tam: 16, peso: 700, ancla: 'middle' })}`, 'inicio');
const appVacio = telefono('Sin reservas', `${T(30, 96, 'Mis reservas', { tam: 24, peso: 800, fam: 'titulo' })}
${poseG('siesta', 82, 160, 1.3)}
${T(150, 368, 'Nada por aquí todavía', { tam: 21, peso: 800, fam: 'titulo', ancla: 'middle' })}
${T(150, 398, 'La pesa aprovecha para dormir.', { tam: 15, color: C.pizarra, ancla: 'middle' })}${T(150, 420, 'Cuando reserves, aparece aquí.', { tam: 15, color: C.pizarra, ancla: 'middle' })}
<rect x="55" y="452" width="190" height="48" rx="24" fill="${C.tinta}"/>${T(150, 482, 'Ver clases de hoy', { tam: 16, peso: 700, color: C.cal, ancla: 'middle' })}`, 'reservas');
const appCargando = telefono('Cargando', `${T(30, 96, 'Clases', { tam: 24, peso: 800, fam: 'titulo' })}
${poseG('piensa', 86, 190, 1.2)}
${T(150, 394, 'Un momento', { tam: 21, peso: 800, fam: 'titulo', ancla: 'middle' })}${T(150, 424, 'Buscamos los horarios de tu sede.', { tam: 15, color: C.pizarra, ancla: 'middle' })}`, 'clases');

const post = `<svg viewBox="0 0 1080 1080" role="img" aria-label="Publicación cuadrada para redes">
<rect width="1080" height="1080" fill="${C.tinta}"/>${poseG('celebra', 600, 70, 4.2, { cara: C.tinta, acento: C.menta })}
${T(80, 640, 'Tres semanas', { tam: 104, peso: 800, color: C.cal, fam: 'titulo' })}${T(80, 750, 'seguidas.', { tam: 104, peso: 800, color: C.cal, fam: 'titulo' })}${T(80, 860, 'Ya es costumbre.', { tam: 104, peso: 800, color: C.menta, fam: 'titulo' })}
${firma(80, 1000, 30, C.cal, C.rojo, C.tinta)}</svg>`;
// Historia 9:16: lo importante queda entre los 250 px de arriba y los 340 de abajo que tapa la interfaz de la red
const historia = `<svg viewBox="0 0 1080 1920" role="img" aria-label="Historia vertical para redes">
<rect width="1080" height="1920" fill="${C.rojo}"/>${poseG('madruga', 250, 300, 5.6, { cara: C.rojo, pesa: C.tinta, acento: C.tinta })}
${T(90, 1030, '5:00 a. m.', { tam: 150, peso: 800, fam: 'titulo' })}
${T(90, 1156, 'La sede ya está', { tam: 92, peso: 800, fam: 'titulo' })}${T(90, 1260, 'despierta. Tú,', { tam: 92, peso: 800, fam: 'titulo' })}${T(90, 1364, 'cuando puedas.', { tam: 92, peso: 800, fam: 'titulo' })}
${firma(90, 1560, 40, C.tinta, C.tinta, C.rojo)}</svg>`;

const panel = `<svg viewBox="0 0 1200 760" role="img" aria-label="Panel en paradero con precio y condiciones visibles">
<rect width="1200" height="760" fill="#1d1f26"/><rect x="60" y="40" width="1080" height="640" rx="8" fill="${C.cal}"/>
${poseG('hola', 820, 92, 2.9)}
${T(110, 190, 'Primera clase', { tam: 80, peso: 800, fam: 'titulo' })}${T(110, 280, 'por nuestra cuenta.', { tam: 80, peso: 800, color: C.rojoTexto, fam: 'titulo' })}
${T(110, 360, 'Un coach te acompaña la primera semana.', { tam: 34 })}
<rect x="110" y="400" width="560" height="150" rx="16" fill="${C.tinta}"/>${T(140, 470, 'S/ 89 al mes', { tam: 58, peso: 800, color: C.cal, fam: 'titulo' })}${T(140, 518, 'Precio final con IGV · sin permanencia mínima', { tam: 23, color: C.cal })}
${T(110, 608, 'Sin matrícula hasta el 30 de noviembre de 2026 o hasta agotar 300 cupos.', { tam: 21, color: C.pizarra })}
${T(110, 638, 'Condiciones en la web. Precio de ejemplo: Reset Fit es una marca ficticia.', { tam: 21, color: C.pizarra })}
${firma(800, 520, 38, C.tinta)}</svg>`;

const toalla = `<svg viewBox="0 0 400 560" role="img" aria-label="Toalla de sala">
<rect x="50" y="20" width="300" height="520" rx="8" fill="${C.tinta}"/>
<rect x="50" y="40" width="300" height="8" fill="${C.menta}"/><rect x="50" y="56" width="300" height="8" fill="${C.menta}"/>
<rect x="50" y="476" width="300" height="8" fill="${C.menta}"/><rect x="50" y="492" width="300" height="8" fill="${C.menta}"/>
${poseG('verano', 130, 96, 1.55, { cara: C.tinta, acento: C.menta })}
${T(200, 320, 'Esta toalla', { tam: 30, peso: 800, color: C.cal, fam: 'titulo', ancla: 'middle' })}${T(200, 358, 'también descansa', { tam: 30, peso: 800, color: C.cal, fam: 'titulo', ancla: 'middle' })}${T(200, 396, 'entre series.', { tam: 30, peso: 800, color: C.menta, fam: 'titulo', ancla: 'middle' })}
${firmaCentrada(200, 448, 18, C.cal, C.rojo, C.tinta)}</svg>`;

const tomatodo = `<svg viewBox="0 0 400 560" role="img" aria-label="Tomatodo de 750 ml">
<path d="M176 8 Q200 -4 224 8" fill="none" stroke="${C.tinta}" stroke-width="8" stroke-linecap="round"/>
<rect x="150" y="14" width="100" height="44" rx="12" fill="${C.tinta}"/><rect x="132" y="54" width="136" height="24" rx="8" fill="${C.menta}"/>
<rect x="112" y="76" width="176" height="470" rx="48" fill="${C.rojo}"/>
${poseG('hidrata', 150, 114, 1.05, { cara: C.rojo, pesa: C.cal, acento: C.tinta })}
<g transform="translate(214 500) rotate(-90)">${palabra(0, 0, 26, C.tinta)}</g>
${[['750', 236], ['500', 336], ['250', 436]].map(([t, y]) => `<line x1="252" y1="${y}" x2="270" y2="${y}" stroke="${C.tinta}" stroke-width="3"/>${T(248, y + 6, t, { tam: 14, peso: 700, ancla: 'end' })}`).join('')}
</svg>`;

const bolsa = `<svg viewBox="0 0 400 580" role="img" aria-label="Bolsa de tela">
<path d="M118 150 Q118 52 168 52 Q190 52 190 150" fill="none" stroke="#d6d2c6" stroke-width="14"/><path d="M210 150 Q210 52 232 52 Q282 52 282 150" fill="none" stroke="#d6d2c6" stroke-width="14"/>
<rect x="60" y="140" width="280" height="420" rx="6" fill="#ece9e1"/>
${poseG('corre', 118, 196, 1.7, { acento: C.tinta })}
${T(200, 434, 'Voy, pero voy', { tam: 30, peso: 800, fam: 'titulo', ancla: 'middle' })}${T(200, 472, 'a mi ritmo.', { tam: 30, peso: 800, color: C.rojoTexto, fam: 'titulo', ancla: 'middle' })}
${firmaCentrada(200, 530, 16, C.tinta)}</svg>`;

// Stickers troquelados: el borde blanco sigue el contorno de la pose
const sticker = (id, giro, i) => `<svg viewBox="-34.5 -44 161 161" width="150" height="150" role="img" aria-label="Sticker: ${geo.poses.find((p) => p.id === id).nombre}" style="transform:rotate(${giro}deg)">
<defs><filter id="troquel-${i}" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="7" result="borde"/><feFlood flood-color="#fff"/><feComposite in2="borde" operator="in" result="blanco"/>
<feOffset in="borde" dy="3" result="sombra0"/><feFlood flood-color="#cfcbbf"/><feComposite in2="sombra0" operator="in" result="sombra"/><feMerge><feMergeNode in="sombra"/><feMergeNode in="blanco"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<g filter="url(#troquel-${i})">${poseG(id, 0, 0, 1)}</g></svg>`;
const stickers = `<div class="stickers">${['celebra', 'siesta', 'madruga', 'levanta', 'medita', 'verano'].map((id, i) => sticker(id, [-6, 4, -3, 5, -4, 3][i], i)).join('')}</div>`;

const correo = `<div class="correo"><div class="correo-cab">${leer('reset-fit-horizontal.svg')}</div>
<div class="correo-cuerpo">${pose('hola', 96, { cara: C.cal, acento: C.tinta })}<h4>Bienvenida, Nombre</h4><p>Tu primera clase es el <b>jueves a las 19:00 en San Borja</b>. Llega diez minutos antes: un coach te muestra la sala y te arma una rutina para tu primera semana.</p><p>Si algo cambia, reprograma desde la app. Sin multas.</p><p class="firma">El equipo de Reset Fit San Borja</p></div>
<p class="correo-pie">Reset Fit es una marca ficticia de demostración.</p></div>`;
const documento = `<div class="documento"><div class="doc-cab">${leer('reset-fit-horizontal.svg')}<span>Contrato de membresía</span></div>
<ol class="clausulas"><li><b>Precio mensual:</b> S/ 89, con IGV incluido.</li><li><b>Matrícula:</b> S/ 0 hasta el 30 de noviembre de 2026.</li><li><b>Permanencia mínima:</b> ninguna.</li><li><b>Cómo cancelar:</b> desde la app o en recepción, con efecto al cierre del mes en curso, sin penalidad.</li></ol></div>`;

// ── Tablas de color medidas ──
const pares = [
  ['Tinta sobre cal', C.tinta, C.cal, 'texto'], ['Cal sobre tinta', C.cal, C.tinta, 'texto'], ['Tinta sobre rojo', C.tinta, C.rojo, 'texto'],
  ['Rojo texto sobre cal', C.rojoTexto, C.cal, 'texto'], ['Menta sobre tinta', C.menta, C.tinta, 'texto'], ['Tinta sobre menta', C.tinta, C.menta, 'texto'],
  ['Pizarra sobre cal', C.pizarra, C.cal, 'texto'], ['Niebla sobre tinta', C.niebla, C.tinta, 'texto'],
  ['Rojo sobre cal (solo gráfico o titular grande)', C.rojo, C.cal, 'grafico'], ['Rojo sobre tinta (símbolo)', C.rojo, C.tinta, 'grafico'],
  ['Blanco sobre rojo', C.blanco, C.rojo, 'grande'], ['Menta sobre cal', C.menta, C.cal, 'no'], ['Rojo sobre menta', C.rojo, C.menta, 'no'],
];
const tablaColor = `<table class="tabla"><thead><tr><th scope="col">Combinación</th><th scope="col">Muestra</th><th scope="col" class="num">Contraste</th><th scope="col" class="num">Con deuteranopía</th><th scope="col">Uso</th></tr></thead><tbody>
${pares.map(([n, a, b, uso]) => { const c = contraste(a, b), d = contrasteDeut(a, b); const veredicto = uso === 'no' ? 'No se usa' : uso === 'grafico' ? (c >= 3 ? 'Gráficos y textos de 24 px o más' : 'No') : uso === 'grande' ? (c >= 3 ? 'Solo texto grande (24 px o más)' : 'No') : c >= 4.5 ? 'Texto de cualquier tamaño' : c >= 3 ? 'Solo texto grande' : 'No'; return `<tr><th scope="row">${n}</th><td><span class="par" style="background:${b};color:${a}">Aa</span></td><td class="num">${coma(c, 2)}:1</td><td class="num">${coma(d, 2)}:1</td><td>${veredicto}</td></tr>`; }).join('')}
</tbody></table>`;

// ── Tabla de voz (de la investigación 02) ──
const voz = [
  ['Entrena a tu ritmo', 'Sin excusas', 'Un mensaje que culpa va contra la motivación autónoma, la que predice que alguien siga viniendo (Teixeira 2012).'],
  ['Más fuerza para cargar las compras del mercado sin parar en cada esquina', 'Ponte en forma para el verano', 'Los marcos de apariencia generan más vergüenza corporal y rechazo al mensaje (Aubrey 2010; More 2023).'],
  ['Cada cuerpo entrena distinto', 'Cuerpo perfecto, cuerpazo', 'Meta y TikTok prohíben sugerir un cuerpo ideal o inferioridad por apariencia.'],
  ['Un coach arma tu rutina y la ajusta contigo cada mes', 'Baja 5 kilos en 30 días', 'Toda afirmación comprobable necesita prueba antes de publicarse (DL 1044, arts. 8.3 y 8.4).'],
  ['Tres semanas seguidas. Eso ya es costumbre.', '¿Otra vez faltaste?', 'Sentirse capaz predice más ejercicio; reconocer el avance pesa más que recordar la falta.'],
  ['Ven como estés', 'Que no te dé vergüenza tu cuerpo', 'La segunda frase da por hecho que habría que sentir vergüenza.'],
  ['¿Primera vez en un gimnasio? La primera semana te acompaña un coach', '¿Te sientes con sobrepeso?', 'Meta prohíbe frases que insinúan conocer la salud de quien lee.'],
  ['Más energía para tu chamba', 'Quema el pollo a la brasa del domingo', 'El ejercicio como castigo por comer está vetado en TikTok y va contra la voz.'],
  ['Tu avance: más repeticiones, mejor tiempo en 5 km', 'Tu avance: una talla menos', 'Hablar de lo que el cuerpo hace sube la apreciación de su función (Kilby y Mickelson 2025).'],
  ['S/ 89 al mes, precio final con IGV', 'Desde S/ 49* con la letra chica escondida', 'Precio total con tributos y condiciones de la promoción en cada anuncio (Ley 29571, arts. 4 y 14).'],
  ['Sin matrícula y sin permanencia mínima', 'No como otros, que te cobran hasta por respirar', 'La comparación con burla a un competidor es desleal (DL 1044, arts. 11 y 12).'],
  ['Moverte puede ayudarte a dormir mejor', 'Cura la ansiedad', 'Una promesa médica exige un sustento que un gimnasio no tiene.'],
];
const tablaVoz = `<table class="tabla"><thead><tr><th scope="col">Decimos</th><th scope="col">No decimos</th><th scope="col">Por qué</th></tr></thead><tbody>${voz.map(([a, b, c]) => `<tr><td class="si">${a}</td><td class="no">${b}</td><td>${c}</td></tr>`).join('')}</tbody></table>`;

const tonos = [
  ['Venta', 'Ven a probar una clase. Si te gusta, te quedas; si no, igual fue un buen jueves.'],
  ['Bienvenida', 'Ya tienes tu tarjeta. La primera semana te acompaña un coach.'],
  ['Recordatorio', 'Mañana a las 7:00 tienes Ciclo en San Borja. La bici 12 te espera.'],
  ['Logro', 'Tres semanas seguidas. Eso ya es costumbre.'],
  ['Cobro', 'El 1 de diciembre se cobra tu mensualidad de S/ 89 a la tarjeta que termina en 4821.'],
  ['Cancelación', 'Tu membresía queda activa hasta el 30 de noviembre. Si vuelves, tu historial te espera.'],
  ['Incidente', 'Hoy la sede Lince abre a las 9:00 por un corte de agua. Las sedes más cercanas son Jesús María y San Isidro.'],
];

const poses = `<div class="poses">${geo.poses.map((p) => `<figure class="pose-carta">${pose(p.id, 132)}<figcaption><b>${p.nombre}</b><span>${p.uso}</span></figcaption></figure>`).join('')}</div>`;

// ── Página ──
const fuentes = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Atkinson+Hyperlegible+Next:wght@400;700&display=swap';
const indice = [['estrategia', 'Estrategia'], ['voz', 'Voz'], ['logo', 'Logo'], ['color', 'Color'], ['tipografia', 'Tipografía'], ['pesa', 'La pesa y sus poses'], ['movimiento', 'Movimiento'], ['fotografia', 'Fotografía'], ['aplicaciones', 'Aplicaciones'], ['accesibilidad', 'Accesibilidad'], ['gestion', 'Archivos']];

const html = `<title>Reset Fit: guía de marca</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fuentes}">
<style>
:root {
  --rf-rojo: ${C.rojo}; --rf-rojo-texto: ${C.rojoTexto}; --rf-menta: ${C.menta}; --rf-tinta: ${C.tinta}; --rf-cal: ${C.cal}; --rf-blanco: ${C.blanco}; --rf-pizarra: ${C.pizarra}; --rf-niebla: ${C.niebla};
  --fondo: var(--rf-cal); --superficie: var(--rf-blanco); --texto: var(--rf-tinta); --texto-2: var(--rf-pizarra); --borde: #dcdcd6; --acento-texto: var(--rf-rojo-texto);
  --cara: var(--rf-cal); --acento: var(--rf-tinta); --linea-grilla: #c9c9c2;
  --f-titulo: 'Bricolage Grotesque', 'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif;
  --f-texto: 'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', Verdana, Arial, sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fondo: #0d0e12; --superficie: #17181e; --texto: var(--rf-cal); --texto-2: #b9bbc2; --borde: #2a2c33; --acento-texto: var(--rf-menta); --cara: var(--rf-tinta); --acento: var(--rf-menta); --linea-grilla: #34363e; color-scheme: dark; } }
:root[data-theme="dark"] { --fondo: #0d0e12; --superficie: #17181e; --texto: var(--rf-cal); --texto-2: #b9bbc2; --borde: #2a2c33; --acento-texto: var(--rf-menta); --cara: var(--rf-tinta); --acento: var(--rf-menta); --linea-grilla: #34363e; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--fondo); color: var(--texto); font: 400 17px/1.6 var(--f-texto); font-variant-numeric: tabular-nums; }
h1, h2, h3, h4 { font-family: var(--f-titulo); font-weight: 800; line-height: 1.05; margin: 0; text-wrap: balance; letter-spacing: -0.01em; }
p { margin: 0; text-wrap: pretty; max-width: 68ch; }
a { color: var(--acento-texto); }
.envoltura { max-width: 1240px; margin: 0 auto; padding-left: max(20px, env(safe-area-inset-left, 0px)); padding-right: max(20px, env(safe-area-inset-right, 0px)); }
.portada { background: var(--rf-tinta); color: var(--rf-cal); padding-block: 56px 64px; }
.portada .envoltura { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 32px; align-items: center; }
.portada .marca svg { width: min(100%, 560px); height: auto; }
.portada h1 { font-size: clamp(48px, 9vw, 120px); margin-top: 28px; }
.portada h1 em { font-style: normal; color: var(--rf-menta); }
.portada p { color: #c9cbd2; font-size: 19px; margin-top: 18px; }
.portada .pose-grande { justify-self: center; animation: salto 2.4s cubic-bezier(.3,1.4,.5,1) infinite; transform-origin: 50% 90%; }
.portada .pose-grande .pose { width: min(80vw, 360px); height: auto; }
@keyframes salto { 0%, 60%, 100% { transform: translateY(0) rotate(0); } 70% { transform: translateY(-14px) rotate(-3deg); } 80% { transform: translateY(0) rotate(2deg) scaleY(.97); } }
@media (prefers-reduced-motion: reduce) { .portada .pose-grande, .anim * { animation: none !important; } }
@media (max-width: 820px) { .portada .envoltura { grid-template-columns: 1fr; } }
nav.indice { position: sticky; top: 0; z-index: 5; background: var(--fondo); border-bottom: 1px solid var(--borde); }
nav.indice ol { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
nav.indice a { display: block; padding: 14px 12px; white-space: nowrap; text-decoration: none; color: var(--texto-2); font-weight: 700; font-size: 14px; }
nav.indice a:hover { color: var(--texto); }
section.parte { padding-block: 72px 24px; display: grid; gap: 28px; scroll-margin-top: 56px; }
.parte > header { display: grid; gap: 10px; }
.parte > header .num { font-family: var(--f-titulo); font-weight: 800; font-size: 15px; color: var(--acento-texto); letter-spacing: .06em; text-transform: uppercase; }
.parte h2 { font-size: clamp(36px, 6vw, 64px); }
.parte h3 { font-size: 24px; margin-bottom: 8px; }
.lead { font-size: 20px; color: var(--texto-2); }
.rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; }
.carta { background: var(--superficie); border: 1px solid var(--borde); border-radius: 18px; padding: 22px; display: grid; gap: 10px; align-content: start; min-width: 0; }
.carta .dato { font-family: var(--f-titulo); font-weight: 800; font-size: 44px; line-height: 1; color: var(--acento-texto); }
.carta small, .fuente { font-size: 13px; color: var(--texto-2); }
.etiqueta { display: inline-block; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--borde); color: var(--texto-2); }
.lienzo { background: var(--superficie); border: 1px solid var(--borde); border-radius: 18px; padding: 20px; min-width: 0; overflow: hidden; }
.lienzo svg { display: block; width: 100%; height: auto; }
.lienzo.claro { background: var(--rf-cal); } .lienzo.oscuro { background: var(--rf-tinta); }
.versiones { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.versiones figure { margin: 0; display: grid; gap: 8px; }
.versiones .lienzo { display: grid; place-items: center; min-height: 170px; }
.versiones .lienzo svg { max-height: 120px; width: auto; max-width: 100%; }
figcaption { font-size: 14px; color: var(--texto-2); }
.g-linea { stroke: var(--linea-grilla); stroke-width: .25; } .g-cota { stroke: var(--texto); fill: var(--texto); stroke-width: .4; } .g-cota text, .g-num { font: 3.6px var(--f-texto); stroke: none; fill: var(--texto-2); }
.g-cota circle[fill="none"] { fill: none; }
.mal { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap: 14px; }
.mal figure { margin: 0; background: var(--superficie); border: 1px solid var(--borde); border-radius: 16px; padding: 14px; display: grid; gap: 8px; position: relative; }
.mal figure::after { content: '×'; position: absolute; top: 8px; right: 12px; font: 800 26px var(--f-titulo); color: var(--rf-rojo-texto); }
.mal svg { width: 100%; height: auto; max-height: 150px; }
.mal b { font-size: 15px; } .mal span { font-size: 13px; color: var(--texto-2); }
.paleta { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 14px; }
.color { border-radius: 18px; overflow: hidden; border: 1px solid var(--borde); background: var(--superficie); }
.color .m { height: 120px; } .color div.t { padding: 14px 16px; display: grid; gap: 2px; font-size: 14px; }
.color b { font-family: var(--f-titulo); font-size: 20px; }
.proporcion { display: flex; height: 64px; border-radius: 14px; overflow: hidden; border: 1px solid var(--borde); }
.proporcion span { display: grid; place-items: center; font-weight: 700; font-size: 14px; }
.tabla { width: 100%; border-collapse: collapse; font-size: 15px; }
.tabla-marco { overflow-x: auto; border: 1px solid var(--borde); border-radius: 16px; background: var(--superficie); }
.tabla th, .tabla td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--borde); vertical-align: top; }
.tabla thead th { font-size: 13px; color: var(--texto-2); }
.tabla tbody tr:last-child > * { border-bottom: 0; }
.tabla .num { text-align: right; white-space: nowrap; }
.tabla td.si { font-weight: 700; } .tabla td.no { color: var(--texto-2); text-decoration: line-through; text-decoration-color: var(--rf-rojo); }
.par { display: inline-grid; place-items: center; width: 56px; height: 34px; border-radius: 8px; font: 800 18px var(--f-titulo); border: 1px solid var(--borde); }
.tipo-muestra { font-family: var(--f-titulo); font-weight: 800; font-size: clamp(36px, 8vw, 96px); line-height: 1; overflow-wrap: anywhere; }
.escala p { overflow-wrap: anywhere; }
.escala { display: grid; gap: 14px; } .escala div { display: grid; grid-template-columns: minmax(0, 120px) minmax(0, 1fr); gap: 16px; align-items: baseline; border-bottom: 1px solid var(--borde); padding-bottom: 12px; }
.escala span { font-size: 13px; color: var(--texto-2); }
.poses { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr)); gap: 14px; }
.pose-carta { margin: 0; background: var(--superficie); border: 1px solid var(--borde); border-radius: 18px; padding: 16px; display: grid; gap: 8px; justify-items: center; align-content: start; text-align: center; }
.pose-carta figcaption { display: grid; gap: 2px; } .pose-carta b { font-family: var(--f-titulo); font-size: 18px; color: var(--texto); }
.anim { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; }
.anim .saluda { animation: saludo 1.8s ease-in-out infinite; transform-origin: 50% 85%; }
@keyframes saludo { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-6deg); } 50% { transform: rotate(4deg) translateY(-6px); } 75% { transform: rotate(-2deg); } }
.aplic { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.aplic figure { margin: 0; display: grid; gap: 8px; align-content: start; }
.ancho2 { grid-column: span 2; } @media (max-width: 640px) { .ancho2 { grid-column: auto; } }
.stickers { display: flex; flex-wrap: wrap; gap: 6px 10px; justify-content: center; padding: 18px; background: #e8e6df; border-radius: 18px; }
.stickers svg { flex: none; max-width: 30%; height: auto; }
.correo { background: #fff; color: var(--rf-tinta); border-radius: 18px; overflow: hidden; border: 1px solid var(--borde); --cara: var(--rf-cal); --acento: var(--rf-tinta); }
.correo-cab { padding: 18px 24px; border-bottom: 4px solid var(--rf-rojo); } .correo-cab svg { height: 40px; width: auto; display: block; }
.correo-cuerpo { padding: 24px; display: grid; gap: 12px; justify-items: start; } .correo-cuerpo h4 { font-size: 30px; }
.correo .firma { color: var(--rf-pizarra); } .correo-pie { padding: 12px 24px; font-size: 13px; color: var(--rf-pizarra); background: var(--rf-cal); }
.documento { background: #fff; color: var(--rf-tinta); border-radius: 12px; padding: 28px; border: 1px solid var(--borde); display: grid; gap: 12px; font-size: 15px; }
.doc-cab { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #dcdcd6; padding-bottom: 14px; } .doc-cab svg { height: 34px; width: auto; }
.doc-cab span { font-weight: 700; } .clausulas { margin: 0; padding-left: 22px; display: grid; gap: 8px; }
.reglas { display: grid; gap: 10px; padding-left: 20px; margin: 0; } .reglas li { max-width: 72ch; }
.pie { border-top: 1px solid var(--borde); margin-top: 64px; padding-block: 28px 48px; font-size: 14px; color: var(--texto-2); }
:focus-visible { outline: 3px solid var(--acento-texto); outline-offset: 2px; }
</style>

<header class="portada"><div class="envoltura">
  <div>
    <div class="marca">${leer('reset-fit-horizontal-negativo.svg')}</div>
    <h1>Vuelve a <em>empezar.</em></h1>
    <p>Guía de marca de Reset Fit, una cadena de 12 gimnasios en Lima. Es una marca ficticia: la usamos como cliente de demostración de The Algorithm. Todo lo que dice esta guía sale de estudios citados al final de cada parte.</p>
  </div>
  <div class="pose-grande">${pose('celebra', 360, { cara: C.tinta, acento: C.menta })}</div>
</div></header>

<nav class="indice" aria-label="Partes de la guía"><div class="envoltura"><ol>${indice.map(([id, t], i) => `<li><a href="#${id}">${i + 1}. ${t}</a></li>`).join('')}</ol></div></nav>

<main class="envoltura">
<section class="parte" id="estrategia"><header><span class="num">1 · Estrategia</span><h2>Vendemos cómo se siente entrenar, no cómo se ve un cuerpo.</h2>
<p class="lead">Quien empieza a entrenar en Lima quiere sentirse mejor, saber qué hacer y no sentirse evaluado. Quien deja el gimnasio lo deja pronto. Reset Fit existe para los primeros 90 días: ahí se gana o se pierde a un socio.</p></header>
<div class="rejilla">
  <div class="carta"><span class="dato">43,7 %</span><p>de quienes entrenan en seis ciudades de Latinoamérica, Lima incluida, lo hace por salud; 41,8 % por bienestar mental. Bajar de peso: 20,9 %.</p><small>HFA, 2024, n = 2 984 (Lima n = 230). Panel en línea.</small></div>
  <div class="carta"><span class="dato">63 %</span><p>de los socios de un gimnasio de Río de Janeiro abandonó antes del tercer mes; menos de 4 % pasó los 12 meses.</p><small>Sperandei y otros, 2016, n = 5 240. La permanencia se midió por pago.</small></div>
  <div class="carta"><span class="dato">48 %</span><p>de peruanos que quiere moverse más dice que la falta de tiempo es su barrera principal.</p><small>Ipsos Perú, 2021, unas 500 personas en línea, perfil urbano.</small></div>
  <div class="carta"><span class="dato">El ánimo</span><p>durante el ejercicio moderado predice si la persona vuelve; el de después, no.</p><small>Rhodes y Kates, 2015, revisión de 24 estudios.</small></div>
</div>
<div class="rejilla">
  <div class="carta"><h3>Promesa</h3><p>Entrenar se siente bien desde la primera semana, y nunca vas a estar sin saber qué hacer.</p></div>
  <div class="carta"><h3>A quién le hablamos</h3><p>A quien empieza o vuelve después de un tiempo, entre 18 y 44 años, con poco tiempo. No le hablamos a quien busca un cuerpo de revista: no es nuestra promesa.</p></div>
  <div class="carta"><h3>Personalidad</h3><p>Energía con cercanía. Directa, cálida y con un guiño seco. Nunca sarcástica con quien entrena.</p></div>
  <div class="carta"><h3>Lo que no somos</h3><p>No somos un gimnasio de culto al esfuerzo ni de antes y después. No juzgamos cuerpos ni ritmos.</p></div>
</div>
<p class="fuente">Investigación completa: docs/marca/reset-fit/investigacion/01-motivos-y-barreras.md. Casi toda la evidencia es de fuera del Perú; la señal que confirmaría o tumbaría la promesa es la permanencia a 90 días cruzada con el motivo de inscripción.</p>
</section>

<section class="parte" id="voz"><header><span class="num">2 · Voz</span><h2>Hablamos de lo que el cuerpo hace y de lo que el socio decide.</h2>
<p class="lead">Nunca de cómo debería verse ni de cuánto debería pesar. Y toda cifra medible (kilos, plazos, precios, cupos) sale con sustento y con sus condiciones a la vista.</p></header>
<div class="tabla-marco">${tablaVoz}</div>
<div class="rejilla">
  <div class="carta"><h3>Tono por situación</h3><table class="tabla"><tbody>${tonos.map(([s, t]) => `<tr><th scope="row">${s}</th><td>${t}</td></tr>`).join('')}</tbody></table></div>
  <div class="carta"><h3>Humor</h3><ul class="reglas"><li>Un guiño por pieza, seco, sobre la situación (el despertador, la escalera después del día de pierna) o sobre la propia pesa.</li><li>Nunca sobre el cuerpo de nadie, el peso, la comida, el dolor, los precios, los contratos, la salud ni la seguridad.</li><li>Nunca a costa de un competidor: la burla comparativa es desleal (DL 1044, art. 12).</li><li>Si hay duda, sin chiste. Ser claro importa más que ser gracioso.</li></ul></div>
  <div class="carta"><h3>Español de Lima</h3><ul class="reglas"><li>Tuteo en toda la comunicación de marca; usted solo si la persona lo usa primero.</li><li>«Chamba», «bacán», «al toque», con moderación. Nunca apelativos sobre el cuerpo, aunque sean cariñosos.</li><li>Signos de apertura ¿¡, tildes y «setiembre».</li><li>«Socio», «socia», o el nombre. Nunca «cliente» en lo que lee el socio.</li></ul></div>
</div>
<p class="fuente">Lectura informativa, no asesoría legal: antes de publicar precios, promociones, comparaciones o testimonios, un abogado revisa la pieza. Investigación: docs/marca/reset-fit/investigacion/02-lenguaje-y-normas.md.</p>
</section>

<section class="parte" id="logo"><header><span class="num">3 · Logo</span><h2>Una pesa rusa que celebra.</h2>
<p class="lead">La versión anterior era una persona con un aro de torso, y un aro de torso se lee como un cuerpo grande. Una pesa se espera redonda: ser redonda es ser pesa. El asa entera dice «pesa», los brazos finos y la cara mínima dicen «personaje». La pose de celebrar es la firma; el resto del humor vive en las poses.</p></header>
<div class="versiones">
  <figure><div class="lienzo claro">${leer('reset-fit-horizontal.svg')}</div><figcaption>Horizontal: la firma principal.</figcaption></figure>
  <figure><div class="lienzo oscuro">${leer('reset-fit-horizontal-negativo.svg')}</div><figcaption>Horizontal sobre tinta.</figcaption></figure>
  <figure><div class="lienzo claro">${leer('reset-fit-apilada.svg')}</div><figcaption>Apilada: para formatos verticales.</figcaption></figure>
  <figure><div class="lienzo oscuro">${leer('reset-fit-simbolo-negativo.svg')}</div><figcaption>Solo la pesa: cuando el nombre ya está cerca.</figcaption></figure>
  <figure><div class="lienzo claro" style="gap:18px;display:flex;justify-content:center;align-items:end">${[96, 48, 32].map((t) => `<div style="width:${t}px;border-radius:${f(t * 0.225)}px;overflow:hidden">${leer('reset-fit-icono.svg')}</div>`).join('')}<div style="width:16px">${leer('reset-fit-favicon.svg')}</div></div><figcaption>Ícono de app y favicon: la versión mínima, sin sonrisa y con brazos más gruesos. Sin brazos se leía como un candado.</figcaption></figure>
  <figure><div class="lienzo claro" style="color:var(--rf-tinta)">${leer('reset-fit-horizontal-monocromo.svg')}</div><figcaption>Monocromo: una tinta, para sellos, grabados y para The Algorithm, donde el color es dato.</figcaption></figure>
</div>
<div class="rejilla">
  <div class="lienzo">${construccion}</div>
  <div class="carta"><h3>Construcción</h3><ul class="reglas"><li>Grilla de 100 módulos. La pesa es un círculo de radio ${G.r} con base plana en y ${G.base}.</li><li>El asa tiene trazo ${num(G.asa.trazo)}; los brazos, trazo ${num(G.brazo)} con manos de radio ${num(G.mano)}.</li><li>El conjunto va girado ${num(G.giro)}°: un brazo más alto que el otro y la inclinación dan movimiento.</li><li><b>Área de protección:</b> la altura del asa sobre la pesa, alrededor de toda la firma.</li><li><b>Tamaño mínimo:</b> 24 px de alto en pantalla y 10 mm impreso para la firma; debajo de eso, la versión mínima.</li></ul></div>
</div>
<h3>Usos incorrectos</h3>
<div class="mal">${mal.map((m) => `<figure>${m.s}<b>${m.t}</b>${m.d ? `<span>${m.d}</span>` : ''}</figure>`).join('')}</div>
<p class="fuente">Por qué un logo descriptivo y con movimiento implícito: Luffarelli y otros, 2019; Cian, Krishna y Elder, 2014. Investigación: docs/marca/reset-fit/investigacion/03-color-forma-y-guia.md.</p>
</section>

<section class="parte" id="color"><header><span class="num">4 · Color</span><h2>Rojo para la energía, menta para el guiño.</h2>
<p class="lead">El rojo anterior quedaba a un paso del naranja de b2 y la arena era casi la de Bio Ritmo. La mitad fría del círculo cromático está libre en Lima: ahí entra la menta.</p></header>
<div class="paleta">${[
  ['Rojo Reset', C.rojo, 'La pesa, fondos de marca, titulares grandes.'], ['Menta', C.menta, 'El guiño: objetos de las poses, destacados sobre tinta.'], ['Tinta', C.tinta, 'Texto y fondos oscuros.'],
  ['Cal', C.cal, 'Fondo claro. En pantallas, blanco puro.'], ['Rojo texto', C.rojoTexto, 'Rojo para texto chico sobre cal.'], ['Pizarra', C.pizarra, 'Texto secundario.'],
].map(([n, h, u]) => `<div class="color"><div class="m" style="background:${h}"></div><div class="t"><b>${n}</b><span>${h.toUpperCase()}</span><span>${u}</span></div></div>`).join('')}</div>
<div class="proporcion" role="img" aria-label="Proporción de uso: 60 % cal o tinta, 30 % rojo, 10 % menta"><span style="flex:60;background:${C.cal};color:${C.tinta}">60 % cal o tinta</span><span style="flex:30;background:${C.rojo};color:${C.tinta}">30 % rojo</span><span style="flex:10;background:${C.menta};color:${C.tinta}">10 %</span></div>
<div class="tabla-marco">${tablaColor}</div>
<p class="fuente">Contrastes medidos al armar esta guía (WCAG 2.x). La columna de deuteranopía usa la simulación de Machado, Oliveira y Fernandes (2009). El color nunca es la única señal: «clase llena» lleva palabra e ícono.</p>
</section>

<section class="parte" id="tipografia"><header><span class="num">5 · Tipografía</span><h2>Bricolage para hablar, Atkinson para que se lea.</h2>
<p class="lead">Dos familias libres (licencia OFL) que la competencia no usa. Bricolage Grotesque tiene rasgos irregulares que le dan gracia sin volverla infantil. Atkinson Hyperlegible Next fue diseñada para máxima legibilidad: va en señalética, horarios y letra chica.</p></header>
<div class="rejilla">
  <div class="carta"><span class="tipo-muestra">¿Ñandú? ¡Al&nbsp;toque!</span><small>Bricolage Grotesque 800 · titulares y logotipo</small></div>
  <div class="carta"><p style="font-size:22px">Lunes a viernes de 5:00 a 23:00. Señalética, cañón, pingüino: 0123456789.</p><small>Atkinson Hyperlegible Next 400 y 700 · texto, horarios y sala, con números tabulares. El cero lleva barra para no confundirse con la O.</small></div>
</div>
<div class="escala">${[['Titular', 'clamp(48px, 8vw, 96px)', 'Ya es costumbre.'], ['Título', '40px', 'Tu primera semana'], ['Subtítulo', '24px', 'Un coach arma tu rutina contigo'], ['Texto', '17px', 'Llega diez minutos antes y te mostramos la sala.'], ['Letra chica', '14px', 'Precio final con IGV. Condiciones en la web.']].map(([n, t, e], i) => `<div><span>${n} · ${t.startsWith('clamp') ? '48 a 96 px' : t}</span><p style="font:${i < 3 ? '800' : '400'} ${t}/1.15 ${i < 3 ? 'var(--f-titulo)' : 'var(--f-texto)'}">${e}</p></div>`).join('')}</div>
<p class="fuente">Se evitan DM Sans, Montserrat, Roboto Condensed y Work Sans porque ya las usan gimnasios de Lima (medido en el CSS de sus sitios).</p>
</section>

<section class="parte" id="pesa"><header><span class="num">6 · La pesa y sus poses</span><h2>Doce poses, un personaje.</h2>
<p class="lead">El logo no cambia; la pesa sí se mueve. Cada pose tiene su momento. Los objetos van en tinta sobre fondo claro y en menta sobre fondo oscuro, y nunca tocan el rojo. Las poses rotan por temporada para que el chiste no se gaste.</p></header>
${poses}
<div class="rejilla">
  <div class="carta"><h3>La pesa siempre</h3><ul class="reglas"><li>Tiene la cara mínima: dos puntos y, si hace falta, una boca.</li><li>Hace algo: celebra, saluda, duerme, levanta.</li><li>Comparte el espacio con el texto, no lo tapa.</li></ul></div>
  <div class="carta"><h3>La pesa nunca</h3><ul class="reglas"><li>Se sube a una balanza ni mide cinturas.</li><li>Come comida «culpable» ni se castiga por comer.</li><li>Sufre, llora o se burla de nadie.</li><li>Aparece en cobros, contratos, cancelaciones o avisos de seguridad.</li></ul></div>
</div>
</section>

<section class="parte" id="movimiento"><header><span class="num">7 · Movimiento</span><h2>Salta una vez, no se pone pesada.</h2>
<p class="lead">La pesa se mueve con un rebote corto: sube, se inclina y cae con un poco de peso. Dura menos de un segundo y se repite solo en pantallas de espera. Si el sistema pide reducir el movimiento, se queda quieta.</p></header>
<div class="lienzo anim"><div class="saluda">${pose('hola', 150)}</div><p>Saludo de 1,8 s para la bienvenida de la app. Curva con rebote solo en la pesa; la interfaz se mueve con curvas sobrias de 150 ms.</p></div>
</section>

<section class="parte" id="fotografia"><header><span class="num">8 · Fotografía</span><h2>Cuerpos completos haciendo algo.</h2>
<p class="lead">Las fotos muestran socios reales entrenando, con tallas, edades y niveles distintos. Ver cuerpos diversos entrenando dio más ganas de entrenar que ver cuerpos idealizados (Mulgrew y otros, 2018; Wood y Pila, 2022).</p></header>
<div class="rejilla">
  <div class="carta"><h3>Sí</h3><ul class="reglas"><li>Cuerpo completo y en movimiento, con la cara visible.</li><li>Luz natural de la sede; colores reales, sin filtro frío.</li><li>Personas con autorización escrita y fecha de la foto.</li><li>Grupos que se ríen entre series.</li></ul></div>
  <div class="carta"><h3>No</h3><ul class="reglas"><li>Antes y después, nunca.</li><li>Abdómenes recortados, cuerpos sin cabeza, pellizcos de grasa (Meta los prohíbe).</li><li>Gestos de dolor o de castigo.</li><li>Modelos presentados como socios: el testimonio debe ser auténtico y reciente (DL 1044, art. 8.2).</li></ul></div>
</div>
</section>

<section class="parte" id="aplicaciones"><header><span class="num">9 · Aplicaciones</span><h2>De la fachada a la toalla.</h2>
<p class="lead">El mismo sistema en cada punto de contacto: la firma estable, la pesa en la pose que corresponde y el texto que dice algo útil.</p></header>
<div class="aplic">
  <figure class="ancho2"><div class="lienzo" style="padding:0">${fachada}</div><figcaption>Fachada de sede, de noche: letrero con la firma en negativo, bandera con la versión mínima y horario en Atkinson.</figcaption></figure>
  <figure><div class="lienzo" style="padding:0">${senal('Pesas', ['Vuelve la pesa a su sitio.', 'Ella también quiere', 'descansar.'], 'siesta', C.cal, C.tinta, C.tinta, 'Sala de pesas · piso 1')}</div><figcaption>Norma de sala con un guiño.</figcaption></figure>
  <figure><div class="lienzo" style="padding:0">${senal('Agua', ['Hay un bebedero cada', '20 metros. Llena tu', 'tomatodo cuando quieras.'], 'hidrata', C.tinta, C.cal, C.menta, 'Zona de cardio · piso 2')}</div><figcaption>Señal de servicio sobre tinta: los objetos van en menta.</figcaption></figure>
  <figure><div class="lienzo" style="padding:0">${salida}</div><figcaption>Seguridad: sin pesa y sin humor. En obra se usa el pictograma de la norma técnica peruana vigente; este es solo de referencia.</figcaption></figure>
  <figure class="ancho2"><div class="lienzo claro">${polos('Coach', C.tinta, C.cal, C.menta, C.rojo)}</div><figcaption>Polo de coach: tinta con cuello menta. Pesa chica en el pecho, el rol grande en la espalda.</figcaption></figure>
  <figure class="ancho2"><div class="lienzo claro">${polos('Recepción', C.rojo, C.tinta, C.tinta, C.tinta)}</div><figcaption>Polo de recepción: rojo, para encontrarlo al toque. Sobre rojo, la pesa va en tinta.</figcaption></figure>
  <figure class="ancho2"><div class="lienzo claro">${tarjeta}</div><figcaption>Tarjeta de socia física.</figcaption></figure>
  <figure><div class="lienzo claro" style="display:grid;place-items:center">${billetera}</div><figcaption>Tarjeta en la billetera del celular.</figcaption></figure>
  <figure><div class="lienzo claro" style="display:grid;place-items:center">${appInicio}</div><figcaption>App: inicio con la racha.</figcaption></figure>
  <figure><div class="lienzo claro" style="display:grid;place-items:center">${appVacio}</div><figcaption>App: estado vacío con la pesa en siesta.</figcaption></figure>
  <figure><div class="lienzo claro" style="display:grid;place-items:center">${appCargando}</div><figcaption>App: cargando, la pesa piensa.</figcaption></figure>
  <figure><div class="lienzo" style="padding:0">${post}</div><figcaption>Publicación: el logro como mensaje.</figcaption></figure>
  <figure><div class="lienzo claro" style="display:grid;place-items:center"><div style="max-width:260px">${historia}</div></div><figcaption>Historia: horario de 5 a. m. sin culpa para quien no madruga. Todo queda fuera de las zonas que tapa la interfaz de la red.</figcaption></figure>
  <figure class="ancho2"><div class="lienzo" style="padding:0">${panel}</div><figcaption>Panel en paradero: precio total con IGV, duración y cupos de la promoción visibles en la misma pieza (Ley 29571, art. 14).</figcaption></figure>
  <figure><div class="lienzo claro">${toalla}</div><figcaption>Toalla de sala.</figcaption></figure>
  <figure><div class="lienzo claro">${tomatodo}</div><figcaption>Tomatodo de 750 ml.</figcaption></figure>
  <figure><div class="lienzo claro">${bolsa}</div><figcaption>Bolsa de tela.</figcaption></figure>
  <figure class="ancho2"><div>${stickers}</div><figcaption>Stickers troquelados de bienvenida: seis poses por temporada.</figcaption></figure>
  <figure><div>${correo}</div><figcaption>Correo de bienvenida.</figcaption></figure>
  <figure><div>${documento}</div><figcaption>Contrato: solo el logo y la información completa. En contratos, cobros, cancelaciones y avisos de seguridad no hay humor ni poses.</figcaption></figure>
</div>
</section>

<section class="parte" id="accesibilidad"><header><span class="num">10 · Accesibilidad</span><h2>Que se lea en la sala, con sudor en los ojos.</h2></header>
<div class="rejilla">
  <div class="carta"><ul class="reglas"><li>Texto chico siempre en tinta sobre cal o blanco, o en cal sobre tinta: más de ${coma(contraste(C.tinta, C.cal), 0)}:1.</li><li>Rojo como texto solo en titulares de 24 px o más; para texto chico, el rojo texto (${coma(contraste(C.rojoTexto, C.cal))}:1 sobre cal).</li><li>Rojo y menta nunca se tocan sin tinta de por medio.</li></ul></div>
  <div class="carta"><ul class="reglas"><li>El color nunca es la única señal: «clase llena» lleva palabra e ícono.</li><li>Toda pose lleva texto alternativo con su nombre.</li><li>Los videos llevan subtítulos; las animaciones respetan la preferencia de reducir movimiento.</li></ul></div>
</div>
</section>

<section class="parte" id="gestion"><header><span class="num">11 · Archivos</span><h2>Dónde está cada cosa.</h2></header>
<div class="tabla-marco"><table class="tabla"><tbody>
<tr><th scope="row">Logos y poses</th><td>docs/marca/reset-fit/svg/ (con el logotipo a trazos; no dependen de fuentes instaladas)</td></tr>
<tr><th scope="row">Geometría</th><td>docs/marca/reset-fit/fuente/logo.mjs: el logo se dibuja con código, no a mano</td></tr>
<tr><th scope="row">Esta guía</th><td>docs/marca/reset-fit/fuente/armar-guia.mjs: los contrastes se miden al armarla</td></tr>
<tr><th scope="row">Investigación</th><td>docs/marca/reset-fit/investigacion/: motivos y barreras, lenguaje y normas, color y forma</td></tr>
<tr><th scope="row">Dentro de The Algorithm</th><td>public/marca/: solo la versión monocroma, porque ahí el color es dato</td></tr>
</tbody></table></div>
</section>

<footer class="pie">Reset Fit es una marca ficticia creada por THE LAB · Reset para demostrar The Algorithm. Precios, sedes, personas y horarios son de ejemplo. Versión 2 · 14 de octubre de 2026.</footer>
</main>`;

if (/\{\{|undefined|NaN/.test(html)) throw new Error('quedó un marcador, un undefined o un NaN');
writeFileSync(process.argv[3], html);
console.log('guía v2 armada', (html.length / 1024).toFixed(0), 'kB');
