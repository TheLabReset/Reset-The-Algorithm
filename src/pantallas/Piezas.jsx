// Capa 3 · Piezas y campañas: lo que reporta cada plataforma, por campaña, conjunto y pieza, con un estado por fila
// (src/calculo/piezas.js). Una tabla por campaña que se abre en sus conjuntos y sus piezas, como el administrador de
// anuncios: las campañas con algo que mirar empiezan abiertas y lo nuevo va primero, con su sello. No calcula: pinta.
import { useState } from 'react';
import { ChevronDown, ChevronRight, TriangleAlert, ArrowUp, BatteryLow, CircleCheck, Hourglass, CircleDashed } from 'lucide-react';
import { Bloque, Tabla, Grupo, Detalle, Insignia, SelloNuevo, ArteMuestra } from '../sistema/Componentes.jsx';
import { numero, dolares } from '../sistema/formato.js';
import { sinDato } from './comun.jsx';
import { ESTADO_PIEZA, piezaDato, piezaPausa, piezasLectura, piezasAyuda, LIMITADO } from '../textos/piezas.js';
import { PARA_REVISAR, UMBRALES_PIEZAS } from '../calculo/piezas.js';

// cada estado en su pastilla: icono y palabra sobre su fondo, el color nunca va solo
const INSIGNIA = {
  'sin-leads': ['grave', TriangleAlert], costosa: ['alerta', ArrowUp], saturada: ['tinta', BatteryLow], rinde: ['bien', CircleCheck],
  aprendizaje: ['neutro', Hourglass], 'poca-data': ['neutro', CircleDashed],
};
const EstadoFila = ({ f }) => { const [tono, icono] = INSIGNIA[f.estado]; return <Insignia tono={tono} icono={icono}>{ESTADO_PIEZA[f.estado]}</Insignia>; };
const costo = (n) => (n == null ? 'sin leads' : dolares(n, 2));
// la miniatura de la pieza; los anuncios de búsqueda son solo texto y no la llevan
const Miniatura = ({ p }) => (p.canal === 'search' ? null : <span className="q-arte-mini" aria-hidden="true"><ArteMuestra a={{ formato: p.formato, titulo: p.tema, arte: p.arte }} /></span>);

function TablaArbol({ x }) {
  // una campaña con algo que mirar empieza abierta; las demás, cerradas
  const conAlgo = (c) => x.piezas.some((p) => p.campana === c.id && PARA_REVISAR.includes(p.estado));
  const [abiertas, setAbiertas] = useState(() => new Set(x.campanas.filter(conAlgo).map((c) => c.id)));
  const alternar = (id) => setAbiertas((a) => { const n = new Set(a); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const fila = (f, nivel) => {
    const sub = nivel === 'campana' ? f.plataformaNombre : nivel === 'conjunto' && f.limitado ? LIMITADO : piezaPausa(f);
    return (
      <tr key={f.id} className={`q-arbol-${nivel}${nivel === 'pieza' && !f.alAire ? ' q-arbol-pausada' : ''}`}>
        <th scope="row">
          {nivel === 'campana'
            ? <button type="button" className="q-arbol-abrir" aria-expanded={abiertas.has(f.id)} onClick={() => alternar(f.id)}>{abiertas.has(f.id) ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}<span className="q-arbol-nombre">{f.nombre}</span></button>
            : nivel === 'pieza'
              ? <span className="q-arbol-pieza-nombre"><Miniatura p={f} /><span><span className="q-arbol-nombre">{f.nombre}{f.nueva && <SelloNuevo />}</span>{sub && <span className="q-arbol-sub">{sub}</span>}</span></span>
              : <span className="q-arbol-nombre">{f.nombre}</span>}
          {sub && nivel !== 'pieza' && <span className="q-arbol-sub">{sub}</span>}
        </th>
        <td><EstadoFila f={f} /></td>
        <td className="q-num">{dolares(f.inversion)}</td>
        <td className="q-num">{numero(f.leads)}</td>
        <td className="q-num">{costo(f.cpl)}</td>
        <td className="q-arbol-dato">{piezaDato(f)}</td>
      </tr>
    );
  };
  return (
    <div className="q-tabla-marco" role="region" aria-label="Campañas, conjuntos y piezas" tabIndex={0}>
      <table className="q-tabla q-tabla-arbol">
        <thead><tr><th scope="col">Campaña, conjunto y pieza</th><th scope="col">Estado</th><th scope="col" className="q-num">Inversión</th><th scope="col" className="q-num">Leads</th><th scope="col" className="q-num">Costo por lead</th><th scope="col">Por qué</th></tr></thead>
        {x.campanas.map((c) => (
          <tbody key={c.id}>
            {fila(c, 'campana')}
            {abiertas.has(c.id) && x.conjuntos.filter((k) => k.campana === c.id).flatMap((k) => [fila(k, 'conjunto'), ...x.piezas.filter((p) => p.conjunto === k.id).map((p) => fila(p, 'pieza'))])}
          </tbody>
        ))}
      </table>
    </div>
  );
}

// El cuerpo del capítulo: la tabla por campaña, con el filtro de plataforma, y el detalle con todas las piezas
export function PiezasCapitulo({ def, x, estado }) {
  const [plat, setPlat] = useState('todas');
  if (!x) return <Bloque titulo="Piezas y campañas" universo="pauta" estado={sinDato(estado === 'ok' ? 'sin-datos' : estado)} />;
  const opciones = [{ valor: 'todas', texto: 'Todas' }, ...x.plataformas.map((b) => ({ valor: b.id, texto: b.nombre }))];
  const plataforma = opciones.some((o) => o.valor === plat) && plat !== 'todas' ? plat : null;
  const de = (lista) => lista.filter((f) => !plataforma || f.plataforma === plataforma);
  const sub = { ...x, piezas: de(x.piezas), conjuntos: de(x.conjuntos), campanas: de(x.campanas) };
  sub.total = sub.piezas.reduce((s, p) => s + p.inversion, 0);
  const textos = piezasLectura(sub);
  const pie = 'Lo que reporta cada plataforma: sus leads no son los del CRM. Sin las campañas de alcance, que no buscan leads.';
  return (
    <>
      <Bloque universo="pauta" titulo={textos.titulo} lectura={textos.lectura}
        ayuda={<p>{piezasAyuda(UMBRALES_PIEZAS)}</p>} pie={<span>{pie}</span>}>
        <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plataforma ?? 'todas'} onCambiar={setPlat} opciones={opciones} /></div>
        {/* con otro período u otra plataforma, la tabla vuelve a abrir las campañas con algo que mirar */}
        <TablaArbol key={`${plataforma ?? 'todas'}-${x.desde}-${x.hasta}`} x={sub} />
      </Bloque>
      <Detalle id={`detalle-${def.id}`} titulo="Detalle de las piezas" bajada="Cada pieza con gasto en el período, con su estado y sus cifras." vistas={['cada pieza con su estado y sus cifras']}>
        <Bloque universo="pauta" titulo="Todas las piezas del período" pie={<span>{pie}</span>}>
          <Tabla etiqueta="Cada pieza con su estado" numericas={[2, 3, 4]}
            columnas={['Pieza', 'Estado', 'Inversión', 'Leads', 'Costo por lead', 'Por qué']}
            filas={sub.piezas.map((f) => [{ texto: `${f.nombre}${f.nueva ? ' · nueva' : ''}`, sub: `${f.plataformaNombre} · ${f.campanaNombre} · ${f.conjuntoNombre}` }, ESTADO_PIEZA[f.estado], dolares(f.inversion), numero(f.leads), costo(f.cpl), piezaDato(f)])} />
        </Bloque>
      </Detalle>
    </>
  );
}
