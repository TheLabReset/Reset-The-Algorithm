// Capa 3 · Sugiere: qué se salió de lo esperado, qué va bien, qué mover y qué pasaría si nada cambia.
// No calcula: pinta las alertas y sugerencias de src/calculo y los textos de src/textos/sugiere.js.
import { ArrowUpRight } from 'lucide-react';
import { Bloque, Alerta, Datos, Resumen } from '../sistema/Componentes.jsx';
import { Proyeccion, Barras } from '../sistema/graficos/Graficos.jsx';
import { numero } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, alertasDe, buenasDe } from './comun.jsx';
import { sugerencia, escenarioTexto } from '../textos/sugiere.js';
import { periodoTexto } from '../textos/comun.js';

const GRUPOS = [
  { nivel: 'atencion', titulo: 'Atención', bajada: 'Afecta los leads o la inversión de este mes.' },
  { nivel: 'revisar', titulo: 'Para revisar', bajada: 'Conviene mirarlo antes de decidir.' },
  { nivel: 'oportunidad', titulo: 'Oportunidades', bajada: 'Algo que crece en las búsquedas.' },
  { nivel: 'bien', titulo: 'Lo que va bien', bajada: 'Lo que conviene sostener.' },
];

function Grupo({ g, items }) {
  if (!items.length) return null;
  return (
    <>
      <div className="q-grupo-alertas">
        <h3>{g.titulo} <span>{numero(items.length)}</span></h3>
        <p>{g.bajada}</p>
      </div>
      {items.map((a) => <Alerta key={a.id} {...a} />)}
    </>
  );
}

export default function Sugiere({ capa, vista: v }) {
  const [s31, s32, s33, s34] = capa.secciones;
  const todas = [...alertasDe(v), ...buenasDe(v)];
  const cuenta = (n) => todas.filter((a) => a.nivel === n).length;
  const sugerencias = v.sugiere.sugerencias.map(sugerencia).filter(Boolean);
  const e = v.sugiere.escenario;
  const et = e?.estado === 'ok' ? escenarioTexto(e) : null;
  const ix = v.sugiere.indice;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Qué mirar en ${periodoTexto(v.periodo)}`}
        pie={<span>Cada alerta sale de una regla con un umbral fijo y se activa con el dato del mes.</span>}
        items={GRUPOS.map((g) => ({ rotulo: g.titulo, valor: numero(cuenta(g.nivel)), nota: g.bajada }))} />

      <SeccionDe def={s31} vista={v} conAvisos={false}>
        {GRUPOS.map((g) => <Grupo key={g.nivel} g={g} items={todas.filter((a) => a.nivel === g.nivel)} />)}
      </SeccionDe>

      <SeccionDe def={s32} vista={v} conAvisos={false}>
        {sugerencias.length === 0 && <Bloque titulo="El modelo no propone mover el reparto" universo="modelo" lectura="Este mes la plataforma y el CRM no coinciden en qué canal es el más caro." />}
        {sugerencias.map((s) => (
          <Bloque key={s.titulo} universo="modelo" titulo={s.titulo} lectura={s.dato}
            pie={<a className="q-alerta-ir" href={'#' + s.ir}>Ver el dato en {s.irTexto}<ArrowUpRight size={14} aria-hidden="true" /></a>}>
            <p className="q-estimacion">{s.estimacion}</p>
            <Datos pares={[['Por qué', s.sostiene], ...s.supuestos.map((x, i) => [i === 0 ? 'Supuestos' : '', x])]} />
          </Bloque>
        ))}
      </SeccionDe>

      <SeccionDe def={s33} vista={v} conAvisos={false}>
        {et ? (
          <Bloque universo="modelo" titulo={et.titulo} lectura={et.lectura} alcance={`Meses siguientes a ${periodoTexto(v.periodo)} · no sigue el período`}
            pie={<span>{et.nota}</span>}>
            <Proyeccion historia={e.historia} meses={e.meses} formato={(n) => (n == null ? '' : numero(Math.round(n)))} etiqueta="Leads reportados por mes y rango del escenario si nada cambia" />
          </Bloque>
        ) : <Bloque titulo="Escenario si nada cambia" universo="modelo" estado={{ tipo: 'sin-datos', reemplaza: true }} />}
      </SeccionDe>

      <SeccionDe def={s34} vista={v} conAvisos={false}>
        <Bloque universo="modelo" titulo={`${numero(ix.valor)} de 100`} lectura="Qué tan favorable está el mercado para captar socios este mes. Junta cinco componentes, cada uno medido contra su propia historia; 50 es la mitad de su rango."
          pie={<span>Cada componente va de 0 a 100 dentro de su rango; el índice es su promedio ponderado.</span>}>
          <Barras etiqueta="Componentes del índice de oportunidad" formato={(n) => numero(Math.round(n))} max={100}
            filas={ix.componentes.map((c) => ({ nombre: c.nombre, valor: Math.round(c.puntaje), nota: `peso ${numero(Math.round(c.pesoEfectivo * 100))} %` }))} />
        </Bloque>
      </SeccionDe>
    </MarcoCapa>
  );
}
