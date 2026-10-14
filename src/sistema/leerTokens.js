// Lector de tokens.css, puro: lo usan el chequeo (npm run sistema) y la guía viva, así los dos leen lo mismo.
export const quitarComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Bloques del archivo de tokens: el :root base y el otro tema, por preferencia del sistema y por botón.
// Sirve en las dos direcciones: base clara con oscuro alterno, o base oscura con claro alterno.
export function bloquesDeTokens(css) {
  const limpio = quitarComentarios(css);
  const definiciones = (texto) => Object.fromEntries([...texto.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const raiz = limpio.match(/^:root\s*\{([\s\S]*?)\n\}/m);
  const media = limpio.match(/@media \(prefers-color-scheme: (dark|light)\)\s*\{\s*:root:not\(\[data-theme="(?:light|dark)"\]\)\s*\{([\s\S]*?)\}\s*\}/);
  const alterno = media?.[1] === 'light' ? 'claro' : 'oscuro';
  const boton = limpio.match(new RegExp(`:root\\[data-theme="${media?.[1] || 'dark'}"\\]\\s*\\{([\\s\\S]*?)\\}`));
  return {
    base: definiciones(raiz?.[1] || ''), altMedia: definiciones(media?.[2] || ''), altBoton: definiciones(boton?.[1] || ''), todas: definiciones(limpio),
    temaBase: alterno === 'claro' ? 'oscuro' : 'claro', temaAlterno: alterno,
  };
}

function hexARgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
const luminancia = (hex) => { const [r, g, b] = hexARgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };


// Valor final de un token en un tema: sigue las referencias var() hasta un color
export function resolver(base, tema, k) {
  let v = tema[k] ?? base[k];
  for (let i = 0; i < 4 && v && v.startsWith('var('); i++) { const r = v.match(/var\(--([\w-]+)\)/)[1]; v = tema[r] ?? base[r]; }
  return v;
}

// Comentario de una línea junto a la definición: es la documentación del token
export function comentarios(css) {
  return Object.fromEntries([...css.matchAll(/--([\w-]+)\s*:[^;]+;\s*\/\*\s*([^*]+?)\s*\*\//g)].map((m) => [m[1], m[2]]));
}
