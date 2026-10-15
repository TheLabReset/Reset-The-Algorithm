// Lecturas que nacen con las cuatro capas: la ficha de cada plataforma, el embudo por fuente, el acumulado,
// el índice y los resúmenes. Observan, no ordenan; dos frases como máximo; las comparaciones dicen frente a qué.
import { numero, dolares } from '../sistema/formato.js';
import { comparacionTexto, enLetras, capital } from './comun.js';

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
  const titulo = 'Acumulado del mes';
  if (c.totalPrevio == null) return { titulo, lectura: `${numero(c.total)} leads en el CRM en el mes. No hay dato completo de ${comparacionTexto(v.periodo)} para comparar.` };
  return { titulo, lectura: `${numero(c.total)} leads en el CRM, frente a ${numero(c.totalPrevio)} en ${comparacionTexto(v.periodo)}.` };
}

// Índice de oportunidad: el número, su banda y cómo se movió frente al mes anterior
export function indiceLectura(ix) {
  const titulo = 'Índice de oportunidad';
  if (ix.valor == null) return { titulo, lectura: 'Falta algún componente para calcularlo este mes.' };
  const mov = ix.cambio == null ? '' : Math.round(ix.cambio) === 0 ? ' Igual que al cierre del mes anterior.' : ` ${Math.round(ix.cambio) > 0 ? 'Sube' : 'Baja'} ${numero(Math.abs(Math.round(ix.cambio)))} ${Math.abs(Math.round(ix.cambio)) === 1 ? 'punto' : 'puntos'} frente al cierre del mes anterior.`;
  return { titulo, lectura: `Qué tan favorable está el mercado para captar socios, de 0 a 100.${mov}` };
}

export const bandaTexto = (banda) => (banda ? `${capital(banda.nombre)} para captar socios` : '');
