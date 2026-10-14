// Verifica que en ninguna pose un objeto («acento») toque la pesa o las manos: entre los dos siempre queda un filete
// de fondo de al menos 2 unidades de la grilla de 100, y mide ese filete en cada pose.
// Pinta cada pose a 8 px por unidad con colores de control (pesa pura en rojo, objeto en azul, cara en blanco, fondo
// blanco) y, para cada píxel de objeto, busca el píxel de pesa más cercano. Usa Chromium de Playwright.
// Uso: node verificar-poses.mjs <carpeta con geometria.json>
import { readFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs');
const geo = JSON.parse(readFileSync(process.argv[2].replace(/\/?$/, '/') + 'geometria.json', 'utf8'));
const MINIMO = 2; // unidades de la grilla
const K = 8; // píxeles por unidad
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage();
let fallas = 0;
for (const pose of geo.poses) {
  const E = geo.encuadre;
  const W = E.w * K, H = E.h * K;
  const html = `<body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${E.x} ${E.y} ${E.w} ${E.h}" width="${W}" height="${H}" style="color:#ff0000;--cara:#ffffff;--acento:#0000ff">${pose.dibujo}</svg></body>`;
  await p.setContent(html);
  const r = await p.evaluate(async ({ W, H, K, MINIMO }) => {
    const svg = document.querySelector('svg');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg).replace(/var\(--cara\)/g, '#ffffff').replace(/var\(--acento\)/g, '#0000ff').replace(/currentColor/g, '#ff0000'));
    await img.decode();
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data;
    // Cualquier rastro de color cuenta (también el borde suavizado): así el filete medido nunca es más ancho que el real
    const rojo = (o) => d[o] > 128 && d[o + 2] < 200 && d[o] - d[o + 2] > 40;
    const azul = (o) => d[o + 2] > 128 && d[o] < 200 && d[o + 2] - d[o] > 40;
    // Solo importan los bordes: píxeles de cada color con algún vecino que no es de ese color
    const borde = (es) => { const l = []; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const o = (j * W + i) * 4; if (!es(o)) continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => { const ii = i + a, jj = j + c; return ii < 0 || jj < 0 || ii >= W || jj >= H || !es((jj * W + ii) * 4); })) l.push(i, j); } return l; };
    const A = borde(azul), Rj = borde(rojo);
    const azules = A.length / 2;
    let min = Infinity;
    for (let a = 0; a < A.length; a += 2) for (let q = 0; q < Rj.length; q += 2) { const dd = (A[a] - Rj[q]) ** 2 + (A[a + 1] - Rj[q + 1]) ** 2; if (dd < min) min = dd; }
    min = Math.sqrt(min);
    return { azules, filete: min === Infinity ? null : (min - 1) / K };
  }, { W, H, K, MINIMO });
  if (!r.azules) { console.log(`· ${pose.nombre}: sin objeto`); continue; }
  const mide = r.filete.toFixed(1).replace('.', ',');
  if (r.filete < MINIMO) { fallas++; console.log(`✗ ${pose.nombre}: el objeto queda a ${mide} unidades de la pesa (mínimo ${MINIMO})`); }
  else console.log(`✓ ${pose.nombre}: filete de ${mide} unidades`);
}
await b.close();
if (fallas) process.exit(1);
