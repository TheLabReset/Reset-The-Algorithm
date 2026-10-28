// Lecturas que nacen con las cuatro capas: la ficha de cada plataforma, el embudo por fuente, el acumulado,
// el índice y los resúmenes. Observan, no ordenan; dos frases como máximo; las comparaciones dicen frente a qué.
import { numero, dolares, fechaCorta, fechaSinAnio } from '../sistema/formato.js';
import { comparacionTexto, enLetras, capital, enElPeriodo, delPeriodo } from './comun.js';
import { CLIENTE } from '../cliente.js';

// Ficha de una plataforma en Activación
export function plataformaLectura(p) {
  const n = p.campanas.length;
  const base = `${numero(p.leads)} leads a ${dolares(p.cpl, 2)} en ${enLetras(n, true)} ${n === 1 ? 'campaña' : 'campañas'} con gasto.`;
  return { titulo: p.nombre, lectura: p.objetivo != null && p.cpl > p.objetivo ? `${base} Su objetivo es ${dolares(p.objetivo, 2)} por lead.` : base };
}

// Leads de la cohorte por fuente y cuántos se inscribieron
export function embudoFuente(v) {
  const o = v.lee.crm.porOrigen.filter((x) => x.leads > 0 && !x.pocosCasos && x.tasaAlta != null);
  const titulo = 'Leads e inscripciones por fuente';
  if (o.length < 2) return { titulo, lectura: 'Pocas fuentes con inscripciones suficientes para compararlas.' };
  const orden = [...o].sort((a, b) => b.tasaAlta - a.tasaAlta);
  const [mejor, peor] = [orden[0], orden.at(-1)];
  return { titulo, lectura: `De cada 100 leads de ${mejor.nombre}, ${numero(Math.round(mejor.tasaAlta * 100))} se inscribieron; de ${peor.nombre}, ${numero(Math.round(peor.tasaAlta * 100))}.` };
}

// Acumulado del mes en el CRM, frente al mismo tramo de la comparación
export function acumuladoLectura(v) {
  const c = v.lee.crmDetalle;
  const titulo = `Acumulado ${delPeriodo(v.periodo)}`;
  if (c.totalPrevio == null) return { titulo, lectura: `${numero(c.total)} leads en el CRM ${enElPeriodo(v.periodo)}. No hay dato completo de ${comparacionTexto(v.periodo)} para comparar.` };
  return { titulo, lectura: `${numero(c.total)} leads en el CRM, frente a ${numero(c.totalPrevio)} en ${comparacionTexto(v.periodo)}.` };
}

// Índice de oportunidad: el número, su banda y cómo se movió frente al mes anterior
export function indiceLectura(ix) {
  const titulo = 'Índice de oportunidad';
  if (ix.valor == null) return { titulo, lectura: 'Falta algún componente para calcularlo en esta fecha.' };
  // la comparación es el día antes del período: «frente al 18 de octubre»
  const antes = `el ${fechaSinAnio(ix.fechaPrevio)}`;
  const mov = ix.cambio == null ? '' : Math.round(ix.cambio) === 0 ? ` Igual que ${antes}.` : ` ${Math.round(ix.cambio) > 0 ? 'Sube' : 'Baja'} ${numero(Math.abs(Math.round(ix.cambio)))} ${Math.abs(Math.round(ix.cambio)) === 1 ? 'punto' : 'puntos'} frente al ${fechaSinAnio(ix.fechaPrevio)}.`;
  return { titulo, lectura: `Qué tan favorable está el mercado para captar ${CLIENTE.clientes}, de 0 a 100.${mov}` };
}

export const bandaTexto = (banda) => (banda ? `${capital(banda.nombre)} para captar ${CLIENTE.clientes}` : '');

// Una frase por plataforma para el resumen: cuánto pagó por lead y qué tan lejos quedó de su objetivo.
// La distancia lleva el color (rojo si pasa el objetivo, verde si queda debajo); las cifras, negrita.
export function objetivoFrase(p) {
  if (p.cpl == null || p.objetivo == null) return [{ t: `${p.nombre} no tiene objetivo de costo por lead cargado.` }];
  const d = Math.round(p.difObjetivo * 100) / 100;
  if (d === 0) return [{ t: `${p.nombre} pagó ` }, { t: dolares(p.cpl, 2), cifra: true }, { t: ' por lead, justo en su objetivo.' }];
  return [
    { t: `${p.nombre} pagó ` }, { t: dolares(p.cpl, 2), cifra: true }, { t: ' por lead: ' },
    { t: `${dolares(Math.abs(d), 2)} ${d > 0 ? 'por encima' : 'por debajo'}`, tono: d > 0 ? 'empeora' : 'mejora' },
    { t: ' de su objetivo de ' }, { t: dolares(p.objetivo, 2), cifra: true }, { t: '.' },
  ];
}

// ── Anuncios de la competencia (el abanico) ──
// «10 oct», y con el año cuando no es el de la lectura («3 mar 2025»)
export function fechaDelAnuncio(iso, anio) {
  if (!iso) return '';
  const t = fechaCorta(iso);
  return iso.slice(0, 4) === String(anio ?? '') ? t : `${t} ${iso.slice(0, 4)}`;
}
const segun = (n, uno, varios) => (n === 1 ? uno : varios);
// Lo que va después de «N anuncios» en el mazo. Con uno solo no hay «el más reciente».
export function detalleDelMazo(g, anio) {
  const d = g.anuncios.find((a) => a.desde)?.desde;
  if (!d) return '';
  return g.anuncios.length === 1 ? `desde el ${fechaDelAnuncio(d, anio)}` : `el más reciente, del ${fechaDelAnuncio(d, anio)}`;
}
// El orden se promete solo cuando hay más de uno y tienen fecha para ordenarlos
export const ordenDeLaVentana = (g) => (g.anuncios.length > 1 && g.anuncios.some((a) => a.desde) ? ', del más reciente al más antiguo' : '');
export const cuentaAnuncios = (n) => `${numero(n)} ${segun(n, 'anuncio', 'anuncios')}`;
export const verAnuncios = (n) => `Ver ${segun(n, 'el anuncio', 'todos')}`;
export const verSusAnuncios = (n) => `Ver ${segun(n, 'su anuncio', `sus ${numero(n)} anuncios`)}`;
// Lo que dice una pieza de muestra, que no trae texto propio: su formato y su tema
export const textoDeMuestra = (a) => (a.formato ? `${a.formato} sobre ${a.titulo.toLowerCase()}.` : '');
export function metaDelAnuncio(a, anio) {
  return [a.plataformas.join(' · '), a.desde && `desde el ${fechaDelAnuncio(a.desde, anio)}`, !a.activo && 'ya no está activo'].filter(Boolean).join(' · ');
}
export function notaSinContenido(n) {
  if (!n) return null;
  return `${segun(n, 'Un anuncio llegó', `${numero(n)} anuncios llegaron`)} sin título, texto ni imagen, y no ${segun(n, 'se muestra', 'se muestran')}.`;
}
// Lectura de la tarjeta: quién tiene más anuncios activos, y la marca propia frente a eso
export function anunciosLectura(a) {
  const titulo = 'Anuncios de la competencia';
  if (!a.grupos.length) return { titulo, lectura: 'La biblioteca de anuncios no trajo anuncios de la competencia en el mes.' };
  const [primero] = a.grupos;
  const propia = a.propio ? ` ${a.propio.nombre} tiene ${cuentaAnuncios(a.propio.anuncios.length)}.` : '';
  return { titulo, lectura: `${primero.nombre} tiene ${cuentaAnuncios(primero.anuncios.length)} activos en Meta, más que cualquier otra marca que se sigue.${propia}` };
}
// Todos los textos que el abanico necesita, armados para la lectura de un mes
export function textosDelAbanico(a, anio) {
  return {
    propio: 'los propios, para comparar',
    cuenta: cuentaAnuncios,
    detalle: (g) => detalleDelMazo(g, anio),
    ver: verAnuncios,
    bajada: (g) => `${cuentaAnuncios(g.anuncios.length)}${ordenDeLaVentana(g)}`,
    meta: (x) => metaDelAnuncio(x, anio),
    texto: textoDeMuestra,
    sinContenido: notaSinContenido(a.sinContenido),
    // los que empezaron dentro del período: «2 nuevos en el período»
    nuevos: (n) => `${numero(n)} ${segun(n, 'nuevo', 'nuevos')} en el período`,
  };
}
