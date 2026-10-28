// Capa 3 · Activación estratégica: dónde está la inversión y a qué costo. El reparto con la sugerencia del modelo,
// una tarjeta por plataforma y las horas del sitio. No calcula: pinta la vista y las lecturas de src/textos.
import { ArrowUpRight } from 'lucide-react';
import { Bloque, Tabla, Resumen, SugerenciaModelo } from '../sistema/Componentes.jsx';
import { Linea, Franja } from '../sistema/graficos/Graficos.jsx';
import { numero, dolares, porcentaje, fecha } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, HorasYDias, sinDato, deltaCorto } from './comun.jsx';
import { periodoTexto, comparacionTexto, mesTexto, resumenTitulo } from '../textos/comun.js';
import * as L from '../textos/lee.js';
import * as A from '../textos/analiza.js';
import { sugerencia, sinReasignar } from '../textos/sugiere.js';
import { plataformaLectura, objetivoFrase } from '../textos/capas.js';

const TIPO = { search: 'Search', display: 'Display' };
const PRODUCTO = { marca: 'Marca', membresias: 'Membresías' };

// Costo por lead de una campaña contra el objetivo de su plataforma: rojo si lo pasa, verde si no; sin leads, en gris
const cplCampana = (c, objetivo) => (!c.leads ? { texto: 'sin leads' } : { texto: dolares(c.cpl, 2), tono: c.cpl > objetivo ? 'empeora' : 'mejora' });

export default function Activacion({ capa, vista: v }) {
  const [s31, s32, s33] = capa.secciones;
  const pa = v.lee.pauta, pl = v.lee.plataformas, w = v.lee.web, r = v.analiza.rendimiento;
  const ok = (x) => x.estado === 'ok';
  const sugerencias = v.sugiere.sugerencias.map(sugerencia).filter(Boolean);
  // Al costado de la sugerencia: cuánto se lleva hoy cada plataforma y cuánto cuesta por lead y por inscripción
  const columnas = !ok(r) ? [] : r.canales.map((c) => ({
    nombre: c.nombre, valor: porcentaje(c.pctInversion), unidad: 'de la inversión',
    nota: `${dolares(c.cpl, 2)} por lead${c.cohorte?.cpa != null ? ` · ${dolares(c.cohorte.cpa)} por inscripción` : ''}`,
  }));
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(v.periodo)}
        frases={ok(pl) ? pl.plataformas.map((p, i) => ({ serie: i, segmentos: objetivoFrase(p) })) : []}
        pie={<span>Lo que reporta cada plataforma. Cada variación compara {periodoTexto(v.periodo)} con {comparacionTexto(v.periodo)}.</span>}
        items={[
          { rotulo: 'Inversión total', universo: 'pauta', ir: s31.id, irTexto: s31.titulo, valor: ok(pa) ? dolares(pa.inversion) : null, nota: ok(pl) ? `en ${numero(pl.plataformas.length)} plataformas` : null },
          ...(ok(pl) ? pl.plataformas.map((p, i) => ({
            rotulo: `CPL ${p.nombre}`, serie: i, universo: 'pauta', ir: 'p-' + p.id, irTexto: p.nombre, valor: p.cpl == null ? null : dolares(p.cpl, 2),
            delta: deltaCorto(p.cambioCpl, 'baja', v),
          })) : []),
          { rotulo: 'Leads de las plataformas', universo: 'pauta', ir: s32.id, irTexto: s32.titulo, valor: ok(pa) ? numero(pa.leads) : null, delta: ok(pa) ? deltaCorto(pa.cambio, 'sube', v) : null, dataClave: 'pauta-leads' },
        ]} />

      {/* ───── 3.1 Dónde está la inversión ───── */}
      <SeccionDe def={s31} vista={v}>
        {!ok(pl) || !ok(r) ? <Bloque titulo="Cómo se reparte la inversión" universo="pauta" estado={sinDato(pl.estado)} /> : <>
          <Bloque universo="pauta" titulo="Cómo se reparte la inversión" lectura={A.inversionContraLeads(v).lectura}
            pie={<span>Producto según el nombre de la campaña: membresías busca leads; marca, alcance. En rojo, el costo por lead que pasa su objetivo.</span>}>
            <Franja verTabla={false} etiqueta="Inversión por plataforma" formato={(p) => porcentaje(p)}
              partes={pl.plataformas.map((p, i) => ({ nombre: p.nombre, valor: p.inversion, pct: p.pctInversion, clase: `q-p${i}` }))} />
            <div className="q-dos-columnas">
              <div>
                <h4 className="q-subtitulo">Por producto</h4>
                <Tabla etiqueta="Inversión por producto y plataforma" numericas={[1, 2, 3, 4]}
                  columnas={['Producto', 'Total', ...v.analiza.reparto.plataformas.map((p) => p.nombre.replace(' Ads', ''))]}
                  filas={v.analiza.reparto.productos.map((p) => [p.nombre, dolares(p.total), ...p.porPlataforma.map((n) => dolares(n))])} />
              </div>
              <div>
                <h4 className="q-subtitulo">Por plataforma, contra su objetivo</h4>
                <Tabla etiqueta="Inversión, CTR y costo por lead de cada plataforma contra su objetivo" numericas={[1, 2, 3, 4]}
                  columnas={['Plataforma', 'Inversión', 'CTR', 'Costo por lead', 'Objetivo']}
                  filas={pl.plataformas.map((p) => [p.nombre, dolares(p.inversion), porcentaje(p.ctr * 100, 2), { texto: dolares(p.cpl, 2), tono: p.difObjetivo > 0 ? 'empeora' : null }, dolares(p.objetivo, 2)])} />
              </div>
            </div>
          </Bloque>
          {sugerencias.length === 0 && <SugerenciaModelo {...sinReasignar(r, periodoTexto(v.periodo))} columnas={columnas}
            ayuda={<p>Solo propone mover inversión cuando una plataforma pasa su objetivo de costo por lead y el CRM confirma que es la que más cuesta por inscripción.</p>}
            pie={<span>Inversión de {periodoTexto(v.periodo)}{r.cohorteCerrada ? ` · inscripciones de la cohorte de ${mesTexto(r.cohorteDesde.slice(0, 7))}` : ''}</span>} />}
          {sugerencias.map((s) => (
            <SugerenciaModelo key={s.titulo} titulo={s.titulo} detalle={`${s.dato} ${s.estimacion}`} columnas={columnas}
              ayuda={<><p>{s.sostiene}</p><ul>{s.supuestos.map((x) => <li key={x}>{x}</li>)}</ul></>}
              pie={<a className="q-alerta-ir" href={'#' + s.ir}>Ver el dato en {s.irTexto}<ArrowUpRight size={14} aria-hidden="true" /></a>} />
          ))}
        </>}
      </SeccionDe>

      {/* ───── 3.2 Cada plataforma ───── */}
      <SeccionDe def={s32} vista={v}>
        {!ok(pl) ? <Bloque titulo="Cada plataforma" universo="pauta" estado={sinDato(pl.estado)} /> : pl.plataformas.map((p) => (
          <PlataformaBloques key={p.id} p={p} pl={pl} v={v} />
        ))}
      </SeccionDe>

      {/* ───── 3.3 Cuándo se visita el sitio ───── */}
      <SeccionDe def={s33} vista={v}>
        {!ok(w) ? <Bloque titulo="Cuándo se visita el sitio" universo="web" estado={sinDato(w.estado)} /> : (
          <Bloque universo="web" {...L.webHoras(v)}
            pie={<span>GA4 entrega la hora y el día por separado. Por hora: usuarios activos en esa hora, promedio de los días del período. Por día: usuarios activos al día, promedio de ese día de la semana.</span>}>
            <HorasYDias porHora={w.porHora} horasAltas={w.horasAltas} porDiaSemana={w.porDiaSemana} diaMayor={w.diaMayor} que="Usuarios activos" formato={(n) => (n == null ? 'sin dato' : numero(Math.round(n)))} />
          </Bloque>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}

// Una plataforma: inversión por día y sus campañas; en Google Ads, además, palabras clave y términos de búsqueda
function PlataformaBloques({ p, pl, v }) {
  const sinDia = p.porDia.filter((d) => d.inversion == null).map((d) => d.fecha);
  return (
    <>
      <Bloque id={'p-' + p.id} universo="pauta" {...plataformaLectura(p)}
        pie={sinDia.length > 0 && <span>{numero(sinDia.length)} {sinDia.length === 1 ? 'día' : 'días'} sin dato: {sinDia.map(fecha).join(', ')}</span>}>
        <h4 className="q-subtitulo">Inversión por día</h4>
        <Linea serie={p.porDia.map((d) => ({ fecha: d.fecha, valor: d.inversion }))} alto={190} formato={(n) => (n == null ? 'sin dato' : dolares(n))} etiqueta={`Inversión de ${p.nombre} por día, en dólares`} />
        <Tabla etiqueta={`Campañas de ${p.nombre} con gasto`} numericas={[1, 2, 3, 4]} barra={{ columna: 1, valores: p.campanas.map((c) => c.inversion) }}
          columnas={['Campaña', 'Inversión', 'Clics', 'Leads', 'Costo por lead']}
          filas={p.campanas.map((c) => [{ texto: c.nombre, sub: [TIPO[c.canal], PRODUCTO[c.producto]].filter(Boolean).join(' · ') }, dolares(c.inversion), numero(c.clics), numero(c.leads), cplCampana(c, p.objetivo)])} />
      </Bloque>
      {p.id === 'google' && <>
        <Bloque universo="pauta" ancho="mitad" {...L.palabrasLectura(v)}>
          <Tabla etiqueta="Palabras clave con más gasto" numericas={[1, 2, 3, 4]} barra={{ columna: 1, valores: pl.palabras.nombradas.map((k) => k.inversion) }}
            columnas={['Palabra clave', 'Gasto', 'Clics', 'Leads', 'Costo por clic']}
            filas={pl.palabras.nombradas.map((k) => [k.texto, dolares(k.inversion), numero(k.clics), { texto: numero(k.leads), tono: pl.palabras.sinConversion.includes(k) ? 'empeora' : null }, dolares(k.cpc, 2)])} />
        </Bloque>
        <Bloque universo="pauta" ancho="mitad" {...L.terminosLectura(v)}
          pie={<span>Otros términos: {numero(pl.terminosResto?.clics ?? 0)} clics repartidos en búsquedas que se hicieron pocas veces.</span>}>
          <Tabla etiqueta="Términos de búsqueda con más clics" numericas={[1, 2]} barra={{ columna: 1, valores: pl.terminos.map((t) => t.clics) }}
            columnas={['Término que se buscó', 'Clics', 'Leads']}
            filas={pl.terminos.map((t) => [t.texto, numero(t.clics), numero(t.leads)])} />
        </Bloque>
      </>}
    </>
  );
}
