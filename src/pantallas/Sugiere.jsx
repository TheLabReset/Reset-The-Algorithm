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
  { nivel: 'atencion', titulo: 'Atención', bajada: 'Cuesta plata o leads mientras siga así.' },
  { nivel: 'revisar', titulo: 'Para revisar', bajada: 'Puede ser un problema; conviene mirarlo antes de decidir.' },
  { nivel: 'oportunidad', titulo: 'Oportunidades', bajada: 'Algo crece afuera y nadie lo atiende todavía.' },
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
        pie={<span>Cada alerta sale de una regla con su umbral escrito en el código; se dispara con el dato del mes, no con una opinión.</span>}
        items={GRUPOS.map((g) => ({ rotulo: g.titulo, valor: numero(cuenta(g.nivel)), nota: g.bajada, ir: s31.id, irTexto: 'Qué mirar', universo: 'modelo' }))} />

      <SeccionDe def={s31} vista={v} conAvisos={false}>
        {GRUPOS.map((g) => <Grupo key={g.nivel} g={g} items={todas.filter((a) => a.nivel === g.nivel)} />)}
      </SeccionDe>

      <SeccionDe def={s32} vista={v} conAvisos={false}>
        {sugerencias.length === 0 && <Bloque titulo="Sin cambios que el dato sostenga" universo="modelo" lectura="Ninguna regla de sugerencia se cumple este mes." />}
        {sugerencias.map((s) => (
          <Bloque key={s.titulo} universo="modelo" titulo={s.titulo} lectura={s.dato}
            pie={<a className="q-alerta-ir" href={'#' + s.ir}>Ver el dato en {s.irTexto}<ArrowUpRight size={14} aria-hidden="true" /></a>}>
            <p className="q-estimacion">{s.estimacion}</p>
            <Datos pares={[['Por qué se sostiene', s.sostiene], ...s.supuestos.map((x, i) => [i === 0 ? 'Supuestos' : '', x])]} />
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
        <Bloque universo="modelo" titulo={`${numero(ix.valor)} de 100`} lectura="Qué tan favorable está el mercado para captar socios este mes: cinco componentes, cada uno dentro de su propio rango histórico. 50 es un mes típico."
          pie={<span>Cada componente vale de 0 a 100 dentro de su rango; el índice es su promedio ponderado.</span>}>
          <Barras etiqueta="Componentes del índice de oportunidad" formato={(n) => numero(Math.round(n))} max={100}
            filas={ix.componentes.map((c) => ({ nombre: c.nombre, valor: Math.round(c.puntaje), nota: `peso ${numero(Math.round(c.pesoEfectivo * 100))} %` }))} />
        </Bloque>
      </SeccionDe>
    </MarcoCapa>
  );
}
