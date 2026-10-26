// Fecha móvil de la maqueta: la muestra corta ayer (en Lima) y su historia se mueve con el corte, para que el panel se
// vea al día como uno real. Solo para la demo con data de muestra; una implementación real no usa este archivo (su
// corte es el último día que entregó la fuente). Cómo funciona, cómo apagarlo y qué no tocar: docs/fecha-movil.md.
//
// La configuración (src/muestra/configuracion.js) está escrita para una fecha de referencia. Cada fecha cae en una de
// tres clases:
//  · historia: lo que la demo cuenta cerca del corte (la promo, la caída de Meta, TikTok que se encarece, el equipo
//    de contacto más chico). Se corre en meses enteros: lo que en la referencia pasa en su último mes cerrado pasa
//    siempre en el último mes cerrado, que es el que el panel abre. Un día que era fin de mes sigue siendo fin de mes.
//  · calendario: lo que pasa en una fecha del año (el Reto de enero, los feriados). Se repite cada año del rango.
//  · rango: desde el 1 de enero del año anterior al corte, hasta el corte. Siempre hay un año entero para comparar.

import { sumarDias, anio } from './calendario.js';

// El día de hoy en Lima, como 'AAAA-MM-DD'. Sin Intl (un navegador muy viejo), UTC menos 5 horas, que es la hora de Lima
export function hoyEnLima(ahora = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
  } catch {
    return new Date(ahora.getTime() - 5 * 3600000).toISOString().slice(0, 10);
  }
}

// Domingo de Pascua (algoritmo de Meeus para el calendario gregoriano)
function pascua(a) {
  const b = Math.floor(a / 100), c = a % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * (a % 19) + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor(((a % 19) + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${a}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
// Feriados nacionales del Perú de un año: los de fecha fija, más el Jueves y el Viernes Santo
export function feriadosDe(a, fijos) {
  const p = pascua(a);
  return [...fijos.map((md) => `${a}-${md}`), sumarDias(p, -3), sumarDias(p, -2)].sort();
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
const nombreMes = (iso) => MESES[+iso.slice(5, 7) - 1];
// El lunes en o después de un día: el Reto de enero se anota el primer lunes desde el 5 de enero
const lunesDesde = (iso) => sumarDias(iso, (8 - new Date(iso + 'T00:00:00Z').getUTCDay()) % 7);

const finDeMes = (a, m) => new Date(Date.UTC(a, m, 0)).getUTCDate();
// El último mes cerrado al corte: el del corte si es fin de mes; si no, el anterior. Como 'AAAA-MM'
export function ultimoMesCerrado(corte) {
  const a = +corte.slice(0, 4), m = +corte.slice(5, 7);
  if (+corte.slice(8, 10) === finDeMes(a, m)) return corte.slice(0, 7);
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
}
const indiceMes = (aaaamm) => +aaaamm.slice(0, 4) * 12 + +aaaamm.slice(5, 7) - 1;
// Corre una fecha k meses; un fin de mes queda en fin de mes y un día que no existe en el mes de llegada, en su último día
export function correrMeses(iso, k) {
  const a = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
  const i = a * 12 + m - 1 + k, a2 = Math.floor(i / 12), m2 = (i % 12) + 1, ultimo = finDeMes(a2, m2);
  const d2 = d === finDeMes(a, m) ? ultimo : Math.min(d, ultimo);
  return `${a2}-${String(m2).padStart(2, '0')}-${String(d2).padStart(2, '0')}`;
}

// La configuración de la muestra para un corte. Con el corte igual a la fecha de referencia devuelve las mismas fechas
// con las que se escribió la configuración
export function muestraAl(base, corte) {
  const ref = base.corte; // la fecha de referencia para la que se escribió la configuración
  // meses enteros: el último mes cerrado de la referencia pasa a ser el último mes cerrado del corte
  const k = indiceMes(ultimoMesCerrado(corte)) - indiceMes(ultimoMesCerrado(ref));
  const mover = (iso) => (iso ? correrMeses(iso, k) : iso);
  const desde = `${anio(corte) - 1}-01-01`;
  const anios = [];
  for (let a = anio(desde); a <= anio(corte); a++) anios.push(a);
  // lo de calendario, una vez por año del rango
  const enero = base.fechaMovil.campanaEnero;
  const deEnero = (a) => [`${a}-${enero.desde}`, `${a}-${enero.hasta}`];
  const cfg = structuredClone(base);
  Object.assign(cfg, { desde, corte });
  cfg.feriados = anios.flatMap((a) => feriadosDe(a, base.fechaMovil.feriadosFijos));
  cfg.campanaPropia = anios.map((a) => ({ desde: lunesDesde(`${a}-01-05`), hasta: sumarDias(lunesDesde(`${a}-01-05`), 42) }));
  // la historia, corrida
  const promo = mover(base.fechaMovil.promo.desde);
  for (const p of cfg.web.paginas) if (p.desde) p.desde = mover(p.desde);
  const pagina = cfg.web.paginas.find((p) => p.id === base.fechaMovil.promo.pagina);
  pagina.ruta = `/promo-${nombreMes(promo)}`; pagina.nombre = `Promo de ${nombreMes(promo)}`;
  for (const x of cfg.sedes) if (x.abre) x.abre = mover(x.abre);
  for (const b of cfg.busquedas) if (b.aparece) b.aparece = mover(b.aparece);
  for (const k of cfg.palabrasClave) if (k.desde) k.desde = mover(k.desde);
  for (const lista of Object.values(cfg.campanas)) for (const c of lista) {
    if (c.id === base.fechaMovil.retoMeta) c.activa = anios.map(deEnero);
    else if (c.activa) c.activa = c.activa.map(([a, b]) => [mover(a), mover(b)]);
  }
  cfg.programatica.desde = mover(cfg.programatica.desde); cfg.programatica.hasta = mover(cfg.programatica.hasta);
  cfg.crm.contactoLento.desde = mover(cfg.crm.contactoLento.desde);
  cfg.crm.campanas = [
    ...anios.map((a) => ({ id: `reto-${a}`, nombre: `Reto de enero ${a}`, desde: deEnero(a)[0], hasta: deEnero(a)[1], ...base.fechaMovil.retoCrm })),
    ...cfg.crm.campanas.filter((c) => !c.id.startsWith('reto-')).map((c) => ({ ...c, desde: mover(c.desde), hasta: mover(c.hasta) })),
  ];
  cfg.fatigaMeta = { desde: mover(cfg.fatigaMeta.desde), hasta: mover(cfg.fatigaMeta.hasta) };
  cfg.cambiosCosto = cfg.cambiosCosto.map((k) => ({ ...k, desde: mover(k.desde) }));
  cfg.cambiosInteraccion = cfg.cambiosInteraccion.map((k) => ({ ...k, desde: mover(k.desde), texto: `las piezas nuevas de Meta llevan a ${pagina.ruta}` }));
  cfg.eventos = [
    ...anios.map((a) => ({ fecha: lunesDesde(`${a}-01-05`), tipo: 'campana', texto: `Reto de enero ${a}` })),
    ...cfg.eventos.filter((e) => e.tipo !== 'campana').map((e) => ({ ...e, fecha: mover(e.fecha) })),
  ].filter((e) => e.fecha >= desde && e.fecha <= corte);
  return cfg;
}
