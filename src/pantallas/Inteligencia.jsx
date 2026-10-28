// Capa 2 · Inteligencia de mercado: lo que lee el modelo. El índice, qué mirar (y qué va bien), la temporada y el
// escenario si nada cambia. No calcula: pinta las salidas de src/calculo y los textos de src/textos.
import { Bloque, ListaAlertas, Etiqueta } from '../sistema/Componentes.jsx';
import { Linea, Barras, DosLineas, Proyeccion } from '../sistema/graficos/Graficos.jsx';
import { numero, fechaSinAnio } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato, alertasDe, buenasDe } from './comun.jsx';
import { periodoTexto, mesTexto } from '../textos/comun.js';
import { escenarioTexto } from '../textos/sugiere.js';
import { indiceLectura, bandaTexto } from '../textos/capas.js';
import * as A from '../textos/analiza.js';
import { CLIENTE } from '../cliente.js';

const GRUPOS = [
  { nivel: 'atencion', titulo: 'Piden atención' },
  { nivel: 'revisar', titulo: 'Para revisar' },
  { nivel: 'oportunidad', titulo: 'Oportunidades' },
  { nivel: 'bien', titulo: 'Lo que va bien' },
];

export default function Inteligencia({ capa, vista: v }) {
  const [s21, s22] = capa.secciones;
  const ix = v.sugiere.indice;
  const todas = [...alertasDe(v), ...buenasDe(v)];
  const e = v.sugiere.escenario;
  const et = e?.estado === 'ok' ? escenarioTexto(e) : null;
  const d = v.analiza.demandaRespuesta;
  return (
    <MarcoCapa capa={capa} vista={v} conResumen={false}>
      {/* ───── 2.1 Lo que lee el modelo ───── */}
      <SeccionDe def={s21} vista={v} conAvisos={false}>
        <Bloque universo="modelo" {...indiceLectura(ix)} alcance={`lectura al ${fechaSinAnio(v.periodo.hasta)}`}
          ayuda={<p>Junta cinco componentes, cada uno medido contra su propia historia: 0 es lo más bajo de su rango y 100 lo más alto. El índice es su promedio ponderado.</p>}
          pie={<span>Se calcula al último día del período. Componentes medidos: {numero(ix.componentes.filter((c) => c.puntaje != null).length)} de {numero(ix.componentes.length)}.</span>}>
          <div className="q-oport">
            <div className="q-oport-cifra">
              <span className="q-cifra-valor">{ix.valor == null ? 'sin dato' : numero(Math.round(ix.valor))}</span><span className="q-oport-de">de 100</span>
              {ix.banda && <Etiqueta variante="llena" tono="bien" icono={null} className="q-oport-banda">{bandaTexto(ix.banda)}</Etiqueta>}
            </div>
            <div>
              <h4 className="q-subtitulo">Cómo viene, cierre de cada mes</h4>
              <Linea serie={ix.historia} rotuloX="mes" alto={180} formato={(n) => (n == null ? 'sin dato' : numero(Math.round(n)))} etiqueta="Índice de oportunidad al cierre de cada mes" />
            </div>
          </div>
          <h4 className="q-subtitulo">Cada componente, de 0 a 100</h4>
          <Barras etiqueta="Componentes del índice de oportunidad" formato={(n) => numero(Math.round(n))} max={100}
            filas={ix.componentes.map((c) => ({ nombre: c.nombre, valor: Math.round(c.puntaje), nota: `peso ${numero(Math.round(c.pesoEfectivo * 100))} %` }))} />
        </Bloque>

        <div className="q-bloque q-completo q-bloque-lista">
          <header className="q-bloque-cab">
            <div className="q-bloque-titulo"><h3>Qué mirar</h3></div>
            <p className="q-bloque-lectura">Lo que se salió de lo esperado y lo que va bien en {periodoTexto(v.periodo)}. Cada fila se abre con el dato y lleva a la tarjeta que lo sostiene.</p>
          </header>
          <div className="q-bloque-cuerpo">
            {todas.length ? <ListaAlertas grupos={GRUPOS.map((g) => ({ ...g, items: todas.filter((a) => a.nivel === g.nivel) }))} />
              : <p className="q-nota-bloque">{v.sugiere.pocosDias ? 'Con menos de 7 días las alertas no se leen: un día raro mandaría.' : 'En el período nada se sale de lo esperado.'}</p>}
          </div>
          <footer className="q-bloque-pie"><span>Cada alerta sale de una regla con un umbral fijo y se activa con el dato del período.</span></footer>
        </div>
      </SeccionDe>

      {/* ───── 2.2 Temporada y escenario ───── */}
      <SeccionDe def={s22} vista={v}>
        {d.estado !== 'ok' ? <Bloque titulo="Demanda y respuesta" universo="busquedas" estado={sinDato(d.estado)} /> : (
          <Bloque universo="busquedas" {...A.demanda(v)} alcance="últimas 52 semanas"
            ayuda={<p>Cada línea tiene su propia escala. La correlación mide si suben y bajan juntas; no dice qué causa qué.</p>}
            pie={<span>Semanas de lunes a domingo. {d.semanasIncompletas.length === 1 ? 'Una semana con un día sin dato no entra en la correlación.' : d.semanasIncompletas.length > 1 ? `${numero(d.semanasIncompletas.length)} semanas con días sin dato no entran en la correlación.` : ''}</span>}>
            <DosLineas etiqueta="Interés de búsqueda y leads de pauta por semana"
              a={{ nombre: `Interés por «${CLIENTE.busqueda}», de 0 a 100`, serie: d.busqueda, formato: (n) => numero(n) }}
              b={{ nombre: 'Leads de pauta por semana', serie: d.leads, formato: (n) => numero(n) }} />
          </Bloque>
        )}
        {et ? (
          <Bloque universo="modelo" titulo={et.titulo} lectura={et.lectura} alcance={`meses siguientes a ${mesTexto(v.periodo.hasta.slice(0, 7))}`}
            pie={<span>{et.nota}</span>}>
            <Proyeccion historia={e.historia} meses={e.meses} formato={(n) => (n == null ? '' : numero(Math.round(n)))} etiqueta="Leads reportados por mes y rango del escenario si nada cambia" />
          </Bloque>
        ) : <Bloque titulo="Escenario si nada cambia" universo="modelo" estado={{ tipo: 'sin-datos', reemplaza: true }} />}
      </SeccionDe>
    </MarcoCapa>
  );
}
