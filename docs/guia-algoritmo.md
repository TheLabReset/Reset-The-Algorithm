# Guía para diseñar un algoritmo

Así se diseña un algoritmo de The Lab para cualquier cliente. Sale del algoritmo que ya está en producción y de lo que se aprendió armando la demo de Fit Lab. Cada regla está implementada en este repositorio; la ruta entre corchetes dice dónde.

El sistema de diseño con el que se construye (colores, componentes, gráficos y el chequeo) es [Quincha](quincha.md). Para llevar todo esto a otra marca, el paso a paso está en [nuevo-algoritmo.md](nuevo-algoritmo.md).

Antes de cualquier decisión, la pregunta es la misma: **¿esto lo vamos a poder entregar con la data real?** Una vista nueva sirve si sale de fuentes que de verdad tenemos. Si no, no entra, aunque se vea bien.

## 1. Cuatro capas, en el orden en que trabaja la agencia

| # | Capa | Pregunta | Qué va |
|---|---|---|---|
| 1 | **Captura de señales** | ¿Qué pasa afuera? | Búsquedas (Google Trends), lo que se publica en el rubro (TikTok, Facebook), quién entra al sitio (GA4: usuarios, canales, páginas) |
| 2 | **Inteligencia de mercado** | ¿Conviene invertir ahora y qué miro? | Índice de oportunidad con su historia, Qué mirar (alertas y lo que va bien), temporada y escenario si nada cambia |
| 3 | **Activación estratégica** | ¿Dónde está la inversión y a qué costo? | Reparto por plataforma y producto, sugerencia del modelo, una tarjeta por plataforma (inversión por día y campañas; palabras al detalle), piezas y campañas con su estado, horas del sitio |
| 4 | **Rendimiento y optimización** | ¿Qué dio resultado? | Leads y acumulado del período, de la pauta al CRM, el CRM por dentro, cuándo y dónde entran los leads, la competencia |

- Cada capa tiene capítulos numerados (1.1, 1.2…). Las alertas apuntan a un capítulo por su número, y una prueba falla si apuntan a uno que no existe. [`src/capas/estructura.js`, `pruebas/calculo.test.mjs`]
- Para otro cliente se agrega o se quita un capítulo en la estructura; los componentes no cambian.
- No se ordena por profundidad de análisis (cada fuente sola, luego cruces, luego el modelo). Con tres capas así, una sola pregunta («¿cómo va mi pauta?») quedaba repartida en tres pestañas y la primera capa era casi tres veces más larga que las otras.

## 2. Tipografía

- **Por defecto**, la del algoritmo de referencia:
  - **Sofia Sans** para texto e interfaz;
  - **Sofia Sans Condensed** para el título de la capa y las cifras grandes;
  - **Sofia Sans Semi Condensed** para las tablas (`--f-tabla`).

  Son paquetes `@fontsource-variable/sofia-sans`, `-condensed` y `-semi-condensed`, con licencia OFL, y se cargan desde el propio build, no desde Google Fonts. No vienen instalados en este repo porque Fit Lab tiene tipografías propias.
- **Si el cliente tiene tipografías de marca que podemos usar, van esas.** Fit Lab usa Bricolage Grotesque en títulos y cifras, y Atkinson Hyperlegible Next en el texto. [`src/sistema/tokens.css`, `--f-titulo` y `--f-texto`]
- Las cifras van en números tabulares. Si la tipografía de texto tiene el cero cruzado, se reemplazan solo los dígitos con un `@font-face` de rango `U+0030-0039`. [`src/sistema/base.css`, «Cifras de la marca»]

## 3. Navegación

- **Pestaña de capa:** número y nombre. La capa activa tiene un fondo apenas teñido del color de acento de la marca (`--acento-suave`), texto y número en ese color (`--acento-texto`) y una marca redonda de 28 × 7 px pegada abajo. El radio es de 6 px arriba y 0 abajo. Al pasar el mouse, fondo de capítulo. [`.q-capas` en `src/sistema/componentes.css`]
- Las pestañas van en su propia fila, con una línea abajo. Los filtros (período, comparar con) van en la fila siguiente. Las dos filas quedan fijas arriba en pantallas anchas.
- **Período**, como en producción: un botón dice el tramo y el atajo («20 al 26 de octubre · Últimos 7 días») y abre los atajos (7 días, 30 días, este mes, mes pasado, 6 meses), dos fechas libres y con qué se compara, escrito con sus fechas. Abre en los últimos 7 días. Al lado, «Comparar con»: el período anterior o un año antes. Las reglas están en Datos honestos. [`SelectorPeriodo`; `src/calculo/periodo.js`]
- Índice «En esta capa» al costado, que marca el capítulo que se está leyendo: el último cuyo inicio ya pasó bajo la barra fija. Arriba de todo marca Resumen y al final de la página, el último capítulo. Un clic baja al capítulo sin cambiar de capa. [`IndiceCapa`]
- El alto de la barra fija se mide en pantalla (`--alto-capas`), no se escribe a mano: así un ancla nunca deja el título debajo de la barra, aunque la barra cambie de alto. En celular la barra no es fija y el alto es cero.
- **Qué se monitorea:** un botón junto a las fuentes de cada capa abre un panel lateral con lo que sigue cada fuente: palabras de Google Trends, hashtags, marcas, cuentas de pauta, palabras clave y páginas del sitio. Es configuración, no medición. [`PanelLateral`, `Monitoreo`; `monitoreo` en `src/calculo/vista.js`]
- **Presentar:** un botón en la barra superior agranda la letra para proyectar en una reunión, sin cambiar la página.
- Las anclas llevan de cualquier lado a cualquier lado: `#activacion` (una capa, desde su resumen), `#s-3-2` (un capítulo), `#a-…` (una alerta, que además se abre) y `#p-google` (una plataforma). Un ancla que no dice capa deja la capa donde está; nunca devuelve a la primera. [`src/App.jsx`]

## 4. Anatomía de una capa

1. **Cabecera:** título, una bajada de una línea y las fuentes con su fecha de corte. Un punto verde, ámbar o rojo dice el estado, y el texto también lo dice.
2. **Resumen:** de cuatro a cinco cifras. Cada una lleva su variación o su nota y un enlace al capítulo que la explica. Las cifras de una plataforma llevan el punto de su color en el rótulo («● CPL Google Ads»).
   - **El objetivo se dice en una frase, no en una barra.** Va en una caja gris debajo de las cifras, con una línea por plataforma: «Google Ads pagó **$7,14** por lead: $0,37 por debajo de su objetivo de **$7,51**». Solo la distancia lleva color (rojo si pasa el objetivo, verde si queda debajo) y las cifras van en negrita. Se eligió así porque no hay nada que aprender a leer, ocupa pocas líneas y no compite con las cifras de arriba. [`Resumen`, `frases`; `objetivoFrase` en `src/textos/capas.js`]
3. **Capítulos:** un panel gris con número, título y pregunta. Arriba van los avisos de las alertas que ese capítulo sostiene, en una línea cada uno, y debajo las tarjetas blancas.
4. **Vista general y detalle.** La vista general de un capítulo lleva **tres tarjetas como máximo**: lo que se lee para decidir. Lo minucioso (las palabras clave, los términos de búsqueda, las etapas del CRM, cada pieza) va en su detalle: un botón al pie del capítulo, «Ver el detalle: …», que dice qué hay adentro y abre el panel de la derecha. El ancla `#detalle-s-3-3` lo abre desde cualquier lado. La prueba de render falla si un capítulo pasa de tres tarjetas. [`Detalle`; `pruebas/render.test.mjs`]

## 5. La tarjeta

- La estructura siempre es la misma: cabecera (título, ventana, ayuda y lectura), cuerpo y pie con la fuente. Las tarjetas vecinas se alinean fila por fila con CSS subgrid. [`Bloque`]
- **Ventana arriba a la derecha.** Con calendario si sigue el período elegido («20 al 26 de octubre»). Con alfiler si no lo sigue: una cohorte, «últimas 52 semanas», «lectura de lo que va de octubre», «anuncios activos en octubre de 2026».
- **Lectura:** dos frases como máximo. Dice lo que el gráfico no dice solo, y cada comparación dice frente a qué.
- La ayuda (?) explica cómo se calcula. Los supuestos van ahí, no en el cuerpo.
- **Sin franjas de resalte.** Ninguna tarjeta lleva una barra de color al costado para llamar la atención. Lo importante se resalta con el orden, el tamaño o el peso del texto. Vale también para cualquier página que acompañe al algoritmo (auditorías, propuestas). [`npm run sistema`]

## 6. Gráficos y tablas

- **Forma.** Un solo eje (nunca doble) y líneas sin suavizar. Un día sin dato es un hueco, no un cero. El período de comparación va en gris.
- **Color.**
  - Las barras y líneas de dato van en el color de datos de la marca (`--serie-1`).
  - Si un gráfico resalta algo (la página nueva, las cuatro horas más altas, el día que más tiene), lo resaltado va en ese color y el resto en gris claro (`--serie-resto`).
  - Una sola marca resaltada por gráfico.
  - Las partes de un todo van en azul, naranja y menta, en ese orden, más un gris para «el resto».
- **Área clara** bajo la serie propia en las líneas.
- **«Ver como tabla»** visible debajo de cada gráfico. Se apaga solo si la tarjeta ya muestra esa tabla justo debajo.
- **Tablas.**
  - La columna principal lleva una barra delgada junto a la cifra.
  - El nombre puede llevar un subtítulo gris («Search · Membresías»).
  - El costo por lead va en rojo si pasa su objetivo y en verde si no.
  - Se resalta la fila propia (la marca, el hashtag propio). [`Tabla`]
- **Artes (anuncios, piezas, elementos):** el abanico, un mazo por dueño con sus tres piezas más recientes que se abre en abanico, y una ventana con todas. La marca propia va aparte, primero. [`Abanico`, [abanico.md](abanico.md)]
- **Lo nuevo va primero, con su sello.** Lo que empezó dentro del período (una pieza propia, un anuncio de la competencia) lleva el sello «Nuevo» en tinta y va primero en su lista o su mazo; el mazo dice cuántos son («2 nuevos en el período»). [`SelloNuevo`]
- **Piezas y campañas:** una tabla por campaña que se abre en conjuntos y piezas, como el administrador de anuncios. Las campañas con algo que mirar empiezan abiertas. Cada fila lleva su estado en una pastilla con icono y palabra (Sin leads, Costosa, Saturada, Rinde, Aprendizaje, Poca inversión) y un «por qué» de una frase con sus cifras. Sin barras ni CTR en la vista general. Los umbrales están a la vista en la ayuda: los oficiales de las plataformas (aprendizaje de 7 días, fatiga cuando el lead cuesta el doble) y los de costumbre (se juzga al gastar 3 veces el costo por lead; costosa a 1,5 veces el promedio de su plataforma). Las campañas de alcance no entran: no buscan leads. [`src/calculo/piezas.js`, `src/pantallas/Piezas.jsx`, `Etiqueta` llena con el catálogo de estados]
- **Horas:** barras por hora del día con las cuatro más altas resaltadas, y barras por día de la semana al lado. GA4 entrega la hora y el día por separado, así que no se usan mapas de calor de día por hora para el sitio. [`HorasYDias`]
- El contraste se mide con `npm run sistema`. Los pares de colores que conviven en un gráfico tienen mínimos propios.

## 7. Datos honestos

- **Data por día, filtrable, siempre que la fuente la tenga.** El período es cualquier tramo de días, no solo meses cerrados. Lo que llega por día (pauta, campañas, piezas, CRM, GA4) se suma en el tramo elegido; lo que llega por semana o por mes se lee en su unidad y lo dice en su ventana.
  - **Comparación con el período anterior:** un mes cerrado, con el mes anterior entero; el mes en curso, con el mismo tramo del mes anterior; cualquier otro tramo, con los mismos días justo antes. **Con un año antes:** las mismas fechas del año anterior (un mes entero, con el mismo mes).
  - **Con menos de 7 días no se publica ninguna variación:** un día raro mandaría. Tampoco si la comparación cae fuera de la data. [`DIAS_MINIMOS`]
  - **La cohorte del CRM** es el último mes que ya cerró (pasaron los días que tarda una inscripción), dentro del período o antes. Así el costo por inscripción no cambia con el largo del tramo.
  - **Las fuentes mensuales** (TikTok, Facebook, la biblioteca de anuncios, las regiones de Google) leen el mes en que termina el período; si ese mes lleva menos de 7 días, el mes anterior entero. Lo que va del mes se cuenta como lo que va, nunca como un mes entero.
  - **Lo que es «al mes»** (la propuesta de mover inversión) se lleva a un ritmo de 30 días si el período no es un mes, y lo dice en sus supuestos.
- **Plataformas como las ve el cliente.** Google Ads es una sola plataforma; Search y Display son tipos de campaña dentro de ella. [`plataformas` en `src/muestra/configuracion.js`]
- **Solo lo que tenemos.** No hay plan de inversión por día, así que no se muestra ritmo contra plan, y el escenario supone que la inversión diaria de las últimas cuatro semanas se mantiene. De la competencia solo se lee lo publicado: sin comparar contra el año anterior.
- **Universos.** Pauta, CRM y sitio cuentan cosas distintas: se leen lado a lado y nunca se suman. Las inscripciones se miden por cohorte cerrada, porque un lead tarda en inscribirse.
- **Sin ganadores falsos.** Si los valores están a menos de 10 % entre sí, se dice que «se parecen» y no se resalta ninguno. El empate se mide contra el mejor: si Google cuesta $51 por inscripción y Meta $52, se parecen aunque TikTok cueste $67. [`margenParecido`, `cpaParecido`]
- **Alertas.** Cada una sale de una regla con un umbral fijo y trae su dato. Incluye el calendario: una campaña del CRM que cierra dentro del mes siguiente avisa, para que la pauta que la empuja llegue hasta el cierre. La acción queda dentro de lo que maneja la agencia (pujas, palabras, páginas, reparto) o se plantea como conversación con el cliente. Nunca se presiona al personal del cliente.
- **Textos.** En español peruano, con el glosario de medios de la sección siguiente. Las cifras chicas al inicio de una frase van en letras. Observan, no ordenan. Antes de entregar, todo texto pasa por vickyfy.

## 8. Glosario de medios

Cada palabra tiene que ser cierta para el medio del que se habla. La prueba de render revisa el texto de las cuatro capas, con sus detalles abiertos, en cada atajo y comparación, y falla si aparece una de estas. Las filas de «paneles» y «al aire» valen para un cliente sin OOH, TV ni radio, como Fit Lab: para uno con esos medios se acotan a su contexto en `GLOSARIO`, no se borran. Si se agrega una fila aquí, se agrega su chequeo en `GLOSARIO` de [`pruebas/revisar.mjs`](../pruebas/revisar.mjs), y al revés.

| No se dice | Se dice | Por qué |
|---|---|---|
| plata | inversión, monto o dinero | suena a dinero sucio |
| gente | público, usuarios, leads o clientes | no dice a quién se mide |
| paneles (en OOH) | elementos | «panel» queda para el tablero y el panel de detalle |
| al aire (en digital u OOH) | activa o publicada (digital); con presencia (OOH) | «al aire» es televisión y radio |
| bajar o recortar la inversión | disminuir la inversión | la inversión se aumenta o se disminuye |
| movió, movilizó o generó $ | el verbo de lo que mide la fuente: invirtió, gastó, vendió | un monto lleva su verbo exacto |
| aprovechar (al público) | lo que decide la marca | el público no es alguien a quien acechar |
| raya larga (—) | punto, coma, dos puntos o paréntesis | es huella de texto armado |

Lo que no se puede revisar con una prueba también vale: el movimiento de un medio se le atribuye a la marca («Smart Fit sube en Meta», no «Meta sube»), una campaña no es un auspicio, y toda comparación dice frente a qué.

## 9. Lo que dice el modelo

- **Qué mirar:** una sola tarjeta con una lista numerada por nivel (piden atención, para revisar, oportunidades, lo que va bien). Cada fila tiene el dato en el título y la acción debajo; al abrirla, el detalle y el enlace a la tarjeta que lo sostiene. [`ListaAlertas`]
- **Sugerencia del modelo:** tarjeta con robot y rótulo, apenas teñida. Lleva una frase grande que se puede decidir y su detalle, y al costado una columna por plataforma. Si no propone mover nada, la frase dice por qué. Propone mover inversión solo si una plataforma pasa su objetivo de costo por lead y el CRM confirma que es la que más cuesta por inscripción (sin pocos casos). Si dos destinos cuestan parecido por inscripción, gana el de lead más barato. [`SugerenciaModelo`, `reasignacion`]
- **Índice de oportunidad:** la cifra con su banda, cómo vino al cierre de cada mes y cada componente de 0 a 100 con su peso.
- **Escenario:** un rango, no una cifra. Dice cuántas veces acertó con meses ya cerrados y si le gana a la estimación ingenua. Un mes que acierta poco no se muestra.

## 10. La demo

- **Barra de la demo**, abajo a la izquierda: datos, cargando, el CRM no cargó y GA4 no cargó. Sirve para mostrar en vivo que el panel dice lo que falta en vez de dibujar ceros. [`BarraDemo` en `src/App.jsx`]
- **Escenario forzado**, solo en la data de muestra: desde la segunda quincena del mes anterior al último mes cerrado, TikTok se encarece y sus leads se inscriben menos. Así el modelo llega a una recomendación con sus reglas de siempre, al abrir (últimos 7 días) y en el último mes cerrado. En los primeros días de diciembre la subasta encarece a las tres plataformas y el modelo, con razón, no propone mover nada: lo dice. Se hace en la configuración del generador (`cambiosCosto` y la calidad de cada canal), nunca tocando el modelo. [`src/muestra/configuracion.js`]
- **Fecha móvil**, solo en la maqueta: la muestra corta ayer en Lima y su historia se corre al último mes cerrado, así el panel se ve al día y abre en los últimos 7 días. El sello dice «Datos al 25 de octubre». Se apaga con `fechaMovil.activa: false`; una implementación real no la usa. [`src/muestra/fechaMovil.js`, [fecha-movil.md](fecha-movil.md)]

## 11. Antes de entregar

- `npm run prueba`: las reglas de cálculo, las anclas de las alertas, el período, las piezas y el render de cada capa (texto roto, glosario, tres tarjetas por capítulo).
- `npm run sistema`: tokens, contraste y espacios.
- Captura de cada capa a 1440 y a 390 de ancho, en claro y en oscuro, revisada a ojo.
- Ninguna cifra ni nombre de clientes reales en el repositorio.
- El nombre de la marca solo en `src/cliente.js` (lo revisa `npm run prueba`).
- `npm run artefacto -- <salida.html>` para publicar la página autocontenida.
