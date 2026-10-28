// armarVista(data, filtros, estado) devuelve todo lo que pintan las tres capas. Es la única puerta entre
// la data y la pantalla: los componentes no calculan. Cada sección trae su estado, su universo y su alcance.

import { rango, sumarDias, diaSemana, diasEntre } from '../muestra/calendario.js';
import {
  suma, razon, cambioPct, mayorResto, correlacion, indices, dentro, ventanaPlataforma, objetivoPlataforma, ventanaPauta, leadsPautaDia,
  ventanaCrm, ventanaWeb, sumarMeses, finDeMes, semanaEn, ETAPAS, porHoraDelDia, diaDestacado,
} from './base.js';
import { calcularIndice, bandaDe } from './indice.js';
import { escenario } from './escenario.js';
import { reasignacion, agendamiento, fatigaCreativa, temporada } from './sugerencias.js';
import { queMirar, queVaBien } from './queMirar.js';
import { leePlataformas, leeCrmDetalle, leeBusquedasDetalle, leeRedes, leeCompetencia, leeAnuncios, leeGa4, analizaReparto, analizaPautaCrm } from './produccion.js';
import { periodoDe } from './periodo.js';
import { leerPiezas } from './piezas.js';
import { CLIENTE } from '../cliente.js';

// El período de los filtros (un atajo, dos fechas o un mes) y su comparación: src/calculo/periodo.js
export { periodoDe } from './periodo.js';

export function mesesDisponibles(cfg) {
  const out = [];
  for (let m = cfg.desde.slice(0, 7); finDeMes(m) <= cfg.corte; m = sumarMeses(m, 1)) out.push(m);
  return out;
}

export function armarVista(data, filtros, estado = {}) {
  const cfg = data.config;
  const P = filtros.cohorteDesde ? filtros : periodoDe(cfg, filtros);
  const { desde, hasta, compararDesde, compararHasta, cohorteDesde, cohorteHasta } = P;
  if (hasta > cfg.corte) throw new Error('El período no puede pasar el corte de la muestra');
  const caidas = new Set(estado.fuentesCaidas || []); // escenario: fuentes que no cargaron
  const ix = indices(data);
  const minCob = cfg.metodo.coberturaMinima;
  const fuera = desde < cfg.desde;
  const compFuera = compararDesde < cfg.desde;

  const pa = ventanaPauta(data, desde, hasta), pb = ventanaPauta(data, compararDesde, compararHasta);
  // una variación se publica con días suficientes, la comparación dentro de la muestra y días medidos en las dos ventanas
  const comparable = P.conComparacion && !compFuera && pa.cobertura >= minCob && pb.cobertura >= minCob;
  const periodo = {
    ...P, dias: pa.dias, comparable, compFuera, corte: cfg.corte,
    mesCompleto: desde.endsWith('-01') && sumarDias(hasta, 1).endsWith('-01') && desde.slice(0, 7) === hasta.slice(0, 7),
  };

  // ── Fuentes y su frescura ──
  // Una plataforma está al día hasta el último día que midieron todos sus canales
  const ultimoMedido = (pl) => [...data.pauta[pl.canales[0]]].reverse().find((p) => pl.canales.every((c) => !ix.pautaDia[c].get(p.fecha)?.sinDato))?.fecha;
  const fuentes = [
    ...cfg.plataformas.map((pl) => ({ id: pl.id, grupo: 'pauta', nombre: pl.nombre, corte: ultimoMedido(pl), sinDato: ventanaPlataforma(data, pl, desde, hasta).sinDato })),
    { id: 'crm', grupo: 'crm', nombre: 'CRM', corte: cfg.corte, sinDato: [] },
    { id: 'web', grupo: 'web', nombre: 'GA4', corte: cfg.corte, sinDato: [] },
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
    // Inversión total por día: un día con una plataforma sin dato queda como hueco, no como cero
    serieInversion: fechas.map((d) => {
      const filas = cfg.canales.map((c) => ix.pautaDia[c.id].get(d));
      return { fecha: d, valor: filas.every((p) => p && !p.sinDato) ? suma(filas, (p) => p.inversion) : null };
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
      porOrigen: [...cfg.plataformas, { ...cfg.organico, canales: [cfg.organico.id] }].map((c) => {
        const o = { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 };
        for (const id of c.canales) for (const e of ETAPAS) o[e] += co.porOrigen[id]?.[e] || 0;
        return { id: c.id, nombre: c.nombre, ...o, tasaAlta: razon(o.altas, o.leads), pocosCasos: o.altas < cfg.metodo.casosMinimos, destinos: { alta: o.altas, asistio: o.asisten - o.altas, cita: o.citas - o.asisten, contacto: o.contactos - o.citas, sin: o.leads - o.contactos } };
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
    const g = data.busquedas.find((b) => b.id === CLIENTE.busqueda);
    const fin52 = data.semanas.filter((s) => sumarDias(s, 3) <= hasta).slice(-52);
    busquedas = {
      estado: 'ok', universo: 'Interés relativo de 0 a 100 en Google Trends (no es volumen)', semanas: semPer.length,
      demanda: prom(g, semPer), demandaPrevia: semComp.length ? prom(g, semComp) : null,
      cambio: semComp.length && P.conComparacion ? cambioPct(prom(g, semPer), prom(g, semComp)) : null,
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
      estado: 'ok', universo: `Menciones públicas en redes de ${cfg.conversacion.filter((x) => x.id !== 'otros').length} ${CLIENTE.rubroPlural} y «Otros» (data de muestra)`, meses: sovMes, ranking,
      propia: { actual: sovMes.at(-1).marcas.find((x) => x.propia).pct, inicio: sovMes[0].marcas.find((x) => x.propia).pct, puestoActual: rp.at(-1), mejor3: Math.min(...rp.slice(-3)), peor3: Math.max(...rp.slice(-3)) },
    };
  }

  // Sitio: GA4 (tráfico; los leads del sitio viven en el CRM)
  const web = estadoGrupo('web') !== 'ok' ? { estado: estadoGrupo('web') } : { estado: 'ok', universo: 'Tráfico del sitio según GA4', ...leeGa4(data, P) };

  // Detalle de producción: plataformas y campañas, CRM por dentro, redes, competencia, sitio
  const plataformas = estadoGrupo('pauta') === 'ok' ? { estado: 'ok', universo: 'Lo que reporta cada plataforma', ...leePlataformas(data, P) } : { estado: estadoGrupo('pauta') };
  const crmDetalle = estadoGrupo('crm') === 'ok' ? { estado: 'ok', universo: 'Leads registrados en el CRM en el período', ...leeCrmDetalle(data, P) } : { estado: estadoGrupo('crm') };
  if (busquedas.estado === 'ok') Object.assign(busquedas, leeBusquedasDetalle(data, P));
  const redes = estadoGrupo('conversacion') === 'ok' ? { estado: 'ok', universo: `TikTok y conversación pública sobre ${CLIENTE.nombre}`, ...leeRedes(data, P) } : { estado: estadoGrupo('conversacion') };
  const competencia = estadoGrupo('conversacion') === 'ok' ? { estado: 'ok', universo: 'Publicaciones y anuncios de cada marca (cifras de muestra)', ...leeCompetencia(data, P) } : { estado: estadoGrupo('conversacion') };
  // Piezas y campañas: lo que reporta cada plataforma por pieza, con su estado (src/calculo/piezas.js)
  const piezasLeidas = estadoGrupo('pauta') === 'ok' ? leerPiezas(data, P) : null;
  const piezas = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : piezasLeidas ? { estado: 'ok', universo: 'Lo que reporta cada plataforma por pieza', ...piezasLeidas } : { estado: 'sin-datos' };
  const anunciosLeidos = estadoGrupo('conversacion') === 'ok' ? leeAnuncios(data, P) : null;
  const anuncios = anunciosLeidos ? { estado: 'ok', universo: 'Biblioteca de anuncios de Meta (piezas de muestra)', ...anunciosLeidos } : { estado: estadoGrupo('conversacion') === 'ok' ? 'vacio' : estadoGrupo('conversacion') };

  // ══════════════ CAPA 2 · ANALIZA ══════════════
  const diasComunes = fechas.filter((d) => leadsPautaDia(data, d) != null);
  const sumaComun = (pl, k) => suma(diasComunes, (d) => suma(pl.canales, (id) => ix.pautaDia[id].get(d)[k]));
  const pctInv = mayorResto(cfg.plataformas.map((pl) => sumaComun(pl, 'inversion')));
  const pctLeads = mayorResto(cfg.plataformas.map((pl) => sumaComun(pl, 'leads')));
  // el costo por inscripción necesita el CRM: si no cargó, no se calcula (nunca se muestra con data vieja)
  const coCanal = cohorteFuera || !cerrada || estadoGrupo('crm') !== 'ok' ? null : ventanaCrm(data, cohorteDesde, cohorteHasta);
  // Rendimiento por plataforma, como la ve el cliente: Google Ads junta Search y Display
  const canales = cfg.plataformas.map((pl, i) => {
    const a = ventanaPlataforma(data, pl, desde, hasta);
    const invCoh = ventanaPlataforma(data, pl, cohorteDesde, cohorteHasta);
    const o = coCanal ? pl.canales.reduce((t, id) => { const x = coCanal.porOrigen[id] || {}; return { leads: t.leads + (x.leads || 0), altas: t.altas + (x.altas || 0) }; }, { leads: 0, altas: 0 }) : null;
    const invCanal = (id) => suma(diasComunes, (d) => ix.pautaDia[id].get(d).inversion);
    return {
      id: pl.id, nombre: pl.nombre, inversion: a.inversion, leads: a.leads, cpl: a.cpl, metaCpl: objetivoPlataforma(cfg, pl, invCanal), sinDato: a.sinDato,
      pctInversion: pctInv[i], pctLeads: pctLeads[i],
      cohorte: o ? { leads: o.leads, altas: o.altas, tasaAlta: razon(o.altas, o.leads), cpa: razon(invCoh.inversion, o.altas), pocosCasos: o.altas < cfg.metodo.casosMinimos, cobertura: invCoh.cobertura } : null,
    };
  });
  // Costo por inscripción de toda la pauta: inversión de la cohorte entre sus inscripciones de pauta
  const totalCohorte = coCanal ? { inversion: suma(cfg.plataformas, (pl) => ventanaPlataforma(data, pl, cohorteDesde, cohorteHasta).inversion), altas: suma(canales, (c) => c.cohorte?.altas || 0) } : null;
  if (totalCohorte) totalCohorte.cpa = razon(totalCohorte.inversion, totalCohorte.altas);
  const porCpl = [...canales].filter((c) => c.cpl != null).sort((a, b) => a.cpl - b.cpl);
  const porCpa = [...canales].filter((c) => c.cohorte?.cpa != null && !c.cohorte.pocosCasos).sort((a, b) => a.cohorte.cpa - b.cohorte.cpa);
  const rendimiento = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : {
    estado: 'ok', universo: 'Pauta × CRM: inversión de cada plataforma, inscripciones del CRM',
    // empate arriba: las que cuestan por inscripción a menos del margen de la más barata no tienen ganadora entre sí
    cpaParecido: (() => {
      const top = porCpa.filter((c) => c.cohorte.cpa / porCpa[0].cohorte.cpa - 1 < cfg.metodo.margenParecido);
      return top.length > 1 ? { min: top[0].cohorte.cpa, max: top.at(-1).cohorte.cpa, ids: top.map((c) => c.id), nombres: top.map((c) => c.nombre), todas: top.length === porCpa.length } : null;
    })(),
    canales, totalCohorte, crmEstado: estadoGrupo('crm'), masBaratoPorLead: porCpl[0] || null, masBaratoPorInscripcion: porCpa[0] || null,
    sobreMeta: canales.filter((c) => c.cpl != null && c.cpl > c.metaCpl), cohorteDesde, cohorteHasta, cohorteCerrada: !!coCanal,
  };

  // Demanda y respuesta: semanas de 52 hasta el período, búsqueda contra leads semanales de pauta
  const sem52 = data.semanas.filter((s) => sumarDias(s, 3) <= hasta).slice(-52);
  const leadsSemana = (s) => { let t = 0; for (let k = 0; k < 7; k++) { const v = leadsPautaDia(data, sumarDias(s, k)); if (v == null) return null; t += v; } return t; };
  const gim = data.busquedas.find((b) => b.id === CLIENTE.busqueda);
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
  // Los leads se suman: el total de un día es la suma de sus horas
  const horas = porHoraDelDia(sumaHD, veces);
  const porDiaSemana = sumaHD.map((f, i) => (veces[i] ? suma(f, (v) => v) / veces[i] : null));
  const horaDia = estadoGrupo('crm') !== 'ok' ? { estado: estadoGrupo('crm') } : { estado: 'ok', universo: 'Leads del CRM por hora de entrada', porHora: horas.porHora, horasAltas: horas.altas, porDiaSemana, diaMayor: diaDestacado(porDiaSemana, cfg.metodo.margenParecido), veces };

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
    rendimiento.estado === 'ok' && rendimiento.cohorteCerrada ? reasignacion(cfg, canales, P) : null,
    crm.estado === 'ok' ? agendamiento(cfg, { cerrada, etapas: crm.etapas, exclusivas: crm.exclusivas }) : null,
    estadoGrupo('pauta') === 'ok' ? fatigaCreativa(data, hasta) : null,
    temporada(cfg, hasta),
  ].filter(Boolean);

  const escenarioVista = estadoGrupo('pauta') !== 'ok' ? { estado: estadoGrupo('pauta') } : { estado: 'ok', universo: 'Leads de pauta, si la inversión diaria se mantiene', ...escenario(data, hasta) };

  const reparto = plataformas.estado === 'ok' ? { estado: 'ok', universo: 'Inversión de plataformas por producto', ...analizaReparto(data, P, plataformas.plataformas) } : { estado: plataformas.estado };
  const pautaCrm = plataformas.estado === 'ok' && crmDetalle.estado === 'ok'
    ? { estado: 'ok', universo: 'Pauta × CRM: lo reportado contra lo que llega', plataformas: analizaPautaCrm(data, P, plataformas.plataformas) }
    : { estado: plataformas.estado !== 'ok' ? plataformas.estado : crmDetalle.estado };

  // Qué se monitorea: lo que sigue cada fuente. Es configuración, no medición: se cambia a pedido del cliente
  const monitoreo = [
    { titulo: 'Palabras en Google Trends', items: cfg.busquedas.map((b) => b.termino) },
    { titulo: 'Hashtags en TikTok', items: cfg.hashtags.map((h) => h.tag) },
    { titulo: 'Marcas en Facebook', items: cfg.conversacion.filter((x) => x.id !== 'otros').map((x) => x.nombre) },
    { titulo: 'Cuentas de pauta', items: cfg.plataformas.map((p) => p.nombre) },
    { titulo: 'Palabras clave en Google Ads', items: cfg.palabrasClave.filter((k) => !k.resto).map((k) => k.texto) },
    { titulo: 'Páginas del sitio en GA4', items: cfg.web.paginas.map((p) => p.ruta) },
  ];

  const vista = {
    periodo, fuentes, monitoreo,
    lee: { pauta, plataformas, piezas, crm, crmDetalle, busquedas, redes, competencia, anuncios, conversacion, web },
    analiza: { rendimiento, reparto, pautaCrm, demandaRespuesta, horaDia, sedes },
    sugiere: { indice: indiceVista, sugerencias, escenario: escenarioVista },
  };
  vista.sugiere.queMirar = fuera ? [] : queMirar(data, P, vista);
  vista.sugiere.queVaBien = fuera ? [] : queVaBien(data, P, vista);
  return vista;
}
