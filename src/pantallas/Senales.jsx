// Capa 1 · Captura de señales: qué pasa afuera. Búsquedas, lo que se publica en el rubro y quién entra al sitio.
// No calcula: pinta la vista y las lecturas de src/textos.
import { Bloque, Cifra, Tabla, Resumen } from '../sistema/Componentes.jsx';
import { Linea, Barras, Franja } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, compacto, variacion } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato, deltaCorto, partesConResto } from './comun.jsx';
import { periodoTexto, comparacionTexto, mesTexto } from '../textos/comun.js';
import * as L from '../textos/lee.js';
import { bandaTexto } from '../textos/capas.js';

export default function Senales({ capa, vista: v }) {
  const [s11, s12] = capa.secciones;
  const b = v.lee.busquedas, r = v.lee.redes, w = v.lee.web, ix = v.sugiere.indice;
  const ok = (x) => x.estado === 'ok';
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(v.periodo)}`}
        pie={<span>Cada variación compara {periodoTexto(v.periodo)} con {comparacionTexto(v.periodo)}. Búsquedas, redes y sitio cuentan cosas distintas: se leen lado a lado, no se suman.</span>}
        items={[
          { rotulo: 'Índice de oportunidad', universo: 'modelo', ir: 's-2-1', irTexto: 'Lo que lee el modelo', valor: ix.valor == null ? null : `${numero(Math.round(ix.valor))}`, nota: ix.valor == null ? null : `de 100 · ${bandaTexto(ix.banda).toLowerCase()}` },
          { rotulo: 'Interés por «gimnasio»', universo: 'busquedas', ir: s11.id, irTexto: 'Búsquedas', valor: ok(b) ? numero(Math.round(b.demanda)) : null, delta: ok(b) ? deltaCorto(b.cambio, 'sube', v) : null },
          { rotulo: 'Usuarios activos al día', universo: 'web', ir: s12.id, irTexto: 'Sitio web', valor: ok(w) ? numero(Math.round(w.usuariosPorDia)) : null, delta: ok(w) ? deltaCorto(w.cambioUsuarios, 'sube', v) : null },
          { rotulo: 'Sesiones con interacción', universo: 'web', ir: s12.id, irTexto: 'Sitio web', valor: ok(w) ? porcentaje(w.tasaInteraccion * 100) : null, nota: ok(w) && w.tasaInteraccionPrevia ? `${porcentaje(w.tasaInteraccionPrevia * 100)} en ${comparacionTexto(v.periodo)}` : null },
        ]} />

      {/* ───── 1.1 Qué se busca y qué se publica ───── */}
      <SeccionDe def={s11} vista={v}>
        {!ok(b) ? <Bloque titulo="Búsquedas" universo="busquedas" estado={sinDato(b.estado)} /> : <>
          <Bloque universo="busquedas" {...L.busquedasLectura(v)} ventana="últimas 52 semanas"
            ayuda={<p>Google Trends da un índice relativo de 0 a 100 (100 es la semana con más búsquedas del conjunto), no cantidad de búsquedas. Una semana pertenece al mes de su jueves.</p>}>
            <Linea serie={b.serie} previa={b.seriePrevia} rotuloX="semana" etiqueta="Interés semanal por «gimnasio», con el año anterior en gris" />
          </Bloque>
          <Bloque universo="busquedas" {...L.palabrasBusqueda(v)} alcance="últimos tres meses" pie={<span>Google informa solo las regiones donde más se busca cada palabra; la primera vale 100.</span>}>
            <Tabla etiqueta="Palabras que se siguen" numericas={[1, 2]} barra={{ columna: 1, valores: b.palabras.map((p) => p.actual) }}
              columnas={['Palabra', 'Interés, de 0 a 100', 'En 3 meses', 'Dónde se busca más']}
              destacada={b.palabras.findIndex((p) => p.propia)}
              filas={b.palabras.map((p) => [p.termino, numero(p.actual), p.sinBase ? (p.subiendo ? 'sin base · subiendo' : 'sin base') : { texto: variacion(p.cambio3m), tono: p.cambio3m >= 20 ? 'mejora' : null }, p.regiones.slice(0, 3).map((x) => `${x.region} ${x.indice}`).join(' · ')])} />
          </Bloque>
        </>}
        {!ok(r) ? <Bloque titulo="TikTok" universo="conversacion" estado={sinDato(r.estado)} /> : (
          <Bloque universo="conversacion" {...L.redesTiktok(v)} alcance={`lectura de ${mesTexto(r.mes)}`} pie={<span>Interacción: reacciones, comentarios y compartidos sobre las vistas.</span>}>
            <Tabla etiqueta="Hashtags de TikTok" numericas={[1, 2, 3]} barra={{ columna: 1, valores: r.hashtags.map((h) => h.interaccion) }}
              destacada={r.hashtags.findIndex((h) => h.propia)}
              columnas={['Hashtag', 'Interacción', 'Vistas', 'Publicaciones']}
              filas={r.hashtags.map((h) => [h.tag, porcentaje(h.interaccion * 100, 1), compacto(h.vistas), numero(h.publicaciones)])} />
          </Bloque>
        )}
      </SeccionDe>

      {/* ───── 1.2 Quién entra al sitio: tráfico de GA4, sin leads ───── */}
      <SeccionDe def={s12} vista={v}>
        {!ok(w) ? <Bloque titulo="Sitio web" universo="web" estado={sinDato(w.estado)} /> : <>
          <Bloque universo="web" {...L.webLectura(v)}
            ayuda={<p>Usuarios activos: personas distintas con al menos una sesión en el día, según GA4. Sesión con interacción: dura más de 10 segundos, ve dos páginas o más, o completa un evento clave. GA4 mide tráfico; los leads del sitio están en el CRM.</p>}
            pie={<span>Promedio de usuarios activos al día · GA4</span>}>
            <div className="q-cifras">
              <Cifra valor={compacto(w.sesiones)} rotulo="sesiones en el mes" tamano="chica" />
              <Cifra valor={porcentaje(w.tasaInteraccion * 100)} rotulo="sesiones con interacción" tamano="chica" />
              <Cifra valor={`${numero(Math.floor(w.segundosMedios / 60))} min ${numero(Math.round(w.segundosMedios % 60))} s`} rotulo="de interacción por sesión" tamano="chica" />
              <Cifra valor={porcentaje(w.movil * 100)} rotulo="desde el celular" tamano="chica" />
            </div>
            <Linea serie={w.serie} previa={w.seriePrevia} formato={compacto} etiqueta="Usuarios activos por día, con la comparación en gris" />
          </Bloque>
          <Bloque universo="web" ancho="mitad" {...L.webCanales(v)}
            pie={<span>Canal predeterminado de GA4. «Interacción»: sesiones con interacción de cada 100.</span>}>
            <Franja verTabla={false} etiqueta="Sesiones por canal" formato={(p) => porcentaje(p)}
              partes={partesConResto(w.canales.map((c) => ({ nombre: c.nombre, valor: c.sesiones, pct: c.pct })), 'Otros canales')} />
            <Tabla etiqueta="Sesiones e interacción por canal" numericas={[1, 2, 3]}
              columnas={['Canal', 'Sesiones', 'Interacción', 'Tiempo por sesión']}
              filas={w.canales.map((c) => [c.nombre, compacto(c.sesiones), numero(Math.round(c.tasa * 100)), `${numero(Math.round(c.segundos))} s`])} />
          </Bloque>
          <Bloque universo="web" ancho="mitad" {...L.webPaginas(v)}>
            <Barras etiqueta="Vistas de cada página" formato={compacto} resaltar={w.paginas.find((p) => p.desde)?.ruta}
              filas={w.paginas.map((p) => ({ nombre: p.ruta, valor: p.vistas, nota: `${numero(p.pct)} de 100` }))} />
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
