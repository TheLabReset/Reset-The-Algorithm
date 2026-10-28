// Piezas y campañas (src/muestra/piezas.js y src/calculo/piezas.js): las piezas suman exacto lo que reporta cada
// campaña, los estados siguen sus umbrales y un grupo se juzga solo si alguna de sus piezas se puede juzgar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE } from '../src/muestra/configuracion.js';
import { muestraAl } from '../src/muestra/fechaMovil.js';
import { generar } from '../src/muestra/generador.js';
import { detallar } from '../src/muestra/detalle.js';
import { periodoDe } from '../src/calculo/periodo.js';
import { leerPiezas, UMBRALES_PIEZAS as U, PARA_REVISAR } from '../src/calculo/piezas.js';
import { leePlataformas } from '../src/calculo/produccion.js';

const cfg = muestraAl(BASE, '2026-10-25'), d = generar(cfg), det = detallar(d);

test('piezas: cada día, las piezas de una campaña suman exacto lo que reporta la campaña', () => {
  const porCampana = {};
  for (const p of det.piezas.piezas) (porCampana[p.campana] || (porCampana[p.campana] = [])).push(p.id);
  const dia = new Map(det.piezas.dias.map((x) => [x.fecha, x]));
  let revisados = 0;
  for (const canal of cfg.canales) for (const r of det.campanas[canal.id]) {
    if (r.sinDato) continue;
    r.porCampana.forEach((x, i) => {
      const ids = porCampana[cfg.campanas[canal.id][i].id];
      if (!ids) return;
      const f = dia.get(r.fecha), s = (k) => ids.reduce((t, id) => t + (f[id]?.[k] || 0), 0);
      assert.ok(Math.abs(s('inversion') - x.inversion) < 0.011, `${r.fecha} ${x.id}: inversión`);
      for (const k of ['impresiones', 'clics', 'leads']) assert.equal(s(k), x[k], `${r.fecha} ${x.id}: ${k}`);
      revisados++;
    });
  }
  assert.ok(revisados > 3000);
});

test('piezas: las campañas de alcance no entran, y la inversión de las piezas es la de sus campañas en el período', () => {
  const P = periodoDe(cfg, { atajo: 'mes-pasado' }), x = leerPiezas(d, P);
  const alcance = Object.values(cfg.campanas).flat().filter((c) => c.conversion === 0).map((c) => c.id);
  assert.ok(alcance.length > 0 && x.piezas.every((p) => !alcance.includes(p.campana)));
  const pl = leePlataformas(d, P);
  const deCampanas = pl.plataformas.flatMap((p) => p.campanas).filter((c) => !alcance.includes(c.id)).reduce((s, c) => s + c.inversion, 0);
  assert.ok(Math.abs(x.total - deCampanas) < 0.05, `${x.total} frente a ${deCampanas}`);
});

test('piezas: cada estado sigue su umbral', () => {
  for (const f of [{}, { atajo: '30d' }, { atajo: 'mes-pasado' }, { atajo: '6m' }]) {
    const x = leerPiezas(d, periodoDe(cfg, f));
    for (const p of x.piezas) {
      const r = (n) => Math.round(n * 100);
      if (p.estado === 'aprendizaje') assert.ok(p.edad < U.diasAprendizaje, `${p.nombre}: aprende con ${p.edad} días`);
      else if (p.estado === 'poca-data') assert.ok(p.inversion < U.vecesGasto * p.base);
      else {
        assert.ok(p.edad >= U.diasAprendizaje && p.inversion >= U.vecesGasto * p.base, `${p.nombre}: se juzgó antes de tiempo`);
        if (p.estado === 'sin-leads') assert.equal(p.leads, 0);
        if (p.estado === 'saturada') assert.ok(p.fatiga >= U.vecesSaturada && p.plataforma !== 'google');
        if (p.estado === 'costosa') assert.ok(r(p.cpl) / r(p.base) >= U.vecesCostosa);
        if (p.estado === 'rinde') assert.ok(p.leads > 0 && r(p.cpl) / r(p.base) < U.vecesCostosa);
      }
    }
    // un grupo que se juzga tiene alguna pieza que se puede juzgar
    for (const g of [...x.conjuntos, ...x.campanas]) if (!['aprendizaje', 'poca-data'].includes(g.estado)) {
      assert.ok(x.piezas.some((p) => p[g.nivel === 'conjunto' ? 'conjunto' : 'campana'] === g.id && !['aprendizaje', 'poca-data'].includes(p.estado)), `${g.nombre}: se juzgó sin piezas juzgables`);
    }
  }
});

test('piezas: lo que se abre al entrar tiene de todo y primero lo que pide mirarse', () => {
  const x = leerPiezas(d, periodoDe(cfg, {}));
  for (const e of ['rinde', 'costosa', 'aprendizaje']) assert.ok(x.porEstado[e].n > 0, `sin piezas «${e}» al abrir`);
  assert.ok(x.porEstado['sin-leads'].n + x.porEstado.saturada.n > 0);
  assert.ok(x.nuevas > 0);
  const revisar = (g) => PARA_REVISAR.reduce((t, e) => t + g.cuenta[e], 0) + (PARA_REVISAR.includes(g.estado) ? 1 : 0);
  for (let i = 1; i < x.campanas.length; i++) assert.ok(revisar(x.campanas[i - 1]) >= revisar(x.campanas[i]), 'una campaña con más que mirar quedó abajo');
});

test('piezas: una pieza nueva empezó dentro del período', () => {
  const P = periodoDe(cfg, { atajo: '30d' }), x = leerPiezas(d, P);
  for (const p of x.piezas) assert.equal(p.nueva, p.inicio >= P.desde, p.nombre);
});
