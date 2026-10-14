// armarVista(data, filtros, estado) devuelve todo lo que pintan las tres capas. Es la única puerta entre
// la data y la pantalla: los componentes no calculan. Cada sección trae su estado, su universo y su alcance.

import { rango, sumarDias, diaSemana, diasEntre } from '../muestra/calendario.js';
import { planDelDia } from '../muestra/generador.js';
import {
  suma, razon, cambioPct, mayorResto, correlacion, indices, dentro, ventanaCanal, ventanaPauta, leadsPautaDia,
  ventanaCrm, ventanaWeb, sumarMeses, finDeMes, semanaEn, ETAPAS,
} from './base.js';
import { calcularIndice, bandaDe } from './indice.js';
import { escenario } from './escenario.js';
import { reasignacion, agendamiento, fatigaCreativa, temporada } from './sugerencias.js';
import { queMirar } from './queMirar.js';
import { leePlataformas, leeCrmDetalle, leeBusquedasDetalle, leeRedes, leeCompetencia, leeWebDetalle, analizaReparto, analizaPautaCrm } from './produccion.js';

export function periodoDesdeFiltros(cfg, { mes, comparar = 'anio' }) {
  const desde = mes + '-01', hasta = finDeMes(mes);
  const comp = comparar === 'anio' ? sumarMeses(mes, -12) : sumarMeses(mes, -1);
  const coh = sumarMeses(mes, -1);
  return { desde, hasta, compararDesde: comp + '-01', compararHasta: finDeMes(comp), cohorteDesde: coh + '-01', cohorteHasta: finDeMes(coh), comparar, mes };
}

export function mesesDisponibles(cfg) {
  const out = [];
  for (let m = cfg.desde.slice(0, 7); finDeMes(m) <= cfg.corte; m = sumarMeses(m, 1)) out.push(m);
  return out;
}

export function armarVista(data, filtros, estado = {}) {
  const cfg = data.config;
  const P = filtros.desde ? filtros : periodoDesdeFiltros(cfg, filtros);
  const { desde, hasta, compararDesde, compararHasta, cohorteDesde, cohorteHasta } = P;
  if (hasta > cfg.corte) throw new Error('El período no puede pasar el corte de la muestra');
  const caidas = new Set(estado.fuentesCaidas || []); // escenario: fuentes que no cargaron
  const ix = indices(data);
  const minCob = cfg.metodo.coberturaMinima;
  const fuera = desde < cfg.desde;
  const compFuera = compararDesde < cfg.desde;

  const pa = ventanaPauta(data, desde, hasta), pb = ventanaPauta(data, compararDesde, compararHasta);
  const comparable = !compFuera && pa.cobertura >= minCob && pb.cobertura >= minCob;
  const periodo = {
    ...P, dias: pa.dias, comparable, compFuera, corte: cfg.corte,
    mesCompleto: desde.endsWith('-01') && sumarDias(hasta, 1).endsWith('-01') && desde.slice(0, 7) === hasta.slice(0, 7),
  };

  // ── Fuentes y su frescura ──
  const ultimoMedido = (c) => [...data.pauta[c.id]].reverse().find((p) => !p.sinDato)?.fecha;
  const fuentes = [
    ...cfg.canales.map((c) => ({ id: c.id, grupo: 'pauta', nombre: c.nombre, corte: ultimoMedido(c), sinDato: ventanaCanal(data, c.id, desde, hasta).sinDato })),
    { id: 'crm', grupo: 'crm', nombre: 'CRM', corte: cfg.corte, sinDato: [] },
    { id: 'web', grupo: 'web', nombre: 'Analítica web', corte: cfg.corte, sinDato: [] },
    { id: 'busquedas', grupo: 'busquedas', nombre: 'Google Trends', corte: sumarDias(data.semanas.at(-1), 6), sinDato: [], semanal: true },
    { id: 'conversacion', grupo: 'conversacion', nombre: 'Escucha social', corte: sumarDias(data.semanas.at(-1), 6), sinDato: [], semanal: true },
  ].map((f) => ({ ...f, estado: caidas.has(f.id) || caidas.has(f.grupo) ? 'no-cargo' : f.sinDato.length ? 'parcial' : 'ok' }));
  const estadoGrupo = (g) => (fuentes.filter((f) => f.grupo === g).some((f) => f.estado === 'no-cargo') ? 'no-cargo' : fuera ? 'fuera' : 'ok');

  // ══════════════ CAPA 1 · LEE ══════════════
  const fechas = rango(desde, hasta);
  const desfase = diasEntre(compararDesde, desde);
  const pauta = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : {
    estado: 'ok', universo: 'Leads que reporta cada plataforma de pauta',
    leads: pa.leads, leadsPrevio: pb.leads, inversion: pa.inversion, cpl: pa.cpl, cplPrevio: pb.cpl,
    cambio: comparable ? cambioPct(pa.leadsPorDia, pb.leadsPorDia) : null, mismoLargo: pa.medidos === pb.medidos,
    cambioCpl: comparable ? cambioPct(pa.cpl, pb.cpl) : null,
    diasParciales: pa.parciales,
    serie: fechas.map((d) => ({ fecha: d, valor: leadsPautaDia(data, d) })),
    seriePrevia: fechas.map((d) => { const f = sumarDias(d, -desfase); return { fecha: f, valor: dentro(data, f) ? leadsPautaDia(data, f) : null }; }),
    eventos: cfg.eventos.filter((e) => e.fecha >= desde && e.fecha <= hasta),
    porCanal: cfg.canales.map((c) => {
      const a = ventanaCanal(data, c.id, desde, hasta), b = ventanaCanal(data, c.id, compararDesde, compararHasta);
      return {
        id: c.id, nombre: c.nombre, leads: a.leads, sinDato: a.sinDato,
        cambio: !compFuera && a.cobertura >= minCob && b.cobertura >= minCob ? cambioPct(a.leadsPorDia, b.leadsPorDia) : null,
        serie: fechas.map((d) => { const p = ix.pautaDia[c.id].get(d); return { fecha: d, valor: p && !p.sinDato ? p.leads : null }; }),
      };
    }),
  };

  // CRM: cohorte cerrada del mes anterior al período, y leads del período por origen
  const cohorteFuera = cohorteDesde < cfg.desde;
  const cerrada = diasEntre(cohorteHasta, cfg.corte) >= cfg.embudo.rezagoAltaMax;
  let crm;
  if (estadoGrupo('crm') === 'no-cargo') crm = { estado: 'no-cargo' };
  else if (cohorteFuera) crm = { estado: 'fuera', cohorteDesde, cohorteHasta };
  else {
    const co = ventanaCrm(data, cohorteDesde, cohorteHasta);
    const [L, C, Ci, A, Al] = ETAPAS.map((e) => co[e]);
    const exclusivas = [
      { id: 'alta', nombre: 'Se inscribió', valor: Al },
      { id: 'asistio', nombre: 'Fue y no se inscribió', valor: A - Al },
      { id: 'cita', nombre: 'Agendó y no fue', valor: Ci - A },
      { id: 'contacto', nombre: 'Contactado sin cita', valor: C - Ci },
      { id: 'sin', nombre: 'No se logró contactar', valor: L - C },
    ];
    const de100 = mayorResto(exclusivas.map((e) => e.valor));
    const enPeriodo = ventanaCrm(data, desde, hasta);
    const deSitio = enPeriodo.porOrigen[cfg.organico.id]?.leads || 0;
    crm = {
      estado: 'ok', universo: 'Leads que entraron al CRM: de pauta y del sitio sin pauta', alcance: 'cohorte',
      cerrada, cohorteDesde, cohorteHasta,
      etapas: ETAPAS.map((e) => ({ id: e, valor: co[e] })), exclusivas: exclusivas.map((e, i) => ({ ...e, de100: de100[i] })),
      tasaAlta: razon(Al, L),
      porOrigen: [...cfg.canales, cfg.organico].map((c) => {
        const o = co.porOrigen[c.id] || { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 };
        return { id: c.id, nombre: c.nombre, ...o, tasaAlta: razon(o.altas, o.leads), destinos: { alta: o.altas, asistio: o.asisten - o.altas, cita: o.citas - o.asisten, contacto: o.contactos - o.citas, sin: o.leads - o.contactos } };
      }),
      periodo: { leads: enPeriodo.leads, dePauta: enPeriodo.leads - deSitio, deSitio },
    };
  }

  // Búsquedas: semanas cuyo jueves cae en el período
  const semPer = data.semanas.filter((s) => semanaEn(s, desde, hasta));
  const semComp = data.semanas.filter((s) => semanaEn(s, compararDesde, compararHasta));
  const prom = (b, ss) => (ss.length ? suma(ss, (s) => b.semanas.find((x) => x.semana === s).indice) / ss.length : null);
  let busquedas;
  if (estadoGrupo('busquedas') === 'no-cargo') busquedas = { estado: 'no-cargo' };
  else if (!semPer.length) busquedas = { estado: 'sin-semanas' };
  else {
    const g = data.busquedas.find((b) => b.id === 'gimnasio');
    const fin52 = data.semanas.filter((s) => sumarDias(s, 3) <= hasta).slice(-52);
    busquedas = {
      estado: 'ok', universo: 'Interés relativo de 0 a 100 en Google Trends (no es volumen)', semanas: semPer.length,
      demanda: prom(g, semPer), demandaPrevia: semComp.length ? prom(g, semComp) : null,
      cambio: semComp.length ? cambioPct(prom(g, semPer), prom(g, semComp)) : null,
      serie: fin52.map((s) => ({ fecha: s, valor: g.semanas.find((x) => x.semana === s).indice })),
      seriePrevia: fin52.map((s) => { const f = sumarDias(s, -364); const x = g.semanas.find((y) => y.semana === f); return { fecha: f, valor: x ? x.indice : null }; }),
      terminos: data.busquedas.map((b) => ({ id: b.id, nombre: b.termino, propia: b.propia, actual: prom(b, semPer), previo: semComp.length ? prom(b, semComp) : null })),
      corte: fuentes.find((f) => f.id === 'busquedas').corte,
    };
  }

  // Conversación: 12 meses hasta el período, solo meses con data
  // 13 meses: del mismo mes del año anterior al mes del período, para que «en un año» empiece donde dice
  const meses12 = Array.from({ length: 13 }, (_, k) => sumarMeses(hasta.slice(0, 7), k - 12));
  const sovMes = meses12.map((m) => ({ mes: m, tot: data.conversacion.map((b) => suma(b.semanas.filter((s) => sumarDias(s.semana, 3).slice(0, 7) === m), (s) => s.menciones)) }))
    .filter((x) => suma(x.tot, (v) => v) > 0)
    .map(({ mes: m, tot }) => { const pct = mayorResto(tot); return { mes: m, marcas: data.conversacion.map((b, i) => ({ id: b.id, nombre: b.nombre, propia: b.propia, menciones: tot[i], pct: pct[i] })) }; });
  let conversacion;
  if (estadoGrupo('conversacion') === 'no-cargo') conversacion = { estado: 'no-cargo' };
  else if (sovMes.length < 2) conversacion = { estado: 'pocos-meses', meses: sovMes.length };
  else {
    const ranking = data.conversacion.filter((b) => b.id !== 'otros').map((b) => ({ id: b.id, nombre: b.nombre, propia: b.propia, rangos: sovMes.map((mm) => mm.marcas.filter((x) => x.id !== 'otros').sort((p, q) => q.menciones - p.menciones).findIndex((x) => x.id === b.id) + 1) }));
    const rp = ranking.find((r) => r.propia).rangos;
    conversacion = {
      estado: 'ok', universo: 'Menciones públicas en redes de 6 gimnasios y «Otros» (data de muestra)', meses: sovMes, ranking,
      propia: { actual: sovMes.at(-1).marcas.find((x) => x.propia).pct, inicio: sovMes[0].marcas.find((x) => x.propia).pct, puestoActual: rp.at(-1), mejor3: Math.min(...rp.slice(-3)), peor3: Math.max(...rp.slice(-3)) },
    };
  }

  // Web
  let web;
  if (estadoGrupo('web') !== 'ok') web = { estado: estadoGrupo('web') };
  else {
    const wa = ventanaWeb(data, desde, hasta), wb = ventanaWeb(data, compararDesde, compararHasta);
    const pctSes = mayorResto(cfg.web.fuentes.map((f) => wa.fuentes[f.id].sesiones));
    const desdePauta = cfg.web.fuentes.filter((f) => f.deClics).reduce((s, f) => s + wa.fuentes[f.id].solicitudes, 0);
    web = {
      estado: 'ok', universo: 'Sesiones y solicitudes de prueba del sitio',
      sesiones: wa.sesiones, sesionesCambio: !compFuera ? cambioPct(wa.sesiones / wa.dias, wb.sesiones / wb.dias) : null,
      solicitudes: wa.solicitudes, desdePauta, sinPauta: wa.solicitudes - desdePauta,
      movil: razon(wa.movil, wa.sesiones),
      fuentes: cfg.web.fuentes.map((f, i) => ({ id: f.id, nombre: f.nombre, pauta: !!f.deClics, sesiones: wa.fuentes[f.id].sesiones, pct: pctSes[i], solicitudes: wa.fuentes[f.id].solicitudes })),
      paginas: cfg.web.paginas.map((p, i) => ({ ...p, sesiones: wa.paginas[i].sesiones, solicitudes: wa.paginas[i].solicitudes, tasa: razon(wa.paginas[i].solicitudes, wa.paginas[i].sesiones) })).sort((a, b) => b.solicitudes - a.solicitudes),
    };
  }

  // Detalle de producción: plataformas y campañas, CRM por dentro, redes, competencia, sitio
  const plataformas = estadoGrupo('pauta') === 'ok' ? { estado: 'ok', universo: 'Lo que reporta cada plataforma', ...leePlataformas(data, P) } : { estado: estadoGrupo('pauta') };
  const crmDetalle = estadoGrupo('crm') === 'ok' ? { estado: 'ok', universo: 'Leads registrados en el CRM en el período', ...leeCrmDetalle(data, P) } : { estado: estadoGrupo('crm') };
  if (busquedas.estado === 'ok') Object.assign(busquedas, leeBusquedasDetalle(data, P));
  const redes = estadoGrupo('conversacion') === 'ok' ? { estado: 'ok', universo: 'TikTok y conversación pública sobre Fit Lab', ...leeRedes(data, P) } : { estado: estadoGrupo('conversacion') };
  const competencia = estadoGrupo('conversacion') === 'ok' ? { estado: 'ok', universo: 'Publicaciones y anuncios de cada marca (cifras de muestra)', ...leeCompetencia(data, P) } : { estado: estadoGrupo('conversacion') };
  if (web.estado === 'ok') Object.assign(web, leeWebDetalle(data, P));

  // ══════════════ CAPA 2 · ANALIZA ══════════════
  const diasComunes = fechas.filter((d) => leadsPautaDia(data, d) != null);
  const sumaComun = (id, k) => suma(diasComunes, (d) => ix.pautaDia[id].get(d)[k]);
  const pctInv = mayorResto(cfg.canales.map((c) => sumaComun(c.id, 'inversion')));
  const pctLeads = mayorResto(cfg.canales.map((c) => sumaComun(c.id, 'leads')));
  const coCanal = cohorteFuera || !cerrada ? null : ventanaCrm(data, cohorteDesde, cohorteHasta);
  const canales = cfg.canales.map((c, i) => {
    const a = ventanaCanal(data, c.id, desde, hasta);
    const invCoh = ventanaCanal(data, c.id, cohorteDesde, cohorteHasta);
    const o = coCanal?.porOrigen[c.id];
    return {
      id: c.id, nombre: c.nombre, inversion: a.inversion, leads: a.leads, cpl: a.cpl, metaCpl: c.metaCpl, sinDato: a.sinDato,
      pctInversion: pctInv[i], pctLeads: pctLeads[i],
      cohorte: o ? { leads: o.leads, altas: o.altas, tasaAlta: razon(o.altas, o.leads), cpa: razon(invCoh.inversion, o.altas), pocosCasos: o.altas < cfg.metodo.casosMinimos, cobertura: invCoh.cobertura } : null,
    };
  });
  const porCpl = [...canales].filter((c) => c.cpl != null).sort((a, b) => a.cpl - b.cpl);
  const porCpa = [...canales].filter((c) => c.cohorte?.cpa != null && !c.cohorte.pocosCasos).sort((a, b) => a.cohorte.cpa - b.cohorte.cpa);
  const rendimiento = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : {
    estado: 'ok', universo: 'Pauta × CRM: inversión de cada plataforma, inscripciones del CRM',
    canales, masBaratoPorLead: porCpl[0] || null, masBaratoPorInscripcion: porCpa[0] || null,
    sobreMeta: canales.filter((c) => c.cpl != null && c.cpl > c.metaCpl), cohorteDesde, cohorteHasta, cohorteCerrada: !!coCanal,
  };

  // Ritmo: inversión acumulada contra el plan acumulado
  // un día con una plataforma sin dato no se cuenta ni en lo real ni en el plan: se comparan los mismos días
  let acum = 0, plan = 0, planMedido = 0;
  const ritmoSerie = fechas.map((d) => {
    const planDia = suma(cfg.canales, (c) => planDelDia(cfg, c, d));
    plan += planDia;
    const filas = cfg.canales.map((c) => ix.pautaDia[c.id].get(d));
    const completo = filas.every((p) => p && !p.sinDato);
    if (completo) { acum += suma(filas, (p) => p.inversion); planMedido += planDia; }
    return { fecha: d, real: completo ? acum : null, plan };
  });
  const ritmo = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : {
    estado: 'ok', universo: 'Pauta × plan de presupuesto', serie: ritmoSerie,
    real: pa.inversion, plan, planMedido, ejecutado: razon(pa.inversion, planMedido), parciales: pa.parciales,
  };

  // Demanda y respuesta: semanas de 52 hasta el período, búsqueda contra leads semanales de pauta
  const sem52 = data.semanas.filter((s) => sumarDias(s, 3) <= hasta).slice(-52);
  const leadsSemana = (s) => { let t = 0; for (let k = 0; k < 7; k++) { const v = leadsPautaDia(data, sumarDias(s, k)); if (v == null) return null; t += v; } return t; };
  const gim = data.busquedas.find((b) => b.id === 'gimnasio');
  const bus = sem52.map((s) => ({ fecha: s, valor: gim.semanas.find((x) => x.semana === s).indice }));
  const lea = sem52.map((s) => ({ fecha: s, valor: leadsSemana(s) }));
  const demandaRespuesta = estadoGrupo('pauta') !== 'ok' || estadoGrupo('busquedas') !== 'ok' ? { estado: 'no-cargo' } : sem52.length < 12 ? { estado: 'pocas-semanas' } : {
    estado: 'ok', universo: 'Búsquedas × pauta, por semana', busqueda: bus, leads: lea,
    r: correlacion(bus.map((x) => x.valor), lea.map((x) => x.valor)), semanas: sem52.length,
    semanasIncompletas: lea.filter((x) => x.valor == null).map((x) => x.fecha),
  };

  // Hora × día: promedio por día de la semana (un mes tiene 4 o 5 de cada día)
  const sumaHD = Array.from({ length: 7 }, () => new Array(24).fill(0));
  const veces = new Array(7).fill(0);
  fechas.forEach((d) => { const h = ix.horaDia.get(d); if (!h) return; veces[diaSemana(d)]++; h.forEach((v, j) => { sumaHD[diaSemana(d)][j] += v; }); });
  const matriz = sumaHD.map((fila, i) => fila.map((v) => (veces[i] ? v / veces[i] : null)));
  let pico = null;
  matriz.forEach((f, i) => f.forEach((v, j) => { if (v != null && (!pico || v > pico.v)) pico = { v, dia: i, hora: j }; }));
  const horaDia = estadoGrupo('crm') !== 'ok' ? { estado: estadoGrupo('crm') } : { estado: 'ok', universo: 'Leads del CRM por hora de entrada', matriz, pico, veces };

  // Sedes: leads del CRM del período contra la comparación (por día), y tasa de inscripción de 3 cohortes cerradas
  const tres = [sumarMeses(cohorteDesde.slice(0, 7), -2) + '-01', cohorteHasta];
  const sedes = estadoGrupo('crm') !== 'ok' ? { estado: estadoGrupo('crm') } : {
    estado: 'ok', universo: 'Leads del CRM por sede', cohorteTasa: tres,
    items: cfg.sedes.map((s) => {
      const abiertaTodo = (d0) => !s.abre || s.abre <= d0;
      const filtroSede = (desde2, hasta2) => {
        let leads = 0, altas = 0;
        for (const x of data.cohortes) if (x.sede === s.id && x.fecha >= desde2 && x.fecha <= hasta2) { leads += x.leads; altas += x.altas; }
        return { leads, altas };
      };
      const a = filtroSede(desde, hasta), b = filtroSede(compararDesde, compararHasta);
      const t = tres[0] >= cfg.desde && cerrada ? filtroSede(tres[0], tres[1]) : null;
      const leads = !s.abre || s.abre <= hasta ? a.leads : null;
      const leadsPrevio = !compFuera && abiertaTodo(compararDesde) ? b.leads : null;
      return {
        id: s.id, nombre: s.distrito, corto: s.corto, zona: s.zona, col: s.col, fila: s.fila, abre: s.abre || null,
        leads, leadsPrevio,
        cambio: comparable && abiertaTodo(desde) && leadsPrevio > 0 ? cambioPct(leads / pa.dias, leadsPrevio / pb.dias) : null,
        estado: leads == null ? 'sin-abrir' : !abiertaTodo(desde) ? 'abrio-en-el-periodo' : leadsPrevio == null ? 'sin-anterior' : 'normal',
        tasa: t && (!s.abre || s.abre <= tres[0]) ? { altas: t.altas, leads: t.leads, valor: razon(t.altas, t.leads), pocosCasos: t.altas < cfg.metodo.casosMinimos } : null,
      };
    }),
  };

  // ══════════════ CAPA 3 · SUGIERE ══════════════
  const indice = calcularIndice(data, hasta);
  const fechaPrevio = sumarDias(desde, -1);
  const previo = fechaPrevio >= cfg.desde ? calcularIndice(data, fechaPrevio) : null;
  const historia = Array.from({ length: 12 }, (_, k) => finDeMes(sumarMeses(hasta.slice(0, 7), k - 11))).filter((f) => f >= cfg.desde && f <= cfg.corte).map((f) => { const i = calcularIndice(data, f); return { fecha: f, valor: i.completo ? i.valor : null }; });
  const indiceVista = { ...indice, previo: previo?.valor ?? null, fechaPrevio, cambio: previo?.valor != null && indice.valor != null ? indice.valor - previo.valor : null, historia, banda: bandaDe(indice.valor, cfg.metodo.bandasIndice) };

  const sugerencias = [
    rendimiento.estado === 'ok' && rendimiento.cohorteCerrada ? reasignacion(cfg, canales) : null,
    crm.estado === 'ok' ? agendamiento(cfg, { cerrada, etapas: crm.etapas, exclusivas: crm.exclusivas }) : null,
    estadoGrupo('pauta') === 'ok' ? fatigaCreativa(data, hasta) : null,
    temporada(cfg, hasta),
  ].filter(Boolean);

  const escenarioVista = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : { estado: 'ok', universo: 'Leads de pauta, si la inversión sigue el plan', ...escenario(data, hasta) };

  const reparto = plataformas.estado === 'ok' ? { estado: 'ok', universo: 'Inversión de plataformas por producto', ...analizaReparto(data, P, plataformas.plataformas) } : { estado: plataformas.estado };
  const pautaCrm = plataformas.estado === 'ok' && crmDetalle.estado === 'ok'
    ? { estado: 'ok', universo: 'Pauta × CRM: lo reportado contra lo que llega', plataformas: analizaPautaCrm(data, P, plataformas.plataformas) }
    : { estado: plataformas.estado !== 'ok' ? plataformas.estado : crmDetalle.estado };

  const vista = {
    periodo, fuentes,
    lee: { pauta, plataformas, crm, crmDetalle, busquedas, redes, competencia, conversacion, web },
    analiza: { rendimiento, reparto, pautaCrm, ritmo, demandaRespuesta, horaDia, sedes },
    sugiere: { indice: indiceVista, sugerencias, escenario: escenarioVista },
  };
  vista.sugiere.queMirar = fuera ? [] : queMirar(data, P, vista);
  return vista;
}
