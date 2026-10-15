// Generador de data de muestra. Determinista: misma semilla y misma configuración, misma salida.
// Solo produce conteos atómicos (día × canal × sede, día × hora, semana × marca). Ningún total,
// porcentaje ni «período anterior» se guarda: los arma la capa de cálculo (vista.js).
//
// Invariantes por construcción (informe 06 §5.2):
//  R1 hijo ≤ padre: cada etapa es Binomial(padre, p)
//  R2 total = suma de partes: los totales no existen acá
//  R8 inversión ≤ presupuesto del mes: tope acumulado
//  R14 censura a la derecha: altas que todavía no ocurren al corte no se cuentan
//  R15 nada después del corte

import { crearAzar } from './azar.js';
import { rango, mes, diaSemana, diasEntre, inicioSemana, sumarDias } from './calendario.js';

// Un flujo de azar por entidad: agregar un canal no cambia la serie de los demás
function semillaDe(...partes) {
  let h = 2166136261;
  for (const c of partes.join('|')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function multinomial(azar, n, pesos) {
  // reparte n en partes que suman n exacto (binomiales condicionales)
  const out = new Array(pesos.length).fill(0);
  let resto = n, pesoResto = pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pesos.length && resto > 0; i++) {
    if (i === pesos.length - 1) { out[i] = resto; break; }
    const k = pesoResto > 0 ? azar.binomial(resto, pesos[i] / pesoResto) : 0;
    out[i] = k; resto -= k; pesoResto -= pesos[i];
  }
  return out;
}

export function generar(cfg) {
  const dias = rango(cfg.desde, cfg.corte);
  const feriado = new Set(cfg.feriados);
  const caidas = new Set(cfg.eventos.filter((e) => e.tipo === 'caida').map((e) => `${e.canal}|${e.fecha}`));
  const diasPorMes = {};
  dias.forEach((d) => { const k = d.slice(0, 7); diasPorMes[k] = (diasPorMes[k] || 0) + 1; });
  const diasDelMes = (d) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7), 0)).getUTCDate();
  const t = (d) => diasEntre(cfg.desde, d) / diasEntre(cfg.desde, cfg.corte); // 0 a 1 en el rango

  // ── Pauta diaria por canal ──
  const pauta = {}; // pauta[canal] = [{fecha, inversion, impresiones, clics, leads} | {fecha, sinDato:true}]
  for (const c of cfg.canales) {
    const az = crearAzar(semillaDe(cfg.semilla, 'pauta', c.id));
    let ar = 0, gastadoMes = 0, mesActual = '';
    pauta[c.id] = dias.map((d) => {
      const m = mes(d);
      if (d.slice(0, 7) !== mesActual) { mesActual = d.slice(0, 7); gastadoMes = 0; }
      const tope = cfg.presupuestoMensual * c.reparto * cfg.pesoPresupuestoMes[m - 1];
      const plan = tope / diasDelMes(d);
      ar = 0.7 * ar + 0.06 * az.normal(); // ruido con memoria (AR(1) en escala log)
      let inversion = Math.min(plan * 0.97 * Math.exp(ar + 0.05 * az.normal()), Math.max(0, tope - gastadoMes));
      inversion = Math.round(inversion * 100) / 100;
      gastadoMes += inversion;
      const demanda = cfg.estacionalidad[m - 1] * cfg.diaSemana[diaSemana(d)] * (feriado.has(d) ? cfg.factorFeriado : 1);
      // historias que la data cuenta: TikTok mejora en 2026; Meta se fatiga en ago-set 2026 hasta las nuevas piezas
      let ctr = c.ctr * Math.exp(0.05 * az.normal());
      let cvr = c.cvr * demanda * Math.exp(0.08 * az.normal());
      if (c.id === 'tiktok') cvr *= 1 + 0.45 * Math.max(0, (t(d) - 0.55) / 0.45);
      if (c.id === 'meta' && d >= '2026-07-20' && d < '2026-09-08') ctr *= 1 - 0.35 * Math.min(1, diasEntre('2026-07-20', d) / 40);
      const cpm = c.cpm * cfg.presionSubasta[m - 1] * Math.exp(0.05 * az.normal());
      const impresiones = Math.round((inversion / cpm) * 1000);
      const clics = az.binomial(impresiones, Math.min(0.5, ctr));
      const leads = az.binomial(clics, Math.min(0.9, cvr));
      if (caidas.has(`${c.id}|${d}`)) return { fecha: d, sinDato: true }; // la fuente no entregó: no es cero
      return { fecha: d, inversion, impresiones, clics, leads };
    });
  }

  // ── Leads por sede y embudo de cohorte (por día de entrada del lead) ──
  const e = cfg.embudo;
  const cohortes = []; // {fecha, canal, sede, leads, contactos, citas, asisten, altas}
  const azE = crearAzar(semillaDe(cfg.semilla, 'embudo'));
  for (const c of cfg.canales) {
    pauta[c.id].forEach((p) => {
      if (p.sinDato) return;
      const abiertas = cfg.sedes.filter((s) => !s.abre || p.fecha >= s.abre);
      const reparto = multinomial(azE, p.leads, abiertas.map((s) => s.peso));
      abiertas.forEach((s, i) => {
        const leads = reparto[i];
        if (!leads) return;
        const contactos = azE.binomial(leads, e.contacto);
        const citas = azE.binomial(contactos, e.cita);
        const asisten = azE.binomial(citas, e.asiste);
        const altasFinales = azE.binomial(asisten, e.alta);
        // R14: una alta ocurre entre 2 y rezagoAltaMax días después del lead; si cae después del corte, todavía no se ve
        const margen = diasEntre(p.fecha, cfg.corte);
        const pMadura = Math.max(0, Math.min(1, (margen - 1) / (e.rezagoAltaMax - 1)));
        const altas = azE.binomial(altasFinales, pMadura);
        cohortes.push({ fecha: p.fecha, canal: c.id, sede: s.id, leads, contactos, citas, asisten, altas });
      });
    });
  }

  // ── Hora del día: los leads de cada día repartidos en 24 horas ──
  const azH = crearAzar(semillaDe(cfg.semilla, 'hora'));
  const porHora = dias.map((d) => {
    const total = cfg.canales.reduce((s, c) => { const p = pauta[c.id].find((x) => x.fecha === d); return s + (p && !p.sinDato ? p.leads : 0); }, 0);
    const perfil = diaSemana(d) >= 5 ? cfg.perfilHora.finDeSemana : cfg.perfilHora.laborable;
    return { fecha: d, horas: multinomial(azH, total, perfil) };
  });

  // ── Semanas (lunes) para búsquedas y conversación ──
  const semanas = [];
  for (let s = inicioSemana(cfg.desde); s <= cfg.corte; s = sumarDias(s, 7)) if (sumarDias(s, 6) <= cfg.corte) semanas.push(s); // solo semanas cerradas

  const azB = crearAzar(semillaDe(cfg.semilla, 'busquedas'));
  const crudas = cfg.busquedas.map((k) => semanas.map((s) => {
    const m = mes(sumarDias(s, 3));
    let v = k.base * cfg.estacionalidad[m - 1] * (1 + (k.crece || 0) * t(s)) * Math.exp(0.07 * azB.normal());
    if (k.id === 'marca' && s >= '2026-01-05' && s < '2026-02-16') v *= 1.6; // campaña de enero
    return v;
  }));
  const maxB = Math.max(...crudas.flat());
  const busquedas = cfg.busquedas.map((k, i) => ({ id: k.id, termino: k.termino, semanas: semanas.map((s, j) => ({ semana: s, indice: Math.round((crudas[i][j] / maxB) * 100) })) }));

  const azC = crearAzar(semillaDe(cfg.semilla, 'conversacion'));
  const conversacion = cfg.conversacion.map((m) => ({
    id: m.id, nombre: m.nombre, propia: !!m.propia,
    semanas: semanas.map((s) => {
      const mm = mes(sumarDias(s, 3));
      let media = m.base * (m.picos?.[mm] || 1) * (1 + (m.crece || 0) * t(s));
      if (m.propia && s >= '2026-01-05' && s < '2026-02-16') media *= 1.8;
      return { semana: s, menciones: azC.poisson(media * Math.exp(0.12 * azC.normal())) };
    }),
  }));

  return { config: cfg, dias, semanas, pauta, cohortes, porHora, busquedas, conversacion };
}
