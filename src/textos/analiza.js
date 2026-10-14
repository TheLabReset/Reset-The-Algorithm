// Lecturas de la capa Analiza: lo que aparece al cruzar fuentes. Observan; no ordenan.
import { numero, dolares, porcentaje, diaSemanaLargo } from '../sistema/formato.js';
import { periodoTexto, mesTexto, capital, lista } from './comun.js';

export function veredicto(v) {
  const r = v.analiza.rendimiento;
  if (r.estado !== 'ok' || !r.masBaratoPorLead) return null;
  if (!r.masBaratoPorInscripcion) return `${r.masBaratoPorLead.nombre} es el canal más barato por lead. Por inscripción todavía no hay casos suficientes para decirlo.`;
  if (r.masBaratoPorLead.id === r.masBaratoPorInscripcion.id) return `${r.masBaratoPorLead.nombre} es el canal más barato por lead y también por inscripción.`;
  return `${r.masBaratoPorLead.nombre} es el canal más barato por lead; ${r.masBaratoPorInscripcion.nombre}, por inscripción.`;
}

export function inversionContraLeads(v) {
  const c = v.analiza.rendimiento.canales;
  const mas = [...c].sort((a, b) => (b.pctLeads - b.pctInversion) - (a.pctLeads - a.pctInversion))[0];
  const menos = [...c].sort((a, b) => (a.pctLeads - a.pctInversion) - (b.pctLeads - b.pctInversion))[0];
  return {
    titulo: 'Parte de la inversión contra parte de los leads',
    lectura: `${mas.nombre} trae más leads de los que le tocarían por su inversión. ${menos.nombre}, al revés: se lleva ${numero(menos.pctInversion)} de cada 100 dólares y trae ${numero(menos.pctLeads)} de cada 100 leads.`,
  };
}

export function productos(v) {
  const p = v.analiza.reparto.productos;
  const total = p.reduce((s, x) => s + x.total, 0);
  const marca = p.find((x) => x.id === 'marca');
  return { titulo: 'Por producto y plataforma', lectura: `${porcentaje((marca.total / total) * 100)} de la inversión de ${periodoTexto(v.periodo)} fue a campañas de marca, que no buscan leads.` };
}

export function ritmo(v) {
  const r = v.analiza.ritmo;
  const base = `Al cierre de ${periodoTexto(v.periodo)} se invirtió ${porcentaje(r.ejecutado * 100, 1)} del plan de los mismos días.`;
  return { titulo: 'Ritmo de inversión contra el plan', lectura: r.parciales.length ? `${base} No cuenta ${numero(r.parciales.length)} ${r.parciales.length === 1 ? 'día' : 'días'} con una plataforma sin dato, ni en lo real ni en el plan.` : base };
}

export function pautaCrm(v) {
  const ps = v.analiza.pautaCrm.plataformas;
  const peor = [...ps].sort((a, b) => a.porCadaReportado - b.porCadaReportado)[0];
  return { titulo: 'Lo que reportan las plataformas contra lo que llega al CRM', lectura: `De cada 100 leads que reporta ${peor.nombre}, ${numero(Math.round(peor.porCadaReportado * 100))} llegan al CRM. La diferencia son duplicados, pruebas y conversiones que la plataforma cuenta y el CRM no recibe.` };
}

export function costos(v) {
  const r = v.analiza.rendimiento;
  const titulo = 'Costo por lead y costo por inscripción';
  if (!r.cohorteCerrada) return { titulo, lectura: `El costo por inscripción usa la cohorte de ${mesTexto(r.cohorteDesde.slice(0, 7))}, que todavía no cierra: se muestra solo el costo por lead.` };
  const a = r.masBaratoPorLead, b = r.masBaratoPorInscripcion;
  if (!b) return { titulo, lectura: 'Ningún canal tiene inscripciones suficientes para comparar el costo por inscripción.' };
  return { titulo, lectura: a.id === b.id ? `${a.nombre} gana en las dos columnas.` : `La plataforma y el CRM no coinciden: ${a.nombre} sale más barato por lead (${dolares(a.cpl, 2)}) y ${b.nombre} por inscripción (${dolares(b.cohorte.cpa)}).` };
}

export function demanda(v) {
  const d = v.analiza.demandaRespuesta;
  const r = d.r;
  const fuerza = r == null ? null : Math.abs(r) >= 0.7 ? 'se mueven muy juntos' : Math.abs(r) >= 0.4 ? 'se mueven bastante juntos' : 'se mueven poco juntos';
  return { titulo: 'Interés de búsqueda y leads, semana a semana', lectura: r == null ? 'Faltan semanas completas para medir cuánto se mueven juntos.' : `En ${numero(d.semanas)} semanas, el interés por «gimnasio» y los leads de pauta ${fuerza} (correlación de ${numero(r, 2)}). Que se muevan juntos no prueba que uno cause el otro: los dos siguen la temporada.` };
}

export function hora(v) {
  const h = v.analiza.horaDia;
  return { titulo: 'Leads por hora y día de la semana', lectura: `El pico es el ${diaSemanaLargo(h.pico.dia)} a las ${h.pico.hora}:00, con ${numero(h.pico.v, 1)} leads en promedio en esa hora.` };
}

export function sedes(v) {
  const s = v.analiza.sedes.items.filter((x) => x.leads != null);
  const mas = [...s].sort((a, b) => b.leads - a.leads)[0];
  const conTasa = s.filter((x) => x.tasa && !x.tasa.pocosCasos);
  const mejor = [...conTasa].sort((a, b) => b.tasa.valor - a.tasa.valor)[0];
  const nuevas = v.analiza.sedes.items.filter((x) => x.estado === 'abrio-en-el-periodo' || x.estado === 'sin-anterior');
  let lectura = `${mas.nombre} recibe más leads.`;
  if (mejor && mejor.id !== mas.id) lectura += ` ${mejor.nombre} es la que mejor inscribe: ${numero(mejor.tasa.valor * 100, 1)} de cada 100 leads.`;
  else if (mejor) lectura += ` También es la que mejor inscribe: ${numero(mejor.tasa.valor * 100, 1)} de cada 100 leads.`;
  void nuevas;
  return { titulo: 'Leads por sede, agrupadas por zona', lectura };
}
