// Render de verdad: cada capa se pinta con React (con sus paneles de detalle abiertos) en cada atajo, cada comparación,
// tramos libres y fuentes caídas, y el texto que queda en pantalla no lleva números rotos, relleno ni palabras que el
// glosario veta. Además: la vista general de cada capítulo lleva tres tarjetas como máximo (lo demás va al detalle).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { BASE } from '../src/muestra/configuracion.js';
import { muestraAl } from '../src/muestra/fechaMovil.js';
import { generar } from '../src/muestra/generador.js';
import { armarVista } from '../src/calculo/vista.js';
import { textoRoto, textoDe } from './revisar.mjs';

const raiz = new URL('../', import.meta.url);
// dentro de node_modules, para que el bundle encuentre react y react-dom del proyecto
const salida = new URL('node_modules/.cache/prueba-render/entrada.mjs', raiz);
mkdirSync(new URL('./', salida), { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('pruebas/render-entrada.jsx', raiz))], outfile: fileURLToPath(salida),
  bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', logLevel: 'silent',
  external: ['react', 'react-dom', 'lucide-react'], loader: { '.css': 'empty', '.svg': 'text' },
});
const { pintar, IDS } = await import(`${salida.href}?${Date.now()}`);
// React avisa que useLayoutEffect no corre en el servidor: es esperado en esta prueba, no un error de la pantalla
const errorOriginal = console.error;
console.error = (m, ...r) => { if (!String(m).includes('useLayoutEffect does nothing on the server')) errorOriginal(m, ...r); };

// corte a mitad de mes, con la fecha de referencia de la muestra: el resultado no depende del día en que se corre
const cfg = muestraAl(BASE, '2026-10-25'), d = generar(cfg);

test('render: cada capa se pinta y abre sus detalles', () => {
  const v = armarVista(d, {});
  assert.deepEqual(IDS, ['senales', 'inteligencia', 'activacion', 'rendimiento']);
  for (const id of IDS) assert.ok(pintar(id, v).length > 5000, `${id}: la capa salió casi vacía`);
  for (const id of ['senales', 'activacion', 'rendimiento']) assert.match(pintar(id, v), /q-detalle-cuerpo/, `${id}: el detalle no se pintó`);
});

test('render: cada atajo, cada comparación, tramos libres y fuentes caídas, sin texto roto', () => {
  const malos = new Set();
  const periodos = [{}, { atajo: '30d' }, { atajo: 'mes' }, { atajo: 'mes-pasado' }, { atajo: '6m' },
    { desde: cfg.corte, hasta: cfg.corte }, { desde: cfg.desde, hasta: cfg.desde }, { desde: '2026-02-20', hasta: '2026-03-10' }, { desde: '2025-12-20', hasta: '2026-01-10' }];
  for (const filtros of periodos) for (const comparar of ['anterior', 'anio']) {
    const v = armarVista(d, { ...filtros, comparar });
    for (const id of IDS) for (const m of textoRoto(textoDe(pintar(id, v)))) malos.add(`${id} ${JSON.stringify(filtros)} ${comparar}: ${m}`);
  }
  for (const caida of ['crm', 'web']) {
    const v = armarVista(d, {}, { fuentesCaidas: [caida] });
    for (const id of IDS) for (const m of textoRoto(textoDe(pintar(id, v)))) malos.add(`${id} sin ${caida}: ${m}`);
  }
  const v = armarVista(d, {});
  for (const id of IDS) for (const m of textoRoto(textoDe(pintar(id, v, { cargando: true })))) malos.add(`${id} cargando: ${m}`);
  assert.deepEqual([...malos].slice(0, 12), []);
});

test('vista general: tres tarjetas como máximo por capítulo; lo minucioso va al detalle', () => {
  for (const filtros of [{}, { atajo: 'mes-pasado' }]) {
    const v = armarVista(d, filtros);
    for (const id of IDS) {
      // con los detalles cerrados, lo que se pinta es la vista general
      for (const sec of pintar(id, v, { detalles: false }).split('<section class="q-capitulo"').slice(1)) {
        const num = sec.match(/data-seccion="([\d.]+)"/)[1];
        const tarjetas = (sec.match(/<article /g) || []).length;
        assert.ok(tarjetas <= 3, `${num}: ${tarjetas} tarjetas en la vista general`);
      }
    }
  }
});

test('lo nuevo va con su sello y primero en su conjunto', () => {
  const v = armarVista(d, {});
  const x = v.lee.piezas;
  assert.ok(x.nuevas > 0, 'la vista que abre el panel no tiene piezas nuevas');
  assert.match(pintar('activacion', v), /q-sello-nuevo/);
  for (const k of x.conjuntos) {
    const de = x.piezas.filter((p) => p.conjunto === k.id && p.alAire);
    const i = de.findIndex((p) => !p.nueva);
    assert.ok(i === -1 || de.slice(i).every((p) => !p.nueva), `${k.nombre}: una pieza nueva quedó debajo de una que no lo es`);
  }
});
