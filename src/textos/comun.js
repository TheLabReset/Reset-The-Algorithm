// Piezas de texto comunes. Puras: reciben datos ya calculados y devuelven frases en español peruano.
import { mesLargo, variacion, numero } from '../sistema/formato.js';

export const mesTexto = (aaaamm) => `${mesLargo(+aaaamm.slice(5, 7))} de ${aaaamm.slice(0, 4)}`;
export const periodoTexto = (P) => mesTexto(P.desde.slice(0, 7));
export const comparacionTexto = (P) => mesTexto(P.compararDesde.slice(0, 7));
// «contra setiembre de 2025» o «contra agosto de 2026»
export const contra = (P) => `contra ${comparacionTexto(P)}`;

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

// «del 24 al 30 de setiembre» si es el mismo mes; si no, cada fecha completa
export function tramoFechas(desde, hasta) {
  const d = desde.slice(8, 10), h = hasta.slice(8, 10);
  if (desde.slice(0, 7) === hasta.slice(0, 7)) return `del ${Number(d)} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
  return `del ${Number(d)} de ${mesLargo(+desde.slice(5, 7))} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
}
