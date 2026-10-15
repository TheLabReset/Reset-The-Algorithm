// Prueba de humo en Chromium: cruza lo dibujado contra armarVista. Uso: node docs/rediseno/galeria/pruebas/humo.mjs
// Necesita Playwright (en este entorno, global en /opt/node22/lib/node_modules/playwright).
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const aqui = dirname(fileURLToPath(import.meta.url));
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
const { generar } = await import('../muestra/generador.js');
const { CONFIG } = await import('../muestra/configuracion.js');
const { armarVista } = await import('../muestra/vista.js');
const v = armarVista(generar(CONFIG), { desde: '2026-09-01', hasta: '2026-09-30', compararDesde: '2025-09-01', compararHasta: '2025-09-30', cohorteDesde: '2026-08-01', cohorteHasta: '2026-08-31' });
const fallas = [];
const navegador = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}).catch(() => pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }));
for (const ancho of [1440, 390]) {
  const p = await navegador.newPage({ viewport: { width: ancho, height: 900 } });
  const errores = []; p.on('pageerror', (e) => errores.push(e.message));
  await p.goto('file://' + join(aqui, '..', 'index.html')); await p.waitForTimeout(800);
  const ok = (c, m) => { if (!c) fallas.push(`${ancho} px: ${m}`); };
  ok(!errores.length, `errores de página: ${errores.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= ancho, 'scroll horizontal');
  const etapas = await p.$$eval('[data-bloque="embudo"][data-opcion="0"] rect[data-valor]', (r) => r.map((x) => +x.dataset.valor));
  ok(JSON.stringify(etapas) === JSON.stringify(v.embudo.etapas.map((e) => e.valor)), `etapas ${etapas} ≠ vista`);
  const teselas = await p.$$eval('[data-bloque="sedes"][data-opcion="1"] rect[data-valor]', (r) => r.reduce((s, x) => s + (+x.dataset.valor || 0), 0));
  ok(teselas === v.resultados.leads, `teselas suman ${teselas}, total ${v.resultados.leads}`);
  // escala común: el largo de cada barra de sede es proporcional a su valor en las tres zonas
  const razones = await p.$$eval('[data-bloque="sedes"][data-opcion="0"] rect[data-valor]', (r) => r.map((x) => +x.getAttribute('width') / +x.dataset.valor));
  ok(Math.max(...razones) - Math.min(...razones) < 1e-6, 'las zonas de sedes no comparten escala');
  // franja de conversación: rótulo y leyenda dicen el mismo porcentaje
  const rotulos = await p.$$eval('[data-bloque="conversacion"][data-opcion="2"] svg text', (t) => t.map((x) => x.textContent));
  const leyenda = await p.$$eval('[data-bloque="conversacion"][data-opcion="2"] .leyenda li', (l) => l.map((x) => x.textContent));
  rotulos.forEach((r) => { const nombre = r.replace(/\s[\d\s ]+%$/, ''); const enLeyenda = leyenda.find((l) => l.startsWith(nombre)); ok(enLeyenda && enLeyenda.replace(/\s/g, '').endsWith(r.slice(nombre.length).replace(/\s/g, '')), `franja: «${r}» contra «${enLeyenda}»`); });
  const titulo = await p.textContent('#t-resultados + .titulo-calculado');
  ok(titulo.includes(String(v.resultados.leads)), `el título no dice ${v.resultados.leads}`);
  await p.close();
}
await navegador.close();
console.log(fallas.length ? 'ROJO\n' + fallas.join('\n') : 'verde: etapas, teselas, escala común de sedes, franja contra leyenda, título, sin scroll a 390 px');
process.exit(fallas.length ? 1 : 0);
