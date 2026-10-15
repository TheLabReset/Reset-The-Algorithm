// Prueba negativa del chequeo de Quincha: cada regla debe atrapar un error sembrado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { revisar, contraste, TOKENS } from '../herramientas/revisar-sistema.mjs';

const tokens = readFileSync(new URL('../src/sistema/tokens.css', import.meta.url), 'utf8');
// un componente mínimo que usa todos los semánticos, para que solo falle lo sembrado
const semanticos = [...new Set([...tokens.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]).filter((k) => !k.startsWith('p-')))];
const usaTodo = `.x { ${semanticos.map((s, i) => `--u${i}: var(--${s});`).join(' ')} }`;
const conAdemas = (extra) => revisar({ [TOKENS]: tokens, 'src/ok.css': usaTodo, ...extra });

test('el sistema limpio no da errores', () => {
  assert.deepEqual(conAdemas({}).errores, []);
});

test('atrapa colores literales en CSS y en JSX', () => {
  assert.ok(conAdemas({ 'src/a.css': '.a { color: #ff0000; }' }).errores.some((e) => e.includes('#ff0000')));
  assert.ok(conAdemas({ 'src/a.css': '.a { fill: rgb(1 2 3); }' }).errores.some((e) => e.includes('rgb(')));
  assert.ok(conAdemas({ 'src/a.css': '.a { stroke: red; }' }).errores.some((e) => e.includes('color con nombre')));
  assert.ok(conAdemas({ 'src/A.jsx': '<path stroke="#8884d8" />' }).errores.some((e) => e.includes('#8884d8')));
});

test('no confunde un enlace a una sección con un color', () => {
  assert.deepEqual(conAdemas({ 'src/A.jsx': "<a href={'#' + id}>ir</a>; const u = 'url(#abc)';" }).errores, []);
});

test('atrapa tamaños, espacios, radios, sombras y duraciones literales', () => {
  const r = conAdemas({ 'src/a.css': '.a { font-size: 14px; padding: 12px; border-radius: 8px; box-shadow: 0 1px 2px black; transition: color 150ms; }' }).errores.join('\n');
  for (const regla of ['font-size literal', 'padding con 12px', 'border-radius literal', 'box-shadow literal', 'duración literal']) assert.ok(r.includes(regla), regla);
});

test('permite bordes finos y valores tokenizados', () => {
  assert.deepEqual(conAdemas({ 'src/a.css': '.a { padding: 2px var(--e-2); border-radius: var(--r-control); margin: -1px; transition: color var(--d-110) var(--curva-productiva); }' }).errores, []);
});

test('atrapa franjas de resalte y deja pasar bordes finos', () => {
  assert.ok(conAdemas({ 'src/a.css': '.a { border-left: 4px solid var(--acento); }' }).errores.some((e) => e.includes('franja de resalte')));
  assert.ok(conAdemas({ 'src/a.css': '.a { border-top-width: 3px; }' }).errores.some((e) => e.includes('franja de resalte')));
  assert.deepEqual(conAdemas({ 'src/a.css': '.a { border-left: 2px solid var(--texto-1); border: 1px solid var(--borde); }' }).errores, []);
});

test('atrapa primitivos usados en componentes y tokens sin declarar', () => {
  assert.ok(conAdemas({ 'src/a.css': '.a { color: var(--p-violeta-700); }' }).errores.some((e) => e.includes('primitivo --p-violeta-700')));
  assert.ok(conAdemas({ 'src/a.css': '.a { color: var(--inventado); }' }).errores.some((e) => e.includes('--inventado se usa')));
});

test('atrapa huérfanos en las dos direcciones', () => {
  const conPrimitivoSuelto = tokens.replace(':root {', ':root {\n  --p-suelto: #123456;');
  assert.ok(revisar({ [TOKENS]: conPrimitivoSuelto, 'src/ok.css': usaTodo }).errores.some((e) => e.includes('primitivo huérfano --p-suelto')));
  assert.ok(revisar({ [TOKENS]: tokens, 'src/ok.css': '.x { color: var(--texto-1); }' }).errores.some((e) => e.includes('semántico huérfano')));
});

test('atrapa contraste insuficiente y temas alternos que no coinciden', () => {
  const bajo = tokens.replace('--texto-3: var(--p-n-600);', '--texto-3: var(--p-n-300);');
  assert.notEqual(bajo, tokens);
  assert.ok(revisar({ [TOKENS]: bajo, 'src/ok.css': usaTodo }).errores.some((e) => e.includes('contraste de --texto-3')));
  const distinto = tokens.replace(/(:root\[data-theme="dark"\] \{[\s\S]*?--borde: )var\(--p-o-750\)/, '$1var(--p-o-700)');
  assert.notEqual(distinto, tokens);
  assert.ok(revisar({ [TOKENS]: distinto, 'src/ok.css': usaTodo }).errores.some((e) => e.includes('--borde difiere')));
});

test('el contraste coincide con valores de referencia WCAG', () => {
  assert.equal(+contraste('#000000', '#ffffff').toFixed(2), 21);
  assert.equal(+contraste('#777777', '#ffffff').toFixed(2), 4.48);
});
