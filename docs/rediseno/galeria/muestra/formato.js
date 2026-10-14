// Formato de cifras y fechas en español peruano. Escrito a mano a propósito:
// Intl.NumberFormat('es-PE') devuelve punto decimal y coma de miles, al revés de la norma
// peruana (D.S. 064-84-ITI/IND, reglas 7 y 8). La decisión final del separador es una
// pregunta abierta del plan; cambiarla es cambiar estas dos constantes.

export const DECIMAL = ',';
export const MILES = ' '; // espacio duro: no parte la cifra en dos líneas
export const MENOS = '−'; // signo menos tipográfico

const finito = (n) => typeof n === 'number' && Number.isFinite(n);

// «no medido» nunca es cero: se escribe con palabras cortas, no con una raya
export const NO_MEDIDO = 'sin dato';

export function numero(n, decimales = 0) {
  if (!finito(n)) return NO_MEDIDO;
  const fijo = Math.abs(n).toFixed(decimales);
  const [ent, dec] = fijo.split('.');
  const signo = n < 0 && Number(fijo) !== 0 ? MENOS : '';
  const miles = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, MILES) : ent; // 4 cifras sin separar: 1250
  return `${signo}${miles}${dec ? DECIMAL + dec : ''}`;
}

// Abreviado para ejes y rótulos: 12 300 -> «12,3 mil»; 2 450 000 -> «2,5 M»
export function compacto(n) {
  if (!finito(n)) return NO_MEDIDO;
  const a = Math.abs(n);
  if (a >= 1e6) return numero(n / 1e6, a >= 1e7 ? 0 : 1) + ' M';
  if (a >= 1e4) return numero(n / 1e3, a >= 1e5 ? 0 : 1) + ' mil';
  return numero(n, 0);
}

export const soles = (n, decimales = 0) => (finito(n) ? `S/${' '}${numero(n, decimales)}` : NO_MEDIDO);

export function porcentaje(p, decimales = 0) {
  if (!finito(p)) return NO_MEDIDO;
  return `${numero(p, decimales)}${' '}%`;
}

// Variación con signo explícito; el cero no lleva signo
export function variacion(p, decimales = 0) {
  if (!finito(p)) return NO_MEDIDO;
  const r = Number(Math.abs(p).toFixed(decimales));
  const signo = r === 0 ? '' : p > 0 ? '+' : MENOS;
  return `${signo}${numero(Math.abs(p), decimales)}${' '}%`;
}

// Un conteo con casos nunca se lee «0 %»
export function tasaDeConteo(casos, total) {
  if (!(total > 0) || !finito(casos)) return NO_MEDIDO;
  const p = (casos / total) * 100;
  if (casos > 0 && p < 1) return `<1${' '}%`;
  return porcentaje(p, p < 10 ? 1 : 0);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const partes = (iso) => ({ a: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) - 1, d: Number(iso.slice(8, 10)) });

export const fecha = (iso) => { const { a, m, d } = partes(iso); return `${d} de ${MESES[m]} de ${a}`; };
export const fechaCorta = (iso) => { const { m, d } = partes(iso); return `${d} ${MESES_CORTOS[m]}`; };
export const mesCorto = (m1) => MESES_CORTOS[m1 - 1];
export const mesAnio = (aaaamm) => `${MESES_CORTOS[+aaaamm.slice(5, 7) - 1]} ${aaaamm.slice(2, 4)}`;
export const fechaSinAnio = (iso) => { const { m, d } = partes(iso); return `${d} de ${MESES[m]}`; };
export const mesLargo = (m1) => MESES[m1 - 1];
export const diaSemanaLargo = (i) => DIAS[i];

// «1 al 30 de setiembre de 2026», «14 de setiembre al 13 de octubre de 2026», «20 de diciembre de 2025 al 3 de enero de 2026»
export function rangoFechas(desde, hasta) {
  const a = partes(desde), b = partes(hasta);
  if (a.a !== b.a) return `${fecha(desde)} al ${fecha(hasta)}`;
  if (a.m !== b.m) return `${a.d} de ${MESES[a.m]} al ${b.d} de ${MESES[b.m]} de ${b.a}`;
  return `${a.d} al ${b.d} de ${MESES[b.m]} de ${b.a}`;
}
