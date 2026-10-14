// Gráficos de Quincha. SVG propio: cada marca lleva data-valor para que la prueba de humo cruce
// lo dibujado contra la capa de cálculo. Todo color sale de los tokens (clases en graficos.css).
// Ninguno calcula datos: reciben valores ya armados por src/calculo.
import { useId, useState } from 'react';
import { lineal, marcas, camino, ultimoConValor, margenRotulos, recortar, separar, useAncho, escalon } from './util.js';
import { numero, fecha, fechaSinAnio, fechaCorta, mesCorto, mesAnio, porcentaje } from '../formato.js';

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Envoltura: mide el ancho, pone una tabla para lectores de pantalla y la pista flotante.
// Toda marca o zona con data-pista muestra su texto al pasar el puntero o al enfocarla.
export function Grafico({ etiqueta, tabla, children, className = '' }) {
  const [ref, ancho] = useAncho();
  const [pista, setPista] = useState(null);
  const mover = (e) => {
    const z = e.target.closest?.('[data-pista]');
    if (!z || !ref.current) return setPista(null);
    const caja = ref.current.getBoundingClientRect();
    setPista({ texto: z.getAttribute('data-pista'), x: e.clientX - caja.left, y: e.clientY - caja.top, ancho: caja.width });
  };
  return (
    <figure className={`q-grafico ${className}`} ref={ref} onPointerMove={mover} onPointerLeave={() => setPista(null)}>
      {children(ancho)}
      {pista && (
        <div className="q-pista" role="presentation" style={{ left: Math.min(Math.max(pista.x, 90), pista.ancho - 90), top: pista.y }}>
          {pista.texto.split('\n').map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
      {tabla && (
        <div className="solo-lector">{/* una tabla no recorta su contenido: el contenedor sí */}
          <table>
            <caption>{etiqueta}</caption>
            <thead><tr>{tabla.columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>{tabla.filas.map((f, i) => <tr key={i}>{f.map((v, j) => (j ? <td key={j}>{v}</td> : <th key={j} scope="row">{v}</th>))}</tr>)}</tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

// El rayado (pocos casos) usa un id único por gráfico: nunca dos patrones con el mismo id en la página
function Svg({ ancho, alto, etiqueta, children }) {
  const id = 'q-rayado-' + useId().replace(/:/g, '');
  return (
    <svg className="q-svg" viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label={etiqueta} style={{ '--rayado': `url(#${id})` }}>
      <defs>
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <rect className="q-rayado-fondo" width="5" height="5" />
          <line x1="0" y1="0" x2="0" y2="5" className="q-rayado-linea" />
        </pattern>
      </defs>
      {children}
    </svg>
  );
}

// Zonas de lectura: franjas invisibles más grandes que la marca, una por punto o por fila
const Zona = ({ x, y, w, h, pista }) => <rect className="q-zona" x={x} y={y} width={Math.max(1, w)} height={Math.max(1, h)} data-pista={pista} />;

// ─────────────── Línea con período de comparación en gris y eventos al pie ───────────────
export function Linea({ serie, previa, eventos = [], formato = numero, alto: altoPedido, etiqueta, rotuloX = 'dia' }) {
  const tabla = { columnas: ['Fecha', 'Valor', ...(previa ? ['Comparación'] : [])], filas: serie.map((p, i) => [p.fecha, formato(p.valor), ...(previa ? [formato(previa[i]?.valor)] : [])]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = altoPedido || Math.round(Math.min(280, Math.max(200, ancho * 0.42)));
        const m = { t: 18, r: 56, b: 26, l: 44 };
        const vals = [...serie, ...(previa || [])].map((p) => p.valor).filter((v) => v != null);
        const ys = marcas(Math.max(...vals, 1));
        const x = lineal(0, serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const iu = ultimoConValor(serie);
        const ip = previa ? ultimoConValor(previa) : -1;
        // sin serie previa, el rótulo final va a la altura de su punto
        const [ya, yb] = iu >= 0 && ip >= 0 ? separar([y(serie[iu].valor) + 4, y(previa[ip].valor) + 4], 14) : [iu >= 0 ? y(serie[iu].valor) + 4 : 0];
        const paso = Math.max(1, Math.ceil(56 / ((ancho - m.l - m.r) / Math.max(1, serie.length - 1))));
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            {serie.map((p, i) => {
              const mostrar = rotuloX === 'mes' ? i % paso === 0 : rotuloX === 'semana' ? i % Math.max(paso, 4) === 0 : (serie.length <= 45 ? i % Math.max(7, paso) === 0 : p.fecha.endsWith('-01'));
              return mostrar ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{rotuloX === 'mes' ? mesCorto(+p.fecha.slice(5, 7)) : fechaCorta(p.fecha)}</text> : null;
            })}
            {serie.map((p, i) => <Zona key={'z' + p.fecha} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`${fecha(p.fecha)}\n${formato(p.valor)}${previa ? `\ncomparación: ${formato(previa[i]?.valor)}` : ''}`} />)}
            {eventos.map((e) => { const i = serie.findIndex((p) => p.fecha === e.fecha); return i < 0 ? null : <g key={e.fecha} className="q-evento"><line x1={x(i)} x2={x(i)} y1={m.t} y2={alto - m.b} /><text x={x(i) + 4} y={m.t + 10}>{e.texto}</text></g>; })}
            {serie.map((p, i) => (p.valor == null && i > 0 && i < serie.length - 1 ? <rect key={'h' + p.fecha} className="q-hueco" x={x(i) - 3} y={m.t} width={6} height={alto - m.b - m.t} /> : null))}
            {previa && <path className="q-linea-previa" d={camino(previa, x, y)} />}
            <path className="q-linea" d={camino(serie, x, y)} />
            {serie.map((p, i) => (p.valor != null ? <circle key={p.fecha} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-fecha={p.fecha} data-valor={p.valor} /> : null))}
            {iu >= 0 && <><circle className="q-punto-final" cx={x(iu)} cy={y(serie[iu].valor)} r="4" /><text className="q-rotulo-final" x={x(iu) + 8} y={ya}>{formato(serie[iu].valor)}</text></>}
            {ip >= 0 && <text className="q-rotulo-previo" x={x(ip) + 8} y={yb}>{formato(previa[ip].valor)}</text>}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Pequeños múltiplos con eje común ───────────────
export function Multiplos({ paneles, formato = numero, etiqueta }) {
  const max = Math.max(1, ...paneles.flatMap((p) => p.serie.map((s) => s.valor ?? 0)));
  return (
    <div className="q-multiplos" role="group" aria-label={etiqueta}>
      {paneles.map((p) => (
        <Grafico key={p.nombre} etiqueta={p.nombre} className="q-multiplo">
          {(ancho) => {
            const alto = 96, m = { t: 6, r: 40, b: 4, l: 2 };
            const ys = marcas(max, 2);
            const x = lineal(0, p.serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
            const iu = ultimoConValor(p.serie);
            return (
              <>
                <figcaption className="q-multiplo-cab"><span>{p.nombre}</span><span className="q-nota">{p.nota}</span></figcaption>
                <Svg ancho={ancho} alto={alto} etiqueta={p.nombre}>
                  <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(0)} y2={y(0)} />
                  <path className="q-linea" d={camino(p.serie, x, y)} />
                  {iu >= 0 && <><circle className="q-punto-final" cx={x(iu)} cy={y(p.serie[iu].valor)} r="3" data-valor={p.serie[iu].valor} /><text className="q-rotulo-final" x={x(iu) + 6} y={y(p.serie[iu].valor) + 4}>{formato(p.serie[iu].valor)}</text></>}
                </Svg>
              </>
            );
          }}
        </Grafico>
      ))}
    </div>
  );
}

// ─────────────── Pesas: dos valores de la misma escala por fila ───────────────
export function Pesas({ filas, formato = numero, max, min = 0, rotuloA, rotuloB, centro = min < 0 ? 0 : null, etiqueta }) {
  const tabla = { columnas: ['', rotuloA, rotuloB], filas: filas.map((f) => [f.nombre, formato(f.a), formato(f.b)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 32, m = { t: 6, r: 64, b: 6, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b + (centro != null ? 18 : 0);
        const tope = max ?? marcas(Math.max(1, ...filas.flatMap((f) => [f.a ?? 0, f.b ?? 0])), 4).at(-1);
        const x = lineal(min, tope, m.l, ancho - m.r);
        return (
          <>
          <ul className="q-leyenda q-leyenda-pesas" aria-hidden="true">
            <li><span className="q-muestra q-muestra-previa" />{rotuloA}</li>
            <li><span className="q-muestra q-muestra-actual" /><b>{rotuloB}</b></li>
          </ul>
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {filas.map((f, i) => {
              const cy = m.t + i * fila + fila / 2;
              return (
                <g key={f.nombre}>
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <Zona x={0} y={cy - fila / 2} w={ancho} h={fila} pista={`${f.nombre}\n${rotuloA}: ${formato(f.a)}\n${rotuloB}: ${formato(f.b)}`} />
                  <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={cy} y2={cy} />
                  {centro != null && <line className="q-separador" x1={x(centro)} x2={x(centro)} y1={cy - 10} y2={cy + 10} />}
                  {f.a != null && f.b != null && <line className="q-pesa" x1={x(f.a)} x2={x(f.b)} y1={cy} y2={cy} />}
                  {f.a != null && <circle className="q-punto-previo" cx={x(f.a)} cy={cy} r="5" data-valor={f.a} />}
                  {f.b != null && <circle className="q-punto-actual" cx={x(f.b)} cy={cy} r="6" data-valor={f.b} />}
                  <text className="q-rotulo-valor" x={x(Math.max(f.a ?? min, f.b ?? min)) + 10} y={cy + 4}>{formato(f.b)}</text>
                </g>
              );
            })}
            {centro != null && [min, centro, tope].map((t) => <text key={t} className="q-eje" x={x(t)} y={alto - 2} textAnchor="middle">{formato(t)}</text>)}
          </Svg>
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Pendiente: dos momentos, una escala ───────────────
export function Pendiente({ filas, formato = numero, rotuloA, rotuloB, resaltar = [], etiqueta }) {
  const tabla = { columnas: ['', rotuloA, rotuloB], filas: filas.map((f) => [f.nombre, formato(f.a), formato(f.b)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = 280, ml = Math.min(150, ancho * 0.36), mr = Math.min(150, ancho * 0.36), m = { t: 30, b: 14 };
        const tope = Math.max(1, ...filas.flatMap((f) => [f.a, f.b]));
        const y = lineal(0, tope, alto - m.b, m.t), xa = ml, xb = ancho - mr;
        const la = separar(filas.map((f) => y(f.a) + 4)), lb = separar(filas.map((f) => y(f.b) + 4));
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <text className="q-eje" x={xa} y={14} textAnchor="middle">{rotuloA}</text><text className="q-eje" x={xb} y={14} textAnchor="middle">{rotuloB}</text>
            {filas.map((f, i) => {
              const r = resaltar.includes(f.nombre);
              return (
                <g key={f.nombre}>
                  <line className={r ? 'q-pendiente-propia' : 'q-pendiente'} x1={xa} y1={y(f.a)} x2={xb} y2={y(f.b)} />
                  <circle className={r ? 'q-punto-actual' : 'q-punto-previo'} cx={xa} cy={y(f.a)} r="4" data-valor={f.a} />
                  <circle className={r ? 'q-punto-actual' : 'q-punto-previo'} cx={xb} cy={y(f.b)} r="4" data-valor={f.b} />
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={xa - 8} y={la[i]} textAnchor="end">{recortar(f.nombre, ml - 40)} {formato(f.a)}</text>
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={xb + 8} y={lb[i]}>{formato(f.b)} {recortar(f.nombre, mr - 40)}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Bala (Few 2013): valor, marca y bandas de un tono; el estado va escrito ───────────────
export function Bala({ filas, max, formato = numero, formatoEje, etiqueta }) {
  const tabla = { columnas: ['', 'Valor', 'Referencia'], filas: filas.map((f) => [f.nombre, formato(f.valor), formato(f.marca)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const angosto = ancho < 520;
        const fila = 44, m = { t: 6, r: angosto ? 76 : 132, b: 24, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b;
        const x = lineal(0, max, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {marcas(max, angosto ? 2 : 4).filter((v) => v <= max).map((v) => <text key={v} className="q-eje" x={x(v)} y={alto - 6} textAnchor="middle">{(formatoEje ?? formato)(v)}</text>)}
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              let desde = 0;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila - 8} pista={`${f.nombre}\n${formato(f.valor)}${f.marca != null ? `\nreferencia: ${formato(f.marca)}` : ''}${f.estado ? `\n${f.estado}` : ''}`} />
                  {f.bandas.map((b, k) => { const r = <rect key={k} className={`q-banda q-banda-${f.bandas.length - 1 - k}`} x={x(desde)} y={cy + 4} width={Math.max(0, x(Math.min(b.hasta, max)) - x(desde))} height={fila - 16} />; desde = Math.min(b.hasta, max); return r; })}
                  {f.valor != null && <rect className="q-barra-valor" x={x(0)} y={cy + 12} width={Math.max(1, x(Math.min(f.valor, max)) - x(0))} height={fila - 32} data-valor={f.valor} />}
                  {f.marca != null && <line className="q-marca" x1={x(f.marca)} x2={x(f.marca)} y1={cy + 6} y2={cy + fila - 14} data-valor={f.marca} />}
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + fila / 2 + 1} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <text className={`q-rotulo-valor${f.tono ? ' q-' + f.tono : ''}`} x={x(Math.min(max, Math.max(f.valor ?? 0, f.marca ?? 0))) + 8} y={cy + fila / 2 + 1}>{formato(f.valor)}{f.estado && !angosto ? ` ${f.estado}` : ''}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Barras ordenadas, con el valor de comparación como raya ───────────────
export function Barras({ filas, formato = numero, max: maxComun, margen, margenDer, resaltar, rotuloPrevio, etiqueta }) {
  const tabla = { columnas: ['', 'Valor', 'Comparación'], filas: filas.map((f) => [f.nombre, formato(f.valor), f.previo == null ? 'sin dato' : formato(f.previo)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const conPrevio = rotuloPrevio && filas.some((f) => f.previo != null);
        const fila = 30, m = { t: conPrevio ? 26 : 4, r: margenDer ?? (filas.some((f) => f.nota) ? 156 : 72), b: 4, l: margen ?? margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b;
        const max = maxComun ?? Math.max(1, ...filas.flatMap((f) => [f.valor ?? 0, f.previo ?? 0]));
        const x = lineal(0, max, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {conPrevio && <g><line className="q-raya-previa" x1={m.l + 1} x2={m.l + 1} y1={4} y2={18} /><text className="q-eje" x={m.l + 10} y={15}>{rotuloPrevio}</text></g>}
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              const r = resaltar && resaltar === f.nombre;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${f.valor == null ? f.nota || 'sin dato' : formato(f.valor)}${f.previo != null ? `\ncomparación: ${formato(f.previo)}` : ''}`} />
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={m.l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  {f.valor == null ? <text className="q-nota" x={m.l} y={cy + fila / 2 + 4}>{f.nota || 'sin dato'}</text> : <>
                    {f.valor > 0 && <rect className={r ? 'q-barra-acento' : 'q-barra'} x={x(0)} y={cy + 7} width={Math.max(1, x(f.valor) - x(0))} height={fila - 14} rx="2" data-valor={f.valor} />}
                    {f.previo != null && <line className="q-raya-previa" x1={x(f.previo)} x2={x(f.previo)} y1={cy + 3} y2={cy + fila - 3} data-valor={f.previo} />}
                    <text className="q-rotulo-valor" x={x(Math.max(f.valor, f.previo ?? 0)) + 8} y={cy + fila / 2 + 4}>{formato(f.valor)}{f.nota && <tspan className="q-nota"> · {f.nota}</tspan>}</text>
                  </>}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Franja: partes de un todo, rótulo y leyenda con el mismo reparto ───────────────
export function Franja({ partes, leyenda = true, etiqueta, formato = (p) => porcentaje(p) }) {
  const tabla = { columnas: ['Parte', 'Valor', '%'], filas: partes.map((p) => [p.nombre, numero(p.valor), p.pct == null ? '' : formato(p.pct)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
        let x0 = 0;
        return (
          <>
            <Svg ancho={ancho} alto={30} etiqueta={etiqueta}>
              {partes.map((p, i) => { const w = (p.valor / total) * ancho; const r = <rect key={p.nombre} className={`q-parte ${p.clase || 'q-p' + i}`} x={x0 + (i ? 2 : 0)} y={4} width={Math.max(0, w - (i ? 2 : 0))} height={22} data-valor={p.valor} />; x0 += w; return r; })}
            </Svg>
            {leyenda && <ul className="q-leyenda">{partes.map((p, i) => <li key={p.nombre}><span className={`q-muestra ${p.clase || 'q-p' + i}`} />{p.nombre} <b data-valor={p.pct ?? p.valor}>{p.pct == null ? numero(p.valor) : formato(p.pct)}</b>{p.nota && <span className="q-nota"> · {p.nota}</span>}</li>)}</ul>}
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Etapas de una cohorte, desde una base común ───────────────
export function Etapas({ filas, etiqueta }) {
  const tabla = { columnas: ['Etapa', 'Personas', '% de la anterior'], filas: filas.map((f, i) => [f.nombre, numero(f.valor), i ? porcentaje((f.valor / filas[i - 1].valor) * 100) : '']) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 40, m = { t: 4, r: Math.min(170, Math.round(ancho * 0.4)), b: 4, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b;
        const x = lineal(0, filas[0].valor || 1, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              const tasa = i && filas[i - 1].valor ? f.valor / filas[i - 1].valor : null;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${numero(f.valor)}${tasa != null ? `\n${porcentaje(tasa * 100, 1)} de la anterior` : ''}`} />
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <rect className={i === filas.length - 1 ? 'q-barra-acento' : 'q-barra'} x={x(0)} y={cy + 9} width={Math.max(1, x(f.valor) - x(0))} height={fila - 18} rx="2" data-valor={f.valor} />
                  <text className="q-rotulo-valor" x={x(f.valor) + 8} y={cy + fila / 2 + 4}>{numero(f.valor)}{tasa != null && <tspan className="q-nota"> · {porcentaje(tasa * 100, tasa < 0.1 ? 1 : 0)} de la anterior</tspan>}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Retícula de 100: solo la parte que importa en color ───────────────
export function Reticula({ partes, cuadros, etiqueta }) {
  const tabla = { columnas: ['Parte', 'De cada 100'], filas: partes.map((p, i) => [p.nombre, cuadros[i]]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} className="q-reticula">
      {(ancho) => {
        const lado = Math.max(14, Math.min(22, Math.floor(Math.min(ancho, 260) / 10)));
        let k = 0;
        return (
          <div className="q-reticula-cuerpo">
            <Svg ancho={lado * 10} alto={lado * 10} etiqueta={etiqueta}>
              {cuadros.flatMap((n, i) => Array.from({ length: n }, () => { const kk = k++; return <rect key={kk} className={`q-parte q-g${Math.min(i, 4)}`} x={(kk % 10) * lado} y={Math.floor(kk / 10) * lado} width={lado - 3} height={lado - 3} rx="2" />; }))}
            </Svg>
            <ul className="q-leyenda">{partes.map((p, i) => <li key={p.nombre}><span className={`q-muestra q-g${Math.min(i, 4)}`} />{p.nombre} <b data-valor={cuadros[i]}>{cuadros[i]}</b> de cada 100</li>)}</ul>
          </div>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Mapa de calor hora × día, con escala visible ───────────────
export function MapaCalor({ matriz, formato = numero, etiqueta }) {
  const max = Math.max(...matriz.flat().filter((v) => v != null));
  const tabla = { columnas: ['Día', ...Array.from({ length: 24 }, (_, h) => `${h} h`)], filas: matriz.map((f, i) => [DIAS[i], ...f.map((v) => formato(v))]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const m = { t: 22, r: 4, b: 4, l: 78 }, ch = 26;
        const cw = (ancho - m.l - m.r) / 24, alto = m.t + 7 * ch + m.b;
        return (
          <>
            <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
              {Array.from({ length: 24 }, (_, h) => (h % (cw < 18 ? 6 : 3) === 0 ? <text key={h} className="q-eje" x={m.l + h * cw + cw / 2} y={14} textAnchor="middle">{h} h</text> : null))}
              {matriz.map((fila, i) => (
                <g key={i}>
                  <text className="q-rotulo-fila" x={m.l - 8} y={m.t + i * ch + ch / 2 + 4} textAnchor="end">{DIAS[i]}</text>
                  {fila.map((v, j) => { const e = escalon(v, max); return <rect key={j} className={e == null ? 'q-celda q-sin-dato' : `q-celda q-q${e}`} x={m.l + j * cw + 1} y={m.t + i * ch + 1} width={Math.max(1, cw - 2)} height={ch - 2} rx="2" data-valor={v ?? ''} data-pista={`${DIAS[i]}, ${j} h\n${formato(v)}`} />; })}
                </g>
              ))}
            </Svg>
            <div className="q-escala" aria-hidden="true"><span>{formato(0)}</span>{[0, 1, 2, 3, 4, 5, 6].map((k) => <i key={k} className={`q-q${k}`} />)}<span>{formato(max)}</span></div>
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dos columnas alineadas, cada una con su escala (nunca doble eje) ───────────────
export function Columnas({ filas, tituloA, tituloB, formatoA = numero, formatoB = numero, etiqueta }) {
  const tabla = { columnas: ['', tituloA, tituloB], filas: filas.map((f) => [f.nombre, formatoA(f.a), f.b == null ? 'sin dato' : formatoB(f.b)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 34, l = margenRotulos(filas.map((f) => f.nombre), ancho), hueco = 24, m = { t: 30, b: 6 };
        const col = (ancho - l - hueco) / 2, alto = m.t + filas.length * fila + m.b;
        const maxA = Math.max(1, ...filas.flatMap((f) => [f.a ?? 0, f.metaA ?? 0])), maxB = Math.max(1, ...filas.map((f) => f.b ?? 0));
        const xa = lineal(0, maxA, l, l + col - 70), xb = lineal(0, maxB, l + col + hueco, ancho - 70);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <text className="q-eje q-fuerte" x={l} y={14}>{tituloA}</text><text className="q-eje q-fuerte" x={l + col + hueco} y={14}>{tituloB}</text>
            <line className="q-separador" x1={l + col + hueco / 2} x2={l + col + hueco / 2} y1={m.t - 6} y2={alto - m.b} />
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${tituloA}: ${formatoA(f.a)}${f.metaA != null ? ` (meta ${formatoA(f.metaA)})` : ''}\n${tituloB}: ${f.b == null ? 'sin dato' : formatoB(f.b)}${f.notaB ? ` ${f.notaB}` : ''}`} />
                  <text className={`q-rotulo-fila${f.resaltar ? ' q-fuerte' : ''}`} x={l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, l)}</text>
                  {f.a != null && <rect className={f.resaltarA ? 'q-barra-acento' : 'q-barra'} x={xa(0)} y={cy + 8} width={Math.max(1, xa(f.a) - xa(0))} height={fila - 16} rx="2" data-valor={f.a} />}
                  {f.metaA != null && <line className="q-marca" x1={xa(f.metaA)} x2={xa(f.metaA)} y1={cy + 4} y2={cy + fila - 4} data-valor={f.metaA} />}
                  <text className={`q-rotulo-valor${f.tonoA ? ' q-' + f.tonoA : ''}`} x={xa(Math.max(f.a ?? 0, f.metaA ?? 0)) + 6} y={cy + fila / 2 + 4}>{formatoA(f.a)}{f.notaA ? ` ${f.notaA}` : ''}</text>
                  {f.b != null && <rect className={f.pocosB ? 'q-barra-rayada' : f.resaltarB ? 'q-barra-acento' : 'q-barra'} x={xb(0)} y={cy + 8} width={Math.max(1, xb(f.b) - xb(0))} height={fila - 16} rx="2" data-valor={f.b} />}
                  <text className="q-rotulo-valor" x={(f.b != null ? xb(f.b) : xb(0)) + 6} y={cy + fila / 2 + 4}>{f.b == null ? 'sin dato' : formatoB(f.b)}{f.notaB && <tspan className="q-nota"> {f.notaB}</tspan>}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Acumulado contra plan (ritmo de inversión) ───────────────
export function Acumulado({ serie, formato = numero, etiqueta }) {
  const tabla = { columnas: ['Fecha', 'Real acumulado', 'Plan acumulado'], filas: serie.map((p) => [p.fecha, formato(p.real), formato(p.plan)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = Math.round(Math.min(240, Math.max(180, ancho * 0.36))), m = { t: 16, r: 92, b: 26, l: 64 };
        const ys = marcas(Math.max(...serie.map((p) => Math.max(p.real ?? 0, p.plan))));
        const x = lineal(0, serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const plan = serie.map((p) => ({ valor: p.plan })), real = serie.map((p) => ({ valor: p.real }));
        const iu = ultimoConValor(real), n = serie.length - 1;
        const [yr, yp] = separar([y(serie[iu]?.real ?? 0) + 4, y(serie[n].plan) + 4]);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            {serie.map((p, i) => (i % 7 === 0 ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{fechaCorta(p.fecha)}</text> : null))}
            {serie.map((p, i) => <Zona key={'z' + i} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`${fecha(p.fecha)}\nreal: ${formato(p.real)}\nplan: ${formato(p.plan)}`} />)}
            <path className="q-linea-plan" d={camino(plan, x, y)} />
            <path className="q-linea" d={camino(real, x, y)} />
            {real.map((p, i) => (p.valor != null ? <circle key={i} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-valor={p.valor} /> : null))}
            {iu >= 0 && <><circle className="q-punto-final" cx={x(iu)} cy={y(serie[iu].real)} r="4" /><text className="q-rotulo-final" x={x(iu) + 8} y={yr}>{formato(serie[iu].real)}</text></>}
            <text className="q-rotulo-previo" x={x(n) + 8} y={yp}>plan {formato(serie[n].plan)}</text>
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dos líneas alineadas en el tiempo, cada una con su escala ───────────────
export function DosLineas({ a, b, etiqueta }) {
  return (
    <div className="q-dos-lineas" role="group" aria-label={etiqueta}>
      {[a, b].map((s, k) => (
        <Grafico key={s.nombre} etiqueta={s.nombre} className="q-linea-alineada">
          {(ancho) => {
            const alto = 120, m = { t: 22, r: 48, b: k ? 22 : 6, l: 44 };
            const ys = marcas(Math.max(1, ...s.serie.map((p) => p.valor ?? 0)), 2);
            const x = lineal(0, s.serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
            const iu = ultimoConValor(s.serie);
            return (
              <Svg ancho={ancho} alto={alto} etiqueta={s.nombre}>
                <text className="q-eje q-fuerte" x={m.l} y={12}>{s.nombre}</text>
                {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{s.formato(v)}</text></g>)}
                {k === 1 && s.serie.map((p, i) => (i % 8 === 0 ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 6} textAnchor="middle">{mesAnio(p.fecha.slice(0, 7))}</text> : null))}
                {s.serie.map((p, i) => <Zona key={'z' + i} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`semana del ${fechaSinAnio(p.fecha)}\n${s.formato(p.valor)}`} />)}
                <path className={k ? 'q-linea-2' : 'q-linea'} d={camino(s.serie, x, y)} />
                {s.serie.map((p, i) => (p.valor != null ? <circle key={i} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-valor={p.valor} /> : null))}
                {iu >= 0 && <text className="q-rotulo-final" x={x(iu) + 6} y={y(s.serie[iu].valor) + 4}>{s.formato(s.serie[iu].valor)}</text>}
              </Svg>
            );
          }}
        </Grafico>
      ))}
    </div>
  );
}

// ─────────────── Proyección: meses reales y meses proyectados con su banda ───────────────
export function Proyeccion({ historia, meses, formato = numero, etiqueta }) {
  const puntos = [...historia.map((h) => ({ mes: h.mes, real: h.real?.valor ?? null })), ...meses.map((m) => ({ mes: m.mes, real: m.real?.valor ?? null, central: m.central, baja: m.baja, alta: m.alta }))];
  const tabla = { columnas: ['Mes', 'Real', 'Proyección', 'Rango'], filas: puntos.map((p) => [mesAnio(p.mes), formato(p.real), p.central == null ? '' : formato(p.central), p.baja == null ? '' : `${formato(p.baja)} a ${formato(p.alta)}`]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = 230, m = { t: 16, r: 24, b: 28, l: 56 };
        const ys = marcas(Math.max(1, ...puntos.flatMap((p) => [p.real ?? 0, p.alta ?? 0])));
        const paso = (ancho - m.l - m.r) / puntos.length, x = (i) => m.l + paso * i + paso / 2, y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const ini = historia.length;
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            <rect className="q-zona-proyeccion" x={m.l + paso * ini} y={m.t} width={paso * meses.length} height={alto - m.b - m.t} />
            {puntos.map((p, i) => (
              <g key={p.mes}>
                <Zona x={x(i) - paso / 2} y={m.t} w={paso} h={alto - m.b - m.t} pista={`${mesAnio(p.mes)}${p.real != null ? `\nreal: ${formato(p.real)}` : ''}${p.central != null ? `\nproyección: ${formato(p.central)}\nrango: ${formato(p.baja)} a ${formato(p.alta)}` : ''}`} />
                <text className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{mesAnio(p.mes)}</text>
                {p.alta != null && <><line className="q-banda-proy" x1={x(i)} x2={x(i)} y1={y(p.baja)} y2={y(p.alta)} data-baja={p.baja} data-alta={p.alta} /><circle className="q-punto-proy" cx={x(i)} cy={y(p.central)} r="5" data-valor={p.central} /></>}
                {p.real != null && <rect className="q-barra-real" x={x(i) - Math.min(14, paso * 0.3)} y={y(p.real)} width={Math.min(28, paso * 0.6)} height={alto - m.b - y(p.real)} rx="2" data-valor={p.real} />}
              </g>
            ))}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Columnas verticales: una medida por categoría ordenada (horas, días, tramos) ───────────────
// rotulo: si se pasa, cada barra lleva su cifra encima (pocas barras); si no, solo la más alta de las resaltadas
export function Histograma({ barras, formato = numero, rotulo, resaltar = [], etiqueta, alto: altoPedido = 180 }) {
  const tabla = { columnas: ['', 'Valor'], filas: barras.map((b) => [b.nombre, formato(b.valor)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = altoPedido, m = { t: 22, r: 4, b: 24, l: 4 };
        const max = Math.max(1, ...barras.map((b) => b.valor ?? 0));
        const paso = (ancho - m.l - m.r) / barras.length, w = Math.max(2, paso - Math.min(8, paso * 0.28));
        const y = lineal(0, max, alto - m.b, m.t);
        const cada = Math.ceil(30 / paso);
        const tope = resaltar.length ? resaltar.reduce((a, i) => (barras[i].valor > barras[a].valor ? i : a), resaltar[0]) : -1;
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(0)} y2={y(0)} />
            {barras.map((b, i) => {
              const x = m.l + i * paso + (paso - w) / 2, r = resaltar.includes(i);
              return (
                <g key={b.nombre}>
                  <Zona x={m.l + i * paso} y={m.t} w={paso} h={alto - m.b - m.t} pista={`${b.nombre}\n${formato(b.valor)}`} />
                  {b.valor > 0 && <rect className={r ? 'q-barra-acento' : 'q-barra'} x={x} y={y(b.valor)} width={w} height={y(0) - y(b.valor)} rx="2" data-valor={b.valor} />}
                  {/* rótulos a intervalo fijo; una barra resaltada fuera del intervalo se rotula solo si cabe */}
                  {(i % cada === 0 || (r && cada === 1)) && <text className={`q-eje${r ? ' q-fuerte' : ''}`} x={x + w / 2} y={alto - 8} textAnchor="middle">{b.corto ?? b.nombre}</text>}
                  {(rotulo || i === tope) && <text className="q-rotulo-valor" x={x + w / 2} y={y(b.valor ?? 0) - 6} textAnchor="middle">{rotulo ? rotulo(b) : formato(b.valor)}</text>}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dispersión: dos medidas por marca, una escala por eje ───────────────
// x en escala logarítmica (cada marca del eje vale 10 veces la anterior): las cifras de interacción van de miles a
// decenas de miles. y de 0 a 100 con la raya de 50 (neutro). Cada punto se elige con clic o con el teclado; el
// elegido lleva anillo. La marca propia va en menta, más grande y con su nombre en negrita.
export function Dispersion({ puntos, elegido, onElegir, rotuloX, rotuloY, formatoX = numero, formatoY = numero, notas = {}, etiqueta }) {
  const tabla = { columnas: ['Marca', rotuloX, rotuloY], filas: puntos.map((p) => [p.nombre, formatoX(p.x), formatoY(p.y)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} className="q-dispersion">
      {(ancho) => {
        const alto = Math.round(Math.max(260, Math.min(360, ancho * 0.56)));
        const m = { t: 28, r: 20, b: 46, l: 34 };
        const lo = Math.floor(Math.log10(Math.min(...puntos.map((p) => p.x))));
        const hi = Math.max(lo + 1, Math.ceil(Math.log10(Math.max(...puntos.map((p) => p.x)))));
        const x = (v) => m.l + ((Math.log10(v) - lo) / (hi - lo)) * (ancho - m.l - m.r);
        const y = lineal(0, 100, alto - m.b, m.t);
        // Rótulos: a la derecha del punto; si chocan con uno ya puesto, a la izquierda, luego abajo, luego arriba
        const puestos = [];
        const cajaDe = (p, lado) => {
          // el rótulo arranca fuera del anillo de elección, para que nunca lo pise
          const w = p.nombre.length * 7.2 + 4, cx = x(p.x), cy = y(p.y), d = (p.propia ? 12 : 10) + 6;
          if (lado === 'der') return { x0: cx + d, x1: cx + d + w, y0: cy - 8, y1: cy + 6, tx: cx + d, ty: cy + 4, ancla: 'start' };
          if (lado === 'izq') return { x0: cx - d - w, x1: cx - d, y0: cy - 8, y1: cy + 6, tx: cx - d, ty: cy + 4, ancla: 'end' };
          if (lado === 'aba') return { x0: cx - w / 2, x1: cx + w / 2, y0: cy + d, y1: cy + d + 14, tx: cx, ty: cy + d + 11, ancla: 'middle' };
          return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - d - 14, y1: cy - d, tx: cx, ty: cy - d - 3, ancla: 'middle' };
        };
        const choca = (c) => c.x1 > ancho - 2 || c.x0 < m.l || puestos.some((o) => c.x0 < o.x1 && c.x1 > o.x0 && c.y0 < o.y1 && c.y1 > o.y0)
          || puntos.some((q) => { const qx = x(q.x), qy = y(q.y); return qx > c.x0 - 5 && qx < c.x1 + 5 && qy > c.y0 - 5 && qy < c.y1 + 5; });
        const rotulos = new Map();
        [...puntos].sort((a, b) => (b.propia ? 1 : 0) - (a.propia ? 1 : 0) || a.x - b.x).forEach((p) => {
          const c = ['der', 'izq', 'aba', 'arr'].map((l) => cajaDe(p, l)).find((k) => !choca(k)) || cajaDe(p, 'der');
          puestos.push(c); rotulos.set(p.id, c);
        });
        const elegir = (id) => onElegir && onElegir(id);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={'y' + v}>
                <line className={v === 50 ? 'q-neutro' : 'q-rejilla'} x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} />
                <text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}</text>
              </g>
            ))}
            {Array.from({ length: hi - lo + 1 }, (_, k) => 10 ** (lo + k)).map((v) => (
              <text key={'x' + v} className="q-eje" x={x(v)} y={alto - m.b + 18} textAnchor={v === 10 ** lo ? 'start' : v === 10 ** hi ? 'end' : 'middle'}>{numero(v)}</text>
            ))}
            <text className="q-eje" x={m.l} y={m.t - 12}>↑ {rotuloY}</text>
            <text className="q-eje" x={ancho - m.r} y={alto - 6} textAnchor="end">{rotuloX} →</text>
            {notas.neutro && <text className="q-nota" x={ancho - m.r} y={y(50) - 6} textAnchor="end">{notas.neutro}</text>}
            {notas.arriba && <text className="q-nota" x={ancho - m.r} y={m.t + 12} textAnchor="end">{notas.arriba}</text>}
            {notas.abajo && <text className="q-nota" x={m.l + 6} y={alto - m.b - 8}>{notas.abajo}</text>}
            {puntos.map((p) => {
              const r = rotulos.get(p.id), sel = p.id === elegido;
              return (
                <g key={p.id} className={`q-elegible${sel ? ' q-elegido' : ''}`} role="button" tabIndex={0} aria-pressed={sel}
                  aria-label={`${p.nombre}: ${formatoX(p.x)} de ${rotuloX.toLowerCase()}, ${formatoY(p.y)} de ${rotuloY.toLowerCase()}`}
                  onClick={() => elegir(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(p.id); } }}>
                  <circle className="q-blanco" cx={x(p.x)} cy={y(p.y)} r={16} data-pista={`${p.nombre}\n${rotuloX}: ${formatoX(p.x)}\n${rotuloY}: ${formatoY(p.y)}`} />
                  <circle className="q-anillo" cx={x(p.x)} cy={y(p.y)} r={p.propia ? 12 : 10} />
                  <circle className={p.propia ? 'q-punto q-punto-propio' : 'q-punto'} cx={x(p.x)} cy={y(p.y)} r={p.propia ? 7 : 5} data-valor={p.x} />
                  <text className={`q-rotulo-fila${p.propia || sel ? ' q-fuerte' : ''}`} x={r.tx} y={r.ty} textAnchor={r.ancla}>{p.nombre}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}
