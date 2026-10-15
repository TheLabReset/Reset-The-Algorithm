// Piezas comunes de las pantallas: marco de capa (índice al costado), cabecera con fuentes y capítulos.
import { useState } from 'react';
import { IndiceCapa, Seccion, FuentesCapa, AvisosCapitulo, VentanaContexto, PanelLateral, Monitoreo, BotonMonitoreo } from '../sistema/Componentes.jsx';
import { Histograma, Barras, Dispersion } from '../sistema/graficos/Graficos.jsx';
import { diaSemanaLargo, compacto, mesCorto } from '../sistema/formato.js';
import { comparacionTexto, tramoFechas } from '../textos/comun.js';
import { alerta, bien } from '../textos/sugiere.js';
import { seccionPorNumero } from '../capas/estructura.js';
import { fechaCorta, numero } from '../sistema/formato.js';

// Chips de fuentes: estado y fecha de corte, o los días sin dato del período
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'no-cargo' ? 'no cargó' : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Alertas y señales buenas ya escritas, con su ancla («a-…» o «b-…») y el capítulo que las sostiene
const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const destino = (numero) => { const s = seccionPorNumero(numero); return s ? { ir: s.id, irTexto: s.titulo } : {}; };
export function alertasDe(vista) {
  return (vista.sugiere.queMirar || []).map((a) => { const t = alerta(a); return t && { ...t, id: `a-${a.id}-${slug(a.fuente)}`, ...destino(a.sostiene) }; }).filter(Boolean);
}
export function buenasDe(vista) {
  return (vista.sugiere.queVaBien || []).map((b) => { const t = bien(b); return t && { ...t, nivel: 'bien', id: `b-${b.id}-${slug(b.fuente)}`, ...destino(b.sostiene) }; }).filter(Boolean);
}

// Estado de una tarjeta cuando su fuente no trae el dato
export const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : estado === 'fuera' ? 'fuera' : 'sin-datos', reemplaza: true });
export const delta = (cambio, mejorSi, v) => ({ cambio, mejorSi, referencia: `contra ${comparacionTexto(v.periodo)}`, motivo: 'sin comparación' });
// En el resumen la referencia va corta para que cada cifra quede en una línea: «contra set 2025»
export const deltaCorto = (cambio, mejorSi, v) => ({ ...delta(cambio, mejorSi, v), referencia: `contra ${mesCorto(+v.periodo.compararDesde.slice(5, 7))} ${v.periodo.compararDesde.slice(0, 4)}` });

// Partes de un todo: tres con color (orden validado para daltonismo) y el resto juntas en un solo gris.
// La tabla de al lado lista todas; la franja no repite grises que no se distinguen.
export const partesConResto = (partes, nombreResto) => {
  const resto = partes.slice(3);
  const pctResto = resto.every((p) => p.pct != null) ? resto.reduce((t, p) => t + p.pct, 0) : null;
  return [
    ...partes.slice(0, 3).map((p, i) => ({ ...p, clase: `q-p${i}` })),
    ...(resto.length ? [{ nombre: nombreResto, valor: resto.reduce((t, p) => t + p.valor, 0), pct: pctResto, clase: 'q-p5', nota: resto.map((p) => p.nombre.toLowerCase()).join(', ') }] : []),
  ];
};

// Marco de una capa: índice fijo al costado y, al centro, cabecera, resumen y capítulos.
// Da a cada tarjeta la ventana del período («1 al 30 de setiembre»), que la tarjeta muestra arriba a la derecha.
export function MarcoCapa({ capa, vista, bajada, conResumen = true, children }) {
  const ids = [...new Set(capa.secciones.flatMap((s) => s.fuentes))];
  const ventana = tramoFechas(vista.periodo.desde, vista.periodo.hasta).replace(/^del /, '');
  const [monitoreo, setMonitoreo] = useState(false);
  return (
    <VentanaContexto.Provider value={ventana}>
    <div className="q-envoltura q-capa-marco">
      <IndiceCapa secciones={capa.secciones} etiqueta={`Capítulos de ${capa.nombre}`} conResumen={conResumen} />
      <div className="q-capa">
        <header className="q-capa-cab">
          <h1>{capa.titulo}</h1>
          <p>{bajada || capa.bajada}</p>
          <div className="q-capa-fuentes">
            {ids.length > 0 && <FuentesCapa fuentes={fuentesDe(ids, vista)} />}
            <BotonMonitoreo onClick={() => setMonitoreo(true)} />
          </div>
          <PanelLateral titulo="Qué se monitorea" bajada="Lo que sigue cada fuente. Es configuración, no medición: se cambia a pedido de Fit Lab." abierto={monitoreo} onCerrar={() => setMonitoreo(false)}>
            <Monitoreo grupos={vista.monitoreo} />
          </PanelLateral>
        </header>
        {children}
      </div>
    </div>
    </VentanaContexto.Provider>
  );
}

// Capítulo con sus avisos de fuente ya resueltos desde la estructura de capas
export function SeccionDe({ def, vista, conAvisos = true, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} fuentes={fuentesDe(def.fuentes, vista)}
      avisos={conAvisos ? <AvisosCapitulo avisos={[...alertasDe(vista), ...buenasDe(vista)].filter((a) => a.ir === def.id)} /> : null}>
      {children}
    </Seccion>
  );
}

// Cuándo: promedio por hora del día (las cuatro más altas resaltadas) y por día de la semana, lado a lado
export function HorasYDias({ porHora, horasAltas, porDiaSemana, diaMayor, formato, que }) {
  const dias = porDiaSemana.map((valor, i) => ({ nombre: diaSemanaLargo(i), valor: valor == null ? null : Math.round(valor) }));
  return (
    <div className="q-horas">
      <div>
        <h4>Por hora del día</h4>
        <Histograma etiqueta={`${que} en promedio en cada hora del día`} formato={formato} resaltar={horasAltas}
          barras={porHora.map((valor, h) => ({ nombre: `${h}:00`, corto: `${h} h`, valor }))} alto={200} />
      </div>
      <div>
        <h4>Por día de la semana</h4>
        <Barras etiqueta={`${que} en promedio cada día de la semana`} formato={formato} resaltar={diaMayor == null ? undefined : dias[diaMayor].nombre}
          filas={dias} />
      </div>
    </div>
  );
}

// Competencia: dispersión de interacción y sentimiento; al elegir un punto, su ficha al lado. Arranca en la marca propia.
export function Competencia({ marcas, numero }) {
  const [elegida, setElegida] = useState(() => marcas.find((m) => m.propia)?.id);
  const m = marcas.find((x) => x.id === elegida) || marcas[0];
  return (
    <div className="q-competencia">
      <div>
        <Dispersion etiqueta="Interacción y sentimiento de cada marca" rotuloX="Interacción en el mes" rotuloY="Sentimiento, de 0 a 100"
          formatoX={compacto} notas={{ neutro: 'neutro', arriba: 'positivo', abajo: 'negativo' }}
          puntos={marcas.map((x) => ({ id: x.id, nombre: x.nombre, propia: x.propia, x: x.interacciones, y: x.sentimiento.indice }))}
          elegido={m.id} onElegir={setElegida} />
        <p className="q-nota-bloque">Elige un punto para ver el detalle de cada marca.</p>
      </div>
      <aside className="q-ficha" aria-live="polite" aria-label={`Detalle de ${m.nombre}`}>
        <h4>{m.nombre}</h4>
        <dl>
          <div><dt>Interacción</dt><dd><b>{compacto(m.interacciones)}</b> en {numero(m.publicaciones)} {m.publicaciones === 1 ? 'publicación' : 'publicaciones'}</dd></div>
          <div><dt>Sentimiento de los comentarios</dt><dd><b>{numero(m.sentimiento.indice)}</b></dd></div>
          <div><dt>Anuncios activos</dt><dd><b>{numero(m.anuncios)}</b></dd></div>
          <div><dt>Palabras que más repite</dt><dd><ul className="q-palabras">{m.palabras.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>
        </dl>
      </aside>
    </div>
  );
}
