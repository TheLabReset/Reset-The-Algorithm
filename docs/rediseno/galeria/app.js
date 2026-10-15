// Galería de opciones: cada bloque importante dibujado en dos o tres formas con la misma vista.
// Este archivo solo compone: las cifras y las lecturas vienen de armarVista; los umbrales, de la configuración.

import { CONFIG } from './muestra/configuracion.js';
import { generar } from './muestra/generador.js';
import { armarVista, PESOS_INDICE } from './muestra/vista.js';
import { numero, compacto, porcentaje, variacion, soles, rangoFechas, fecha, fechaSinAnio, mesLargo, mesAnio, diaSemanaLargo } from './muestra/formato.js';
import { linea, pequenosMultiplos, dumbbell, pendiente, bump, calorHoraDia, calendario, bala, barras, franja, dispersion, etapas, reticula, teselas, aluvial } from './formas.js';

// Período por defecto de la galería: el último mes cerrado contra el mismo mes del año anterior
const PERIODO = {
  desde: '2026-09-01', hasta: '2026-09-30',
  compararDesde: '2025-09-01', compararHasta: '2025-09-30',
  cohorteDesde: '2026-08-01', cohorteHasta: '2026-08-31',
};
const data = generar(CONFIG);
const v = armarVista(data, PERIODO);
const L = v.lecturas, P = v.periodo;
const marca = CONFIG.marca.nombre;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// ── Nombres del período, armados desde los filtros ──
const periodoTxt = rangoFechas(P.desde, P.hasta);
const periodoNombre = P.mesCompleto ? `${mesLargo(+P.hasta.slice(5, 7))} de ${P.hasta.slice(0, 4)}` : `del ${periodoTxt}`;
const compTxt = rangoFechas(P.compararDesde, P.compararHasta);
const compNombre = P.tipoComparacion === 'anio' ? 'un año antes' : `el ${compTxt}`;
const rotuloPeriodo = P.mesCompleto ? mesAnio(P.hasta.slice(0, 7)) : 'período';
const rotuloComp = P.mesCompleto && P.tipoComparacion === 'anio' ? mesAnio(P.compararHasta.slice(0, 7)) : 'comparación';
const cohorteTxt = rangoFechas(PERIODO.cohorteDesde, PERIODO.cohorteHasta);
const cohorteNombre = PERIODO.cohorteDesde.endsWith('-01') ? mesLargo(+PERIODO.cohorteDesde.slice(5, 7)) : `del ${cohorteTxt}`;

// ── Títulos calculados: dicen la lectura solo si el dato la sostiene; si no, caen al descriptivo ──
function tituloResultados() {
  const r = v.resultados;
  const base = P.mesCompleto ? `${mayuscula(periodoNombre)} cerró con ${numero(r.leads)} leads` : `${mayuscula(periodoNombre)} entraron ${numero(r.leads)} leads`;
  const parcial = r.diasParciales.length ? ` (sin contar ${r.diasParciales.length === 1 ? 'un día' : r.diasParciales.length + ' días'} con una fuente caída)` : '';
  if (r.cambio == null) return `${base}${parcial}; sin comparación: menos del 60 % de días medidos`;
  const porDia = r.mismoLargo ? '' : ' por día';
  if (Math.abs(r.cambio) < 3) return `${base}${parcial}, casi igual que ${compNombre} (${variacion(r.cambio)}${porDia})`;
  return `${base}${parcial}, ${variacion(r.cambio)}${porDia} contra ${compNombre}`;
}
function tituloCanales() {
  const a = L.canalQueRinde, s = L.sobreMeta;
  const partes = [];
  if (a) partes.push(`${a.nombre} trae el ${porcentaje(a.pctLeads)} de los leads con el ${porcentaje(a.pctInversion)} de la inversión`);
  if (s.length) partes.push(`${s.map((c) => c.nombre).join(' y ')} ${s.length === 1 ? 'está' : 'están'} sobre su meta de costo por lead`);
  return partes.length ? partes.join('; ') : 'Peso de cada canal en inversión y en leads';
}
function tituloEmbudo() {
  if (!v.embudo.cerrada) return `Etapas de los leads del ${cohorteTxt}: cohorte abierta, todavía faltan inscripciones por ocurrir`;
  const p = L.caidaEnPersonas;
  return `De cada 100 leads de ${cohorteNombre}, ${v.embudo.exclusivas[0].de100} se inscribieron; la mayor parte queda en «${p.nombre.toLowerCase()}» (${p.de100} de cada 100)`;
}
function tituloIndice() {
  const i = v.indice;
  const motor = [...i.componentes].filter((c) => c.aporte != null).sort((a, b) => b.aporte - a.aporte)[0];
  const base = `Índice de oportunidad: ${i.valor} de 100`;
  if (i.cambio == null) return `${base}. Lo sostiene ${motor.nombre.toLowerCase()}`;
  const d = i.cambio;
  const cmp = d === 0 ? 'igual que' : d > 0 ? `${d} puntos más que` : `${-d} puntos menos que`;
  return `${base}, ${cmp} al ${fechaSinAnio(P.fechaPrevioIndice)}. Lo sostiene ${motor.nombre.toLowerCase()}`;
}
function tituloSedes() {
  const partes = [];
  const s = L.sedeQueMasCrece;
  if (s) partes.push(`${s.nombre} es la sede que más crece (${variacion(s.cambio)} por día contra ${compNombre})`);
  L.sedesNuevas.forEach((n) => partes.push(`${n.nombre} abrió el ${fecha(n.abre)} y no tiene con qué compararse`));
  L.sedesSinAbrir.forEach((n) => partes.push(`${n.nombre} todavía no abría`));
  return partes.length ? mayuscula(partes.join('; ')) : 'Leads por sede';
}
function tituloConversacion() {
  const s = L.sovPropio;
  if (!s.sostenido) return `Participación en la conversación de ${marca} y de la competencia, ${s.meses} meses con data`;
  const t = s.sostenido;
  if (t.mejor3 !== t.peor3) return `${marca} alterna entre el puesto ${t.mejor3} y el ${t.peor3} de conversación en los últimos 3 meses; en ${mesLargo(+sovUltimo.mes.slice(5, 7))} quedó ${t.actual}.º`;
  if (s.sostenido.ahora < s.sostenido.antes) return `${marca} pasó del puesto ${s.sostenido.antes} al ${s.sostenido.ahora} en conversación entre gimnasios de Lima (mediana de los 3 primeros y los 3 últimos meses)`;
  return `${marca} se mantiene en el puesto ${t.ahora} de conversación entre gimnasios de Lima en los últimos 3 meses`;
}

// ── Piezas que cambian según el estado ──
const bandasCpl = (meta) => [...CONFIG.bandasCpl.map((b) => ({ hasta: meta * b.fraccion })), { hasta: Infinity }];
const zonas = [...new Set(CONFIG.sedes.map((s) => s.zona))];
const maxSedes = Math.max(...v.sedes.flatMap((s) => [s.leads ?? 0, s.leadsPrevio ?? 0]));
const notaSede = (s) => (s.estado === 'sin-abrir' ? `abre el ${fechaSinAnio(s.abre)}` : s.estado === 'abrio-en-el-periodo' ? `abrió el ${fechaSinAnio(s.abre)}` : s.estado === 'sin-anterior' ? 'sin año anterior' : null);
const menor = v.embudo.porCanal.reduce((a, b) => (b.leads < a.leads ? b : a));
const marcadosCalendario = CONFIG.eventos.filter((e) => e.fecha >= v.resultados.calendario[0].fecha && e.fecha <= CONFIG.corte);
const aporteExactoTotal = v.indice.componentes.reduce((s, c) => s + (c.aporte ?? 0), 0);
const sovUltimo = v.conversacion.meses.at(-1), sovPrimero = v.conversacion.meses[0];
const claseMarca = (m) => (m.propia ? 'p-0' : m.id === 'otros' ? 'g-4' : 'g-2');

const BLOQUES = [
  {
    id: 'resultados', capa: 'Capa 4 · Resultado', pregunta: '¿Cómo le fue al período?', titulo: tituloResultados(),
    sub: `Leads por día, ${periodoTxt}. En gris, ${compTxt}. Un día con una fuente caída corta la línea.`,
    opciones: [
      { nombre: 'Línea con el año anterior en gris', recomendada: true,
        dibujar: (w) => linea({ serie: v.resultados.serie, previa: v.resultados.seriePrevia, ancho: w, alto: Math.round(Math.min(260, w * 0.5)), formatoY: numero, eventos: v.resultados.eventos, etiqueta: 'Leads diarios del período y de la comparación' }),
        porque: 'Posición sobre una escala común: se ve el nivel y la forma, y la comparación está en el mismo eje. Rectas entre días: no inventa valores.',
        cuandoNo: 'Si el período tiene más de 120 días: el ruido diario tapa la tendencia y conviene semana.' },
      { nombre: 'Pequeños múltiplos por canal, eje común',
        dibujar: (w) => pequenosMultiplos({ paneles: v.resultados.porCanal.map((c) => ({ nombre: c.nombre, serie: c.serie, cambio: c.cambio == null ? 'sin comparación' : `${variacion(c.cambio)} por día` })), ancho: Math.max(140, Math.floor((w - 12) / 2)), alto: 84, formatoY: numero }),
        porque: 'Muestra qué canal explica el total sin apilar cuatro líneas en un gráfico.',
        cuandoNo: 'Si la pregunta es el total: obliga a sumar con la vista. Con eje común, los canales chicos se aplastan.' },
      { nombre: 'Calendario de 12 meses',
        dibujar: (w) => calendario({ dias: v.resultados.calendario, ancho: w, formato: numero, marcados: marcadosCalendario, etiqueta: 'Leads por día, últimos 12 meses' }),
        porque: 'Ubica días en un año: los eventos de la data van con marco y el día sin dato queda punteado.',
        cuandoNo: 'Para leer cifras o comparar dos períodos: el color no da magnitudes exactas.' },
    ],
  },
  {
    id: 'canales', capa: 'Capa 3 · Activación', pregunta: '¿Qué canal rinde más por sol invertido?', titulo: tituloCanales(),
    sub: `Participación en inversión y en leads, ${periodoTxt}, sobre los días que midieron todos los canales. Suman 100 por el método del mayor resto. Metas de costo por lead: supuestas para la muestra.`,
    opciones: [
      { nombre: 'Pesas: % de inversión contra % de leads', recomendada: true,
        dibujar: (w) => dumbbell({ filas: v.canales.map((c) => ({ nombre: c.nombre, a: c.pctInversion, b: c.pctLeads })), formato: (x) => porcentaje(x), max: 100, ancho: w, rotuloA: '○ % de la inversión', rotuloB: '% de los leads', etiqueta: 'Participación de cada canal en inversión y en leads' }),
        porque: 'La pregunta es una diferencia, y el largo entre los dos puntos es la diferencia. Se lee sin ejes.',
        cuandoNo: 'Si hay más de 8 canales, o si importa el costo absoluto y no el peso relativo.' },
      { nombre: 'Bala: costo por lead contra su meta',
        dibujar: (w) => bala({ filas: v.canales.map((c) => ({ nombre: c.nombre, valor: c.cpl, meta: c.metaCpl, bandas: bandasCpl(c.metaCpl) })), max: Math.ceil(Math.max(...v.canales.map((c) => Math.max(c.cpl, c.metaCpl))) / 10) * 10 + 10, ancho: w, formato: (x) => soles(x, 0), etiqueta: 'Costo por lead de cada canal contra su meta' }),
        porque: 'Cada canal contra su propia meta, con la meta dibujada y el estado escrito, no solo pintado.',
        cuandoNo: 'Si las metas no las fijó el cliente: una meta inventada es un dato inventado.' },
      { nombre: 'Dispersión: inversión contra costo por lead',
        dibujar: (w) => dispersion({ puntos: v.canales.map((c) => ({ nombre: c.nombre, x: c.inversion, y: c.cpl })), fx: (x) => `S/ ${compacto(x)}`, fy: (y) => soles(y), rx: 'inversión del período', ry: 'costo por lead', refY: v.resultados.cpl, ancho: w, alto: Math.round(Math.min(320, w * 0.62)), etiqueta: 'Inversión y costo por lead por canal' }),
        porque: 'Dos medidas por canal en un solo plano, con el costo por lead promedio como referencia.',
        cuandoNo: 'Con cuatro puntos es un gráfico grande para poca data: la tabla dice lo mismo.' },
    ],
  },
  {
    id: 'embudo', capa: 'Capa 4 · Resultado', pregunta: '¿Dónde se pierden los leads?', titulo: tituloEmbudo(),
    sub: `Cohorte de leads que entraron del ${cohorteTxt}, seguida hasta el ${fecha(CONFIG.corte)}. ${v.embudo.cerrada ? 'Cohorte cerrada: todas sus inscripciones ya pudieron ocurrir.' : 'Cohorte abierta: las cifras van a crecer.'}`,
    opciones: [
      { nombre: 'Etapas desde una base común', recomendada: true,
        dibujar: (w) => etapas({ filas: v.embudo.etapas.map((e) => ({ nombre: { leads: 'Leads', contactos: 'Contactados', citas: 'Agendaron visita', asisten: 'Fueron', altas: 'Se inscribieron' }[e.id], valor: e.valor })), ancho: w, etiqueta: `Etapas de la cohorte de ${cohorteNombre}` }),
        porque: 'Largo desde una base común: se compara cada etapa con la primera y con la anterior, que va rotulada.',
        cuandoNo: 'Si las etapas no son de la misma cohorte: entonces una etapa puede ser más grande que la anterior y la forma miente.' },
      { nombre: 'Retícula de 100',
        dibujar: (w) => reticula({ partes: v.embudo.exclusivas.map((e) => ({ nombre: e.nombre, valor: e.valor })), lado: Math.max(16, Math.min(24, Math.floor((w - 8) / 10 / 1.6))), etiqueta: `De cada 100 leads de ${cohorteNombre}, dónde terminó cada uno` }),
        porque: `Cuenta en personas: «${v.embudo.exclusivas[0].de100} de cada 100» se recuerda mejor que «${porcentaje(v.embudo.tasaAlta * 100, 1)}». Los cinco destinos son excluyentes y suman 100.`,
        cuandoNo: 'Si la parte que importa es menor a 1 de cada 100: desaparece.' },
      { nombre: 'Aluvial: de canal a destino',
        dibujar: (w) => (v.embudo.cerrada
          ? aluvial({ origenes: v.embudo.porCanal.map((c) => ({ nombre: c.nombre, destinos: c.destinos })), destinos: v.embudo.exclusivas.map((e) => ({ id: e.id, nombre: e.nombre })), ancho: w, alto: Math.round(Math.min(320, w * 0.6)), etiqueta: `Recorrido de los leads de ${cohorteNombre}, de canal a destino` })
          : '<p class="nota-estado">Cohorte abierta: el aluvial no se dibuja hasta que todas las inscripciones puedan haber ocurrido.</p>'),
        porque: 'Es honesto solo con la cohorte cerrada, porque cada cinta es un conteo real. Es el momento «no lo había visto» del bloque.',
        cuandoNo: `Con cohorte abierta, o para comparar tasas entre canales: ${menor.nombre} tiene ${numero(menor.leads)} leads y su tasa es ruido.` },
    ],
  },
  {
    id: 'indice', capa: 'Capa 2 · Decisión', pregunta: '¿Es buen momento para invertir?', titulo: tituloIndice(),
    sub: `Índice de 0 a 100, suma ponderada de ${PESOS_INDICE.length} componentes medidos al ${fecha(P.hasta)}. Lectura del modelo. Bandas de lectura supuestas para la muestra.`,
    opciones: [
      { nombre: 'Bala de 0 a 100 con aportes', recomendada: true,
        dibujar: (w) => bala({ filas: [{ nombre: 'Índice', valor: v.indice.valor, meta: v.indice.previo ?? v.indice.valor, rotuloMarca: v.indice.previo == null ? '' : fechaSinAnio(P.fechaPrevioIndice), bandas: CONFIG.bandasIndice }], max: 100, menosEsMejor: null, ancho: w, formato: (x) => numero(x), etiqueta: 'Índice de oportunidad contra el día anterior al período' })
          + franja({ partes: v.indice.componentes.map((c, i) => ({ nombre: c.nombre, valor: c.aporte ?? 0, pct: null, clase: `p-${i}` })), ancho: w, etiqueta: 'Aporte de cada componente al índice' })
          + `<ul class="aportes">${v.indice.componentes.map((c, i) => `<li><span class="muestra p-${i}"></span>${esc(c.nombre)} <b>${c.aporte == null ? 'sin dato' : numero(c.aporte, 1)}</b><span class="nota"> · puntaje ${c.puntaje == null ? 'sin dato' : numero(c.puntaje)} × peso ${porcentaje(c.pesoEfectivo * 100)}</span></li>`).join('')}<li class="nota">Suman ${numero(aporteExactoTotal, 1)}, que se redondea a ${v.indice.valor}.</li></ul>`,
        porque: 'Escala lineal en lugar de un medidor: el largo se compara con precisión, la raya es el valor anterior y los aportes muestran qué lo mueve.',
        cuandoNo: 'Si el cliente no entiende que es una lectura del modelo: entonces va con la palabra «sugerencia» y su fecha.' },
      { nombre: 'Línea de 12 meses',
        dibujar: (w) => linea({ serie: v.indice.historia.map((h) => ({ fecha: h.fecha, valor: h.valor })), ancho: w, alto: Math.round(Math.min(220, w * 0.45)), formatoY: numero, etiqueta: 'Índice de oportunidad al cierre de cada mes' }),
        porque: 'Pone el valor de hoy en sus 12 meses. Un mes con algún componente sin medir no se dibuja junto a los completos.',
        cuandoNo: 'Si la pregunta es qué lo mueve: la línea no muestra componentes.' },
      { nombre: 'Puntaje de cada componente',
        dibujar: (w) => barras({ filas: v.indice.componentes.map((c) => ({ nombre: c.nombre, valor: c.puntaje == null ? null : Math.round(c.puntaje) })), max: 100, ancho: w, formato: (x) => `${numero(x)} de 100`, etiqueta: 'Puntaje de cada componente' }),
        porque: 'Muestra dónde está fuerte o débil cada componente, sin el peso.',
        cuandoNo: 'Si se lee como contribución: un puntaje alto con poco peso aporta poco. Hay que escribirlo.' },
    ],
  },
  {
    id: 'sedes', capa: 'Capa 3 · Activación', pregunta: '¿Qué sede crece?', titulo: tituloSedes(),
    sub: `Leads por sede, ${periodoTxt}. La raya marca ${compTxt}. Todas las zonas en la misma escala.`,
    opciones: [
      { nombre: 'Lista ordenada por zona', recomendada: true,
        dibujar: (w) => {
          const margen = Math.min(Math.round(w * 0.45), 14 + Math.ceil(Math.max(...v.sedes.map((s) => s.nombre.length)) * 6.9));
          return zonas.map((z) => `<p class="grupo">${esc(z)}</p>` + barras({ filas: v.sedes.filter((s) => s.zona === z).sort((a, b) => (b.leads ?? -1) - (a.leads ?? -1)).map((s) => ({ nombre: s.nombre, valor: s.leads, previo: s.leadsPrevio, nota: notaSede(s) })), max: maxSedes, margen, margenDer: v.sedes.some((s) => notaSede(s)) ? 150 : 70, ancho: w, formato: (x) => numero(x), etiqueta: `Leads por sede en ${z}` })).join('');
        },
        porque: 'Largo sobre una escala común a las tres zonas, ordenado: la sede que más pesa arriba. La zona agrupa sin un mapa que distorsione por superficie.',
        cuandoNo: 'Si la pregunta es de cercanía entre sedes (canibalización): ahí sí hace falta ubicación.' },
      { nombre: 'Teselas de distritos',
        dibujar: (w) => teselas({ items: v.sedes.map((s) => ({ nombre: s.nombre, corto: s.corto, col: s.col, fila: s.fila, valor: s.leads, cambio: s.cambio, nota: notaSede(s) })), lado: Math.min(96, Math.floor(w / 4)), formato: numero, etiqueta: 'Leads por sede ubicados por distrito' }),
        porque: 'Ubica Lima Norte, Moderna y Este con teselas iguales: ningún distrito pesa más por su superficie.',
        cuandoNo: 'Si la posición se lee como mapa exacto: no lo es, y conviene decirlo.' },
      { nombre: 'Pesas: antes contra ahora',
        dibujar: (w) => dumbbell({ filas: v.sedes.filter((s) => s.leadsPrevio != null && s.leads != null).sort((a, b) => b.leads - a.leads).map((s) => ({ nombre: s.nombre, a: s.leadsPrevio, b: s.leads })), formato: numero, ancho: w, rotuloA: `○ ${rotuloComp}`, rotuloB: rotuloPeriodo, etiqueta: 'Leads por sede, antes y ahora' }),
        porque: 'El cambio de cada sede es el largo entre los puntos.',
        cuandoNo: 'Las sedes nuevas no tienen punto anterior: quedan fuera y hay que decirlo al pie.' },
    ],
  },
  {
    id: 'conversacion', capa: 'Capa 1 · Señales', pregunta: '¿Cómo va la conversación contra la competencia?', titulo: tituloConversacion(),
    sub: 'Participación mensual en la conversación en redes (share of voice), entre gimnasios de Lima. Marcas reales con data de muestra: solo menciones, sin sentimiento ni juicios.',
    muestra: true,
    opciones: [
      { nombre: 'Pendiente: hace un año contra ahora', recomendada: true,
        dibujar: (w) => pendiente({ filas: sovPrimero.marcas.filter((m) => m.id !== 'otros').map((m) => ({ nombre: m.nombre, a: m.pct, b: sovUltimo.marcas.find((x) => x.id === m.id).pct })), formato: (x) => porcentaje(x), rotuloA: mesAnio(sovPrimero.mes), rotuloB: mesAnio(sovUltimo.mes), ancho: w, alto: 260, resaltar: [marca], etiqueta: 'Participación en la conversación, primer y último mes' }),
        porque: 'Dos momentos, una escala: quién sube y quién baja se ve por la pendiente, con su cifra, sin el zigzag del mes a mes.',
        cuandoNo: 'Si importa lo que pasó en el medio: la pendiente lo esconde.' },
      { nombre: 'Puestos mes a mes',
        dibujar: (w) => bump({ series: v.conversacion.ranking, semanas: v.conversacion.meses.map((m) => m.mes + '-01'), ancho: w, alto: 230, etiqueta: 'Puesto de cada marca en conversación, por mes' }),
        porque: 'Muestra el puesto mes a mes. Mensual y no semanal: con semanas, el ruido cruza las líneas.',
        cuandoNo: 'Cuando dos marcas están casi empatadas: el puesto cambia por un punto y la línea zigzaguea sin un cambio real.' },
      { nombre: 'Franja del último mes',
        dibujar: (w) => franja({ partes: sovUltimo.marcas.map((m) => ({ nombre: m.nombre, valor: m.menciones, pct: m.pct, clase: claseMarca(m) })), ancho: w, leyenda: true, etiqueta: 'Participación en la conversación del último mes' }),
        porque: 'Partes de un todo que suman 100 con «Otros» incluido; solo la marca propia va en color.',
        cuandoNo: 'Para ver cambio en el tiempo, que es la pregunta del bloque.' },
    ],
  },
];

// ── Pintado ──
const raiz = document.getElementById('bloques');
raiz.innerHTML = BLOQUES.map((b) => `
  <section class="bloque" id="${b.id}" aria-labelledby="t-${b.id}">
    <header class="bloque-cab">
      <p class="capa">${esc(b.capa)}</p>
      <h2 id="t-${b.id}">${esc(b.pregunta)}</h2>
      <p class="titulo-calculado">${esc(b.titulo)}</p>
      <p class="sub">${esc(b.sub)}${b.muestra ? ' <span class="chip-muestra">Dato de muestra</span>' : ''}</p>
    </header>
    <div class="opciones">
      ${b.opciones.map((o, i) => `
        <article class="opcion${o.recomendada ? ' recomendada' : ''}">
          <h3><span class="letra">${'ABC'[i]}</span> ${esc(o.nombre)}${o.recomendada ? ' <span class="chip-rec">Recomendada</span>' : ''}</h3>
          <div class="lienzo" data-bloque="${b.id}" data-opcion="${i}"></div>
          <dl><dt>Por qué</dt><dd>${esc(o.porque)}</dd><dt>Cuándo no</dt><dd>${esc(o.cuandoNo)}</dd></dl>
        </article>`).join('')}
    </div>
  </section>`).join('');

// Mapa de calor: un solo bloque, sin alternativas fuertes
const pico = L.horaPico;
document.getElementById('extra').innerHTML = `
  <section class="bloque" id="hora" aria-labelledby="t-hora">
    <header class="bloque-cab">
      <p class="capa">Capa 3 · Activación</p>
      <h2 id="t-hora">¿A qué hora entra el lead?</h2>
      <p class="titulo-calculado">En promedio, la hora con más leads es el ${diaSemanaLargo(pico.dia)} a las ${pico.hora} h, con ${numero(pico.v, 1)} leads</p>
      <p class="sub">Promedio de leads por hora para cada día de la semana, ${periodoTxt}; un mes tiene 4 o 5 de cada día, por eso se promedia y no se suma. Un solo tono, de menos a más. Sin alternativa: líneas por día o barras por franja piden más espacio para decir lo mismo.</p>
    </header>
    <div class="lienzo ancho" data-extra="hora"></div>
  </section>`;

function pintar() {
  document.querySelectorAll('.lienzo[data-bloque]').forEach((el) => {
    const w = Math.max(280, Math.floor(el.clientWidth));
    const b = BLOQUES.find((x) => x.id === el.dataset.bloque);
    el.innerHTML = b.opciones[+el.dataset.opcion].dibujar(w);
  });
  const h = document.querySelector('[data-extra="hora"]');
  h.innerHTML = calorHoraDia({ matriz: v.horaDia, horas: Array.from({ length: 24 }, (_, i) => i), ancho: Math.max(320, h.clientWidth - 32), formato: (x) => numero(x, 1), etiqueta: 'Promedio de leads por hora y día de la semana' });
}
pintar();
let espera;
addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(pintar, 120); });

// ── Controles: tema e identidad ──
const html = document.documentElement;
function guardar(k, val) { try { localStorage.setItem(k, val); } catch { /* sin almacenamiento: no pasa nada */ } }
function leer(k) { try { return localStorage.getItem(k); } catch { return null; } }
function aplicar() {
  const id = leer('galeria-identidad') || 'a';
  html.dataset.identidad = id;
  document.querySelectorAll('[data-pone-identidad]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.poneIdentidad === id)));
  const tema = id === 'b' ? 'dark' : html.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.querySelectorAll('[data-pone-tema]').forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.poneTema === tema)); b.disabled = id === 'b'; });
  document.getElementById('nota-b').hidden = id !== 'b';
}
document.querySelectorAll('[data-pone-identidad]').forEach((b) => b.addEventListener('click', () => { guardar('galeria-identidad', b.dataset.poneIdentidad); aplicar(); }));
document.querySelectorAll('[data-pone-tema]').forEach((b) => b.addEventListener('click', () => { html.dataset.theme = b.dataset.poneTema; aplicar(); }));
aplicar();

document.getElementById('periodo').textContent = `${periodoTxt} contra ${compTxt}`;
document.getElementById('corte').textContent = fecha(CONFIG.corte);
document.getElementById('marca').textContent = marca;
