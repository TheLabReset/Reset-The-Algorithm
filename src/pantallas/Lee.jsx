// Capa 1 · Lee: lo que dice cada fuente, por separado. No calcula: pinta la vista y las lecturas de src/textos.
import { Bloque, Cifra, Tabla, Estado } from '../sistema/Componentes.jsx';
import { Linea, Multiplos, Bala, Barras, Etapas, Reticula, Pesas, Franja, Histograma } from '../sistema/graficos/Graficos.jsx';
import { numero, soles, porcentaje, compacto, variacion, rangoFechas, fecha, diaSemanaLargo, NO_MEDIDO } from '../sistema/formato.js';
import { CabeceraCapa, Veredicto, SeccionDe } from './comun.jsx';
import { periodoTexto, comparacionTexto, mesTexto } from '../textos/comun.js';
import * as L from '../textos/lee.js';

const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : estado === 'fuera' ? 'fuera' : 'sin-datos', reemplaza: true });
const delta = (cambio, mejorSi, v) => ({ cambio, mejorSi, referencia: `contra ${comparacionTexto(v.periodo)}`, motivo: 'sin comparación' });

export default function Lee({ capa, vista: v }) {
  const [s11, s12, s13, s14, s15, s16] = capa.secciones;
  const pa = v.lee.pauta;
  return (
    <>
      <CabeceraCapa capa={capa} veredicto={
        <Veredicto rotulo={`Leads en el CRM · ${periodoTexto(v.periodo)}`}>
          {v.lee.crmDetalle.estado === 'ok'
            ? <Cifra valor={numero(v.lee.crmDetalle.total)} tamano="media" delta={delta(v.lee.crmDetalle.cambio, 'sube', v)} dataClave="veredicto-lee" />
            : <Estado tipo={v.lee.crmDetalle.estado} />}
        </Veredicto>
      } />
      <div className="q-envoltura q-capa">
        {/* ───── 1.1 Pauta pagada ───── */}
        <SeccionDe def={s11} vista={v}>
          {pa.estado !== 'ok' ? <Bloque titulo="Pauta pagada" universo="pauta" estado={sinDato(pa.estado)} /> : <>
            <Bloque universo="pauta" {...L.pautaResumen(v)}
              ayuda={<p>Leads, inversión y costo por lead como los reporta cada plataforma. Un día en que alguna plataforma no entregó datos no se cuenta en el total, y la comparación se hace por día medido.</p>}
              pie={<><span>{rangoFechas(v.periodo.desde, v.periodo.hasta)}</span>{pa.diasParciales.length > 0 && <span>{numero(pa.diasParciales.length)} {pa.diasParciales.length === 1 ? 'día' : 'días'} con una plataforma sin dato: {pa.diasParciales.map(fecha).join(', ')}</span>}</>}>
              <div className="q-cifras">
                <Cifra valor={numero(pa.leads)} rotulo="leads reportados" delta={delta(pa.cambio, 'sube', v)} dataClave="pauta-leads" />
                <Cifra valor={soles(pa.inversion)} rotulo="inversión" tamano="media" />
                <Cifra valor={soles(pa.cpl, 2)} rotulo="costo por lead" tamano="media" delta={delta(pa.cambioCpl, 'baja', v)} />
              </div>
              <Linea serie={pa.serie} previa={pa.seriePrevia} eventos={pa.eventos} etiqueta="Leads reportados por día, con el mismo tramo de la comparación en gris" />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" {...L.plataformasLectura(v)}
              ayuda={<p>Costo por lead de cada plataforma contra su objetivo. El objetivo de Google Ads combina el de Search y el de Display según lo que invirtió cada uno. Las bandas grises marcan holgado (bajo 85 % del objetivo) y en objetivo.</p>}>
              <Bala max={Math.ceil(Math.max(...v.lee.plataformas.plataformas.map((p) => Math.max(p.cpl ?? 0, p.objetivo) * 1.25)) / 5) * 5} formato={(n) => soles(n, 2)} formatoEje={(n) => soles(n)}
                etiqueta="Costo por lead de cada plataforma contra su objetivo"
                filas={v.lee.plataformas.plataformas.map((p) => ({
                  nombre: p.nombre, valor: p.cpl, marca: p.objetivo,
                  bandas: [{ hasta: p.objetivo * 0.85 }, { hasta: p.objetivo }, { hasta: Infinity }],
                  estado: p.cpl > p.objetivo ? 'sobre el objetivo' : 'bajo el objetivo', tono: p.cpl > p.objetivo ? 'empeora' : null,
                }))} />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" titulo="Leads por canal, día por día" lectura="Cada canal en su panel, con la misma escala para que se comparen."
              pie={<span>El hueco de una línea es un día sin dato, no un cero.</span>}>
              <Multiplos etiqueta="Leads por día de cada canal" paneles={pa.porCanal.map((c) => ({ nombre: c.nombre, serie: c.serie, nota: c.cambio == null ? '' : variacion(c.cambio) }))} />
            </Bloque>
            <Bloque universo="pauta" {...L.campanasLectura(v)}>
              <Tabla etiqueta="Campañas con gasto en el período" numericas={[3, 4, 5, 6]}
                columnas={['Campaña', 'Plataforma', 'Producto', 'Inversión', 'Clics', 'Leads', 'Costo por lead']}
                filas={v.lee.plataformas.plataformas.flatMap((p) => p.campanas.map((c) => [c.nombre, p.nombre, c.producto === 'marca' ? 'Marca' : 'Membresías', soles(c.inversion), numero(c.clics), numero(c.leads), c.leads ? soles(c.cpl, 2) : 'sin leads']))} />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" {...L.palabrasLectura(v)}>
              <Tabla etiqueta="Palabras clave con más gasto" numericas={[1, 2, 3, 4]}
                columnas={['Palabra clave', 'Gasto', 'Clics', 'Leads', 'Costo por clic']}
                filas={v.lee.plataformas.palabras.nombradas.map((k) => [k.texto, soles(k.inversion), numero(k.clics), numero(k.leads), soles(k.cpc, 2)])} />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" {...L.terminosLectura(v)}
              pie={<span>Otros términos: {numero(v.lee.plataformas.terminosResto?.clics ?? 0)} clics repartidos en búsquedas que se hicieron pocas veces.</span>}>
              <Tabla etiqueta="Términos de búsqueda con más clics" numericas={[1, 2]}
                columnas={['Término que se buscó', 'Clics', 'Leads']}
                filas={v.lee.plataformas.terminos.map((t) => [t.texto, numero(t.clics), numero(t.leads)])} />
            </Bloque>
            <Bloque universo="pauta" alcance={`${rangoFechas(v.lee.plataformas.programatica.desde, v.lee.plataformas.programatica.hasta)} · no sigue el período`} {...L.programaticaLectura(v)}
              pie={<span>{v.lee.plataformas.programatica.fuente} · {numero(v.lee.plataformas.programatica.sitios)} sitios y apps</span>}>
              <Tabla etiqueta="Formatos de la pauta programática" numericas={[3, 4, 5, 6]}
                columnas={['Formato', 'Compra', 'Audiencia', 'Impresiones', 'Clics', 'CTR', 'Consumo']}
                filas={v.lee.plataformas.programatica.formatos.map((f) => [f.nombre, f.compra, f.audiencia, numero(f.impresiones), numero(f.clics), porcentaje(f.ctr * 100, 2), soles(f.consumo)])} />
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.2 CRM ───── */}
        <SeccionDe def={s12} vista={v}>
          {v.lee.crmDetalle.estado !== 'ok' ? <Bloque titulo="CRM" universo="crm" estado={sinDato(v.lee.crmDetalle.estado)} /> : <>
            <Bloque universo="crm" {...L.crmPorDia(v)} pie={<span>Incluye los leads de pauta que llegaron aunque la plataforma no los reportara.</span>}>
              <div className="q-cifras">
                <Cifra valor={numero(v.lee.crmDetalle.total)} rotulo="leads en el CRM" delta={delta(v.lee.crmDetalle.cambio, 'sube', v)} dataClave="crm-total" />
                {v.lee.crm.periodo && <Cifra valor={numero(v.lee.crm.periodo.deSitio)} rotulo="llegaron por el sitio sin pauta" tamano="media" />}
              </div>
              <Linea serie={v.lee.crmDetalle.serie} previa={v.lee.crmDetalle.seriePrevia} etiqueta="Leads del CRM por día, con el mismo tramo de la comparación en gris" />
            </Bloque>
            <Bloque universo="crm" ancho="mitad" {...L.crmFuentes(v)}>
              <Barras etiqueta="Leads del CRM por fuente" formato={(n) => numero(n)}
                filas={v.lee.crmDetalle.fuentes.map((f) => ({ nombre: f.nombre, valor: f.leads, nota: `${numero(f.pct)} de 100` }))} />
            </Bloque>
            <Bloque universo="crm" ancho="mitad" {...L.crmEtapas(v)}
              pie={<span>«≥»: los leads siguen en la etapa, así que los días son un piso. Un lead se descarta si pasa su plazo sin avanzar.</span>}>
              <Tabla etiqueta="Etapas de los leads del período" numericas={[1, 2, 3]}
                columnas={['Etapa', 'Entraron', 'Están hoy', 'Días ahí']}
                filas={[
                  ...v.lee.crmDetalle.etapas.map((e) => [e.nombre, numero(e.entraron), e.estan == null ? '' : numero(e.estan), e.diasAhi == null ? '' : `≥ ${numero(e.diasAhi, 1)}`]),
                  ['Descartados', '', numero(v.lee.crmDetalle.salidas.descartados), ''],
                ]} />
            </Bloque>
            {v.lee.crm.estado === 'ok'
              ? <Bloque universo="crm" ancho="dos-tercios" alcance={`Cohorte de ${mesTexto(v.lee.crm.cohorteDesde.slice(0, 7))}${v.lee.crm.cerrada ? '' : ' · abierta'}`} {...L.crmCohorte(v)}
                  estado={v.lee.crm.cerrada ? null : { tipo: 'abierta', texto: 'Algunas inscripciones de esta cohorte todavía no ocurren: las tasas pueden subir.' }}>
                  <Etapas etiqueta="Etapas de la cohorte" filas={v.lee.crm.etapas.map((e, i) => ({ nombre: ['Leads', 'Contactados', 'Con cita', 'Fueron a la clase', 'Se inscribieron'][i], valor: e.valor }))} />
                </Bloque>
              : <Bloque universo="crm" ancho="dos-tercios" titulo="Del lead a la inscripción" estado={sinDato(v.lee.crm.estado)} />}
            {v.lee.crm.estado === 'ok' && <Bloque universo="crm" ancho="tercio" alcance="Misma cohorte" titulo="De cada 100 leads">
              <Reticula etiqueta="Destino de cada 100 leads de la cohorte" partes={v.lee.crm.exclusivas.map((e) => ({ nombre: e.nombre }))} cuadros={v.lee.crm.exclusivas.map((e) => e.de100)} />
            </Bloque>}
            <Bloque universo="crm" ancho="mitad" {...L.crmAtencion(v)}>
              <Histograma etiqueta="Tiempo al primer contacto" formato={(n) => `${numero(n)} leads`}
                barras={v.lee.crmDetalle.atencion.tramos.map((t) => ({ nombre: t.nombre, corto: t.nombre.replace('menos de ', '< ').replace('más de ', '> '), valor: t.valor }))} resaltar={[0]} />
              <p className="q-nota-bloque">Mitad de los leads con {numero(v.lee.crmDetalle.atencion.medianaIntentos)} {v.lee.crmDetalle.atencion.medianaIntentos === 1 ? 'intento' : 'intentos'} de contacto o menos. {numero(v.lee.crmDetalle.atencion.sinRegistro)} contactos sin registro de hora.</p>
            </Bloque>
            <Bloque universo="crm" ancho="mitad" {...L.crmDescarte(v)}>
              <Barras etiqueta="Motivos de descarte" filas={v.lee.crmDetalle.descarte.motivos.map((m) => ({ nombre: m.nombre, valor: m.valor }))} />
            </Bloque>
            <Bloque universo="crm" titulo="Campañas del CRM" lectura={v.lee.crmDetalle.campanas.length ? 'Las campañas que se cruzan con el período, con lo que el CRM les atribuye desde que empezaron.' : 'Ninguna campaña del CRM se cruza con este período.'}
              pie={<span>Valor estimado: inscripciones por el ticket de entrada (matrícula y primer mes). No se compara con la inversión, que mide otra cosa.</span>}>
              {v.lee.crmDetalle.campanas.length > 0 && <Tabla etiqueta="Campañas del CRM" numericas={[2, 3, 4]}
                columnas={['Campaña', 'Vigencia', 'Leads', 'Inscripciones', 'Valor estimado']}
                filas={v.lee.crmDetalle.campanas.map((k) => [k.nombre + (k.enCurso ? ' (en curso)' : ''), rangoFechas(k.desde, k.hasta), numero(k.leads), numero(k.altas), soles(k.valor)])} />}
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.3 Búsquedas ───── */}
        <SeccionDe def={s13} vista={v}>
          {v.lee.busquedas.estado !== 'ok' ? <Bloque titulo="Búsquedas" universo="busquedas" estado={sinDato(v.lee.busquedas.estado)} /> : <>
            <Bloque universo="busquedas" {...L.busquedasLectura(v)} ayuda={<p>Google Trends da un índice relativo de 0 a 100 (100 es la semana con más búsquedas del conjunto), no cantidad de búsquedas. Una semana pertenece al mes de su jueves.</p>}>
              <Linea serie={v.lee.busquedas.serie} previa={v.lee.busquedas.seriePrevia} rotuloX="semana" etiqueta="Interés semanal por «gimnasio», con el año anterior en gris" />
            </Bloque>
            <Bloque universo="busquedas" {...L.palabrasBusqueda(v)} pie={<span>Google informa solo las regiones donde más se busca cada palabra; la primera vale 100.</span>}>
              <Tabla etiqueta="Palabras que se siguen" numericas={[1, 2]}
                columnas={['Palabra', 'Interés, de 0 a 100', 'En 3 meses', 'Dónde se busca más']}
                filas={v.lee.busquedas.palabras.map((p) => [p.termino, numero(p.actual), p.sinBase ? (p.subiendo ? 'sin base · subiendo' : 'sin base') : variacion(p.cambio3m), p.regiones.slice(0, 3).map((r) => `${r.region} ${r.indice}`).join(' · ')])} />
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.4 Redes ───── */}
        <SeccionDe def={s14} vista={v}>
          {v.lee.redes.estado !== 'ok' ? <Bloque titulo="Redes" universo="conversacion" estado={sinDato(v.lee.redes.estado)} /> : <>
            <Bloque universo="conversacion" ancho="mitad" {...L.redesTiktok(v)} pie={<span>Lectura de {mesTexto(v.lee.redes.mes)} · interacción sobre vistas.</span>}>
              <Tabla etiqueta="Hashtags de TikTok" numericas={[1, 2, 3]}
                columnas={['Hashtag', 'Interacción', 'Vistas', 'Publicaciones']}
                filas={v.lee.redes.hashtags.map((h) => [h.tag, porcentaje(h.interaccion * 100, 1), compacto(h.vistas), numero(h.publicaciones)])} />
            </Bloque>
            <Bloque universo="conversacion" ancho="mitad" {...L.redesTemas(v)}
              ayuda={<p>Tono: menciones positivas menos negativas, sobre el total del tema, de −100 a 100. Solo se lee para Reset Fit. El punto hueco es {comparacionTexto(v.periodo)}.</p>}>
              <Pesas etiqueta="Tono de cada tema" min={-100} max={100} rotuloA={comparacionTexto(v.periodo)} rotuloB={periodoTexto(v.periodo)}
                formato={(n) => (n == null ? NO_MEDIDO : numero(n))}
                filas={v.lee.redes.temas.map((t) => ({ nombre: `${t.nombre} (${numero(t.menciones)})`, a: t.tonoPrevio == null ? null : Math.round(t.tonoPrevio * 100), b: t.tono == null ? null : Math.round(t.tono * 100) }))} />
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.5 Competencia ───── */}
        <SeccionDe def={s15} vista={v}>
          {v.lee.competencia.estado !== 'ok' ? <Bloque titulo="Competencia" universo="conversacion" estado={sinDato(v.lee.competencia.estado)} /> : <>
            <Bloque universo="conversacion" ancho="mitad" {...L.competenciaLectura(v)}
              pie={<span>Marcas reales con cifras de muestra: no describen su desempeño real. Sin tono ni juicios.</span>}>
              <Barras etiqueta="Interacción por publicación de cada marca" resaltar="Reset Fit" rotuloPrevio={comparacionTexto(v.periodo)}
                filas={v.lee.competencia.marcas.map((m) => ({ nombre: m.nombre, valor: Math.round(m.porPublicacion), previo: m.porPublicacionPrevia == null ? null : Math.round(m.porPublicacionPrevia) }))} />
              <Tabla etiqueta="Actividad de cada marca" numericas={[1, 2]}
                columnas={['Marca', 'Publicaciones', 'Anuncios activos', ...v.lee.competencia.formatos]}
                filas={v.lee.competencia.marcas.map((m) => [m.nombre, numero(m.publicaciones), numero(m.anuncios), ...m.formatos.map((n) => numero(n))])} />
            </Bloque>
            <Bloque universo="conversacion" ancho="mitad" {...L.competenciaConversacion(v)}>
              {v.lee.competencia.conversacion.estado === 'ok' && (() => {
                const ms = v.lee.competencia.conversacion.meses;
                const a = ms[0], b = ms.at(-1);
                return <Pesas etiqueta="Participación en la conversación, hace un año y ahora" rotuloA={mesTexto(a.mes)} rotuloB={mesTexto(b.mes)} max={50}
                  formato={(n) => porcentaje(n)} filas={[...b.marcas].sort((p, q) => q.pct - p.pct).map((x) => ({ nombre: x.nombre, a: a.marcas.find((y) => y.id === x.id).pct, b: x.pct }))} />;
              })()}
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.6 Sitio web ───── */}
        <SeccionDe def={s16} vista={v}>
          {v.lee.web.estado !== 'ok' ? <Bloque titulo="Sitio web" universo="web" estado={sinDato(v.lee.web.estado)} /> : <>
            <Bloque universo="web" {...L.webLectura(v)} pie={<span>Las solicitudes desde pauta ({numero(v.lee.web.desdePauta)}) ya están en los leads de 1.1: no se suman.</span>}>
              <div className="q-cifras">
                <Cifra valor={compacto(v.lee.web.sesiones)} rotulo="sesiones" delta={delta(v.lee.web.sesionesCambio, 'sube', v)} />
                <Cifra valor={numero(v.lee.web.solicitudes)} rotulo="solicitudes de clase de prueba" tamano="media" />
                <Cifra valor={porcentaje(v.lee.web.tasaInteraccion * 100)} rotulo="sesiones con interacción" tamano="media" />
              </div>
              <Linea serie={v.lee.web.serie} previa={v.lee.web.seriePrevia} formato={compacto} etiqueta="Sesiones por día, con la comparación en gris" />
            </Bloque>
            <Bloque universo="web" ancho="mitad" {...L.webFuentes(v)} pie={<span>Las fuentes con pauta traen sesiones de anuncios; sus solicitudes ya cuentan como leads en 1.1.</span>}>
              <Franja etiqueta="Sesiones por fuente" formato={(p) => porcentaje(p)}
                partes={[...v.lee.web.fuentes].sort((a, b) => b.sesiones - a.sesiones).map((f, i) => ({ nombre: f.nombre, valor: f.sesiones, pct: f.pct, clase: i < 5 ? `q-p${i}` : 'q-p5' }))} />
              <Tabla etiqueta="Sesiones y solicitudes por fuente" numericas={[1, 2, 3]}
                columnas={['Fuente', 'Sesiones', 'Solicitudes', 'Por cada 100 sesiones']}
                filas={[...v.lee.web.fuentes].sort((a, b) => b.sesiones - a.sesiones).map((f) => [f.nombre, compacto(f.sesiones), numero(f.solicitudes), numero((f.solicitudes / f.sesiones) * 100, 1)])} />
            </Bloque>
            <Bloque universo="web" ancho="mitad" {...L.webPaginas(v)}>
              <Tabla etiqueta="Páginas del sitio" numericas={[1, 2, 3]}
                columnas={['Página', 'Sesiones', 'Solicitudes', 'Por cada 100 sesiones']}
                filas={v.lee.web.paginas.map((p) => [p.ruta, compacto(p.sesiones), numero(p.solicitudes), numero(p.tasa * 100, 1)])} />
            </Bloque>
            <Bloque universo="web" {...L.webHoras(v)}>
              <div className="q-dos-columnas">
                <Histograma etiqueta="Sesiones por hora del día" formato={compacto}
                  barras={v.lee.web.porHora.map((n, h) => ({ nombre: `${h} h`, corto: String(h), valor: n }))} resaltar={v.lee.web.horasPico} />
                <Histograma etiqueta="Sesiones promedio por día de la semana" formato={(n) => numero(n)}
                  barras={v.lee.web.porDiaSemana.map((n, i) => ({ nombre: diaSemanaLargo(i), corto: diaSemanaLargo(i).slice(0, 3), valor: n == null ? 0 : Math.round(n) }))} />
              </div>
            </Bloque>
          </>}
        </SeccionDe>
      </div>
    </>
  );
}
