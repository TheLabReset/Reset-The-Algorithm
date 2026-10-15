// Escenario de los próximos meses: cuántos leads de pauta habría SI la inversión diaria se mantiene como en las
// últimas 4 semanas y la respuesta también. No usa un plan de inversión: en producción no lo tenemos. No es meta ni promesa: es un rango condicional.
//
// Método (declarado en pantalla):
//   leads por dólar de los últimos 28 días × estacionalidad del mes / estacionalidad de la ventana × inversión diaria de
//   esos 28 días × días del mes.
// Rango: del menor al mayor error que tuvo este mismo método en los meses pasados (real / estimado, por horizonte),
//   usando solo meses que ya habían cerrado. El punto medio se corrige por el sesgo mediano de esos errores.
//   No se le pone un nivel de confianza: se informa cuántas veces acertó.
// Dos pruebas de honestidad, calculadas igual que en vivo (sin mirar el futuro):
//   · acierto del rango por horizonte: en cuántos meses pasados el real cayó dentro del rango que se habría mostrado ese día;
//   · contra lo ingenuo: error medio del método frente a repetir el ritmo diario de las últimas 4 semanas.
// Un horizonte se muestra solo si su rango acertó al menos metodo.aciertoMinimo de metodo.pruebasMinimas pruebas o más,
// y solo si el método le gana a lo ingenuo. Si no, la vista dice por qué no lo muestra.

import { rango, sumarDias, mes } from '../muestra/calendario.js';
import { suma, razon, cuantil, ventanaPauta, sumarMeses, finDeMes, diasDelMes } from './base.js';

const estDia = (cfg, d) => cfg.estacionalidad[mes(d) - 1];
const MINIMO_ERRORES = 6;

function ventana28(data, origen) {
  const d0 = sumarDias(origen, -27);
  if (d0 < data.config.desde) return null;
  const v = ventanaPauta(data, d0, origen);
  return v.cobertura < data.config.metodo.coberturaMinima ? null : { d0, v };
}

function estimado(data, origen, aaaamm) {
  const cfg = data.config;
  const w = ventana28(data, origen);
  if (!w) return null;
  const porSol = razon(w.v.leads, w.v.inversion);
  if (porSol == null) return null;
  const estVentana = suma(rango(w.d0, origen), (d) => estDia(cfg, d)) / 28;
  const inversionMes = (w.v.inversion / w.v.medidos) * diasDelMes(aaaamm); // si la inversión diaria se mantiene
  return porSol * (cfg.estacionalidad[+aaaamm.slice(5, 7) - 1] / estVentana) * inversionMes;
}

// Lo ingenuo: el ritmo diario de las últimas 4 semanas, repetido todo el mes
function ingenuo(data, origen, aaaamm) {
  const w = ventana28(data, origen);
  return w && w.v.leadsPorDia != null ? w.v.leadsPorDia * diasDelMes(aaaamm) : null;
}

// Leads reales de un mes cerrado; si faltó algún día, se escala por días medidos y se marca
function realDelMes(data, aaaamm) {
  const fin = finDeMes(aaaamm);
  if (fin > data.config.corte) return null;
  const v = ventanaPauta(data, aaaamm + '-01', fin);
  if (v.cobertura < data.config.metodo.coberturaMinima) return null;
  return { valor: v.medidos === v.dias ? v.leads : Math.round(v.leadsPorDia * v.dias), escalado: v.medidos !== v.dias };
}

// Todas las pruebas posibles hacia atrás: desde cada fin de mes, estimar 1, 2 y 3 meses adelante
export function pruebasHaciaAtras(data, horizontes) {
  const cfg = data.config;
  const out = [];
  for (let m = cfg.desde.slice(0, 7); finDeMes(m) < cfg.corte; m = sumarMeses(m, 1)) {
    const origen = finDeMes(m);
    for (let h = 1; h <= horizontes; h++) {
      const objetivo = sumarMeses(m, h);
      const est = estimado(data, origen, objetivo), real = realDelMes(data, objetivo), ing = ingenuo(data, origen, objetivo);
      if (est && real && ing) out.push({ origen, objetivo, h, real: real.valor, estimado: est, ingenuo: ing, razon: real.valor / est });
    }
  }
  return out;
}

// El rango que se habría mostrado en una fecha: solo con errores de meses ya cerrados en esa fecha
function rangoEn(pruebas, h, fecha) {
  const conocidos = pruebas.filter((p) => p.h === h && finDeMes(p.objetivo) <= fecha).map((p) => p.razon);
  if (conocidos.length < MINIMO_ERRORES) return null;
  return { n: conocidos.length, menor: Math.min(...conocidos), mediana: cuantil(conocidos, 0.5), mayor: Math.max(...conocidos) };
}

export function escenario(data, origen) {
  const cfg = data.config;
  const H = cfg.metodo.mesesProyeccion;
  // solo lo que ya había cerrado en la fecha de origen: elegir un mes pasado no deja mirar el futuro
  const pruebas = pruebasHaciaAtras(data, H).filter((p) => finDeMes(p.objetivo) <= origen);
  const base = origen.slice(0, 7);

  const { aciertoMinimo, pruebasMinimas } = cfg.metodo;
  // Honestidad 1 · acierto del rango por horizonte, calculado sin mirar el futuro
  const evaluadas = pruebas.map((p) => ({ ...p, r: rangoEn(pruebas, p.h, p.origen) })).filter((p) => p.r)
    .map((p) => ({ ...p, dentro: p.real >= p.estimado * p.r.menor && p.real <= p.estimado * p.r.mayor }));
  const acierto = Object.fromEntries(Array.from({ length: H }, (_, k) => {
    const e = evaluadas.filter((p) => p.h === k + 1);
    return [k + 1, { probados: e.length, dentro: e.filter((p) => p.dentro).length }];
  }));
  // Honestidad 2 · error medio del método contra lo ingenuo, en las mismas pruebas
  const errorMetodo = evaluadas.length ? suma(evaluadas, (p) => Math.abs(p.real - p.estimado * p.r.mediana) / p.real) / evaluadas.length : null;
  const errorIngenuo = evaluadas.length ? suma(evaluadas, (p) => Math.abs(p.real - p.ingenuo) / p.real) / evaluadas.length : null;
  const leGana = errorMetodo != null && errorIngenuo != null && errorMetodo < errorIngenuo;

  const meses = [];
  for (let h = 1; h <= H; h++) {
    const m = sumarMeses(base, h);
    const bruto = estimado(data, origen, m);
    const r = rangoEn(pruebas, h, origen);
    const a = acierto[h];
    const confiable = a.probados >= pruebasMinimas && a.dentro / a.probados >= aciertoMinimo;
    const motivo = bruto == null || r == null ? 'faltan datos' : !leGana ? 'no le gana a lo ingenuo' : !confiable ? 'acierta poco' : null;
    meses.push({
      mes: m, horizonte: h, dias: diasDelMes(m), muestras: r?.n ?? 0, acierto: a, motivo,
      central: motivo ? null : bruto * r.mediana, baja: motivo ? null : bruto * r.menor, alta: motivo ? null : bruto * r.mayor,
      real: realDelMes(data, m),
    });
  }
  const historia = [];
  for (let k = 5; k >= 0; k--) { const m = sumarMeses(base, -k); historia.push({ mes: m, real: realDelMes(data, m) }); }
  return {
    origen, meses, historia, acierto, leGana,
    error: { metodo: errorMetodo, ingenuo: errorIngenuo },
    supuestos: { ventanaDias: 28 },
  };
}
