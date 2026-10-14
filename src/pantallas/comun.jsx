// Piezas comunes de las pantallas: cabecera de capa, veredicto y chips de fuentes de una sección.
import { IndiceCapa, Seccion } from '../sistema/Componentes.jsx';
import { fechaCorta, numero } from '../sistema/formato.js';

export function CabeceraCapa({ capa, veredicto }) {
  return (
    <>
      <div className="q-envoltura">
        <div className="q-capa-cab">
          <div>
            <h1><em>{capa.numero}</em> {capa.titulo}</h1>
            <p>{capa.bajada}</p>
          </div>
          {veredicto}
        </div>
      </div>
      <IndiceCapa secciones={capa.secciones} etiqueta={`Secciones de ${capa.nombre}`} />
    </>
  );
}

export function Veredicto({ rotulo, children }) {
  return (
    <aside className="q-veredicto" aria-label={rotulo}>
      <span className="q-veredicto-rotulo">{rotulo}</span>
      <div className="q-veredicto-texto">{children}</div>
    </aside>
  );
}

// Chips de fuentes: estado y fecha de corte, o los días sin dato del período
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'no-cargo' ? 'no cargó' : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Sección con sus chips ya resueltos desde la estructura de capas
export function SeccionDe({ def, vista, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} universos={def.universos} fuentes={fuentesDe(def.fuentes, vista)}>
      {children}
    </Seccion>
  );
}
