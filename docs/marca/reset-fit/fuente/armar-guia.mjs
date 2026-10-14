// Arma la guía de marca de Reset Fit en un solo HTML, con los SVG en línea.
import { readFileSync, writeFileSync } from 'node:fs';
const D = 'salida/';
const s = (n) => readFileSync(D + n, 'utf8').replace(/<\?xml[^>]*>/, '').trim();
const geo = JSON.parse(readFileSync(D + 'geometria.json', 'utf8'));
const { G, caja, simW, simH } = geo;
const f = (n) => +n.toFixed(2);
const simbolo = (c) => `<path d="${geo.D_CUERPO}" fill="none" stroke="${c}" stroke-width="${G.trazo}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${G.cabeza.cx}" cy="${G.cabeza.cy}" r="${G.cabeza.r}" fill="${c}"/>`;
const ROJO = 'var(--rf-rojo)', TINTA = 'var(--rf-tinta)', CAL = 'var(--rf-cal)', NIEBLA = 'var(--rf-niebla)', PIZ = 'var(--rf-pizarra)';

// Construcción: grilla de 100 con cotas
let grilla = '';
for (let i = 0; i <= 100; i += 10) grilla += `<line x1="${i}" y1="0" x2="${i}" y2="100" stroke="${NIEBLA}" stroke-width="0.25"/><line x1="0" y1="${i}" x2="100" y2="${i}" stroke="${NIEBLA}" stroke-width="0.25"/>`;
const construccion = `<svg viewBox="-14 -6 138 118" role="img" aria-label="Construcción del símbolo en una grilla de 100 módulos">${grilla}
<g opacity="0.92">${simbolo(ROJO)}</g>
<circle cx="50" cy="${G.cy}" r="${G.r}" fill="none" stroke="${TINTA}" stroke-width="0.5" stroke-dasharray="1.5 1.5"/>
<line x1="50" y1="${G.cy}" x2="${50 + G.r}" y2="${G.cy}" stroke="${TINTA}" stroke-width="0.5"/><text x="${50 + G.r / 2}" y="${G.cy - 2}" font-size="4.2" text-anchor="middle" fill="${TINTA}" font-family="Barlow">r 28</text>
<circle cx="50" cy="${G.cy}" r="1" fill="${TINTA}"/>
<line x1="50" y1="${G.cy}" x2="${f(50 + 40 * Math.sin((40 * Math.PI) / 180))}" y2="${f(G.cy - 40 * Math.cos((40 * Math.PI) / 180))}" stroke="${TINTA}" stroke-width="0.4" stroke-dasharray="1 1"/>
<line x1="50" y1="${G.cy}" x2="${f(50 - 40 * Math.sin((40 * Math.PI) / 180))}" y2="${f(G.cy - 40 * Math.cos((40 * Math.PI) / 180))}" stroke="${TINTA}" stroke-width="0.4" stroke-dasharray="1 1"/>
<text x="50" y="${G.cy - 18}" font-size="4.2" text-anchor="middle" fill="${TINTA}" font-family="Barlow">80°</text>
<line x1="${G.cabeza.cx}" y1="${G.cabeza.cy}" x2="${G.cabeza.cx + G.cabeza.r}" y2="${G.cabeza.cy}" stroke="${TINTA}" stroke-width="0.5"/><text x="${G.cabeza.cx + G.cabeza.r + 2}" y="${G.cabeza.cy + 1.5}" font-size="4.2" fill="${TINTA}" font-family="Barlow">r 8</text>
<line x1="50" y1="${G.cy + G.r - G.trazo / 2}" x2="50" y2="${G.cy + G.r + G.trazo / 2}" stroke="${CAL}" stroke-width="0.8"/>
<line x1="50" y1="${G.cy + G.r + G.trazo / 2}" x2="64" y2="${G.cy + G.r + G.trazo / 2 + 6}" stroke="${TINTA}" stroke-width="0.4"/><text x="65" y="${G.cy + G.r + G.trazo / 2 + 8}" font-size="4.2" fill="${TINTA}" font-family="Barlow">trazo 12</text>
${[0, 50, 100].map((v) => `<text x="${v}" y="-1.5" font-size="3.6" text-anchor="middle" fill="${PIZ}" font-family="Barlow">${v}</text>`).join('')}
</svg>`;

// Área de reserva: el logo horizontal con un marco punteado a un radio de cabeza
const h = s('reset-fit-horizontal.svg');
const reserva = `<div style="position:relative;outline:1.5px dashed var(--rf-rojo-texto);outline-offset:0">${h}</div>`;

// Aplicaciones
const post = `<svg viewBox="0 0 1080 1080" role="img" aria-label="Publicación en redes"><rect width="1080" height="1080" fill="${TINTA}"/>
<g transform="translate(80 80) scale(1.3) translate(${f(-caja.x0)} ${f(-caja.y0)})">${simbolo(ROJO)}</g>
<text x="72" y="560" font-family="Barlow Condensed" font-weight="800" font-size="230" fill="${CAL}">VUELVE A</text>
<text x="72" y="780" font-family="Barlow Condensed" font-weight="800" font-size="230" fill="${ROJO}">EMPEZAR.</text>
<line x1="80" y1="900" x2="1000" y2="900" stroke="${NIEBLA}" stroke-width="2"/>
<text x="80" y="980" font-family="Barlow" font-size="38" fill="${CAL}">Primera clase sin costo en las 12 sedes.</text>
<text x="1000" y="980" font-family="Barlow" font-weight="600" font-size="34" fill="${NIEBLA}" text-anchor="end">Lima · 12 sedes</text></svg>`;
const tarjeta = `<svg viewBox="0 0 856 540" role="img" aria-label="Tarjeta de socia o socio"><rect width="856" height="540" rx="32" fill="${ROJO}"/>
<g transform="translate(470 40) scale(5.6) translate(${f(-caja.x0)} ${f(-caja.y0)})" opacity="0.16">${simbolo(TINTA)}</g>
<g transform="translate(56 56) scale(0.24)">${h.replace(/<\/?svg[^>]*>|<title>[^<]*<\/title>/g, '').replace(/#ff4a2b/g, '#121318')}</g>
<text x="56" y="420" font-family="Barlow" font-size="26" fill="${TINTA}">Socia desde 2025</text>
<text x="56" y="476" font-family="Barlow Condensed" font-weight="800" font-size="52" fill="${TINTA}">NOMBRE APELLIDO</text>
<text x="800" y="476" font-family="Barlow" font-weight="600" font-size="26" fill="${TINTA}" text-anchor="end">Todas las sedes</text></svg>`;
const icono = s('reset-fit-icono.svg');
const iconos = `<div style="display:flex;gap:16px;align-items:end;flex-wrap:wrap;padding:8px 0">${[160, 96, 64, 48].map((w) => `<div style="width:${w}px;border-radius:${f(w * 0.225)}px;overflow:hidden">${icono}</div>`).join('')}<div style="width:64px;border-radius:50%;overflow:hidden">${icono}</div></div>`;
const fachada = `<svg viewBox="0 0 1200 240" role="img" aria-label="Letrero de fachada"><rect width="1200" height="240" fill="${TINTA}"/>
<g transform="translate(64 50) scale(1.04)">${s('reset-fit-horizontal-negativo.svg').replace(/<\/?svg[^>]*>|<title>[^<]*<\/title>/g, '')}</g>
<line x1="740" y1="64" x2="740" y2="176" stroke="${NIEBLA}" stroke-width="2"/>
<text x="780" y="134" font-family="Barlow Condensed" font-weight="600" font-size="64" fill="${CAL}">MIRAFLORES</text>
<text x="780" y="174" font-family="Barlow" font-size="26" fill="${NIEBLA}">Abierto de 5 a 23 h</text></svg>`;

// Usos incorrectos
const sim = (t, c = ROJO) => `<svg viewBox="-10 -10 ${f(simW + 60)} ${f(simH + 20)}" role="img" aria-label="Uso incorrecto"><g transform="${t} translate(${f(-caja.x0)} ${f(-caja.y0)})">${simbolo(c)}</g></svg>`;
const mal = {
  estirar: sim(`translate(0 0) scale(1.6 0.8)`),
  color: sim('translate(18 0)', '#3a6fd8'),
  girar: sim(`rotate(24 ${f(simW / 2 + 18)} ${f(simH / 2)}) translate(18 0)`),
  contraste: sim('translate(18 0)'),
};

let html = readFileSync('guia-plantilla.html', 'utf8');
html = html.replace(/\{\{svg:([\w.-]+)\}\}/g, (_, n) => s(n));
html = html.replace('{{construccion}}', construccion).replace('{{reserva}}', reserva)
  .replace('{{app:post}}', post).replace('{{app:tarjeta}}', tarjeta).replace('{{app:iconos}}', iconos).replace('{{app:fachada}}', fachada)
  .replace(/\{\{mal:(\w+)\}\}/g, (_, k) => mal[k]);
if (/\{\{/.test(html)) throw new Error('quedó un marcador sin reemplazar');
writeFileSync(process.argv[2], html);
console.log('guía armada', (html.length / 1024).toFixed(0), 'kB');
