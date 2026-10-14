// Verifica que en ninguna pose un objeto («acento») toque la pesa o las manos: entre los dos siempre queda fondo.
// Pinta cada pose a 4x con colores de control (pesa pura en rojo, objeto en azul, cara en blanco, fondo blanco)
// y busca píxeles de objeto con un píxel de pesa a menos de 2 px. Usa Chromium de Playwright.
// Uso: node verificar-poses.mjs <carpeta con geometria.json>
import { readFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs');
const geo = JSON.parse(readFileSync(process.argv[2].replace(/\/?$/, '/') + 'geometria.json', 'utf8'));
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage();
let fallas = 0;
for (const pose of geo.poses) {
  const E = geo.encuadre;
  const html = `<body style="margin:0;background:#fff"><svg viewBox="${E.x} ${E.y} ${E.w} ${E.h}" width="448" height="480" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" style="color:#ff0000;--cara:#ffffff;--acento:#0000ff">${pose.dibujo}</svg></body>`;
  await p.setContent(html);
  const choques = await p.evaluate(async () => {
    const svg = document.querySelector('svg');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg).replace(/var\(--cara\)/g, '#ffffff').replace(/var\(--acento\)/g, '#0000ff').replace(/currentColor/g, '#ff0000'));
    await img.decode();
    const c = document.createElement('canvas'); c.width = 448; c.height = 480;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 448, 480); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, 448, 480).data;
    const es = (i, j, k) => { if (i < 0 || j < 0 || i >= 448 || j >= 480) return false; const o = (j * 448 + i) * 4; return k === 'rojo' ? d[o] > 200 && d[o + 1] < 60 && d[o + 2] < 60 : d[o + 2] > 200 && d[o] < 60 && d[o + 1] < 60; };
    let n = 0;
    for (let j = 0; j < 480; j++) for (let i = 0; i < 448; i++) if (es(i, j, 'azul')) {
      for (let dj = -2; dj <= 2 && !n; dj++) for (let di = -2; di <= 2; di++) if (es(i + di, j + dj, 'rojo')) { n++; break; }
    }
    return n;
  });
  if (choques) { fallas++; console.log(`✗ ${pose.nombre}: el objeto toca la pesa`); } else console.log(`✓ ${pose.nombre}`);
}
await b.close();
if (fallas) process.exit(1);
