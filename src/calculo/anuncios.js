// Anuncios de la competencia (biblioteca de anuncios de Meta): limpia cada anuncio, agrupa por anunciante,
// separa la marca propia y ordena. Puro: la pantalla pinta lo que esto decide.
// Sirve para la data real (lo que deja el scraper de la biblioteca) y para la muestra (tema y formato, sin pieza).

/** Cuántas piezas se apilan en el mazo. */
export const VISTA_PREVIA = 3;

const PLATAFORMAS = {
  FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', AUDIENCE_NETWORK: 'Audience Network',
  MESSENGER: 'Messenger', WHATSAPP: 'WhatsApp', THREADS: 'Threads',
};
// El enlace y la imagen vienen de un scraper: solo pasan si son lo que dicen ser.
const ENLACE_BIBLIOTECA = /^https:\/\/(www\.)?facebook\.com\/ads\/library\//;
const IMAGEN_DE_META = /^https:\/\/[a-z0-9.-]+\.fbcdn\.net\//i;
const SIN_IDENTIFICAR = new Set(['desconocida', 'desconocido', 'unknown', '']);

export const nombrePlataforma = (p) => PLATAFORMAS[p] ?? String(p || '').toLowerCase()
  .replace(/(^|_)(\w)/g, (_, s, c) => `${s ? ' ' : ''}${c.toUpperCase()}`);

/** `AAAA-MM-DD` o null. Acepta segundos o milisegundos desde 1970. */
export function fechaDeInicio(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' || /^\d{9,}$/.test(String(v))) {
    const s = Number(v);
    const d = new Date(s > 1e12 ? s : s * 1000);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

const limpio = (t) => (typeof t === 'string' ? t.trim() : '');

/** Un anuncio tal como lo deja el scraper de la biblioteca, normalizado. */
export function anuncio(a) {
  return {
    id: String(a?.id ?? ''),
    titulo: limpio(a?.title),
    texto: limpio(a?.text || a?.body),
    pie: limpio(a?.link_caption),
    plataformas: [...new Set((a?.platforms || []).map(nombrePlataforma).filter(Boolean))],
    desde: fechaDeInicio(a?.start_date),
    activo: a?.is_active !== false,
    enlace: ENLACE_BIBLIOTECA.test(String(a?.ad_library_link || '')) ? a.ad_library_link : null,
    imagen: IMAGEN_DE_META.test(String(a?.image_url || '')) ? a.image_url : null,
    formato: null,
    arte: null,
  };
}

/** Un anuncio de la muestra: sin pieza, sin enlace; el tema hace de título y la pantalla dibuja el arte de muestra. */
export const anuncioDeMuestra = (a) => ({
  id: a.id, titulo: a.tema, texto: '', pie: '', plataformas: a.plataformas.map(nombrePlataforma), desde: a.desde,
  activo: a.activo, enlace: null, imagen: null, formato: a.formato, arte: a.arte,
});

const tieneQueMostrar = (x) => !!(x.titulo || x.texto || x.imagen || x.enlace || x.arte != null);

/**
 * Agrupa por anunciante. `marcas`: [{ nombre, propia?, anuncios: [normalizados] }].
 * Devuelve { grupos, propio, sinContenido, total }: la competencia de la que más anuncios tiene a la que menos
 * («Sin identificar» al final), la marca propia aparte, y cuántos anuncios llegaron sin nada que mostrar.
 */
export function agruparAnuncios(marcas) {
  let sinContenido = 0;
  const porNombre = new Map();
  for (const m of marcas || []) {
    const conAlgo = (m.anuncios || []).filter(tieneQueMostrar);
    sinContenido += (m.anuncios || []).length - conAlgo.length;
    if (!conAlgo.length) continue;
    const crudo = limpio(m.nombre).replace(/\s+/g, ' ');
    const nombre = SIN_IDENTIFICAR.has(crudo.toLowerCase()) ? 'Sin identificar' : crudo;
    const clave = nombre.toLowerCase(); // mismo nombre salvo mayúsculas = uno solo
    if (!porNombre.has(clave)) porNombre.set(clave, { nombre, propia: false, anuncios: [] });
    const g = porNombre.get(clave);
    g.propia = g.propia || !!m.propia;
    g.anuncios.push(...conAlgo);
  }
  const todos = [...porNombre.values()];
  for (const g of todos) g.anuncios.sort((a, b) => (b.desde || '').localeCompare(a.desde || '') || a.id.localeCompare(b.id)); // recientes primero
  const propio = todos.find((g) => g.propia) ?? null;
  const grupos = todos.filter((g) => g !== propio)
    .sort((a, b) => (a.nombre === 'Sin identificar') - (b.nombre === 'Sin identificar') || b.anuncios.length - a.anuncios.length || a.nombre.localeCompare(b.nombre));
  return { grupos, propio, sinContenido, total: grupos.reduce((s, g) => s + g.anuncios.length, 0) };
}
