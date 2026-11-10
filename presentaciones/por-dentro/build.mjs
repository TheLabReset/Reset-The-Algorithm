// node build.mjs → por-dentro.html: la presentación «The Algorithm, por dentro» en un solo archivo, sin nada externo.
// Las láminas son texto sobre una figura que se queda en el escenario: la cámara (el viewBox) y las piezas se mueven
// de un paso al siguiente. Cada paso es un estado; ir a un paso es fundir los estados anteriores, así que avanzar,
// retroceder y saltar dan siempre la misma imagen. Guion y reglas: plan en docs (ver README de esta carpeta).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as C from "./figuras/cuarto.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const leer = (f, enc = "utf8") => readFileSync(join(AQUI, f), enc);
const b64 = (f) => readFileSync(join(AQUI, f)).toString("base64");
const fuente = (familia, archivo, peso) => `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};font-display:block;src:url(data:font/woff2;base64,${b64("assets/" + archivo)}) format('woff2')}`;
const FUENTES = [
  fuente("Anton", "anton.woff2", "400"), fuente("Instrument Sans", "instrument.woff2", "400 700"), fuente("Space Grotesk", "grotesk.woff2", "300 700"),
  fuente("Sofia Sans", "sofia.woff2", "100 900"), fuente("Sofia Sans Condensed", "sofia-cond.woff2", "100 900"),
].join("\n");
// dentro de un <script> no puede aparecer «</script»: el kit lo trae en un texto (pageHtml)
const sinCierre = (t) => t.replace(/<\/(script)/gi, "<\\/$1");
const KIT = sinCierre(leer("kit/iso-kit.mjs").replace(/^export /gm, ""));
const ISO_CSS = leer("kit/iso.css");
const GSAP = leer("assets/gsap.min.js");
const LOGO_NEGRO = `data:image/png;base64,${b64("assets/reset-negro.png")}`;
const LOGO_BLANCO = `data:image/png;base64,${b64("assets/reset-blanco.png")}`;
const CABECERA = `data:image/jpeg;base64,${b64("assets/panel-cabecera.jpg")}`;

// ── La señal: un día de una pieza de Fit Lab, la marca de la maqueta (generar() con semilla 20260930, corte 25 oct) ──
const SENAL = { dia: "25 oct", pieza: "Rutina guiada · anuncio de búsqueda", plataforma: "Google Ads", inversion: "$20,59", impresiones: "850", clics: "28", leads: "0" };

// ── Estados de la figura ──
// Las fichas viven en la cinta; cada una tiene x, y, z (desplazamiento desde su lugar en la cinta) y opacidad
const N = C.FICHAS.length;
const fichasEn = (xs, { y = 0, z = 0, o = 1 } = {}) => Object.fromEntries(xs.flatMap((x, i) => [[`fx${i}`, x], [`fy${i}`, y], [`fz${i}`, z], [`fo${i}`, o]]));
const vb = (s) => Object.fromEntries(s.split(" ").map((v, i) => [`vb${i}`, +v]));
const TODO = `0 0 ${C.ANCHO} ${C.ALTO}`;
const enTolva = fichasEn(C.FICHAS.map(() => -262), { z: 8, o: 0 });
const enCinta = fichasEn(C.FICHAS.map((f) => f.x));
// la señal y sus vecinas pasan la llave y el calibre
const pasada = fichasEn(C.FICHAS.map((f) => f.x + 70));
// bajo la ventana: la roja debajo del 25, las demás repartidas
const PLACA25 = C.VENTANA_X0 + 7 * C.PLACA + C.PLACA / 2;
const bajoVentana = fichasEn([PLACA25, -48, -22, 4, 56, 82, 108]);
const releida = fichasEn([PLACA25 - C.PLACA, -61, -35, -9, 43, 69, 95]);
// al final de la cinta, listas para entrar al ducto
const alFinal = fichasEn([176, 150, 128, 112, 96, 80, 64], { o: 1 });
const ALTO_BANDEJAS = C.ARCHIVOS.reduce((s, a) => s + Math.max(2.2, 2.2 + 3.4 * Math.log10(Math.max(1, a.kb))) + 0.6, 3);
const guardadas = Object.fromEntries(C.FICHAS.flatMap((f, i) => [[`fx${i}`, 234], [`fy${i}`, 0], [`fz${i}`, C.PLATAFORMA_Z0 + ALTO_BANDEJAS - 28 + 3], [`fo${i}`, 0]]));

const BASE_ESTADO = { ...vb(TODO), min: -30, luces: 0, compuerta: 0, luz: 0, tira: 0, plato: 0, sube: 0, pantalla: 0, toma: 0, ...enTolva };

// ── Las láminas ──
// tiempo: 1 en la central, 2 por dentro, 3 en pantalla. pasos: cada uno es una lista de tramos { a: estado, dur, pines, lectura }
const LAMINAS = [
  {
    id: "portada", tipo: "portada",
    titulo: "The Algorithm", sub: "por dentro",
    lead: "De dónde viene cada dato, cómo lo recibimos, cómo se transforma y cómo se ve.",
    firma: "The Lab by Reset · Inducción · noviembre de 2026",
  },
  {
    id: "acto3", tipo: "acto", numero: "Acto 3", titulo: "Cómo lo recibimos",
    lead: "El cuarto de máquinas es el backend: el piso de abajo de la central, donde llegan las señales y se guardan. Nadie lo ve, y corre solo.",
  },
  {
    id: "l09", tipo: "escena", tiempo: 1, acto: "Acto 3 · Cómo lo recibimos",
    titulo: "A las 5:47, el cuarto de máquinas se enciende solo.",
    lead: "Cada madrugada baja lo nuevo de cada fuente, sin que nadie lo pida. Lo que llega cae a la cinta como fichas.",
    inicio: { ...vb(TODO), min: -30, luces: 0.4, ...enTolva },
    pasos: [
      [{ a: { min: 347, luces: 1 }, dur: 3.2, ease: "power2.inOut", pines: ["reloj"], lectura: "hora" }],
      [{ a: enCinta, dur: 2.2, ease: "power2.out", pines: ["reloj", "fuentes", "tolva"], lectura: "fichas" }],
    ],
    leyenda: {
      reloj: ["Reloj", "La hora a la que corre: 5:47 de Lima, todos los días."],
      fuentes: ["Cables", "Las fuentes conectadas: en producción, Integrametrics y Google Trends."],
      tolva: ["Tolva", "Por donde entra lo nuevo. Cada ficha es un registro."],
    },
    tecnica: {
      archivo: ".github/workflows/pipeline.yml",
      codigo: `schedule:\n  - cron: '47 10 * * *'   # diario: los últimos 7 días\n  - cron: '47 9 * * 0'    # domingo: desde enero`,
      nota: "10:47 UTC es 5:47 en Lima. El minuto 47 es a propósito: GitHub atrasa los crones que caen en la hora en punto.",
    },
    pie: "El cuarto de máquinas es el de producción (GitHub Actions). La ficha roja es un día de una pieza de Fit Lab, la marca de la maqueta.",
  },
  {
    id: "l10", tipo: "escena", tiempo: 2, acto: "Acto 3 · Cómo lo recibimos",
    titulo: "Antes de traer la data, revisa la llave y prueba el código.",
    lead: "Sin el token de la fuente, la compuerta no sube y la corrida queda en rojo. Si una prueba falla, la cinta se detiene antes de tocar la data.",
    inicio: { ...vb(C.encuadre([-150, 0, 40], 560)), min: 347, luces: 1, ...enCinta },
    pasos: [
      [{ a: { compuerta: 1 }, dur: 1.2, ease: "power2.inOut", pines: ["llave"], lectura: "llave" }],
      [{ a: { luz: 1 }, dur: 0.6, ease: "power1.out", pines: ["llave", "calibre"], lectura: "calibre" }, { a: pasada, dur: 2.2, ease: "power2.inOut" }],
    ],
    leyenda: {
      llave: ["Llave", "El token de la fuente. Vive en los secretos de GitHub, nunca en el navegador."],
      calibre: ["Calibre", "Las pruebas del código. Si una falla, nada sigue."],
    },
    tecnica: {
      archivo: ".github/workflows/pipeline.yml",
      codigo: `- name: Exigir el token        # sin el token, falla en rojo\n- name: Instalar dependencias  # npm ci\n- name: Pruebas                # npm run prueba`,
      nota: "Un workflow que no puede hacer su trabajo no puede quedar en verde: antes quedaba verde sin hacer nada y la data se quedó en julio sin que nadie lo notara.",
    },
    pie: "Los pasos y su orden son los del workflow real.",
  },
  {
    id: "l11", tipo: "escena", tiempo: 2, acto: "Acto 3 · Cómo lo recibimos",
    titulo: "Cada mañana vuelve a leer los últimos siete días.",
    lead: "La fuente corrige con días de rezago, así que lo de ayer se lee otra vez hoy. Los domingos repasa todo desde enero.",
    inicio: { ...vb(C.encuadre([-4, -12, 46], 470)), min: 347, luces: 1, compuerta: 1, luz: 1, ...bajoVentana },
    pasos: [
      [{ a: {}, dur: 0.01, pines: ["ventana"], lectura: "ventana" }],
      [{ a: { tira: 1, ...releida }, dur: 2.4, ease: "power2.inOut", pines: ["ventana"], lectura: "manana" }],
    ],
    leyenda: {
      ventana: ["Ventana", "Siete días a la vez, hasta hoy. La del 25 de octubre va del 19 al 25; la del 26, del 20 al 26."],
    },
    tecnica: {
      archivo: "scripts/run-pipeline.mjs",
      codigo: `INCREMENTAL (por omisión): los últimos 7 días, incluido hoy,\n  con merge idempotente sobre lo commiteado\nBACKFILL (PIPELINE_START): reconstruye todo el rango`,
      nota: "Un corte de red, un 5xx o un 429 se reintenta a los 3 y a los 10 segundos; un 4xx no. Cada corrida tarda unos 35 segundos fijos más entre 1,3 y 1,5 segundos por día de la ventana.",
    },
    pie: "En producción la fuente es Integrametrics. Con Google Ads pasa algo parecido: una conversión puede registrarse días después del clic.",
  },
  {
    id: "l12", tipo: "escena", tiempo: 2, acto: "Acto 3 · Cómo lo recibimos",
    titulo: "Todo se guarda con la misma forma: el contrato.",
    lead: "Cada archivo de public/data es una bandeja con casilleros fijos, y la sala solo puede leer lo que está en ellas. Las marcas vigiladas van en un armario aparte, con candado.",
    inicio: { ...vb(C.encuadre([212, 6, 64], 600)), min: 347, luces: 1, compuerta: 1, luz: 1, tira: 1, ...alFinal },
    pasos: [
      [{ a: guardadas, dur: 2.4, ease: "power2.inOut", pines: ["cuaderno", "ducto"], lectura: "ducto" }],
      [{ a: {}, dur: 0.01, pines: ["cuaderno", "ducto", "vigiladas"], lectura: "vigiladas" }],
    ],
    leyenda: {
      cuaderno: ["Cuaderno", "El contexto de MAIA: lo único que ella puede leer."],
      ducto: ["Ducto", "El contrato: algorithm.json, medios.json, busquedas.json y el resto. El grosor de cada bandeja sigue su peso, en escala logarítmica."],
      vigiladas: ["Armario", "Las marcas vigiladas, en vigiladas.json. No entran al contrato ni a MAIA."],
    },
    archivos: C.ARCHIVOS,
    tecnica: {
      archivo: "public/data/",
      codigo: `algorithm.json      { meta, daily, pieces, ooh, events, digital }\nmedios.json         cada emisión: canal, programa, versión, hora\nbusquedas.json      Google Trends\nmaia-contexto.json  el cuaderno de MAIA\nvigiladas.json      aparte: solo lo lee la capa 1`,
      nota: "En la maqueta de Fit Lab no hay cuarto de máquinas: generar() arma el mismo tipo de objeto con la semilla 20260930, y el resto del código no nota la diferencia.",
    },
    pie: "Los archivos y sus pesos son los del panel en producción, en noviembre de 2026.",
  },
  {
    id: "l13", tipo: "escena", tiempo: 2, acto: "Acto 3 · Cómo lo recibimos",
    titulo: "Si algo cambió, sube solo a la sala.",
    lead: "La balanza compara lo de hoy con lo que ya estaba: sin cambios, no hay commit. Con cambios, el montacargas sube la data y Vercel publica la sala.",
    inicio: { ...vb(C.encuadre([196, 0, 118], 640)), min: 347, luces: 1, compuerta: 1, luz: 1, tira: 1, ...guardadas },
    pasos: [
      [{ a: { plato: 1 }, dur: 1.1, ease: "back.out(2)", pines: ["commit"], lectura: "balanza" }],
      [{ a: { sube: 1 }, dur: 2.6, ease: "power2.inOut", pines: ["commit", "sala"], lectura: "sube" }, { a: { pantalla: 1 }, dur: 0.6 }],
      [{ a: { toma: 1, tiempo: 3 }, dur: 0.8, ease: "power2.out", pines: [], lectura: "pantalla" }],
    ],
    leyenda: {
      commit: ["Balanza", "Lo de hoy contra lo que ya estaba. Si pesan igual, la corrida termina sin commit."],
      sala: ["Sala", "El frontend: el navegador baja el contrato y arma todo lo demás."],
    },
    tecnica: {
      archivo: ".github/workflows/pipeline.yml",
      codigo: `- name: Commit de la data si cambió\n  git add public/data\n  if git diff --cached --quiet; then echo "Sin cambios en la data."\n  else git commit -m "chore(pipeline): data de Integrametrics al <hoy>"; git push`,
      nota: "Cada push a main publica la sala en Vercel (vercel.json). El «Datos al…» de la barra sale del contrato que deja este paso.",
    },
    pantalla: { img: CABECERA, texto: "En pantalla: la barra dice de cuándo es la data y cada fuente muestra su corte. Captura de la maqueta de Fit Lab con corte al 25 de octubre." },
    pie: "La captura es de la maqueta de Fit Lab, con la data fija al 25 de octubre.",
  },
];

// los textos de la lectura bajo la figura, según el estado
const LECTURAS = {
  hora: "reloj · {hora} · Lima",
  fichas: "{fichas} fichas en la cinta · la roja: {senal}",
  llave: "compuerta {compuerta}",
  calibre: "pruebas: pasan · la cinta sigue",
  ventana: "ventana del {v0} al {v1} de octubre",
  manana: "ventana del {v0} al {v1} de octubre · el {senalDia} se lee otra vez",
  ducto: "7 bandejas · {kb} KB en el ducto",
  vigiladas: "vigiladas.json · 35 KB · aparte",
  balanza: "hoy pesa distinto: hay commit",
  sube: "montacargas {sube}",
  pantalla: "Datos al 25 de octubre",
};

// ── La figura y los pines ──
const SVG = C.figura({ id: "cuarto" });
const PINES = Object.fromEntries(Object.entries(C.PINES).map(([id]) => [id, C.pin(id)]));

const css = `
${FUENTES}
${ISO_CSS}
:root{--papel:#FAF8F5;--tinta:#16181F;--arena:#F1EDE6;--linea:#E9E5DF;--blanco:#FFFFFF;--sec:#565D6B;--secD:#A7ACB6;--mut:#8A909C;--rojo:#ED002F;--rojoT:#B30024;--rojoPalido:#FDEEF1}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:var(--tinta)}
body{font-family:'Instrument Sans','Helvetica Neue',Arial,sans-serif;color:var(--tinta);-webkit-font-smoothing:antialiased}
button{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:6px}
#lienzo{position:fixed;left:50%;top:50%;width:1920px;height:1080px;transform-origin:0 0;background:var(--papel);overflow:hidden}
#lienzo.tinta{background:var(--tinta)}
.logo{position:absolute;left:96px;top:56px;width:58px;height:auto}
.migas{position:absolute;right:96px;top:68px;font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
/* ── portada y actos, sobre tinta ── */
.capa-texto{position:absolute;inset:0;opacity:0;visibility:hidden}
.portada,.acto{display:flex;flex-direction:column;justify-content:center;padding:0 96px;gap:28px;color:var(--blanco)}
.marca{font-family:'Anton',Impact,sans-serif;text-transform:uppercase;font-size:200px;line-height:.92;letter-spacing:.01em;margin:0}
.marca small{display:block;font-family:'Space Grotesk',sans-serif;text-transform:none;font-size:56px;font-weight:500;letter-spacing:-.01em;color:var(--secD);margin-top:18px}
.portada .lead,.acto .lead{font-size:28px;line-height:1.5;color:var(--secD);max-width:44ch;margin:0}
.firma{position:absolute;left:96px;bottom:60px;font-size:15px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#7E8595}
.acto .num{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:var(--rojo)}
.acto h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:104px;line-height:1.02;letter-spacing:-.02em;margin:0;max-width:14ch}
/* ── escenas: texto a la izquierda, figura a la derecha ── */
.col{position:absolute;left:96px;top:150px;width:560px;display:flex;flex-direction:column;gap:30px}
.tiempos{display:flex;gap:8px}
.tiempos span{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);padding:7px 14px;border-radius:999px;background:transparent;border:1.5px solid var(--linea)}
.tiempos span b{font-family:'Space Grotesk',sans-serif;font-weight:700}
.tiempos span.on{background:var(--tinta);border-color:var(--tinta);color:var(--blanco)}
.col h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:56px;line-height:1.06;letter-spacing:-.015em;margin:0;text-wrap:balance}
.col .lead{font-size:23px;line-height:1.55;color:var(--sec);margin:0;text-wrap:pretty}
.leyenda{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
.leyenda li{display:grid;grid-template-columns:34px 1fr;gap:14px;align-items:start;opacity:0;transform:translateY(8px)}
.leyenda .n{width:30px;height:30px;border-radius:50%;background:var(--tinta);color:var(--blanco);display:grid;place-items:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px}
.leyenda b{display:block;font-family:'Space Grotesk',sans-serif;font-size:19px}
.leyenda span{display:block;font-size:17px;line-height:1.45;color:var(--sec)}
.archivos{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-family:'Sofia Sans','Instrument Sans',sans-serif;font-size:15px;color:var(--sec);margin-top:-6px;opacity:0}
.archivos b{font-weight:600;color:var(--tinta);font-variant-numeric:tabular-nums}
/* ── la figura ── */
#escenario{position:absolute;left:640px;top:118px;width:1220px;height:772px;opacity:0}
#escenario{overflow:hidden;--borde-h:linear-gradient(90deg,transparent 0,#000 70px,#000 calc(100% - 40px),transparent 100%);--borde-v:linear-gradient(180deg,transparent 0,#000 30px,#000 calc(100% - 70px),transparent 100%);-webkit-mask-image:var(--borde-h),var(--borde-v);-webkit-mask-composite:source-in;mask-image:var(--borde-h),var(--borde-v);mask-composite:intersect}
#escenario svg{width:100%;height:100%;display:block}
.iso{--anatomy-paper:var(--papel);--anatomy-card:var(--papel)}
.iso .senal>.iso-fill,.iso .senal>.iso-top{fill:var(--rojo)}
.iso .senal>.iso-shade{fill:var(--rojoT)}
.iso .senal>.iso-edge{stroke:var(--rojoT)}
.iso .senal>.iso-crease{stroke:#ff6f88}
.iso .iso-line[data-tone="lit"]{stroke:var(--tinta)}
.senal + .iso-line{stroke:#fff}
.iso .luz.on>.iso-top{fill:var(--tinta)}
.iso .luz.on>.iso-shade{fill:#3a3d46}
.pantalla-fondo{fill:var(--blanco);stroke:#8a8a8f;stroke-width:.4}
.pantalla-barra{fill:var(--tinta)}
.pantalla-tarjeta{fill:var(--arena)}
.pantalla-dato{fill:var(--rojo)}
.pines{position:absolute;inset:0;pointer-events:none}
.pin{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:var(--tinta);color:var(--blanco);display:grid;place-items:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;box-shadow:0 0 0 4px var(--papel);opacity:0;transform:scale(.6)}
.rotulo-fig{position:absolute;left:640px;top:96px;font-family:'Sofia Sans Condensed','Space Grotesk',sans-serif;font-size:15px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);opacity:0}
.lectura{position:absolute;right:60px;bottom:118px;font-family:'Sofia Sans','Instrument Sans',sans-serif;font-variant-numeric:tabular-nums;font-size:17px;font-weight:600;color:var(--tinta);background:var(--blanco);border:1px solid var(--linea);border-radius:999px;padding:8px 16px;opacity:0}
.lectura::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--rojo);margin-right:10px;vertical-align:middle}
/* ── en pantalla: la captura real ── */
.toma{position:absolute;left:680px;top:330px;width:1180px;opacity:0;visibility:hidden}
.toma img{width:100%;border-radius:16px;box-shadow:0 1px 2px rgba(22,24,31,.06),0 22px 60px rgba(22,24,31,.14);display:block}
.toma p{font-size:18px;line-height:1.5;color:var(--sec);margin:22px 0 0;max-width:62ch}
/* ── la capa técnica ── */
.tecnica{position:absolute;left:72px;bottom:110px;width:612px;background:var(--tinta);color:#EDEFF2;border-radius:18px;padding:26px 28px;display:flex;flex-direction:column;gap:14px;opacity:0;visibility:hidden;transform:translateY(12px)}
.tecnica .t{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rojo)}
.tecnica code{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:14.5px;line-height:1.6;white-space:pre-wrap;color:#fff;display:block}
.tecnica .arch{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:14px;color:var(--secD)}
.tecnica p{margin:0;font-size:16px;line-height:1.5;color:var(--secD)}
/* ── pie y navegación ── */
.pie{position:absolute;left:96px;right:520px;bottom:44px;font-size:14px;line-height:1.45;color:var(--mut);opacity:0}
#nav{position:absolute;right:60px;bottom:36px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.82);border:1px solid var(--linea);border-radius:999px;padding:6px 8px}
#lienzo.tinta #nav{background:rgba(22,24,31,.6);border-color:#2A2E37;color:#EDEFF2}
#nav button{border:0;background:transparent;color:inherit;width:36px;height:36px;border-radius:50%;cursor:pointer;display:grid;place-items:center;font-size:18px}
#nav button:hover{background:rgba(127,127,127,.14)}
#nav .cont{font-family:'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;font-size:15px;min-width:74px;text-align:center}
#nav .t{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;width:auto;padding:0 12px;border-radius:999px}
#nav .t[aria-pressed="true"]{background:var(--tinta);color:var(--blanco)}
#lienzo.tinta #nav .t[aria-pressed="true"]{background:var(--blanco);color:var(--tinta)}
.progreso{position:absolute;left:0;top:0;height:4px;background:var(--rojo);width:0}
`;

const html = `<title>The Algorithm, por dentro</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
<div id="lienzo" class="tinta" role="application" aria-roledescription="presentación" aria-label="The Algorithm, por dentro">
  <div class="progreso"></div>
  <img class="logo" alt="Reset" src="${LOGO_BLANCO}" data-negro="${LOGO_NEGRO}" data-blanco="${LOGO_BLANCO}">
  <div class="migas" aria-live="polite"></div>
  <div class="rotulo-fig">Fig. 3 · El cuarto de máquinas</div>
  <div id="escenario" class="iso" data-theme="light">${SVG}</div>
  <div class="pines" aria-hidden="true"></div>
  <div class="lectura" aria-live="polite"></div>
  <div class="toma"><img alt="La barra del panel de Fit Lab: Datos al 25 de octubre, y cada fuente con su corte al 25 de octubre"><p></p></div>
  ${LAMINAS.map((l) => texto(l)).join("\n")}
  <div class="tecnica" role="note" aria-live="polite"><span class="t">Capa técnica</span><span class="arch"></span><code></code><p></p></div>
  <div class="pie" aria-live="polite"></div>
  <nav id="nav" aria-label="Navegación">
    <button type="button" data-ir="-1" aria-label="Anterior">‹</button>
    <span class="cont">1 / ${LAMINAS.length}</span>
    <button type="button" data-ir="1" aria-label="Siguiente">›</button>
    <button type="button" class="t" aria-pressed="false" title="Capa técnica (T)">T</button>
    <button type="button" class="pc" aria-label="Pantalla completa" title="Pantalla completa (F)">⛶</button>
  </nav>
</div>
<script>${GSAP}</script>
<script type="module">
${KIT}
const P = ${JSON.stringify(C.P)};
const RELOJ = ${JSON.stringify(C.RELOJ)}, RELOJ_R = ${C.RELOJ_R}, RELOJ_Z = ${4 + 30};
const FICHAS = ${JSON.stringify(C.FICHAS)};
const PLATAFORMA_Z0 = ${C.PLATAFORMA_Z0}, SALA_Z = ${C.SALA_Z}, PLACA = ${C.PLACA}, VENTANA_X0 = ${C.VENTANA_X0}, MARCO = ${JSON.stringify(C.MARCO)}, ALTO_BANDEJAS = ${ALTO_BANDEJAS};
const PINES = ${JSON.stringify(PINES)};
const LAMINAS = ${JSON.stringify(LAMINAS.map(({ id, tipo, tiempo, acto, inicio, pasos, leyenda, tecnica, pie, pantalla }) => ({ id, tipo, tiempo, acto, inicio, pasos, leyenda, tecnica, pie, pantalla })))};
const BASE_ESTADO = ${JSON.stringify(BASE_ESTADO)};
const LECTURAS = ${JSON.stringify(LECTURAS)};
const SENAL = ${JSON.stringify(SENAL)};
const KB = ${Math.round(C.ARCHIVOS.reduce((s, a) => s + a.kb, 0))};
${VIVO.toString().replace(/^function VIVO\(\) \{|\}$/g, "")}
</script>`;

function texto(l) {
  if (l.tipo === "portada") return `<section class="capa-texto portada" data-lamina="${l.id}"><h1 class="marca">${l.titulo}<small>${l.sub}</small></h1><p class="lead">${l.lead}</p><span class="firma">${l.firma}</span></section>`;
  if (l.tipo === "acto") return `<section class="capa-texto acto" data-lamina="${l.id}"><span class="num">${l.numero}</span><h1>${l.titulo}</h1><p class="lead">${l.lead}</p></section>`;
  const ids = Object.keys(l.leyenda || {});
  const archivos = l.archivos ? `<div class="archivos">${l.archivos.map((a) => `<b>${a.nombre}</b><span>${a.kb >= 1 ? Math.round(a.kb).toLocaleString("es-PE").replace(/,/g, " ") + " KB" : "menos de 1 KB"} · ${a.nota}</span>`).join("")}</div>` : "";
  return `<section class="capa-texto escena" data-lamina="${l.id}"><div class="col">
    <div class="tiempos" aria-label="Tiempo"><span data-t="1"><b>1</b> En la central</span><span data-t="2"><b>2</b> Por dentro</span><span data-t="3"><b>3</b> En pantalla</span></div>
    <h2>${l.titulo}</h2><p class="lead">${l.lead}</p>
    <ol class="leyenda">${ids.map((id) => `<li data-pin="${id}"><span class="n"></span><div><b>${l.leyenda[id][0]}</b><span>${l.leyenda[id][1]}</span></div></li>`).join("")}</ol>${archivos}
  </div></section>`;
}

// ── Lo que corre en la página ──
function VIVO() {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const lienzo = $("#lienzo"), svg = $("#escenario svg"), escenario = $("#escenario");
  const partes = {
    agujaH: svg.querySelector('[data-aguja="hora"]'), agujaM: svg.querySelector('[data-aguja="minuto"]'),
    fichas: FICHAS.map((_, i) => svg.querySelector(`[data-ficha="${i}"]`)),
    compuerta: svg.querySelector('[data-parte="compuerta"]'), luz: svg.querySelector('[data-parte="luz"] .luz'),
    tira: svg.querySelector('[data-parte="tira"]'), plato0: svg.querySelector('[data-parte="plato-0"]'), plato1: svg.querySelector('[data-parte="plato-1"]'),
    sube: svg.querySelector('[data-parte="montacargas"]'), pantalla: svg.querySelector('[data-parte="pantalla"]'),
    dias: [...svg.querySelectorAll('[data-dia]')],
  };
  // el lienzo de 1920 × 1080 siempre entero en la ventana
  const encajar = () => { const k = Math.min(innerWidth / 1920, innerHeight / 1080); lienzo.style.transform = `translate(${-960 * k}px, ${-540 * k}px) scale(${k})`; };
  encajar(); addEventListener("resize", encajar);

  const E = { ...BASE_ESTADO };
  const agujas = (min) => {
    const [x, y] = RELOJ, z = RELOJ_Z + 0.2, h = (((min / 60) % 12) + 12) % 12, m = ((min % 60) + 60) % 60;
    const punta = (f, r) => [x + Math.sin(f * Math.PI * 2) * r, y - Math.cos(f * Math.PI * 2) * r];
    return [lineOnTop([x, y], punta(h / 12, RELOJ_R * 0.5), z, P), lineOnTop([x, y], punta(m / 60, RELOJ_R * 0.78), z, P)];
  };
  const hora = (min) => { const t = ((Math.round(min) % 1440) + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
  let lecturaId = null;
  function pintar() {
    svg.setAttribute("viewBox", [E.vb0, E.vb1, E.vb2, E.vb3].map((v) => v.toFixed(2)).join(" "));
    const [h, m] = agujas(E.min); partes.agujaH.setAttribute("d", h); partes.agujaM.setAttribute("d", m);
    partes.fichas.forEach((g, i) => { g.setAttribute("transform", translateAlong(P, [E["fx" + i], E["fy" + i], E["fz" + i]])); g.style.opacity = E["fo" + i]; });
    partes.compuerta.setAttribute("transform", translateAlong(P, [0, 0, E.compuerta * 18]));
    partes.luz.classList.toggle("on", E.luz > 0.5);
    partes.tira.setAttribute("transform", translateAlong(P, [-PLACA * E.tira, 0, 0]));
    partes.plato0.setAttribute("transform", translateAlong(P, [0, 0, E.plato * 2.2]));
    partes.plato1.setAttribute("transform", translateAlong(P, [0, 0, -E.plato * 2.2]));
    partes.sube.setAttribute("transform", translateAlong(P, [0, 0, PLATAFORMA_Z0 + E.sube * (SALA_Z + 6 - ALTO_BANDEJAS - PLATAFORMA_Z0)]));
    // las placas fuera de la ventana se apagan
    partes.dias.forEach((g, i) => { const x = VENTANA_X0 + i * PLACA - PLACA * E.tira + PLACA / 2; g.style.opacity = x > MARCO.x && x < MARCO.x + MARCO.w ? 1 : 0.32; });
    partes.pantalla.style.opacity = 0.18 + 0.82 * E.pantalla;
    svg.style.opacity = 0.35 + 0.65 * E.luces;
    // los pines siguen a sus piezas aunque la cámara se mueva
    const caja = { w: escenario.offsetWidth, h: escenario.offsetHeight };
    $$(".pin").forEach((p) => {
      const [x, y] = PINES[p.dataset.pin];
      const sx = ((x - E.vb0) / E.vb2), sy = ((y - E.vb1) / E.vb3);
      // el svg encaja el viewBox con «meet»: calcular el factor y el margen
      const k = Math.min(caja.w / E.vb2, caja.h / E.vb3), ox = (caja.w - E.vb2 * k) / 2, oy = (caja.h - E.vb3 * k) / 2;
      p.style.left = (640 + ox + sx * E.vb2 * k) + "px"; p.style.top = (118 + oy + sy * E.vb3 * k) + "px";
    });
    if (lecturaId) $(".lectura").textContent = leerTexto(lecturaId);
  }
  function leerTexto(id) {
    const v0 = 19 + Math.round(E.tira), v1 = 25 + Math.round(E.tira);
    return (LECTURAS[id] || "")
      .replace("{hora}", hora(E.min)).replace("{fichas}", FICHAS.length)
      .replace("{senal}", `${SENAL.dia} · ${SENAL.inversion} · ${SENAL.clics} clics · ${SENAL.leads} leads`)
      .replace("{compuerta}", E.compuerta > 0.95 ? "arriba: el token es válido" : "abajo")
      .replace("{v0}", v0).replace("{v1}", v1).replace("{senalDia}", "25")
      .replace("{kb}", KB.toLocaleString("es-PE").replace(/,/g, " "))
      .replace("{sube}", E.sube > 0.98 ? "en la sala: Vercel publica" : "subiendo");
  }

  // ── navegación: (lámina, paso) ──
  let L = 0, paso = 0, tl = null, tecnica = false;
  const estadoDe = (l, n) => {
    const lam = LAMINAS[l], s = { ...BASE_ESTADO };
    // la figura conserva el último estado de la escena anterior en portada y actos
    if (lam.tipo !== "escena") return null;
    Object.assign(s, lam.inicio);
    lam.pasos.slice(0, n).forEach((tramos) => tramos.forEach((t) => Object.assign(s, t.a)));
    return s;
  };
  const tramoFinal = (l, n) => { const p = LAMINAS[l].pasos?.[n - 1]; return p ? p.find((t) => t.pines) || p[0] : null; };
  function aplicarTexto(l, n, animar) {
    const lam = LAMINAS[l], d = animar && !RM ? 0.5 : 0;
    lienzo.classList.toggle("tinta", lam.tipo !== "escena");
    $(".logo").src = lam.tipo !== "escena" ? $(".logo").dataset.blanco : $(".logo").dataset.negro;
    $(".migas").textContent = lam.acto || "";
    $$(".capa-texto").forEach((s) => { const on = s.dataset.lamina === lam.id; gsap.to(s, { autoAlpha: on ? 1 : 0, duration: d, overwrite: "auto" }); });
    const escena = lam.tipo === "escena";
    gsap.to([escenario, ".rotulo-fig"], { autoAlpha: escena ? 1 : 0, duration: d, overwrite: "auto" });
    gsap.to(".pie", { autoAlpha: escena ? 1 : 0, duration: d });
    $(".pie").textContent = lam.pie || "";
    $(".cont").textContent = `${l + 1} / ${LAMINAS.length}`;
    gsap.to(".progreso", { width: `${((l + 1) / LAMINAS.length) * 100}%`, duration: d });
    if (!escena) { $$(".pin").forEach((p) => p.remove()); gsap.to(".lectura", { autoAlpha: 0, duration: d }); gsap.to(".toma", { autoAlpha: 0, duration: d }); ponerTecnica(lam); return; }
    // el tiempo: 1, 2 o 3 (un paso puede pasar al 3)
    const t = LAMINAS[l].pasos.slice(0, n).flat().reduce((acc, x) => x.a.tiempo || acc, lam.tiempo);
    $$(`[data-lamina="${lam.id}"] .tiempos span`).forEach((s) => s.classList.toggle("on", +s.dataset.t === t));
    // pines y leyenda del paso
    const fin = tramoFinal(l, n), pines = fin?.pines || [];
    const ids = Object.keys(lam.leyenda || {});
    const capa = $(".pines");
    $$(".pin").forEach((p) => { if (!pines.includes(p.dataset.pin)) gsap.to(p, { opacity: 0, scale: 0.6, duration: d * 0.6, onComplete: () => p.remove() }); });
    pines.forEach((id) => {
      if ($(`.pin[data-pin="${id}"]`)) return;
      const p = document.createElement("span"); p.className = "pin"; p.dataset.pin = id; p.textContent = ids.indexOf(id) + 1; capa.appendChild(p);
      gsap.to(p, { opacity: 1, scale: 1, duration: d, ease: "back.out(2)", delay: d * 0.4 });
    });
    $$(`[data-lamina="${lam.id}"] .leyenda li`).forEach((li, i) => {
      li.querySelector(".n").textContent = i + 1;
      const on = pines.includes(li.dataset.pin);
      gsap.to(li, { opacity: on ? 1 : 0.0, y: on ? 0 : 8, duration: d, delay: on ? d * 0.5 : 0 });
    });
    gsap.to(`[data-lamina="${lam.id}"] .archivos`, { opacity: pines.includes("ducto") ? 1 : 0, duration: d, delay: d * 0.6 });
    lecturaId = fin?.lectura || null;
    gsap.to(".lectura", { autoAlpha: lecturaId && t !== 3 ? 1 : 0, duration: d });
    // en pantalla
    const toma = lam.pantalla && t === 3;
    if (lam.pantalla) { $(".toma img").src = lam.pantalla.img; $(".toma p").textContent = lam.pantalla.texto; }
    gsap.to(".toma", { autoAlpha: toma ? 1 : 0, duration: d });
    gsap.to([escenario, ".rotulo-fig"], { autoAlpha: escena && !toma ? 1 : 0, duration: d });
    if (toma) $$(".pin").forEach((p) => p.remove());
    ponerTecnica(lam);
    pintar();
  }
  function ponerTecnica(lam) {
    const te = lam.tecnica, on = tecnica && !!te;
    if (te) { $(".tecnica .arch").textContent = te.archivo; $(".tecnica code").textContent = te.codigo; $(".tecnica p").textContent = te.nota; }
    gsap.to(".tecnica", { autoAlpha: on ? 1 : 0, y: on ? 0 : 12, duration: RM ? 0 : 0.35 });
    gsap.to(".col .leyenda, .col .archivos", { visibility: on ? "hidden" : "visible", duration: 0 });
    $(".t").setAttribute("aria-pressed", String(tecnica));
  }
  // ir a un paso: sin animar, el estado exacto; animando, los tramos en orden
  function ir(l, n, animar) {
    if (tl) { tl.progress(1); tl.kill(); tl = null; }
    const lam = LAMINAS[l];
    if (lam.tipo === "escena") {
      if (!animar || RM) { Object.assign(E, estadoDe(l, n)); pintar(); }
      else {
        tl = gsap.timeline({ onUpdate: pintar });
        if (l !== L || n === 0) tl.to(E, { ...estadoDe(l, 0), duration: 1.4, ease: "power3.inOut" });
        if (n > 0 && l === L) lam.pasos[n - 1].forEach((t) => tl.to(E, { ...numericos(t.a), duration: t.dur, ease: t.ease || "power2.inOut" }));
      }
    }
    L = l; paso = n;
    aplicarTexto(l, n, animar);
    try { history.replaceState(null, "", "#" + lam.id + (n ? "-" + n : "")); } catch (e) {}
  }
  const numericos = (a) => Object.fromEntries(Object.entries(a).filter(([k, v]) => typeof v === "number" && k !== "tiempo"));
  const total = (l) => (LAMINAS[l].pasos || []).length;
  function adelante() { if (paso < total(L)) ir(L, paso + 1, true); else if (L < LAMINAS.length - 1) ir(L + 1, 0, true); }
  function atras() { if (paso > 0) ir(L, paso - 1, false); else if (L > 0) ir(L - 1, total(L - 1), false); }
  addEventListener("keydown", (e) => {
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { if (e.target.tagName === "BUTTON" && e.key === "Enter") return; e.preventDefault(); adelante(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); atras(); }
    else if (e.key === "Home") ir(0, 0, false);
    else if (e.key === "End") ir(LAMINAS.length - 1, total(LAMINAS.length - 1), false);
    else if (e.key === "t" || e.key === "T") { tecnica = !tecnica; ponerTecnica(LAMINAS[L]); }
    else if (e.key === "f" || e.key === "F") pantallaCompleta();
  });
  $$("#nav [data-ir]").forEach((b) => b.addEventListener("click", () => (+b.dataset.ir > 0 ? adelante() : atras())));
  $("#nav .t").addEventListener("click", () => { tecnica = !tecnica; ponerTecnica(LAMINAS[L]); });
  const pantallaCompleta = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} };
  $("#nav .pc").addEventListener("click", pantallaCompleta);
  lienzo.addEventListener("click", (e) => { if (!e.target.closest("#nav")) adelante(); });
  // arranca donde dice el ancla (#l11-2), o en la portada; un enlace a otra ancla salta ahí
  const desdeAncla = () => {
    const m = (location.hash.slice(1) || "").match(/^(.+?)(?:-(\d+))?$/);
    const l = m ? LAMINAS.findIndex((x) => x.id === m[1]) : -1;
    return l < 0 ? [0, 0] : [l, m[2] ? Math.min(+m[2], total(l)) : 0];
  };
  Object.assign(E, estadoDe(LAMINAS.findIndex((x) => x.tipo === "escena"), 0)); pintar();
  const arrancar = () => ir(...desdeAncla(), false);
  addEventListener("hashchange", () => { const [l, n] = desdeAncla(); if (l !== L || n !== paso) ir(l, n, false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrancar); else arrancar();
}

writeFileSync(join(AQUI, "por-dentro.html"), html);
console.log("por-dentro.html", (html.length / 1024).toFixed(0), "KB");
