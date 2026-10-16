// Utilidades de dibujo de Quincha. Puras: no saben de React ni de la data.
import { useEffect, useRef, useState } from 'react';

export const lineal = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

// Marcas de eje en pasos de 1, 2, 2,5 o 5 por potencia de 10; siempre llegan al máximo
export function marcas(max, n = 4, min = 0) {
  if (!(max > min)) return [min, min + 1];
  const paso0 = (max - min) / n;
  const p = 10 ** Math.floor(Math.log10(paso0));
  const paso = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= paso0);
  const out = [];
  for (let v = Math.floor(min / paso) * paso; v < max + paso * 0.999; v += paso) out.push(+v.toFixed(10));
  return out;
}

// Trazo de una serie: un valor nulo corta la línea (no se inventa el día que falta)
// Área bajo una serie, hasta la línea base; un hueco corta el área igual que corta la línea
export function area(serie, x, y, base) {
  let d = '', tramo = [];
  const cerrar = () => { if (tramo.length > 1) d += `M${x(tramo[0]).toFixed(1)},${base.toFixed(1)}` + tramo.map((i) => `L${x(i).toFixed(1)},${y(serie[i].valor).toFixed(1)}`).join('') + `L${x(tramo.at(-1)).toFixed(1)},${base.toFixed(1)}Z`; tramo = []; };
  serie.forEach((p, i) => { if (p.valor == null) cerrar(); else tramo.push(i); });
  cerrar();
  return d;
}

export function camino(serie, x, y) {
  let d = '', abierto = false;
  serie.forEach((p, i) => {
    if (p.valor == null) { abierto = false; return; }
    d += `${abierto ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`;
    abierto = true;
  });
  return d;
}

export const ultimoConValor = (serie) => { for (let i = serie.length - 1; i >= 0; i--) if (serie[i].valor != null) return i; return -1; };

// Margen para rótulos de fila: el texto más largo (≈ 6,9 px por carácter a 12 px), con tope de 45 % del ancho
export const margenRotulos = (nombres, ancho) => Math.min(Math.round(ancho * 0.5), 16 + Math.ceil(Math.max(...nombres.map((n) => String(n).length)) * 7.8));
export const recortar = (t, px) => { const max = Math.max(4, Math.floor((px - 16) / 7.8)); t = String(t); return t.length > max ? t.slice(0, max - 1) + '…' : t; };

// Separa rótulos verticales que chocan: empuja hacia abajo de a `paso` px
export function separar(ys, paso = 14) {
  const o = ys.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  for (let k = 1; k < o.length; k++) if (o[k].v < o[k - 1].v + paso) o[k].v = o[k - 1].v + paso;
  return o.sort((a, b) => a.i - b.i).map((p) => p.v);
}

// Ancho real del contenedor: los gráficos se dibujan a su tamaño, no se escalan (el texto queda a 12 px en un celular)
export function useAncho(inicial = 640) {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(inicial);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => { const w = Math.floor(e.contentRect.width); if (w > 0) setAncho(w); });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, Math.max(260, ancho)];
}

// Paso de la rampa secuencial (7 escalones de un solo tono)
export const escalon = (v, max) => (v == null || !(max > 0) ? null : Math.min(6, Math.floor((v / max) * 7)));
