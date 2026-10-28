// Piezas y campañas dentro de cada plataforma: lo que reporta la propia plataforma (inversión, impresiones, clics y sus
// leads), sin CRM: las inscripciones no llegan a nivel de pieza. Cada campaña, conjunto y pieza lleva un estado con
// umbrales fijos y a la vista. Lo oficial: el aprendizaje (unos 50 resultados en 7 días en Meta y TikTok; TikTok pide 7
// días) y la fatiga de Meta (el costo por resultado llega al doble de su historia). Lo que es costumbre de la industria,
// y se dice así en la ayuda: juzgar gastos sin resultados al llegar a 3 veces el costo por lead, y «costosa» a 1,5 veces
// el promedio de su plataforma; por debajo, rinde. Las campañas de alcance no buscan leads y no entran. Puro.

import { sumarDias, diasEntre } from '../muestra/calendario.js';
import { detalleDe } from './produccion.js';

export const UMBRALES_PIEZAS = {
  diasAprendizaje: 7, // una pieza con menos días activa todavía aprende: no se juzga (TikTok, oficial)
  resultadosSemana: 50, // un conjunto de Meta o TikTok con menos leads en 7 días tiene el aprendizaje limitado (oficial)
  vecesGasto: 3, // para juzgar, la pieza tiene que haber gastado 3 veces el costo por lead de su plataforma (costumbre)
  vecesCostosa: 1.5, // costosa si su lead cuesta 1,5 veces el promedio de su plataforma o más; por debajo, rinde
  vecesSaturada: 2, // saturada si su lead de los últimos 7 días cuesta el doble que antes (la fatiga creativa de Meta, oficial)
  diasReciente: 7,
  leadsRecientes: 5, // para decir saturada, la última semana tiene que traer al menos estos leads: con menos, el costo es ruido
  leadsAntes: 10, // y su historia antes de esa semana, al menos estos
};
// el orden en que se leen: primero lo que pide mirar
export const ESTADOS = ['sin-leads', 'costosa', 'saturada', 'rinde', 'aprendizaje', 'poca-data'];
// lo nuevo: lo que empezó dentro del período y, si el período es largo, en sus últimos 30 días (en seis meses casi todo
// sería «nuevo» y el sello no diría nada)
export const DIAS_NUEVO = 30;
export const nuevoDesde = (P) => (P.dias > DIAS_NUEVO ? sumarDias(P.hasta, -(DIAS_NUEVO - 1)) : P.desde);
// la base de cada fila: el costo por lead de las campañas de leads de su mismo canal (Search y Display se comparan por
// separado: cuestan distinto por naturaleza)
const NOMBRE_BASE = { search: 'Search', display: 'Display', meta: 'Meta Ads', tiktok: 'TikTok Ads' };
export const PARA_REVISAR = ['sin-leads', 'costosa', 'saturada'];
// la fatiga creativa es una regla oficial de Meta y también se mira en TikTok; en Google no se publica
const CON_FATIGA = ['meta', 'tiktok'];

const suma = (xs) => xs.reduce((s, x) => s + (x || 0), 0);
function cifras(filas) {
  const inversion = suma(filas.map((f) => f.inversion)), leads = suma(filas.map((f) => f.leads));
  const impresiones = suma(filas.map((f) => f.impresiones)), clics = suma(filas.map((f) => f.clics));
  return { inversion, leads, impresiones, clics, cpl: leads ? inversion / leads : null, ctr: impresiones ? clics / impresiones : null };
}

// El estado de una pieza, un conjunto o una campaña frente al promedio de su plataforma (base: su costo por lead).
// El costo se compara redondeado, como se ve en pantalla, para que el estado y las cifras de la fila digan lo mismo
function estadoDe(x, base, { edad = null, fatiga = null } = {}) {
  const U = UMBRALES_PIEZAS;
  if (edad != null && edad < U.diasAprendizaje) return 'aprendizaje';
  if (!base || x.inversion < U.vecesGasto * base) return 'poca-data';
  if (!x.leads) return 'sin-leads';
  if (fatiga != null && fatiga >= U.vecesSaturada) return 'saturada';
  return Math.round(x.cpl * 100) / Math.max(1, Math.round(base * 100)) >= U.vecesCostosa ? 'costosa' : 'rinde';
}

export function leerPiezas(data, P) {
  const cfg = data.config, datos = detalleDe(data).piezas;
  if (!datos?.piezas.length) return null;
  const U = UMBRALES_PIEZAS;
  const filas = (id, a, b) => datos.dias.filter((d) => d.fecha >= a && d.fecha <= b && d[id]).map((d) => d[id]);
  const nombrePlataforma = Object.fromEntries(cfg.plataformas.map((p) => [p.id, p.nombre]));
  const conjuntoDe = Object.fromEntries(datos.conjuntos.map((c) => [c.id, c]));
  const recienteDesde = sumarDias(P.hasta, -(U.diasReciente - 1));
  const desdeNuevo = nuevoDesde(P);

  // las piezas con inversión en el período
  const piezas = datos.piezas.map((p) => {
    const ahora = cifras(filas(p.id, P.desde, P.hasta));
    if (!ahora.inversion) return null;
    // fatiga: el costo por lead de los últimos 7 días frente al de toda su vida antes de esos días
    const reciente = cifras(filas(p.id, recienteDesde, P.hasta)), antes = cifras(filas(p.id, p.inicio, sumarDias(recienteDesde, -1)));
    const fatiga = reciente.cpl && antes.cpl && antes.leads >= U.leadsAntes && reciente.leads >= U.leadsRecientes ? Math.round(reciente.cpl * 100) / Math.max(1, Math.round(antes.cpl * 100)) : null;
    const diasConGasto = filas(p.id, P.desde, P.hasta).filter((f) => f.inversion > 0).length;
    const ultimo = p.fin && p.fin < P.hasta ? p.fin : P.hasta;
    const c = conjuntoDe[p.conjunto];
    return {
      ...p, nivel: 'pieza', plataformaNombre: nombrePlataforma[p.plataforma], conjuntoNombre: c.nombre, campanaNombre: c.campanaNombre, ...ahora,
      // la edad no se conoce si la pieza ya corría cuando empieza la data: no se toma como recién publicada
      edad: p.inicio > cfg.desde ? diasEntre(p.inicio, ultimo) + 1 : null, diasConGasto, alAire: !p.fin || p.fin >= P.hasta,
      nueva: p.inicio >= desdeNuevo && p.inicio > cfg.desde,
      fatiga: CON_FATIGA.includes(p.plataforma) ? fatiga : null, saturacion: fatiga == null ? null : { antes: antes.cpl, ahora: reciente.cpl },
    };
  }).filter(Boolean);
  if (!piezas.length) return null;

  // la base de cada canal: su costo por lead en el período, con lo que reporta la plataforma (campañas que buscan leads)
  const bases = Object.fromEntries(cfg.canales.map((c) => [c.id, { id: c.id, nombre: NOMBRE_BASE[c.id] ?? c.nombre, ...cifras(piezas.filter((p) => p.canal === c.id)) }]));
  for (const p of piezas) { p.base = bases[p.canal].cpl; p.baseNombre = bases[p.canal].nombre; p.estado = estadoDe(p, p.base, { edad: p.edad, fatiga: p.fatiga }); }

  // conjuntos y campañas: la suma de sus piezas; un conjunto de Meta o TikTok activo con menos de 50 leads en 7 días
  // tiene el aprendizaje limitado (Google no publica ese umbral)
  const agrupar = (clave, nivel, nombre) => [...new Set(piezas.map((p) => p[clave]))].map((id) => {
    const de = piezas.filter((p) => p[clave] === id), p0 = de[0];
    const c = cifras(de), base = bases[p0.canal].cpl;
    const semana = cifras(de.flatMap((p) => filas(p.id, recienteDesde, P.hasta)));
    const alAire = de.some((p) => p.alAire);
    const limitado = nivel === 'conjunto' && alAire && CON_FATIGA.includes(p0.plataforma) && semana.leads < U.resultadosSemana;
    const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, de.filter((p) => p.estado === e).length]));
    // un grupo se juzga solo si alguna de sus piezas ya se puede juzgar; si no, toma el estado de ellas. Si más de la
    // mitad de su inversión está en piezas que piden mirarse, toma el estado de las que más se llevaron: un grupo no
    // dice «rinde» cuando lo que más gasta no rinde
    const juzgadas = de.filter((p) => !['aprendizaje', 'poca-data'].includes(p.estado));
    const porEstado = PARA_REVISAR.map((e) => [e, de.filter((p) => p.estado === e).reduce((t, p) => t + p.inversion, 0)]).sort((a, b) => b[1] - a[1]);
    const enRevisar = porEstado.reduce((t, [, v]) => t + v, 0);
    const mayoria = juzgadas.length && enRevisar > c.inversion / 2 ? { estado: porEstado[0][0], inversion: enRevisar } : null;
    const estado = mayoria ? mayoria.estado : juzgadas.length ? estadoDe(c, base) : de.some((p) => p.estado === 'aprendizaje') ? 'aprendizaje' : 'poca-data';
    return {
      id, nivel, nombre: nombre(p0), alAire, plataforma: p0.plataforma, plataformaNombre: p0.plataformaNombre, campana: p0.campana, canal: p0.canal, ...c, base, baseNombre: p0.baseNombre,
      estado, mayoria, mixto: new Set(de.map((p) => p.canal)).size > 1, limitado, leadsSemana: semana.leads, piezas: de.length, nuevas: de.filter((p) => p.nueva).length, cuenta, edad: de.some((p) => p.edad == null) ? null : Math.min(...de.map((p) => p.edad)),
    };
  });
  const conjuntos = agrupar('conjunto', 'conjunto', (p) => p.conjuntoNombre);
  const campanas = agrupar('campana', 'campana', (p) => p.campanaNombre);

  // primero lo que sigue activo (se puede tocar); dentro, lo nuevo, después lo que pide mirarse y lo que más gasta
  const orden = (a, b) => (a.alAire === false) - (b.alAire === false) || (b.nueva === true) - (a.nueva === true)
    || ESTADOS.indexOf(a.estado) - ESTADOS.indexOf(b.estado) || b.inversion - a.inversion;
  // campañas y conjuntos: primero los que tienen más piezas que piden mirarse
  const revisarEn = (g) => PARA_REVISAR.reduce((t, e) => t + g.cuenta[e], 0) + (PARA_REVISAR.includes(g.estado) ? 1 : 0);
  const ordenGrupo = (a, b) => revisarEn(b) - revisarEn(a) || (a.alAire === false) - (b.alAire === false) || b.inversion - a.inversion;
  const total = suma(piezas.map((p) => p.inversion));
  const porEstado = Object.fromEntries(ESTADOS.map((e) => { const de = piezas.filter((p) => p.estado === e); return [e, { n: de.length, inversion: suma(de.map((p) => p.inversion)) }]; }));
  const revisar = piezas.filter((p) => PARA_REVISAR.includes(p.estado));
  return {
    desde: P.desde, hasta: P.hasta, nuevoDesde: desdeNuevo,
    plataformas: cfg.plataformas.filter((pl) => piezas.some((p) => p.plataforma === pl.id)).map((pl) => ({ id: pl.id, nombre: pl.nombre })),
    bases: cfg.canales.map((c) => bases[c.id]).filter((b) => b.inversion > 0), total,
    piezas: piezas.sort(orden), conjuntos: conjuntos.sort(ordenGrupo), campanas: campanas.sort(ordenGrupo),
    porEstado, revisar: { n: revisar.length, inversion: suma(revisar.map((p) => p.inversion)) },
    alAire: piezas.filter((p) => p.alAire).length, nuevas: piezas.filter((p) => p.nueva).length,
  };
}
