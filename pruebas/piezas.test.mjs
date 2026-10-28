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

// ── Lo que encontraron los verificadores, para que no vuelva ──
import { armarVista } from '../src/calculo/vista.js';
import { DIAS_NUEVO } from '../src/calculo/piezas.js';

test('anuncios: la fecha de un anuncio no se corre al pasar un día, y lo nuevo va primero', () => {
  const fechas = (c) => Object.fromEntries(detallar(generar(muestraAl(BASE, c))).anuncios.flatMap((m) => m.marcas.flatMap((x) => x.anuncios.map((a) => [a.id, a.desde]))));
  const a = fechas('2026-11-10'), b = fechas('2026-11-11');
  assert.deepEqual(Object.keys(a).filter((k) => b[k] !== a[k]), []);
  const v = armarVista(d, {});
  for (const g of [v.lee.anuncios.propio, ...v.lee.anuncios.grupos].filter(Boolean)) {
    assert.ok(g.anuncios.every((x) => !x.desde || x.desde <= v.periodo.hasta), `${g.nombre}: un anuncio que empezó después del período`);
    const i = g.anuncios.findIndex((x) => !x.nuevo);
    assert.ok(i === -1 || g.anuncios.slice(i).every((x) => !x.nuevo), `${g.nombre}: un anuncio nuevo quedó abajo`);
  }
});

test(`piezas: en un período largo, «nuevo» son los últimos ${DIAS_NUEVO} días; el primer día de la data no «aprende»`, () => {
  const P6 = periodoDe(cfg, { atajo: '6m' }), x = leerPiezas(d, P6);
  assert.ok(x.piezas.filter((p) => p.nueva).every((p) => p.inicio >= x.nuevoDesde));
  assert.ok(x.piezas.filter((p) => p.nueva).length < x.piezas.length / 2, 'en seis meses casi todo sale nuevo');
  const primero = leerPiezas(d, periodoDe(cfg, { desde: cfg.desde, hasta: cfg.desde }));
  assert.ok(primero.piezas.every((p) => p.estado !== 'aprendizaje'), 'las piezas que ya corrían al empezar la data salen «aprendizaje»');
});

test('piezas: un grupo con más de la mitad de su inversión en piezas que piden mirarse no dice «rinde»', () => {
  for (const f of [{}, { atajo: '30d' }, { atajo: 'mes-pasado' }, { atajo: '6m' }]) {
    const x = leerPiezas(d, periodoDe(cfg, f));
    for (const g of [...x.conjuntos, ...x.campanas]) {
      const de = x.piezas.filter((p) => p[g.nivel === 'conjunto' ? 'conjunto' : 'campana'] === g.id);
      const mal = de.filter((p) => PARA_REVISAR.includes(p.estado)).reduce((s, p) => s + p.inversion, 0);
      if (mal > g.inversion / 2) assert.ok(PARA_REVISAR.includes(g.estado), `${JSON.stringify(f)} ${g.nombre}: «${g.estado}» con ${Math.round((mal / g.inversion) * 100)} % en piezas a mirar`);
    }
  }
});

test('piezas: la base de cada fila es la de su canal (Search y Display por separado)', () => {
  const x = leerPiezas(d, periodoDe(cfg, { atajo: 'mes-pasado' }));
  const s = x.piezas.find((p) => p.canal === 'search'), dsp = x.piezas.find((p) => p.canal === 'display');
  assert.ok(s && dsp && s.base !== dsp.base);
  assert.equal(s.baseNombre, 'Search');
});

test('piezas: en distintos cortes, la vista que abre el panel tiene piezas que rinden, que cuestan más y que aprenden', () => {
  for (const c of ['2026-10-03', '2026-10-12', '2026-10-25', '2026-11-07', '2026-11-24', '2026-12-15']) {
    const cc = muestraAl(BASE, c), x = leerPiezas(generar(cc), periodoDe(cc, {}));
    for (const e of ['rinde', 'costosa']) assert.ok(x.porEstado[e].n > 0, `${c}: sin piezas «${e}» al abrir`);
  }
});
