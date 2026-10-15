// Componentes de Quincha. No calculan: reciben cifras ya armadas por src/calculo y textos por src/textos.
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, ArrowRight, CircleHelp, Megaphone, Contact, Search, MessagesSquare, Globe,
  Sigma, CircleCheck, TriangleAlert, CloudOff, Inbox, CalendarX2, CircleDashed, Hourglass, FlaskConical,
  Eye, TrendingUp, Bot, Calendar, Pin, ChevronDown, CornerDownRight, ArrowUpRight as Ir,
} from 'lucide-react';
import { NO_MEDIDO, variacion } from './formato.js';

// ── Universos: qué se cuenta y de dónde. El icono ayuda a reconocerlo sin leer; el color no se usa ──
export const UNIVERSOS = {
  pauta: { icono: Megaphone, nombre: 'Pauta' },
  crm: { icono: Contact, nombre: 'CRM' },
  busquedas: { icono: Search, nombre: 'Búsquedas' },
  conversacion: { icono: MessagesSquare, nombre: 'Conversación' },
  web: { icono: Globe, nombre: 'Sitio web' },
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
// Cada tarjeta dice su ventana arriba a la derecha: con calendario si sigue el período elegido, con alfiler si no
// (una cohorte, la última lectura, los meses que vienen). El período de la capa llega por contexto.
export const VentanaContexto = createContext(null);
export function Ventana({ texto, fija }) {
  const Icono = fija ? Pin : Calendar;
  return <span className={`q-ventana${fija ? ' q-ventana-fija' : ''}`} title={fija ? 'No sigue el período elegido' : 'Sigue el período elegido'}><Icono size={12} aria-hidden="true" />{texto}</span>;
}

export function Bloque({ titulo, lectura, universo, ancho = 'completo', alcance, ventana, estado, ayuda, pie, children, id }) {
  const u = UNIVERSOS[universo];
  const periodo = useContext(VentanaContexto);
  const texto = alcance || (ventana === false ? null : ventana || periodo);
  return (
    <article className={`q-bloque q-${ancho}`} id={id} data-estado={estado?.tipo || 'ok'}>
      <header className="q-bloque-cab">
        <div className="q-bloque-titulo">
          <h3>{titulo}</h3>
          <div className="q-bloque-marcas">
            {texto && <Ventana texto={texto} fija={!!alcance} />}
            {ayuda && <Ayuda>{ayuda}</Ayuda>}
          </div>
        </div>
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

// ── Flujo: una fila por plataforma y una columna por paso (inversión, reportado, en el CRM, inscritos).
// Cada paso dice su cifra y debajo su costo o su razón; la flecha marca que un paso sale del anterior ──
export function Flujo({ etiqueta, columnas, filas, nota }) {
  return (
    <div className="q-flujo" role="table" aria-label={etiqueta}>
      <div className="q-flujo-fila q-flujo-cab" role="row">
        <span role="columnheader" />
        {columnas.map((c) => <span key={c} role="columnheader">{c}</span>)}
      </div>
      {filas.map((f, i) => (
        <div key={f.nombre} className="q-flujo-fila" role="row">
          <span className="q-flujo-nombre" role="rowheader"><span className={`q-muestra q-p${i}`} aria-hidden="true" />{f.nombre}</span>
          {f.pasos.map((p, j) => (
            <span key={j} className="q-flujo-paso" role="cell">
              {j > 0 && <ArrowRight className="q-flujo-flecha" size={14} aria-hidden="true" />}
              <i className="q-flujo-rotulo" aria-hidden="true">{columnas[j]}</i>
              <b>{p.valor}</b>{p.nota && <span>{p.nota}</span>}
            </span>
          ))}
        </div>
      ))}
      {nota && <p className="q-nota-bloque">{nota}</p>}
    </div>
  );
}

// ── Sugerencia del modelo: una frase que se puede decidir, su detalle y, al costado, una columna por plataforma.
// Se distingue de un dato leído: lleva el robot y el rótulo, y sus supuestos van en la ayuda ──
export function SugerenciaModelo({ titulo, detalle, columnas = [], ayuda, pie }) {
  return (
    <article className="q-bloque q-completo q-modelo">
      <header className="q-modelo-cab">
        <span className="q-modelo-icono" aria-hidden="true"><Bot size={16} /></span>
        <span className="q-modelo-rotulo">Sugerencia del modelo</span>
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </header>
      <div className="q-modelo-cuerpo">
        <div className="q-modelo-texto">
          <p className="q-modelo-titulo">{titulo}</p>
          {detalle && <p className="q-modelo-detalle">{detalle}</p>}
        </div>
        {columnas.length > 0 && (
          <ul className="q-modelo-columnas">
            {columnas.map((c, i) => (
              <li key={c.nombre}>
                <span className="q-modelo-nombre"><span className={`q-muestra q-p${i}`} aria-hidden="true" />{c.nombre}</span>
                <span className="q-modelo-valor">{c.valor}</span>
                <span className="q-modelo-unidad">{c.unidad}</span>
                {c.nota && <span className="q-modelo-nota">{c.nota}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="q-bloque-pie">{pie}</footer>
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

// Qué mirar, compacto: una lista numerada por nivel. Cada fila dice el dato en el título y la acción debajo;
// al abrirla, el detalle y el enlace a la tarjeta que lo sostiene. Un ancla #a-… abre su fila.
export function ListaAlertas({ grupos }) {
  useEffect(() => {
    const abrir = () => { const el = document.getElementById(location.hash.slice(1)); if (el?.tagName === 'DETAILS') el.open = true; };
    abrir();
    window.addEventListener('hashchange', abrir);
    return () => window.removeEventListener('hashchange', abrir);
  }, []);
  let n = 0;
  return (
    <div className="q-lista-alertas">
      {grupos.filter((g) => g.items.length).map((g) => (
        <section key={g.nivel} className={`q-lista-grupo q-alerta-${g.nivel}`} aria-label={g.titulo}>
          <h3>{g.titulo} <span>{g.items.length}</span></h3>
          <ol>
            {g.items.map((a) => {
              n += 1;
              const nv = NIVELES[a.nivel];
              return (
                <li key={a.id}>
                  <details id={a.id} className="q-fila-alerta">
                    <summary>
                      <span className="q-fila-num">{n}</span>
                      <span className="q-fila-cuerpo">
                        <span className="q-fila-titulo"><span className="q-nivel" title={nv.nombre}><nv.icono size={14} aria-hidden="true" strokeWidth={2.4} /><span className="solo-lector">{nv.nombre}: </span></span>{a.titulo}</span>
                        {a.mirar && <span className="q-fila-mirar"><CornerDownRight size={14} aria-hidden="true" />{a.mirar}</span>}
                      </span>
                      <span className="q-fila-fuente">{a.fuente}</span>
                      <ChevronDown className="q-fila-abrir" size={16} aria-hidden="true" />
                    </summary>
                    <div className="q-fila-detalle">
                      <p>{a.dato}</p>
                      {a.ir && <a className="q-alerta-ir" href={'#' + a.ir}>Ver el dato en {a.irTexto}<Ir size={14} aria-hidden="true" /></a>}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

// Avisos de un capítulo: una línea por alerta, que lleva a su fila en Qué mirar
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

// Cifra contra su objetivo, debajo de la cifra: barra hasta el valor, raya en el objetivo y cuánto se aleja.
// valor y meta en la misma unidad; sobre: true si pasar el objetivo es malo (un costo)
function ContraObjetivo({ valor, meta, textoMeta, textoDiferencia, sobre }) {
  const max = Math.max(valor, meta) * 1.25;
  return (
    <span className={`q-contra-objetivo${sobre ? ' q-contra-objetivo-sobre' : ''}`}>
      <span className="q-contra-objetivo-barra" aria-hidden="true"><i style={{ width: `${(valor / max) * 100}%` }} /><b style={{ left: `${(meta / max) * 100}%` }} /></span>
      <span className="q-contra-objetivo-texto">{textoMeta} <span>{textoDiferencia}</span></span>
    </span>
  );
}

// ── Resumen de la capa: pocas cifras, cada una lleva a su capítulo ──
export function Resumen({ titulo, items, pie }) {
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
              {i.objetivo && <ContraObjetivo {...i.objetivo} />}
              {i.ir && <a className="q-resumen-ir" href={'#' + i.ir}>{u && <u.icono size={13} aria-hidden="true" />}{i.irTexto}</a>}
            </li>
          );
        })}
      </ul>
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
// barra: { columna, valores } pone una barra delgada junto a la cifra de esa columna (magnitud de un vistazo).
// Una celda puede ser texto o { texto, sub, tono }: sub va debajo en gris; tono 'empeora' o 'mejora' colorea la cifra.
// destacada: índice de la fila que se resalta (la propia marca, la página nueva).
const celda = (v) => (v && typeof v === 'object' && !Array.isArray(v) && 'texto' in v ? v : { texto: v });
export function Tabla({ etiqueta, columnas, filas, numericas = [], barra, destacada, apagadas = [] }) {
  const positivos = barra ? barra.valores.filter((x) => x != null && x > 0) : [];
  const max = positivos.length ? Math.max(...positivos) : 1;
  return (
    <div className="q-tabla-marco" role="region" aria-label={etiqueta} tabIndex={0}>
      <table className="q-tabla">
        <thead><tr>{columnas.map((c, j) => <th key={c} scope="col" className={numericas.includes(j) ? 'q-num' : undefined}>{c}</th>)}</tr></thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className={i === destacada ? 'q-fila-destacada' : apagadas.includes(i) ? 'q-fila-apagada' : undefined}>{f.map((v, j) => {
              const c = celda(v);
              const contenido = <>{c.texto}{c.sub && <span className="q-tabla-sub">{c.sub}</span>}</>;
              if (j === 0) return <th key={j} scope="row">{contenido}</th>;
              const clase = [numericas.includes(j) && 'q-num', c.tono && 'q-tono-' + c.tono].filter(Boolean).join(' ') || undefined;
              if (barra && j === barra.columna) {
                const valor = barra.valores[i];
                return <td key={j} className={clase}><span className="q-celda-barra"><i aria-hidden="true" style={{ width: valor == null ? 0 : `${(valor / max) * 100}%` }} /><span>{contenido}</span></span></td>;
              }
              return <td key={j} className={clase}>{contenido}</td>;
            })}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Datos({ pares }) {
  return <dl className="q-datos">{pares.map(([k, v]) => [<dt key={k + 't'}>{k}</dt>, <dd key={k + 'd'}>{v}</dd>])}</dl>;
}
