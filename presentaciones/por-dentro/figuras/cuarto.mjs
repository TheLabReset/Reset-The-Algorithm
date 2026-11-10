// El cuarto de máquinas: el backend de The Algorithm dibujado como un banco de trabajo, con el kit de Anatomy.
// Cada pieza es un paso real del pipeline (.github/workflows/pipeline.yml del repo de producción): el reloj del cron,
// la llave del token, el calibre de las pruebas, la ventana de 7 días, el cuaderno de MAIA, la balanza del commit,
// el ducto del contrato (public/data) y el montacargas que sube la data a la sala. Las fichas que viajan por la
// cinta son registros; la roja es la señal que sigue toda la presentación.
// La figura se arma una vez y cada lámina la usa con su propio encuadre y su estado.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

export const ANCHO = 1200, ALTO = 760;

// ── El mundo, en unidades de ~1 px. x a lo largo de la cinta, y hacia el espectador, z hacia arriba ──
const BASE = { x: -340, y: -86, w: 660, d: 172, r: 10 };
const BASE_H = 10, PATA_H = 5;
const CINTA = { x: -236, y: -18, w: 424, d: 36, r: 6 }, CINTA_Z = 22, CINTA_H = 6, ENCIMA = CINTA_Z + CINTA_H;
const FICHA = { w: 18, d: 24 }, FICHA_H = 3;
export const RELOJ = [-296, -50], RELOJ_R = 19, RELOJ_Z = 30;
export const LLAVE_X = -196, CALIBRE_X = -128, MAIA_X = 92, COMMIT_X = 154;
// la ventana de los días: placas de 13 de ancho, del 18 al 26 de octubre; el marco abarca siete
export const DIAS = [18, 19, 20, 21, 22, 23, 24, 25, 26], PLACA = 13, VENTANA_X0 = -66;
export const DUCTO = { x: 204, y: -40, w: 60, d: 80 }, SALA_Z = 214;
// los archivos del contrato en producción (public/data del panel en producción, noviembre de 2026), en KB.
// El grosor de cada bandeja sigue su peso en escala logarítmica
export const ARCHIVOS = [
  { id: "export", nombre: "export.csv", kb: 8859, nota: "para el BI del cliente; la sala no lo lee" },
  { id: "algorithm", nombre: "algorithm.json", kb: 1088, nota: "el contrato agregado" },
  { id: "medios", nombre: "medios.json", kb: 763, nota: "cada emisión, con su canal y su hora" },
  { id: "mapa", nombre: "mapa-lima.json", kb: 71, nota: "el mapa de la vía pública" },
  { id: "maia", nombre: "maia-contexto.json", kb: 33, nota: "el cuaderno de MAIA" },
  { id: "busquedas", nombre: "busquedas.json", kb: 14, nota: "Google Trends" },
  { id: "meta", nombre: "meta.json", kb: 0.15, nota: "de cuándo es la data" },
];
const grosor = (kb) => Math.max(2.2, 2.2 + 3.4 * Math.log10(Math.max(1, kb)));

export const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - PATA_H, 0), [DUCTO.x, DUCTO.y, SALA_Z + 46], [DUCTO.x + DUCTO.w + 40, DUCTO.y + DUCTO.d, SALA_Z + 46]],
  ANCHO, ALTO, { pad: 34, azimuth: 36, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const T = (m, text, style) => k.faceTextSvg(m, text, style);
const parte = (id, cuerpo, extra = "") => `<g data-parte="${id}"${extra}>${cuerpo}</g>`;
const porProfundidad = (puntos) => [...puntos].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const tornillos = (plan, inset, z) => {
  const c = k.corners(plan, inset);
  return L(c.map(([x, y]) => k.ring(x, y, 1.6, z, P, 14)).join(""), { tone: "lo" }) + D(c.map(([x, y]) => at([x, y, z])), { size: 0.45 });
};
// una placa con tres rayas de texto, como las de las máquinas
const placaRotulo = (plan, z) => S(k.slabOf(plan, z, 0.6, P, 3), { tone: "lo", crease: "none" })
  + L([0.28, 0.5, 0.72].map((f) => k.lineOnTop([plan.x + 2, plan.y + plan.d * f], [plan.x + plan.w * (f === 0.5 ? 0.6 : 0.8), plan.y + plan.d * f], z + 0.6, P)).join(""), { tone: "mid", free: true });

// ── La base: la mesa del cuarto de máquinas ──
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - PATA_H, BASE_H, P)}"/>`];
  for (const [x, y] of porProfundidad(k.corners(BASE, 26))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - PATA_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BASE_H - PATA_H + 1.6, PATA_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 10, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 6), 0, P, 10), { tone: "lo" }));
  out.push(tornillos(BASE, 12, 0));
  // regla a lo largo del borde delantero, con una marca por estación
  const regla = { x: BASE.x + 40, y: BASE.y + BASE.d - 16, w: BASE.w - 80, d: 7, r: 1 };
  out.push(S(k.slabOf(regla, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(regla.x + 4, regla.x + regla.w - 4, 5, 5, regla.y + 0.8, 0.6, [2, 3.8], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(placaRotulo({ x: BASE.x + BASE.w - 74, y: BASE.y + 10, w: 46, d: 16, r: 1.5 }, 0));
  return out.join("");
}

// ── El reloj del cron: 05:47 de Lima. Esfera arriba, como un reloj de mesa ──
function reloj() {
  const [x, y] = RELOJ, out = [];
  const pie = { x: x - 22, y: y - 22, w: 44, d: 44, r: 4 };
  out.push(`<path class="iso-halo" d="${k.haloOf(pie, 0, RELOJ_Z, P)}"/>`);
  out.push(S(k.slabOf(pie, 0, RELOJ_Z - 6, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.sideSeam(pie, 8, P, 6), { tone: "faint" }));
  out.push(S(k.slabOf(k.insetPlan(pie, 2), RELOJ_Z - 6, 6, P, 6, 0.6), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, RELOJ_R, RELOJ_Z, 4, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, RELOJ_R, RELOJ_Z + 0.6, RELOJ_Z + 3.4, 80, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, RELOJ_R - 2.4, RELOJ_Z + 4, P, 64), { tone: "lo" }));
  const tk = k.radialTicks(x, y, RELOJ_R - 3.2, 60, 5, RELOJ_Z + 4, [1.1, 2.6], P);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  out.push(T(k.topMatrix([x, y + 8], RELOJ_Z + 4, P, "x"), "LIMA", { size: 2.2, tone: "lo", anchor: "middle" }));
  // corona para darle cuerda, al costado
  out.push(S(k.slabOf({ x: x + RELOJ_R - 1, y: y - 2, w: 4, d: 4, r: 1 }, RELOJ_Z + 0.6, 2.6, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x + RELOJ_R + 4, y, 2.4, RELOJ_Z + 0.2, 3.4, P, 18), { tone: "mid" }));
  out.push(L(k.knurl(x + RELOJ_R + 4, y, 2.4, RELOJ_Z + 0.2, RELOJ_Z + 3.6, 14, P), { tone: "lo" }));
  return out.join("");
}
// las agujas, para reconstruirlas en cada cuadro: hora y minuto
export const agujas = (h, m) => {
  const [x, y] = RELOJ, z = RELOJ_Z + 4.2;
  const ang = (f) => f * Math.PI * 2;
  const punta = (a, r) => [x + Math.sin(a) * r, y - Math.cos(a) * r];
  const ah = ang(((h % 12) + m / 60) / 12), am = ang(m / 60);
  return { hora: k.lineOnTop([x, y], punta(ah, RELOJ_R * 0.5), z, P), minuto: k.lineOnTop([x, y], punta(am, RELOJ_R * 0.78), z, P) };
};

// ── Los cables de las fuentes y la tolva de entrada ──
const TOLVA = { x: -280, y: -22, w: 32, d: 44, r: 3 }, TOLVA_H = 34;
function entrada() {
  const out = [];
  // dos conectores en el borde de la mesa: Integrametrics y Google Trends
  const conectores = [[BASE.x + 6, 26], [BASE.x + 6, 50]];
  for (const [cx, cy] of conectores) {
    out.push(S(k.slabOf({ x: cx - 2, y: cy - 6, w: 12, d: 12, r: 2 }, 0, 7, P, 3, 0.4), { tone: "mid" }));
    out.push(L(k.ring(cx + 4, cy, 2.6, 7, P, 18), { tone: "lo" }));
    out.push(D([at([cx + 4, cy, 7])], { size: 0.6, tone: "hi" }));
  }
  // los cables corren por el piso hasta la tolva
  out.push(k.wireSvg(at([BASE.x + 10, 26, 7]), at([TOLVA.x + 6, TOLVA.y + TOLVA.d, 10]), { via: [at([-310, 26, 1]), at([-292, 28, 1]), at([TOLVA.x + 6, TOLVA.y + TOLVA.d + 6, 1])], tone: "mid" }));
  out.push(k.wireSvg(at([BASE.x + 10, 50, 7]), at([TOLVA.x + 20, TOLVA.y + TOLVA.d, 10]), { via: [at([-306, 50, 1]), at([TOLVA.x + 20, 50, 1])], tone: "mid" }));
  // la tolva: una caja con una ranura arriba, por donde caen las fichas a la cinta
  out.push(`<path class="iso-halo" d="${k.haloOf(TOLVA, 0, TOLVA_H, P)}"/>`);
  out.push(S(k.slabOf(TOLVA, 0, TOLVA_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.sideSeam(TOLVA, 10, P, 4), { tone: "faint" }));
  out.push(L(k.planOutline(k.insetPlan(TOLVA, 6), TOLVA_H, P, 3), { tone: "lo" }));
  out.push(L(k.lineOnTop([TOLVA.x + 10, TOLVA.y + 14], [TOLVA.x + 10, TOLVA.y + TOLVA.d - 14], TOLVA_H, P), { tone: "hi" }));
  out.push(tornillos(TOLVA, 3, TOLVA_H));
  return out.join("");
}

// ── La cinta: patas, banda, rodillos y barandas ──
const PATAS = [-220, -104, 12, 128, 176];
function patas() {
  const out = [];
  for (const [x, y] of porProfundidad(PATAS.flatMap((x) => [[x, -14], [x, 14]]))) {
    out.push(S(k.cylinder(x, y, 3.2, 0, 2, P, 20), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 2.2, 2, CINTA_Z - 2, P, 18), { tone: "mid", crease: "none" }));
  }
  return out.join("");
}
function cinta() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CINTA, 6), 0, 0.1, P)}" style="filter:blur(6px)"/>`];
  out.push(S(k.slabOf({ ...CINTA, y: CINTA.y - 3, d: CINTA.d + 6 }, CINTA_Z - 3, 3, P, 6, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(CINTA, CINTA_Z, CINTA_H, P, 8, 0.6), { tone: "mid", crease: "lo" }));
  // las juntas de la banda, de borde a borde
  const juntas = [];
  for (let x = CINTA.x + 12; x < CINTA.x + CINTA.w - 8; x += 14) juntas.push(k.lineOnTop([x, CINTA.y + 1.2], [x, CINTA.y + CINTA.d - 1.2], ENCIMA, P));
  out.push(L(juntas.join(""), { tone: "faint" }));
  // los rodillos de los extremos, a lo largo de y
  for (const x of [CINTA.x + 6, CINTA.x + CINTA.w - 6]) {
    const F = G.frameAlong([x, CINTA.y - 3.4, CINTA_Z + 2], [0, 1, 0]);
    out.push(S(G.disc(0, CINTA.d + 6.8, 3.4, F, P), { tone: "mid" }));
  }
  return out.join("");
}
function barandas() {
  const out = [];
  for (const y of [CINTA.y - 4, CINTA.y + CINTA.d + 1]) {
    out.push(S(k.slabOf({ x: CINTA.x + 14, y, w: CINTA.w - 28, d: 3, r: 1 }, ENCIMA, 4, P, 3, 0.3), { tone: "mid" }));
    out.push(D([CINTA.x + 20, CINTA.x + CINTA.w / 2, CINTA.x + CINTA.w - 20].map((x) => at([x, y + 1.5, ENCIMA + 4])), { size: 0.4 }));
  }
  return out.join("");
}

// ── Las fichas: registros con casilleros fijos. La roja es la señal ──
// posiciones de reposo a lo largo de la cinta (x del centro); la 0 es la señal
export const FICHAS = [
  { x: -222, roja: true, campos: 4 },
  { x: -170, campos: 4 }, { x: -146, campos: 3 }, { x: -96, campos: 4 }, { x: -44, campos: 4 }, { x: 4, campos: 3 }, { x: 52, campos: 4 },
];
export function ficha(f, i) {
  const plan = { x: -FICHA.w / 2, y: -FICHA.d / 2, w: FICHA.w, d: FICHA.d, r: 1.6 };
  const out = [S(k.slabOf(plan, ENCIMA, FICHA_H, P, 3, 0.4), { tone: "hi", crease: "lo", className: f.roja ? "senal" : "" })];
  // los casilleros: fecha, inversión, impresiones, clics, leads
  const z = ENCIMA + FICHA_H, filas = [];
  for (let j = 0; j < 5; j++) {
    const yy = plan.y + 4 + j * 4;
    const largo = j < f.campos ? plan.w - 8 : plan.w * 0.25;
    filas.push(k.lineOnTop([plan.x + 3, yy], [plan.x + 3 + largo, yy], z, P));
  }
  out.push(L(filas.join(""), { tone: f.roja ? "lit" : "mid", free: true }));
  return `<g data-ficha="${i}" transform="${k.translateAlong(P, [f.x, 0, 0])}">${out.join("")}</g>`;
}

// ── Las estaciones: un pórtico sobre la cinta con su módulo ──
const POSTE_R = 2.6;
const posteAtras = (x, h) => S(k.cylinder(x, -26, POSTE_R + 0.8, 0, 2, P, 20), { tone: "lo" }) + S(k.cylinder(x, -26, POSTE_R, 2, h - 2, P, 20), { tone: "mid", crease: "none" });
const posteAdelante = (x, h) => S(k.cylinder(x, 26, POSTE_R + 0.8, 0, 2, P, 20), { tone: "lo" }) + S(k.cylinder(x, 26, POSTE_R, 2, h - 2, P, 20), { tone: "mid", crease: "none" });
const viga = (x, h) => S(k.slabOf({ x: x - 4, y: -30, w: 8, d: 60, r: 1.5 }, h, 5, P, 3, 0.4), { tone: "mid" }) + D([at([x, -26, h + 5]), at([x, 26, h + 5])], { size: 0.45 });

// 1 · La llave: sin token, la compuerta no sube
const LLAVE_H = 62;
function llaveArriba() {
  const x = LLAVE_X, out = [viga(x, LLAVE_H)];
  const caja = { x: x - 11, y: -12, w: 22, d: 24, r: 2.5 };
  out.push(S(k.slabOf(caja, LLAVE_H + 5, 13, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.sideSeam(caja, LLAVE_H + 9, P, 4), { tone: "faint" }));
  out.push(S(k.cylinder(x, 0, 5.6, LLAVE_H + 18, 3, P, 28, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(x, 0, 3.4, LLAVE_H + 21, P, 22), { tone: "lo" }));
  out.push(L(k.lineOnTop([x - 2.2, 0], [x + 2.2, 0], LLAVE_H + 21, P), { tone: "hi" }));
  return out.join("");
}
const compuerta = () => {
  const x = LLAVE_X;
  const plan = { x: x - 1.6, y: -20, w: 3.2, d: 40, r: 0.8 };
  return S(k.slabOf(plan, ENCIMA + 4, LLAVE_H - ENCIMA - 6, P, 2, 0.3), { tone: "hi", crease: "lo" })
    + L([0, 1, 2, 3].map((j) => k.segment([x + 1.6, -16 + j * 10.6, ENCIMA + 6], [x + 1.6, -16 + j * 10.6, LLAVE_H - 4], P)).join(""), { tone: "faint" });
};

// 2 · El calibre de las pruebas: dos mordazas y una luz
const CALIBRE_H = 66;
function calibreArriba() {
  const x = CALIBRE_X, out = [viga(x, CALIBRE_H)];
  for (const y of [-15, 15]) {
    const m = { x: x - 5, y: y - 2.5, w: 10, d: 5, r: 1 };
    out.push(S(k.slabOf(m, ENCIMA + 8, CALIBRE_H - ENCIMA - 8, P, 2, 0.3), { tone: "mid" }));
    out.push(L(k.sideSeam(m, ENCIMA + 12, P, 2), { tone: "faint" }));
  }
  const caja = { x: x - 10, y: -10, w: 20, d: 20, r: 3 };
  out.push(S(k.slabOf(caja, CALIBRE_H + 5, 9, P, 5, 0.6), { tone: "mid" }));
  // la escala del calibre, en la cara de arriba
  const tk = k.topTicks(caja.x + 3, caja.x + caja.w - 3, 2, 5, caja.y + 3, CALIBRE_H + 14, [1.2, 2.4], P);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  return out.join("");
}
export const LUZ = [CALIBRE_X, 4, CALIBRE_H + 14];
const luz = () => S(k.cylinder(LUZ[0], LUZ[1], 3.6, LUZ[2], 4, P, 24, 0.4), { tone: "hi", crease: "lo", className: "luz" })
  + L(k.ring(LUZ[0], LUZ[1], 2, LUZ[2] + 4, P, 16), { tone: "lo" });

// 3 · La ventana de los últimos 7 días: placas de un día colgadas de un riel atrás de la cinta
const RIEL_Z = 74, PLACA_Z0 = 42;
function rielVentana() {
  const out = [];
  const x0 = VENTANA_X0 - 26, x1 = VENTANA_X0 + PLACA * 9 + 16;
  for (const x of [x0, x1]) {
    out.push(S(k.cylinder(x, -40, POSTE_R + 0.8, 0, 2, P, 20), { tone: "lo" }));
    out.push(S(k.cylinder(x, -40, POSTE_R, 2, RIEL_Z - 2, P, 20), { tone: "mid", crease: "none" }));
  }
  out.push(S(k.slabOf({ x: x0 - 4, y: -43, w: x1 - x0 + 8, d: 6, r: 1.5 }, RIEL_Z, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(D([x0 + 10, (x0 + x1) / 2, x1 - 10].map((x) => at([x, -40, RIEL_Z + 4])), { size: 0.45 }));
  return out.join("");
}
// las placas se mueven juntas: una tira de 9 días
export function tiraDias() {
  const out = [];
  DIAS.forEach((d, i) => {
    const x = VENTANA_X0 + i * PLACA;
    const plan = { x: x + 0.8, y: -40.4, w: PLACA - 1.6, d: 1.6, r: 0.4 };
    out.push(S(k.cylinder(x + PLACA / 2, -39.6, 0.7, PLACA_Z0 + 22, RIEL_Z - PLACA_Z0 - 22, P, 10), { tone: "mid", crease: "none" }));
    out.push(`<g data-dia="${d}">${S(k.slabOf(plan, PLACA_Z0, 22, P, 2, 0.2), { tone: "hi", crease: "lo" })}`
      + T(k.sideMatrix([x + PLACA / 2, -38.8], PLACA_Z0 + 14, P, "left"), String(d), { size: 6.2, tone: "hi", anchor: "middle" })
      + T(k.sideMatrix([x + PLACA / 2, -38.8], PLACA_Z0 + 6, P, "left"), "OCT", { size: 2.4, tone: "lo", anchor: "middle" }) + `</g>`);
  });
  return out.join("");
}
// el marco de la ventana: abarca siete placas, fijo; la tira corre por detrás
export const MARCO = { x: VENTANA_X0 + PLACA - 1.4, w: PLACA * 7 + 2.8 };
function marcoVentana() {
  const z0 = PLACA_Z0 - 3, z1 = PLACA_Z0 + 25, y = -37.6;
  const segs = [
    k.segment([MARCO.x, y, z0], [MARCO.x + MARCO.w, y, z0], P), k.segment([MARCO.x, y, z1], [MARCO.x + MARCO.w, y, z1], P),
    k.segment([MARCO.x, y, z0], [MARCO.x, y, z1], P), k.segment([MARCO.x + MARCO.w, y, z0], [MARCO.x + MARCO.w, y, z1], P),
  ];
  return S(k.slabOf({ x: MARCO.x - 1.6, y: -38.4, w: 3.2, d: 1.6, r: 0.4 }, z0, z1 - z0, P, 2), { tone: "mid" })
    + S(k.slabOf({ x: MARCO.x + MARCO.w - 1.6, y: -38.4, w: 3.2, d: 1.6, r: 0.4 }, z0, z1 - z0, P, 2), { tone: "mid" })
    + S(k.slabOf({ x: MARCO.x - 1.6, y: -38.4, w: MARCO.w + 3.2, d: 1.6, r: 0.4 }, z1, 2.4, P, 2), { tone: "mid" })
    + S(k.slabOf({ x: MARCO.x - 1.6, y: -38.4, w: MARCO.w + 3.2, d: 1.6, r: 0.4 }, z0 - 2.4, 2.4, P, 2), { tone: "mid" })
    + L(segs.join(""), { tone: "hi" });
}

// 4 · El cuaderno de MAIA: un brazo deja una copia en el cuaderno, al lado de la cinta
const MAIA_H = 58;
function maiaArriba() {
  const x = MAIA_X, out = [viga(x, MAIA_H)];
  const caja = { x: x - 9, y: 2, w: 18, d: 26, r: 2 };
  out.push(S(k.slabOf(caja, MAIA_H + 5, 8, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(x, 20, 2.2, MAIA_H - 12, 17, P, 18), { tone: "mid", crease: "none" }));
  return out.join("");
}
const CUADERNO = { x: MAIA_X - 12, y: 34, w: 24, d: 30, r: 2 };
function cuaderno() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CUADERNO, 0, 6, P)}"/>`];
  out.push(S(k.slabOf({ x: CUADERNO.x - 4, y: CUADERNO.y - 4, w: CUADERNO.w + 8, d: CUADERNO.d + 8, r: 3 }, 0, 6, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf(CUADERNO, 6, 3, P, 3, 0.4), { tone: "hi", crease: "lo" }));
  const z = 9;
  out.push(L([0, 1, 2, 3, 4].map((j) => k.lineOnTop([CUADERNO.x + 4, CUADERNO.y + 6 + j * 4.4], [CUADERNO.x + CUADERNO.w - (j % 2 ? 9 : 5), CUADERNO.y + 6 + j * 4.4], z, P)).join(""), { tone: "mid", free: true }));
  out.push(L(k.lineOnTop([CUADERNO.x + 2, CUADERNO.y], [CUADERNO.x + 2, CUADERNO.y + CUADERNO.d], z, P), { tone: "lo" }));
  return out.join("");
}

// 5 · La balanza del commit: lo de ayer contra lo de hoy; si no cambió nada, no se publica
const COMMIT_H = 60;
function commitArriba() {
  const x = COMMIT_X, out = [viga(x, COMMIT_H)];
  out.push(S(k.cylinder(x, 0, 2, COMMIT_H + 5, 12, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: x - 1.6, y: -18, w: 3.2, d: 36, r: 0.8 }, COMMIT_H + 17, 2.4, P, 2), { tone: "mid" }));
  return out.join("");
}
export const PLATOS = [[COMMIT_X, -16], [COMMIT_X, 16]];
const plato = (j) => {
  const [x, y] = PLATOS[j];
  return S(k.cylinder(x, y, 0.6, COMMIT_H + 9, 8, P, 10), { tone: "mid", crease: "none" })
    + S(k.cylinder(x, y, 7, COMMIT_H + 7.6, 1.6, P, 28, 0.3), { tone: "hi", crease: "lo" })
    + S(k.slabOf({ x: x - 4, y: y - 3, w: 8, d: 6, r: 1 }, COMMIT_H + 9.2, j === 0 ? 2.6 : 3.4, P, 2), { tone: j === 0 ? "mid" : "hi" });
};

// ── El ducto del contrato y el montacargas ──
const ESQUINAS = [[DUCTO.x, DUCTO.y], [DUCTO.x + DUCTO.w, DUCTO.y], [DUCTO.x, DUCTO.y + DUCTO.d], [DUCTO.x + DUCTO.w, DUCTO.y + DUCTO.d]];
const posteDucto = ([x, y]) => S(k.cylinder(x, y, 4.6, 0, 2.4, P, 24), { tone: "lo" }) + S(k.cylinder(x, y, 3.4, 2.4, SALA_Z - 2.4, P, 24), { tone: "mid", crease: "none" })
  + L([60, 120, 180].map((z) => k.sideArc(x, y, 3.4, z, P, 16)).join(""), { tone: "faint" });
export const PLATAFORMA_Z0 = ENCIMA - 4;
export function montacargas() {
  // la plataforma con las bandejas apiladas: cada una un archivo de public/data
  const plan = { x: DUCTO.x + 6, y: DUCTO.y + 6, w: DUCTO.w - 12, d: DUCTO.d - 12, r: 3 };
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(plan, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(tornillos(plan, 4, 3));
  let z = 3;
  ARCHIVOS.forEach((a, i) => {
    const g = grosor(a.kb), b = k.insetPlan(plan, 3 + (i % 2) * 0.8);
    out.push(`<g data-bandeja="${a.id}">${S(k.slabOf(b, z, g, P, 4, 0.4), { tone: a.id === "algorithm" ? "hi" : "mid", crease: "lo" })}`
      + L(k.planOutline(k.insetPlan(b, 3), z + g, P, 3), { tone: "faint" }) + `</g>`);
    z += g + 0.6;
  });
  return out.join("");
}
// el armario aparte de las marcas vigiladas, con su candado: no se comunica con el ducto
const VIGILADAS = { x: DUCTO.x + DUCTO.w + 14, y: -22, w: 26, d: 44, r: 3 };
function vigiladas() {
  const out = [`<path class="iso-halo" d="${k.haloOf(VIGILADAS, 0, 30, P)}"/>`];
  out.push(S(k.slabOf(VIGILADAS, 0, 30, P, 4, 0.6), { tone: "mid" }));
  out.push(L([10, 20].map((z) => k.sideSeam(VIGILADAS, z, P, 4)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(VIGILADAS.x + VIGILADAS.w / 2, VIGILADAS.y + VIGILADAS.d / 2, 4.4, 30, 5, P, 24, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(VIGILADAS.x + VIGILADAS.w / 2, VIGILADAS.y + VIGILADAS.d / 2, 2.4, 35, P, 16), { tone: "lo" }));
  out.push(placaRotulo({ x: VIGILADAS.x + 4, y: VIGILADAS.y + 4, w: 18, d: 8, r: 1 }, 30));
  return out.join("");
}
// la sala, arriba: el piso del frontend, con su monitor
const SALA = { x: DUCTO.x - 20, y: DUCTO.y - 14, w: DUCTO.w + 92, d: DUCTO.d + 28, r: 6 };
function sala() {
  const out = [];
  out.push(S(k.slabOf(SALA, SALA_Z, 6, P, 8, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(SALA, 5), SALA_Z + 6, P, 6), { tone: "lo" }));
  // el hueco del ducto en el piso de la sala
  out.push(L(k.planOutline({ x: DUCTO.x + 4, y: DUCTO.y + 4, w: DUCTO.w - 8, d: DUCTO.d - 8, r: 3 }, SALA_Z + 6, P, 3), { tone: "hi" }));
  out.push(tornillos(SALA, 10, SALA_Z + 6));
  return out.join("");
}
export const MONITOR = { x: DUCTO.x + DUCTO.w + 8, y: 2, w: 60, z: SALA_Z + 14, h: 38 };
function monitor() {
  const m = MONITOR, out = [];
  out.push(S(k.slabOf({ x: m.x + m.w / 2 - 10, y: m.y + 4, w: 20, d: 12, r: 2 }, SALA_Z + 6, 2, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: m.x + m.w / 2 - 2, y: m.y + 6, w: 4, d: 3, r: 0.8 }, SALA_Z + 8, m.z - SALA_Z - 8, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: m.x, y: m.y, w: m.w, d: 4, r: 1.2 }, m.z, m.h, P, 3, 0.4), { tone: "mid" }));
  return out.join("");
}
// la pantalla del monitor: un panel en miniatura (encabezado, cuatro capas, tres tarjetas) en su cara de adelante
export function pantalla() {
  const m = MONITOR, y = m.y + 4.05, z0 = m.z + 3, z1 = m.z + m.h - 3, x0 = m.x + 3, x1 = m.x + m.w - 3;
  const r = (xa, xb, za, zb) => `M${at([xa, y, za]).join(" ")}L${at([xb, y, za]).join(" ")}L${at([xb, y, zb]).join(" ")}L${at([xa, y, zb]).join(" ")}Z`;
  const tarjetas = [0, 1, 2].map((i) => r(x0 + 2 + i * 18, x0 + 16 + i * 18, z0 + 3, z0 + 18)).join("");
  return `<path class="pantalla-fondo" d="${r(x0, x1, z0, z1)}"/>`
    + `<path class="pantalla-barra" d="${r(x0, x1, z1 - 5, z1)}"/>`
    + `<path class="pantalla-tarjeta" d="${tarjetas}"/>`
    + `<path class="pantalla-dato" d="${r(x0 + 4, x0 + 10, z0 + 12, z0 + 15)}"/>`;
}

// ── La figura completa, pintada de atrás hacia adelante ──
export function figura({ id = "cuarto", viewBox } = {}) {
  const fichas = FICHAS.map(ficha).join("");
  const body = [
    base(),
    reloj(),
    `<g data-parte="agujas"><path class="iso-line" data-tone="hi" data-free="end" data-aguja="hora" d="${agujas(0, 0).hora}" style="stroke-width:1.3"/><path class="iso-line" data-tone="lit" data-free="end" data-aguja="minuto" d="${agujas(0, 0).minuto}" style="stroke-width:0.9"/>${D([at([RELOJ[0], RELOJ[1], RELOJ_Z + 4.2])], { size: 0.9, tone: "hi" })}</g>`,
    rielVentana(),
    `<g data-parte="tira">${tiraDias()}</g>`,
    marcoVentana(),
    entrada(),
    [LLAVE_X, CALIBRE_X, MAIA_X, COMMIT_X].map((x, i) => posteAtras(x, [LLAVE_H, CALIBRE_H, MAIA_H, COMMIT_H][i])).join(""),
    patas(),
    cinta(),
    parte("compuerta", compuerta()),
    `<g data-parte="fichas">${fichas}</g>`,
    barandas(),
    [LLAVE_X, CALIBRE_X, MAIA_X, COMMIT_X].map((x, i) => posteAdelante(x, [LLAVE_H, CALIBRE_H, MAIA_H, COMMIT_H][i])).join(""),
    llaveArriba(),
    calibreArriba(),
    parte("luz", luz()),
    maiaArriba(),
    cuaderno(),
    commitArriba(),
    parte("plato-0", plato(0)), parte("plato-1", plato(1)),
    ESQUINAS.filter(([, y]) => y < 0).map(posteDucto).join(""),
    parte("montacargas", montacargas(), ` transform="${k.translateAlong(P, [0, 0, PLATAFORMA_Z0])}"`),
    ESQUINAS.filter(([, y]) => y > 0).map(posteDucto).join(""),
    vigiladas(),
    sala(),
    monitor(),
    parte("pantalla", pantalla()),
  ];
  const svg = k.figureSvg({
    width: ANCHO, height: ALTO,
    label: "El cuarto de máquinas de The Algorithm: un reloj que marca las 5:47, dos cables de fuentes que llegan a una tolva, una cinta con fichas (registros) que pasa por una compuerta con llave (el token), un calibre (las pruebas), una ventana con los últimos siete días, un cuaderno (el contexto de MAIA) y una balanza (el commit si algo cambió), hasta un ducto con bandejas (los archivos del contrato) y un montacargas que las sube a la sala.",
    body,
  });
  return viewBox ? svg.replace(`viewBox="0 0 ${ANCHO} ${ALTO}"`, `viewBox="${viewBox}" data-figura="${id}"`) : svg.replace("<svg", `<svg data-figura="${id}"`);
}

// los encuadres de cada lámina, en coordenadas del viewBox: centro en un punto del mundo y un ancho
export function encuadre(punto, ancho, aspecto = ANCHO / ALTO) {
  const [cx, cy] = at(punto), alto = ancho / aspecto;
  return [cx - ancho / 2, cy - alto / 2, ancho, alto].map((v) => Math.round(v * 10) / 10).join(" ");
}
// puntos del mundo para los pines de la leyenda
export const PINES = {
  reloj: [RELOJ[0], RELOJ[1], RELOJ_Z + 8],
  fuentes: [BASE.x + 10, 38, 9],
  tolva: [TOLVA.x + TOLVA.w / 2, 0, TOLVA_H + 4],
  llave: [LLAVE_X, 0, LLAVE_H + 26],
  calibre: [CALIBRE_X, 0, CALIBRE_H + 22],
  ventana: [MARCO.x + MARCO.w / 2, -38, PLACA_Z0 + 32],
  cuaderno: [MAIA_X, 48, 14],
  commit: [COMMIT_X, 0, COMMIT_H + 24],
  ducto: [DUCTO.x + DUCTO.w / 2, DUCTO.y + DUCTO.d / 2, 84],
  vigiladas: [VIGILADAS.x + VIGILADAS.w / 2, 0, 40],
  sala: [MONITOR.x + MONITOR.w / 2, MONITOR.y, MONITOR.z + MONITOR.h + 6],
};
export const pin = (id) => at(PINES[id]);
export { at };
