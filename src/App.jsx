// The Algorithm · demo con data de muestra de Fit Lab. Arma la vista una sola vez por filtro y la reparte a las capas.
import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CONFIG } from './muestra/configuracion.js';
import { generar } from './muestra/generador.js';
import { armarVista, mesesDisponibles } from './calculo/vista.js';
import { CAPAS } from './capas/estructura.js';
import { fecha } from './sistema/formato.js';
import { mesTexto } from './textos/comun.js';
import { NavegacionCapas, Selector, Grupo, SelloMuestra } from './sistema/Componentes.jsx';
import logoCliente from '../public/marca/reset-fit-horizontal-monocromo.svg?raw';
import Lee from './pantallas/Lee.jsx';
import Analiza from './pantallas/Analiza.jsx';
import Sugiere from './pantallas/Sugiere.jsx';

const PANTALLAS = { lee: Lee, analiza: Analiza, sugiere: Sugiere };

// Preferencias del visitante: si el navegador no deja guardar, la página funciona igual
const leerPref = (k, porDefecto) => { try { return localStorage.getItem('algoritmo:' + k) || porDefecto; } catch { return porDefecto; } };
const guardarPref = (k, v) => { try { localStorage.setItem('algoritmo:' + k, v); } catch { /* sin almacenamiento */ } };
const capaDeLaUrl = () => { const h = typeof location !== 'undefined' ? location.hash.slice(1) : ''; return CAPAS.some((c) => c.id === h) ? h : 'lee'; };

export default function App() {
  const data = useMemo(() => generar(CONFIG), []);
  const meses = useMemo(() => mesesDisponibles(CONFIG), []);
  const [mes, setMes] = useState(meses.at(-1));
  const [comparar, setComparar] = useState('anio');
  const [capa, setCapa] = useState(capaDeLaUrl);
  // Claro por defecto (se proyecta); solo se recuerda lo que el visitante eligió con el botón
  const [tema, setTema] = useState(() => leerPref('tema-elegido', 'light'));

  useEffect(() => { document.documentElement.dataset.theme = tema; }, [tema]);
  const cambiarTema = () => { const t = tema === 'dark' ? 'light' : 'dark'; setTema(t); guardarPref('tema-elegido', t); };
  useEffect(() => {
    const alCambiar = () => setCapa(capaDeLaUrl());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  const irACapa = (id) => { setCapa(id); history.replaceState(null, '', '#' + id); window.scrollTo({ top: 0 }); };

  const vista = useMemo(() => armarVista(data, { mes, comparar }), [data, mes, comparar]);
  const actual = CAPAS.find((c) => c.id === capa);
  const Pantalla = PANTALLAS[capa];

  return (
    <div className="q-pagina">
      <header className="q-barra">
        <div className="q-envoltura q-barra-fila">
          <a className="q-marca" href="#lee" onClick={(e) => { e.preventDefault(); irACapa('lee'); }} aria-label="The Algorithm para Fit Lab, ir al inicio">
            <span className="q-marca-cliente" aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoCliente }} />
            <span className="q-marca-producto"><b>The Algorithm</b><span>By The Lab</span></span>
          </a>
          <div className="q-barra-controles">
            <SelloMuestra>Datos de muestra al {fecha(CONFIG.corte)}</SelloMuestra>
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
            <Selector etiqueta="Mes" valor={mes} onCambiar={setMes} opciones={[...meses].reverse().map((m) => ({ valor: m, texto: mesTexto(m) }))} />
            <div className="q-control"><span>Comparar con</span>
              <Grupo etiqueta="Comparar con" valor={comparar} onCambiar={setComparar} opciones={[{ valor: 'anio', texto: 'Un año antes' }, { valor: 'anterior', texto: 'Mes anterior' }]} />
            </div>
          </div>
        </div>
      </div>

      <main>
        <Pantalla key={capa} capa={actual} vista={vista} irACapa={irACapa} />
      </main>

      <footer className="q-envoltura q-pie">
        <p>Toda cifra sale de un generador con semilla fija y de una capa de cálculo única; ningún número está escrito en un componente. Fit Lab es una marca ficticia. Los competidores son marcas reales con cifras de muestra: no describen su desempeño.</p>
        <p>The Algorithm · By The Lab · sistema de diseño Quincha</p>
      </footer>
    </div>
  );
}
