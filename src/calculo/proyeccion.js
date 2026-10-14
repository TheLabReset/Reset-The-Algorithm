// Proyección de leads de pauta para los próximos meses, si se mantiene el plan de inversión.
// Método simple y declarado: leads por sol de los últimos 28 días, corregidos por estacionalidad,
// por la inversión planeada de cada mes. La banda no es decorativa: sale del error real que tuvo
// este mismo método en todos los meses anteriores de la muestra (backtest), por horizonte.

import { rango, sumarDias, mes } from '../muestra/calendario.js';
import { planDelDia } from '../muestra/generador.js';
import { suma, razon, cuantil, ventanaPauta, sumarMeses, finDeMes, diasDelMes } from './base.js';

const estDia = (cfg, d) => cfg.estacionalidad[mes(d) - 1];
const planMes = (cfg, aaaamm) => suma(rango(aaaamm + '-01', finDeMes(aaaamm)), (d) => suma(cfg.canales, (c) => planDelDia(cfg, c, d)));

function pronostico(data, origen, aaaamm) {
  const cfg = data.config;
  const d0 = sumarDias(origen, -27);
  if (d0 < cfg.desde) return null;
  const v = ventanaPauta(data, d0, origen);
  const porSol = razon(v.leads, v.inversion);
  if (porSol == null) return null;
  const estVentana = suma(rango(d0, origen), (d) => estDia(cfg, d)) / 28;
  return porSol * (cfg.estacionalidad[+aaaamm.slice(5, 7) - 1] / estVentana) * planMes(cfg, aaaamm);
}

// Leads reales de un mes cerrado; si faltó algún día, se escala por días medidos y se marca
function realDelMes(data, aaaamm) {
  const fin = finDeMes(aaaamm);
  if (fin > data.config.corte) return null;
  const v = ventanaPauta(data, aaaamm + '-01', fin);
  if (v.cobertura < data.config.metodo.coberturaMinima) return null;
  return { valor: v.medidos === v.dias ? v.leads : Math.round(v.leadsPorDia * v.dias), escalado: v.medidos !== v.dias };
}

export function backtest(data) {
  const cfg = data.config;
  const errores = { 1: [], 2: [], 3: [] };
  for (let m = cfg.desde.slice(0, 7); finDeMes(m) < cfg.corte; m = sumarMeses(m, 1)) {
    const origen = finDeMes(m);
    for (const h of [1, 2, 3]) {
      const objetivo = sumarMeses(m, h);
      const p = pronostico(data, origen, objetivo), r = realDelMes(data, objetivo);
      if (p && r) errores[h].push(r.valor / p);
    }
  }
  return Object.fromEntries(Object.entries(errores).map(([h, e]) => [h, { n: e.length, p10: cuantil(e, 0.1), p50: cuantil(e, 0.5), p90: cuantil(e, 0.9), errorMedio: e.length ? suma(e, (x) => Math.abs(x - 1)) / e.length : null }]));
}

export function proyectar(data, origen) {
  const cfg = data.config;
  const bt = backtest(data);
  const base = origen.slice(0, 7);
  const meses = [];
  for (let h = 1; h <= cfg.metodo.mesesProyeccion; h++) {
    const m = sumarMeses(base, h);
    const bruto = pronostico(data, origen, m);
    const e = bt[h];
    const usable = bruto != null && e.n >= 6;
    // el central se corrige por el sesgo que el método mostró en el pasado (mediana de real / pronóstico)
    meses.push({
      mes: m, horizonte: h, dias: diasDelMes(m), sesgo: e.p50,
      central: usable ? bruto * e.p50 : null, baja: usable ? bruto * e.p10 : null, alta: usable ? bruto * e.p90 : null,
      real: realDelMes(data, m), muestras: e.n,
    });
  }
  // los meses reales previos al origen, para que la proyección se lea contra su historia
  const historia = [];
  for (let k = 5; k >= 0; k--) { const m = sumarMeses(base, -k); const r = realDelMes(data, m); historia.push({ mes: m, real: r }); }
  return { origen, meses, historia, backtest: bt };
}
