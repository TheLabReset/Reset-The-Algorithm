// Piezas comunes de las pantallas: marco de capa (índice al costado), cabecera con fuentes y capítulos.
import { IndiceCapa, Seccion, FuentesCapa } from '../sistema/Componentes.jsx';
import { fechaCorta, numero } from '../sistema/formato.js';

// Chips de fuentes: estado y fecha de corte, o los días sin dato del período
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'no-cargo' ? 'no cargó' : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Marco de una capa: índice fijo al costado y, al centro, cabecera, resumen y capítulos
export function MarcoCapa({ capa, vista, bajada, children }) {
  const ids = [...new Set(capa.secciones.flatMap((s) => s.fuentes))];
  return (
    <div className="q-envoltura q-capa-marco">
      <IndiceCapa secciones={capa.secciones} etiqueta={`Capítulos de ${capa.nombre}`} />
      <div className="q-capa">
        <header className="q-capa-cab">
          <h1>{capa.titulo}</h1>
          <p>{bajada || capa.bajada}</p>
          {ids.length > 0 && <FuentesCapa fuentes={fuentesDe(ids, vista)} />}
        </header>
        {children}
      </div>
    </div>
  );
}

// Capítulo con sus avisos de fuente ya resueltos desde la estructura de capas
export function SeccionDe({ def, vista, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} fuentes={fuentesDe(def.fuentes, vista)}>
      {children}
    </Seccion>
  );
}
