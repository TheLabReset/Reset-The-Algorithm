// Fechas como texto ISO 'AAAA-MM-DD' en UTC: así un día nunca se corre por zona horaria.

const DIA = 86400000;
export const aFecha = (iso) => new Date(iso + 'T00:00:00Z');
export const aIso = (d) => d.toISOString().slice(0, 10);
export const sumarDias = (iso, n) => aIso(new Date(aFecha(iso).getTime() + n * DIA));
export const diasEntre = (a, b) => Math.round((aFecha(b) - aFecha(a)) / DIA);

export function rango(desde, hasta) {
  const out = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) out.push(d);
  return out;
}

// 0 = lunes ... 6 = domingo
export const diaSemana = (iso) => (aFecha(iso).getUTCDay() + 6) % 7;
export const mes = (iso) => Number(iso.slice(5, 7));
export const anio = (iso) => Number(iso.slice(0, 4));

// Lunes de la semana ISO del día
export const inicioSemana = (iso) => sumarDias(iso, -diaSemana(iso));
