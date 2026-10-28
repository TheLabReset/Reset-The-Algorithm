// Entrada de la prueba de render: pinta una capa a HTML, con los paneles de detalle abiertos.
// La arma esbuild en pruebas/render.test.mjs.
import { renderToStaticMarkup } from 'react-dom/server';
import { DetallesAbiertos, CargandoContexto } from '../src/sistema/Componentes.jsx';
import { CAPAS } from '../src/capas/estructura.js';
import Senales from '../src/pantallas/Senales.jsx';
import Inteligencia from '../src/pantallas/Inteligencia.jsx';
import Activacion from '../src/pantallas/Activacion.jsx';
import Rendimiento from '../src/pantallas/Rendimiento.jsx';

const PANTALLAS = { senales: Senales, inteligencia: Inteligencia, activacion: Activacion, rendimiento: Rendimiento };
export const IDS = CAPAS.map((c) => c.id).filter((id) => PANTALLAS[id]);

export function pintar(id, vista, { cargando = false, detalles = true } = {}) {
  const Pantalla = PANTALLAS[id];
  return renderToStaticMarkup(<CargandoContexto.Provider value={cargando}><DetallesAbiertos.Provider value={detalles}><Pantalla capa={CAPAS.find((c) => c.id === id)} vista={vista} irACapa={() => {}} /></DetallesAbiertos.Provider></CargandoContexto.Provider>);
}
