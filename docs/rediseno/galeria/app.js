// Galería de opciones: cada bloque importante dibujado en dos o tres formas con la misma vista.
// Este archivo solo compone: los números y las lecturas vienen de armarVista.

import { CONFIG } from './muestra/configuracion.js';
import { generar } from './muestra/generador.js';
import { armarVista } from './muestra/vista.js';
import { numero, compacto, porcentaje, variacion, soles, rangoFechas, fecha, mesCorto, mesLargo, diaSemanaLargo } from './muestra/formato.js';
import { linea, pequenosMultiplos, dumbbell, pendiente, bump, calorHoraDia, calendario, bala, barras, franja, dispersion, etapas, reticula, teselas, aluvial } from './formas.js';

const PERIODO = {
  desde: '2026-09-01', hasta: '2026-09-30',
  compararDesde: '2025-09-01', compararHasta: '2025-09-30',
  cohorteDesde: '2026-08-01', cohorteHasta: '2026-08-31',
};
const data = generar(CONFIG);
const v = armarVista(data, PERIODO);
const L = v.lecturas;
const marca = CONFIG.marca.nombre;
const periodoTxt = rangoFechas(PERIODO.desde, PERIODO.hasta);
const compTxt = rangoFechas(PERIODO.compararDesde, PERIODO.compararHasta);
const cohorteTxt = rangoFechas(PERIODO.cohorteDesde, PERIODO.cohorteHasta);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mesTxt = (aaaamm) => `${mesCorto(+aaaamm.slice(5))} ${aaaamm.slice(2, 4)}`;
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const mesDelPeriodo = mayuscula(mesLargo(+PERIODO.hasta.slice(5, 7)));
const mesAnterior = mesLargo(((+PERIODO.desde.slice(5, 7) + 10) % 12) + 1);
const mesCohorte = mesLargo(+PERIODO.cohorteDesde.slice(5, 7));
const eventosDelAnio = CONFIG.eventos.filter((e) => e.fecha > v.resultados.calendario[0].fecha).map((e) => `${e.texto.toLowerCase()} (${fecha(e.fecha).replace(/ de \d{4}$/, '')})`).join(', ');
const display = v.embudo.porCanal.reduce((a, b) => (b.leads < a.leads ? b : a));

// ── Títulos calculados: dicen la lectura solo si el dato la sostiene; si no, caen al descriptivo ──
function tituloResultados() {
  const r = v.resultados;
  if (r.cambio == null) return `Leads diarios, ${periodoTxt}`;
  if (Math.abs(r.cambio) < 3) return `${mesDelPeriodo} cerró con ${numero(r.leads)} leads, casi igual que un año antes (${variacion(r.cambio)})`;
  return `${mesDelPeriodo} cerró con ${numero(r.leads)} leads, ${variacion(r.cambio)} contra un año antes`;
}
function tituloCanales() {
  const a = L.canalQueRinde, b = L.canalQueNoRinde;
  if (a && b) return `${a.nombre} trae el ${porcentaje(a.pctLeads)} de los leads con el ${porcentaje(a.pctInversion)} de la inversión; ${b.nombre}, al revés`;
  if (a) return `${a.nombre} trae el ${porcentaje(a.pctLeads)} de los leads con el ${porcentaje(a.pctInversion)} de la inversión`;
  return 'Peso de cada canal en inversión y en leads';
}
const NOMBRE_ETAPA = { leads: 'lead', contactos: 'contacto', citas: 'cita', asisten: 'asistencia', altas: 'inscripción' };
function tituloEmbudo() {
  if (!v.embudo.cerrada) return `Etapas de los leads de ${cohorteTxt} (cohorte todavía abierta)`;
  return `De cada 100 leads de ${mesCohorte}, ${v.embudo.exclusivas[0].de100} se inscribieron; la mayor pérdida está entre ${NOMBRE_ETAPA[L.etapaConMasPerdida.de]} e ${NOMBRE_ETAPA[L.etapaConMasPerdida.a]}`;
}
function tituloIndice() {
  const i = v.indice, d = i.cambio;
  const motor = [...i.componentes].filter((c) => c.aporte != null).sort((a, b) => b.aporte - a.aporte)[0];
  return `Índice de oportunidad: ${i.valor} de 100, ${d === 0 ? 'igual que' : d > 0 ? `${d} puntos más que` : `${-d} puntos menos que`} en ${mesAnterior}. Lo sostiene ${motor.nombre.toLowerCase()}`;
}
function tituloSedes() {
  const s = L.sedeQueMasCrece, n = L.sedesNuevas;
  let t = s ? `${s.nombre} es la sede que más crece (${variacion(s.cambio)})` : 'Leads por sede';
  if (n.length) t += `; ${n.map((x) => x.nombre).join(' y ')} abrió este año y no tiene con qué compararse`;
  return t;
}
function tituloConversacion() {
  const s = L.sovPropio;
  if (s.rangoActual < s.rangoInicio) return `${marca} pasó del puesto ${s.rangoInicio} al ${s.rangoActual} en conversación entre gimnasios de Lima`;
  return `${marca} está en el puesto ${s.rangoActual} de conversación entre gimnasios de Lima`;
}

// ── Opciones por bloque: cada una dibuja al ancho real de su caja ──
const meses12 = v.conversacion.meses.map((m) => m.mes);
const BLOQUES = [
  {
    id: 'resultados', capa: 'Capa 4 · Resultado', pregunta: '¿Cómo le fue al período?', titulo: tituloResultados(),
    sub: `Leads por día, ${periodoTxt}. En gris, ${compTxt}.`,
    opciones: [
      { nombre: 'Línea con el año anterior en gris', recomendada: true,
        dibujar: (w) => linea({ serie: v.resultados.serie, previa: v.resultados.seriePrevia, ancho: w, alto: Math.round(Math.min(260, w * 0.5)), formatoY: numero, eventos: v.resultados.eventos, etiqueta: 'Leads diarios del período y del mismo tramo del año anterior' }),
        porque: 'Posición sobre una escala común: se ve el nivel y la forma, y la comparación está en el mismo eje. Rectas entre días: no inventa valores.',
        cuandoNo: 'Si el período tiene más de 120 días: el ruido diario tapa la tendencia y conviene semana.' },
      { nombre: 'Small multiples por canal, eje común',
        dibujar: (w) => pequenosMultiplos({ paneles: v.resultados.porCanal.map((c) => ({ nombre: c.nombre, serie: c.serie, cambio: variacion(c.cambio), tono: '' })), ancho: Math.max(140, Math.floor((w - 12) / 2)), alto: 84, formatoY: numero }),
        porque: 'Muestra qué canal explica el total sin apilar cuatro líneas en un gráfico.',
        cuandoNo: 'Si la pregunta es el total: obliga a sumar con la vista. Con eje común, los canales chicos se aplastan.' },
      { nombre: 'Calendario de 12 meses',
        dibujar: (w) => calendario({ dias: v.resultados.calendario, ancho: w, formato: numero, etiqueta: 'Leads por día, últimos 12 meses' }),
        porque: `Ubica días en un año: feriados y eventos de la data (${eventosDelAnio}).`,
        cuandoNo: 'Para leer cifras o comparar dos períodos: el color no da magnitudes exactas.' },
    ],
  },
  {
    id: 'canales', capa: 'Capa 3 · Activación', pregunta: '¿Qué canal rinde más por sol invertido?', titulo: tituloCanales(),
    sub: `Participación en inversión y en leads, ${periodoTxt}. Suman 100 por el método del mayor resto.`,
    opciones: [
      { nombre: 'Dumbbell: % de inversión contra % de leads', recomendada: true,
        dibujar: (w) => dumbbell({ filas: v.canales.map((c) => ({ nombre: c.nombre, a: c.pctInversion, b: c.pctLeads })), formato: (x) => porcentaje(x), max: 100, ancho: w, rotuloA: '○ % de la inversión', rotuloB: '% de los leads', etiqueta: 'Participación de cada canal en inversión y en leads' }),
        porque: 'La pregunta es una diferencia, y el largo de la barra entre los dos puntos es la diferencia. Se lee sin ejes.',
        cuandoNo: 'Si hay más de 8 canales, o si importa el costo absoluto y no el peso relativo.' },
      { nombre: 'Bullet: CPL contra su meta',
        dibujar: (w) => bala({ filas: v.canales.map((c) => ({ nombre: c.nombre, valor: c.cpl, meta: c.metaCpl, bandas: [{ hasta: c.metaCpl * 0.85 }, { hasta: c.metaCpl }, { hasta: 200 }] })), max: Math.ceil(Math.max(...v.canales.map((c) => Math.max(c.cpl, c.metaCpl))) / 10) * 10 + 10, ancho: w, formato: (x) => soles(x, 0), etiqueta: 'Costo por lead de cada canal contra su meta' }),
        porque: 'Cada canal contra su propia meta, con la meta dibujada y el estado escrito, no solo pintado.',
        cuandoNo: 'Si las metas no están fijadas por el cliente: una meta inventada es un dato inventado.' },
      { nombre: 'Dispersión: inversión contra CPL',
        dibujar: (w) => dispersion({ puntos: v.canales.map((c) => ({ nombre: c.nombre, x: c.inversion, y: c.cpl })), fx: (x) => compacto(x), fy: (y) => soles(y), rx: 'inversión del mes', ry: 'costo por lead', refY: v.resultados.cpl, ancho: w, alto: Math.round(Math.min(320, w * 0.62)), etiqueta: 'Inversión y costo por lead por canal' }),
        porque: 'Dos medidas por canal en un solo plano, con el CPL promedio como referencia.',
        cuandoNo: 'Con cuatro puntos es un gráfico grande para poca data: la tabla dice lo mismo.' },
    ],
  },
  {
    id: 'embudo', capa: 'Capa 4 · Resultado', pregunta: '¿Dónde se pierden los leads?', titulo: tituloEmbudo(),
    sub: `Cohorte de leads que entraron del ${cohorteTxt}, seguida hasta el ${fecha(CONFIG.corte)}. Cohorte cerrada: todas sus inscripciones ya pudieron ocurrir.`,
    opciones: [
      { nombre: 'Etapas desde una base común', recomendada: true,
        dibujar: (w) => etapas({ filas: v.embudo.etapas.map((e) => ({ nombre: { leads: 'Leads', contactos: 'Contactados', citas: 'Agendaron visita', asisten: 'Fueron', altas: 'Se inscribieron' }[e.id], valor: e.valor })), ancho: w, etiqueta: `Etapas de la cohorte de ${mesCohorte}` }),
        porque: 'Largo desde una base común: se compara cada etapa con la primera y con la anterior, que va rotulada.',
        cuandoNo: 'Si las etapas no son de la misma cohorte: entonces una etapa puede ser más grande que la anterior y la forma miente.' },
      { nombre: 'Retícula de 100',
        dibujar: (w) => reticula({ partes: v.embudo.exclusivas.map((e) => ({ nombre: e.nombre, valor: e.valor })), lado: Math.max(16, Math.min(24, Math.floor((w - 8) / 10 / 1.6))), etiqueta: `De cada 100 leads de ${mesCohorte}, dónde terminó cada uno` }),
        porque: 'Cuenta en personas: «8 de cada 100» se recuerda mejor que «8,2 %». Los cinco destinos son excluyentes y suman 100.',
        cuandoNo: 'Si la parte que importa es menor a 1 de cada 100: desaparece.' },
      { nombre: 'Aluvial: canal → destino',
        dibujar: (w) => aluvial({ origenes: v.embudo.porCanal.map((c) => ({ nombre: c.nombre, destinos: c.destinos })), destinos: v.embudo.exclusivas.map((e) => ({ id: e.id, nombre: e.nombre })), ancho: w, alto: Math.round(Math.min(320, w * 0.6)), etiqueta: `Recorrido de los leads de ${mesCohorte}, de canal a destino` }),
        porque: 'Es honesto aquí porque la cohorte está cerrada y cada cinta es un conteo real. Es el momento «no lo había visto» del bloque.',
        cuandoNo: `Con cohorte abierta (habría que agregar «aún en curso»), o para comparar tasas entre canales: ${display.nombre} tiene ${numero(display.leads)} leads y su tasa es ruido.` },
    ],
  },
  {
    id: 'indice', capa: 'Capa 2 · Decisión', pregunta: '¿Es buen momento para invertir?', titulo: tituloIndice(),
    sub: `Índice de 0 a 100, suma ponderada de cinco componentes medidos al ${fecha(PERIODO.hasta)}. Los aportes suman el índice. Lectura del modelo.`,
    opciones: [
      { nombre: 'Bullet 0 a 100 con aportes', recomendada: true,
        dibujar: (w) => bala({ filas: [{ nombre: 'Índice', valor: v.indice.valor, meta: v.indice.previo, rotuloMarca: mesAnterior, bandas: [{ hasta: 40 }, { hasta: 70 }, { hasta: 100 }] }], max: 100, menosEsMejor: null, ancho: w, formato: (x) => numero(x), etiqueta: 'Índice de oportunidad contra el mes anterior' })
          + franja({ partes: v.indice.componentes.filter((c) => c.aporte).map((c) => ({ nombre: c.nombre, valor: c.aporte })), ancho: w, formato: () => '', etiqueta: 'Aporte de cada componente al índice' })
          + `<ul class="aportes">${v.indice.componentes.map((c, i) => `<li><span class="muestra p-${i}"></span>${esc(c.nombre)} <b>${c.aporte ?? 'no medido'}</b><span class="nota"> · puntaje ${c.puntaje ?? 'sin dato'} × peso ${porcentaje(c.pesoEfectivo * 100)}</span></li>`).join('')}</ul>`,
        porque: 'Escala lineal en lugar de un medidor: el largo se compara con precisión, la marca es el mes anterior y los aportes muestran qué lo mueve.',
        cuandoNo: 'Si el cliente no entiende que es una lectura del modelo: entonces va con la palabra «sugerencia» y su fecha.' },
      { nombre: 'Línea de 12 meses',
        dibujar: (w) => linea({ serie: v.indice.historia.map((h) => ({ fecha: h.fecha, valor: h.valor })), ancho: w, alto: Math.round(Math.min(220, w * 0.45)), formatoY: numero, etiqueta: 'Índice de oportunidad mensual' }),
        porque: 'Pone el valor de hoy en su historia: enero alto, invierno bajo.',
        cuandoNo: 'Si la pregunta es qué lo mueve: la línea no muestra componentes.' },
      { nombre: 'Componentes con su puntaje',
        dibujar: (w) => barras({ filas: v.indice.componentes.map((c) => ({ nombre: c.nombre, valor: c.puntaje ?? 0 })), ancho: w, formato: (x) => `${numero(x)} de 100`, etiqueta: 'Puntaje de cada componente' }),
        porque: 'Muestra dónde está fuerte o débil cada componente, sin el peso.',
        cuandoNo: 'Si se lee como contribución: un puntaje alto con poco peso aporta poco. Hay que escribirlo.' },
    ],
  },
  {
    id: 'sedes', capa: 'Capa 3 · Activación', pregunta: '¿Qué sede crece?', titulo: tituloSedes(),
    sub: `Leads por sede, ${periodoTxt}. La raya marca ${compTxt}.`,
    opciones: [
      { nombre: 'Lista ordenada por zona', recomendada: true,
        dibujar: (w) => ['Lima Moderna', 'Lima Norte', 'Lima Este'].map((z) => `<p class="grupo">${z}</p>` + barras({ filas: v.sedes.filter((s) => s.zona === z).sort((a, b) => b.leads - a.leads).map((s) => ({ nombre: s.nombre, valor: s.leads, previo: s.leadsPrevio, nota: s.leadsPrevio == null ? `nueva, ${mesCorto(+s.abre.slice(5, 7))} ${s.abre.slice(2, 4)}` : null })), ancho: w, formato: (x) => numero(x), etiqueta: `Leads por sede en ${z}` })).join(''),
        porque: 'Largo sobre una escala común, ordenado: la sede que más pesa arriba. La zona agrupa sin un mapa que distorsione por superficie.',
        cuandoNo: 'Si la pregunta es de cercanía entre sedes (canibalización): ahí sí hace falta ubicación.' },
      { nombre: 'Teselas de distritos',
        dibujar: (w) => teselas({ items: v.sedes.map((s) => ({ nombre: s.nombre, corto: s.corto, col: s.col, fila: s.fila, valor: s.leads, cambio: s.cambio })), lado: Math.min(96, Math.floor(w / 4)), formato: numero, etiqueta: 'Leads por sede ubicados por distrito' }),
        porque: 'Ubica Lima Norte, Moderna y Este con teselas iguales: ningún distrito pesa más por su superficie.',
        cuandoNo: 'Si la posición se lee como mapa exacto: no lo es, y conviene decirlo.' },
      { nombre: 'Dumbbell: año anterior contra este año',
        dibujar: (w) => dumbbell({ filas: v.sedes.filter((s) => s.leadsPrevio != null).sort((a, b) => b.leads - a.leads).map((s) => ({ nombre: s.nombre, a: s.leadsPrevio, b: s.leads })), formato: numero, ancho: w, rotuloA: `○ ${mesTxt(PERIODO.compararHasta.slice(0, 7))}`, rotuloB: mesTxt(PERIODO.hasta.slice(0, 7)), etiqueta: 'Leads por sede, un año antes y ahora' }),
        porque: 'El cambio de cada sede es el largo entre los puntos.',
        cuandoNo: 'Las sedes nuevas no tienen punto anterior: quedan fuera y hay que decirlo al pie.' },
    ],
  },
  {
    id: 'conversacion', capa: 'Capa 1 · Señales', pregunta: '¿Cómo va la conversación contra la competencia?', titulo: tituloConversacion(),
    sub: 'Share of voice mensual en redes, entre gimnasios de Lima. Marcas reales con data de muestra: solo menciones, sin sentimiento ni juicios.',
    muestra: true,
    opciones: [
      { nombre: 'Slope: hace un año contra ahora', recomendada: true,
        dibujar: (w) => pendiente({ filas: v.conversacion.meses[0].marcas.filter((m) => m.id !== 'otros').map((m) => ({ nombre: m.nombre, a: m.pct, b: v.conversacion.meses.at(-1).marcas.find((x) => x.id === m.id).pct })), formato: (x) => porcentaje(x), rotuloA: mesTxt(meses12[0]), rotuloB: mesTxt(meses12.at(-1)), ancho: w, alto: 260, resaltar: [marca], etiqueta: 'Share of voice, primer y último mes' }),
        porque: 'Dos momentos, una escala: quién sube y quién baja se ve por la pendiente, con su cifra. El cruce con b2 se ve sin el zigzag del mes a mes.',
        cuandoNo: 'Si importa lo que pasó en el medio: el slope lo esconde.' },
      { nombre: 'Bump chart mensual',
        dibujar: (w) => bump({ series: v.conversacion.ranking, semanas: meses12.map((m) => m + '-01'), ancho: w, alto: 230, etiqueta: 'Puesto de cada marca en conversación, por mes' }),
        porque: 'Muestra el puesto mes a mes. Mensual y no semanal: con semanas, el ruido cruza las líneas.',
        cuandoNo: 'Cuando dos marcas están casi empatadas, como aquí: el puesto cambia por un punto y la línea zigzaguea sin que haya un cambio real.' },
      { nombre: 'Franja de proporción del mes',
        dibujar: (w) => franja({ partes: v.conversacion.meses.at(-1).marcas.map((m) => ({ nombre: m.nombre, valor: m.menciones })), ancho: w, leyenda: true, etiqueta: 'Share of voice del último mes' }),
        porque: 'Partes de un todo que suman 100 con «Otros» incluido.',
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
      <p class="titulo-calculado">El pico del período fue el ${diaSemanaLargo(pico.dia)} a las ${pico.hora} h, con ${numero(pico.v)} leads acumulados en esa hora</p>
      <p class="sub">Leads por hora y día de la semana, ${periodoTxt}. Un solo tono, de menos a más. Sin alternativa: las otras formas (líneas por día, barras por franja) piden más espacio para decir lo mismo.</p>
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
  h.innerHTML = calorHoraDia({ matriz: v.horaDia, horas: Array.from({ length: 24 }, (_, i) => i), ancho: Math.max(320, h.clientWidth), etiqueta: 'Leads por hora y día de la semana' });
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
  const tema = html.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.querySelectorAll('[data-pone-tema]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.poneTema === tema)));
  document.getElementById('nota-b').hidden = id !== 'b';
}
document.querySelectorAll('[data-pone-identidad]').forEach((b) => b.addEventListener('click', () => { guardar('galeria-identidad', b.dataset.poneIdentidad); aplicar(); }));
document.querySelectorAll('[data-pone-tema]').forEach((b) => b.addEventListener('click', () => { html.dataset.theme = b.dataset.poneTema; aplicar(); }));
aplicar();

document.getElementById('periodo').textContent = `${periodoTxt} contra ${compTxt}`;
document.getElementById('corte').textContent = fecha(CONFIG.corte);
document.getElementById('marca').textContent = marca;
