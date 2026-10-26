// Fecha móvil de la maqueta (src/muestra/fechaMovil.js, docs/fecha-movil.md): la muestra corta ayer en Lima y su
// historia se mueve con el corte. Estas pruebas fijan el «hoy» para ser reproducibles y verifican cuatro cosas: que en
// la fecha de referencia todo queda como se escribió, que el calendario cae donde debe, que lo ya mostrado no cambia
// al pasar un día, y que la historia de la demo aparece en el mes que el panel abre, cualquier mes de dos años.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE } from '../src/muestra/configuracion.js';
import { muestraAl, hoyEnLima, feriadosDe, ultimoMesCerrado, correrMeses } from '../src/muestra/fechaMovil.js';
import { generar } from '../src/muestra/generador.js';
import { detallar } from '../src/muestra/detalle.js';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';
import { sumarDias } from '../src/muestra/calendario.js';

test('fecha móvil: en la fecha de referencia, las fechas son las que se escribieron', () => {
  const r = muestraAl(BASE, BASE.corte);
  for (const k of ['web', 'sedes', 'campanas', 'crm', 'eventos', 'cambiosCosto', 'cambiosInteraccion', 'programatica', 'fatigaMeta', 'busquedas', 'palabrasClave']) {
    assert.deepEqual(r[k], BASE[k], k);
  }
  assert.equal(r.desde, BASE.desde);
  assert.deepEqual(r.feriados.filter((d) => d <= BASE.corte), BASE.feriados);
});

test('fecha móvil: hoy es la fecha de Lima, y el corte es ayer', () => {
  // 3 de la mañana en UTC del 26 de octubre: en Lima todavía es el 25
  assert.equal(hoyEnLima(new Date('2026-10-26T03:00:00Z')), '2026-10-25');
  assert.equal(hoyEnLima(new Date('2026-10-26T06:00:00Z')), '2026-10-26');
});

test('fecha móvil: el calendario cae donde debe', () => {
  // Jueves y Viernes Santo de 2027 y 2028 (Pascua: 28 de marzo de 2027, 16 de abril de 2028)
  assert.ok(feriadosDe(2027, BASE.fechaMovil.feriadosFijos).includes('2027-03-25') && feriadosDe(2027, BASE.fechaMovil.feriadosFijos).includes('2027-03-26'));
  assert.ok(feriadosDe(2028, BASE.fechaMovil.feriadosFijos).includes('2028-04-13') && feriadosDe(2028, BASE.fechaMovil.feriadosFijos).includes('2028-04-14'));
  assert.equal(ultimoMesCerrado('2026-10-25'), '2026-09');
  assert.equal(ultimoMesCerrado('2026-10-31'), '2026-10');
  assert.equal(ultimoMesCerrado('2027-01-15'), '2026-12');
  // un fin de mes queda en fin de mes; un día que no existe, en el último del mes
  assert.equal(correrMeses('2026-09-30', 1), '2026-10-31');
  assert.equal(correrMeses('2026-10-31', 4), '2027-02-28');
  assert.equal(correrMeses('2026-01-30', 1), '2026-02-28');
  const c = muestraAl(BASE, '2027-04-20');
  assert.equal(c.desde, '2026-01-01');
  // el Reto de enero de cada año, el primer lunes desde el 5 de enero
  assert.deepEqual(c.eventos.filter((e) => e.tipo === 'campana').map((e) => e.fecha), ['2026-01-05', '2027-01-11']); // el 5 de enero de 2027 es martes
  assert.deepEqual(c.crm.campanas.filter((k) => k.id.startsWith('reto-')).map((k) => [k.desde, k.hasta]), [['2026-01-02', '2026-02-15'], ['2027-01-02', '2027-02-15']]);
  // la promo se llama como el mes en que empieza
  const promo = c.web.paginas.find((p) => p.id === 'promo');
  assert.equal(promo.desde, '2027-03-08');
  assert.equal(promo.nombre, 'Promo de marzo');
  assert.equal(promo.ruta, '/promo-marzo');
  assert.ok(c.cambiosInteraccion[0].texto.includes('/promo-marzo'));
});

test('fecha móvil: nada después del corte y el rango empieza el 1 de enero del año anterior', () => {
  for (const corte of ['2026-11-03', '2027-01-01', '2027-12-31']) {
    const cfg = muestraAl(BASE, corte), d = generar(cfg);
    assert.equal(d.dias[0], `${+corte.slice(0, 4) - 1}-01-01`);
    assert.equal(d.dias.at(-1), corte);
    assert.ok(d.semanas.every((s) => sumarDias(s, 6) <= corte));
    assert.ok(cfg.eventos.every((e) => e.fecha >= cfg.desde && e.fecha <= corte));
  }
});

test('fecha móvil: lo que ya se mostró no cambia al pasar un día', () => {
  // dos días seguidos del mismo mes: la data de hace más de un mes queda igual (lo reciente puede cambiar: las altas y
  // los descartes del CRM llegan con días de atraso, como en un CRM real)
  const a = generar(muestraAl(BASE, '2026-11-10')), b = generar(muestraAl(BASE, '2026-11-11'));
  const hasta = '2026-10-05';
  const recorte = (d) => ({
    pauta: Object.fromEntries(Object.entries(d.pauta).map(([k, v]) => [k, v.filter((x) => x.fecha <= hasta)])),
    web: d.web.filter((x) => x.fecha <= hasta),
    cohortes: d.cohortes.filter((x) => x.fecha <= hasta),
    busquedas: d.busquedas.map((k) => k.semanas.filter((s) => s.semana <= hasta)),
    conversacion: d.conversacion.map((k) => k.semanas.filter((s) => s.semana <= hasta)),
  });
  // se compara pieza por pieza y se informa la primera que cambió (un deepEqual de todo daría un diff enorme)
  const ra = recorte(a), rb = recorte(b);
  const piezas = (r) => [...Object.entries(r.pauta).flatMap(([k, v]) => v.map((x) => [`pauta ${k} ${x.fecha}`, x])), ...r.web.map((x) => [`web ${x.fecha}`, x]),
    ...r.cohortes.map((x) => [`cohorte ${x.fecha} ${x.canal} ${x.sede}`, x]), ...r.busquedas.flatMap((k, i) => k.map((x) => [`búsqueda ${i} ${x.semana}`, x])),
    ...r.conversacion.flatMap((k, i) => k.map((x) => [`conversación ${i} ${x.semana}`, x]))];
  const pa = piezas(ra), pb = new Map(piezas(rb).map(([k, x]) => [k, JSON.stringify(x)]));
  assert.equal(pa.length, pb.size, 'cambió la cantidad de filas del pasado');
  const distinta = pa.find(([k, x]) => pb.get(k) !== JSON.stringify(x));
  assert.equal(distinta?.[0], undefined, `cambió ${distinta?.[0]}`);
  const crm = (d) => detallar(d).crm.filter((x) => x.fecha <= hasta).map((x) => JSON.stringify(x));
  const ca = crm(a), cb = crm(b);
  const i = ca.findIndex((x, k) => x !== cb[k]);
  assert.equal(i, -1, `cambió la fila ${i} del CRM`);
});

test('fecha móvil: la historia de la demo aparece en el mes que el panel abre, cualquier mes de dos años', () => {
  const cortes = [];
  for (let a = 2026; a <= 2028; a++) for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0'), fin = new Date(Date.UTC(a, m, 0)).getUTCDate();
    for (const dia of [15, fin]) { const c = `${a}-${mm}-${String(dia).padStart(2, '0')}`; if (c >= '2026-10-01') cortes.push(c); }
  }
  for (const corte of cortes) {
    const cfg = muestraAl(BASE, corte), d = generar(cfg), meses = mesesDisponibles(cfg);
    for (const comparar of ['anio', 'anterior']) {
      const v = armarVista(d, { mes: meses.at(-1), comparar });
      const texto = JSON.stringify(v);
      assert.ok(!/NaN|undefined|Infinity/.test(texto), `${corte} ${comparar}: valor roto`);
      if (comparar !== 'anio') continue;
      const s = v.sugiere.sugerencias;
      const r = s.find((x) => x.id === 'reasignar');
      // TikTok pasa su objetivo y el CRM confirma que es la que más cuesta por inscripción, con casos suficientes
      assert.ok(r && r.desde.id === 'tiktok' && r.desde.cpl > r.desde.metaCpl && !r.desde.cohorte.pocosCasos, `${corte}: sin la propuesta de reparto`);
      assert.ok(s.some((x) => x.id === 'renovar'), `${corte}: sin la lectura de las piezas nuevas de Meta`);
    }
  }
});
