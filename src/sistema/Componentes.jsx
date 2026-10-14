// Componentes de Quincha. No calculan: reciben cifras ya armadas por src/calculo y textos por src/textos.
import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, ArrowRight, CircleHelp, Megaphone, Contact, Search, MessagesSquare, Globe,
  Sigma, Wallet, CircleCheck, TriangleAlert, CloudOff, Inbox, CalendarX2, CircleDashed, Hourglass, FlaskConical,
  Eye, TrendingUp, ArrowUpRight as Ir,
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

// ── Bloque: una tarjeta, una lectura, un universo ──
// Misma estructura siempre (cabecera, cuerpo, pie con la fuente) para que las tarjetas vecinas se alineen fila por fila.
export function Bloque({ titulo, lectura, universo, ancho = 'completo', alcance, estado, ayuda, pie, children, id }) {
  const u = UNIVERSOS[universo];
  return (
    <article className={`q-bloque q-${ancho}${alcance ? ' q-bloque-alcance' : ''}`} id={id} data-estado={estado?.tipo || 'ok'}>
      <header className="q-bloque-cab">
        <div className="q-bloque-titulo">
          <h3>{titulo}</h3>
          {ayuda && <Ayuda>{ayuda}</Ayuda>}
        </div>
        {alcance && <span className="q-alcance"><Hourglass size={13} aria-hidden="true" />{alcance}</span>}
        {lectura && !estado?.reemplaza && <p className="q-bloque-lectura">{lectura}</p>}
      </header>
      <div className="q-bloque-cuerpo">
        {estado && <Estado tipo={estado.tipo} titulo={estado.titulo}>{estado.texto && <p>{estado.texto}</p>}</Estado>}
        {!estado?.reemplaza && children}
      </div>
      <footer className="q-bloque-pie">
        {u && <span className="q-pie-universo"><u.icono size={13} aria-hidden="true" />{u.nombre}</span>}
        {pie}
      </footer>
    </article>
  );
}

// ── Capítulo: un panel que agrupa las tarjetas de una fuente. Se lee como parte del flujo, no como un corte ──
export const numeroCapitulo = (numero) => String(numero).split('.').at(-1).padStart(2, '0');
export function Seccion({ id, numero, titulo, pregunta, fuentes = [], avisos, children }) {
  const conProblema = fuentes.filter((f) => f.estado !== 'ok');
  return (
    <section className="q-capitulo" id={id} aria-labelledby={id + '-t'} data-seccion={numero}>
      <header className="q-capitulo-cab">
        <span className="q-capitulo-num" aria-hidden="true">{numeroCapitulo(numero)}</span>
        <div>
          <h2 id={id + '-t'}>{titulo}</h2>
          {pregunta && <p>{pregunta}</p>}
        </div>
        {conProblema.length > 0 && <div className="q-capitulo-avisos">{conProblema.map((f) => <ChipFuente key={f.nombre} {...f} />)}</div>}
      </header>
      {avisos}
      <div className="q-capitulo-cuerpo">{children}</div>
    </section>
  );
}

// ── Alertas: el nivel lleva icono, palabra y color (el color nunca va solo) ──
export const NIVELES = {
  atencion: { icono: TriangleAlert, nombre: 'Atención' },
  revisar: { icono: Eye, nombre: 'Para revisar' },
  oportunidad: { icono: TrendingUp, nombre: 'Oportunidad' },
  bien: { icono: CircleCheck, nombre: 'Va bien' },
};

export function Alerta({ id, nivel, titulo, dato, mirar, fuente, ir, irTexto }) {
  const n = NIVELES[nivel];
  return (
    <article className={`q-alerta q-alerta-${nivel}`} id={id}>
      <div className="q-alerta-cab">
        <span className="q-nivel"><n.icono size={14} aria-hidden="true" strokeWidth={2.4} />{n.nombre}</span>
        <span className="q-alerta-fuente">{fuente}</span>
      </div>
      <h3>{titulo}</h3>
      <p className="q-alerta-dato">{dato}</p>
      {mirar && <p className="q-alerta-mirar"><b>{nivel === 'bien' ? 'Qué sostener:' : 'Qué mirar:'}</b> {mirar}</p>}
      {ir && <a className="q-alerta-ir" href={'#' + ir}>Ver el dato en {irTexto}<Ir size={14} aria-hidden="true" /></a>}
    </article>
  );
}

// Avisos de un capítulo: una línea por alerta, que lleva a su detalle en Sugiere
export function AvisosCapitulo({ avisos }) {
  if (!avisos.length) return null;
  return (
    <ul className="q-avisos" aria-label="Alertas de este capítulo">
      {avisos.map((a) => {
        const n = NIVELES[a.nivel];
        return (
          <li key={a.id} className={`q-aviso q-alerta-${a.nivel}`}>
            <a href={'#' + a.id}><span className="q-nivel"><n.icono size={14} aria-hidden="true" strokeWidth={2.4} />{n.nombre}</span><span className="q-aviso-texto">{a.titulo}</span><Ir size={14} aria-hidden="true" /></a>
          </li>
        );
      })}
    </ul>
  );
}

// ── Resumen de la capa: pocas cifras, cada una lleva a su capítulo ──
export function Resumen({ titulo, items, pie, avisos }) {
  return (
    <section className="q-resumen" aria-labelledby="resumen-t" id="resumen">
      <h2 id="resumen-t" className="q-resumen-titulo">{titulo}</h2>
      <ul className="q-resumen-cifras">
        {items.map((i) => {
          const u = UNIVERSOS[i.universo];
          return (
            <li key={i.rotulo}>
              <span className="q-resumen-rotulo">{i.rotulo}</span>
              <span className={`q-cifra-valor${i.valor == null ? ' q-cifra-sin-dato' : ''}`} data-clave={i.dataClave}>{i.valor ?? NO_MEDIDO}</span>
              {i.delta ? <Delta {...i.delta} /> : i.nota ? <span className="q-delta">{i.nota}</span> : null}
              {i.ir && <a className="q-resumen-ir" href={'#' + i.ir}>{u && <u.icono size={13} aria-hidden="true" />}{i.irTexto}</a>}
            </li>
          );
        })}
      </ul>
      {avisos}
      {pie && <footer className="q-bloque-pie">{pie}</footer>}
    </section>
  );
}

// ── Fecha de cada fuente, en una línea: el punto dice el estado y el texto también ──
export function FuentesCapa({ fuentes }) {
  return (
    <ul className="q-fuentes" aria-label="Fuentes y fecha de corte">
      {fuentes.map((f) => (
        <li key={f.nombre} className={`q-fuente-${f.estado}`}><i aria-hidden="true" />{f.nombre} <span>{f.detalle}</span></li>
      ))}
    </ul>
  );
}

// ── Navegación entre las tres capas: pestañas de texto, sin peso de tarjeta ──
export function NavegacionCapas({ capas, activa, onCambiar }) {
  return (
    <nav className="q-capas" aria-label="Capas del algoritmo">
      <ol>
        {capas.map((c) => (
          <li key={c.id}>
            <a href={'#' + c.id} aria-current={c.id === activa ? 'page' : undefined} title={c.descripcion}
              onClick={(e) => { e.preventDefault(); onCambiar(c.id); }}>
              <span className="q-capa-num" aria-hidden="true">{c.numero}</span>{c.nombre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Índice de la capa: al costado, fijo, marca el capítulo que se está leyendo ──
export function IndiceCapa({ secciones, etiqueta, conResumen = true }) {
  const [activa, setActiva] = useState(conResumen ? 'resumen' : secciones[0]?.id);
  const ids = [...(conResumen ? ['resumen'] : []), ...secciones.map((s) => s.id)];
  useEffect(() => {
    const visibles = new Map();
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => visibles.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
      const primera = [...visibles.entries()].filter(([, t]) => t != null).sort((a, b) => a[1] - b[1])[0];
      if (primera) setActiva(primera[0]);
    }, { rootMargin: '-120px 0px -60% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [secciones]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <nav className="q-indice" aria-label={etiqueta}>
      <span className="q-indice-titulo">En esta capa</span>
      <ol>
        {conResumen && <li><a href="#resumen" aria-current={activa === 'resumen' ? 'true' : undefined}>Resumen</a></li>}
        {secciones.map((s) => (
          <li key={s.id}><a href={'#' + s.id} aria-current={s.id === activa ? 'true' : undefined}>{s.titulo}</a></li>
        ))}
      </ol>
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
