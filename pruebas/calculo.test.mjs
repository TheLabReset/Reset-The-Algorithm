// Pruebas de la capa de cálculo: barre todos los meses con las dos comparaciones y verifica las reglas
// que la pantalla promete. Uso: npm run prueba   (prueba negativa: SEMBRAR=1 npm run prueba)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generar } from '../src/muestra/generador.js';
import { CONFIG } from '../src/muestra/configuracion.js';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';

const data = generar(CONFIG);
if (process.env.SEMBRAR === '1') data.pauta.meta.find((p) => p.fecha === '2026-07-14').sinDato = false; // defecto: el día caído vuelve como dato vacío
const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
const meses = mesesDisponibles(CONFIG);
const casos = meses.flatMap((m) => [{ mes: m, comparar: 'anio' }, { mes: m, comparar: 'anterior' }]);
const vistas = casos.map((f) => ({ f, v: armarVista(data, f) }));
const cada = (nombre, fn) => test(nombre, () => { for (const { f, v } of vistas) fn(v, `${f.mes} contra ${f.comparar}`); });

test('hay meses para barrer', () => assert.ok(casos.length >= 40));

cada('las participaciones de canal suman 100', (v, id) => {
  if (v.analiza.rendimiento.estado !== 'ok') return;
  assert.equal(suma(v.analiza.rendimiento.canales, (c) => c.pctInversion), 100, id);
  assert.equal(suma(v.analiza.rendimiento.canales, (c) => c.pctLeads), 100, id);
});
cada('los aportes del índice suman el índice', (v, id) => {
  const i = v.sugiere.indice;
  if (i.valor == null) return;
  assert.ok(Math.abs(suma(i.componentes, (c) => c.aporte ?? 0) - i.exacto) < 1e-9, id);
  assert.ok(i.valor >= 0 && i.valor <= 100, id);
});
cada('ningún delta se publica sin cobertura', (v, id) => {
  if (!v.periodo.comparable) {
    if (v.lee.pauta.estado === 'ok') assert.equal(v.lee.pauta.cambio, null, id);
    if (v.analiza.sedes.estado === 'ok') v.analiza.sedes.items.forEach((s) => assert.equal(s.cambio, null, `${id} ${s.nombre}`));
  }
});
cada('el día sin dato de Meta nunca entra como dato en el total', (v, id) => {
  if (v.lee.pauta.estado !== 'ok') return;
  const d = v.lee.pauta.serie.find((p) => p.fecha === '2026-07-14');
  if (d) assert.equal(d.valor, null, id);
  assert.ok(v.lee.pauta.serie.every((p) => p.valor === null || Number.isFinite(p.valor)), id);
});
cada('el embudo es anidado y las 5 partes suman 100', (v, id) => {
  if (v.lee.crm.estado !== 'ok') return;
  const e = v.lee.crm.etapas.map((x) => x.valor);
  e.forEach((x, i) => { if (i) assert.ok(x <= e[i - 1], id); });
  assert.equal(suma(v.lee.crm.exclusivas, (x) => x.de100), 100, id);
  assert.equal(suma(v.lee.crm.porOrigen, (o) => o.leads), e[0], id);
});
cada('el CRM incluye a la pauta: nunca menos leads de pauta que lo que reportan las plataformas', (v, id) => {
  if (v.lee.crm.estado !== 'ok' || v.lee.pauta.estado !== 'ok') return;
  assert.ok(v.lee.crm.periodo.dePauta >= v.lee.pauta.leads, id);
  if (!v.lee.pauta.diasParciales.length) assert.equal(v.lee.crm.periodo.dePauta, v.lee.pauta.leads, id);
});
cada('las sedes suman los leads del CRM del período', (v, id) => {
  if (v.analiza.sedes.estado !== 'ok' || v.lee.crm.estado !== 'ok') return;
  assert.equal(suma(v.analiza.sedes.items, (s) => s.leads ?? 0), v.lee.crm.periodo.leads, id);
  v.analiza.sedes.items.filter((s) => s.abre && s.abre > v.periodo.hasta).forEach((s) => assert.equal(s.leads, null, `${id} ${s.nombre}`));
});
cada('web: fuentes suman 100 y las solicitudes desde pauta no superan a los leads de pauta', (v, id) => {
  if (v.lee.web.estado !== 'ok') return;
  assert.equal(suma(v.lee.web.fuentes, (f) => f.pct), 100, id);
  assert.equal(suma(v.lee.web.fuentes, (f) => f.solicitudes), v.lee.web.solicitudes, id);
  if (v.lee.crm.estado === 'ok') assert.ok(v.lee.web.desdePauta <= v.lee.crm.periodo.dePauta, id);
  assert.ok(v.lee.web.movil >= 0 && v.lee.web.movil <= 1, id);
});
cada('conversación: cada mes suma 100 y no hay puestos inventados', (v, id) => {
  if (v.lee.conversacion.estado !== 'ok') return;
  v.lee.conversacion.meses.forEach((m) => assert.equal(suma(m.marcas, (x) => x.pct), 100, `${id} ${m.mes}`));
  v.lee.conversacion.ranking.forEach((r) => r.rangos.forEach((x) => assert.ok(x >= 1, id)));
});
cada('hora × día: promedios no negativos', (v, id) => {
  if (v.analiza.horaDia.estado !== 'ok') return;
  v.analiza.horaDia.matriz.flat().forEach((x) => assert.ok(x === null || x >= 0, id));
});
cada('ritmo: lo ejecutado se compara contra el plan de los mismos días', (v, id) => {
  if (v.analiza.ritmo.estado !== 'ok') return;
  assert.ok(v.analiza.ritmo.planMedido <= v.analiza.ritmo.plan + 1e-6, id);
  assert.ok(v.analiza.ritmo.ejecutado > 0.5 && v.analiza.ritmo.ejecutado <= 1.0001, id); // R8: nunca sobre el presupuesto
});
cada('proyección: la banda contiene al central', (v, id) => {
  if (v.sugiere.proyeccion.estado !== 'ok') return;
  v.sugiere.proyeccion.meses.filter((m) => m.central != null).forEach((m) => assert.ok(m.baja <= m.central && m.central <= m.alta, `${id} ${m.mes}`));
});
cada('sugerencias: cada una apunta a una sección', (v, id) => {
  v.sugiere.sugerencias.forEach((s) => assert.ok(s.sostiene.length && s.supuestos.length, `${id} ${s.id}`));
});
