// Qué mirar: reglas sobre la última lectura de cada fuente, como en el algoritmo en producción.
// Cada regla devuelve datos, nunca texto (el texto lo arma src/textos). Dos niveles:
//  · atencion: algo se salió de lo esperado y cuesta plata o leads mientras no se mira
//  · revisar: una lectura que conviene confirmar antes de decidir
// Cada aviso dice en qué plataforma mirar y qué sección lo sostiene.

import { rango, sumarDias } from '../muestra/calendario.js';
import { suma, razon, cuantil, indices, sumarMeses, finDeMes } from './base.js';
import { leeCrmDetalle, interaccionCanal } from './produccion.js';

export const UMBRALES = {
  sinConversion: 0.08, // gasto en palabras casi sin conversiones, sobre el gasto de Search
  caidaContactoEnElDia: 5, // puntos menos de leads con primer contacto en menos de 24 horas, contra el mes anterior
  finDeSemanaEspera: 0.25, // más de un cuarto de los leads del fin de semana espera más de un día por su primer contacto
  llegaAlCrm: 0.85, // de cada lead reportado, cuántos llegan al CRM
  subeBusqueda: 50, // % de subida en tres meses
  caidaInteraccion: 20, // % de caída de la tasa de interacción de un canal pagado del sitio contra el mes anterior
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
      if (cpl != null && p.objetivo != null && cpl > p.objetivo) add({ id: 'cpl-objetivo', nivel: 'atencion', fuente: p.nombre, sostiene: '3.2', datos: { plataforma: p.nombre, cpl, objetivo: p.objetivo, leads, desde: ult7[0], hasta: P.hasta } });
      // días fuera de rango: sin dato o con menos de la mitad de la inversión mediana
      const med = cuantil(p.porDia.filter((x) => x.inversion != null).map((x) => x.inversion), 0.5);
      const raros = p.porDia.filter((x) => x.inversion == null || x.inversion < UMBRALES.diaBajo * med);
      if (raros.length) add({ id: 'dia-fuera', nivel: 'atencion', fuente: p.nombre, sostiene: '3.2', datos: { plataforma: p.nombre, dias: raros.map((x) => ({ fecha: x.fecha, sinDato: x.inversion == null, inversion: x.inversion })), mediana: med } });
    }
    const k = pl.palabras;
    const pct = razon(k.gastoSinConversion, k.inversionSearch);
    if (pct >= UMBRALES.sinConversion) add({ id: 'palabras-sin-conversion', nivel: 'revisar', fuente: 'Google Ads', sostiene: '3.2', datos: { palabras: k.sinConversion.map((x) => x.texto), monto: k.gastoSinConversion, pct } });
  }

  const cd = v.lee.crmDetalle;
  if (cd.estado === 'ok') {
    // contacto rápido contra el mes anterior (regla operativa: siempre contra el mes previo)
    const mesAnt = sumarMeses(P.hasta.slice(0, 7), -1);
    if (mesAnt + '-01' >= cfg.desde) {
      const ant = leeCrmDetalle(data, { ...P, desde: mesAnt + '-01', hasta: finDeMes(mesAnt), compararDesde: P.compararDesde, compararHasta: P.compararHasta });
      const caida = (ant.atencion.enElDia - cd.atencion.enElDia) * 100;
      if (caida >= UMBRALES.caidaContactoEnElDia) add({ id: 'contacto-lento', nivel: 'atencion', fuente: 'CRM', sostiene: '4.3', datos: { ahora: cd.atencion.enElDia, antes: ant.atencion.enElDia, mesAntes: mesAnt, causa: cd.atencion.cambioDesde?.texto || null, causaDesde: cd.atencion.cambioDesde?.desde || null } });
    }
    if (cd.atencion.masDeUnDiaFinDeSemana > UMBRALES.finDeSemanaEspera) add({ id: 'fin-de-semana', nivel: 'revisar', fuente: 'CRM', sostiene: '4.3', datos: { finDeSemana: cd.atencion.masDeUnDiaFinDeSemana, laborable: cd.atencion.masDeUnDiaLaborable } });
  }

  const r = v.analiza.rendimiento;
  if (r.estado === 'ok' && !r.cpaParecido && r.masBaratoPorLead && r.masBaratoPorInscripcion && r.masBaratoPorLead.id !== r.masBaratoPorInscripcion.id) {
    add({ id: 'plataforma-vs-crm', nivel: 'revisar', fuente: 'CRM', sostiene: '4.2', datos: { porLead: r.masBaratoPorLead.nombre, porInscripcion: r.masBaratoPorInscripcion.nombre } });
  }
  const pc = v.analiza.pautaCrm;
  if (pc.estado === 'ok') for (const p of pc.plataformas) if (p.porCadaReportado != null && p.porCadaReportado < UMBRALES.llegaAlCrm) add({ id: 'llega-poco', nivel: 'revisar', fuente: p.nombre, sostiene: '4.2', datos: { plataforma: p.nombre, de100: Math.round(p.porCadaReportado * 100), reportados: p.reportados, enCrm: p.enCrm } });


  const bu = v.lee.busquedas;
  if (bu.estado === 'ok' && bu.palabras) for (const b of bu.palabras) if (!b.propia && (b.cambio3m >= UMBRALES.subeBusqueda || b.subiendo)) add({ id: 'busqueda-sube', nivel: 'oportunidad', fuente: 'Google Trends', sostiene: '1.1', datos: { termino: b.termino, cambio: b.cambio3m, sinBase: b.sinBase } });

  // GA4: un canal pagado cuyas sesiones interactúan bastante menos que el mes anterior (el clic se paga igual).
  // Si en el período hay un evento anotado en una plataforma de ese canal, se cita como coincidencia, no como causa.
  if (v.lee.web.estado === 'ok') {
    const mesAnt = sumarMeses(P.hasta.slice(0, 7), -1);
    if (mesAnt + '-01' >= cfg.desde) for (const f of cfg.web.fuentes.filter((x) => x.deClics)) {
      const ahora = interaccionCanal(data, f.id, P.desde, P.hasta), antes = interaccionCanal(data, f.id, mesAnt + '-01', finDeMes(mesAnt));
      if (ahora.sesiones < 300 || !antes.tasa) continue;
      const caida = ((antes.tasa - ahora.tasa) / antes.tasa) * 100;
      if (caida < UMBRALES.caidaInteraccion) continue;
      const evento = cfg.eventos.find((e) => e.fecha >= P.desde && e.fecha <= P.hasta && f.deClics.includes(e.canal));
      add({ id: 'interaccion-cae', nivel: 'atencion', fuente: 'GA4', sostiene: '1.2', datos: { canal: f.nombre, ahora: ahora.tasa, antes: antes.tasa, mesAntes: mesAnt, sesiones: ahora.sesiones, evento } });
    }
  }

  const orden = { atencion: 0, revisar: 1, oportunidad: 2 };
  return avisos.sort((x, y) => orden[x.nivel] - orden[y.nivel]);
}

// Lo que va bien: el algoritmo también dice qué sostener. Mismas reglas de honestidad: cada señal trae su dato.
export const UMBRALES_BIEN = {
  bajoObjetivo: 0.1, // una plataforma con costo por lead al menos 10 % bajo su objetivo en el mes
  mejoraAnual: 0.15, // costo por lead al menos 15 % más bajo que un año antes
  recuperaCtr: 0.2, // las piezas nuevas suben el CTR al menos 20 %
};

export function queVaBien(data, P, v) {
  const bien = [];
  const pl = v.lee.plataformas;
  if (pl.estado === 'ok') for (const p of pl.plataformas) {
    if (p.cpl == null || p.objetivo == null) continue;
    const margen = (p.objetivo - p.cpl) / p.objetivo;
    const anual = p.cplPrevio ? (p.cplPrevio - p.cpl) / p.cplPrevio : null;
    if (margen >= UMBRALES_BIEN.bajoObjetivo) bien.push({ id: 'bajo-objetivo', fuente: p.nombre, sostiene: '3.2', datos: { plataforma: p.nombre, cpl: p.cpl, objetivo: p.objetivo, margen, anual } });
    else if (anual != null && anual >= UMBRALES_BIEN.mejoraAnual) bien.push({ id: 'mejora-anual', fuente: p.nombre, sostiene: '3.2', datos: { plataforma: p.nombre, cpl: p.cpl, previo: p.cplPrevio, anual } });
  }
  const renovar = v.sugiere.sugerencias.find((s) => s.id === 'renovar');
  if (renovar && renovar.recuperacion >= UMBRALES_BIEN.recuperaCtr) bien.push({ id: 'piezas-nuevas', fuente: renovar.canal.nombre, sostiene: '3.2', datos: { canal: renovar.canal.nombre, antes: renovar.ctrAntes, despues: renovar.ctrDespues, recuperacion: renovar.recuperacion, fecha: renovar.evento.fecha } });
  const co = v.lee.competencia;
  if (co.estado === 'ok') {
    const orden = [...co.marcas].sort((a, b) => b.sentimiento.indice - a.sentimiento.indice);
    if (orden[0].propia) bien.push({ id: 'mejor-sentimiento', fuente: 'Escucha social', sostiene: '4.5', datos: { indice: orden[0].sentimiento.indice, segundo: orden[1].nombre, segundoIndice: orden[1].sentimiento.indice } });
  }
  return bien;
}
