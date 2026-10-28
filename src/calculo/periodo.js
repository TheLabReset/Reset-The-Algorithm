// Períodos: cualquier tramo de días con data, elegido con un atajo o con dos fechas, como en el algoritmo en producción.
// Comparación con el período anterior: un mes cerrado, con el mes anterior entero; el mes en curso, con el mismo tramo
// del mes anterior; cualquier otro tramo, con los mismos días justo antes. O con un año antes: las mismas fechas del año
// anterior (un mes entero, con el mismo mes del año anterior). Sin fechas del sistema: todo sale de la configuración.
// Puro.

import { sumarDias, diasEntre } from '../muestra/calendario.js';
import { sumarMeses, finDeMes } from './base.js';

// días del período desde los que una variación frente a la comparación se lee: con menos, un día raro manda
export const DIAS_MINIMOS = 7;

// Los atajos del selector. «Últimos» cuenta desde el último día con data (el corte), no desde hoy
export const ATAJOS = [
  { id: '7d', nombre: 'Últimos 7 días' },
  { id: '30d', nombre: 'Últimos 30 días' },
  { id: 'mes', nombre: 'Este mes' },
  { id: 'mes-pasado', nombre: 'Mes pasado' },
  { id: '6m', nombre: 'Últimos 6 meses' },
];
export const ATAJO_INICIAL = '7d';
export const COMPARAR = [{ id: 'anterior', nombre: 'Período anterior' }, { id: 'anio', nombre: 'Un año antes' }];
export const COMPARAR_INICIAL = 'anterior';

// La misma fecha k meses antes o después; un día que no existe en el mes de llegada (29 de febrero), el último del mes
function correrMeses(iso, k) {
  const m = sumarMeses(iso.slice(0, 7), k), fin = finDeMes(m);
  const d = `${m}-${iso.slice(8, 10)}`;
  return d > fin ? fin : d;
}
// El día después del mismo día seis meses antes: del 25 de octubre, el 26 de abril
const seisMesesAntes = (iso) => sumarDias(correrMeses(iso, -6), 1);

// Un mes, entero o en curso (del 1 al corte)
function delMes(cfg, mes) {
  const desde = `${mes}-01` < cfg.desde ? cfg.desde : `${mes}-01`;
  const fin = finDeMes(mes), hasta = fin > cfg.corte ? cfg.corte : fin;
  return { desde, hasta, mes, tramo: false, parcial: hasta < fin || desde > `${mes}-01`, enCurso: hasta < fin };
}
// Un tramo cualquiera; si va del 1 al último día del mes (o al corte en el mes en curso), es un mes
function delTramo(cfg, desde0, hasta0) {
  const desde = desde0 < cfg.desde ? cfg.desde : desde0 > cfg.corte ? cfg.corte : desde0;
  const hasta = hasta0 > cfg.corte ? cfg.corte : hasta0 < desde ? desde : hasta0;
  const mes = desde.slice(0, 7);
  if (desde.slice(8) === '01' && hasta.slice(0, 7) === mes && (hasta === finDeMes(mes) || hasta === cfg.corte)) return delMes(cfg, mes);
  return { desde, hasta, mes: null, tramo: true, parcial: false, enCurso: false };
}

// La comparación del período
function comparacion(P, comparar) {
  if (comparar === 'anio') {
    // un mes entero, con el mismo mes del año anterior entero; un tramo o un mes en curso, con las mismas fechas
    if (P.mes && !P.parcial) { const m = sumarMeses(P.mes, -12); return { compararDesde: `${m}-01`, compararHasta: finDeMes(m) }; }
    return { compararDesde: correrMeses(P.desde, -12), compararHasta: correrMeses(P.hasta, -12) };
  }
  if (P.mes) {
    const ant = sumarMeses(P.mes, -1), finAnt = finDeMes(ant);
    if (!P.parcial) return { compararDesde: `${ant}-01`, compararHasta: finAnt };
    // el mes en curso: el mismo tramo de días del mes anterior
    const dia = (iso) => `${ant}-${iso.slice(8, 10)}`;
    return { compararDesde: dia(P.desde) > finAnt ? finAnt : dia(P.desde), compararHasta: dia(P.hasta) > finAnt ? finAnt : dia(P.hasta) };
  }
  const dias = diasEntre(P.desde, P.hasta) + 1;
  return { compararDesde: sumarDias(P.desde, -dias), compararHasta: sumarDias(P.desde, -1) };
}

// La cohorte del CRM: el último mes que ya cerró (sus leads tuvieron tiempo de inscribirse), dentro del período o antes.
// Así el costo por inscripción no depende del largo del tramo: «mes pasado» usa ese mes; «últimos 7 días», el último
// mes cerrado
export function cohorteDe(cfg, hasta) {
  let m = hasta.slice(0, 7);
  while (finDeMes(m) > hasta || diasEntre(finDeMes(m), cfg.corte) < cfg.embudo.rezagoAltaMax) m = sumarMeses(m, -1);
  return { cohorteDesde: `${m}-01`, cohorteHasta: finDeMes(m) };
}

/** El período de los filtros: un atajo, dos fechas o un mes; y con qué se compara. */
export function periodoDe(cfg, filtros = {}) {
  const comparar = COMPARAR.some((c) => c.id === filtros.comparar) ? filtros.comparar : COMPARAR_INICIAL;
  let base, atajo = null;
  if (filtros.desde && filtros.hasta) base = delTramo(cfg, filtros.desde, filtros.hasta);
  else if (filtros.mes) base = delMes(cfg, filtros.mes);
  else {
    atajo = ATAJOS.some((a) => a.id === filtros.atajo) ? filtros.atajo : ATAJO_INICIAL;
    const ultimo = cfg.corte, mesUltimo = ultimo.slice(0, 7);
    base = atajo === 'mes' ? delMes(cfg, mesUltimo)
      : atajo === 'mes-pasado' ? delMes(cfg, mesUltimo > cfg.desde.slice(0, 7) ? sumarMeses(mesUltimo, -1) : mesUltimo)
      : atajo === '6m' ? delTramo(cfg, seisMesesAntes(ultimo), ultimo)
      : delTramo(cfg, sumarDias(ultimo, atajo === '30d' ? -29 : -6), ultimo);
  }
  const dias = diasEntre(base.desde, base.hasta) + 1;
  const c = comparacion({ ...base }, comparar);
  const compFuera = c.compararDesde < cfg.desde;
  // las fuentes que se leen por mes (TikTok, Facebook, la biblioteca de anuncios, las regiones): el mes en que termina
  // el período, frente al mes anterior o al mismo mes del año anterior. Si ese mes recién empieza (menos de
  // DIAS_MINIMOS días), el mes anterior entero: con dos o tres días, la lectura del mes sería ruido
  const mesFin = base.hasta.slice(0, 7);
  const recien = base.hasta < finDeMes(mesFin) && +base.hasta.slice(8, 10) < DIAS_MINIMOS && sumarMeses(mesFin, -1) >= cfg.desde.slice(0, 7);
  const mesFuente = recien ? sumarMeses(mesFin, -1) : mesFin;
  return {
    ...base, atajo, comparar, dias, ...c, compFuera,
    // una variación se publica solo con días suficientes y con la comparación dentro de la muestra
    conComparacion: !compFuera && dias >= DIAS_MINIMOS,
    ...cohorteDe(cfg, base.hasta),
    mesFuente, mesFuenteParcial: base.hasta < finDeMes(mesFuente), mesFuenteComparar: sumarMeses(mesFuente, comparar === 'anio' ? -12 : -1),
  };
}
