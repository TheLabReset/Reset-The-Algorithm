// Capa 2 · Analiza: lo que aparece al cruzar fuentes. Lo de universos distintos se compara, nunca se suma.
// No calcula: pinta v.analiza y los textos de src/textos/analiza.js.
import { Bloque, Tabla } from '../sistema/Componentes.jsx';
import { Columnas, Barras, DosLineas } from '../sistema/graficos/Graficos.jsx';
import { numero, dolares, variacion } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, HorasYDias } from './comun.jsx';
import { mesTexto } from '../textos/comun.js';
import * as A from '../textos/analiza.js';

const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : estado === 'fuera' ? 'fuera' : 'sin-datos', reemplaza: true });

export default function Analiza({ capa, vista: v }) {
  const [s21, s22, s23, s24, s25] = capa.secciones;
  const a = v.analiza;
  const r = a.rendimiento;
  return (
    <MarcoCapa capa={capa} vista={v} conResumen={false}>
      {/* ───── 2.1 Reparto de la inversión ───── */}
      <SeccionDe def={s21} vista={v}>
        {r.estado === 'ok' && <>
          <Bloque universo="pauta" ancho="mitad" {...A.inversionContraLeads(v)}
            pie={<span>De cada 100 dólares y de cada 100 leads reportados en el mes, por plataforma.</span>}>
            <Columnas etiqueta="Parte de la inversión y parte de los leads de cada plataforma" tituloA="De cada 100 dólares" tituloB="De cada 100 leads"
              filas={r.canales.map((c) => ({ nombre: c.nombre, a: c.pctInversion, b: c.pctLeads, resaltarB: c.id === [...r.canales].sort((x, y) => y.pctLeads / y.pctInversion - x.pctLeads / x.pctInversion)[0].id }))} />
          </Bloque>
          <Bloque universo="pauta" ancho="mitad" {...A.productos(v)}
            pie={<span>Membresías: campañas que buscan leads. Marca: alcance, no buscan leads.</span>}>
            <Tabla etiqueta="Inversión por producto y plataforma" numericas={[1, 2, 3, 4]}
              columnas={['Producto', ...a.reparto.plataformas.map((p) => p.nombre), 'Total']}
              filas={a.reparto.productos.map((p) => [p.nombre, ...p.porPlataforma.map((n) => dolares(n)), dolares(p.total)])} />
          </Bloque>
        </>}
      </SeccionDe>

      {/* ───── 2.2 De la pauta al CRM ───── */}
      <SeccionDe def={s22} vista={v}>
        {a.pautaCrm.estado !== 'ok' ? <Bloque titulo="De la pauta al CRM" universo="crm" estado={sinDato(a.pautaCrm.estado)} /> : (
          <Bloque universo="crm" ancho="mitad" {...A.pautaCrm(v)}
            pie={<span>Leads de cada plataforma que entraron al CRM en el mes, de cada 100 que la plataforma reporta.</span>}>
            <Barras etiqueta="Leads en el CRM de cada 100 reportados" max={100} formato={(n) => numero(n)}
              resaltar={[...a.pautaCrm.plataformas].sort((x, y) => x.porCadaReportado - y.porCadaReportado)[0].nombre}
              filas={a.pautaCrm.plataformas.map((p) => ({ nombre: p.nombre, valor: Math.round(p.porCadaReportado * 100), nota: `${numero(p.enCrm)} de ${numero(p.reportados)}` }))} />
            <Tabla etiqueta="Costo por lead según la plataforma y según el CRM" numericas={[1, 2]}
              columnas={['Plataforma', 'Costo por lead reportado', 'Costo por lead en el CRM']}
              filas={a.pautaCrm.plataformas.map((p) => [p.nombre, dolares(p.inversion / p.reportados, 2), dolares(p.costoCrm, 2)])} />
          </Bloque>
        )}
        {r.estado !== 'ok' ? <Bloque titulo="Costo por inscripción" universo="crm" estado={sinDato(r.estado)} /> : (
          <Bloque universo="crm" ancho="mitad" {...A.costos(v)} alcance={`Cohorte de ${mesTexto(r.cohorteDesde.slice(0, 7))}${r.cohorteCerrada ? '' : ' · abierta'}`}
            pie={<span>Costo por lead: lo que reporta la plataforma en el mes. Costo por inscripción: inversión de la cohorte entre sus inscripciones del CRM. Rayado: pocos casos.</span>}>
            <Columnas etiqueta="Costo por lead y costo por inscripción de cada plataforma" tituloA="Por lead" tituloB="Por inscripción"
              formatoA={(n) => dolares(n, 2)} formatoB={(n) => dolares(n)}
              filas={r.canales.map((c) => ({ nombre: c.nombre, a: c.cpl, metaA: c.metaCpl, b: c.cohorte?.cpa ?? null, pocosB: c.cohorte?.pocosCasos, resaltarB: !r.cpaParecido && r.masBaratoPorInscripcion?.id === c.id }))} />
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 2.3 Demanda y respuesta ───── */}
      <SeccionDe def={s23} vista={v}>
        {a.demandaRespuesta.estado !== 'ok' ? <Bloque titulo="Demanda y respuesta" universo="busquedas" estado={sinDato(a.demandaRespuesta.estado)} /> : (
          <Bloque universo="busquedas" {...A.demanda(v)}
            ayuda={<p>Cada línea tiene su propia escala. La correlación mide si suben y bajan juntas; no dice qué causa qué.</p>}
            pie={<span>Semanas de lunes a domingo. {a.demandaRespuesta.semanasIncompletas.length === 1 ? 'Una semana con un día sin dato no entra en la correlación.' : a.demandaRespuesta.semanasIncompletas.length > 1 ? `${numero(a.demandaRespuesta.semanasIncompletas.length)} semanas con días sin dato no entran en la correlación.` : ''}</span>}>
            <DosLineas etiqueta="Interés de búsqueda y leads de pauta por semana"
              a={{ nombre: 'Interés por «gimnasio», de 0 a 100', serie: a.demandaRespuesta.busqueda, formato: (n) => numero(n) }}
              b={{ nombre: 'Leads de pauta por semana', serie: a.demandaRespuesta.leads, formato: (n) => numero(n) }} />
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 2.4 Cuándo entra el lead ───── */}
      <SeccionDe def={s24} vista={v}>
        {a.horaDia.estado !== 'ok' ? <Bloque titulo="Cuándo entra el lead" universo="crm" estado={sinDato(a.horaDia.estado)} /> : (
          <Bloque universo="crm" {...A.hora(v)}
            pie={<span>Leads que entran al CRM: por hora, promedio de los días del mes; por día, promedio de ese día de la semana. En verde, las cuatro horas con más leads. Conviene leerlo junto al primer contacto, en el capítulo CRM de Lee.</span>}>
            <HorasYDias porHora={a.horaDia.porHora} horasAltas={a.horaDia.horasAltas} porDiaSemana={a.horaDia.porDiaSemana} diaMayor={a.horaDia.diaMayor} que="Leads" formato={(n) => (n == null ? 'sin dato' : numero(n, n < 10 ? 1 : 0))} />
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 2.5 Dónde crece ───── */}
      <SeccionDe def={s25} vista={v}>
        {a.sedes.estado !== 'ok' ? <Bloque titulo="Sedes" universo="crm" estado={sinDato(a.sedes.estado)} /> : (
          <Bloque universo="crm" {...A.sedes(v)}
            pie={<span>Inscripción: de cada 100 leads de las cohortes de {mesTexto(a.sedes.cohorteTasa[0].slice(0, 7))} a {mesTexto(a.sedes.cohorteTasa[1].slice(0, 7))}. «Sin comparación»: la sede abrió después del período de comparación.</span>}>
            <Tabla etiqueta="Leads e inscripción por sede" numericas={[2, 3, 4]}
              columnas={['Sede', 'Zona', 'Leads del mes', 'Contra la comparación', 'Inscribe de cada 100']}
              filas={[...a.sedes.items].sort((x, y) => (y.leads ?? 0) - (x.leads ?? 0)).map((s) => [
                s.nombre, s.zona, s.leads == null ? 'sin dato' : numero(s.leads),
                s.cambio == null ? 'sin comparación' : Math.round(s.cambio) === 0 ? 'igual' : variacion(s.cambio),
                s.tasa == null ? 'sin dato' : s.tasa.pocosCasos ? 'pocos casos' : numero(s.tasa.valor * 100, 1),
              ])} />
          </Bloque>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}
