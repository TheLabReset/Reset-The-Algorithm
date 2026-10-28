// Período libre (src/calculo/periodo.js): atajos, fechas, comparación, cohorte del CRM y fuentes mensuales.
// Usa la fecha de referencia de la muestra para que el resultado no dependa del día en que se corre.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE } from '../src/muestra/configuracion.js';
import { muestraAl } from '../src/muestra/fechaMovil.js';
import { generar } from '../src/muestra/generador.js';
import { armarVista } from '../src/calculo/vista.js';
import { periodoDe, cohorteDe, ATAJOS, DIAS_MINIMOS } from '../src/calculo/periodo.js';
import { periodoTexto, comparacionTexto, resumenTitulo, comparacionCorta, ventanaTexto, tramoFechas } from '../src/textos/comun.js';

// corte a mitad de mes, para probar el mes en curso
const cfg = muestraAl(BASE, '2026-10-25');
const P = (f) => periodoDe(cfg, f);

test('período: cada atajo cae donde dice, contando desde el corte', () => {
  assert.deepEqual([P({}).desde, P({}).hasta, P({}).atajo], ['2026-10-19', '2026-10-25', '7d']);
  assert.deepEqual([P({ atajo: '30d' }).desde, P({ atajo: '30d' }).hasta], ['2026-09-26', '2026-10-25']);
  assert.deepEqual([P({ atajo: 'mes' }).desde, P({ atajo: 'mes' }).hasta, P({ atajo: 'mes' }).parcial], ['2026-10-01', '2026-10-25', true]);
  assert.deepEqual([P({ atajo: 'mes-pasado' }).desde, P({ atajo: 'mes-pasado' }).hasta, P({ atajo: 'mes-pasado' }).parcial], ['2026-09-01', '2026-09-30', false]);
  assert.deepEqual([P({ atajo: '6m' }).desde, P({ atajo: '6m' }).hasta], ['2026-04-26', '2026-10-25']);
  assert.equal(P({ atajo: 'otro' }).atajo, '7d', 'un atajo desconocido vuelve al inicial');
  assert.equal(ATAJOS.length, 5);
});

test('período: la comparación con el período anterior', () => {
  const tramo = P({}), mes = P({ atajo: 'mes-pasado' }), enCurso = P({ atajo: 'mes' });
  // un tramo, con los mismos días justo antes
  assert.deepEqual([tramo.compararDesde, tramo.compararHasta], ['2026-10-12', '2026-10-18']);
  // un mes cerrado, con el mes anterior entero
  assert.deepEqual([mes.compararDesde, mes.compararHasta], ['2026-08-01', '2026-08-31']);
  // el mes en curso, con el mismo tramo del mes anterior
  assert.deepEqual([enCurso.compararDesde, enCurso.compararHasta], ['2026-09-01', '2026-09-25']);
  // marzo en curso al 30 se compara hasta el 28 de febrero, no hasta el 2 de marzo
  const marzo = periodoDe(muestraAl(BASE, '2027-03-30'), { atajo: 'mes' });
  assert.equal(marzo.parcial, true);
  assert.deepEqual([marzo.compararDesde, marzo.compararHasta], ['2027-02-01', '2027-02-28']);
});

test('período: la comparación con un año antes', () => {
  const tramo = P({ comparar: 'anio' }), mes = P({ atajo: 'mes-pasado', comparar: 'anio' });
  assert.deepEqual([tramo.compararDesde, tramo.compararHasta], ['2025-10-19', '2025-10-25']);
  assert.deepEqual([mes.compararDesde, mes.compararHasta], ['2025-09-01', '2025-09-30']);
  // un 29 de febrero se compara con el 28
  const bisiesto = periodoDe(muestraAl(BASE, '2028-03-10'), { desde: '2028-02-29', hasta: '2028-03-06', comparar: 'anio' });
  assert.deepEqual([bisiesto.compararDesde, bisiesto.compararHasta], ['2027-02-28', '2027-03-06']);
});

test('período: fechas libres se ajustan a la muestra, y un mes elegido con fechas es un mes', () => {
  const fuera = P({ desde: '2020-01-01', hasta: '2030-01-01' });
  assert.deepEqual([fuera.desde, fuera.hasta], [cfg.desde, cfg.corte]);
  const alReves = P({ desde: '2026-10-10', hasta: '2026-10-01' });
  assert.equal(alReves.hasta, '2026-10-10', 'un hasta antes del desde se lleva al desde');
  const mes = P({ desde: '2026-08-01', hasta: '2026-08-31' });
  assert.equal(mes.mes, '2026-08');
  assert.equal(mes.tramo, false);
  // la comparación fuera de la muestra se marca y no se publica
  const primero = P({ desde: cfg.desde, hasta: '2025-01-15' });
  assert.equal(primero.compFuera, true);
  assert.equal(primero.conComparacion, false);
});

test(`período: con menos de ${DIAS_MINIMOS} días no se publica ninguna variación`, () => {
  const d = generar(cfg);
  const v = armarVista(d, { desde: cfg.corte, hasta: cfg.corte });
  assert.equal(v.periodo.conComparacion, false);
  assert.equal(v.periodo.comparable, false);
  assert.equal(v.lee.pauta.cambio, null);
  assert.ok(v.lee.plataformas.plataformas.every((p) => p.cambioCpl == null));
  assert.equal(v.lee.crmDetalle.cambio, null);
  assert.equal(v.lee.web.cambioUsuarios, null);
  const siete = armarVista(d, { desde: '2026-10-19', hasta: cfg.corte });
  assert.equal(siete.periodo.conComparacion, true);
});

test('período: la cohorte es el último mes que ya cerró, dentro del período o antes', () => {
  // al 25 de octubre setiembre ya cerró (pasaron más de rezagoAltaMax días desde su fin)
  assert.equal(P({}).cohorteDesde, '2026-09-01');
  assert.equal(P({ atajo: 'mes-pasado' }).cohorteDesde, '2026-09-01');
  assert.equal(P({ atajo: '6m' }).cohorteDesde, '2026-09-01');
  assert.equal(P({ desde: '2026-03-01', hasta: '2026-03-31' }).cohorteDesde, '2026-03-01');
  // al 5 de octubre setiembre todavía no cierra: la cohorte es agosto
  const temprano = muestraAl(BASE, '2026-10-05');
  assert.equal(cohorteDe(temprano, '2026-10-05').cohorteDesde, '2026-08-01');
  assert.equal(cohorteDe(temprano, '2026-09-30').cohorteDesde, '2026-08-01');
});

test('período: las fuentes mensuales leen el mes en que termina el período, salvo que recién empiece', () => {
  assert.deepEqual([P({}).mesFuente, P({}).mesFuenteParcial, P({}).mesFuenteComparar], ['2026-10', true, '2026-09']);
  assert.deepEqual([P({ comparar: 'anio' }).mesFuenteComparar], ['2025-10']);
  const recien = periodoDe(muestraAl(BASE, '2026-11-03'), {});
  assert.deepEqual([recien.mesFuente, recien.mesFuenteParcial], ['2026-10', false]);
  // y lo que va del mes se escala por los días que van: nunca un mes entero dentro de tres días
  const d = generar(cfg), v = armarVista(d, {});
  const entero = armarVista(d, { atajo: 'mes-pasado' });
  assert.ok(v.lee.redes.parcial && !entero.lee.redes.parcial);
  const pub = (x) => x.lee.redes.hashtags.reduce((s, h) => s + h.publicaciones, 0);
  assert.ok(pub(v) < pub(entero), 'lo que va de octubre no puede tener más publicaciones que setiembre entero');
});

test('período: los textos dicen qué se eligió y contra qué', () => {
  assert.equal(periodoTexto(P({})), 'los días del 19 al 25 de octubre');
  assert.equal(comparacionTexto(P({})), 'los 7 días anteriores');
  assert.equal(periodoTexto(P({ atajo: 'mes' })), 'lo que va de octubre');
  assert.equal(comparacionTexto(P({ atajo: 'mes' })), 'el mismo tramo de setiembre');
  assert.equal(periodoTexto(P({ atajo: 'mes-pasado' })), 'setiembre de 2026');
  assert.equal(comparacionTexto(P({ atajo: 'mes-pasado' })), 'agosto de 2026');
  assert.equal(comparacionTexto(P({ comparar: 'anio' })), 'los mismos días de 2025');
  assert.equal(comparacionTexto(P({ atajo: 'mes-pasado', comparar: 'anio' })), 'setiembre de 2025');
  const uno = P({ desde: cfg.corte, hasta: cfg.corte });
  assert.equal(periodoTexto(uno), 'el día 25 de octubre');
  assert.equal(comparacionTexto(uno), 'el día anterior');
  assert.equal(resumenTitulo(P({})), 'Resumen del 19 al 25 de octubre');
  assert.equal(resumenTitulo(P({ atajo: 'mes-pasado' })), 'Resumen de setiembre de 2026');
  assert.equal(comparacionCorta(P({})), '12 al 18 oct');
  assert.equal(comparacionCorta(P({ comparar: 'anio' })), '19 al 25 oct 2025');
  assert.equal(ventanaTexto(cfg.corte, cfg.corte), '25 de octubre');
  assert.equal(tramoFechas('2026-09-28', '2026-10-04'), 'del 28 de setiembre al 4 de octubre');
});

test('período: cada atajo y cada comparación arman una vista sin valores rotos', () => {
  const d = generar(cfg);
  for (const atajo of ATAJOS.map((a) => a.id)) for (const comparar of ['anterior', 'anio']) {
    const v = armarVista(d, { atajo, comparar });
    assert.ok(!/NaN|Infinity/.test(JSON.stringify(v)), `${atajo} ${comparar}`);
  }
});
