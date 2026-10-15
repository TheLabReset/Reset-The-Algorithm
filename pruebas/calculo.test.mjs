// Pruebas de la capa de cálculo: barre todos los meses con las dos comparaciones y verifica las reglas
// que la pantalla promete. Uso: npm run prueba   (prueba negativa: SEMBRAR=1 npm run prueba)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generar } from '../src/muestra/generador.js';
import { CONFIG } from '../src/muestra/configuracion.js';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';
import { CAPAS } from '../src/capas/estructura.js';

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
test('la plataforma reporta de más, nunca de menos: cada día medido, reportados ≥ leads que llegan al CRM', () => {
  const crmDia = new Map();
  for (const x of data.cohortes) { const k = `${x.canal}|${x.fecha}`; crmDia.set(k, (crmDia.get(k) || 0) + x.leads); }
  for (const c of CONFIG.canales) {
    let rep = 0, reales = 0;
    for (const p of data.pauta[c.id]) {
      const enCrm = crmDia.get(`${c.id}|${p.fecha}`) || 0;
      if (p.sinDato) continue;
      assert.ok(p.leads >= enCrm && p.leads <= 2 * enCrm, `${c.id} ${p.fecha}`);
      rep += p.leads; reales += enCrm;
    }
    // en toda la serie, la inflación medida queda a menos de un punto de la declarada
    assert.ok(Math.abs(rep / reales - 1 - c.inflacion) < 0.01, `${c.id} infla ${(rep / reales - 1).toFixed(3)}`);
  }
  // el día que Meta no entregó, el CRM igual recibió sus leads
  assert.ok((crmDia.get('meta|2026-07-14') || 0) > 0);
});
cada('las sedes suman los leads del CRM del período', (v, id) => {
  if (v.analiza.sedes.estado !== 'ok' || v.lee.crm.estado !== 'ok') return;
  assert.equal(suma(v.analiza.sedes.items, (s) => s.leads ?? 0), v.lee.crm.periodo.leads, id);
  v.analiza.sedes.items.filter((s) => s.abre && s.abre > v.periodo.hasta).forEach((s) => assert.equal(s.leads, null, `${id} ${s.nombre}`));
});
cada('GA4: canales suman 100, usuarios ≤ sesiones y no hay leads en el sitio', (v, id) => {
  if (v.lee.web.estado !== 'ok') return;
  assert.equal(suma(v.lee.web.canales, (f) => f.pct), 100, id);
  assert.equal(suma(v.lee.web.canales, (f) => f.sesiones), v.lee.web.sesiones, id);
  assert.ok(v.lee.web.canales.every((c) => c.usuarios <= c.sesiones && c.tasa >= 0 && c.tasa <= 1), id);
  assert.ok(v.lee.web.movil >= 0 && v.lee.web.movil <= 1, id);
  assert.ok([...v.lee.web.porHora, ...v.lee.web.porDiaSemana].every((n) => n == null || n >= 0), id);
  assert.equal(v.lee.web.horasAltas.length, 4, id);
  assert.ok(!('solicitudes' in v.lee.web), 'GA4 no muestra leads');
});
cada('conversación: cada mes suma 100 y no hay puestos inventados', (v, id) => {
  if (v.lee.conversacion.estado !== 'ok') return;
  v.lee.conversacion.meses.forEach((m) => assert.equal(suma(m.marcas, (x) => x.pct), 100, `${id} ${m.mes}`));
  v.lee.conversacion.ranking.forEach((r) => r.rangos.forEach((x) => assert.ok(x >= 1, id)));
});
cada('hora y día: promedios no negativos y las horas de un día suman el día', (v, id) => {
  const h = v.analiza.horaDia;
  if (h.estado !== 'ok') return;
  [...h.porHora, ...h.porDiaSemana].forEach((x) => assert.ok(x === null || x >= 0, id));
  // el promedio de un día cualquiera (ponderado por cuántos hubo de cada tipo) es la suma de los promedios por hora
  const dias = suma(h.veces, (x) => x);
  const porDia = suma(h.porDiaSemana.map((x, i) => (x ?? 0) * h.veces[i]), (x) => x) / dias;
  assert.ok(Math.abs(porDia - suma(h.porHora, (x) => x)) < 1e-6, id);
});
cada('escenario: el rango contiene al punto medio', (v, id) => {
  if (v.sugiere.escenario.estado !== 'ok') return;
  v.sugiere.escenario.meses.filter((m) => m.central != null).forEach((m) => assert.ok(m.baja <= m.central && m.central <= m.alta, `${id} ${m.mes}`));
});
cada('sugerencias: cada una apunta a una sección', (v, id) => {
  v.sugiere.sugerencias.forEach((s) => assert.ok(s.sostiene.length && s.supuestos.length, `${id} ${s.id}`));
});

test('escenario: no mira el futuro (lo mismo con o sin los meses posteriores al origen)', async () => {
  const { escenario } = await import('../src/calculo/escenario.js');
  const origen = '2026-03-31';
  const completo = escenario(data, origen);
  const recortado = escenario({ ...data, config: { ...data.config, corte: origen } }, origen);
  assert.deepEqual(completo.acierto, recortado.acierto);
  assert.deepEqual(completo.meses.map((m) => [m.central, m.baja, m.alta, m.motivo]), recortado.meses.map((m) => [m.central, m.baja, m.alta, m.motivo]));
});

// ── Detalle de producción ──
// los capítulos válidos salen de la estructura de capas: una alerta que apunta a un capítulo que no existe falla
const SECCIONES = CAPAS.flatMap((c) => c.secciones.map((x) => x.numero));
cada('las campañas suman su plataforma y las plataformas suman 100 % de la inversión', (v, id) => {
  const pl = v.lee.plataformas;
  if (pl.estado !== 'ok') return;
  for (const p of pl.plataformas) {
    assert.ok(Math.abs(suma(p.campanas, (c) => c.inversion) - p.inversion) < 0.01, `${id} ${p.nombre}`);
    assert.equal(suma(p.campanas, (c) => c.leads), p.leads, `${id} ${p.nombre}`);
  }
  assert.equal(suma(pl.plataformas, (p) => p.pctInversion), 100, id);
  // Google Ads + Meta Ads + TikTok Ads = la pauta del período en días completos (la programática no entra)
  if (!v.lee.pauta.diasParciales?.length && v.lee.pauta.estado === 'ok') assert.ok(Math.abs(suma(pl.plataformas, (p) => p.inversion) - v.lee.pauta.inversion) < 0.01, id);
});
cada('las palabras clave suman los clics de Search del período', (v, id) => {
  const pl = v.lee.plataformas;
  if (pl.estado !== 'ok') return;
  const search = pl.plataformas.find((p) => p.id === 'google').campanas.filter((c) => c.canal === 'search');
  assert.equal(suma(pl.palabras.nombradas, (k) => k.clics) + (pl.palabras.resto?.clics || 0), suma(search, (c) => c.clics), id);
});
cada('el CRM por dentro cuadra: etapas, salidas, fuentes y atención', (v, id) => {
  const c = v.lee.crmDetalle;
  if (c.estado !== 'ok') return;
  const abiertos = suma(c.etapas.slice(0, 4), (e) => e.estan);
  assert.equal(abiertos + c.salidas.inscritos + c.salidas.descartados, c.etapas[0].entraron, id);
  c.etapas.forEach((e, k) => { if (k) assert.ok(e.entraron <= c.etapas[k - 1].entraron, `${id} ${e.nombre}`); });
  assert.equal(suma(c.fuentes, (f) => f.leads), c.total, id);
  assert.equal(suma(c.fuentes, (f) => f.pct), 100, id);
  c.fuentes.forEach((f) => assert.ok(f.altas <= f.asisten && f.asisten <= f.citas && f.citas <= f.contactos && f.contactos <= f.leads, `${id} ${f.nombre}`));
  assert.equal(c.atencion.conRegistro + c.atencion.sinRegistro, c.etapas[1].entraron, id);
  assert.equal(suma(c.descarte.motivos, (m) => m.valor), c.descarte.total, id);
  c.campanas.forEach((k) => assert.ok(k.altas <= k.leads, `${id} ${k.nombre}`));
});
cada('lo que llega al CRM no supera lo reportado salvo días sin dato de la plataforma', (v, id) => {
  const pc = v.analiza.pautaCrm;
  if (pc.estado !== 'ok') return;
  for (const p of pc.plataformas) {
    const conCaida = v.lee.plataformas.plataformas.find((x) => x.id === p.id).diasSinDato > 0;
    if (!conCaida) assert.ok(p.enCrm <= p.reportados, `${id} ${p.nombre}`);
  }
});
cada('cada aviso de qué mirar apunta a una sección que existe', (v, id) => {
  v.sugiere.queMirar.forEach((a) => { assert.ok(SECCIONES.includes(a.sostiene), `${id} ${a.id}`); assert.ok(['atencion', 'revisar', 'oportunidad'].includes(a.nivel), `${id} ${a.id}`); });
});

cada('lo que va bien apunta a una sección y trae su dato', (v, id) => {
  (v.sugiere.queVaBien || []).forEach((b) => { assert.ok(SECCIONES.includes(b.sostiene), `${id} ${b.id}`); assert.ok(b.datos && Object.keys(b.datos).length, `${id} ${b.id}`); });
});

// Como en producción: el cliente ve plataformas (Google Ads junta Search y Display), nunca los canales internos
const PLATAFORMAS = CONFIG.plataformas.map((p) => p.nombre);
cada('pauta, CRM y rendimiento se leen por plataforma', (v, id) => {
  assert.deepEqual(v.fuentes.filter((f) => f.grupo === 'pauta').map((f) => f.nombre), PLATAFORMAS, id);
  if (v.analiza.rendimiento.estado === 'ok') assert.deepEqual(v.analiza.rendimiento.canales.map((c) => c.nombre), PLATAFORMAS, id);
  if (v.lee.crm.estado === 'ok') for (const o of v.lee.crm.porOrigen.slice(0, -1)) assert.ok(PLATAFORMAS.includes(o.nombre), id);
});
cada('la inversión por día de pauta suma la inversión del período', (v, id) => {
  if (v.lee.pauta.estado !== 'ok') return;
  const s = suma(v.lee.pauta.serieInversion.filter((p) => p.valor != null), (p) => p.valor);
  assert.ok(Math.abs(s - v.lee.pauta.inversion) < 0.01, `${id}: ${s} contra ${v.lee.pauta.inversion}`);
});
cada('con costos por inscripción parecidos no hay alerta de desacuerdo', (v, id) => {
  const r = v.analiza.rendimiento;
  if (r.cpaParecido && r.cpaParecido.ids.includes(r.masBaratoPorLead?.id)) assert.ok(!v.sugiere.queMirar.some((a) => a.id === 'plataforma-vs-crm'), id);
});

// Una fuente caída nunca se reemplaza con data vieja: sin CRM no hay costo por inscripción ni propuesta de mover inversión
test('sin CRM no hay costo por inscripción ni sugerencia de reparto', () => {
  const v = armarVista(data, { mes: meses.at(-1), comparar: 'anio' }, { fuentesCaidas: ['crm'] });
  assert.equal(v.analiza.rendimiento.totalCohorte, null);
  assert.ok(v.analiza.rendimiento.canales.every((c) => c.cohorte == null));
  assert.ok(!v.sugiere.sugerencias.some((s) => s.id === 'reasignar'));
});
// La demo trae un mes en que el modelo propone mover inversión, con sus reglas de siempre
test('el último mes de la muestra trae una propuesta de reparto', () => {
  const v = armarVista(data, { mes: meses.at(-1), comparar: 'anio' });
  const s = v.sugiere.sugerencias.find((x) => x.id === 'reasignar');
  assert.ok(s, 'el escenario de la demo dejó de producir una propuesta');
  assert.ok(s.desde.cpl > s.desde.metaCpl && !s.desde.cohorte.pocosCasos);
});
