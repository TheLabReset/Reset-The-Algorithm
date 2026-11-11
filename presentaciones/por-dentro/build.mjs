// node build.mjs → por-dentro.html: «The Algorithm, por dentro» en un solo archivo, sin nada externo.
// La presentación sigue a una sola ficha (un día de una pieza de Fit Lab) desde la fuente hasta la pantalla. La ficha
// queda en primer plano; lo que cambia es el fondo y lo que le pasa a la ficha. Cada paso es un estado: ir a un paso es
// aplicar el estado base de la lámina y luego los pasos anteriores, así que avanzar, retroceder y saltar dan siempre
// la misma imagen. Todo lo que se ve sale del código de la maqueta (src/) con la data fija al 25 de octubre de 2026.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const leer = (f) => readFileSync(join(AQUI, f), "utf8");
const b64 = (f) => readFileSync(join(AQUI, f)).toString("base64");
const fuente = (familia, archivo, peso) => `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};font-display:block;src:url(data:font/woff2;base64,${b64("assets/" + archivo)}) format('woff2')}`;
const FUENTES = [
  fuente("Anton", "anton.woff2", "400"), fuente("Instrument Sans", "instrument.woff2", "400 700"), fuente("Space Grotesk", "grotesk.woff2", "300 700"),
  // las de Fit Lab, para que la ficha se vea como una tarjeta del panel
  fuente("Bricolage Grotesque", "bricolage.woff2", "200 800"), fuente("Atkinson Hyperlegible Next", "atkinson.woff2", "200 800"),
].join("\n");
const img = (f) => `data:image/${f.endsWith(".png") ? "png" : "jpeg"};base64,${b64("assets/" + f)}`;
const sinCierre = (t) => t.replace(/<\/(script)/gi, "<\\/$1");
const GSAP = sinCierre(leer("assets/gsap.min.js"));

// ── La ficha que seguimos y lo que dice el panel de ella (generar() con semilla 20260930, corte 25 oct 2026) ──
const FICHA = { fuente: "Google Ads", fecha: "25 oct 2026", nombre: "Rutina guiada · anuncio de búsqueda", campana: "FL | Search | Gimnasio por distrito", inversion: "$20,59", impresiones: "850", clics: "28", leads: "0" };
const SEMANA = [["19", "$25,32"], ["20", "$18,62"], ["21", "$21,87"], ["22", "$21,65"], ["23", "$20,83"], ["24", "$20,84"], ["25", "$20,59"]];
const NUEVA = { fuente: "Google Ads", fecha: "desde el 23 oct", nombre: "Plan anual · anuncio de búsqueda", campana: "FL | Search | Membresías Lima", inversion: "$56,17", leads: "8" };
const RIEL = ["Fuentes", "Llega", "Revisión", "Archivo", "Reglas", "Nuevo", "Pantalla", "Si falla", "Mañana"];

// ── Las láminas. pasos: listas de tramos [selector, propiedades, { dur, at, stagger, ease }] ──
const LAMINAS = [
  { id: "portada", tipo: "tinta", html: `<h1 class="marca">The Algorithm<small>por dentro</small></h1><p class="lead">Seguimos un dato desde que nace hasta que aparece en la pantalla.</p><span class="firma">The Lab by Reset · Inducción · noviembre de 2026</span>` },
  {
    id: "ficha", parada: 0,
    titulo: "Esta es la ficha que vamos a seguir.",
    lead: "Es un día de un anuncio de Fit Lab en Google Ads: cuánto se invirtió y qué trajo.",
    base: { "#ficha": { autoAlpha: 1, x: 0, y: 0, scale: 1 } },
    pasos: [[["#ficha .f-datos > div", { autoAlpha: 1, y: 0 }, { dur: 0.5, stagger: 0.15 }]]],
    pie: "Fit Lab es la marca de la maqueta. Sus cifras salen de la data de muestra, siempre las mismas.",
    tecnica: { archivo: "src/muestra/generador.js", codigo: `generar(CONFIG)  // semilla 20260930: la misma data cada vez\n// esta ficha: la pieza s-distritos-1, el 25 de octubre de 2026`, nota: "En la maqueta, el generador hace de fuente. Con un cliente real, cada fuente tiene su conector y entrega fichas con la misma forma." },
  },
  {
    id: "fuentes", parada: 1,
    titulo: "Cada fuente manda sus fichas.",
    lead: "Google Ads, Meta, TikTok, la web, el CRM y las búsquedas llegan al mismo lugar. Hoy seguimos una de Google Ads.",
    base: { "#ficha": { autoAlpha: 1 }, "#fuentes": { autoAlpha: 1 } },
    pasos: [[[".linea", { strokeDashoffset: 0 }, { dur: 1.1, stagger: 0.12 }], ["#fuentes .src", { autoAlpha: 1 }, { dur: 0.3, at: 0 }]]],
    pie: "Son fuentes de la maqueta de Fit Lab. Cada cliente conecta las suyas.",
    tecnica: { archivo: "src/muestra/configuracion.js", codigo: `canales: google (search, display), meta, tiktok\nweb (GA4) · cohortes (CRM) · busquedas (Google Trends)`, nota: "En producción, cada fuente tiene su conector con su llave (un token guardado en GitHub, nunca en el navegador)." },
  },
  {
    id: "llega", parada: 2,
    titulo: "Llega sola, cada madrugada.",
    lead: "A las 5:47 de Lima el panel trae lo nuevo de cada fuente. Nadie tiene que apretar nada.",
    base: { "#ficha": { autoAlpha: 0, y: -60 }, "#reloj": { autoAlpha: 1 }, "#noche": { autoAlpha: 0.94 }, "#aguja-m": { rotation: 180 }, "#aguja-h": { rotation: 345 } },
    pasos: [
      [["#aguja-m", { rotation: 2442 }, { dur: 3, ease: "power2.inOut" }], ["#aguja-h", { rotation: 533.5 }, { dur: 3, at: 0, ease: "power2.inOut" }]],
      [["#ficha", { autoAlpha: 1, y: 0 }, { dur: 0.9, ease: "back.out(1.4)" }], ["#noche", { autoAlpha: 0 }, { dur: 1.2, at: 0.2 }]],
      [["#toma-barra", { autoAlpha: 1, y: 0 }, { dur: 0.6 }]],
    ],
    pie: "En producción esto corre en GitHub Actions. En la maqueta, la data ya está: la barra dice de qué día es.",
    tecnica: { archivo: ".github/workflows/pipeline.yml (producción)", codigo: `schedule:\n  - cron: '47 10 * * *'   # 05:47 de Lima, todos los días\n  - cron: '47 9 * * 0'    # domingos: todo desde enero`, nota: "El minuto 47 es a propósito: GitHub atrasa los crones que caen en la hora en punto." },
  },
  {
    id: "revision", parada: 3,
    titulo: "Antes de guardarla, se revisa.",
    lead: "Son cinco cosas que pasan todos los días. Si falta la llave o falla una prueba, no se publica nada y queda la alerta.",
    base: { "#ficha": { autoAlpha: 1, x: -200 }, "#checks": { autoAlpha: 1 } },
    pasos: [[["#checks li", { autoAlpha: 1, x: 0 }, { dur: 0.45, stagger: 0.55 }], ["#checks .ok", { scale: 1, autoAlpha: 1 }, { dur: 0.35, stagger: 0.55, at: 0.2, ease: "back.out(2.4)" }]]],
    pie: "Los cinco son reales: los pasos del pipeline de producción y la forma en que se guarda la data.",
    tecnica: { archivo: "pipeline.yml · run-pipeline.mjs", codigo: `- name: Exigir el token     # sin llave, falla en rojo\n- name: Pruebas             # npm run prueba\nPIPELINE_WINDOW: '7'        # vuelve a leer 7 días\nmergeAlgorithm(…)           # reemplaza, no suma\n{ fecha, sinDato: true }    # un día sin datos`, nota: "Un proceso que no pudo hacer su trabajo no puede quedar en verde: por eso falla a la vista." },
  },
  {
    id: "archivo", parada: 4,
    titulo: "Se guarda siempre igual.",
    lead: "Cada día queda escrito con la misma forma, para que el panel sepa dónde buscar cada número.",
    base: { "#ficha": { autoAlpha: 1 }, "#ficha .f-giro": { rotationY: 0 } },
    pasos: [
      [["#ficha .f-giro", { rotationY: 180 }, { dur: 1.1, ease: "power2.inOut" }]],
      [["#pila", { autoAlpha: 1 }, { dur: 0.4 }], ["#ficha", { x: -10, y: -40, scale: 0.46 }, { dur: 1, at: 0.2, ease: "power2.inOut" }]],
    ],
    pie: "Por detrás, la ficha es este texto: la fecha y, por cada pieza, sus cifras del día.",
    tecnica: { archivo: "src/muestra/detalle.js → piezas.dias", codigo: `detallar(d).piezas.dias   // un objeto por día\n// la pieza se identifica por su id; sus cifras van adentro`, nota: "En producción, el mismo papel lo cumplen los archivos de public/data (algorithm.json y los demás)." },
  },
  {
    id: "reglas", parada: 5,
    titulo: "Se compara con reglas fijas.",
    lead: "El panel junta la semana y la mide con una regla que no cambia. Esta pieza gastó $150 en 7 días y no trajo leads.",
    base: { "#ficha": { autoAlpha: 1, y: -70 }, "#semana": { autoAlpha: 0 } },
    pasos: [
      [["#semana", { autoAlpha: 1 }, { dur: 0.3 }], ["#semana .dia:not(#dia-26)", { autoAlpha: 1, y: 0 }, { dur: 0.35, stagger: 0.1 }], ["#semana .suma", { autoAlpha: 1 }, { dur: 0.4, at: 1 }]],
      [["#regla", { autoAlpha: 1 }, { dur: 0.4 }], ["#regla .lleno", { scaleX: 1 }, { dur: 1.2, at: 0.2, ease: "power2.out" }]],
      [["#ficha .f-estado", { autoAlpha: 1, scale: 1 }, { dur: 0.5, ease: "back.out(2)" }]],
    ],
    pie: "Una pieza se juzga recién cuando gastó 3 veces lo que suele costar un lead en Search ($6,09 × 3 = $18,28).",
    tecnica: { archivo: "src/calculo/periodo.js · src/calculo/piezas.js", codigo: `periodoDe(cfg, { atajo: '7d' })   // 19 al 25 de octubre\nUMBRALES_PIEZAS = { diasAprendizaje: 7, vecesGasto: 3, vecesCostosa: 1.5 }\n// gastó $149,72, 0 leads → 'sin-leads'`, nota: "La frase «Gastó $150 en 7 días y no trajo leads» la arma src/textos/piezas.js con esas cifras: nadie la escribe a mano." },
  },
  {
    id: "nuevo", parada: 6,
    titulo: "Si es nueva, llega con su sello.",
    lead: "Lo que empezó en el período se marca y va primero. Esta pieza salió el 23 de octubre: todavía aprende, así que no se juzga.",
    base: { "#ficha": { autoAlpha: 1, x: -290, y: 0, scale: 0.8 }, "#ficha .f-estado": { autoAlpha: 1, scale: 1 }, "#ficha2": { autoAlpha: 0, x: 360, scale: 0.8 } },
    pasos: [[["#ficha2", { autoAlpha: 1, x: 230 }, { dur: 0.9, ease: "power3.out" }], ["#ficha2 .f-sello", { autoAlpha: 1, scale: 1, rotation: -4 }, { dur: 0.5, at: 0.7, ease: "back.out(2.4)" }]]],
    pie: "«Aprendizaje» es la regla oficial de las plataformas: una pieza con menos de 7 días todavía no se juzga.",
    tecnica: { archivo: "src/calculo/piezas.js · src/sistema/Componentes.jsx", codigo: `nueva = empezó dentro del período (o en los últimos 30 días)\nedad < diasAprendizaje (7) → 'aprendizaje'\n<SelloNuevo />  // la etiqueta «Nuevo», la misma en todo el panel`, nota: "El sello sale del catálogo de etiquetas: se ve igual en cualquier tabla y en cualquier cliente." },
  },
  {
    id: "pantalla", parada: 7,
    titulo: "Así llega a la pantalla.",
    lead: "La misma ficha, en su fila de la tabla de piezas, con su estado y su porqué.",
    base: { "#ficha": { autoAlpha: 0, x: -150, y: 40, scale: 0.6 }, "#toma-fila": { autoAlpha: 1, y: 0 }, "#anillo": { autoAlpha: 0 } },
    pasos: [
      [["#anillo", { autoAlpha: 1 }, { dur: 0.5 }]],
      [["#toma-nueva", { autoAlpha: 1, y: 0 }, { dur: 0.6 }]],
    ],
    pie: "Capturas de la maqueta de Fit Lab con la data al 25 de octubre.",
    tecnica: { archivo: "src/calculo/vista.js · src/pantallas/Piezas.jsx", codigo: `armarVista(data, filtros)   // la única puerta del cálculo\n<PiezasCapitulo />           // solo pinta lo que recibe`, nota: "Las pantallas no calculan nada: reciben cifras y frases ya armadas. Por eso se pueden probar." },
  },
  {
    id: "falla", parada: 8,
    titulo: "Si algo no llega, el panel lo dice.",
    lead: "Una fuente que no cargó aparece como aviso. Nunca como un cero.",
    base: { "#vacia": { autoAlpha: 1, y: 0 }, "#toma-caida": { autoAlpha: 0, y: 20 } },
    pasos: [[["#toma-caida", { autoAlpha: 1, y: 0 }, { dur: 0.6 }]]],
    pie: "La tarjeta es la de la maqueta cuando GA4 no carga: dice qué falló y no muestra números.",
    tecnica: { archivo: "src/calculo/vista.js · src/sistema/Componentes.jsx", codigo: `fuente.estado = 'no-cargo'   // o 'parcial' si faltan días\n<Bloque estado={…} />        // «La fuente no cargó»`, nota: "Un día sin registros es un hueco en el gráfico, no una caída a cero." },
  },
  {
    id: "manana", parada: 9,
    titulo: "Y mañana, otra vez.",
    lead: "Entra el día nuevo y se vuelven a leer los seis anteriores, por si la fuente corrigió algo. Todo, solo.",
    base: { "#ficha": { autoAlpha: 1, y: -70, scale: 0.86 }, "#ficha .f-estado": { autoAlpha: 1, scale: 1 }, "#semana": { autoAlpha: 1 }, "#semana .dia": { autoAlpha: 1, y: 0 }, "#semana .suma": { autoAlpha: 0 }, "#semana .tira": { x: 0 }, "#dia-26": { autoAlpha: 0 }, "#dia-19": { autoAlpha: 1 } },
    pasos: [[["#semana .tira", { x: -88 }, { dur: 1.2, ease: "power2.inOut" }], ["#dia-19", { autoAlpha: 0.25 }, { dur: 0.6, at: 0.2 }], ["#dia-26", { autoAlpha: 1 }, { dur: 0.6, at: 0.6 }], ["#semana .dia:not(#dia-19):not(#dia-26)", { autoAlpha: 0.45 }, { dur: 0.25, at: 0.9 }], ["#semana .dia:not(#dia-19):not(#dia-26)", { autoAlpha: 1 }, { dur: 0.4, at: 1.2 }]]],
    pie: "Los domingos se repasa todo desde enero.",
    tecnica: { archivo: "pipeline.yml (producción)", codigo: `PIPELINE_WINDOW: '7'   # cada día: los últimos 7, incluido hoy\nINCREMENTAL: merge idempotente sobre lo que ya estaba`, nota: "Si un día la fuente no responde, se reintenta a los 3 y a los 10 segundos; si igual falla, queda la alerta." },
  },
  {
    id: "resumen", parada: 10,
    titulo: "El viaje, en una línea.",
    lead: "Esto pasa con cada ficha, de cada fuente, todos los días.",
    base: { "#resumen": { autoAlpha: 1 }, "#resumen li": { autoAlpha: 0, y: 12 } },
    pasos: [[["#resumen li", { autoAlpha: 1, y: 0 }, { dur: 0.4, stagger: 0.18 }]]],
    pie: "Con la tecla T, cada lámina muestra el archivo y el código de lo que se ve.",
    tecnica: { archivo: "dónde está cada cosa (maqueta)", codigo: `src/muestra/    de dónde sale la data\nsrc/calculo/    las reglas y el período\nsrc/textos/     las frases\nsrc/pantallas/  lo que se ve\nsrc/sistema/    el diseño (Quincha, etiquetas)\npruebas/        los controles`, nota: "Las guías: docs/guia-algoritmo.md, docs/quincha.md y docs/guia-rapida.md." },
  },
];
const ESCENAS = LAMINAS.filter((l) => l.tipo !== "tinta");

// Lo que vuelve a su lugar en cada lámina, salvo que la lámina diga otra cosa
const RESET = {
  "#ficha": { autoAlpha: 0, x: 0, y: 0, scale: 1, rotation: 0 },
  "#ficha .f-giro": { rotationY: 0 },
  "#ficha .f-datos > div": { autoAlpha: 1, y: 0 },
  "#ficha .f-estado": { autoAlpha: 0, scale: 0.9 },
  "#ficha2": { autoAlpha: 0, x: 360, scale: 0.8 },
  "#ficha2 .f-sello": { autoAlpha: 0, scale: 1.6, rotation: -14 },
  "#fuentes": { autoAlpha: 0 }, "#fuentes .src": { autoAlpha: 0.55 }, ".linea": { strokeDashoffset: 1 },
  "#reloj": { autoAlpha: 0 }, "#noche": { autoAlpha: 0 }, "#aguja-m": { rotation: 282 }, "#aguja-h": { rotation: 173.5 },
  "#toma-barra": { autoAlpha: 0, y: 16 },
  "#checks": { autoAlpha: 0 }, "#checks li": { autoAlpha: 0, x: -14 }, "#checks .ok": { autoAlpha: 0, scale: 0.4 },
  "#pila": { autoAlpha: 0 },
  "#semana": { autoAlpha: 0 }, "#semana .dia": { autoAlpha: 0, y: 10 }, "#semana .suma": { autoAlpha: 0 }, "#semana .tira": { x: 0 }, "#dia-26": { autoAlpha: 0 }, "#dia-19": { autoAlpha: 1 },
  "#regla": { autoAlpha: 0 }, "#regla .lleno": { scaleX: 0 },
  "#toma-fila": { autoAlpha: 0, y: 20 }, "#anillo": { autoAlpha: 0 }, "#toma-nueva": { autoAlpha: 0, y: 20 },
  "#vacia": { autoAlpha: 0, y: 20 }, "#toma-caida": { autoAlpha: 0, y: 20 },
  "#resumen": { autoAlpha: 0 }, "#resumen li": { autoAlpha: 0, y: 12 },
};
// la primera lámina pinta los datos de la ficha uno por uno
LAMINAS[1].base["#ficha .f-datos > div"] = { autoAlpha: 0, y: 8 };

// ── La ficha, como una tarjeta del panel ──
const tarjeta = (f, { id, estado = "", sello = false, frente = true } = {}) => `
<div class="ficha" id="${id}"><div class="f-giro">
  <div class="f-cara">
    <div class="f-cab"><span class="f-fuente"><i class="g"></i>${f.fuente}</span><span class="f-fecha">${f.fecha}</span>${id === "ficha" ? `<span class="f-marca" title="La ficha que seguimos"></span>` : ""}</div>
    <h3>${f.nombre}</h3><p class="f-sub">${f.campana}</p>
    <dl class="f-datos">
      <div><dt>Inversión</dt><dd>${f.inversion}</dd></div>
      ${f.impresiones ? `<div><dt>Impresiones</dt><dd>${f.impresiones}</dd></div><div><dt>Clics</dt><dd>${f.clics}</dd></div>` : `<div><dt>Edad</dt><dd>3 días</dd></div>`}
      <div><dt>Leads</dt><dd>${f.leads}</dd></div>
    </dl>
    <div class="f-estado">${estado}</div>
    ${sello ? `<span class="f-sello">Nuevo</span>` : ""}
  </div>
  ${frente ? `<div class="f-dorso"><span class="f-arch">la ficha, por detrás</span><pre>{
  "fecha": "2026-10-25",
  "s-distritos-1-2026-10-12": {
    "inversion": 20.59,
    "impresiones": 850,
    "clics": 28,
    "leads": 0
  }
}</pre></div>` : ""}
</div></div>`;
const ETQ_SIN = `<span class="etq grave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></svg>Sin leads</span><span class="porque">Gastó $150 en 7 días y no trajo leads.</span>`;
const ETQ_APR = `<span class="etq neutro"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/></svg>Aprendizaje</span><span class="porque">Lleva 3 días publicada.</span>`;

// ── Las fuentes: seis píldoras que llegan a la ficha ──
const SRC = [["Google Ads", 290], ["Meta Ads", 400], ["TikTok Ads", 510], ["GA4 · la web", 620], ["CRM", 730], ["Google Trends", 840]];
const FICHA_IZQ = 1080, FICHA_Y = 520;
const fuentesSvg = `<svg class="lineas" viewBox="0 0 1920 1080" aria-hidden="true">${SRC.map(([, y], i) => `<path class="linea${i === 0 ? " fuerte" : ""}" pathLength="1" d="M ${975} ${y} C ${1030} ${y}, ${1010} ${FICHA_Y + (i - 2.5) * 22}, ${FICHA_IZQ} ${FICHA_Y + (i - 2.5) * 22}"/>`).join("")}</svg>`
  + SRC.map(([n, y], i) => `<span class="src${i === 0 ? " fuerte" : ""}" style="top:${y - 22}px">${n}</span>`).join("");

const CHECKS = [
  ["Trae su llave", "Sin la llave de la fuente, no entra nada."],
  ["El código pasa sus pruebas", "Antes de tocar la data."],
  ["Se leen otra vez los últimos 7 días", "La fuente corrige con días de atraso."],
  ["No se duplica", "Lo que ya estaba se reemplaza, no se suma."],
  ["Un día sin datos queda vacío", "Nunca como un cero."],
];

const css = `
${FUENTES}
:root{--papel:#FAF8F5;--tinta:#16181F;--arena:#F1EDE6;--linea:#E9E5DF;--blanco:#FFFFFF;--sec:#565D6B;--secD:#A7ACB6;--mut:#8A909C;--rojo:#ED002F;--rojoT:#B30024;
  --fl-empeora:#b51e17;--fl-empeora-suave:#f6e4e2;--fl-mejora:#0a7254;--fl-borde:#e4e4e0;--fl-texto2:#3d4048;--fl-texto3:#6b6e76;--fl-capitulo:#efefeb}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:var(--tinta)}
body{font-family:'Instrument Sans','Helvetica Neue',Arial,sans-serif;color:var(--tinta);-webkit-font-smoothing:antialiased}
button{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:6px}
#lienzo{position:fixed;left:50%;top:50%;width:1920px;height:1080px;transform-origin:0 0;background:var(--papel);overflow:hidden}
#lienzo.tinta{background:var(--tinta)}
.logo{position:absolute;left:96px;top:56px;width:58px;z-index:6}
.migas{position:absolute;right:96px;top:68px;font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);z-index:6}
/* ── el fondo que se mueve: palabras grandes y una trama de puntos ── */
#fondo{position:absolute;inset:0;pointer-events:none}
#trama{position:absolute;left:0;top:0;width:100%;height:100%;background-image:radial-gradient(circle,#dedad2 1.4px,transparent 1.6px);background-size:44px 44px;opacity:.75;-webkit-mask-image:linear-gradient(90deg,transparent 30%,#000 52%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent 30%,#000 52%,#000 92%,transparent)}
#palabras{position:absolute;left:0;top:150px;white-space:nowrap}
#palabras span{position:absolute;top:0;font-family:'Anton',Impact,sans-serif;font-size:260px;line-height:1;letter-spacing:.01em;text-transform:uppercase;color:transparent;-webkit-text-stroke:1.5px #e6e1d8}
#noche{position:absolute;inset:0;background:radial-gradient(120% 90% at 75% 30%,#262a35 0,#16181F 60%);z-index:2}
#reloj{position:absolute;left:800px;top:330px;width:240px;height:240px;z-index:3}
#reloj circle{fill:none;stroke:#5a6070;stroke-width:2}
#reloj .marcas line{stroke:#8A909C;stroke-width:2}
#reloj #aguja-m{stroke:#EDEFF2;stroke-width:3;stroke-linecap:round}
#reloj #aguja-h{stroke:#EDEFF2;stroke-width:5;stroke-linecap:round}
#reloj text{fill:#8A909C;font:600 14px 'Instrument Sans',sans-serif;letter-spacing:.16em}
/* ── el texto, a la izquierda ── */
.capa-texto{position:absolute;inset:0;opacity:0;visibility:hidden;z-index:5;pointer-events:none}
.tinta .capa-texto{color:var(--blanco)}
.portada{display:flex;flex-direction:column;justify-content:center;padding:0 96px;gap:28px;color:var(--blanco)}
.marca{font-family:'Anton',Impact,sans-serif;text-transform:uppercase;font-size:200px;line-height:.92;letter-spacing:.01em;margin:0}
.marca small{display:block;font-family:'Space Grotesk',sans-serif;text-transform:none;font-size:56px;font-weight:500;letter-spacing:-.01em;color:var(--secD);margin-top:18px}
.portada .lead{font-size:28px;line-height:1.5;color:var(--secD);max-width:40ch;margin:0}
.firma{position:absolute;left:96px;bottom:60px;font-size:15px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#7E8595}
.col{position:absolute;left:96px;top:168px;width:600px;display:flex;flex-direction:column;gap:26px}
.parada{font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.parada b{color:var(--tinta)}
.col h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:66px;line-height:1.04;letter-spacing:-.02em;margin:0;text-wrap:balance}
.col .lead{font-size:26px;line-height:1.5;color:var(--sec);margin:0;text-wrap:pretty}
.noche-on .col h2,.noche-on .parada b{color:var(--blanco)}
.noche-on .col .lead,.noche-on .parada{color:var(--secD)}
/* ── la ficha ── */
.ficha{position:absolute;left:${FICHA_IZQ}px;top:${FICHA_Y - 190}px;width:600px;height:380px;z-index:4;perspective:1600px;transform-origin:50% 50%}
.f-giro{position:relative;width:100%;height:100%;transform-style:preserve-3d}
.f-cara,.f-dorso{position:absolute;inset:0;border-radius:22px;background:var(--blanco);box-shadow:0 1px 2px rgba(22,24,31,.06),0 24px 60px rgba(22,24,31,.13),0 0 0 1px var(--fl-borde);-webkit-backface-visibility:hidden;backface-visibility:hidden;padding:30px 34px;display:flex;flex-direction:column;gap:10px}
.f-dorso{transform:rotateY(180deg);background:#1b1d24;color:#EDEFF2;gap:14px;box-shadow:0 24px 60px rgba(22,24,31,.22)}
.f-dorso pre{margin:0;font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:21px;line-height:1.5;color:#fff}
.f-arch{font-size:14px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rojo)}
.f-cab{display:flex;align-items:center;gap:12px;font-family:'Atkinson Hyperlegible Next',sans-serif;font-size:17px;color:var(--fl-texto3)}
.f-fuente{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--fl-texto2);border:1px solid var(--fl-borde);border-radius:8px;padding:3px 10px}
.f-fuente .g{width:10px;height:10px;border-radius:50%;background:#16181F}
.f-marca{margin-left:auto;width:16px;height:16px;border-radius:50%;background:var(--rojo);box-shadow:0 0 0 5px rgba(237,0,47,.14)}
.ficha h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:31px;line-height:1.15;margin:6px 0 0;letter-spacing:-.01em}
.f-sub{margin:0;font-family:'Atkinson Hyperlegible Next',sans-serif;font-size:17px;color:var(--fl-texto3)}
.f-datos{margin:14px 0 0;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-top:1px solid var(--fl-borde);padding-top:16px}
.f-datos dt{font-family:'Atkinson Hyperlegible Next',sans-serif;font-size:15px;color:var(--fl-texto3)}
.f-datos dd{margin:4px 0 0;font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:34px;font-variant-numeric:tabular-nums}
.f-estado{margin-top:auto;display:flex;align-items:center;gap:14px;font-family:'Atkinson Hyperlegible Next',sans-serif;transform-origin:0 50%}
.etq{display:inline-flex;align-items:center;gap:7px;font-weight:700;font-size:18px;border-radius:8px;padding:5px 12px}
.etq svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.etq.grave{background:var(--fl-empeora);color:#fff}
.etq.neutro{background:var(--fl-capitulo);color:var(--fl-texto2)}
.porque{font-size:18px;color:var(--fl-texto2)}
.f-sello{position:absolute;right:26px;top:24px;font-family:'Atkinson Hyperlegible Next',sans-serif;font-weight:700;font-size:17px;letter-spacing:.08em;text-transform:uppercase;background:var(--tinta);color:#fff;border-radius:8px;padding:4px 12px}
/* ── fuentes ── */
#fuentes{position:absolute;inset:0;z-index:3}
.lineas{position:absolute;inset:0;width:1920px;height:1080px}
.linea{fill:none;stroke:#cfcac0;stroke-width:2.5;stroke-dasharray:1;stroke-dashoffset:1}
.linea.fuerte{stroke:var(--tinta);stroke-width:3.5}
.src{position:absolute;left:760px;height:44px;display:inline-flex;align-items:center;padding:0 18px;border-radius:999px;background:var(--blanco);border:1.5px solid var(--linea);font-weight:600;font-size:18px;color:var(--sec);white-space:nowrap}
.src.fuerte{border-color:var(--tinta);color:var(--tinta)}
/* ── revisión ── */
#checks{position:absolute;left:1510px;top:300px;width:350px;margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:20px;z-index:4}
#checks li{display:grid;grid-template-columns:36px 1fr;gap:12px;align-items:start}
#checks .ok{width:32px;height:32px;border-radius:50%;background:var(--tinta);display:grid;place-items:center}
#checks .ok svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
#checks b{display:block;font-family:'Space Grotesk',sans-serif;font-size:20px;line-height:1.2}
#checks span{display:block;font-size:16px;line-height:1.4;color:var(--sec);margin-top:3px}
/* ── archivo: las fichas de otros días, apiladas ── */
#pila{position:absolute;left:1210px;top:420px;width:300px;height:200px;z-index:3}
#pila i{position:absolute;inset:0;border-radius:14px;background:#1b1d24;box-shadow:0 10px 30px rgba(22,24,31,.18)}
#pila span{position:absolute;left:0;top:236px;font-size:16px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
/* ── reglas: la semana y la regla ── */
#semana{position:absolute;left:${FICHA_IZQ - 40}px;top:${FICHA_Y + 160}px;width:700px;height:150px;z-index:4;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
#semana .tira{position:absolute;left:40px;top:10px;display:flex;gap:8px}
.dia{width:80px;height:84px;border-radius:12px;background:var(--blanco);border:1px solid var(--fl-borde);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;font-family:'Atkinson Hyperlegible Next',sans-serif}
.dia b{font-family:'Bricolage Grotesque',sans-serif;font-size:24px}
.dia span{font-size:15px;color:var(--fl-texto3);font-variant-numeric:tabular-nums}
.dia.hoy{border:2px solid var(--rojo)}
.dia.nuevo-dia{border:2px dashed var(--tinta)}
#semana .suma{position:absolute;left:40px;top:108px;font-size:19px;font-weight:600;color:var(--tinta)}
#regla{position:absolute;left:${FICHA_IZQ}px;top:${FICHA_Y + 320}px;width:600px;z-index:4}
#regla .barra{position:relative;height:16px;border-radius:999px;background:var(--arena)}
#regla .lleno{position:absolute;inset:0;border-radius:999px;background:var(--tinta);transform-origin:0 50%}
#regla .marca-regla{position:absolute;top:-10px;width:3px;height:36px;background:var(--rojo);border-radius:2px}
#regla .rot{display:flex;justify-content:space-between;margin-top:12px;font-size:17px;color:var(--sec)}
#regla .rot b{color:var(--tinta)}
/* ── pantalla: capturas reales ── */
.toma{position:absolute;z-index:4}
.toma img{display:block;width:100%;border-radius:14px;box-shadow:0 1px 2px rgba(22,24,31,.06),0 22px 60px rgba(22,24,31,.14)}
.toma p{margin:14px 0 0;font-size:17px;color:var(--sec)}
#toma-barra{left:${FICHA_IZQ - 60}px;top:${FICHA_Y + 205}px;width:720px}
#toma-fila{left:760px;top:250px;width:1100px}
#anillo{position:absolute;left:-10px;width:calc(100% + 20px);border:4px solid var(--rojo);border-radius:14px;pointer-events:none}
#toma-nueva{left:760px;top:760px;width:1100px}
#toma-caida{left:760px;top:640px;width:1100px}
/* ── si falla: una ficha vacía ── */
#vacia{position:absolute;left:${FICHA_IZQ}px;top:250px;width:600px;height:300px;border:3px dashed #c9c3b8;border-radius:22px;padding:30px 34px;display:flex;flex-direction:column;gap:12px;z-index:4;background:rgba(255,255,255,.5)}
#vacia .f-fuente{align-self:flex-start}
#vacia .rayas i{display:block;height:14px;border-radius:7px;background:var(--arena);margin-top:14px}
#vacia .rayas i:nth-child(1){width:70%}#vacia .rayas i:nth-child(2){width:45%}#vacia .rayas i:nth-child(3){width:85%}
#vacia p{margin:auto 0 0;font-size:20px;font-weight:600;color:var(--sec)}
/* ── resumen ── */
#resumen{position:absolute;left:96px;right:60px;top:520px;margin:0;padding:0;list-style:none;display:flex;gap:12px;flex-wrap:nowrap;z-index:4}
#resumen li{display:flex;align-items:center;gap:12px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px}
#resumen li .n{width:40px;height:40px;border-radius:50%;background:var(--tinta);color:var(--blanco);display:grid;place-items:center;font-size:18px}
#resumen li .f{color:#c9c3b8;font-weight:400}
/* ── el riel de las paradas ── */
#riel{position:absolute;left:96px;right:520px;bottom:96px;height:44px;z-index:6}
#riel .via{position:absolute;left:8px;right:8px;top:8px;height:2px;background:var(--linea)}
#riel .via i{position:absolute;left:0;top:0;height:2px;background:var(--tinta);width:0}
#riel ol{position:absolute;inset:0;margin:0;padding:0;list-style:none;display:flex;justify-content:space-between}
#riel li{display:flex;flex-direction:column;align-items:center;gap:8px;width:18px;font-size:13px;font-weight:600;letter-spacing:.04em;color:var(--mut);white-space:nowrap}
#riel li::before{content:"";width:18px;height:18px;border-radius:50%;background:var(--papel);border:2px solid var(--linea);transition:all .35s}
#riel li.paso::before{background:var(--tinta);border-color:var(--tinta)}
#riel li.aqui{color:var(--tinta)}
#riel li.aqui::before{background:var(--papel);border:5px solid var(--tinta)}
.noche-on #riel li{color:#6b7180}.noche-on #riel li.aqui{color:#fff}
/* ── capa técnica, pie y navegación ── */
.tecnica{position:absolute;left:72px;top:520px;width:640px;background:var(--tinta);color:#EDEFF2;border-radius:18px;padding:24px 28px;display:flex;flex-direction:column;gap:12px;z-index:7;opacity:0;visibility:hidden}
.tecnica .t{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rojo)}
.tecnica code{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:15px;line-height:1.6;white-space:pre-wrap;color:#fff;display:block}
.tecnica .arch{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:14px;color:var(--secD)}
.tecnica p{margin:0;font-size:16px;line-height:1.5;color:var(--secD)}
.pie{position:absolute;left:96px;right:520px;bottom:40px;font-size:15px;line-height:1.45;color:var(--mut);z-index:6}
.noche-on .pie{color:#6b7180}
#nav{position:absolute;right:60px;bottom:36px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.85);border:1px solid var(--linea);border-radius:999px;padding:6px 8px;z-index:8}
.tinta #nav,.noche-on #nav{background:rgba(22,24,31,.6);border-color:#2A2E37;color:#EDEFF2}
#nav button{border:0;background:transparent;color:inherit;width:36px;height:36px;border-radius:50%;cursor:pointer;display:grid;place-items:center;font-size:18px}
#nav button:hover{background:rgba(127,127,127,.14)}
#nav .cont{font-family:'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;font-size:15px;min-width:74px;text-align:center}
#nav .t{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;width:auto;padding:0 12px;border-radius:999px}
#nav .t[aria-pressed="true"]{background:var(--tinta);color:var(--blanco)}
.progreso{position:absolute;left:0;top:0;height:4px;background:var(--rojo);width:0;z-index:9}
`;

const palabras = ["la ficha", "fuentes", "05:47", "revisión", "archivo", "reglas", "nuevo", "pantalla", "aviso", "mañana", "resumen"];
const html = `<title>The Algorithm, por dentro</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
<div id="lienzo" class="tinta" role="application" aria-roledescription="presentación" aria-label="The Algorithm, por dentro">
  <div class="progreso"></div>
  <div id="fondo" aria-hidden="true"><div id="trama"></div><div id="palabras">${palabras.map((p, i) => `<span style="left:${760 + i * 1500}px">${p}</span>`).join("")}</div></div>
  <div id="noche" aria-hidden="true"></div>
  <svg id="reloj" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="110"/><g class="marcas">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${120 + Math.sin(a) * 96}" y1="${120 - Math.cos(a) * 96}" x2="${120 + Math.sin(a) * 106}" y2="${120 - Math.cos(a) * 106}"/>`; }).join("")}</g><line id="aguja-h" x1="120" y1="120" x2="120" y2="64"/><line id="aguja-m" x1="120" y1="120" x2="120" y2="34"/><text x="120" y="172" text-anchor="middle">LIMA</text></svg>
  <img class="logo" alt="Reset" src="${img("reset-blanco.png")}" data-negro="${img("reset-negro.png")}" data-blanco="${img("reset-blanco.png")}">
  <div class="migas">El viaje de un dato</div>
  <div id="fuentes">${fuentesSvg}</div>
  <ol id="checks">${CHECKS.map(([a, b]) => `<li><span class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></span><div><b>${a}</b><span>${b}</span></div></li>`).join("")}</ol>
  <div id="pila" aria-hidden="true"><span>Un día, un archivo</span>${[0, 1, 2, 3].map((i) => `<i style="transform:translate(${i * 14}px,${-i * 12}px)"></i>`).join("")}</div>
  <div id="semana"><div class="tira">${SEMANA.map(([d, v]) => `<div class="dia${d === "25" ? " hoy" : ""}" id="dia-${d}"><b>${d}</b><span>${v}</span></div>`).join("")}<div class="dia nuevo-dia" id="dia-26"><b>26</b><span>nuevo</span></div></div><span class="suma">19 al 25 de octubre: $150 · 0 leads</span></div>
  <div id="regla"><div class="barra"><div class="lleno"></div><span class="marca-regla" style="left:${(18.28 / 149.72) * 100}%"></span></div><div class="rot"><span>Se juzga desde <b>$18</b></span><span>Gastó <b>$150</b> · <b>0 leads</b></span></div></div>
  ${tarjeta(FICHA, { id: "ficha", estado: ETQ_SIN })}
  ${tarjeta(NUEVA, { id: "ficha2", estado: ETQ_APR, sello: true, frente: false })}
  <div class="toma" id="toma-barra"><img alt="La barra del panel de Fit Lab: Datos al 25 de octubre" src="${img("panel-cabecera.jpg")}"><p>La barra del panel dice de qué día es la data.</p></div>
  <div class="toma" id="toma-fila"><img alt="La tabla de piezas: Rutina guiada, anuncio de búsqueda, Sin leads, $150, Gastó $150 en 7 días y no trajo leads" src="${img("panel-fila.jpg")}"><span id="anillo" style="top:${(300 / 660) * 1100 * (660 / 1948) - 6}px;height:${(124 / 660) * 1100 * (660 / 1948) + 12}px"></span></div>
  <div class="toma" id="toma-nueva"><img alt="La fila de la pieza nueva: Plan anual, con el sello Nuevo y el estado Aprendizaje" src="${img("panel-fila-nueva.jpg")}"><p>Y la pieza nueva, con su sello.</p></div>
  <div id="vacia"><span class="f-fuente"><i class="g"></i>GA4 · 25 oct</span><div class="rayas"><i></i><i></i><i></i></div><p>La ficha no llegó.</p></div>
  <div class="toma" id="toma-caida"><img alt="La tarjeta del panel: La fuente no cargó" src="${img("panel-caida.jpg")}"></div>
  <ol id="resumen">${["Llega", "Se revisa", "Se guarda", "Se compara", "Se marca", "Se ve", "Avisa", "Se repite"].map((p, i, a) => `<li><span class="n">${i + 1}</span>${p}${i < a.length - 1 ? `<span class="f">→</span>` : ""}</li>`).join("")}</ol>
  ${LAMINAS.map(texto).join("\n")}
  <div id="riel" aria-hidden="true"><div class="via"><i></i></div><ol>${RIEL.map((r) => `<li>${r}</li>`).join("")}</ol></div>
  <div class="tecnica" role="note"><span class="t">Capa técnica</span><span class="arch"></span><code></code><p></p></div>
  <div class="pie" aria-live="polite"></div>
  <nav id="nav" aria-label="Navegación">
    <button type="button" data-ir="-1" aria-label="Anterior">‹</button><span class="cont"></span><button type="button" data-ir="1" aria-label="Siguiente">›</button>
    <button type="button" class="t" aria-pressed="false" title="Capa técnica (T)">T</button><button type="button" class="pc" aria-label="Pantalla completa" title="Pantalla completa (F)">⛶</button>
  </nav>
</div>
<script>${GSAP}</script>
<script>
const LAMINAS = ${JSON.stringify(LAMINAS.map(({ id, tipo, parada, base, pasos, pie, tecnica }) => ({ id, tipo, parada, base, pasos, pie, tecnica })))};
const RESET = ${JSON.stringify(RESET)};
const N_RIEL = ${RIEL.length};
(${VIVO.toString()})();
</script>`;

function texto(l) {
  if (l.tipo === "tinta") return `<section class="capa-texto portada" data-lamina="${l.id}">${l.html}</section>`;
  const p = l.parada >= 1 && l.parada <= RIEL.length ? `Parada <b>${l.parada}</b> de ${RIEL.length}` : l.parada === 0 ? "Antes de salir" : "Al final";
  return `<section class="capa-texto" data-lamina="${l.id}"><div class="col"><span class="parada">${p}</span><h2>${l.titulo}</h2><p class="lead">${l.lead}</p></div></section>`;
}

// ── Lo que corre en la página ──
function VIVO() {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const lienzo = $("#lienzo");
  let SOLO = true; try { SOLO = window.self === window.top; } catch (e) { SOLO = false; }
  const encajar = () => { const k = Math.min(innerWidth / 1920, innerHeight / 1080); lienzo.style.transform = `translate(${-960 * k}px, ${-540 * k}px) scale(${k})`; };
  encajar(); addEventListener("resize", encajar);
  // el reloj gira desde su centro
  gsap.set(["#aguja-m", "#aguja-h"], { svgOrigin: "120 120" });

  const estadoDe = (l, n) => {
    const lam = LAMINAS[l], e = {};
    for (const [s, v] of Object.entries(RESET)) e[s] = { ...v };
    for (const [s, v] of Object.entries(lam.base || {})) e[s] = { ...(e[s] || {}), ...v };
    return { e, tramos: (lam.pasos || []).slice(0, n).flat() };
  };
  function fijar(l, n) {
    const { e, tramos } = estadoDe(l, n);
    for (const [s, v] of Object.entries(e)) gsap.set(s, v);
    for (const [s, v] of tramos) gsap.set(s, v);
  }
  let L = 0, paso = 0, tl = null, tecnica = false;
  const total = (l) => (LAMINAS[l].pasos || []).length;
  // si algo falla, se ve en una esquina en vez de dejar la lámina a medias
  const aviso = (err) => { let d = $("#falla-deck"); if (!d) { d = document.createElement("div"); d.id = "falla-deck"; d.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99;max-width:60vw;padding:8px 12px;border-radius:8px;background:#16181F;color:#EDEFF2;font:12px/1.4 monospace"; document.body.appendChild(d); } d.textContent = "Error en la lámina " + (L + 1) + ": " + (err && err.message ? err.message : err); };
  addEventListener("error", (e) => aviso(e.error || e.message));
  addEventListener("unhandledrejection", (e) => aviso(e.reason));
  function ir(l, n, animar) { try { mover(l, n, animar); } catch (err) { L = l; paso = n; aviso(err); } }
  function mover(l, n, animar) {
    if (tl) { tl.progress(1); tl.kill(); tl = null; }
    const lam = LAMINAS[l];
    if (!animar || RM) fijar(l, n);
    else if (l !== L) {
      tl = gsap.timeline();
      const { e } = estadoDe(l, 0);
      for (const [s, v] of Object.entries(e)) tl.to(s, { ...v, duration: 0.8, ease: "power3.inOut", overwrite: "auto" }, 0);
      // el fondo corre: da la sensación de que la ficha viaja
      tl.to("#palabras", { x: -1500 * Math.max(0, (lam.parada ?? 0)), duration: 1.2, ease: "power3.inOut" }, 0);
      tl.to("#trama", { backgroundPositionX: -620 * Math.max(0, (lam.parada ?? 0)), duration: 1.2, ease: "power3.inOut" }, 0);
      tl.fromTo("#ficha", { rotation: 0 }, { rotation: -1.2, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.1);
    } else {
      tl = gsap.timeline();
      for (const [s, v, o = {}] of lam.pasos[n - 1]) tl.to(s, { ...v, duration: o.dur ?? 0.6, stagger: o.stagger || 0, ease: o.ease || "power2.out" }, o.at ?? (o.at === 0 ? 0 : ">"));
    }
    if (!animar || RM) { gsap.set("#palabras", { x: -1500 * Math.max(0, lam.parada ?? 0) }); gsap.set("#trama", { backgroundPositionX: -620 * Math.max(0, lam.parada ?? 0) }); }
    L = l; paso = n;
    textos(l, n, animar);
    // el ancla solo se escribe fuera de un marco: dentro del visor de artifacts la URL es del visor
    if (SOLO) { try { history.replaceState(null, "", "#" + lam.id + (n ? "-" + n : "")); } catch (e) {} }
  }
  function textos(l, n, animar) {
    const lam = LAMINAS[l], d = animar && !RM ? 0.5 : 0, tinta = lam.tipo === "tinta";
    lienzo.classList.toggle("tinta", tinta);
    // de noche (la lámina de la madrugada, antes de que llegue la ficha) el texto va en claro
    lienzo.classList.toggle("noche-on", lam.id === "llega" && n < 2);
    $(".logo").src = tinta || (lam.id === "llega" && n < 2) ? $(".logo").dataset.blanco : $(".logo").dataset.negro;
    $$(".capa-texto").forEach((s) => gsap.to(s, { autoAlpha: s.dataset.lamina === lam.id ? 1 : 0, duration: d, overwrite: "auto" }));
    gsap.to(["#fondo", "#riel", ".migas"], { autoAlpha: tinta ? 0 : 1, duration: d });
    $(".pie").textContent = lam.pie || "";
    $(".cont").textContent = `${l + 1} / ${LAMINAS.length}`;
    gsap.to(".progreso", { width: `${((l + 1) / LAMINAS.length) * 100}%`, duration: d });
    // el riel: dónde vamos
    const p = lam.parada ?? -1;
    $$("#riel li").forEach((li, i) => { li.classList.toggle("paso", i + 1 < p || p > N_RIEL); li.classList.toggle("aqui", i + 1 === p); });
    gsap.to("#riel .via i", { width: `${Math.max(0, Math.min(1, (p - 1) / (N_RIEL - 1))) * 100}%`, duration: d });
    ponerTecnica(lam);
  }
  function ponerTecnica(lam) {
    const te = lam.tecnica, on = tecnica && !!te;
    if (te) { $(".tecnica .arch").textContent = te.archivo; $(".tecnica code").textContent = te.codigo; $(".tecnica p").textContent = te.nota; }
    gsap.to(".tecnica", { autoAlpha: on ? 1 : 0, duration: RM ? 0 : 0.3 });
    gsap.to(".col .lead", { autoAlpha: on ? 0 : 1, duration: RM ? 0 : 0.3 });
    $("#nav .t").setAttribute("aria-pressed", String(tecnica));
  }
  function adelante() { if (paso < total(L)) ir(L, paso + 1, true); else if (L < LAMINAS.length - 1) ir(L + 1, 0, true); }
  function atras() { if (paso > 0) ir(L, paso - 1, false); else if (L > 0) ir(L - 1, total(L - 1), false); }
  const alternarT = () => { tecnica = !tecnica; ponerTecnica(LAMINAS[L]); };
  const pantallaCompleta = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} };
  addEventListener("keydown", (e) => {
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { if (e.target.tagName === "BUTTON" && e.key === "Enter") return; e.preventDefault(); adelante(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); atras(); }
    else if (e.key === "Home") ir(0, 0, false);
    else if (e.key === "End") ir(LAMINAS.length - 1, total(LAMINAS.length - 1), false);
    else if (e.key === "t" || e.key === "T") alternarT();
    else if (e.key === "f" || e.key === "F") pantallaCompleta();
  });
  $$("#nav [data-ir]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); +b.dataset.ir > 0 ? adelante() : atras(); }));
  $("#nav .t").addEventListener("click", (e) => { e.stopPropagation(); alternarT(); });
  $("#nav .pc").addEventListener("click", (e) => { e.stopPropagation(); pantallaCompleta(); });
  lienzo.addEventListener("click", () => adelante());
  // el ancla: #reglas-2 abre la lámina «reglas» en su paso 2 (solo letras, números y guion)
  const desdeAncla = () => {
    let a = ""; try { a = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    const [id, n] = a.split(/[-/]/);
    const l = LAMINAS.findIndex((x) => x.id === id);
    return l < 0 ? null : [l, Math.min(+n || 0, total(l))];
  };
  // un ancla vacía o desconocida no mueve nada
  addEventListener("hashchange", () => { const d = desdeAncla(); if (d && (d[0] !== L || d[1] !== paso)) ir(d[0], d[1], false); });
  const arrancar = () => ir(...(desdeAncla() || [0, 0]), false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrancar); else arrancar();
}

writeFileSync(join(AQUI, "por-dentro.html"), html);
console.log("por-dentro.html", (html.length / 1024).toFixed(0), "KB");
