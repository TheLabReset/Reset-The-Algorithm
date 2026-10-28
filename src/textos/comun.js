// Piezas de texto comunes. Puras: reciben datos ya calculados y devuelven frases en español peruano.
import { mesLargo, mesCorto, variacion, numero } from '../sistema/formato.js';

export const mesTexto = (aaaamm) => `${mesLargo(+aaaamm.slice(5, 7))} de ${aaaamm.slice(0, 4)}`;
// El período elegido: «setiembre de 2026», «lo que va de octubre», «los días del 19 al 25 de octubre», «el día 25 de octubre»
export const periodoTexto = (P) => (P.tramo || !P.mes ? (P.desde === P.hasta ? `el día ${tramoFechas(P.desde, P.hasta).replace(/^el /, '')}` : `los días ${tramoFechas(P.desde, P.hasta)}`)
  : !P.parcial ? mesTexto(P.mes) : P.enCurso ? `lo que va de ${mesLargo(+P.mes.slice(5, 7))}` : `${mesLargo(+P.mes.slice(5, 7))} desde el ${Number(P.desde.slice(8, 10))}`);
// La comparación: el mes anterior, el mismo tramo del mes anterior, los mismos días justo antes o un año antes
export function comparacionTexto(P) {
  if (P.comparar === 'anio') return P.mes && !P.parcial ? mesTexto(P.compararDesde.slice(0, 7)) : `los mismos días de ${P.compararDesde.slice(0, 4)}`;
  if (P.tramo) return P.dias === 1 ? 'el día anterior' : `los ${numero(P.dias)} días anteriores`;
  if (P.mes && P.parcial) return `el mismo tramo de ${mesLargo(+P.compararDesde.slice(5, 7))}`;
  return mesTexto(P.compararDesde.slice(0, 7));
}
// «frente al mismo tramo de setiembre», «frente a los 7 días anteriores»: la contracción del artículo
export const frenteATexto = (P) => { const c = comparacionTexto(P); return c.startsWith('el ') ? `al ${c.slice(3)}` : `a ${c}`; };
// «contra setiembre de 2025», «contra el mismo tramo de setiembre»
export const contra = (P) => `contra ${comparacionTexto(P)}`;
// La ventana del período para el rótulo de cada tarjeta: «1 al 30 de setiembre», «25 de octubre»
export const ventanaTexto = (desde, hasta) => tramoFechas(desde, hasta).replace(/^(del|el) /, '');
// El mes que lee una fuente mensual: «octubre de 2026», o «lo que va de octubre» si el mes no terminó
export const mesFuenteTexto = (mes, parcial) => (parcial ? `lo que va de ${mesLargo(+mes.slice(5, 7))}` : mesTexto(mes));
// «del mes» o «del período», para rótulos cortos
export const delPeriodo = (P) => (P.mes && !P.parcial ? 'del mes' : 'del período');
// «en el mes» si el período es un mes entero; si no, «en el período»
export const enElPeriodo = (P) => (P.mes && !P.parcial ? 'en el mes' : 'en el período');
// El título del resumen de cada capa: «Resumen de setiembre de 2026», «Resumen del 19 al 25 de octubre»
export const resumenTitulo = (P) => (P.tramo || !P.mes ? `Resumen ${tramoFechas(P.desde, P.hasta).replace(/^el /, 'del ')}` : `Resumen de ${periodoTexto(P)}`);
// Fechas cortas para un rótulo: «19 al 25 oct», «28 set al 4 oct», «25 oct»
export const fechasCortas = (a, b) => (a === b ? `${Number(a.slice(8))} ${mesCorto(+a.slice(5, 7))}` : a.slice(0, 7) === b.slice(0, 7) ? `${Number(a.slice(8))} al ${Number(b.slice(8))} ${mesCorto(+b.slice(5, 7))}` : `${Number(a.slice(8))} ${mesCorto(+a.slice(5, 7))} al ${Number(b.slice(8))} ${mesCorto(+b.slice(5, 7))}`);
// La comparación en corto, para una cifra del resumen: «set 2025» si es un mes entero; si no, sus fechas
export const comparacionCorta = (P) => (P.mes && !P.parcial ? `${mesCorto(+P.compararDesde.slice(5, 7))} ${P.compararDesde.slice(0, 4)}` : `${fechasCortas(P.compararDesde, P.compararHasta)}${P.comparar === 'anio' ? ` ${P.compararDesde.slice(0, 4)}` : ''}`);

// «3 % más que en setiembre de 2025», «igual que en setiembre de 2025»
export function frente(cambio, P, decimales = 0) {
  if (cambio == null) return null;
  const r = +Math.abs(cambio).toFixed(decimales);
  const en = `en ${comparacionTexto(P)}`;
  return r === 0 ? `igual que ${en}` : `${numero(r, decimales)} % ${cambio > 0 ? 'más' : 'menos'} que ${en}`; // espacio duro: la cifra no se separa del %
}
// «3 % más», «igual»: para frases que ya nombran la comparación
export function cuanto(cambio, decimales = 0) {
  if (cambio == null) return null;
  const r = +Math.abs(cambio).toFixed(decimales);
  return r === 0 ? 'igual' : `${numero(r, decimales)} % ${cambio > 0 ? 'más' : 'menos'}`;
}

export const conSigno = (cambio, decimales = 0) => variacion(cambio, decimales);

// La primera letra en mayúscula (para títulos que empiezan con una cifra calculada)
export const capital = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

// Lista con «y»: a, b y c
// Las horas más altas: «entre las 18:00 y las 22:00» si son seguidas; si no, «a las 7, 12, 19 y 20 h»
export const horasTexto = (hs) => (hs.length > 1 && hs.every((h, i) => i === 0 || h === hs[i - 1] + 1)
  ? `entre las ${hs[0]}:00 y las ${hs.at(-1) + 1}:00` : `a las ${lista(hs.map(String))} h`);
// Día de la semana: el que más tiene, o que los siete se parecen (con su rango)
export const diasTexto = (porDia, mayor, unidad, formato) => {
  const vs = porDia.filter((x) => x != null);
  return mayor == null ? `Los siete días se parecen: entre ${formato(Math.min(...vs))} y ${formato(Math.max(...vs))} ${unidad}.`
    : `El día con más es el ${DIAS_SEMANA[mayor]}: unos ${formato(porDia[mayor])} ${unidad}.`;
};
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
// Empate por inscripción: «las tres cuestan parecido» o «Google Ads y Meta Ads cuestan parecido»
export const parecidoTexto = (p, total) => (p.todas ? `las ${enLetras(total, true)} cuestan parecido` : `${lista(p.nombres)} cuestan parecido`);
export const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);

// Cantidades chicas en letras (al inicio de una frase o en un sujeto): «dos campañas», «tres plataformas»
const LETRAS_M = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
export const enLetras = (n, femenino = false) => (n >= 0 && n <= 10 && Number.isInteger(n) ? (n === 1 ? (femenino ? 'una' : 'un') : LETRAS_M[n]) : numero(n));

// «Los leads por día bajan 1 % frente a setiembre de 2025», «se mantienen igual que en…»
export function variacionFrase(sujeto, cambio, P) {
  if (cambio == null) return null;
  const r = Math.round(Math.abs(cambio));
  if (r === 0) return `${sujeto} se mantienen igual que en ${comparacionTexto(P)}`;
  return `${sujeto} ${cambio > 0 ? 'suben' : 'bajan'} ${numero(r)} % frente a ${comparacionTexto(P)}`;
}

// «del 24 al 30 de setiembre» si es el mismo mes; si no, cada fecha completa; un solo día, «el 25 de octubre»
export function tramoFechas(desde, hasta) {
  const d = desde.slice(8, 10), h = hasta.slice(8, 10);
  if (desde === hasta) return `el ${Number(d)} de ${mesLargo(+hasta.slice(5, 7))}`;
  if (desde.slice(0, 7) === hasta.slice(0, 7)) return `del ${Number(d)} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
  return `del ${Number(d)} de ${mesLargo(+desde.slice(5, 7))} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
}
