// Sugerencias del modelo. Cada una se publica solo si su condición se cumple con el dato,
// trae su cifra con rango cuando es una estimación, declara sus supuestos y apunta a la sección que la sostiene.

import { sumarDias } from '../muestra/calendario.js';
import { razon, ventanaCanal } from './base.js';
import { CLIENTE } from '../cliente.js';

// leads_c(I) = L_c · (I / I_c)^β : rendimientos decrecientes al mover presupuesto (β declarado en la configuración)
const curva = (L, I, Inuevo, beta) => (I > 0 ? L * (Inuevo / I) ** beta : 0);

// La propuesta va «al mes»: si el período no es un mes entero, la inversión y los leads del período se llevan a un ritmo
// de 30 días (las tasas y los costos no cambian). Un mes entero se usa tal cual
export function reasignacion(cfg, canales, P = null) {
  // cada plataforma con sus días medidos: un día sin dato no le resta
  const k = !P || (P.mes && !P.parcial) ? 1 : 30;
  if (k !== 1) canales = canales.map((c) => ({ ...c, inversion: (c.inversion / (c.medidos || P.dias)) * 30, leads: (c.leads / (c.medidos || P.dias)) * 30 }));
  const sobre = canales.filter((c) => c.cpl != null && c.cpl > c.metaCpl).sort((a, b) => b.cpl / b.metaCpl - a.cpl / a.metaCpl)[0];
  if (!sobre) return null;
  // de dónde sacar: solo si la plataforma (CPL) y el CRM (costo por inscripción) coinciden en que es el más caro
  const peorCrm = canales.filter((c) => c.cohorte?.cpa != null).sort((a, b) => b.cohorte.cpa - a.cohorte.cpa)[0];
  if (!peorCrm || peorCrm.id !== sobre.id) return null;
  const candidatos = canales.filter((c) => c.id !== sobre.id && c.cpl != null && c.cpl <= c.metaCpl && c.cohorte.altas >= cfg.metodo.casosMinimos && c.cohorte.cpa != null);
  // si las más baratas por inscripción se parecen (a menos del margen), entre ellas gana la de lead más barato
  const orden = candidatos.sort((a, b) => a.cohorte.cpa - b.cohorte.cpa);
  const empate = orden.filter((c) => orden[0] && c.cohorte.cpa / orden[0].cohorte.cpa - 1 < cfg.metodo.margenParecido);
  const destino = [...empate].sort((a, b) => a.cpl - b.cpl)[0];
  if (!destino) return null;
  const monto = Math.round((sobre.inversion * 0.5) / 100) * 100; // asumo: mover la mitad de la inversión del canal sobre meta
  if (!(monto > 0)) return null;
  const delta = (beta) => curva(destino.leads, destino.inversion, destino.inversion + monto, beta) - destino.leads + curva(sobre.leads, sobre.inversion, sobre.inversion - monto, beta) - sobre.leads;
  const { baja, central, alta } = cfg.metodo.elasticidad;
  const leads = { central: delta(central), baja: Math.min(delta(baja), delta(alta)), alta: Math.max(delta(baja), delta(alta)) };
  const inscripciones = {
    central: (curva(destino.leads, destino.inversion, destino.inversion + monto, central) - destino.leads) * destino.cohorte.tasaAlta + (curva(sobre.leads, sobre.inversion, sobre.inversion - monto, central) - sobre.leads) * sobre.cohorte.tasaAlta,
  };
  return {
    id: 'reasignar', sostiene: ['3.1'], tipo: 'estimacion',
    desde: sobre, hacia: destino, monto, leads, inscripciones,
    acuerdo: 'Pasa su objetivo de costo por lead y el CRM confirma que es la que más cuesta por inscripción; el destino se elige por costo por inscripción del CRM', supuestos: [`Mover la mitad de la inversión de ${sobre.nombre}`, ...(k !== 1 ? [`Ritmo mensual: la inversión y los leads del período llevados a 30 días`] : []), `Cada dólar adicional rinde un poco menos que el anterior (elasticidad de ${String(central).replace('.', ',')}, entre ${String(baja).replace('.', ',')} y ${String(alta).replace('.', ',')})`, 'La tasa de inscripción de cada plataforma se mantiene', ...(empate.length > 1 ? [`${empate.map((c) => c.nombre).join(' y ')} cuestan parecido por inscripción; se elige la de lead más barato`] : [])],
  };
}

export function agendamiento(cfg, embudo) {
  if (!embudo.cerrada) return null;
  const mayor = [...embudo.exclusivas].filter((e) => e.id !== 'alta').sort((a, b) => b.valor - a.valor)[0];
  if (mayor.id !== 'contacto') return null; // solo si el cuello está en pasar de contacto a cita
  const [L, C, Ci, , Al] = embudo.etapas.map((e) => e.valor);
  const tasaCita = razon(Ci, C);
  const mejora = cfg.metodo.mejoraAgendamiento;
  const nuevasAltas = Al * ((tasaCita + mejora) / tasaCita) - Al; // las etapas siguientes conservan su tasa
  return { id: 'agendar', sostiene: ['4.3'], tipo: 'escenario', tasaCita, mejora, nuevasAltas, sinCita: mayor, leads: L, supuestos: [`La tasa de cita sube ${Math.round(mejora * 100)} puntos`, 'Asistencia e inscripción mantienen su tasa'] };
}

export function fatigaCreativa(data, hasta) {
  // Busca un cambio de piezas registrado en los últimos 60 días del período y compara el CTR de antes y después
  const ev = data.config.eventos.filter((e) => e.tipo === 'creativo' && e.fecha <= hasta && e.fecha > sumarDias(hasta, -60)).pop();
  if (!ev) return null;
  const antes = ventanaCanal(data, ev.canal, sumarDias(ev.fecha, -21), sumarDias(ev.fecha, -1));
  const previo = ventanaCanal(data, ev.canal, sumarDias(ev.fecha, -63), sumarDias(ev.fecha, -43));
  const despues = ventanaCanal(data, ev.canal, ev.fecha, hasta < sumarDias(ev.fecha, 20) ? hasta : sumarDias(ev.fecha, 20));
  if (antes.ctr == null || despues.ctr == null || previo.ctr == null) return null;
  const caida = (antes.ctr - previo.ctr) / previo.ctr, recuperacion = (despues.ctr - antes.ctr) / antes.ctr;
  if (!(caida <= -0.1 && recuperacion >= 0.1)) return null;
  const canal = data.config.canales.find((c) => c.id === ev.canal);
  return { id: 'renovar', sostiene: ['3.3'], tipo: 'observacion', canal, evento: ev, ctrPrevio: previo.ctr, ctrAntes: antes.ctr, ctrDespues: despues.ctr, caida, recuperacion, diasDespues: despues.dias, supuestos: ['Compara 3 semanas antes del cambio de piezas con las 3 semanas de 6 a 9 semanas antes, y con lo que va desde el cambio'] };
}

export function temporada(cfg, hasta) {
  const m = +hasta.slice(5, 7);
  const proximos = [1, 2, 3].map((k) => ((m - 1 + k) % 12) + 1);
  const pico = proximos.map((x) => ({ mes: x, factor: cfg.estacionalidad[x - 1] })).filter((x) => x.factor >= 1.1).sort((a, b) => b.factor - a.factor)[0];
  return pico ? { id: 'temporada', sostiene: ['1.1', '2.2'], tipo: 'observacion', ...pico, supuestos: [`Estacionalidad de «${CLIENTE.busqueda}» en Google Trends, promedio 2022 a 2025`] } : null;
}
