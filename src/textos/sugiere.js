// Textos del modelo (Inteligencia y Activación), como en producción: cada alerta es un título con su dato y una sola línea de qué mirar.
// Lo que se propone queda dentro de lo que maneja la agencia (pauta, piezas, páginas, palabras clave).
// Lo que depende del cliente (su equipo, sus sedes) se conversa con él; nunca se le pide más al personal.
import { numero, dolares, porcentaje, fecha } from '../sistema/formato.js';
import { mesTexto, lista, capital, enLetras, tramoFechas, parecidoTexto } from './comun.js';

const pct = (x, d = 0) => porcentaje(x * 100, d);
const de100 = (x) => numero(Math.round(x * 100));
const dia = (iso) => fecha(iso).replace(/ de \d{4}$/, '');

// Alertas de «qué mirar»: una función por regla de src/calculo/queMirar.js
const ALERTAS = {
  'cpl-objetivo': (d) => ({
    titulo: `${d.plataforma} pasó su objetivo de costo por lead en la última semana`,
    dato: `${capital(tramoFechas(d.desde, d.hasta))}, ${dolares(d.cpl, 2)} por lead con un objetivo de ${dolares(d.objetivo, 2)} (${numero(d.leads)} leads).`,
    mirar: `En ${d.plataforma}, qué campañas y palabras subieron de costo esos días. Se puede ajustar la puja antes de mover inversión entre plataformas.`,
  }),
  'dia-fuera': (d) => ({
    titulo: `${d.plataforma} tuvo ${d.dias.length === 1 ? 'un día' : `${numero(d.dias.length)} días`} fuera de lo normal`,
    dato: `${capital(lista(d.dias.map((x) => `${dia(x.fecha)} (${x.sinDato ? 'sin dato' : dolares(x.inversion)})`)))}. Un día normal invierte unos ${dolares(d.mediana)}.`,
    mirar: 'En la plataforma, si la campaña estuvo en pausa o si faltó el dato del reporte.',
  }),
  'palabras-sin-conversion': (d) => ({
    titulo: `${d.palabras.length === 1 ? 'Una palabra clave gasta' : `${capital(enLetras(d.palabras.length, true))} palabras clave gastan`} y casi no trae${d.palabras.length === 1 ? '' : 'n'} leads`,
    dato: `${capital(lista(d.palabras.map((p) => `«${p}»`)))}: ${dolares(d.monto)} en el mes, ${pct(d.pct)} de la inversión en Search.`,
    mirar: 'Si esas búsquedas corresponden a lo que ofrece Fit Lab. Si no, se pueden pausar o agregar como negativas en Search.',
  }),
  'contacto-lento': (d) => ({
    titulo: 'Más leads esperan más de un día por su primer contacto',
    dato: `${de100(d.ahora)} de cada 100 leads recibió su primer contacto en menos de un día; en ${mesTexto(d.mesAntes)}, ${de100(d.antes)}.${d.causa ? ` El CRM registra un cambio desde el ${dia(d.causaDesde)}: ${d.causa.toLowerCase()}.` : ''}`,
    mirar: 'Conversar con Fit Lab si conviene ajustar el volumen de pauta a lo que el equipo puede atender mientras vuelve a estar completo.',
  }),
  'fin-de-semana': (d) => ({
    titulo: 'Los leads del fin de semana esperan más',
    dato: `${de100(d.finDeSemana)} de cada 100 leads del sábado y el domingo esperó más de un día por su primer contacto; entre semana, ${de100(d.laborable)}.`,
    mirar: 'Ver con Fit Lab si conviene poner más inversión de lunes a jueves, cuando el equipo responde en el día.',
  }),
  'plataforma-vs-crm': (d) => ({
    titulo: 'La plataforma y el CRM no coinciden en cuál rinde más',
    dato: `${d.porLead} trae el lead más barato; ${d.porInscripcion}, la inscripción más barata.`,
    mirar: 'El costo por inscripción, en Rendimiento, antes de mover inversión entre estas dos plataformas.',
  }),
  'llega-poco': (d) => ({
    titulo: `De ${d.plataforma} llegan al CRM menos leads de los que reporta`,
    dato: `De cada 100 leads que reporta, ${numero(d.de100)} están en el CRM (${numero(d.enCrm)} de ${numero(d.reportados)}).`,
    mirar: `Con quien administra el CRM, la conexión del formulario de ${d.plataforma} y los leads duplicados o de prueba.`,
  }),
  'cierra-campana': (d) => ({
    titulo: `«${d.campana}» cierra en ${numero(d.faltan)} ${d.faltan === 1 ? 'día' : 'días'}`,
    dato: `La campaña del CRM termina el ${fecha(d.hasta)} y lleva ${numero(d.leads)} leads y ${numero(d.altas)} inscripciones desde que empezó.`,
    mirar: `Que ${d.plataformas.length ? lista(d.plataformas) : 'la pauta que la empuja'} tenga inversión hasta el cierre, y conversar con Fit Lab qué mensaje sigue después.`,
  }),
  'interaccion-cae': (d) => ({
    titulo: `Las visitas desde ${d.canal.toLowerCase()} interactúan menos`,
    dato: `${de100(d.ahora)} de cada 100 sesiones tuvo interacción; en ${mesTexto(d.mesAntes)}, ${de100(d.antes)}.${d.evento ? ` Coincide con «${d.evento.texto}», del ${dia(d.evento.fecha)}.` : ''}`,
    mirar: 'La página a la que llevan los anuncios: que cargue bien en el celular y que muestre la oferta del anuncio.',
  }),
  'busqueda-sube': (d) => ({
    titulo: `Sube el interés por «${d.termino}»`,
    dato: d.sinBase ? 'Hace tres meses casi no se buscaba en Google; hoy sí.' : `En Google, ${numero(d.cambio)} % más interés que hace tres meses.`,
    mirar: 'Si Fit Lab ofrece esa clase o piensa ofrecerla, se puede probar con una campaña chica de Search. Si no, queda anotado.',
  }),
};

export function alerta(a) {
  const f = ALERTAS[a.id];
  return f ? { ...f(a.datos), nivel: a.nivel, fuente: a.fuente, sostiene: a.sostiene, id: a.id } : null;
}

// Lo que va bien: una función por señal de queVaBien
const BIEN = {
  'bajo-objetivo': (d) => ({
    titulo: `${d.plataforma} está bajo su objetivo de costo por lead`,
    dato: `${dolares(d.cpl, 2)} por lead con un objetivo de ${dolares(d.objetivo, 2)}${d.anual != null && d.anual > 0 ? `, y ${pct(d.anual)} menos que un año antes` : ''}.`,
    mirar: `Mantener lo que funciona en ${d.plataforma} antes de probar cambios.`,
  }),
  'mejora-anual': (d) => ({
    titulo: `${d.plataforma} consigue leads más baratos que hace un año`,
    dato: `${dolares(d.cpl, 2)} por lead; un año antes, ${dolares(d.previo, 2)}.`,
    mirar: 'Qué cambió, por si se puede repetir en otra plataforma.',
  }),
  'piezas-nuevas': (d) => ({
    titulo: `Las piezas nuevas de ${d.canal} subieron el clic`,
    dato: `El CTR pasó de ${pct(d.antes, 2)} a ${pct(d.despues, 2)} desde el ${dia(d.fecha)}.`,
    mirar: 'Las piezas funcionan. Lo que falta revisar es la página a la que llevan (ver la alerta de GA4).',
  }),
  'mejor-sentimiento': (d) => ({
    titulo: 'Fit Lab tiene el mejor sentimiento entre las marcas comparadas',
    dato: `${numero(d.indice)} de 100 en los comentarios de sus publicaciones; ${d.segundo}, ${numero(d.segundoIndice)}.`,
    mirar: 'El tono de las publicaciones funciona. Conviene mantenerlo.',
  }),
};

export function bien(b) {
  const f = BIEN[b.id];
  return f ? { ...f(b.datos), fuente: b.fuente, sostiene: b.sostiene, id: b.id } : null;
}

// Qué mover: el modelo solo propone mover inversión cuando la plataforma y el CRM coinciden en la plataforma más cara
export function sugerencia(s) {
  if (s.id !== 'reasignar') return null;
  const d = s.desde, h = s.hacia, r = (x) => numero(Math.round(x));
  return {
    titulo: `Pasar ${dolares(s.monto)} al mes de ${d.nombre} a ${h.nombre}`,
    dato: `${d.nombre} cuesta ${dolares(d.cpl, 2)} por lead, con un objetivo de ${dolares(d.metaCpl, 2)}, y ${dolares(d.cohorte.cpa)} por inscripción; ${h.nombre}, ${dolares(h.cpl, 2)} y ${dolares(h.cohorte.cpa)}.`,
    estimacion: `Podría sumar entre ${r(s.leads.baja)} y ${r(s.leads.alta)} leads al mes y unas ${r(s.inscripciones.central)} inscripciones. Es una estimación con rango, no una promesa.`,
    sostiene: `${d.nombre} pasa su objetivo de costo por lead y el CRM confirma que es la que más cuesta por inscripción.${d.cohorte.pocosCasos ? ` Ojo: ${d.nombre} tiene pocas inscripciones en la cohorte, así que su costo por inscripción puede cambiar mucho de un mes a otro.` : ''}`,
    supuestos: s.supuestos, ir: 's-4-2', irTexto: 'De la pauta al CRM',
  };
}

// Cuando el modelo no propone mover inversión, la frase dice por qué, con el motivo que de verdad aplica
export function sinReasignar(r, periodo) {
  const base = 'El modelo no propone mover el reparto';
  if (r.estado !== 'ok') return { titulo: `${base}: falta el dato de pauta del período.` };
  if (r.crmEstado === 'no-cargo') return { titulo: `${base}: el CRM no cargó y sin él no se sabe cuánto cuesta cada inscripción.` };
  if (!r.cohorteCerrada) return { titulo: `${base}: la cohorte que mide el costo por inscripción todavía no cierra.` };
  const a = r.masBaratoPorLead, b = r.masBaratoPorInscripcion;
  const detalle = !a ? null : !b ? `${capital(periodo)}. ${a.nombre} consigue el lead más barato; por inscripción todavía no hay casos suficientes.`
    : r.cpaParecido ? `${capital(periodo)}. ${a.nombre} consigue el lead más barato; por inscripción, ${parecidoTexto(r.cpaParecido, r.canales.length)} (entre ${dolares(r.cpaParecido.min)} y ${dolares(r.cpaParecido.max)}).`
    : a.id === b.id ? `${capital(periodo)}. ${a.nombre} consigue el lead y la inscripción más baratos.`
    : `${capital(periodo)}. Por lo que reporta la plataforma, ${a.nombre} consigue el lead más barato; por inscripción en el CRM, ${b.nombre}.`;
  if (!r.sobreMeta.length) return { titulo: `${base}: las ${enLetras(r.canales.length, true)} plataformas quedan bajo su objetivo de costo por lead.`, detalle };
  return { titulo: `${base}: la plataforma que pasa su objetivo no es la que más cuesta por inscripción.`, detalle };
}

// Escenario si nada cambia: con pinzas. Dice cuánto acertó el método antes y qué meses no muestra
export function escenarioTexto(e) {
  const m1 = e.meses.find((m) => m.central != null);
  const ocultos = e.meses.filter((m) => m.central == null);
  const r = (x) => numero(Math.round(x));
  return {
    titulo: 'Si la inversión diaria se mantiene',
    lectura: m1
      ? `${capital(mesTexto(m1.mes))} cerraría entre ${r(m1.baja)} y ${r(m1.alta)} leads reportados. Probado con meses ya cerrados, ese rango contuvo el resultado real ${numero(m1.acierto.dentro)} de ${numero(m1.acierto.probados)} veces.`
      : 'Ningún mes tiene pruebas suficientes para mostrar un rango.',
    nota: `En promedio el método se equivoca ${porcentaje(e.error.metodo * 100)}; repetir los leads de las últimas cuatro semanas sin ajustar por temporada, ${porcentaje(e.error.ingenuo * 100)}.${ocultos.length ? ` ${capital(lista(ocultos.map((m) => mesTexto(m.mes))))} no se ${ocultos.length === 1 ? 'muestra' : 'muestran'}: a ese plazo acierta poco.` : ''} Supone que se invierte cada día lo mismo que en las últimas cuatro semanas. No es una meta: es lo que pasaría si nada cambia.`,
  };
}
