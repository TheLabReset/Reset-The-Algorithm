// Capa 4 · Rendimiento y optimización: qué dio resultado. Cómo viene el período, de la pauta al CRM, el CRM por
// dentro, cuándo y dónde entran los leads, y la competencia. Lo de universos distintos se compara, nunca se suma.
// No calcula: pinta la vista y las lecturas de src/textos.
import { Bloque, Tabla, Resumen, Flujo } from '../sistema/Componentes.jsx';
import { Linea, Barras, Etapas, Reticula, Histograma, Columnas, Acumulado } from '../sistema/graficos/Graficos.jsx';
import { numero, dolares, porcentaje, variacion, rangoFechas, fecha } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, HorasYDias, Competencia, sinDato, deltaCorto } from './comun.jsx';
import { periodoTexto, comparacionTexto, mesTexto } from '../textos/comun.js';
import * as L from '../textos/lee.js';
import * as A from '../textos/analiza.js';
import { embudoFuente, acumuladoLectura, textosDelAbanico, verSusAnuncios } from '../textos/capas.js';

export default function Rendimiento({ capa, vista: v }) {
  const [s41, s42, s43, s44, s45] = capa.secciones;
  const pa = v.lee.pauta, cr = v.lee.crmDetalle, co = v.lee.crm, r = v.analiza.rendimiento, pc = v.analiza.pautaCrm;
  const ok = (x) => x.estado === 'ok';
  const cohorte = ok(co) ? `cohorte de ${mesTexto(co.cohorteDesde.slice(0, 7))}${co.cerrada ? '' : ' · abierta'}` : null;
  const altas = ok(co) ? co.etapas.find((e) => e.id === 'altas')?.valor : null;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(v.periodo)}`}
        pie={<span>Leads del CRM del período, contra {comparacionTexto(v.periodo)}. Inscripciones y su costo, de la {cohorte || 'última cohorte cerrada'}: un lead tarda en inscribirse.</span>}
        items={[
          { rotulo: 'Leads en el CRM', universo: 'crm', ir: s41.id, irTexto: s41.titulo, valor: ok(cr) ? numero(cr.total) : null, delta: ok(cr) ? deltaCorto(cr.cambio, 'sube', v) : null, dataClave: 'crm-total' },
          { rotulo: 'Inscripciones', universo: 'crm', ir: s43.id, irTexto: s43.titulo, valor: altas == null ? null : numero(altas), nota: cohorte },
          { rotulo: 'Se inscriben de cada 100', universo: 'crm', ir: s43.id, irTexto: s43.titulo, valor: ok(co) ? numero(Math.round(co.tasaAlta * 100)) : null, nota: 'leads de la cohorte' },
          { rotulo: 'Inversión en pauta', universo: 'pauta', ir: s41.id, irTexto: s41.titulo, valor: ok(pa) ? dolares(pa.inversion) : null, nota: 'lo que reportan las plataformas' },
          { rotulo: 'Costo por inscripción', universo: 'crm', ir: s42.id, irTexto: s42.titulo, valor: r.totalCohorte?.cpa != null ? dolares(r.totalCohorte.cpa) : null, nota: 'inversión ÷ inscripciones de pauta' },
        ]} />

      {/* ───── 4.1 Cómo viene el período ───── */}
      <SeccionDe def={s41} vista={v}>
        {!ok(cr) ? <Bloque titulo="Leads en el CRM" universo="crm" estado={sinDato(cr.estado)} /> : <>
          <Bloque universo="crm" ancho="mitad" {...L.crmPorDia(v)} pie={<span>Incluye los leads de pauta que llegaron aunque la plataforma no los reportara{co.periodo ? `, y ${numero(co.periodo.deSitio)} que llegaron por el sitio sin pauta` : ''}.</span>}>
            <Linea serie={cr.serie} previa={cr.seriePrevia} etiqueta="Leads del CRM por día, con el mismo tramo de la comparación en gris" />
          </Bloque>
          <Bloque universo="crm" ancho="mitad" {...acumuladoLectura(v)} pie={<span>En gris, el mismo tramo de {comparacionTexto(v.periodo)}.</span>}>
            <Acumulado serie={cr.acumulado.map((p) => ({ fecha: p.fecha, real: p.valor, plan: p.previo }))} rotuloReal={periodoTexto(v.periodo)} rotuloRef={comparacionTexto(v.periodo)}
              etiqueta="Leads del CRM acumulados en el mes, con la comparación en gris" />
          </Bloque>
        </>}
        {!ok(pa) ? <Bloque titulo="Inversión y resultados por día" universo="pauta" estado={sinDato(pa.estado)} /> : (
          <Bloque universo="pauta" titulo="Inversión y resultados por día" lectura={`${L.pautaResumen(v).lectura} ${L.inversionDia(v).lectura}`}
            ayuda={<p>Lo que reporta cada plataforma. Un día en que alguna no entregó datos queda como hueco, no como cero, y la comparación se hace por día medido.</p>}
            pie={<><span>Google Ads, Meta Ads y TikTok Ads juntos.</span>{pa.diasParciales.length > 0 && <span>{numero(pa.diasParciales.length)} {pa.diasParciales.length === 1 ? 'día' : 'días'} con una plataforma sin dato: {pa.diasParciales.map(fecha).join(', ')}</span>}</>}>
            <div className="q-dos-columnas">
              <div>
                <h4 className="q-subtitulo">Inversión por día, en dólares</h4>
                <Linea serie={pa.serieInversion} alto={220} formato={(n) => (n == null ? 'sin dato' : dolares(n))} etiqueta="Inversión en pauta por día, en dólares" />
              </div>
              <div>
                <h4 className="q-subtitulo">Leads que reportan las plataformas</h4>
                <Linea serie={pa.serie} previa={pa.seriePrevia} eventos={pa.eventos} alto={220} etiqueta="Leads reportados por día, con el mismo tramo de la comparación en gris" />
              </div>
            </div>
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 4.2 De la pauta al CRM ───── */}
      <SeccionDe def={s42} vista={v}>
        {!ok(pc) ? <Bloque titulo="De la pauta al CRM" universo="crm" estado={sinDato(pc.estado)} /> : (
          <Bloque universo="crm" titulo="Google Ads, Meta Ads y TikTok Ads en el CRM" lectura={A.pautaCrm(v).lectura}
            pie={<span>Cada plataforma cuenta con su propia regla; el CRM registra al lead cuando llega. Inscritos: leads del período que ya se inscribieron, hasta hoy.</span>}>
            <Flujo etiqueta="De la inversión a la inscripción, por plataforma" columnas={['Inversión', 'Reportado por la plataforma', 'Llegan al CRM', 'Inscritos hasta hoy']}
              filas={pc.plataformas.map((p) => ({
                nombre: p.nombre,
                pasos: [
                  { valor: dolares(p.inversion), nota: 'invertidos' },
                  { valor: numero(p.reportados), nota: `leads · ${dolares(p.cplReportado, 2)} c/u` },
                  { valor: numero(p.enCrm), nota: `${numero(Math.round(p.porCadaReportado * 100))} de cada 100 · ${dolares(p.costoCrm, 2)} c/u` },
                  { valor: numero(p.inscritosHastaHoy), nota: p.costoInscrito != null ? `${dolares(p.costoInscrito)} c/u` : 'todavía ninguno' },
                ],
              }))} />
          </Bloque>
        )}
        {ok(co) && (
          <Bloque universo="crm" ancho="mitad" {...embudoFuente(v)} alcance={cohorte}
            pie={<span>Fuente por último clic. Sitio sin pauta: leads que llegaron por el formulario del sitio sin venir de un anuncio.</span>}>
            <Tabla etiqueta="Leads e inscripciones por fuente" numericas={[1, 2, 3]} barra={{ columna: 1, valores: co.porOrigen.map((o) => o.leads) }}
              columnas={['Fuente', 'Leads', 'Inscritos', 'De cada 100']}
              filas={co.porOrigen.map((o) => [o.nombre, numero(o.leads), numero(o.altas), o.pocosCasos ? 'pocos casos' : numero(Math.round(o.tasaAlta * 100))])} />
          </Bloque>
        )}
        {!ok(r) ? <Bloque titulo="Costo por inscripción" universo="crm" estado={sinDato(r.estado)} /> : (
          <Bloque universo="crm" ancho="mitad" {...A.costos(v)} alcance={`cohorte de ${mesTexto(r.cohorteDesde.slice(0, 7))}${r.cohorteCerrada ? '' : ' · abierta'}`}
            pie={<span>Costo por lead: lo que reporta la plataforma en el mes. Costo por inscripción: inversión de la cohorte entre sus inscripciones del CRM. Rayado: pocos casos.</span>}>
            <Columnas etiqueta="Costo por lead y costo por inscripción de cada plataforma" tituloA="Por lead" tituloB="Por inscripción"
              formatoA={(n) => dolares(n, 2)} formatoB={(n) => dolares(n)}
              filas={r.canales.map((c) => ({ nombre: c.nombre, a: c.cpl, metaA: c.metaCpl, b: c.cohorte?.cpa ?? null, pocosB: c.cohorte?.pocosCasos, resaltarB: !r.cpaParecido && r.masBaratoPorInscripcion?.id === c.id }))} />
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 4.3 Dentro del CRM ───── */}
      <SeccionDe def={s43} vista={v}>
        {!ok(cr) ? <Bloque titulo="Dentro del CRM" universo="crm" estado={sinDato(cr.estado)} /> : <>
          <Bloque universo="crm" ancho="mitad" {...L.crmFuentes(v)} pie={<span>Fuente por último clic, registrada en el CRM.</span>}>
            <Barras etiqueta="Leads del CRM por fuente" formato={(n) => numero(n)}
              filas={cr.fuentes.map((f) => ({ nombre: f.nombre, valor: f.leads, nota: `${numero(f.pct)} de 100` }))} />
          </Bloque>
          <Bloque universo="crm" ancho="mitad" {...L.crmEtapas(v)}
            pie={<span>«≥»: los leads siguen en la etapa, así que los días son un piso. Un lead se descarta si pasa su plazo sin avanzar.</span>}>
            <Tabla etiqueta="Etapas de los leads del período" numericas={[1, 2, 3]} barra={{ columna: 2, valores: [...cr.etapas.map((e) => e.estan), cr.salidas.descartados] }}
              columnas={['Etapa', 'Entraron', 'Están hoy', 'Días ahí']}
              apagadas={[cr.etapas.length]}
              filas={[
                ...cr.etapas.map((e) => [e.nombre, numero(e.entraron), e.estan == null ? '' : numero(e.estan), e.diasAhi == null ? '' : `≥ ${numero(e.diasAhi, 1)}`]),
                ['Descartados', '', numero(cr.salidas.descartados), ''],
              ]} />
          </Bloque>
          {ok(co)
            ? <Bloque universo="crm" alcance={cohorte} {...L.crmCohorte(v)}
                estado={co.cerrada ? null : { tipo: 'abierta', texto: 'Algunas inscripciones de esta cohorte todavía no ocurren: las tasas pueden subir.' }}>
                <div className="q-dos-columnas q-cohorte">
                  <Etapas etiqueta="Etapas de la cohorte" filas={co.etapas.map((e, i) => ({ nombre: ['Leads', 'Contactados', 'Con cita', 'Fueron a la clase', 'Se inscribieron'][i], valor: e.valor }))} />
                  <Reticula etiqueta="Destino de cada 100 leads de la cohorte" partes={co.exclusivas.map((e) => ({ nombre: e.nombre }))} cuadros={co.exclusivas.map((e) => e.de100)} />
                </div>
              </Bloque>
            : <Bloque universo="crm" titulo="Del lead a la inscripción" estado={sinDato(co.estado)} />}
          <Bloque universo="crm" ancho="mitad" {...L.crmAtencion(v)}>
            <Histograma etiqueta="Tiempo al primer contacto" formato={(n) => `${numero(n)} leads`} rotulo={(b) => `${numero(b.pct)} %`}
              barras={cr.atencion.tramos.map((t) => ({ nombre: t.nombre, corto: t.nombre.replace('menos de ', '< ').replace('más de ', '> '), valor: t.valor, pct: t.pct }))} resaltar={[]} />
            <p className="q-nota-bloque">La mitad de los leads tuvo {numero(cr.atencion.medianaIntentos)} {cr.atencion.medianaIntentos === 1 ? 'intento' : 'intentos'} de contacto o menos. {numero(cr.atencion.sinRegistro)} contactos sin registro de hora.</p>
          </Bloque>
          <Bloque universo="crm" ancho="mitad" {...L.crmDescarte(v)}>
            <Barras etiqueta="Motivos de descarte" filas={cr.descarte.motivos.map((m) => ({ nombre: m.nombre, valor: m.valor }))} />
          </Bloque>
          <Bloque universo="crm" titulo="Campañas del CRM" alcance="acumulado de cada campaña" lectura={cr.campanas.length ? 'Las campañas que se cruzan con el período, con lo que el CRM les atribuye desde que empezaron.' : 'Ninguna campaña del CRM se cruza con este período.'}
            pie={<span>Valor estimado: inscripciones por el ticket de entrada (matrícula y primer mes). No se compara con la inversión, que mide otra cosa.</span>}>
            {cr.campanas.length > 0 && <Tabla etiqueta="Campañas del CRM" numericas={[2, 3, 4]}
              columnas={['Campaña', 'Vigencia', 'Leads', 'Inscripciones', 'Valor estimado']}
              filas={cr.campanas.map((k) => [{ texto: k.nombre, sub: k.enCurso ? 'en curso' : null }, rangoFechas(k.desde, k.hasta), numero(k.leads), numero(k.altas), dolares(k.valor)])} />}
          </Bloque>
        </>}
      </SeccionDe>

      {/* ───── 4.4 Cuándo y dónde ───── */}
      <SeccionDe def={s44} vista={v}>
        {v.analiza.horaDia.estado !== 'ok' ? <Bloque titulo="Cuándo entran los leads" universo="crm" estado={sinDato(v.analiza.horaDia.estado)} /> : (
          <Bloque universo="crm" {...A.hora(v)}
            pie={<span>Por hora: promedio de los días del mes; por día: promedio de ese día de la semana. Conviene leerlo junto al primer contacto, en Dentro del CRM.</span>}>
            <HorasYDias porHora={v.analiza.horaDia.porHora} horasAltas={v.analiza.horaDia.horasAltas} porDiaSemana={v.analiza.horaDia.porDiaSemana} diaMayor={v.analiza.horaDia.diaMayor} que="Leads" formato={(n) => (n == null ? 'sin dato' : numero(n, n < 10 ? 1 : 0))} />
          </Bloque>
        )}
        {v.analiza.sedes.estado !== 'ok' ? <Bloque titulo="Sedes" universo="crm" estado={sinDato(v.analiza.sedes.estado)} /> : (
          <Bloque universo="crm" {...A.sedes(v)}
            pie={<span>Inscripción: de cada 100 leads de las cohortes de {mesTexto(v.analiza.sedes.cohorteTasa[0].slice(0, 7))} a {mesTexto(v.analiza.sedes.cohorteTasa[1].slice(0, 7))}. «Sin comparación»: la sede abrió después del período de comparación.</span>}>
            {(() => {
              const sedes = [...v.analiza.sedes.items].sort((x, y) => (y.leads ?? 0) - (x.leads ?? 0));
              return (
                <Tabla etiqueta="Leads e inscripción por sede" numericas={[2, 3, 4]} barra={{ columna: 2, valores: sedes.map((s) => s.leads) }}
                  columnas={['Sede', 'Zona', 'Leads del mes', 'Contra la comparación', 'Inscribe de cada 100']}
                  filas={sedes.map((s) => [
                    s.nombre, s.zona, s.leads == null ? 'sin dato' : numero(s.leads),
                    s.cambio == null ? 'sin comparación' : Math.round(s.cambio) === 0 ? 'igual' : variacion(s.cambio),
                    s.tasa == null ? 'sin dato' : s.tasa.pocosCasos ? 'pocos casos' : numero(s.tasa.valor * 100, 1),
                  ])} />
              );
            })()}
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 4.5 La competencia: lectura del mes, sin comparación (de la competencia no hay historia) ───── */}
      <SeccionDe def={s45} vista={v}>
        {v.lee.competencia.estado !== 'ok' ? <Bloque titulo="La competencia" universo="conversacion" estado={sinDato(v.lee.competencia.estado)} /> : <>
          <Bloque universo="conversacion" {...L.competenciaLectura(v)} alcance="últimas publicaciones · anuncios activos"
            ayuda={<><p>Interacción: reacciones, comentarios y compartidos de las publicaciones del mes. Sentimiento: los comentarios en esas publicaciones, clasificados en positivos, neutros y negativos; el índice va de 0 (todo negativo) a 100 (todo positivo) y 50 es neutro.</p><p>No se compara con otro período: de la competencia solo se lee lo que está publicado.</p></>}
            pie={<><span>Publicaciones de {periodoTexto(v.periodo)} · anuncios activos al {fecha(v.periodo.hasta)}</span><span>Facebook y biblioteca de anuncios de Meta · marcas reales con cifras de muestra: no describen su desempeño real</span></>}>
            <Competencia marcas={v.lee.competencia.marcas} numero={numero} anuncios={v.lee.anuncios.estado === 'ok' ? v.lee.anuncios : null}
              t={v.lee.anuncios.estado === 'ok' ? textosDelAbanico(v.lee.anuncios, v.lee.anuncios.mes.slice(0, 4)) : null} verSus={verSusAnuncios}
              nota={v.lee.anuncios.estado === 'ok' ? `anuncios activos en ${mesTexto(v.lee.anuncios.mes)}` : null} />
          </Bloque>
          <Bloque universo="conversacion" {...L.competenciaAnuncios(v)} alcance={`anuncios activos al ${fecha(v.periodo.hasta)}`}
            pie={<span>Anuncios activos el último día del período, por formato.</span>}>
            {(() => {
              const marcas = [...v.lee.competencia.marcas].sort((a, b) => b.anuncios - a.anuncios);
              return (
                <Tabla etiqueta="Publicaciones y anuncios activos de cada marca" numericas={[1, 2, 3, 4, 5, 6]} barra={{ columna: 3, valores: marcas.map((m) => m.anuncios) }}
                  destacada={marcas.findIndex((m) => m.propia)}
                  columnas={['Marca', 'Publicaciones', 'Interacción por publicación', 'Anuncios activos', ...v.lee.competencia.formatos]}
                  filas={marcas.map((m) => [m.nombre, numero(m.publicaciones), numero(m.porPublicacion), numero(m.anuncios), ...m.formatos.map((n) => numero(n))])} />
              );
            })()}
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
