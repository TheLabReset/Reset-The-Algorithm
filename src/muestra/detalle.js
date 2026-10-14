// Detalle de producción: lo que el algoritmo real muestra por plataforma, por campaña y dentro del CRM.
// Se arma DESPUÉS de generar() y con flujos de azar propios: no cambia ninguna serie base.
// Todo detalle se reparte desde un total que ya existe, así que suma exacto por construcción:
//  · campañas de un canal = el canal, día por día (gasto, impresiones, clics, leads)
//  · palabras clave y términos de búsqueda = los clics y leads de Google Search
//  · leads del sitio sin pauta repartidos por fuente sin reemplazo: cada etapa ≤ la anterior en cada fuente
//  · temas de conversación ≤ menciones de la marca en el mes
// Nada después del corte; lo que todavía puede pasar (descartes, etapas abiertas) queda abierto.

import { crearAzar } from './azar.js';
import { multinomial } from './generador.js';
import { diaSemana, diasEntre, sumarDias } from './calendario.js';

function semillaDe(...partes) {
  let h = 2166136261;
  for (const c of partes.join('|')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Reparte un monto con centavos: partes proporcionales y el resto al último, para que sume exacto
function repartirMonto(total, pesos) {
  const s = pesos.reduce((a, b) => a + b, 0);
  if (!s) return pesos.map(() => 0);
  const cents = Math.round(total * 100);
  const out = pesos.map((p) => Math.floor((cents * p) / s));
  out[out.length - 1] += cents - out.reduce((a, b) => a + b, 0);
  return out.map((c) => c / 100);
}

// Saca k elementos sin reemplazo de urnas con capacidad dada (para que cada etapa quede bajo la anterior)
function sinReemplazo(azar, k, capacidades) {
  const resto = [...capacidades];
  const out = resto.map(() => 0);
  for (let n = 0; n < k; n++) {
    const total = resto.reduce((a, b) => a + b, 0);
    let r = azar.u() * total, i = 0;
    while (r >= resto[i]) { r -= resto[i]; i++; }
    out[i]++; resto[i]--;
  }
  return out;
}

const activaEn = (c, d) => !c.activa || c.activa.some(([a, b]) => d >= a && d <= b);
const mesDe = (d) => d.slice(0, 7);

export function detallar(data) {
  const cfg = data.config;
  const dias = data.dias;

  // ── Campañas ──
  const campanas = {};
  for (const canal of cfg.canales) {
    const lista = cfg.campanas[canal.id];
    const az = crearAzar(semillaDe(cfg.semilla, 'campanas', canal.id));
    campanas[canal.id] = data.pauta[canal.id].map((r) => {
      if (r.sinDato) return { fecha: r.fecha, sinDato: true };
      const act = lista.map((c) => (activaEn(c, r.fecha) ? c.peso : 0));
      const gasto = repartirMonto(r.inversion, act);
      const impresiones = multinomial(az, r.impresiones, act);
      const clics = multinomial(az, r.clics, act.map((p, i) => p * lista[i].ctr));
      const leads = multinomial(az, r.leads, clics.map((k, i) => k * lista[i].conversion));
      return { fecha: r.fecha, porCampana: lista.map((c, i) => ({ id: c.id, inversion: gasto[i], impresiones: impresiones[i], clics: clics[i], leads: leads[i] })) };
    });
  }

  // ── Palabras clave y términos de Search ──
  const azK = crearAzar(semillaDe(cfg.semilla, 'palabras'));
  const lecturaSearch = (lista) => data.pauta.search.map((r) => {
    if (r.sinDato) return { fecha: r.fecha, sinDato: true };
    const act = lista.map((k) => (!k.desde || r.fecha >= k.desde ? k.clics : 0));
    const clics = multinomial(azK, r.clics, act);
    const leads = multinomial(azK, r.leads, clics.map((c, i) => c * lista[i].conversion));
    const gasto = repartirMonto(r.inversion, clics.map((c, i) => c * (lista[i].cpc ?? 1)));
    return { fecha: r.fecha, clics, leads, inversion: gasto };
  });
  const palabras = lecturaSearch(cfg.palabrasClave);
  const terminos = lecturaSearch(cfg.terminosBusqueda);

  // ── Programática: una planilla, sin días ──
  const azP = crearAzar(semillaDe(cfg.semilla, 'programatica'));
  const pr = cfg.programatica;
  const programatica = {
    ...pr,
    formatos: pr.formatos.map((f) => {
      const impresiones = Math.round(f.impresiones * azP.ruido(0.08));
      const clics = azP.binomial(impresiones, f.ctr * azP.ruido(0.1));
      const consumo = Math.round((f.compra === 'CPC' ? clics * f.costoUnidad : (impresiones / 1000) * f.costoUnidad) * 100) / 100;
      return { nombre: f.nombre, compra: f.compra, audiencia: f.audiencia, impresiones, clics, consumo };
    }),
  };

  // ── CRM por dentro ──
  const c = cfg.crm;
  const azC = crearAzar(semillaDe(cfg.semilla, 'crm'));
  const fuentesSitio = cfg.web.fuentes.filter((f) => !f.deClics).map((f) => f.id);
  const webDia = new Map(data.web.map((w) => [w.fecha, w]));
  const etapas = ['leads', 'contactos', 'citas', 'asisten', 'altas'];
  const crm = data.cohortes.map((x) => {
    // fuente por último clic: la pauta es su canal; el sitio sin pauta se reparte según las solicitudes del día por fuente
    let porFuente;
    if (x.canal === cfg.organico.id) {
      const w = webDia.get(x.fecha);
      let capacidad = fuentesSitio.map((f) => w.fuentes[f].solicitudes);
      if (!capacidad.some(Boolean)) capacidad = fuentesSitio.map(() => 1);
      // primera etapa: leads por fuente con peso de las solicitudes; las siguientes, sin reemplazo dentro de la anterior
      let previo = multinomial(azC, x.leads, capacidad);
      porFuente = Object.fromEntries(fuentesSitio.map((f) => [f, { leads: 0, contactos: 0, citas: 0, asisten: 0, altas: 0 }]));
      fuentesSitio.forEach((f, i) => { porFuente[f].leads = previo[i]; });
      for (let k = 1; k < etapas.length; k++) {
        previo = sinReemplazo(azC, x[etapas[k]], previo);
        fuentesSitio.forEach((f, i) => { porFuente[f][etapas[k]] = previo[i]; });
      }
    }
    // tiempo al primer contacto (solo contactados, con algunos sin registro)
    const finDe = diaSemana(x.fecha) >= 5;
    let pesos = finDe ? c.contactoFinDeSemana : c.contactoLaborable;
    if (x.fecha >= c.contactoLento.desde) pesos = pesos.map((p, i) => p * c.contactoLento.factor[i]);
    const conRegistro = azC.binomial(x.contactos, 1 - c.sinRegistroContacto);
    const primerContacto = multinomial(azC, conRegistro, pesos);
    const intentos = multinomial(azC, x.leads, c.intentos);
    // los que no pasaron de etapa: abiertos si todavía están en plazo al corte; si no, descartados con motivo
    const edad = diasEntre(x.fecha, cfg.corte);
    const quedan = [x.leads - x.contactos, x.contactos - x.citas, x.citas - x.asisten, x.asisten - x.altas];
    const abiertos = quedan.map((q, k) => (edad <= c.plazoAbierto[k] ? q : 0));
    const descartados = quedan.reduce((s, q, k) => s + q - abiertos[k], 0);
    const motivos = multinomial(azC, descartados, c.motivosDescarte.map((m) => m.peso));
    // campaña del CRM: una parte de los leads que cumplen sus condiciones queda etiquetada; sus inscripciones, sin reemplazo
    const k = c.campanas.find((m) => x.fecha >= m.desde && x.fecha <= m.hasta && (!m.canales || m.canales.includes(x.canal)) && (!m.sedes || m.sedes.includes(x.sede)));
    let campana = null;
    if (k) {
      const leads = azC.binomial(x.leads, k.participacion);
      const [altas] = sinReemplazo(azC, leads, [x.altas, x.leads - x.altas]);
      campana = { id: k.id, leads, altas };
    }
    return { fecha: x.fecha, canal: x.canal, sede: x.sede, porFuente, primerContacto, sinRegistro: x.contactos - conRegistro, intentos, abiertos, descartados, motivos, campana };
  });

  // ── Meses de la muestra ──
  const meses = [...new Set(dias.map(mesDe))];
  const semanasDelMes = (m) => data.semanas.filter((s) => mesDe(sumarDias(s, 3)) === m);
  const t = (m) => meses.indexOf(m) / (meses.length - 1);

  // ── TikTok: hashtags por mes ──
  const azT = crearAzar(semillaDe(cfg.semilla, 'tiktok'));
  const hashtags = cfg.hashtags.map((h) => ({
    tag: h.tag, propia: !!h.propia,
    meses: meses.map((m) => {
      const publicaciones = azT.poisson(h.publicaciones * cfg.estacionalidad[+m.slice(5) - 1] * (1 + (h.crece || 0) * t(m)) * azT.ruido(0.1));
      const vistas = Math.round(publicaciones * h.vistasPorPublicacion * azT.ruido(0.15));
      const interacciones = azT.binomial(vistas, Math.min(0.5, h.interaccion * azT.ruido(0.1)));
      return { mes: m, publicaciones, vistas, interacciones };
    }),
  }));

  // ── Temas de conversación sobre la marca propia, con tono ──
  const azM = crearAzar(semillaDe(cfg.semilla, 'temas'));
  const propia = data.conversacion.find((x) => x.propia);
  const temas = meses.map((m) => {
    const sem = semanasDelMes(m);
    const menciones = propia.semanas.filter((s) => sem.includes(s.semana)).reduce((a, s) => a + s.menciones, 0);
    const reparto = multinomial(azM, menciones, [...cfg.temas.map((x) => x.peso), cfg.sinTema]);
    return {
      mes: m, menciones, completo: sem.length > 0,
      porTema: cfg.temas.map((x, i) => {
        const tono = x.desde && m >= x.desde ? x.tonoDesde : x.tono;
        const [positivas, neutras, negativas] = multinomial(azM, reparto[i], [0.7 * (1 + tono) / 2, 0.3, 0.7 * (1 - tono) / 2]);
        return { id: x.id, menciones: reparto[i], positivas, neutras, negativas };
      }),
      sinTema: reparto.at(-1),
    };
  });

  // ── Competencia en redes ──
  const azR = crearAzar(semillaDe(cfg.semilla, 'redes'));
  const redes = cfg.redesMarcas.map((r) => ({
    id: r.id, nombre: cfg.conversacion.find((x) => x.id === r.id).nombre, propia: !!r.propia,
    meses: meses.map((m) => {
      const publicaciones = azR.poisson(r.publicaciones * (1 + (r.crece || 0) * t(m)) * azR.ruido(0.12));
      const interacciones = Math.round(publicaciones * r.interaccion * cfg.estacionalidad[+m.slice(5) - 1] * (1 + (r.crece || 0) * t(m)) * azR.ruido(0.18));
      const anuncios = azR.poisson(r.anuncios * cfg.presionSubasta[+m.slice(5) - 1] * azR.ruido(0.15));
      return { mes: m, publicaciones, interacciones, anuncios, formatos: multinomial(azR, anuncios, cfg.formatosAnuncio.map((f) => f.peso)) };
    }),
  }));
  // Sentimiento de los comentarios en las publicaciones de cada marca, por mes: azar propio para no mover el resto
  const azTono = crearAzar(semillaDe(cfg.semilla, 'sentimiento'));
  redes.forEach((r, i) => {
    const { positivo, negativo } = cfg.redesMarcas[i].sentimiento;
    r.meses.forEach((x) => {
      const comentarios = Math.round(x.interacciones * 0.06); // asumo: 6 de cada 100 interacciones son comentarios
      const pos = Math.min(0.8, positivo * azTono.ruido(0.06)), neg = Math.min(0.3, negativo * azTono.ruido(0.1));
      const [positivos, neutros, negativos] = multinomial(azTono, comentarios, [pos, 1 - pos - neg, neg]);
      x.sentimiento = { positivos, neutros, negativos };
    });
    r.palabras = cfg.redesMarcas[i].palabras;
  });

  // ── Búsquedas por región, lectura mensual: índice relativo a la región con más búsqueda (= 100) ──
  const azG = crearAzar(semillaDe(cfg.semilla, 'regiones'));
  const regiones = cfg.busquedas.map((b) => ({
    id: b.id,
    meses: meses.map((m) => {
      const v = cfg.pesoRegion[b.id].map((p) => p * azG.ruido(0.06));
      const max = Math.max(...v);
      const filas = cfg.regiones.map((r, i) => ({ region: r, indice: v[i] > 0 ? Math.round((v[i] / max) * 100) : 0 })).filter((x) => x.indice > 0);
      return { mes: m, top: filas.sort((a, b) => b.indice - a.indice).slice(0, 5) };
    }),
  }));

  // ── Sitio: sesiones con interacción y por hora ──
  const azW = crearAzar(semillaDe(cfg.semilla, 'web-detalle'));
  const web = data.web.map((w) => {
    const conInteraccion = Object.fromEntries(Object.entries(w.fuentes).map(([f, x]) => [f, azW.binomial(x.sesiones, cfg.interaccionWeb[f])]));
    const sesiones = Object.values(w.fuentes).reduce((s, x) => s + x.sesiones, 0);
    return { fecha: w.fecha, conInteraccion, porHora: multinomial(azW, sesiones, cfg.perfilHoraWeb) };
  });

  return { campanas, palabras, terminos, programatica, crm, hashtags, temas, redes, regiones, web, meses };
}
