// Capa 1 · Lee: lo que dice cada fuente, por separado. No calcula: pinta la vista y las lecturas de src/textos.
import { Bloque, Cifra, Tabla, Resumen } from '../sistema/Componentes.jsx';
import { useState } from 'react';
import { Linea, Multiplos, Bala, Barras, Etapas, Reticula, Pesas, Franja, Histograma, Dispersion } from '../sistema/graficos/Graficos.jsx';
import { numero, dolares, porcentaje, compacto, variacion, rangoFechas, fecha, diaSemanaLargo, mesCorto, NO_MEDIDO } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe } from './comun.jsx';
import { periodoTexto, comparacionTexto, mesTexto } from '../textos/comun.js';
import * as L from '../textos/lee.js';

const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : estado === 'fuera' ? 'fuera' : 'sin-datos', reemplaza: true });
const delta = (cambio, mejorSi, v) => ({ cambio, mejorSi, referencia: `contra ${comparacionTexto(v.periodo)}`, motivo: 'sin comparación' });
// En el resumen la referencia va corta para que cada cifra quede en una línea: «contra set 2025»
const deltaCorto = (cambio, mejorSi, v) => ({ ...delta(cambio, mejorSi, v), referencia: `contra ${mesCorto(+v.periodo.compararDesde.slice(5, 7))} ${v.periodo.compararDesde.slice(0, 4)}` });

// Partes de un todo: tres con color (orden validado para daltonismo) y el resto juntas en un solo gris.
// La tabla de al lado lista todas; la franja no repite grises que no se distinguen.
const partesConResto = (partes, nombreResto) => {
  const resto = partes.slice(3);
  const pctResto = resto.every((p) => p.pct != null) ? resto.reduce((t, p) => t + p.pct, 0) : null;
  return [
    ...partes.slice(0, 3).map((p, i) => ({ ...p, clase: `q-p${i}` })),
    ...(resto.length ? [{ nombre: nombreResto, valor: resto.reduce((t, p) => t + p.valor, 0), pct: pctResto, clase: 'q-p5', nota: resto.map((p) => p.nombre.toLowerCase()).join(', ') }] : []),
  ];
};

// Competencia: dispersión de interacción y tono; al elegir un punto, su ficha al lado. Arranca en la marca propia.
function Competencia({ marcas }) {
  const [elegida, setElegida] = useState(() => marcas.find((m) => m.propia)?.id);
  const m = marcas.find((x) => x.id === elegida) || marcas[0];
  return (
    <div className="q-competencia">
      <div>
        <Dispersion etiqueta="Interacción y tono del texto de cada marca" rotuloX="Interacción en el mes" rotuloY="Tono del texto, de 0 a 100"
          formatoX={compacto} notas={{ neutro: 'neutro', arriba: 'tono positivo', abajo: 'tono negativo' }}
          puntos={marcas.map((x) => ({ id: x.id, nombre: x.nombre, propia: x.propia, x: x.interacciones, y: x.tono }))}
          elegido={m.id} onElegir={setElegida} />
        <p className="q-nota-bloque">Elige un punto para ver el detalle de cada marca.</p>
      </div>
      <aside className="q-ficha" aria-live="polite" aria-label={`Detalle de ${m.nombre}`}>
        <h4>{m.nombre}</h4>
        <dl>
          <div><dt>Interacción</dt><dd><b>{compacto(m.interacciones)}</b> en {numero(m.publicaciones)} {m.publicaciones === 1 ? 'publicación' : 'publicaciones'}</dd></div>
          <div><dt>Tono del texto</dt><dd><b>{numero(m.tono)}</b> de 100 · 50 es neutro</dd></div>
          <div><dt>Anuncios activos</dt><dd><b>{numero(m.anuncios)}</b> {m.anuncios ? `· ${m.formatos.map((n, i) => `${numero(n)} ${['en imagen', 'en video', 'en carrusel'][i]}`).filter((t) => !t.startsWith('0 ')).join(', ')}` : ''}</dd></div>
          <div><dt>Palabras que más repite</dt><dd><ul className="q-palabras">{m.palabras.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>
        </dl>
      </aside>
    </div>
  );
}

export default function Lee({ capa, vista: v }) {
  const [s11, s12, s13, s14, s15, s16] = capa.secciones;
  const pa = v.lee.pauta;
  const cr = v.lee.crmDetalle, w = v.lee.web;
  const ok = (x) => x.estado === 'ok';
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(v.periodo)}`}
        pie={<span>Cada variación compara los días medidos de {periodoTexto(v.periodo)} con los mismos días de {comparacionTexto(v.periodo)}. Pauta, CRM y sitio cuentan cosas distintas: se leen lado a lado, no se suman.</span>}
        items={[
          { rotulo: 'Leads de las plataformas', universo: 'pauta', ir: s11.id, irTexto: s11.titulo, valor: ok(pa) ? numero(pa.leads) : null, delta: ok(pa) ? deltaCorto(pa.cambio, 'sube', v) : null, dataClave: 'pauta-leads' },
          { rotulo: 'Inversión en pauta', universo: 'pauta', ir: s11.id, irTexto: s11.titulo, valor: ok(pa) ? dolares(pa.inversion) : null, nota: `en ${numero(v.lee.plataformas.plataformas.length)} plataformas` },
          { rotulo: 'Costo por lead', universo: 'pauta', ir: s11.id, irTexto: s11.titulo, valor: ok(pa) ? dolares(pa.cpl, 2) : null, delta: ok(pa) ? deltaCorto(pa.cambioCpl, 'baja', v) : null },
          { rotulo: 'Leads en el CRM', universo: 'crm', ir: s12.id, irTexto: s12.titulo, valor: ok(cr) ? numero(cr.total) : null, delta: ok(cr) ? deltaCorto(cr.cambio, 'sube', v) : null, dataClave: 'crm-total' },
          { rotulo: 'Sesiones del sitio', universo: 'web', ir: s16.id, irTexto: s16.titulo, valor: ok(w) ? compacto(w.sesiones) : null, delta: ok(w) ? deltaCorto(w.sesionesCambio, 'sube', v) : null },
        ]} />
      {/* ───── 1.1 Pauta pagada ───── */}
        <SeccionDe def={s11} vista={v}>
          {pa.estado !== 'ok' ? <Bloque titulo="Pauta pagada" universo="pauta" estado={sinDato(pa.estado)} /> : <>
            <Bloque universo="pauta" {...L.pautaResumen(v)}
              ayuda={<p>Leads, inversión y costo por lead como los reporta cada plataforma. Un día en que alguna plataforma no entregó datos no se cuenta en el total, y la comparación se hace por día medido.</p>}
              pie={<><span>{rangoFechas(v.periodo.desde, v.periodo.hasta)}</span>{pa.diasParciales.length > 0 && <span>{numero(pa.diasParciales.length)} {pa.diasParciales.length === 1 ? 'día' : 'días'} con una plataforma sin dato: {pa.diasParciales.map(fecha).join(', ')}</span>}</>}>
              <Linea serie={pa.serie} previa={pa.seriePrevia} eventos={pa.eventos} etiqueta="Leads reportados por día, con el mismo tramo de la comparación en gris" />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" {...L.plataformasLectura(v)}
              ayuda={<p>Costo por lead de cada plataforma contra su objetivo. El objetivo de Google Ads combina el de Search y el de Display según lo que invirtió cada uno. La zona gris llega hasta el objetivo; la raya vertical es el objetivo.</p>}>
              <Bala max={Math.ceil(Math.max(...v.lee.plataformas.plataformas.map((p) => Math.max(p.cpl ?? 0, p.objetivo) * 1.25)) / 5) * 5} formato={(n) => dolares(n, 2)} formatoEje={(n) => dolares(n)}
                etiqueta="Costo por lead de cada plataforma contra su objetivo"
                filas={v.lee.plataformas.plataformas.map((p) => ({
                  nombre: p.nombre, valor: p.cpl, marca: p.objetivo,
                  bandas: [{ hasta: p.objetivo }],
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
                filas={v.lee.plataformas.plataformas.flatMap((p) => p.campanas.map((c) => [c.nombre, p.nombre, c.producto === 'marca' ? 'Marca' : 'Membresías', dolares(c.inversion), numero(c.clics), numero(c.leads), c.leads ? dolares(c.cpl, 2) : 'sin leads']))} />
            </Bloque>
            <Bloque universo="pauta" ancho="mitad" {...L.palabrasLectura(v)}>
              <Tabla etiqueta="Palabras clave con más gasto" numericas={[1, 2, 3, 4]}
                columnas={['Palabra clave', 'Gasto', 'Clics', 'Leads', 'Costo por clic']}
                filas={v.lee.plataformas.palabras.nombradas.map((k) => [k.texto, dolares(k.inversion), numero(k.clics), numero(k.leads), dolares(k.cpc, 2)])} />
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
                filas={v.lee.plataformas.programatica.formatos.map((f) => [f.nombre, f.compra, f.audiencia, numero(f.impresiones), numero(f.clics), porcentaje(f.ctr * 100, 2), dolares(f.consumo)])} />
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.2 CRM ───── */}
        <SeccionDe def={s12} vista={v}>
          {v.lee.crmDetalle.estado !== 'ok' ? <Bloque titulo="CRM" universo="crm" estado={sinDato(v.lee.crmDetalle.estado)} /> : <>
            <Bloque universo="crm" {...L.crmPorDia(v)} pie={<span>Incluye los leads de pauta que llegaron aunque la plataforma no los reportara.</span>}>
              <Linea serie={v.lee.crmDetalle.serie} previa={v.lee.crmDetalle.seriePrevia} etiqueta="Leads del CRM por día, con el mismo tramo de la comparación en gris" />
              {v.lee.crm.periodo && <p className="q-nota-bloque">{numero(v.lee.crm.periodo.deSitio)} de estos leads llegaron por el sitio, sin pauta.</p>}
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
              ? <Bloque universo="crm" alcance={`Cohorte de ${mesTexto(v.lee.crm.cohorteDesde.slice(0, 7))}${v.lee.crm.cerrada ? '' : ' · abierta'}`} {...L.crmCohorte(v)}
                  estado={v.lee.crm.cerrada ? null : { tipo: 'abierta', texto: 'Algunas inscripciones de esta cohorte todavía no ocurren: las tasas pueden subir.' }}>
                  <div className="q-dos-columnas q-cohorte">
                    <Etapas etiqueta="Etapas de la cohorte" filas={v.lee.crm.etapas.map((e, i) => ({ nombre: ['Leads', 'Contactados', 'Con cita', 'Fueron a la clase', 'Se inscribieron'][i], valor: e.valor }))} />
                    <Reticula etiqueta="Destino de cada 100 leads de la cohorte" partes={v.lee.crm.exclusivas.map((e) => ({ nombre: e.nombre }))} cuadros={v.lee.crm.exclusivas.map((e) => e.de100)} />
                  </div>
                </Bloque>
              : <Bloque universo="crm" titulo="Del lead a la inscripción" estado={sinDato(v.lee.crm.estado)} />}
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
                filas={v.lee.crmDetalle.campanas.map((k) => [k.nombre + (k.enCurso ? ' (en curso)' : ''), rangoFechas(k.desde, k.hasta), numero(k.leads), numero(k.altas), dolares(k.valor)])} />}
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
              ayuda={<p>Tono: menciones positivas menos negativas, sobre el total del tema, de −100 a 100. Solo se lee para Fit Lab. El punto hueco es {comparacionTexto(v.periodo)}.</p>}>
              <Pesas etiqueta="Tono de cada tema" min={-100} max={100} rotuloA={comparacionTexto(v.periodo)} rotuloB={periodoTexto(v.periodo)}
                formato={(n) => (n == null ? NO_MEDIDO : numero(n))}
                filas={v.lee.redes.temas.map((t) => ({ nombre: `${t.nombre} (${numero(t.menciones)})`, a: t.tonoPrevio == null ? null : Math.round(t.tonoPrevio * 100), b: t.tono == null ? null : Math.round(t.tono * 100) }))} />
            </Bloque>
          </>}
        </SeccionDe>

{/* ───── 1.5 Competencia: lectura del mes, sin comparación (en producción no hay historia de la competencia) ───── */}
        <SeccionDe def={s15} vista={v}>
          {v.lee.competencia.estado !== 'ok' ? <Bloque titulo="Competencia" universo="conversacion" estado={sinDato(v.lee.competencia.estado)} /> : <>
            <Bloque universo="conversacion" {...L.competenciaLectura(v)}
              ayuda={<><p>Interacción: reacciones, comentarios y compartidos de las publicaciones del mes. Tono del texto: qué tan positivo es lo que cada marca escribe en sus publicaciones, de 0 a 100; 50 es neutro. No mide lo que la gente dice de la marca: eso está en Redes.</p><p>No se compara con otro período: de la competencia solo se lee lo que está publicado.</p></>}
              pie={<><span>Publicaciones de {periodoTexto(v.periodo)} · anuncios activos al {fecha(v.periodo.hasta)}</span><span>Facebook y biblioteca de anuncios de Meta · marcas reales con cifras de muestra: no describen su desempeño real</span></>}>
              <Competencia marcas={v.lee.competencia.marcas} />
            </Bloque>
            <Bloque universo="conversacion" {...L.competenciaAnuncios(v)}
              pie={<span>Anuncios activos el último día del período, por formato.</span>}>
              <Tabla etiqueta="Publicaciones y anuncios activos de cada marca" numericas={[1, 2, 3, 4, 5, 6]}
                columnas={['Marca', 'Publicaciones', 'Interacción por publicación', 'Anuncios activos', ...v.lee.competencia.formatos]}
                filas={[...v.lee.competencia.marcas].sort((a, b) => b.anuncios - a.anuncios).map((m) => [m.nombre, numero(m.publicaciones), numero(m.porPublicacion), numero(m.anuncios), ...m.formatos.map((n) => numero(n))])} />
            </Bloque>
          </>}
        </SeccionDe>

        {/* ───── 1.6 Sitio web ───── */}
        <SeccionDe def={s16} vista={v}>
          {v.lee.web.estado !== 'ok' ? <Bloque titulo="Sitio web" universo="web" estado={sinDato(v.lee.web.estado)} /> : <>
            <Bloque universo="web" {...L.webLectura(v)} pie={<span>Las solicitudes desde pauta ({numero(v.lee.web.desdePauta)}) ya están en los leads de Pauta pagada: no se suman.</span>}>
              <div className="q-cifras">
                <Cifra valor={numero(v.lee.web.solicitudes)} rotulo="solicitudes de clase de prueba" tamano="chica" />
                <Cifra valor={porcentaje(v.lee.web.tasaInteraccion * 100)} rotulo="sesiones con interacción" tamano="chica" />
              </div>
              <Linea serie={v.lee.web.serie} previa={v.lee.web.seriePrevia} formato={compacto} etiqueta="Sesiones por día, con la comparación en gris" />
            </Bloque>
            <Bloque universo="web" ancho="mitad" {...L.webFuentes(v)} pie={<span>Las fuentes con pauta traen sesiones de anuncios; sus solicitudes ya cuentan como leads en Pauta pagada.</span>}>
              <Franja etiqueta="Sesiones por fuente" formato={(p) => porcentaje(p)}
                partes={partesConResto([...v.lee.web.fuentes].sort((a, b) => b.sesiones - a.sesiones).map((f) => ({ nombre: f.nombre, valor: f.sesiones, pct: f.pct })), 'Otras fuentes')} />
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
    </MarcoCapa>
  );
}
