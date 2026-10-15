// npm run sistema · vigila las reglas de Quincha sobre el código real.
//  1. Ningún color literal fuera de tokens.css (CSS, JSX, JS).
//  2. Tamaños de letra, espacios, radios, sombras y duraciones salen de tokens.
//  3. Huérfanos en las dos direcciones: todo primitivo lo usa un semántico, todo semántico lo usa un componente,
//     y ningún componente usa un primitivo ni un token que no existe.
//  4. Los dos bloques del tema alterno (preferencia del sistema y botón) son idénticos.
//  5. Contraste WCAG medido de cada token de texto y de gráfico sobre cada superficie, en los dos temas.
// La función revisar() es pura: recibe { ruta: contenido } y devuelve errores. La prueba negativa la usa con archivos sembrados.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { quitarComentarios, bloquesDeTokens, contraste } from '../src/sistema/leerTokens.js';

export { contraste };

export const TOKENS = 'src/sistema/tokens.css';
const SUPERFICIES = ['fondo', 'superficie-capitulo', 'superficie', 'elevada'];
// los gráficos solo viven dentro de tarjetas
const SUPERFICIES_GRAFICO = ['superficie'];
// texto: 4,5:1 sobre toda superficie (WCAG 1.4.3)
const TEXTO = ['texto-1', 'texto-2', 'texto-3', 'acento-texto', 'mejora', 'empeora', 'atencion'];
// marcas de interfaz que hay que ver: 3:1 sobre toda superficie (WCAG 1.4.11)
const INTERFAZ = ['borde-control', 'acento', 'foco'];
// marcas de datos: 3:1 sobre las superficies donde hay gráficos
const GRAFICO = ['s1', 'resalte', 's2', 's3', 's4', 'previa'];
// colores que conviven en un mismo gráfico: tienen que separarse entre sí, no solo del fondo.
// Regla de la casa: nunca dos grises vecinos que se confundan (asumo 1,2:1 entre escalones como piso perceptible
// para rellenos grandes; 2:1 entre la serie y su comparación).
const CONVIVEN = [
  ['s1', 'previa', 2], ['banda-0', 'superficie', 1.2], ['s1', 'banda-0', 4.5], ['borde-control', 'superficie', 3],
  ['serie-1', 'superficie', 3], ['serie-1', 'serie-resto', 2], ['serie-resto', 'superficie', 1.4],
  ['q0', 'q1', 1.2], ['q1', 'q2', 1.2], ['q2', 'q3', 1.2], ['q3', 'q4', 1.2], ['q4', 'q5', 1.2], ['q5', 'q6', 1.2],
];
// pares fijos: texto sobre un relleno
const PARES = [['sobre-seleccion', 'seleccion', 4.5], ['sobre-barra', 'barra', 4.5], ['sobre-barra-2', 'barra', 4.5]];

const PROP_COLOR = /^(color|background(-color)?|fill|stroke|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|box-shadow|text-decoration-color|caret-color|accent-color)$/;
const NOMBRADOS = /\b(white|black|red|green|blue|gray|grey|purple|violet|orange|yellow|pink|navy|silver|maroon|teal|aqua|fuchsia|lime|olive)\b/i;
const PROP_ESPACIO = /^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$/;

export function revisar(archivos) {
  const errores = [];
  const err = (ruta, msg) => errores.push(`${ruta}: ${msg}`);
  const tokensCss = archivos[TOKENS];
  if (!tokensCss) return { errores: [`falta ${TOKENS}`], informe: [] };
  const { base, altMedia, altBoton, todas, temaBase, temaAlterno } = bloquesDeTokens(tokensCss);
  const primitivos = Object.keys(base).filter((k) => k.startsWith('p-'));
  const semanticos = Object.keys(todas).filter((k) => !k.startsWith('p-'));
  const otros = Object.entries(archivos).filter(([r]) => r !== TOKENS);

  // 1 y 2 · literales
  for (const [ruta, texto0] of otros) {
    const esCss = ruta.endsWith('.css');
    const texto = esCss ? quitarComentarios(texto0) : texto0.replace(/^\s*\/\/.*$/gm, '');
    for (const m of texto.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const previo = texto.slice(Math.max(0, m.index - 12), m.index);
      if (/(href|url\()\s*=?\s*['"(]?$/.test(previo)) continue;
      err(ruta, `color literal ${m[0]}`);
    }
    for (const m of texto.matchAll(/\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/g)) err(ruta, `color literal ${m[0]}…)`);
    if (!esCss) continue;
    for (const m of texto.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);?/g)) {
      const [, prop, valor] = m;
      if (prop.startsWith('--')) continue;
      if (PROP_COLOR.test(prop) && NOMBRADOS.test(valor)) err(ruta, `color con nombre en ${prop}: ${valor.trim()}`);
      if (prop === 'font-size' && !/^(var\(|inherit|100%)/.test(valor.trim())) err(ruta, `font-size literal: ${valor.trim()}`);
      if (prop === 'font' && /\d+(px|rem|em)\b/.test(valor) && !/var\(--t-|var\(--c-/.test(valor)) err(ruta, `font con tamaño literal: ${valor.trim()}`);
      if (PROP_ESPACIO.test(prop)) for (const n of valor.matchAll(/(-?\d*\.?\d+)px/g)) if (Math.abs(+n[1]) > 2) err(ruta, `${prop} con ${n[0]} literal`);
      if (prop === 'border-radius' && !/^(var\(|50%|0|2px)/.test(valor.trim())) err(ruta, `border-radius literal: ${valor.trim()}`);
      if (prop === 'box-shadow' && !/^(var\(|none)/.test(valor.trim())) err(ruta, `box-shadow literal: ${valor.trim()}`);
      // Sin franjas de resalte: una tarjeta con una barra de color al costado (o arriba) es el resalte de
      // plantilla que el estándar prohíbe. Lo importante se resalta con el orden, el tamaño o el peso del texto.
      if (/^border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-width)?$/.test(prop)) for (const n of valor.matchAll(/(\d*\.?\d+)px/g)) if (+n[1] > 2) err(ruta, `${prop} de ${n[0]}: franja de resalte; se resalta con orden, tamaño o peso, no con bordes gruesos`);
      if (/^(transition|animation)(-duration)?$/.test(prop) && /(^|[\s,])\d*\.?\d+m?s\b/.test(valor)) err(ruta, `duración literal en ${prop}: ${valor.trim()}`);
    }
  }

  // 3 · huérfanos y referencias
  const refsEnTokens = new Set([...quitarComentarios(tokensCss).matchAll(/var\(--([\w-]+)\)/g)].map((m) => m[1]));
  for (const p of primitivos) if (!refsEnTokens.has(p)) err(TOKENS, `primitivo huérfano --${p}: ningún semántico lo usa`);
  const usados = new Set();
  const definidosFuera = new Set();
  for (const [ruta, texto] of otros) {
    for (const m of texto.matchAll(/var\(--([\w-]+)/g)) {
      usados.add(m[1]);
      if (m[1].startsWith('p-')) err(ruta, `usa el primitivo --${m[1]}; los componentes solo tocan semánticos`);
    }
    for (const m of texto.matchAll(/['"]?--([\w-]+)['"]?\s*:/g)) definidosFuera.add(m[1]);
  }
  for (const s of semanticos) if (!usados.has(s)) err(TOKENS, `semántico huérfano --${s}: ningún componente lo usa`);
  for (const u of usados) if (!(u in todas) && !definidosFuera.has(u)) err('src', `--${u} se usa pero no está declarado`);

  // 4 · los dos bloques del tema alterno iguales, y cada semántico del alterno existe en el base
  if (!Object.keys(altBoton).length) err(TOKENS, `falta el bloque :root[data-theme] del tema ${temaAlterno}`);
  const claves = new Set([...Object.keys(altMedia), ...Object.keys(altBoton)]);
  for (const k of claves) {
    if (altMedia[k] !== altBoton[k]) err(TOKENS, `--${k} difiere entre el ${temaAlterno} por preferencia (${altMedia[k]}) y el ${temaAlterno} por botón (${altBoton[k]})`);
    if (!(k in base)) err(TOKENS, `--${k} existe solo en el tema ${temaAlterno}; todo token se declara primero en :root`);
  }

  // 5 · contraste
  const informe = [];
  const resolver = (tema, k) => {
    let v = tema[k] ?? base[k];
    for (let i = 0; i < 4 && v && v.startsWith('var('); i++) { const r = v.match(/var\(--([\w-]+)\)/)[1]; v = tema[r] ?? base[r]; }
    return v && /^#[0-9a-f]{3,8}$/i.test(v) ? v : null;
  };
  for (const [nombre, tema] of [[temaBase, base], [temaAlterno, { ...base, ...altBoton }]]) {
    const medir = (a, b, minimo, tipo) => {
      const ca = resolver(tema, a), cb = resolver(tema, b);
      if (!ca || !cb) { err(TOKENS, `no se pudo resolver --${a} o --${b} en el tema ${nombre}`); return; }
      const c = contraste(ca, cb);
      informe.push({ tema: nombre, token: a, sobre: b, contraste: +c.toFixed(2), minimo, tipo });
      if (c < minimo) err(TOKENS, `contraste de --${a} sobre --${b} en ${nombre}: ${c.toFixed(2)}:1, mínimo ${minimo}:1`);
    };
    for (const t of TEXTO) for (const s of SUPERFICIES) medir(t, s, 4.5, 'texto');
    for (const g of INTERFAZ) for (const s of SUPERFICIES) medir(g, s, 3, 'interfaz');
    for (const g of GRAFICO) for (const s of SUPERFICIES_GRAFICO) medir(g, s, 3, 'gráfico');
    for (const [a, b, min] of PARES) medir(a, b, min, 'par');
    for (const [a, b, min] of CONVIVEN) medir(a, b, min, 'conviven');
  }
  return { errores, informe, primitivos: primitivos.length, semanticos: semanticos.length };
}

// ── Línea de comandos ──
function leerSrc(raiz) {
  const archivos = {};
  const recorrer = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) recorrer(p);
      else if (/\.(css|jsx?|mjs)$/.test(n)) archivos[relative(raiz, p)] = readFileSync(p, 'utf8');
    }
  };
  recorrer(join(raiz, 'src'));
  return archivos;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raiz = join(fileURLToPath(import.meta.url), '..', '..');
  const { errores, informe, primitivos, semanticos } = revisar(leerSrc(raiz));
  const peor = (tipo) => informe.filter((f) => f.tipo === tipo).sort((a, b) => a.contraste - b.contraste)[0];
  console.log(`Quincha · ${primitivos} primitivos, ${semanticos} semánticos, ${informe.length} pares de contraste medidos`);
  for (const t of ['texto', 'interfaz', 'gráfico', 'par', 'conviven']) { const p = peor(t); if (p) console.log(`  peor ${t}: --${p.token} sobre --${p.sobre} (${p.tema}) ${p.contraste}:1, mínimo ${p.minimo}:1`); }
  if (errores.length) { console.error(`\n${errores.length} problema(s):\n` + errores.map((e) => '  · ' + e).join('\n')); process.exit(1); }
  console.log('Sin problemas.');
}
