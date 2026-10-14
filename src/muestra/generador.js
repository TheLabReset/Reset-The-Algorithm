// Generador de data de muestra. Determinista: misma semilla y misma configuración, misma salida.
// Solo produce conteos atómicos (día × canal × sede, día × fuente web, día × hora, semana × marca).
// Ningún total, porcentaje ni «período anterior» se guarda: los arma la capa de cálculo (src/calculo).
//
// Invariantes por construcción (informe 06 §5.2):
//  R1 hijo ≤ padre: cada etapa es Binomial(padre, p)
//  R2 total = suma de partes: los totales no existen acá
//  R8 inversión ≤ presupuesto del mes: tope acumulado
//  R14 censura a la derecha: altas que todavía no ocurren al corte no se cuentan
//  R15 nada después del corte
//
// Tres universos que NO se suman entre sí:
//  · pauta: lo que reporta cada plataforma: los leads reales más duplicados y conversiones que no llegan
//    (puede faltar un día: «la fuente no entregó»)
//  · CRM: los leads que de verdad entraron (los de pauta, aunque la plataforma no los reportara, más los del sitio sin pauta)
//  · web: sesiones y solicitudes del sitio (las solicitudes desde pauta ya son leads de pauta)

import { crearAzar } from './azar.js';
import { rango, mes, diaSemana, diasEntre, inicioSemana, sumarDias } from './calendario.js';

// Un flujo de azar por entidad: agregar un canal no cambia la serie de los demás
function semillaDe(...partes) {
  let h = 2166136261;
  for (const c of partes.join('|')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Reparte n en partes que suman n exacto (binomiales condicionales)
export function multinomial(azar, n, pesos) {
  const out = new Array(pesos.length).fill(0);
  let resto = n, pesoResto = pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pesos.length && resto > 0; i++) {
    if (i === pesos.length - 1) { out[i] = resto; break; }
    const k = pesoResto > 0 ? azar.binomial(resto, pesos[i] / pesoResto) : 0;
    out[i] = k; resto -= k; pesoResto -= pesos[i];
  }
  return out;
}

const diasDelMes = (d) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7), 0)).getUTCDate();

export function planDelDia(cfg, canal, d) {
  // Plan de inversión: el presupuesto del mes repartido por igual entre sus días
  return (cfg.presupuestoMensual * canal.reparto * cfg.pesoPresupuestoMes[mes(d) - 1]) / diasDelMes(d);
}

export function generar(cfg) {
  const dias = rango(cfg.desde, cfg.corte);
  const feriado = new Set(cfg.feriados);
  const caidas = new Set(cfg.eventos.filter((e) => e.tipo === 'caida').map((e) => `${e.canal}|${e.fecha}`));
  const t = (d) => diasEntre(cfg.desde, d) / diasEntre(cfg.desde, cfg.corte); // 0 a 1 en el rango
  const demanda = (d) => cfg.estacionalidad[mes(d) - 1] * cfg.diaSemana[diaSemana(d)] * (feriado.has(d) ? cfg.factorFeriado : 1);

  // ── Pauta: valores reales del día y lo que la plataforma reporta ──
  const real = {}; // real[canal][i] = {inversion, impresiones, clics, leads}
  const pauta = {}; // lo reportado: igual al real, salvo los días que la fuente no entregó
  for (const c of cfg.canales) {
    const az = crearAzar(semillaDe(cfg.semilla, 'pauta', c.id));
    let ar = 0, gastadoMes = 0, mesActual = '';
    real[c.id] = dias.map((d) => {
      if (d.slice(0, 7) !== mesActual) { mesActual = d.slice(0, 7); gastadoMes = 0; }
      const tope = cfg.presupuestoMensual * c.reparto * cfg.pesoPresupuestoMes[mes(d) - 1];
      ar = 0.7 * ar + 0.06 * az.normal(); // ruido con memoria (AR(1) en escala log)
      let inversion = Math.min(planDelDia(cfg, c, d) * 0.97 * Math.exp(ar + 0.05 * az.normal()), Math.max(0, tope - gastadoMes));
      inversion = Math.round(inversion * 100) / 100;
      gastadoMes += inversion;
      let ctr = c.ctr * Math.exp(0.05 * az.normal());
      let cvr = c.cvr * demanda(d) * Math.exp(0.08 * az.normal());
      // historias que la data cuenta: TikTok mejora en 2026; Meta se fatiga entre fines de julio y las nuevas piezas
      if (c.id === 'tiktok') cvr *= 1 + 0.45 * Math.max(0, (t(d) - 0.55) / 0.45);
      if (c.id === 'meta' && d >= '2026-07-20' && d < '2026-09-08') ctr *= 1 - 0.35 * Math.min(1, diasEntre('2026-07-20', d) / 40);
      const cpm = c.cpm * cfg.presionSubasta[mes(d) - 1] * Math.exp(0.05 * az.normal());
      const impresiones = Math.round((inversion / cpm) * 1000);
      const clics = az.binomial(impresiones, Math.min(0.5, ctr));
      const leads = az.binomial(clics, Math.min(0.9, cvr));
      return { fecha: d, inversion, impresiones, clics, leads };
    });
    // Lo que reporta la plataforma: los leads reales más duplicados, pruebas y conversiones que el CRM no recibe.
    // Flujo de azar aparte: no cambia los leads reales ni nada de lo que sigue.
    const azR = crearAzar(semillaDe(cfg.semilla, 'reporte', c.id));
    pauta[c.id] = real[c.id].map((r) => (caidas.has(`${c.id}|${r.fecha}`) ? { fecha: r.fecha, sinDato: true } : { ...r, leads: r.leads + azR.binomial(r.leads, c.inflacion) }));
  }

  // ── Sitio web: sesiones, móviles y solicitudes por fuente ──
  const azW = crearAzar(semillaDe(cfg.semilla, 'web'));
  const web = dias.map((d, i) => {
    const fuentes = {};
    let organicos = 0;
    for (const f of cfg.web.fuentes) {
      let sesiones, solicitudes;
      if (f.deClics) {
        const clics = f.deClics.reduce((s, id) => s + real[id][i].clics, 0);
        sesiones = azW.binomial(clics, f.llegada);
        // solicitudes desde pauta: son leads de pauta que entraron por el sitio (subconjunto, no se suman a los leads)
        solicitudes = f.deClics.reduce((s, id) => s + azW.binomial(real[id][i].leads, cfg.canales.find((c) => c.id === id).webPropia), 0);
      } else {
        sesiones = azW.poisson(f.base * cfg.estacionalidad[mes(d) - 1] * (1 + 0.25 * t(d)) * Math.exp(0.08 * azW.normal()));
        solicitudes = azW.binomial(sesiones, f.conversion * cfg.diaSemana[diaSemana(d)]);
        organicos += solicitudes;
      }
      fuentes[f.id] = { sesiones, movil: azW.binomial(sesiones, f.movil), solicitudes };
    }
    const sesionesDia = Object.values(fuentes).reduce((s, x) => s + x.sesiones, 0);
    const solicitudesDia = Object.values(fuentes).reduce((s, x) => s + x.solicitudes, 0);
    const paginas = multinomial(azW, sesionesDia, cfg.web.paginas.map((p) => p.peso));
    const solicitudesPorPagina = multinomial(azW, solicitudesDia, cfg.web.paginas.map((p) => p.peso * p.conversion));
    return { fecha: d, fuentes, organicos, paginas, solicitudesPorPagina };
  });

  // ── CRM: cada lead real (de pauta o del sitio sin pauta) repartido por sede y seguido hasta la inscripción ──
  const e = cfg.embudo;
  const cohortes = []; // {fecha, canal, sede, leads, contactos, citas, asisten, altas}
  const azE = crearAzar(semillaDe(cfg.semilla, 'embudo'));
  const origenes = [...cfg.canales.map((c) => ({ id: c.id, calidad: c.calidad, leads: (i) => real[c.id][i].leads })), { id: cfg.organico.id, calidad: cfg.organico.calidad, leads: (i) => web[i].organicos }];
  for (const o of origenes) {
    dias.forEach((d, i) => {
      const n = o.leads(i);
      if (!n) return;
      const abiertas = cfg.sedes.filter((s) => !s.abre || d >= s.abre);
      const reparto = multinomial(azE, n, abiertas.map((s) => s.peso));
      abiertas.forEach((s, k) => {
        const leads = reparto[k];
        if (!leads) return;
        const contactos = azE.binomial(leads, e.contacto);
        const citas = azE.binomial(contactos, Math.min(0.95, e.cita * o.calidad.cita));
        const asisten = azE.binomial(citas, e.asiste);
        const altasFinales = azE.binomial(asisten, Math.min(0.95, e.alta * o.calidad.alta));
        // R14: una alta ocurre entre 2 y rezagoAltaMax días después del lead; si cae después del corte, todavía no se ve
        const margen = diasEntre(d, cfg.corte);
        const altas = azE.binomial(altasFinales, Math.max(0, Math.min(1, (margen - 1) / (e.rezagoAltaMax - 1))));
        cohortes.push({ fecha: d, canal: o.id, sede: s.id, leads, contactos, citas, asisten, altas });
      });
    });
  }

  // ── Hora del día en que entró cada lead del CRM ──
  const azH = crearAzar(semillaDe(cfg.semilla, 'hora'));
  const leadsCrmDia = new Map();
  for (const x of cohortes) leadsCrmDia.set(x.fecha, (leadsCrmDia.get(x.fecha) || 0) + x.leads);
  const porHora = dias.map((d) => ({ fecha: d, horas: multinomial(azH, leadsCrmDia.get(d) || 0, diaSemana(d) >= 5 ? cfg.perfilHora.finDeSemana : cfg.perfilHora.laborable) }));

  // ── Semanas cerradas (lunes a domingo) para búsquedas y conversación ──
  const semanas = [];
  for (let s = inicioSemana(cfg.desde); s <= cfg.corte; s = sumarDias(s, 7)) if (s >= cfg.desde && sumarDias(s, 6) <= cfg.corte) semanas.push(s);

  const azB = crearAzar(semillaDe(cfg.semilla, 'busquedas'));
  const crudas = cfg.busquedas.map((k) => {
    // un término que aparece a mitad de la muestra lleva su propio flujo: agregarlo no cambia a los demás
    const az = k.aparece ? crearAzar(semillaDe(cfg.semilla, 'busquedas', k.id)) : azB;
    return semanas.map((s) => {
    let v = k.base * cfg.estacionalidad[mes(sumarDias(s, 3)) - 1] * (1 + (k.crece || 0) * t(s)) * Math.exp(0.07 * az.normal());
    if (k.aparece && s >= k.aparece) v *= 1 + (k.despues / k.base - 1) * Math.min(1, diasEntre(k.aparece, s) / 84); // sube en 12 semanas
    if (k.propia && s >= '2026-01-05' && s < '2026-02-16') v *= 1.6; // campaña de enero
    return v;
    });
  });
  const maxB = Math.max(...crudas.flat());
  const busquedas = cfg.busquedas.map((k, i) => ({ id: k.id, termino: k.termino, propia: !!k.propia, semanas: semanas.map((s, j) => ({ semana: s, indice: Math.max(1, Math.round((crudas[i][j] / maxB) * 100)) })) }));

  const azC = crearAzar(semillaDe(cfg.semilla, 'conversacion'));
  const conversacion = cfg.conversacion.map((m) => ({
    id: m.id, nombre: m.nombre, propia: !!m.propia,
    semanas: semanas.map((s) => {
      let media = m.base * (m.picos?.[mes(sumarDias(s, 3))] || 1) * (1 + (m.crece || 0) * t(s));
      if (m.propia && s >= '2026-01-05' && s < '2026-02-16') media *= 1.8;
      return { semana: s, menciones: azC.poisson(media * Math.exp(0.12 * azC.normal())) };
    }),
  }));

  return { config: cfg, dias, semanas, pauta, web, cohortes, porHora, busquedas, conversacion };
}
