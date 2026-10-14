// Textos de la capa Sugiere. Cada alerta dice qué pasó (con su dato), por qué importa, qué se puede cambiar
// y cómo se sabría si el cambio funcionó. Observan y proponen; no ordenan ni prometen.
import { numero, dolares, porcentaje, fechaCorta } from '../sistema/formato.js';
import { mesTexto, lista, capital } from './comun.js';

const pct = (x, d = 0) => porcentaje(x * 100, d);

// Alertas de «qué mirar»: una función por regla de src/calculo/queMirar.js
const ALERTAS = {
  'cpl-objetivo': (d) => ({
    titulo: `${d.plataforma} pasó su objetivo de costo por lead en la última semana`,
    dato: `${dolares(d.cpl, 2)} por lead del ${fechaCorta(d.desde)} al ${fechaCorta(d.hasta)}, contra un objetivo de ${dolares(d.objetivo, 2)} (${numero(d.leads)} leads).`,
    porque: 'Si sigue así, el mes cierra con menos leads por la misma inversión.',
    accion: 'Revisar qué campaña y qué palabras subieron de costo, y bajar la puja o pausar lo que no trae leads antes de mover presupuesto.',
    senal: 'El costo por lead de los próximos 7 días vuelve bajo el objetivo.',
  }),
  'dia-fuera': (d) => ({
    titulo: `${d.plataforma} tuvo ${d.dias.length === 1 ? 'un día' : `${numero(d.dias.length)} días`} fuera de lo normal`,
    dato: `${lista(d.dias.map((x) => `${fechaCorta(x.fecha)} (${x.sinDato ? 'sin dato' : dolares(x.inversion)})`))}; un día normal invierte unos ${dolares(d.mediana)}.`,
    porque: 'Un día sin dato o con muy poca inversión puede ser un corte de la campaña o una falla del reporte.',
    accion: 'Confirmar en la plataforma si la campaña estuvo pausada o si faltó el dato.',
    senal: 'El dato del día aparece o la causa queda anotada.',
  }),
  'palabras-sin-conversion': (d) => ({
    titulo: 'Palabras clave que gastan y casi no traen leads',
    dato: `${capital(lista(d.palabras.map((p) => `«${p}»`)))}: ${dolares(d.monto)} en el mes, ${pct(d.pct)} de lo invertido en Search.`,
    porque: 'Es plata que hoy no trae leads.',
    accion: 'Bajar la puja o pausarlas, y agregar como negativas las búsquedas que no buscan un gimnasio como Fit Lab.',
    senal: 'El costo por lead de Search baja sin perder leads.',
  }),
  'contacto-lento': (d) => ({
    titulo: 'El equipo contacta menos leads a tiempo',
    dato: `${pct(d.ahora)} de los leads se contactó en menos de 5 minutos; en ${mesTexto(d.mesAntes)}, ${pct(d.antes)}.${d.causa ? ` En el CRM figura un cambio: ${d.causa.toLowerCase()}.` : ''}`,
    porque: 'Un lead contactado tarde agenda menos clases de prueba: la pauta se paga igual.',
    accion: 'Cubrir los turnos con menos asesoras o activar una respuesta automática que agende la clase en el momento.',
    senal: 'El contacto en menos de 5 minutos vuelve a estar sobre el mes anterior.',
  }),
  'fin-de-semana': (d) => ({
    titulo: 'El fin de semana los leads esperan demasiado',
    dato: `${pct(d.finDeSemana)} de los leads del sábado y domingo esperó más de 2 horas; entre semana, ${pct(d.laborable)}.`,
    porque: 'El domingo en la noche es cuando más gente mira el sitio: el interés llega cuando nadie responde.',
    accion: 'Un turno corto el domingo en la tarde, o un mensaje automático que ofrezca horarios de clase de prueba.',
    senal: 'Baja la proporción de leads del fin de semana que espera más de 2 horas.',
  }),
  'plataforma-vs-crm': (d) => ({
    titulo: 'La plataforma y el CRM no premian al mismo canal',
    dato: `${d.porLead} trae el lead más barato; ${d.porInscripcion}, la inscripción más barata.`,
    porque: 'Optimizar solo por costo por lead empuja al canal que inscribe menos.',
    accion: 'Mirar el costo por inscripción antes de mover presupuesto (está en Analiza).',
    senal: 'Las decisiones de presupuesto citan el costo por inscripción.',
  }),
  'llega-poco': (d) => ({
    titulo: `De ${d.plataforma} llegan al CRM menos leads de los que reporta`,
    dato: `De cada 100 leads que reporta, ${numero(d.de100)} están en el CRM (${numero(d.enCrm)} de ${numero(d.reportados)}).`,
    porque: 'La plataforma optimiza hacia leads que nunca llegan: el costo por lead real es más alto que el reportado.',
    accion: 'Revisar la integración del formulario con el CRM y los leads duplicados o de prueba.',
    senal: 'Llegan al CRM al menos 85 de cada 100 leads reportados.',
  }),
  'tema-negativo': (d) => ({
    titulo: `Crecen los comentarios negativos sobre «${d.tema.toLowerCase()}»`,
    dato: `Sentimiento de ${numero(Math.round(50 + 50 * d.tono))} de 100 en ${numero(d.menciones)} menciones${d.tonoPrevio != null ? `; un año antes, ${numero(Math.round(50 + 50 * d.tonoPrevio))}` : ''}.`,
    porque: 'Lo que se dice de la atención en sede pesa en quien está decidiendo inscribirse.',
    accion: 'Leer las menciones con el equipo de sedes y responder en las redes con lo que se va a corregir.',
    senal: 'El sentimiento del tema vuelve sobre 50 (neutro).',
  }),
  'interaccion-cae': (d) => ({
    titulo: `Las sesiones de ${d.canal.toLowerCase()} interactúan menos`,
    dato: `${pct(d.ahora)} de las sesiones tuvo interacción; en ${mesTexto(d.mesAntes)}, ${pct(d.antes)} (${numero(d.sesiones)} sesiones).${d.evento ? ` Coincide con «${d.evento.texto}» (${fechaCorta(d.evento.fecha)}).` : ''}`,
    porque: 'El clic se paga igual: si la gente se va sin mirar, el costo de cada visita útil sube.',
    accion: 'Revisar la página a la que llevan los anuncios: carga en celular, que la oferta coincida con el anuncio y un botón visible.',
    senal: 'La tasa de interacción de ese canal vuelve a la del mes anterior.',
  }),
  'busqueda-sube': (d) => ({
    titulo: `Sube el interés por «${d.termino}»`,
    dato: d.sinBase ? 'Hace tres meses casi no se buscaba y hoy sí.' : `${numero(d.cambio)} % más interés que hace tres meses.`,
    porque: 'Es demanda que llega sola: quien la atienda primero se queda con esa búsqueda.',
    accion: 'Probar una campaña chica de Search con esa palabra y contar en las redes las clases que ya existen.',
    senal: 'La palabra trae leads a un costo cercano al objetivo de Search.',
  }),
};

export function alerta(a) {
  const f = ALERTAS[a.id];
  return f ? { ...f(a.datos), nivel: a.nivel, fuente: a.fuente, sostiene: a.sostiene, id: a.id } : null;
}

// Lo que va bien: una función por señal de queVaBien
const BIEN = {
  'bajo-objetivo': (d) => ({
    titulo: `${d.plataforma} está bajo su objetivo`,
    dato: `${dolares(d.cpl, 2)} por lead contra ${dolares(d.objetivo, 2)} de objetivo: ${pct(d.margen)} por debajo${d.anual != null && d.anual > 0 ? `, y ${pct(d.anual)} más barato que hace un año` : ''}.`,
    sostener: 'Mantener lo que funciona antes de probar cambios en esta plataforma.',
  }),
  'mejora-anual': (d) => ({
    titulo: `${d.plataforma} está más barato que hace un año`,
    dato: `${dolares(d.cpl, 2)} por lead; un año antes, ${dolares(d.previo, 2)}.`,
    sostener: 'Ver qué cambió para repetirlo en otra plataforma.',
  }),
  'piezas-nuevas': (d) => ({
    titulo: `Las piezas nuevas de ${d.canal} recuperaron el clic`,
    dato: `El CTR pasó de ${pct(d.antes, 2)} a ${pct(d.despues, 2)} desde el ${fechaCorta(d.fecha)}.`,
    sostener: 'Las piezas funcionan; lo que hay que mirar es la página a la que llevan (ver la alerta de GA4).',
  }),
  'mejor-sentimiento': (d) => ({
    titulo: 'Fit Lab tiene el mejor sentimiento de las marcas leídas',
    dato: `${numero(d.indice)} de 100 en los comentarios de sus publicaciones; le sigue ${d.segundo} con ${numero(d.segundoIndice)}.`,
    sostener: 'El tono de las publicaciones funciona: vale más mantenerlo que cambiarlo.',
  }),
};

export function bien(b) {
  const f = BIEN[b.id];
  return f ? { ...f(b.datos), fuente: b.fuente, sostiene: b.sostiene, id: b.id } : null;
}

// Resumen de una línea para el resumen de la capa Lee
export function conteo(alertas, buenas) {
  const at = alertas.filter((a) => a.nivel === 'atencion').length, re = alertas.filter((a) => a.nivel === 'revisar').length, op = alertas.filter((a) => a.nivel === 'oportunidad').length;
  const partes = [];
  if (at) partes.push(`${numero(at)} ${at === 1 ? 'alerta' : 'alertas'} de atención`);
  if (re) partes.push(`${numero(re)} para revisar`);
  if (op) partes.push(`${numero(op)} ${op === 1 ? 'oportunidad' : 'oportunidades'}`);
  if (buenas) partes.push(`${numero(buenas)} ${buenas === 1 ? 'cosa que va bien' : 'cosas que van bien'}`);
  return partes.length ? `Este mes: ${lista(partes)}.` : 'Este mes no hay nada fuera de lo esperado.';
}

// Qué mover: sugerencias del modelo. Las estimaciones van con rango y diciendo que no son promesa
export function sugerencia(s) {
  if (s.id === 'reasignar') {
    const d = s.desde, h = s.hacia, r = (x) => numero(Math.round(x));
    return {
      titulo: `Mover ${dolares(s.monto)} al mes de ${d.nombre} a ${h.nombre}`,
      dato: `${d.nombre}: ${dolares(d.cpl, 2)} por lead y ${dolares(d.cohorte.cpa)} por inscripción. ${h.nombre}: ${dolares(h.cpl, 2)} y ${dolares(h.cohorte.cpa)}.`,
      estimacion: `Podría sumar entre ${r(s.leads.baja)} y ${r(s.leads.alta)} leads al mes (unos ${r(s.leads.central)}) y unas ${r(s.inscripciones.central)} inscripciones. Es una estimación con rango, no una promesa.`,
      sostiene: s.acuerdo + (d.cohorte.pocosCasos ? `. Ojo: ${d.nombre} tiene pocas inscripciones en la cohorte, así que su costo por inscripción es inestable.` : '.'),
      supuestos: s.supuestos, ir: 's-1-1', irTexto: 'Pauta pagada',
    };
  }
  if (s.id === 'agendar') {
    return {
      titulo: 'Agendar más clases de prueba con quienes ya se contactó',
      dato: `${numero(s.sinCita.de100)} de cada 100 leads de la cohorte se contactan y no agendan: es la mayor pérdida del camino a la inscripción.`,
      estimacion: `Si la tasa de cita subiera ${numero(Math.round(s.mejora * 100))} puntos (de ${porcentaje(s.tasaCita * 100)} a ${porcentaje((s.tasaCita + s.mejora) * 100)}), serían unas ${numero(Math.round(s.nuevasAltas))} inscripciones más por cohorte. Es un escenario, no una estimación del efecto.`,
      sostiene: 'Va junto con las alertas de contacto lento: un lead que espera agenda menos.',
      supuestos: s.supuestos, ir: 's-1-2', irTexto: 'CRM',
    };
  }
  return null;
}

// Escenario si nada cambia: con pinzas. Dice cuánto acertó el método antes y qué meses no muestra
export function escenarioTexto(e) {
  const m1 = e.meses.find((m) => m.central != null);
  const ocultos = e.meses.filter((m) => m.central == null);
  const r = (x) => numero(Math.round(x));
  const acierto = m1 ? `A un mes, el rango contuvo el resultado real en ${numero(m1.acierto.dentro)} de ${numero(m1.acierto.probados)} pruebas con meses ya cerrados.` : '';
  return {
    titulo: 'Si la inversión sigue el plan',
    lectura: m1 ? `${capital(mesTexto(m1.mes))} cerraría entre ${r(m1.baja)} y ${r(m1.alta)} leads reportados. ${acierto}` : 'No hay un mes con suficientes pruebas para mostrar un rango.',
    nota: `El método se equivoca en promedio ${porcentaje(e.error.metodo * 100)}; repetir el mes anterior, ${porcentaje(e.error.ingenuo * 100)}.${ocultos.length ? ` ${capital(lista(ocultos.map((m) => mesTexto(m.mes))))} no se ${ocultos.length === 1 ? 'muestra' : 'muestran'}: a ese plazo el método acierta poco.` : ''} No es una meta ni una promesa: es lo que pasaría si nada cambia.`,
  };
}
