// Piezas comunes de las pantallas: marco de capa (índice al costado), cabecera con fuentes y capítulos.
import { IndiceCapa, Seccion, FuentesCapa, AvisosCapitulo } from '../sistema/Componentes.jsx';
import { alerta, bien } from '../textos/sugiere.js';
import { seccionPorNumero } from '../capas/estructura.js';
import { fechaCorta, numero } from '../sistema/formato.js';

// Chips de fuentes: estado y fecha de corte, o los días sin dato del período
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'no-cargo' ? 'no cargó' : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Alertas y señales buenas ya escritas, con su ancla («a-…» o «b-…») y el capítulo que las sostiene
const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const destino = (numero) => { const s = seccionPorNumero(numero); return s ? { ir: s.id, irTexto: s.titulo } : {}; };
export function alertasDe(vista) {
  return (vista.sugiere.queMirar || []).map((a) => { const t = alerta(a); return t && { ...t, id: `a-${a.id}-${slug(a.fuente)}`, ...destino(a.sostiene) }; }).filter(Boolean);
}
export function buenasDe(vista) {
  return (vista.sugiere.queVaBien || []).map((b) => { const t = bien(b); return t && { ...t, nivel: 'bien', id: `b-${b.id}-${slug(b.fuente)}`, ...destino(b.sostiene) }; }).filter(Boolean);
}

// Marco de una capa: índice fijo al costado y, al centro, cabecera, resumen y capítulos
export function MarcoCapa({ capa, vista, bajada, conResumen = true, children }) {
  const ids = [...new Set(capa.secciones.flatMap((s) => s.fuentes))];
  return (
    <div className="q-envoltura q-capa-marco">
      <IndiceCapa secciones={capa.secciones} etiqueta={`Capítulos de ${capa.nombre}`} conResumen={conResumen} />
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
export function SeccionDe({ def, vista, conAvisos = true, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} fuentes={fuentesDe(def.fuentes, vista)}
      avisos={conAvisos ? <AvisosCapitulo avisos={[...alertasDe(vista), ...buenasDe(vista)].filter((a) => a.ir === def.id)} /> : null}>
      {children}
    </Seccion>
  );
}
