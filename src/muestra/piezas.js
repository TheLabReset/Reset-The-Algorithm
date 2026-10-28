// Piezas de muestra: conjuntos de anuncios y piezas dentro de cada campaña, día por día, como los reporta el
// administrador de anuncios de cada plataforma. Se arma desde las campañas ya detalladas (src/muestra/detalle.js), con
// azar propio por campaña y día: no mueve ninguna otra serie y agregar un día no cambia los anteriores.
// Lo que reporta la campaña cada día se reparte entre sus piezas activas, así que suma exacto:
//  · gasto por peso; impresiones por gasto; clics por impresiones × CTR; leads por clics × conversión.
// Las tandas: cada `cada` días entra una pieza nueva en cada conjunto. En Meta, durante la fatiga no entran piezas (por
// eso se cansan) y la tanda siguiente entra el día de las piezas nuevas (el evento «creativo»).
// Las campañas de alcance no buscan leads: no tienen conjuntos aquí.

import { crearAzar } from './azar.js';
import { multinomial } from './generador.js';
import { sumarDias, diasEntre } from './calendario.js';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

// semillaDe y repartirMonto llegan desde detalle.js, para usar los mismos que el resto del detalle
export function piezasDe(data, campanas, { semillaDe, repartirMonto }) {
  const cfg = data.config, C = cfg.piezas;
  const plataformaDe = (canal) => cfg.plataformas.find((p) => p.canales.includes(canal)).id;
  const fatiga = cfg.fatigaMeta;
  const nuevasMeta = cfg.eventos.filter((e) => e.tipo === 'creativo' && e.canal === 'meta').map((e) => e.fecha);
  // el comportamiento de cada pieza sigue un orden fijo por tanda; cada conjunto empieza en otro punto
  const comportamientoDe = (n, k) => C.orden[(n * 3 + k) % C.orden.length];

  const conjuntos = [], piezas = [];
  let n = 0;
  for (const canal of cfg.canales) for (const camp of cfg.campanas[canal.id]) {
    const nombres = C.conjuntos[camp.id];
    if (!nombres) continue;
    nombres.forEach((nombre, j) => {
      const conjunto = { id: `${camp.id}-${j + 1}`, campana: camp.id, campanaNombre: camp.nombre, canal: canal.id, plataforma: plataformaDe(canal.id), nombre };
      conjuntos.push(conjunto);
      // las tandas del conjunto, corridas unos días entre conjuntos para que no entren todas el mismo día
      let inicios = [];
      for (let d = sumarDias(cfg.desde, -C.cada + ((n * 5) % C.cada)); d <= cfg.corte; d = sumarDias(d, C.cada)) inicios.push(d);
      if (canal.id === 'meta') {
        inicios = inicios.filter((d) => !(d >= fatiga.desde && nuevasMeta.some((e) => d < e && e > fatiga.desde)));
        inicios = [...new Set([...inicios, ...nuevasMeta])].sort();
      }
      inicios.forEach((inicio, k) => {
        const id = `${conjunto.id}-${inicio}`;
        // en Meta, lo que estaba activo cuando empezó la fatiga se cansa
        const enFatiga = canal.id === 'meta' && inicio < fatiga.desde && (!inicios[k + 1] || inicios[k + 1] > fatiga.desde);
        const comportamiento = enFatiga ? 'saturada' : comportamientoDe(n, k);
        // dura hasta que entra la tanda siguiente (o dos, si se queda), más unos días en que conviven
        const siguiente = inicios[k + (C.comportamientos[comportamiento].tandas || 1)];
        const formatos = C.formatos[canal.id];
        piezas.push({
          id, conjunto: conjunto.id, campana: camp.id, canal: canal.id, plataforma: conjunto.plataforma,
          formato: formatos[(k + n) % formatos.length], tema: C.temas[(k + n) % C.temas.length], arte: (k + n) % 3,
          inicioTanda: inicio, finTanda: siguiente ? sumarDias(siguiente, C.solapa) : null,
          comportamiento,
        });
      });
      n++;
    });
  }

  // cada día, lo de cada campaña entre sus piezas activas
  const porCampana = {};
  for (const p of piezas) (porCampana[p.campana] || (porCampana[p.campana] = [])).push(p);
  const alAire = (p, d) => p.inicioTanda <= d && (!p.finTanda || d <= p.finTanda);
  const dias = data.dias.map((d) => ({ fecha: d }));
  const enDia = new Map(dias.map((x) => [x.fecha, x]));
  for (const canal of cfg.canales) {
    const lista = cfg.campanas[canal.id];
    for (const r of campanas[canal.id]) {
      const fila = enDia.get(r.fecha);
      if (r.sinDato) { fila.sinDato = [...(fila.sinDato || []), canal.id]; continue; }
      r.porCampana.forEach((c, i) => {
        const de = (porCampana[lista[i].id] || []).filter((p) => alAire(p, r.fecha));
        if (!de.length || !(c.inversion > 0)) return;
        const az = crearAzar(semillaDe(cfg.semilla, 'piezas', lista[i].id, r.fecha));
        // cada conjunto se lleva la misma parte; dentro, cada pieza según su comportamiento y su edad
        const enConjunto = (p) => de.filter((x) => x.conjunto === p.conjunto).length;
        const pesos = de.map((p) => {
          const comp = C.comportamientos[p.comportamiento], edad = diasEntre(p.inicioTanda, r.fecha);
          const cansancio = comp.cansa ? Math.max(0, edad - 21) : 0;
          return {
            gasto: (comp.gasto * (edad < 3 ? 0.6 : 1) * (comp.cansa ? Math.max(0.5, 1 - cansancio / 60) : 1)) / enConjunto(p),
            ctr: comp.ctr * (comp.cansa ? Math.max(0.35, 1 - cansancio / 35) : 1),
            conversion: comp.conversion * (comp.cansa ? Math.max(0.25, 1 - cansancio / 25) : 1) * (edad < 5 ? 0.75 : 1),
          };
        });
        const inversion = repartirMonto(c.inversion, pesos.map((w) => w.gasto));
        const impresiones = multinomial(az, c.impresiones, inversion);
        const clics = multinomial(az, c.clics, impresiones.map((k, j) => k * pesos[j].ctr));
        const pesoLeads = clics.map((k, j) => k * pesos[j].conversion);
        const leads = multinomial(az, c.leads, pesoLeads.some((w) => w > 0) ? pesoLeads : clics.map((k) => k || 1));
        de.forEach((p, j) => { fila[p.id] = { inversion: inversion[j], impresiones: impresiones[j], clics: clics[j], leads: leads[j] }; });
      });
    }
  }

  // el inicio y el fin de cada pieza salen de la data: su primer y su último día con gasto. Sigue activa si gastó al corte
  const conGasto = piezas.map((p) => {
    let inicio = null, fin = null;
    for (const x of dias) if (x[p.id]?.inversion > 0) { if (!inicio) inicio = x.fecha; fin = x.fecha; }
    if (!inicio) return null;
    const { inicioTanda, finTanda, ...resto } = p;
    void inicioTanda; void finTanda;
    return { ...resto, nombre: `${p.tema} · ${p.formato.toLowerCase()} · ${MESES[+inicio.slice(5, 7) - 1]}`, inicio, fin: fin >= cfg.corte ? null : fin };
  }).filter(Boolean);
  return { conjuntos, piezas: conGasto, dias };
}
