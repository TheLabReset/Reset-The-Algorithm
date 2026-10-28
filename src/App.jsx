// The Algorithm · demo con data de muestra del cliente (src/cliente.js). Arma la vista una sola vez por filtro y la reparte a las capas.
import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Presentation } from 'lucide-react';
import { CONFIG } from './muestra/configuracion.js';
import { generar } from './muestra/generador.js';
import { armarVista } from './calculo/vista.js';
import { ATAJOS, ATAJO_INICIAL, COMPARAR, COMPARAR_INICIAL } from './calculo/periodo.js';
import { CAPAS } from './capas/estructura.js';
import { fechaSinAnio, fecha } from './sistema/formato.js';
import { ventanaTexto, comparacionTexto } from './textos/comun.js';
import { NavegacionCapas, SelectorPeriodo, Grupo, SelloMuestra, BarraDemo, CargandoContexto } from './sistema/Componentes.jsx';
import logoCliente from '../public/marca/logo-barra.svg?raw'; // logo del cliente en negativo, sobre la barra oscura
import Senales from './pantallas/Senales.jsx';
import Inteligencia from './pantallas/Inteligencia.jsx';
import Activacion from './pantallas/Activacion.jsx';
import Rendimiento from './pantallas/Rendimiento.jsx';
import { CLIENTE } from './cliente.js';

const PANTALLAS = { senales: Senales, inteligencia: Inteligencia, activacion: Activacion, rendimiento: Rendimiento };
const INICIO = CAPAS[0].id;

// Preferencias del visitante: si el navegador no deja guardar, la página funciona igual
const leerPref = (k, porDefecto) => { try { return localStorage.getItem('algoritmo:' + k) || porDefecto; } catch { return porDefecto; } };
const guardarPref = (k, v) => { try { localStorage.setItem('algoritmo:' + k, v); } catch { /* sin almacenamiento */ } };
// El ancla dice la capa: «senales», «s-3-2» (un capítulo), «a-cpl-objetivo» (una alerta, en Inteligencia),
// «p-google» (la tarjeta de una plataforma, en Activación)
const capaDeAncla = (h) => {
  if (CAPAS.some((c) => c.id === h)) return h;
  const capitulo = h.match(/^s-(\d)-/);
  if (capitulo) return CAPAS.find((c) => c.numero === capitulo[1])?.id || null;
  if (/^p-/.test(h)) return 'activacion';
  return /^(a|b)-/.test(h) ? 'inteligencia' : null;
};
const ancla = () => (typeof location !== 'undefined' ? location.hash.slice(1) : '');
const capaDeLaUrl = () => capaDeAncla(ancla()) || INICIO;

export default function App() {
  const data = useMemo(() => generar(CONFIG), []);
  // El período: un atajo («Últimos 7 días» al abrir) o dos fechas; y con qué se compara
  const [filtros, setFiltros] = useState({ atajo: ATAJO_INICIAL });
  const [comparar, setComparar] = useState(COMPARAR_INICIAL);
  const [capa, setCapa] = useState(capaDeLaUrl);
  // Claro por defecto (se proyecta); solo se recuerda lo que el visitante eligió con el botón
  const [tema, setTema] = useState(() => leerPref('tema-elegido', 'light'));

  // Demo: datos, cargando o una fuente que no llegó, para mostrar en vivo cómo responde el panel
  const [demo, setDemo] = useState('datos');
  // Presentar: la misma página con letra más grande para proyectar en una reunión
  const [presentar, setPresentar] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = tema; }, [tema]);
  useEffect(() => { if (presentar) document.documentElement.dataset.presentar = ''; else delete document.documentElement.dataset.presentar; }, [presentar]);
  const cambiarTema = () => { const t = tema === 'dark' ? 'light' : 'dark'; setTema(t); guardarPref('tema-elegido', t); };
  useEffect(() => {
    // un ancla que no dice capa (#resumen, #a-… ya abierta) deja la capa donde está; nunca devuelve a la primera
    const alCambiar = () => setCapa((c) => capaDeAncla(ancla()) || c);
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  // Al cambiar de capa por un ancla, llevar la vista a ese capítulo o alerta cuando ya está dibujado
  useEffect(() => {
    const h = ancla();
    if (!h || CAPAS.some((c) => c.id === h)) return;
    const t = setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: 'start' }), 60);
    return () => clearTimeout(t);
  }, [capa]);
  // Alto real de la barra fija (pestañas y filtros): lo usan el índice, los saltos a un capítulo y el borde de lectura.
  // En pantallas angostas la barra no es fija: el alto es cero.
  useEffect(() => {
    const barra = document.querySelector('.q-filtros');
    if (!barra) return undefined;
    const medir = () => document.documentElement.style.setProperty('--alto-capas', `${getComputedStyle(barra).position === 'sticky' ? barra.offsetHeight : 0}px`);
    const ro = new ResizeObserver(medir);
    ro.observe(barra);
    window.addEventListener('resize', medir);
    medir();
    return () => { ro.disconnect(); window.removeEventListener('resize', medir); };
  }, []);
  const irACapa = (id) => { setCapa(id); history.replaceState(null, '', '#' + id); window.scrollTo({ top: 0 }); };

  const vista = useMemo(() => armarVista(data, { ...filtros, comparar }, demo === 'crm' ? { fuentesCaidas: ['crm'] } : demo === 'ga4' ? { fuentesCaidas: ['web'] } : {}), [data, filtros, comparar, demo]);
  const P = vista.periodo;
  const actual = CAPAS.find((c) => c.id === capa);
  const Pantalla = PANTALLAS[capa];

  return (
    <div className="q-pagina">
      <header className="q-barra">
        <div className="q-envoltura q-barra-fila">
          <a className="q-marca" href={'#' + INICIO} onClick={(e) => { e.preventDefault(); irACapa(INICIO); }} aria-label={`The Algorithm para ${CLIENTE.nombre}, ir al inicio`}>
            <span className="q-marca-cliente" aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoCliente }} />
            <span className="q-marca-producto"><b>The Algorithm</b><span>By The Lab</span></span>
          </a>
          <div className="q-barra-controles">
            <SelloMuestra>Datos al {fechaSinAnio(CONFIG.corte)}</SelloMuestra>
            <button type="button" className="q-boton q-boton-quieto q-boton-presentar" aria-pressed={presentar} onClick={() => setPresentar((x) => !x)}>
              <Presentation size={16} aria-hidden="true" /><span>Presentar</span>
            </button>
            <button type="button" className="q-boton q-boton-quieto" onClick={cambiarTema} aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}>
              {tema === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div className="q-filtros">
        <div className="q-envoltura q-filtros-fila">
          <NavegacionCapas capas={CAPAS} activa={capa} onCambiar={irACapa} />
          <div className="q-filtros-controles">
            <SelectorPeriodo texto={ventanaTexto(P.desde, P.hasta)} atajo={P.atajo} atajos={ATAJOS} desde={P.desde} hasta={P.hasta} min={CONFIG.desde} max={CONFIG.corte}
              comparacion={P.compFuera ? 'Sin días antes con qué comparar.' : `Se compara con ${comparacionTexto(P)}: ${ventanaTexto(P.compararDesde, P.compararHasta)}${P.comparar === 'anio' || P.compararDesde.slice(0, 4) !== P.desde.slice(0, 4) ? ` de ${P.compararDesde.slice(0, 4)}` : ''}.`}
              aviso={`Elige fechas entre el ${fecha(CONFIG.desde)} y el ${fecha(CONFIG.corte)}, con «desde» antes de «hasta».`}
              onAtajo={(atajo) => setFiltros({ atajo })} onRango={(desde, hasta) => setFiltros({ desde, hasta })} />
            <div className="q-control"><span>Comparar con</span>
              <Grupo etiqueta="Comparar con" valor={comparar} onCambiar={setComparar} opciones={COMPARAR.map((c) => ({ valor: c.id, texto: c.nombre }))} />
            </div>
          </div>
        </div>
      </div>

      <main>
        <CargandoContexto.Provider value={demo === 'cargando'}>
          <Pantalla key={capa} capa={actual} vista={vista} irACapa={irACapa} />
        </CargandoContexto.Provider>
      </main>
      <BarraDemo valor={demo} onCambiar={setDemo} opciones={[
        { valor: 'datos', texto: 'Datos' }, { valor: 'cargando', texto: 'Cargando' },
        { valor: 'crm', texto: 'CRM no cargó' }, { valor: 'ga4', texto: 'GA4 no cargó' },
      ]} />

      <footer className="q-envoltura q-pie">
        <p>Toda cifra sale de un generador con semilla fija y de una capa de cálculo única; ningún número está escrito en un componente. {CLIENTE.nombre} es una marca ficticia. Los competidores son marcas reales con cifras de muestra: no describen su desempeño.</p>
        <p>The Algorithm · By The Lab · sistema de diseño Quincha</p>
      </footer>
    </div>
  );
}
