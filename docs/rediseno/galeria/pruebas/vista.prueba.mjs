// Barre todos los meses cerrados (contra el mes anterior y contra el año anterior) y ventanas de 7 días,
// y comprueba las reglas que la pantalla promete. Uso: node docs/rediseno/galeria/pruebas/vista.prueba.mjs [--sembrar]
const { generar } = await import('../muestra/generador.js');
const { CONFIG } = await import('../muestra/configuracion.js');
const { armarVista } = await import('../muestra/vista.js');
const { sumarDias, rango } = await import('../muestra/calendario.js');
const sembrar = process.argv.includes('--sembrar');
const data = generar(CONFIG);
if (sembrar) data.pauta.meta.find((p) => p.fecha === '2026-07-14').sinDato = false; // defecto: el día caído vuelve a contarse… sin datos
const fin = (aaaamm) => new Date(Date.UTC(+aaaamm.slice(0, 4), +aaaamm.slice(5, 7), 0)).toISOString().slice(0, 10);
const mesMenos = (aaaamm, n) => { const t = +aaaamm.slice(0, 4) * 12 + +aaaamm.slice(5, 7) - 1 - n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`; };
const casos = [];
for (let m = '2025-02'; m <= '2026-09'; m = mesMenos(m, -1)) {
  const p = { desde: m + '-01', hasta: fin(m), cohorteDesde: mesMenos(m, 1) + '-01', cohorteHasta: fin(mesMenos(m, 1)) };
  casos.push({ ...p, compararDesde: mesMenos(m, 1) + '-01', compararHasta: fin(mesMenos(m, 1)) });
  if (m >= '2026-01') casos.push({ ...p, compararDesde: mesMenos(m, 12) + '-01', compararHasta: fin(mesMenos(m, 12)) });
}
for (const d of ['2025-01-01', '2026-07-11', '2026-07-14', '2026-09-24']) casos.push({ desde: d, hasta: sumarDias(d, 6), compararDesde: sumarDias(d, -7), compararHasta: sumarDias(d, -1), cohorteDesde: '2025-03-01', cohorteHasta: '2025-03-31' });
const fallas = [];
const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
for (const c of casos) {
  const v = armarVista(data, c);
  const id = `${c.desde}..${c.hasta} vs ${c.compararDesde}`;
  const ok = (cond, msg) => { if (!cond) fallas.push(`${id}: ${msg}`); };
  ok(suma(v.canales, (x) => x.pctInversion) === 100 || v.resultados.leads === 0, 'la inversión no suma 100');
  ok(suma(v.canales, (x) => x.pctLeads) === 100 || v.resultados.leads === 0, 'los leads no suman 100');
  ok(Math.abs(suma(v.indice.componentes, (x) => x.aporte ?? 0) - v.indice.exacto) < 1e-9, 'los aportes no suman el índice');
  ok(suma(v.sedes, (s) => s.leads ?? 0) === v.resultados.leads, `sedes ${suma(v.sedes, (s) => s.leads ?? 0)} ≠ total ${v.resultados.leads}`);
  ok(v.periodo.comparable || v.resultados.cambio == null, 'delta publicado sin cobertura');
  ok(v.sedes.every((s) => v.periodo.comparable || s.cambio == null), 'delta de sede sin cobertura');
  ok(v.sedes.filter((s) => s.abre && s.abre > c.hasta).every((s) => s.leads == null), 'sede sin abrir con valor');
  ok(v.conversacion.meses.every((m) => suma(m.marcas, (x) => x.menciones) > 0 && suma(m.marcas, (x) => x.pct) === 100), 'mes de conversación vacío o que no suma 100');
  ok(v.conversacion.ranking.every((r) => r.rangos.every((x) => x >= 1)), 'puesto inventado');
  const dia14 = v.resultados.serie.find((p) => p.fecha === '2026-07-14');
  ok(!dia14 || dia14.valor === null, 'el 14 de julio de 2026 se dibuja como dato en el total');
  ok(v.horaDia.flat().every((x) => x == null || x >= 0), 'hora × día negativo');
  ok(v.embudo.etapas.every((e, i, a) => i === 0 || e.valor <= a[i - 1].valor), 'una etapa supera a la anterior');
}
console.log(fallas.length ? `ROJO: ${fallas.length}\n` + fallas.slice(0, 20).join('\n') : `verde: ${casos.length} períodos`);
process.exit(fallas.length ? 1 : 0);
