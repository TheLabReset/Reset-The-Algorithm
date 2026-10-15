// Arma la galería en un solo HTML, sin dependencias: cada módulo queda en su propio ámbito.
// Uso: node docs/rediseno/galeria/armar.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const ORDEN = ['muestra/azar.js', 'muestra/calendario.js', 'muestra/formato.js', 'muestra/configuracion.js', 'muestra/generador.js', 'muestra/vista.js', 'formas.js', 'app.js'];
const clave = (ruta) => basename(ruta, '.js');

let js = 'const __m = {};\n';
for (const ruta of ORDEN) {
  let src = readFileSync(join(aqui, ruta), 'utf8');
  const exportados = [];
  src = src.replace(/^import \{([^}]+)\} from '([^']+)';$/gm, (_, nombres, de) => `const {${nombres}} = __m['${clave(de)}'];`);
  src = src.replace(/^export (async function|function|const|let|class) ([A-Za-z_$][\w$]*)/gm, (_, tipo, nombre) => { exportados.push(nombre); return `${tipo} ${nombre}`; });
  if (/^\s*(import|export)\b/m.test(src)) throw new Error(`${ruta}: quedó un import o export que el armador no entiende`);
  js += `__m['${clave(ruta)}'] = (() => {\n${src}\nreturn { ${exportados.join(', ')} };\n})();\n`;
}
js = js.replace(/<\/script/gi, '<\\/script');

const plantilla = readFileSync(join(aqui, 'plantilla.html'), 'utf8');
const cuerpo = plantilla.replace('<!--APP-->', `<script type="module">\n${js}</script>`);
// Para publicar: el servicio pone doctype, html, head y body. Para el repo: documento completo.
writeFileSync(join(aqui, 'artefacto.html'), cuerpo);
const corte = cuerpo.indexOf('<div class="envoltura">');
writeFileSync(join(aqui, 'index.html'), `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${cuerpo.slice(0, corte)}</head>\n<body>\n${cuerpo.slice(corte)}\n</body>\n</html>\n`);
console.log(`galería armada: ${(cuerpo.length / 1024).toFixed(0)} kB`);
