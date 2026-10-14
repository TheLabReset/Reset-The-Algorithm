// Componentes de Quincha. No calculan: reciben cifras ya armadas por src/calculo y textos por src/textos.
import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, ArrowRight, CircleHelp, Megaphone, Contact, Search, MessagesSquare, Globe,
  Sigma, Wallet, CircleCheck, TriangleAlert, CloudOff, Inbox, CalendarX2, CircleDashed, Hourglass, FlaskConical,
} from 'lucide-react';
import { NO_MEDIDO, variacion } from './formato.js';

// ── Universos: qué se cuenta y de dónde. El icono ayuda a reconocerlo sin leer; el color no se usa ──
export const UNIVERSOS = {
  pauta: { icono: Megaphone, nombre: 'Pauta' },
  crm: { icono: Contact, nombre: 'CRM' },
  busquedas: { icono: Search, nombre: 'Búsquedas' },
  conversacion: { icono: MessagesSquare, nombre: 'Conversación' },
  web: { icono: Globe, nombre: 'Sitio web' },
  plan: { icono: Wallet, nombre: 'Plan de inversión' },
  modelo: { icono: Sigma, nombre: 'Modelo' },
};

export function Chip({ tipo = 'neutro', icono: Icono, children, titulo }) {
  return (
    <span className={`q-chip${tipo === 'neutro' ? '' : ' q-chip-' + tipo}`} title={titulo}>
      {Icono && <Icono size={13} aria-hidden="true" strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export const ChipUniverso = ({ universo, children }) => {
  const u = UNIVERSOS[universo];
  return <Chip tipo="universo" icono={u.icono}>{children || u.nombre}</Chip>;
};

const ICONO_FUENTE = { ok: CircleCheck, parcial: TriangleAlert, 'no-cargo': CloudOff };
export function ChipFuente({ nombre, estado, detalle }) {
  return <Chip tipo={estado === 'ok' ? 'fuente' : 'atencion'} icono={ICONO_FUENTE[estado]} titulo={detalle}>{nombre}{detalle ? ` · ${detalle}` : ''}</Chip>;
}

export const SelloMuestra = ({ children }) => (
  <span className="q-sello-muestra"><FlaskConical size={13} aria-hidden="true" />{children}</span>
);

// ── Cifra con su variación ──
// mejorSi: 'sube' o 'baja' decide el color; la flecha y el signo siempre van, así el color nunca va solo
export function Cifra({ valor, rotulo, tamano = 'grande', delta, dataClave }) {
  const sinDato = valor == null || valor === NO_MEDIDO;
  return (
    <div className={`q-cifra q-cifra-${tamano}${sinDato ? ' q-cifra-sin-dato' : ''}`}>
      <span className="q-cifra-valor" data-clave={dataClave}>{sinDato ? NO_MEDIDO : valor}</span>
      {rotulo && <span className="q-cifra-rotulo">{rotulo}</span>}
      {delta && <Delta {...delta} />}
    </div>
  );
}

export function Delta({ cambio, mejorSi = 'sube', referencia, motivo, decimales = 0 }) {
  if (cambio == null) return <span className="q-delta">{motivo || 'sin comparación'}</span>;
  const redondo = +cambio.toFixed(decimales);
  const tono = redondo === 0 ? 'igual' : (redondo > 0) === (mejorSi === 'sube') ? 'mejora' : 'empeora';
  const Flecha = redondo === 0 ? ArrowRight : redondo > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`q-delta q-delta-${tono}`}>
      <span className="q-delta-valor"><Flecha size={15} aria-hidden="true" strokeWidth={2.4} />{variacion(cambio, decimales)}</span>
      {referencia && <span>{referencia}</span>}
    </span>
  );
}

// ── Ayuda (toggletip): se abre con clic o Enter, se cierra con Esc o al tocar fuera ──
export function Ayuda({ titulo = 'Cómo se calcula', children }) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();
  const ref = useRef(null);
  useEffect(() => {
    if (!abierta) return undefined;
    const fuera = (e) => { if (!ref.current?.contains(e.target)) setAbierta(false); };
    const tecla = (e) => { if (e.key === 'Escape') setAbierta(false); };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', tecla); };
  }, [abierta]);
  return (
    <div className="q-ayuda" ref={ref}>
      <button type="button" className="q-ayuda-boton" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta((a) => !a)}>
        <CircleHelp size={16} aria-hidden="true" /><span className="solo-lector">{titulo}</span>
      </button>
      <div id={id} className="q-ayuda-globo" role="note" hidden={!abierta}>
        <b>{titulo}</b>
        {children}
      </div>
    </div>
  );
}

// ── Estados: lo que no hay se dice, nunca se dibuja como cero ──
const ESTADOS = {
  'no-cargo': { icono: CloudOff, titulo: 'La fuente no cargó', atencion: true },
  'sin-datos': { icono: Inbox, titulo: 'Sin datos en este período' },
  fuera: { icono: CalendarX2, titulo: 'Fuera de la muestra' },
  'no-medido': { icono: CircleDashed, titulo: 'No se midió' },
  parcial: { icono: TriangleAlert, titulo: 'Dato parcial', atencion: true },
  abierta: { icono: Hourglass, titulo: 'Cohorte abierta' },
};
export function Estado({ tipo, titulo, children }) {
  if (tipo === 'cargando') return <div className="q-esqueleto" aria-busy="true" aria-label="Cargando"><i /><i /><i /></div>;
  const e = ESTADOS[tipo];
  const Icono = e.icono;
  return (
    <div className={`q-estado${e.atencion ? ' q-estado-atencion' : ''}`} role="status" data-estado={tipo}>
      <Icono size={18} aria-hidden="true" />
      <div><b>{titulo || e.titulo}</b>{children}</div>
    </div>
  );
}

// ── Bloque: una lectura con su gráfico. Un bloque, un universo ──
export function Bloque({ titulo, lectura, universo, ancho = 'completo', alcance, estado, ayuda, pie, children, id }) {
  return (
    <article className={`q-bloque q-${ancho}${alcance ? ' q-bloque-alcance' : ''}`} id={id} data-estado={estado?.tipo || 'ok'}>
      <header className="q-bloque-cab">
        <h3>
          {universo && <ChipUniverso universo={universo} />}
          {alcance && <Chip tipo="alcance" icono={Hourglass}>{alcance}</Chip>}
          <span>{titulo}</span>
        </h3>
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
        {lectura && !estado?.reemplaza && <p className="q-bloque-lectura">{lectura}</p>}
      </header>
      <div className="q-bloque-cuerpo">
        {estado && <Estado tipo={estado.tipo} titulo={estado.titulo}>{estado.texto && <p>{estado.texto}</p>}</Estado>}
        {!estado?.reemplaza && children}
      </div>
      {pie ? <footer className="q-bloque-pie">{pie}</footer> : <span />}
    </article>
  );
}

// ── Sección: franja numerada a todo el ancho y riel que une sus bloques ──
export function Seccion({ id, numero, titulo, pregunta, universos = [], fuentes = [], children }) {
  return (
    <section className="q-seccion" id={id} aria-labelledby={id + '-t'} data-seccion={numero}>
      <header className="q-seccion-cab">
        <span className="q-seccion-num" aria-hidden="true">{numero}</span>
        <div>
          <h2 id={id + '-t'}><span className="solo-lector">{numero} </span>{titulo}</h2>
          {pregunta && <p className="q-seccion-pregunta">{pregunta}</p>}
        </div>
        <div className="q-seccion-meta">
          {universos.map((u) => <ChipUniverso key={u} universo={u} />)}
          {fuentes.map((f) => <ChipFuente key={f.nombre} {...f} />)}
        </div>
      </header>
      <div className="q-seccion-cuerpo">{children}</div>
    </section>
  );
}

// ── Navegación entre las tres capas ──
export function NavegacionCapas({ capas, activa, onCambiar }) {
  return (
    <nav aria-label="Capas del algoritmo">
      <ol className="q-capas">
        {capas.map((c) => (
          <li key={c.id}>
            <button type="button" className="q-capa-boton" aria-current={c.id === activa ? 'page' : undefined} onClick={() => onCambiar(c.id)}>
              <span className="q-capa-num">{c.numero}</span>
              <span className="q-capa-nombre">{c.nombre}</span>
              <span className="q-capa-desc">{c.descripcion}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Índice de la capa: fijo, resalta la sección que se está leyendo ──
export function IndiceCapa({ secciones, etiqueta }) {
  const [activa, setActiva] = useState(secciones[0]?.id);
  useEffect(() => {
    const visibles = new Map();
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => visibles.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
      const primera = [...visibles.entries()].filter(([, t]) => t != null).sort((a, b) => a[1] - b[1])[0];
      if (primera) setActiva(primera[0]);
    }, { rootMargin: '-140px 0px -55% 0px' });
    secciones.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [secciones]);
  return (
    <nav className="q-indice" aria-label={etiqueta}>
      <div className="q-envoltura">
        <ol>
          {secciones.map((s) => (
            <li key={s.id}><a href={'#' + s.id} aria-current={s.id === activa ? 'true' : undefined}><b>{s.numero}</b>{s.titulo}</a></li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

// ── Opciones excluyentes ──
export function Grupo({ etiqueta, opciones, valor, onCambiar }) {
  return (
    <div className="q-grupo" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o.valor} type="button" aria-pressed={o.valor === valor} onClick={() => onCambiar(o.valor)} disabled={o.desactivada} title={o.titulo}>{o.texto}</button>
      ))}
    </div>
  );
}

export function Selector({ etiqueta, opciones, valor, onCambiar }) {
  return (
    <label className="q-control">
      <span>{etiqueta}</span>
      <select className="q-selector" value={valor} onChange={(e) => onCambiar(e.target.value)}>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </label>
  );
}

// ── Tabla: números a la derecha, primera columna como encabezado de fila ──
export function Tabla({ etiqueta, columnas, filas, numericas = [] }) {
  return (
    <div className="q-tabla-marco" role="region" aria-label={etiqueta} tabIndex={0}>
      <table className="q-tabla">
        <thead><tr>{columnas.map((c, j) => <th key={c} scope="col" className={numericas.includes(j) ? 'q-num' : undefined}>{c}</th>)}</tr></thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>{f.map((v, j) => (j === 0 ? <th key={j} scope="row">{v}</th> : <td key={j} className={numericas.includes(j) ? 'q-num' : undefined}>{v}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Datos({ pares }) {
  return <dl className="q-datos">{pares.map(([k, v]) => [<dt key={k + 't'}>{k}</dt>, <dd key={k + 'd'}>{v}</dd>])}</dl>;
}
