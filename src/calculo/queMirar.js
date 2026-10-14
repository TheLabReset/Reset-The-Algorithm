// Qué mirar: reglas sobre la última lectura de cada fuente, como en el algoritmo en producción.
// Cada regla devuelve datos, nunca texto (el texto lo arma src/textos). Dos niveles:
//  · atencion: algo se salió de lo esperado y cuesta plata o leads mientras no se mira
//  · revisar: una lectura que conviene confirmar antes de decidir
// Cada aviso dice en qué plataforma mirar y qué sección lo sostiene.

import { rango, sumarDias } from '../muestra/calendario.js';
import { suma, razon, cuantil, indices, sumarMeses, finDeMes } from './base.js';
import { leeCrmDetalle } from './produccion.js';

export const UMBRALES = {
  sinConversion: 0.08, // gasto en palabras casi sin conversiones, sobre el gasto de Search
  caidaContactoRapido: 5, // puntos menos de contacto en menos de 5 minutos contra el mes anterior
  finDeSemanaLento: 0.5, // más de la mitad de los leads del fin de semana espera más de 2 horas
  llegaAlCrm: 0.85, // de cada lead reportado, cuántos llegan al CRM
  subeBusqueda: 50, // % de subida en tres meses
  caidaConversionWeb: 15, // % de caída de la conversión del sitio, últimos 7 días contra los 7 anteriores
  diaBajo: 0.5, // un día con menos de la mitad de la inversión mediana del período
};

export function queMirar(data, P, v) {
  const cfg = data.config, ix = indices(data);
  const avisos = [];
  const add = (a) => avisos.push(a);
  const pl = v.lee.plataformas;

  if (pl.estado === 'ok') {
    const ult7 = rango(sumarDias(P.hasta, -6), P.hasta);
    for (const p of pl.plataformas) {
      // CPL de la última semana contra su objetivo
      let inv = 0, leads = 0;
      ult7.forEach((d) => { const f = p.porDia.find((x) => x.fecha === d); if (f?.inversion != null) { inv += f.inversion; leads += f.leads; } });
      const cpl = razon(inv, leads);
      if (cpl != null && p.objetivo != null && cpl > p.objetivo) add({ id: 'cpl-objetivo', nivel: 'atencion', fuente: p.nombre, sostiene: '1.1', datos: { plataforma: p.nombre, cpl, objetivo: p.objetivo, leads, desde: ult7[0], hasta: P.hasta } });
      // días fuera de rango: sin dato o con menos de la mitad de la inversión mediana
      const med = cuantil(p.porDia.filter((x) => x.inversion != null).map((x) => x.inversion), 0.5);
      const raros = p.porDia.filter((x) => x.inversion == null || x.inversion < UMBRALES.diaBajo * med);
      if (raros.length) add({ id: 'dia-fuera', nivel: 'atencion', fuente: p.nombre, sostiene: '1.1', datos: { plataforma: p.nombre, dias: raros.map((x) => ({ fecha: x.fecha, sinDato: x.inversion == null, inversion: x.inversion })), mediana: med } });
    }
    const k = pl.palabras;
    const pct = razon(k.gastoSinConversion, k.inversionSearch);
    if (pct >= UMBRALES.sinConversion) add({ id: 'palabras-sin-conversion', nivel: 'revisar', fuente: 'Google Ads', sostiene: '1.1', datos: { palabras: k.sinConversion.map((x) => x.texto), monto: k.gastoSinConversion, pct } });
  }

  const cd = v.lee.crmDetalle;
  if (cd.estado === 'ok') {
    // contacto rápido contra el mes anterior (regla operativa: siempre contra el mes previo)
    const mesAnt = sumarMeses(P.hasta.slice(0, 7), -1);
    if (mesAnt + '-01' >= cfg.desde) {
      const ant = leeCrmDetalle(data, { ...P, desde: mesAnt + '-01', hasta: finDeMes(mesAnt), compararDesde: P.compararDesde, compararHasta: P.compararHasta });
      const caida = (ant.atencion.rapidos - cd.atencion.rapidos) * 100;
      if (caida >= UMBRALES.caidaContactoRapido) add({ id: 'contacto-lento', nivel: 'atencion', fuente: 'CRM', sostiene: '1.2', datos: { ahora: cd.atencion.rapidos, antes: ant.atencion.rapidos, mesAntes: mesAnt, causa: cd.atencion.cambioDesde?.texto || null } });
    }
    if (cd.atencion.lentosFinDeSemana > UMBRALES.finDeSemanaLento) add({ id: 'fin-de-semana', nivel: 'revisar', fuente: 'CRM', sostiene: '1.2', datos: { finDeSemana: cd.atencion.lentosFinDeSemana, laborable: cd.atencion.lentosLaborable } });
  }

  const r = v.analiza.rendimiento;
  if (r.estado === 'ok' && r.masBaratoPorLead && r.masBaratoPorInscripcion && r.masBaratoPorLead.id !== r.masBaratoPorInscripcion.id) {
    add({ id: 'plataforma-vs-crm', nivel: 'revisar', fuente: 'CRM', sostiene: '2.2', datos: { porLead: r.masBaratoPorLead.nombre, porInscripcion: r.masBaratoPorInscripcion.nombre } });
  }
  const pc = v.analiza.pautaCrm;
  if (pc.estado === 'ok') for (const p of pc.plataformas) if (p.porCadaReportado != null && p.porCadaReportado < UMBRALES.llegaAlCrm) add({ id: 'llega-poco', nivel: 'revisar', fuente: p.nombre, sostiene: '2.2', datos: { plataforma: p.nombre, de100: Math.round(p.porCadaReportado * 100), reportados: p.reportados, enCrm: p.enCrm } });

  const re = v.lee.redes;
  if (re.estado === 'ok' && re.pideLectura) add({ id: 'tema-negativo', nivel: 'revisar', fuente: 'Escucha social', sostiene: '1.4', datos: { tema: re.pideLectura.nombre, tono: re.pideLectura.tono, tonoPrevio: re.pideLectura.tonoPrevio, menciones: re.pideLectura.menciones } });

  const bu = v.lee.busquedas;
  if (bu.estado === 'ok' && bu.palabras) for (const b of bu.palabras) if (!b.propia && (b.cambio3m >= UMBRALES.subeBusqueda || b.subiendo)) add({ id: 'busqueda-sube', nivel: 'revisar', fuente: 'Google Trends', sostiene: '1.3', datos: { termino: b.termino, cambio: b.cambio3m, sinBase: b.sinBase } });

  if (v.lee.web.estado === 'ok') {
    const tasa = (dias) => { let s = 0, q = 0; dias.forEach((d) => { const w = ix.webDia.get(d); if (w) { s += suma(Object.values(w.fuentes), (f) => f.sesiones); q += suma(Object.values(w.fuentes), (f) => f.solicitudes); } }); return razon(q, s); };
    const a = tasa(rango(sumarDias(P.hasta, -6), P.hasta)), b = tasa(rango(sumarDias(P.hasta, -13), sumarDias(P.hasta, -7)));
    if (a != null && b && ((b - a) / b) * 100 >= UMBRALES.caidaConversionWeb) add({ id: 'web-convierte-menos', nivel: 'atencion', fuente: 'Analítica web', sostiene: '1.6', datos: { ahora: a, antes: b } });
  }

  const orden = { atencion: 0, revisar: 1 };
  return avisos.sort((x, y) => orden[x.nivel] - orden[y.nivel]);
}
