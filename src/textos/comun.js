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
export const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);
