// Prueba del formateador. Uso: node docs/rediseno/galeria/pruebas/formato.prueba.mjs
// Prueba negativa: con --sembrar se cambia el separador decimal y tiene que dar rojo.
const f = await import('../muestra/formato.js');
const sembrar = process.argv.includes('--sembrar');
const n = (t) => (sembrar ? t.replace(',', '.') : t).replace(/ /g, ' ');
const casos = [
  [f.numero(1234567.891, 2), '1 234 567,89'], [f.numero(1250), '1250'], [f.numero(12500), '12 500'],
  [f.numero(-0.004, 2), '0,00'], [f.numero(-3.5, 1), '−3,5'], [f.numero(NaN), 'sin dato'], [f.numero(null), 'sin dato'],
  [f.compacto(2450000), '2,5 M'], [f.compacto(12300), '12,3 mil'], [f.compacto(123456), '123 mil'],
  [f.soles(42.5, 2), 'S/ 42,50'], [f.variacion(-43.2), '−43 %'], [f.variacion(0.4), '0 %'], [f.variacion(12.4), '+12 %'],
  [f.tasaDeConteo(3, 1000), '<1 %'], [f.tasaDeConteo(0, 1000), '0,0 %'], [f.tasaDeConteo(5, 0), 'sin dato'],
  [f.rangoFechas('2026-09-14', '2026-10-13'), '14 de setiembre al 13 de octubre de 2026'],
  [f.rangoFechas('2026-10-01', '2026-10-13'), '1 al 13 de octubre de 2026'],
  [f.rangoFechas('2025-12-20', '2026-01-03'), '20 de diciembre de 2025 al 3 de enero de 2026'],
  [f.fechaSinAnio('2026-03-02'), '2 de marzo'], [f.mesAnio('2026-09'), 'set 26'],
];
const fallas = casos.filter(([a, b]) => n(a) !== b);
fallas.forEach(([a, b]) => console.log('FALLA', JSON.stringify(a.replace(/ /g, ' ')), 'esperaba', b));
console.log(`${casos.length - fallas.length}/${casos.length}`);
process.exit(fallas.length ? 1 : 0);
