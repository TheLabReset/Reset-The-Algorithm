# 02. Referencias: qué copiar y qué no para «The Algorithm»

Investigación del 14 de octubre de 2026. Construye sobre las secciones 6, 7, 9 y 10 del documento la investigación de referencia; lo que ya está ahí (estados con la misma altura de Stripe, «Ignores dashboard filters» de PostHog, frescura por fuente, toggletip, régimen de movimiento de Carbon, lista negra de slop) no se repite.

Etiquetas: **confirmé** (lo leí en la fuente citada, o vi la captura), **se deduce** (inferido de lo que leí), **asumo** (no comprobado).

---

## 0. La respuesta corta

Los dos patrones que más mueven a alguien que ve dashboards cada semana no son visuales, son de texto y de referencia:

1. **El gráfico dice su lectura en el título y la meta se ve como una línea con nombre.** Todo lo demás (anotaciones, período anterior, recorrido) se apoya en esos dos.
2. **El recorrido de la reunión es una lista de pasos sobre el mismo gráfico**, no una presentación aparte: cada paso cambia el resaltado y la frase, y la misma lista se puede desenrollar como página plana para mandarla después.

Y una corrección de premisa: **Datawrapper River no es un modo presentación**, es una galería de gráficos reutilizables (confirmé, [Datawrapper Academy, «How to use the River»](https://www.datawrapper.de/academy/how-to-use-the-river)). Para el recorrido guiado las referencias útiles son Flourish story, el `Scroller` de Reuters y las reglas de Archie Tse en el NYT.

Y un hallazgo en el propio repo que conviene corregir antes de cualquier rediseño: **la hora de «Última actualización» del encabezado es el reloj del navegador, refrescado cada minuto** (`src/components/Dashboard.jsx`, líneas 11 y 19 a 21: `useState(new Date())` y `setInterval(... setLastUpdate(new Date()), 60000)`) (confirmé, leyendo el código). En una demo para gente que ve dashboards cada semana, esa es la cifra que MIENTE, en el sentido de la sección 9.3 de la investigación de referencia: dice que el dato es de hace un minuto y no lo es.

---

## 1. Medios

### 1.1 FT: Visual Vocabulary y Chart Doctor

**Copiar: elegir la forma por la relación que se quiere mostrar, en especial «Deviation» para CPL contra meta.**
El Visual Vocabulary organiza los gráficos en nueve relaciones; la de desviación dice «Emphasise variations (+/-) from a fixed reference point» (confirmé, [README de chart-doctor/visual-vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)). Para The Algorithm eso se traduce en: CPL por canal o por sede mostrado como barra divergente desde la meta (la meta es el cero), no como barras absolutas con una meta escrita al lado (se deduce).

**Copiar: título narrativo, etiqueta directa en la línea y un solo color fuerte.** John Burn-Murdoch (FT) dice que dedica «a lot of effort and time into getting that title right», que pasó las etiquetas «directly onto the lines» para que no haya que ir y venir a la leyenda, y que una sola línea roja entre grises destaca donde un arcoíris no (confirmé, [iMEdD, 10 jul 2025, reproduce GIJN](https://lab.imedd.org/en/from-data-to-storytelling-concept-and-design-tips-from-the-financial-times-john-burn-murdoch/)). Cita un estudio donde el gráfico con título narrativo y varias anotaciones le ganó al minimalista (confirmé que lo cita; el estudio no lo leí).

**No copiar:** el póster como menú. Trae chord, voronoi, sankey y otros que en una sala proyectada nadie lee en los segundos que dura una lámina (se deduce). Y la sección de interactividad, animación y color del README está vacía, marcada «Todo» (confirmé), así que no hay guía del FT para la parte interactiva de un dashboard.

> El Chart Doctor de Alan Smith está detrás del muro de pago del FT; no lo pude leer. Lo que atribuyo al FT viene del README público y de la charla de Burn-Murdoch.

### 1.2 NYT (The Upshot y gráficos)

**Copiar: las tres reglas de Archie Tse (2016), que son la base de cómo tratar el hover en un dashboard proyectado.** Del PDF original de su charla en Malofiej (confirmé, [archietse/malofiej-2016, slides](https://github.com/archietse/malofiej-2016)):
1. «If you make the reader click or do anything other than scroll, something spectacular has to happen.»
2. «If you make a tooltip or rollover, assume no one will ever see it. If content is important for readers to see, don't hide it.»
3. «If animation or motion is needed, try to trigger it when user scrolls.»

En una reunión el público no tiene el mouse: lo que vive en un tooltip solo existe si el presentador lo abre (se deduce). Gregor Aisch matiza la cifra del 85 % que circula con esta charla (salió de clics a un botón en unos pocos gráficos de 2015) y deja la regla útil: «If some information is crucial, don't make the user click or hover to see it» (confirmé, [vis4.net, 31 mar 2017](https://www.vis4.net/blog/in-defense-of-interactive-graphics/)).

**Copiar, adaptado: «primero adivina, luego mira».** En «You Draw It» (Upshot, 2015) el lector dibuja la curva que imagina y después ve la real contra su trazo (confirmé vía [FlowingData, 28 may 2015](https://flowingdata.com/2015/05/28/compare-your-curve-to-reality-for-income-percentile-versus-college-attendance/); la página del NYT no la abrí). En una reunión eso se vuelve un paso del recorrido: «¿Cuánto creen que cuesta un lead en TikTok frente a Meta?», y recién después se revela la barra (se deduce). Es el único gesto de esta lista que hace participar al cliente.

**Copiar: anotaciones alineadas con el texto que las acompaña.** Un análisis de 72 gráficos del NYT, The Economist, WSJ y Washington Post encontró «extensive use of annotations aligned with chart captions», «targeted highlighting» y «emphasis on article-related numerical values» (confirmé el resumen, [Rahman, Quadri y Rosen, IEEE VIS 2023](https://content.ieeevis.org/year/2023/paper_w-viscomm-1005.html); el artículo completo no lo leí).

**No copiar:** el dibujo libre con el mouse (en una sala no hay quién dibuje), ni el scrollytelling largo de los especiales: Tse misma lista «steppers» y «tabs» como cosas que el NYT dejó de hacer porque los lectores no llegaban al contenido (confirmé). Ojo con la inversión: eso vale para un lector solo; **en una reunión el que avanza es el presentador**, y para él un paso a paso sí es lo correcto (se deduce).

### 1.3 Reuters Graphics

**Copiar: el `Scroller` de Reuters, con su modo `embedded`.** El componente recibe «An array of step objects that define the steps in your scroller», y con `embedded` en `true` «will unroll the scroll experience into a flat layout», con `embeddedLayout` para decidir si el texto va antes o después del gráfico (confirmé, [reuters-graphics/graphics-components, Scroller.svelte](https://github.com/reuters-graphics/graphics-components/blob/main/src/components/Scroller/Scroller.svelte)). Es exactamente lo que necesita un recorrido de reunión: los mismos pasos sirven para presentar en vivo y para mandar como página plana después (se deduce).

**Copiar: el bloque gráfico con cuatro piezas fijas.** `GraphicBlock` tiene `title`, `description`, `notes` y `ariaDescription` (confirmé, [GraphicBlock.svelte](https://github.com/reuters-graphics/graphics-components/blob/main/src/components/GraphicBlock/GraphicBlock.svelte)). La librería también tiene `LocalDateTime`, `SimpleTimeline`, `BeforeAfter` y `SegmentedToggle` (confirmé los nombres de carpeta, [src/components](https://github.com/reuters-graphics/graphics-components/tree/main/src/components); no leí su código).

**Copiar: dar escala con algo conocido.** Para la explosión de Beirut, el equipo comparó la potencia con explosiones y municiones conocidas porque «we were still left wondering what that actually meant»; Marco Hernández: «the strength of the graphic lies in its simplicity» (confirmé, [Online Journalism Blog, 16 dic 2020](https://onlinejournalismblog.com/2020/12/16/striking-the-balance-between-graphic-design-and-data-journalism-design-is-a-conversation/)). En la demo, la inversión mensual por canal se entiende mejor contra algo que el cliente maneja: «lo que cuesta captar un socio» frente a «lo que paga un socio en un mes» (se deduce; requiere que el dato de ticket exista en la demo, asumo).

**No copiar:** ai2html y las piezas ilustradas a mano: son producción editorial de un solo uso, no un componente que se repite con datos que cambian (se deduce). Y la versión 20 antes de publicar («until we get to version 20 we are not close to publishing», confirmé) es un ritmo de redacción, no de producto.

### 1.4 Bloomberg Graphics

**Copiar, como contraste más que como modelo: el título descriptivo tiene un costo.** Amanda Cox, hoy en Bloomberg, cuenta que el estilo oficial «right now» es titular con un sustantivo que describe el gráfico, que funciona en gráficos simples y «stops being such a good choice» cuando se complican; y dice por su cuenta: «I am a believer that the headline should tell you what the chart shows», y en anotaciones, «use your words», «use some verbs» (confirmé, transcripción en [Datawrapper blog, 29 ene 2024](https://www.datawrapper.de/blog/amanda-cox-bloomberg); la transcripción parece automática). En la herramienta pública de Bloomberg los dos ejes no están permitidos y propone indexar ambas series a una base común (confirmé, misma fuente).

**No copiar:** la densidad del Terminal (gráficos de alta frecuencia, todas las series a la vez). Cox misma dice que la herramienta «encourages people to make a lot of charts like this», difíciles de leer (confirmé). No encontré una guía pública del equipo de Bloomberg Graphics (confirmé la ausencia en mis búsquedas; puede existir y no ser pública).

### 1.5 The Pudding

**Copiar: dos reglas de su guía de scrollytelling responsive.** Reemplazar el hover por texto o anotación fija, porque el hover provoca «inadvertent interactions», y mantener los pasos cortos: «I err on the side of short and sweet» (confirmé, [Russell Samora, abr 2017](https://pudding.cool/process/responsive-scrollytelling/)). Y la distinción de fondo: el scrollytelling «does not alter scroll behavior, but simply monitors it», a diferencia del scrolljacking (confirmé, [Pudding, ene 2017](https://pudding.cool/process/how-to-implement-scrollytelling)).

**No copiar:** el desplazamiento como motor del recorrido. En un proyector, el scroll con rueda o trackpad avanza a saltos irregulares y el público ve el gráfico a medio cambiar (asumo, por experiencia común; no lo medí). La misma guía desaconseja «steppers» para lectores (confirmé), pero un presentador necesita justamente un paso que avance con una tecla (se deduce). También: la guía es de 2017 y sus recetas de alto en `px` responden a las barras de los navegadores móviles, irrelevantes en una sala (se deduce).

---

## 2. Herramientas

### 2.1 Datawrapper (blog de Lisa Charlotte Muth)

**Títulos y texto.** «Give the main statement first and the precise data explanation later»; la precisión va a la descripción o a las notas; un buen título es coloquial («Is higher than ever» antes que «peaks») (confirmé, [Muth, «What to consider when using text in data visualizations», 28 sep 2022](https://www.datawrapper.de/blog/text-in-data-visualizations)).

**Densidad tipográfica.** Dos niveles bastan, por ejemplo «a 12px gray and a 14px black»; el método es poner todo pequeño, delgado y gris, y luego enfatizar solo lo importante; las anotaciones de más de unas 10 palabras no se centran ni se alinean a la derecha (confirmé, misma fuente). Para tablas, tipografías con cifras tabulares y de caja alta (confirmé en el extracto de [«Which fonts to use for your charts and tables», sep 2022](https://www.datawrapper.de/blog/fonts-for-data-visualization); el artículo completo no lo leí).

**Tooltips.** La categoría va junto al número: «3.4% unemployed», no «3.4%» (confirmé, misma fuente de 2022). En The Algorithm (cifra ilustrativa): «S/ 38 por lead en Meta», no «38».

**Color.** El gris es «the most important color in Data Vis»; los colores de resalte se reservan para los datos más importantes; el mismo color para la misma variable en todos los gráficos; más de siete colores pide otro gráfico (confirmé, [Muth, 29 may 2018](https://www.datawrapper.de/blog/colors)). El código actual pinta Meta Ads de naranja `#FF6B35` en la distribución de leads (`OptimizationLayer.jsx`, línea 29) y Meta como fuente de insights en morado (`DataLayer.jsx`, línea 306) (confirmé, leyendo el código): la misma marca con dos colores según la capa.

**Anotaciones.** Texto, flechas y círculos desde el dato a la nota, y bandas o líneas de rango horizontales y verticales con color, opacidad y trazo propios; en pantallas chicas las anotaciones se numeran y bajan a una lista bajo el gráfico (confirmé, [Muth, 2 nov 2020](https://datawrapper.de/blog/better-more-responsive-annotations-in-datawrapper-data-visualizations)).

**Tablas.** Ordenar por lo importante, aunque sea por una columna oculta; color solo en filas que no se deben perder, y mientras menos área pinta un color, más vivo debe ser; barras dentro de la celda solo en la columna principal; mover palabras repetidas al encabezado (confirmé, [Muth, 21 may 2019](https://www.datawrapper.de/blog/guide-what-to-consider-when-creating-tables)).

**Frescura.** Datawrapper no pone sola una fecha de «actualizado»; la recomienda vía un archivo de metadatos externo que llena las notas (confirmé en extractos de [Datawrapper Academy, live-updating metadata](https://academy.datawrapper.de/article/328-how-to-create-a-chart-with-live-updating-metadata)). La lección: la fecha la pone el proceso que trajo el dato, no la página.

**No copiar:** la lista numerada de anotaciones para móvil (en un proyector no hace falta y separa la nota de su dato) y el River (no es un modo historia, ver sección 0).

### 2.2 Observable (Plot y Framework)

**Copiar: el crosshair que escribe el valor sobre el eje.** `crosshairX` dibuja reglas y escribe los valores «just outside the bottom and left sides of the frame, typically on top of the axes», se queda con el punto más cercano dentro de `maxRadius` (40 px por defecto) y usa `pointerX` cuando el tiempo es la dimensión dominante (confirmé, [Plot, crosshair](https://github.com/observablehq/plot/blob/main/docs/interactions/crosshair.md)). En un proyector, el valor escrito en el eje se lee desde el fondo de la sala mejor que una caja flotante (se deduce).

**Copiar: un solo tip a la vez y control del orden de los campos.** El tip tiene `pool` activado: «at most one tip will be visible at a time»; el orden de los canales sigue el objeto `format`, y `null` oculta un canal (confirmé, [Plot, tip](https://github.com/observablehq/plot/blob/main/docs/marks/tip.md)). El mismo tip sirve como **anotación estática** con el canal `title` (confirmé): una nota fija con la misma forma que el tooltip, útil para el recorrido.

**Copiar: el área de diferencia contra la meta o contra el año anterior.** `differenceY` rellena entre la métrica y la comparación con un color cuando la métrica está arriba y otro cuando está abajo; contra sí misma desplazada se usa `Plot.shiftX("+1 year", ...)` (confirmé, [Plot, difference](https://github.com/observablehq/plot/blob/main/docs/marks/difference.md)). Para CPL contra meta, el área en rojo es «gasto por encima de la meta» y se ve sin leer cifras (se deduce; ojo, con CPL «arriba» es malo, así que los colores se invierten respecto del default verde/azul).

**Copiar: grilla de tarjetas con filas de igual alto y la nota como callout.** Framework trae `grid-cols-2` a `4`, con `grid-auto-rows: 1fr` para que cada fila tenga el mismo alto, `card` con `h2` y `h3` como título y subtítulo, y notas `tip`, `warning`, `caution` «to emphasize important information that could otherwise be overlooked» (confirmé, [Framework, markdown.md](https://github.com/observablehq/framework/blob/main/docs/markdown.md)).

**No copiar:** el modelo de Framework de construir los datos en el build («Data loaders generate static snapshots of data during build», confirmé, [data-loaders.md](https://github.com/observablehq/framework/blob/main/docs/data-loaders.md)) sin mostrar cuándo fue el build: la doc no dice nada de mostrar la fecha (confirmé). Si se copia el modelo de instantánea, la fecha de la instantánea tiene que ir en pantalla. Y la reactividad: si una promesa falla, la celda «simply doesn't run» (confirmé, [reactivity.md](https://github.com/observablehq/framework/blob/main/docs/reactivity.md)), o sea un hueco mudo, lo contrario del estado «La fuente no cargó» de la investigación de referencia. Plot como librería no se propone aquí: la investigación de referencia ya decidió gráficos propios (sección 5.4); se copian sus ideas, no su código (se deduce).

### 2.3 Flourish story (agregado porque es la referencia directa de «modo historia»)

**Copiar: duplicar la diapositiva para que el mismo gráfico cambie de estado.** Una diapositiva nueva sale de «+ new slide» o de duplicar la anterior, y la transición se anima solo cuando las dos diapositivas usan la misma plantilla (confirmé en extractos del [centro de ayuda de Flourish](https://helpcenter.flourish.studio/hc/en-us/articles/8761559998351-Creating-a-story); la página me devolvió 403). Por defecto las historias traen texto por diapositiva y botones de adelante y atrás; el modo «Scrolly» quita los botones y avanza con el desplazamiento (confirmé, mismos extractos, [Controlling stories with scrollytelling](https://helpcenter.flourish.studio/hc/en-us/articles/8761537907471-Controlling-stories-with-scrollytelling)).

**No copiar:** la reproducción automática (5 segundos por diapositiva por defecto, confirmé): en una reunión el ritmo lo pone la conversación, no un temporizador. Y armar el recorrido fuera del dashboard: si el recorrido vive en otra herramienta, el cliente ve una presentación, no el producto (se deduce).

---

## 3. Productos

### 3.1 Linear (Insights y Dashboards)

**Copiar: la tabla bajo el gráfico, vinculada.** En Insights, «A table sits below the graph»; pasar o seleccionar filas, columnas o celdas resalta o filtra el dato del gráfico (confirmé, [Linear Docs, Insights](https://linear.app/docs/insights)). En The Algorithm resuelve la cifra exacta sin depender del hover: el gráfico da la forma y la tabla da el número (se deduce).

**Copiar: el mismo insight como gráfico, tabla o «single-number metric»**, y que un insight agregado a un tablero herede los filtros del tablero, con la advertencia de que «may look different when viewed inside the dashboard than when viewed in its original View» (confirmé, [Linear Docs, Dashboards](https://linear.app/docs/dashboards) y [changelog, 24 jul 2025](https://linear.app/changelog/2025-07-24-dashboards)). Es la versión de Linear del «Ignores dashboard filters» que la investigación de referencia ya tomó de PostHog: la diferencia es que Linear lo asume como posible confusión y lo documenta.

**No copiar:** los marcadores de percentil 25, 50, 75 y 95 que aparecen al pasar el mouse sobre el diagrama de dispersión (confirmé que existen; misma fuente de Insights): son para un analista que explora, no para un público que mira. Tampoco los controles Measure, Slice y Segment en pantalla: en una demo, cada control a la vista es una pregunta que el cliente no tenía (se deduce). La documentación no muestra estados vacíos ni modo pantalla completa del tablero (confirmé la ausencia en esas dos páginas).

### 3.2 Stripe (Dashboard, Sigma, Apps)

la investigación de referencia ya tomó de Stripe la misma altura en todos los estados. Lo nuevo:

**Copiar: la cifra arriba, el gráfico abajo, y el rango de fechas escrito como chip.** «Show the current value above the chart so users get the answer before checking the trend», con alturas de 180 px en resumen y 320 px en detalle, y no más de tres gráficos por fila porque bajo unos 200 px de ancho se vuelven ilegibles (confirmé, [Stripe Apps, Chart layout](https://docs.stripe.com/stripe-apps/patterns/chart-layout)). En la captura de esa página se ve «Date range | Last 4 weeks» como chip encima de los KPI (confirmé, vi la imagen).

**Copiar: la pregunta elige el gráfico, con su advertencia.** La tabla de esa misma página empareja pregunta y gráfico («Is this going up or down?» con línea; «How much is each category?» con barra) y agrega la trampa de cada uno: una barra empieza en cero, así que «Use a line chart if a 100 USD change in 11,000 USD matters» (confirmé). Para CPL, que varía poco en valores grandes, esa línea es la que manda (se deduce).

**Copiar: la frescura pegada a cada gráfico.** En los gráficos de facturación, «Each chart has an updated timestamp that shows the exact freshness of the data», en el encabezado de la vista Explore, y Stripe nombra la excepción: todos más frescos «with exception of Net volume» (confirmé, [Stripe Support, fresher billing analytics](https://support.stripe.com/questions/fresher-billing-analytics-data)). Sigma publica la frescura por tabla (3 horas para la mayoría, hasta 120 para algunas derivadas) y expone `data_load_time` para que la consulta sepa hasta dónde llega el dato (confirmé, [Sigma data freshness](https://docs.stripe.com/data/data-freshness)). Y los gráficos del inicio se rotulan como estimados: «give you estimated information about your account activity» (confirmé, [Stripe Support, home charts](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights)). Para una demo con datos simulados, eso es un precedente directo: decir «datos de ejemplo» en el lugar donde iría la fecha (se deduce).

**Copiar: el texto de los estados vacíos.** El título dice qué falta, con punto, sin promocionar («No successful payments.»); la descripción dice cuándo aparece el dato, en menos de 14 palabras; si hay filtros activos, el mensaje cambia a «No customers match your filters.» y nunca ofrece «crear el primero» si el dato existe pero está filtrado; los vacíos de sección van con borde punteado y texto secundario (confirmé, [Stripe Apps, Empty state](https://docs.stripe.com/stripe-apps/patterns/empty-state)).

**No copiar:** el porcentaje verde sin decir contra qué. En la captura de Chart layout, «$11,700.00 +7.2%» no dice si es contra las 4 semanas anteriores o contra otra cosa (confirmé, vi la imagen); la investigación de referencia ya exige que toda comparación diga contra qué (9.3). Tampoco las barras con degradado de esa captura (confirmé que lo tienen; es la señal 4 de la lista negra) ni el spinner de carga del ejemplo de código (la investigación de referencia usa esqueleto con la altura final).

### 3.3 Vercel (Web Analytics, Speed Insights)

**Copiar: la meta como línea punteada con valor y forma en el eje.** En la captura del Real Experience Score, los umbrales 90 y 50 son líneas punteadas, y el rótulo en el eje lleva el número, un color y un glifo distinto: un círculo verde en 90, un triángulo naranja en 50 (confirmé, vi la imagen en [Speed Insights Metrics](https://vercel.com/docs/speed-insights/metrics)). El glifo hace que el umbral se distinga sin depender del color (se deduce; bueno para daltonismo y para proyectores que lavan el color).

**Copiar: una frase que traduce el percentil.** Junto a la cifra 98 y «Great, Above 90», la pantalla dice «More than 75% of visits had a great experience.» y una línea que define la métrica y la meta (confirmé, misma captura). Es la sección 9.3 de la investigación de referencia aplicada: el texto dice lo que la cifra no dice. Por defecto se muestra el P75 (confirmé, misma página y [changelog](https://vercel.com/changelog/improved-speed-insights-experience)).

**Copiar: agrupar por estado con el umbral en el encabezado, y el vacío positivo.** La vista por rutas son tres columnas: «Poor >3s», «Needs Improvement 1.8 - 3s», «Great <1.8s»; cada fila trae la ruta, la cantidad de mediciones en gris y el valor en negrita; la columna sin filas dice «No poor scores» con un check; y una nota al pie declara el corte: «Some with insignificant traffic (<0.5%)» (confirmé, vi la imagen en [Using Speed Insights](https://vercel.com/docs/speed-insights/using-speed-insights)). Detrás de cada fila hay una barra gris de fondo cuyo largo parece proporcional al volumen (se deduce de la imagen, no está documentado). Para The Algorithm: sedes o campañas en tres columnas por CPL contra meta, con el rango en el encabezado.

**No copiar:** el anillo de progreso alrededor del 98 (decoración: la cifra y la palabra «Great» ya lo dicen; se deduce) y los selectores P75 a P99 a la vista (para un cliente son cuatro preguntas nuevas). La doc de Web Analytics no describe comparación con el período anterior ni marcas de despliegue (confirmé la ausencia en las páginas leídas); no las atribuyo a Vercel.

### 3.4 PostHog (insights, dashboards, trends)

la investigación de referencia ya tomó «Ignores dashboard filters». Lo nuevo:

**Copiar: anotaciones como marcas al pie del eje de tiempo.** Las anotaciones aparecen «at the bottom of your chart», se leen al pasar el mouse, y varias en una misma fecha se resumen en un contador (o en un emoji si todas comparten el mismo); se crean para «the current chart or all of your charts» (confirmé, [PostHog, Annotations](https://posthog.com/docs/data/annotations)). En The Algorithm: «inicio de campaña», «cambio de creativos», «feriado» marcados una vez y visibles en todos los gráficos de tiempo (se deduce). Una advertencia de la propia doc: en vistas compartidas y embebidas las anotaciones no se muestran nunca (confirmé), así que en una demo compartida por enlace desaparecerían.

**Copiar: el período en curso con línea punteada.** «A dotted line indicated the data for that period is still being collected» (confirmé, [PostHog, Trends](https://posthog.com/docs/product-analytics/trends/overview)). Es el equivalente en línea del rayado de la investigación de referencia (3.4).

**Copiar: la comparación con el período anterior en dos lugares, no en la línea.** En el gráfico de número, «Compare to previous period» agrega una píldora de cambio porcentual; en la tabla, el valor anterior va en una columna propia al lado del actual (confirmé, [PostHog, Charts](https://posthog.com/docs/product-analytics/trends/charts)). El equipo de marketing de PostHog arma sus tableros con el total y la comparación a un lado y la tendencia semanal al otro (confirmé en el extracto de [«How (and why) our marketing team uses PostHog»](https://posthog.com/blog/posthog-marketing)). No pude confirmar cómo se dibuja la serie anterior superpuesta en el gráfico de líneas (no está en la doc que leí).

**Copiar: tarjetas de texto en el tablero** «to annotate your dashboard» y dar contexto (confirmé, [PostHog, Dashboards](https://posthog.com/docs/product-analytics/dashboards)). Y la tecla «F» para pantalla completa (confirmé, misma página): un atajo de una tecla es lo que necesita un presentador.

**No copiar:** la hora del último cálculo escondida en el tooltip del ícono de refrescar («The tooltip on the refresh icon shows when the tile's data was last computed», confirmé): es la frescura detrás de un hover, lo que Tse dice que nadie verá. Tampoco el estado vacío con «AI-powered starter prompts» (confirmé que existe): en una demo para clientes, sugerirle preguntas a la IA desvía la reunión. Y las anotaciones con emoji: el emoji en lugar del contador es lindo en un producto interno, pero en una sala proyectada reemplaza un número por un dibujo sin leyenda (se deduce).

---

## 4. Por tema: lo que cruza las referencias

| Tema | Patrón que más se repite | Fuentes |
|---|---|---|
| Título | La conclusión en el título, la precisión en el subtítulo o la nota. Bloomberg es la excepción declarada, y su propia editora de datos la discute | Muth 2022, Burn-Murdoch, Cox 2024 |
| Eventos en la línea | Marca al pie del eje con contador, más banda de rango y nota con verbo | PostHog, Datawrapper 2020, Cox |
| Período anterior | Cifra con píldora y columna en la tabla; en la línea, área de diferencia o serie desplazada | PostHog, Plot `differenceY` y `shiftX` |
| Meta | Línea punteada con valor y glifo en el eje; agrupar por banda de estado | Vercel, FT «Deviation» |
| Vacío y carga | Título que dice qué falta, descripción de cuándo aparece, distinto si hay filtros; vacío positivo cuando ninguno falla | Stripe, Vercel |
| Tooltip y crosshair | Nada crítico en hover; categoría junto al número; un tip a la vez; valor escrito sobre el eje | Tse 2016, Aisch 2017, Muth 2022, Plot |
| Frescura | Por gráfico y por fuente, puesta por el proceso que trae el dato; estimado se dice estimado | Stripe, Sigma, Datawrapper |
| Densidad de cifras | Dos niveles: gris chico para contexto, negro más grande para la cifra; cifras tabulares | Muth 2022, capturas de Stripe y Vercel |
| Recorrido | Lista de pasos sobre el mismo gráfico; transición solo dentro del mismo gráfico; el mismo guion se desenrolla en página plana | Flourish, Reuters `Scroller`, Tse |

**Lo que sirve del «modo historia» para una reunión, en concreto** (se deduce de las fuentes de arriba):
- Un paso es `{capa, período, filtro, qué se resalta, una frase con verbo}`. Nada más.
- Se avanza con flechas del teclado o un clic del presentador, no con scroll ni temporizador.
- Entre pasos del mismo gráfico se anima la transición; si el paso cambia de gráfico, corte seco (Flourish anima solo dentro de la misma plantilla).
- El paso «adivinen primero» oculta la cifra hasta el siguiente avance (Upshot).
- Al terminar, el mismo guion se puede ver como página plana para mandar por correo (Reuters `embedded`).
- Ningún paso depende de un hover.

---

## 5. Los 8 patrones que más valor darían a esta demo, en orden

1. **Título con la lectura, calculado del dato, y subtítulo con métrica, período y comparación.** Ejemplo, con cifras ilustrativas: «TikTok trae leads 30 % más baratos que Meta» y abajo «CPL por canal, últimos 30 días, contra meta de S/ 40». Si la condición del título no se cumple con el dato del período, el título cae al descriptivo, para que no MIENTA en otro estado. Fuentes: [Muth 2022](https://www.datawrapper.de/blog/text-in-data-visualizations), [Cox 2024](https://www.datawrapper.de/blog/amanda-cox-bloomberg), [Burn-Murdoch](https://lab.imedd.org/en/from-data-to-storytelling-concept-and-design-tips-from-the-financial-times-john-burn-murdoch/). Hoy los títulos son descriptivos («Performance Ultimos 7 Dias», `OptimizationLayer.jsx` línea 170; confirmé).
2. **La meta de CPL como línea punteada con valor y glifo en el eje, y el área entre CPL y meta pintada según el lado.** Fuentes: [Vercel, captura RES](https://vercel.com/docs/speed-insights/metrics), [Plot `differenceY`](https://github.com/observablehq/plot/blob/main/docs/marks/difference.md), [FT «Deviation»](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md).
3. **Recorrido guiado por pasos sobre el mismo dashboard**, con teclado, transición solo dentro del mismo gráfico, un paso «adivinen primero» y versión plana para enviar. Fuentes: [Reuters `Scroller`](https://github.com/reuters-graphics/graphics-components/blob/main/src/components/Scroller/Scroller.svelte), [Flourish stories](https://helpcenter.flourish.studio/hc/en-us/articles/8761559998351-Creating-a-story), [Tse 2016](https://github.com/archietse/malofiej-2016), [Upshot «You Draw It» vía FlowingData](https://flowingdata.com/2015/05/28/compare-your-curve-to-reality-for-income-percentile-versus-college-attendance/).
4. **Frescura verdadera por fuente, y «datos de ejemplo» dicho donde corresponde.** Primero quitar el reloj del navegador del encabezado (`Dashboard.jsx` líneas 11 y 19 a 21). Fuentes: [Stripe, timestamp por gráfico](https://support.stripe.com/questions/fresher-billing-analytics-data), [Sigma `data_load_time`](https://docs.stripe.com/data/data-freshness), [Stripe, gráficos rotulados como estimados](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights).
5. **Eventos de campaña como marcas al pie del eje de tiempo, compartidos entre gráficos, con nota que usa un verbo.** Fuentes: [PostHog Annotations](https://posthog.com/docs/data/annotations), [Datawrapper, rangos y anotaciones](https://datawrapper.de/blog/better-more-responsive-annotations-in-datawrapper-data-visualizations).
6. **Sedes o campañas agrupadas en tres columnas por banda de CPL contra meta**, con el rango en el encabezado, el volumen en gris y el CPL en negrita, vacío positivo («Ninguna sede sobre la meta») y nota del corte. Fuente: [Vercel, captura por rutas](https://vercel.com/docs/speed-insights/using-speed-insights).
7. **Período anterior en la cifra (píldora que dice «vs. 30 días previos») y en una columna de la tabla; el período en curso con línea punteada.** Corrige el «vs periodo anterior» sin fechas de `DecisionLayer.jsx`, línea 123. Fuentes: [PostHog Charts](https://posthog.com/docs/product-analytics/trends/charts), [PostHog Trends](https://posthog.com/docs/product-analytics/trends/overview).
8. **Nada crítico en hover: valor escrito sobre el eje con el crosshair, un tip a la vez con la categoría junto al número, y tabla vinculada bajo el gráfico para la cifra exacta.** Fuentes: [Plot crosshair](https://github.com/observablehq/plot/blob/main/docs/interactions/crosshair.md), [Plot tip](https://github.com/observablehq/plot/blob/main/docs/marks/tip.md), [Muth 2022](https://www.datawrapper.de/blog/text-in-data-visualizations), [Linear Insights](https://linear.app/docs/insights), [Aisch 2017](https://www.vis4.net/blog/in-defense-of-interactive-graphics/).

Si hay que elegir dos: el 1 y el 2. Son los que alguien que ve dashboards cada semana nota en los primeros diez segundos, y los demás se apoyan en ellos (se deduce).

---

## 6. La mejor objeción y su respuesta

**Objeción:** «Los títulos con conclusión son de periodismo, donde el gráfico es fijo. En un dashboard el dato cambia y el título se vuelve falso; por eso Bloomberg y casi todos los productos (Stripe, Linear, PostHog) titulan con sustantivos.»

**Respuesta:** la objeción es correcta para un título escrito a mano. Por eso el patrón 1 pide el título **calculado** con una condición explícita y una caída al descriptivo cuando la condición no se cumple. Que los productos titulen con sustantivos (confirmé en las capturas de Stripe: «Member growth», «Revenue from members») se explica porque sirven a quien ya sabe qué mirar; una demo de venta sirve a quien todavía no sabe (se deduce). El costo es de implementación: cada título es una pequeña regla que hay que probar en todos los estados, igual que la investigación de referencia prueba cada texto contra MIENTE.

## 7. Cuándo esto estaría equivocado

- **Si la demo se presenta casi siempre por enlace y no en sala,** el recorrido por pasos vale menos que la exploración libre, y los patrones 3 y 8 bajan de prioridad. Señal temprana: que el equipo comercial mande el enlace antes de la reunión más de lo que lo proyecta.
- **Si los clientes desconfían de títulos que «opinan»,** el patrón 1 juega en contra. Señal temprana: en las primeras demos preguntan «¿eso lo dice la data o lo dicen ustedes?» frente a un título.
- **Límites de esta investigación:** el Chart Doctor del FT, la página del NYT de «You Draw It», el centro de ayuda de Flourish y la doc web de Observable me devolvieron muro de pago, 403 o 429; usé el README público, reseñas de terceros, extractos del buscador y el código fuente en GitHub. Las afirmaciones sobre Bloomberg salen de una sola charla transcrita. Lo que se ve en capturas de Stripe y Vercel puede haber cambiado en el producto vivo.
