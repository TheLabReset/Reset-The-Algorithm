// Piezas y campañas (capa 3): lo que reporta cada plataforma, con un estado por fila. Observan, no ordenan: el estado
// es el juicio y la frase dice qué pasó, con sus cifras.
import { numero, dolares, porcentaje, fechaCorta } from '../sistema/formato.js';
import { capital, lista, enLetras } from './comun.js';

export const ESTADO_PIEZA = {
  'sin-leads': 'Sin leads', costosa: 'Costosa', saturada: 'Saturada', rinde: 'Rinde', aprendizaje: 'Aprendizaje', 'poca-data': 'Poca inversión',
};
const segun = (n, uno, varios) => (n === 1 ? uno : varios);
const NIVEL_PIEZA = { pieza: ['pieza', 'piezas', true], conjunto: ['conjunto', 'conjuntos', false], campana: ['campaña', 'campañas', true] };
const dias = (n) => `${numero(n)} ${segun(n, 'día', 'días')}`;
const cpl = (n) => dolares(n, 2);
// Lo que pasó con las piezas que piden mirarse: «una pieza gastó sin traer leads y dos salieron costosas»
const PARTES_PIEZA = (fem) => [['sin-leads', 'gastó sin traer leads', 'gastaron sin traer leads'], ['costosa', ...(fem ? ['salió costosa', 'salieron costosas'] : ['salió costoso', 'salieron costosos'])], ['saturada', 'se saturó', 'se saturaron']];
const partesPiezas = (cuenta, sujeto, fem = true) => {
  const partes = PARTES_PIEZA(fem).map(([e, s1, p1]) => [cuenta[e] || 0, s1, p1]).filter(([k]) => k > 0);
  return partes.length ? lista(partes.map(([k, s1, p1], i) => `${enLetras(k, fem)}${i === 0 ? sujeto(k) : ''} ${segun(k, s1, p1)}`)) : null;
};

// Por qué tiene su estado, en una frase con sus cifras
export function piezaDato(f) {
  const propia = (() => {
    switch (f.estado) {
      case 'sin-leads': return f.nivel === 'pieza' ? `Gastó ${dolares(f.inversion)} en ${dias(f.diasConGasto)} y no trajo leads.` : `Gastó ${dolares(f.inversion)} y no trajo leads.`;
      case 'saturada': return `Su lead costaba ${cpl(f.saturacion.antes)}; en la última semana, ${cpl(f.saturacion.ahora)}.`;
      case 'aprendizaje': return f.nivel !== 'pieza' ? 'Todas sus piezas llevan menos de una semana publicadas.' : f.alAire === false ? `Estuvo ${dias(f.edad)} publicada.` : `Lleva ${dias(f.edad)} publicada.`;
      case 'poca-data': return f.nivel === 'conjunto' ? `Gastó ${dolares(f.inversion)}: todavía es poco para juzgarlo.` : `Gastó ${dolares(f.inversion)}: todavía es poco para juzgarla.`;
      default: return `Cada lead costó ${cpl(f.cpl)}; el promedio de ${f.plataformaNombre} fue ${cpl(f.base)}.`;
    }
  })();
  const piezas = f.nivel !== 'pieza' && f.cuenta && !['sin-leads', 'aprendizaje', 'poca-data'].includes(f.estado) ? partesPiezas(f.cuenta, () => ' de sus piezas') : null;
  return piezas ? `${propia} ${capital(piezas)}.` : propia;
}
// Debajo del nombre: si ya no está activa; si es un conjunto con el aprendizaje limitado
export const piezaPausa = (f) => (f.nivel === 'pieza' && f.fin && !f.alAire ? `Pausada el ${fechaCorta(f.fin)}` : null);
export const LIMITADO = 'Aprendizaje limitado';

// El título y la lectura: cuántas piden mirarse y qué parte de la inversión se llevaron, frente a las que rindieron
export function piezasLectura(x, nivel = 'pieza') {
  const [uno, varios, fem] = NIVEL_PIEZA[nivel];
  const filas = nivel === 'pieza' ? x.piezas : nivel === 'conjunto' ? x.conjuntos : x.campanas;
  const cuenta = Object.fromEntries(['sin-leads', 'costosa', 'saturada', 'rinde'].map((e) => [e, filas.filter((f) => f.estado === e).length]));
  const suma = (es) => filas.filter((f) => es.includes(f.estado)).reduce((t, f) => t + f.inversion, 0);
  const revisar = suma(['sin-leads', 'costosa', 'saturada']), rinden = suma(['rinde']);
  const pct = (v) => { const p = (v / x.total) * 100; return p > 0 && p < 1 ? 'menos del 1 %' : `el ${porcentaje(Math.round(p))}`; };
  if (!revisar && !cuenta.rinde) return { titulo: `Todavía ${fem ? 'ninguna' : 'ningún'} ${uno} se puede juzgar en el período`, lectura: 'Llevan menos de una semana publicadas o gastaron poco.' };
  const frase = partesPiezas(cuenta, (k) => ` ${segun(k, uno, varios)}`, fem);
  const titulo = frase ? capital(frase) : `${fem ? 'Ninguna' : 'Ningún'} ${uno} gastó sin traer leads ni salió ${fem ? 'costosa' : 'costoso'}`;
  const lectura = !x.total ? '' : revisar
    ? `Se llevaron ${pct(revisar)} de la inversión. ${rinden ? `${fem ? 'Las' : 'Los'} que rindieron, ${pct(rinden)}.` : `${fem ? 'Ninguna' : 'Ninguno'} rindió.`}`
    : `${fem ? 'Las' : 'Los'} que rindieron se llevaron ${pct(rinden)} de la inversión.`;
  return { titulo, lectura };
}

export function piezasAyuda(U) {
  return `Leads de la plataforma, no del CRM: a este nivel no hay inscripciones. Cada fila se compara con el costo por lead de su plataforma en el período, sin las campañas de alcance. `
    + `Aprendizaje: menos de ${U.diasAprendizaje} días publicada, todavía no se juzga (TikTok lo pide en su guía). Saturada: su lead de los últimos ${U.diasReciente} días cuesta ${numero(U.vecesSaturada)} veces el de antes (el criterio de fatiga de Meta). `
    + `Aprendizaje limitado: un conjunto de Meta o TikTok con menos de ${U.resultadosSemana} leads en ${U.diasReciente} días (Meta y TikTok). `
    + `Por costumbre de la industria, no de las plataformas: se juzga recién cuando gastó ${U.vecesGasto} veces el costo por lead de su plataforma. Si hasta ahí no trajo leads, va Sin leads; si su lead cuesta ${numero(U.vecesCostosa, 1)} veces el promedio o más, Costosa; por debajo, Rinde.`;
}
