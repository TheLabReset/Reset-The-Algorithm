// Índice de oportunidad: suma ponderada exacta de cinco componentes de 0 a 100.
// Un componente que no se pudo medir sale y su peso se reparte entre los que sí (no entra como cero).

import { sumarDias, mes } from '../muestra/calendario.js';
import { suma, razon, indices, ventanaPauta, ventanaCanal } from './base.js';

const acotar = (v) => Math.max(0, Math.min(100, v));
const posicion = (v, min, max) => (max > min ? acotar(((v - min) / (max - min)) * 100) : 50);

export const COMPONENTES = [
  { id: 'demanda', nombre: 'Demanda de búsqueda', peso: 0.25, fuente: '1.3', mide: 'Interés de «gimnasio» en las últimas 4 semanas, dentro de su rango de 52 semanas' },
  { id: 'eficiencia', nombre: 'Costo por lead contra meta', peso: 0.25, fuente: '2.1', mide: 'CPL de 28 días contra la meta combinada: 100 si está 30 % bajo la meta, 50 en la meta, 0 si está 30 % sobre' },
  { id: 'conversion', nombre: 'Conversión a socio', peso: 0.2, fuente: '1.2', mide: 'Tasa de inscripción de la última cohorte cerrada de 28 días, dentro del rango de las 12 anteriores' },
  { id: 'conversacion', nombre: 'Conversación propia', peso: 0.15, fuente: '1.4', mide: 'Participación de la marca en 4 semanas, dentro de su rango de 52 semanas' },
  { id: 'temporada', nombre: 'Temporada del mes siguiente', peso: 0.15, fuente: '1.3', mide: 'Estacionalidad del mes siguiente dentro del rango del año' },
];

export function calcularIndice(data, fecha) {
  const cfg = data.config;
  // demanda
  const g = data.busquedas.find((b) => b.id === 'gimnasio').semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const ult4 = g.slice(-4), ult52 = g.slice(-52);
  const demanda = ult52.length < 52 ? null : posicion(suma(ult4, (s) => s.indice) / ult4.length, Math.min(...ult52.map((s) => s.indice)), Math.max(...ult52.map((s) => s.indice)));
  // eficiencia: meta combinada = Σinv / Σ(inv / meta)
  const d0 = sumarDias(fecha, -27);
  const tot = ventanaPauta(data, d0, fecha);
  const leadsMeta = suma(cfg.canales, (c) => ventanaCanal(data, c.id, d0, fecha).inversion / c.metaCpl);
  const metaComb = razon(tot.inversion, leadsMeta);
  const eficiencia = tot.cpl == null || metaComb == null ? null : acotar(((1.3 - tot.cpl / metaComb) / 0.6) * 100);
  // conversión: ventanas de 28 días ya cerradas
  const { crmDia } = indices(data);
  const cierre = sumarDias(fecha, -cfg.embudo.rezagoAltaMax);
  const tasa = (h) => {
    if (sumarDias(h, -27) < cfg.desde) return null;
    let l = 0, a = 0;
    for (let k = 0; k < 28; k++) { const x = crmDia.get(sumarDias(h, -k)); if (x) for (const v of Object.values(x)) { l += v.leads; a += v.altas; } }
    return razon(a, l);
  };
  const tasas = Array.from({ length: 13 }, (_, k) => tasa(sumarDias(cierre, -28 * k)));
  const conversion = tasas.every((v) => v != null) ? posicion(tasas[0], Math.min(...tasas), Math.max(...tasas)) : null;
  // conversación propia Σ/Σ
  const propia = data.conversacion.find((b) => b.propia).semanas.filter((s) => sumarDias(s.semana, 6) <= fecha);
  const totSem = (s) => suma(data.conversacion, (b) => b.semanas.find((x) => x.semana === s)?.menciones || 0);
  const u4 = propia.slice(-4);
  const sov4 = razon(suma(u4, (s) => s.menciones), suma(u4, (s) => totSem(s.semana)));
  const sov52 = propia.slice(-52).map((s) => s.menciones / (totSem(s.semana) || 1));
  const conversacion = propia.length < 52 || sov4 == null ? null : posicion(sov4, Math.min(...sov52), Math.max(...sov52));
  // temporada
  const mSig = (mes(fecha) % 12) + 1;
  const temporada = posicion(cfg.estacionalidad[mSig - 1], Math.min(...cfg.estacionalidad), Math.max(...cfg.estacionalidad));

  const valores = { demanda, eficiencia, conversion, conversacion, temporada };
  const medidos = COMPONENTES.filter((p) => valores[p.id] != null);
  const pesoTotal = suma(medidos, (p) => p.peso);
  const aportes = medidos.map((p) => (p.peso / pesoTotal) * valores[p.id]);
  const exacto = suma(aportes, (a) => a);
  return {
    valor: medidos.length ? Math.round(exacto) : null, exacto, fecha, completo: medidos.length === COMPONENTES.length,
    componentes: COMPONENTES.map((p) => {
      const i = medidos.indexOf(p);
      return { ...p, puntaje: valores[p.id], aporte: i >= 0 ? aportes[i] : null, pesoEfectivo: i >= 0 ? p.peso / pesoTotal : 0 };
    }),
  };
}

export function bandaDe(valor, bandas) {
  if (valor == null) return null;
  return bandas.find((b) => valor <= b.hasta) || bandas[bandas.length - 1];
}
