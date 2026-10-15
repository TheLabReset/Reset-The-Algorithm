// npm run artefacto -- <salida.html>
// Arma la app en un solo HTML autocontenido (JS, CSS y tipografías adentro) para publicarla como página
// sin servidor. Usa la misma fuente que el build normal; solo cambia cómo se empaqueta.
// La salida es el contenido del <body> con su <title>: el publicador lo envuelve en su propio documento.
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { CLIENTE } from '../src/cliente.js';
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const raiz = join(fileURLToPath(import.meta.url), '..', '..');
const salida = process.argv[2] || join(raiz, 'dist-artefacto', 'the-algorithm.html');
const tmp = mkdtempSync(join(tmpdir(), 'algoritmo-'));

await build({
  configFile: false, root: raiz, base: './', logLevel: 'warn', plugins: [react()],
  build: {
    outDir: tmp, emptyOutDir: true, sourcemap: false, cssCodeSplit: false, modulePreload: false,
    assetsInlineLimit: 100_000_000, // tipografías e imágenes como data: dentro del CSS y del JS
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const assets = join(tmp, 'assets');
const archivos = readdirSync(assets);
const js = archivos.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const css = archivos.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
rmSync(tmp, { recursive: true, force: true });

const html = `<title>The Algorithm · ${CLIENTE.nombre}</title>
<meta name="description" content="The Algorithm, by The Lab: demo con data de muestra de ${CLIENTE.nombre}.">
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
writeFileSync(salida, html);
console.log(`${salida} · ${(Buffer.byteLength(html) / 1024).toFixed(0)} kB`);
