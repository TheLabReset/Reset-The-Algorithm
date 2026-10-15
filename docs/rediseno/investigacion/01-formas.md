# The Algorithm: qué forma responde cada pregunta

Investigación 01 del rediseño. THE LAB, Reset. 14/10/2026. Trabajo de solo lectura sobre el repo `Reset-The-Algorithm`.

---

## 0. La respuesta corta

**Para una demo que ve un posible cliente una sola vez y en reunión, gana la forma que se lee sin instrucciones.** Por eso el núcleo es: líneas (en small multiples con eje común cuando hay más de tres series), puntos y barras sobre escala común, la tabla de etapas para el embudo, el mapa de calor para hora por día y una lista ordenada para las sedes. Las formas de alta densidad (horizon, marimekko, cartograma contiguo) se quedan fuera.

Tres decisiones que este informe sostiene con fuente:

1. **El sankey de leads miente si las etapas son cohortes por fecha de entrada.** Solo es honesto con una cohorte cerrada y seguida lead por lead, con el nodo «aún abierto» dibujado (sección 2.1).
2. **El horizon chart no se lee rápido sin entrenamiento.** Los dos estudios que lo miden usaron estudiantes de ingeniería con práctica previa y retroalimentación, y aun así fue la forma más lenta en la tarea más simple (sección 2.2).
3. **Para 12 sedes en distritos de Lima, nada de coroplético.** Va una lista ordenada agrupada por zona; si hace falta geografía, un mapa de teselas iguales o un mapa de ubicación con puntos del mismo tamaño (sección 2.3).

Los dos factores que más pesan en cada elección de este informe son **(1) qué pregunta responde el bloque** y **(2) que el lector es un no experto que mira una vez**. Todo lo demás (densidad, novedad, «verse distinto») pesa menos.

---

## 1. Base, alcance y convenciones

### 1.1 Lo que ya está establecido en la investigación de referencia y no se repite

Se cita como «ya establecido en la investigación de referencia» (documento de diseño interno, secciones 2, 5 y 9) y este informe construye encima:

- Posición sobre escala común y largo son las codificaciones más precisas; ángulo y área, las peores (Cleveland y McGill). De ahí: sin tortas, sin donas, sin medidores radiales.
- El índice de 0 a 100 va como bullet graph lineal con rangos en un solo tono (Few).
- La retícula de 100 cuadros por el método del mayor resto para contar «de cada 100».
- Sin doble eje, sin curvas suavizadas entre días, sin embudo de silueta; las etapas de un embudo de cohortes van como tabla con barras (componente `Etapas`).
- Mapa de calor en un tono, con escala visible y el nulo rayado.
- Una sola lista con barras por bloque; dos medidas por ítem van en dispersión.
- Contra el slop: una cifra grande por bloque, el texto no lee el gráfico, todo texto debe ser cierto en todos los estados.

### 1.2 Fuentes leídas

- `choosing-a-form.md` y `anti-patterns.md` de la skill dataviz (confirmé). Dos reglas de ahí se usan abajo: las formas de «todos contra todos» (dispersión, small multiples, coroplético) llevan como máximo tres colores categóricos, y el doble eje se reemplaza por dos gráficos o por un índice con base 100 en un solo eje.
- Los PDF completos de Heer, Kong y Agrawala (2009), Javed, McDonnel y Elmqvist (2010), Haroz, Kosara y Franconeri (2016), Ondov y otros (2018), Correll y Gleicher (2014), Van Wijk y Van Selow (1999) y Robbins (2008) (confirmé, extraje el texto y leí método y conclusiones).
- El resto, en su página o resumen; donde solo leí un resumen de búsqueda, lo digo.

### 1.3 Etiquetas

- **confirmé**: leí la fuente (el PDF, la página o, para los cuadernos de Observable, el código del cuaderno vía su API).
- **se deduce**: inferencia mía a partir de lo confirmado.
- **asumo**: no lo comprobé.

### 1.4 La data de la demo

La lista de datos viene del encargo. En el repo actual, `src/data/mockData.js` tiene 12 sedes de un gimnasio ficticio (Miraflores, San Isidro, Surco, La Molina, San Borja, Magdalena, Jesús María, Lince, San Miguel, Independencia, Los Olivos y Ate) (confirmé). Asumo que el generador nuevo con semilla mantiene esos distritos o unos parecidos; si cambian, la sección 2.3 sigue valiendo, pero hay que rehacer la cuenta de zonas.

---

## 2. Las tres preguntas con atención especial

### 2.1 (a) ¿Miente un sankey de leads cuando las etapas son cohortes por fecha de entrada?

**Sí, miente.** Y no por estética: por lo que el sankey afirma.

**Qué afirma un sankey.** El ancho de cada cinta es proporcional a la cantidad que pasa de un nodo al siguiente (confirmé, Wikipedia: «the width of the arrows is proportional to the flow rate»). Suele mostrar cantidades conservadas dentro de un sistema, con entradas, salidas útiles y pérdidas (confirmé, misma fuente). La guía del FT lo describe como la forma para «tracing the eventual outcome of a complex process» (confirmé, FT Visual Vocabulary). Se deduce que cada cinta dice «estas unidades, las mismas, pasaron de A a B», y que lo que entra a un nodo es igual a lo que sale más lo que se pierde.

**Qué mide un embudo por cohortes de fecha.** En una ventana (por ejemplo, el mes), cada etapa cuenta los leads que *entraron a esa etapa* en la ventana. Un lead que llegó en marzo y pasó a visita en abril se cuenta como lead en marzo y como visita en abril. Ya está establecido en la investigación de referencia que con este tipo de conteo una etapa posterior puede tener más casos que la anterior, y que por eso el embudo de silueta se descartó.

**Por qué el sankey miente con esa data** (se deduce):

1. **Las cintas no existen en la data.** Para dibujar «lead → visita» hace falta saber cuántos de *esos* leads pasaron a visita. El conteo por cohorte de fecha no lo dice. El sankey obligaría a inventar la cinta, normalmente como «visitas del mes / leads del mes», que mezcla personas distintas.
2. **La conservación se rompe a la vista.** Si una etapa posterior tiene más casos que la anterior, el nodo de destino recibe más de lo que salió del origen. El sankey solo puede dibujarlo con una cinta que «aparece de la nada» o recortando el dato.
3. **La pérdida se vuelve falsa.** La parte que «no pasó» en el mes incluye leads que todavía no tuvieron tiempo de pasar. Eso no es pérdida, es censura por la derecha: los leads de la última semana aún están abiertos.

**Cuándo un sankey sería honesto** (se deduce; requiere confirmar que el generador guarda un ID por lead):

- Se fija **una cohorte de entrada** (por ejemplo, los leads que entraron en un mes dado), se sigue lead por lead y se corta en una fecha de madurez declarada.
- Se dibuja un nodo **«aún abierto»** separado de «perdido».
- El rótulo dice qué cohorte es y a qué fecha («Leads que entraron en marzo, estado al 30 de mayo»).

Así trabajan las herramientas de producto: Mixpanel cuenta una conversión solo si la misma persona completa los pasos en orden dentro de una ventana que empieza en su primer paso (confirmé en el resumen de la documentación que devolvió la búsqueda; no abrí la página).

**Aun honesto, el sankey cuesta leerlo.** Las cintas curvas piden juzgar grosores en diagonal, y la ilusión del seno hace subestimar la distancia vertical entre curvas de pendiente cambiante (Cleveland y McGill la describieron; VanderPlas y Hofmann, 2015, la estudian en gráficos de datos; confirmé la referencia y el resumen del efecto en un trabajo de 2024, no leí el artículo de 2015) (se deduce que aplica a las cintas).

**Qué usar en su lugar:**

| Pregunta | Forma | Veredicto |
|---|---|---|
| ¿Cuántos entraron a cada etapa este mes? | `Etapas` (ya establecido en la investigación de referencia) | Sirve. Es la forma por defecto |
| ¿Qué proporción de cada cohorte llega a venta, y en cuántos días? | **Curvas de conversión acumulada por cohorte**: eje x = días desde la entrada, eje y = % de la cohorte que ya llegó a la etapa, una línea por mes de entrada (la última, la más reciente, resaltada) | Sirve. Muestra la censura como una línea que se corta antes, en vez de esconderla (se deduce) |
| ¿Mejoran las cohortes recientes? | Triángulo de cohortes (filas = mes de entrada, columnas = mes de vida, celda = % acumulado) como mapa de calor de un tono | Sirve con condiciones: con 18 meses hay 18 filas; si no, se agrupa por trimestre (se deduce) |
| ¿Qué fuente y qué dispositivo traen las conversiones web? | **Parallel sets / alluvial** (fuente → dispositivo → convirtió sí/no) | Sirve con condiciones: es una tabla cruzada de las mismas sesiones, no un recorrido en el tiempo, así que la conservación sí se cumple (se deduce). Kosara, Bendix y Hauser (2006) lo diseñaron para frecuencias de datos categóricos (confirmé en el resumen) |

**Ejemplos:** sankey en Observable, `@d3/sankey-component` (confirmé que el cuaderno existe, vía la API de Observable). Parallel sets, `@d3/parallel-sets` (confirmé, mismo método). No encontré un sankey de embudo de ventas publicado por NYT, FT, Reuters, Bloomberg o The Pudding (se deduce que no es una forma habitual en prensa para esto; no es prueba).

### 2.2 (b) ¿Se lee rápido un horizon chart si el lector no es experto?

**No hay evidencia de que sí, y la que hay apunta a que no.**

**Heer, Kong y Agrawala (2009), CHI, Best Paper** (confirmé, leí el PDF completo):

- Participantes: experimento 1, 18 estudiantes de ingeniería (pregrado y posgrado); experimento 2, 30 estudiantes de pregrado de varias carreras; seguimiento, 8 estudiantes de posgrado de ingeniería, 6 de ellos repetían.
- **Entrenamiento:** «we told subjects to take as many practice trials as they wished and instructed them to practice until they had reached a steady performance level», con la respuesta correcta mostrada tras cada práctica.
- Hallazgos: dividir en bandas superpuestas «reliably increased estimation time and increased estimation error at constant chart heights». Con 4 bandas o más, el tiempo y el error suben y los participantes dijeron que leerlas era «difficult and tiring». La ventaja de 2 bandas aparece solo con alturas menores de 24 píxeles (6,8 mm en su pantalla).
- Sobre el espejo de negativos: no perjudicó, y lo recomiendan «so long as the viewer knows how to interpret the chart».

**Javed, McDonnel y Elmqvist (2010), IEEE TVCG** (confirmé, leí el PDF completo):

- 16 estudiantes de ingeniería de segundo año o más, con una fase de entrenamiento por técnica.
- El horizon fue «significantly slower than all other techniques» en la tarea de encontrar el máximo, la más simple. Los autores lo explican así: «horizon graphs are not really preattentively perceivable, but require some cognitive effort to decode».
- Conclusión: las líneas simples y los small multiples son «most versatile».

**Dahnert y otros (2019)**: el horizon gana en tareas de máximo pero rinde peor en detectar tendencias (confirmé en el resumen de arXiv).

**Veredicto: no sirve aquí.** (se deduce) Los estudios que lo favorecen miden a lectores entrenados, y su ventaja es de espacio en alturas muy pequeñas. Una demo no tiene ese problema de espacio, y su lector no tiene práctica. La data que tentaría a usarlo (el interés semanal de búsqueda de muchas keywords) se resuelve con small multiples de líneas o con un mapa de calor keyword por semana.

**Ejemplos:** `@d3/horizon-chart/2` y `@observablehq/plot-horizon` en Observable (confirmé que existen). No encontré horizon charts publicados por los medios de la lista (asumo que su ausencia en prensa refleja el mismo costo de lectura; no lo comprobé).

### 2.3 (c) Geografía: 12 distritos de Lima sin coroplético engañoso

**El problema, medido.** En un coroplético, cada distrito pesa por su superficie, no por su dato. Superficies (confirmé en la tabla de Wikipedia, que dice usar datos del INEI; no las crucé con el INEI): Ate 77,72 km², Santiago de Surco 34,75 km², Los Olivos 18,25 km², San Isidro 11,10 km², Miraflores 9,62 km², Jesús María 4,57 km², Magdalena 3,61 km², Lince 3,03 km². Ate ocupa unas 25 veces el área de Lince (se deduce: 77,72 / 3,03 = 25,6). En un coroplético, la sede de Ate dominaría la imagen aunque tuviera el peor dato.

Hay un segundo problema: **una sede es un punto, no un distrito.** Pintar todo el distrito sugiere que el dato describe a todo el distrito (se deduce). Y un tercero: de las 12 sedes del repo, 9 caen en lo que Infobae lista como Lima Moderna (Barranco, Jesús María, La Molina, Lince, Magdalena, Miraflores, Pueblo Libre, San Borja, San Isidro, San Miguel, Surco y Surquillo) (confirmé la lista en el resumen de búsqueda de Infobae, que la atribuye a Ipsos). Las otras 3 son Independencia y Los Olivos (Lima Norte) y Ate (Lima Este) (asumo la zona de esas tres; es la división habitual, no la verifiqué). En un mapa real, 9 sedes quedarían apretadas en un área chica (se deduce).

**¿Hace falta un mapa?** El FT dice que lo espacial se usa «only when precise locations or geographical patterns in data are more important to the reader than anything else» (confirmé, FT Visual Vocabulary). Para «qué sede está más llena», la geografía no es la pregunta. Para «hay demanda en Lima Norte que no estamos atendiendo», sí lo es.

**Tres formas, en orden:**

1. **Lista ordenada agrupada por zona (dot plot o barras)** · Sirve. Es la forma por defecto.
   - Respaldo: posición sobre escala común (ya establecido en la investigación de referencia).
   - Ejemplo: dot plot y range plot de Datawrapper (confirmé, blog de Datawrapper, 2017).
   - Cuándo no: cuando la pregunta sea de vecindad («¿las sedes del norte se parecen entre sí?»).
   - Dato: ocupación, miembros y nuevos por sede, agrupados en Lima Moderna, Norte y Este.
2. **Mapa de teselas iguales (tile grid map), 12 cuadrados en posición geográfica aproximada** · Sirve con condiciones.
   - Respaldo: en Nusrat, Alam y Kobourov (2015), con 33 participantes, los cartogramas rectangulares tuvieron el peor desempeño en precisión, pero el mejor en adyacencia, con 5 % de error, contra 48,5 % del no contiguo (confirmé, leí el artículo en ar5iv). Un estudio de Calvo, Cucchietti y Pérez-Montoro compara coroplético contra tile grid map y advierte que las teselas tienen sus propios problemas de identificación y no son familiares para el público general (confirmé solo en el resumen de búsqueda, no leí el texto).
   - Condiciones: cada tesela lleva el nombre del distrito escrito y la cifra; el color es de un tono y la escala está a la vista; la disposición se arma a mano y se revisa contra un mapa real (se deduce). Cuadrados mejor que hexágonos: con 12 unidades no hay ganancia de vecindad que justifique el hexágono, y el cuadrado alinea los textos (se deduce).
   - Ejemplo: mapas de hexágonos de Datawrapper, donde «each state the same size» (confirmé en el resumen de búsqueda de sus mapas base); su artículo sobre cartogramas advierte que «Cartograms are really, really slow to read» y que «each cartogram is a compromise» (confirmé, Datawrapper, 2018).
   - Cuándo no: si el lector tiene que ubicar la sede en la ciudad real; ahí va el mapa de ubicación.
3. **Mapa de ubicación con puntos del mismo tamaño** · Sirve con condiciones.
   - Respaldo: Datawrapper llama a los mapas de símbolos «the right choice» para muchas ubicaciones concretas (confirmé, guía de tipos de gráfico, 2025).
   - Condiciones: el punto marca dónde está la sede y nada más, sin círculos proporcionales a miembros. El FT advierte que con símbolos proporcionales «small differences in data will be hard to see» (confirmé), y comparar áreas de círculos es la codificación que ya está descartada en la investigación de referencia. El dato va al lado, en la lista.
   - Cuándo no: como única vista del dato. Es un mapa para orientarse, no para comparar.

**No sirven aquí:** el coroplético por distrito (por las razones de arriba) y el cartograma contiguo (se deforman formas que el lector limeño reconoce, y con 12 sedes sueltas no hay un territorio continuo que deformar; se deduce).

---

## 3. Por tipo de pregunta

Cada forma lleva: respaldo, ejemplo publicado, cuándo no y a qué dato de la demo sirve.

### 3.1 Evolución (cómo cambió algo en el tiempo)

**Base ya establecida en la investigación de referencia:** la línea con rectas entre días, sin suavizado, con el valor final rotulado.

**A. Small multiples con eje común, uno por canal** · Sirve.
- Respaldo: Javed y otros (2010) encontraron que las técnicas de espacio separado (small multiples) son más eficientes para comparar a lo ancho del tiempo, y las superpuestas, para comparaciones locales; además, más series bajan la precisión y suben el tiempo (confirmé). Ondov y otros (2018), con experimentos en línea, confirman que superponer funciona bien y que los small multiples estándar rinden menos para detectar el cambio más grande (confirmé en el resumen del PDF). La skill dataviz pone en tres el máximo de colores para formas de «todos contra todos» (confirmé).
- Ejemplo: Datawrapper, «Charting the corona effect» (Kokkelink, 16/04/2020): un panel por país, los demás en gris, todos indexados a una fecha; el autor dice que una sola línea combinada «turned out to be completely unreadable» (confirmé).
- Cuándo no: con dos o tres series que se cruzan y cuyo cruce es la noticia; ahí va una sola línea con énfasis. Tampoco con escalas independientes por panel si la pregunta es de nivel: Datawrapper, que permite escalas independientes, fuerza las etiquetas del eje en ese modo «to avoid misleading comparisons» (confirmé, Datawrapper, 2024).
- Dato: leads o CPL semanal por canal pagado (5 paneles); ocupación mensual de las 12 sedes; interés de búsqueda por keyword.
- Condición propia de esta data (se deduce): 18 meses de datos diarios por canal son unos 540 puntos de ruido por panel. Si no se suaviza (la investigación de referencia), se agrega: semana para leer tendencia, día solo cuando se busca un evento.

**B. Línea indexada (base 100 en una fecha)** · Sirve con condiciones.
- Respaldo: la skill dataviz la da como reemplazo del doble eje: «index both series to a common base (=100 at t0) on one axis» (confirmé).
- Ejemplo: el mismo de Datawrapper (series indexadas al 12/02/2020; confirmé); `@d3/index-chart/2` en Observable (confirmé que existe).
- Cuándo no: cuando importa el nivel absoluto (cuántos leads), o cuando la base cae en un día atípico, porque todo el gráfico depende de esa fecha (se deduce).
- Dato: crecimiento de inversión contra crecimiento de conversiones; share of voice propio contra el del competidor principal.

**C. Anotaciones en el propio gráfico** (ver 3.12) · Sirve en casi toda evolución que se presente.

### 3.2 Comparación (cuál es mayor, por cuánto)

**Base ya establecida en la investigación de referencia:** barras en un solo color, y una sola lista con barras por bloque.

**A. Dot plot de Cleveland** · Sirve.
- Respaldo: posición sobre escala común (ya establecido en la investigación de referencia). Datawrapper aconseja como máximo tres puntos por fila (confirmé en el resumen de búsqueda de su guía de dot plots).
- Ejemplo: Datawrapper, dot plots y range plots (confirmé, blog de Datawrapper, 2017).
- Cuándo no: cuando el cero importa y el lector lee proporciones («el doble»); ahí la barra desde cero es más honesta (se deduce).
- Dato: CPL por canal; ocupación por sede; sentimiento promedio por competidor. Libera la «una lista con barras por bloque» para donde de verdad haga falta.

**B. Dumbbell (range plot)** · Sirve.
- Respaldo: dos posiciones sobre una escala común más la distancia entre ellas, que se lee como largo (se deduce a partir de lo establecido en la investigación de referencia). Datawrapper lo describe como útil cuando importa la brecha y se quieren mostrar los dos valores (confirmé).
- Ejemplo: Datawrapper, «New: Arrow and Range Plots» (Kokkelink, 22/09/2017), con la brecha salarial de género como caso (confirmé). Para cambio con dirección, la variante es el arrow plot: `@observablehq/plot-arrow-variation-chart` (confirmé que existe).
- Cuándo no: con más de dos momentos (ahí va una línea), o cuando una de las dos puntas es una meta; para meta contra real ya está establecido en la investigación de referencia el bullet graph.
- Dato: CPL del mes anterior contra el actual por canal; ocupación de cada sede hace 12 meses contra hoy; sentimiento de cada competidor al inicio y al final del periodo.

**C. Slope chart** (ver 3.7).

### 3.3 Parte de un todo

**Base ya establecida en la investigación de referencia:** la franja de proporción con nombres encima y la retícula de 100.

**A. Barras 100 % apiladas por mes (cambio de la mezcla en el tiempo)** · Sirve con condiciones.
- Respaldo: el FT avisa que la columna apilada «can be difficult to read with more than a few components», y del área apilada dice «Use with care… seeing change in components can be very difficult» (confirmé, FT Visual Vocabulary). Se deduce que solo la primera y la última capa se leen bien, porque son las únicas con base común.
- Ejemplo: `@d3/stacked-normalized-horizontal-bar` en Observable (confirmé que existe).
- Condiciones: 5 canales como máximo, con el canal que importa en la base; si la pregunta es cómo cambió la participación de cada canal, van small multiples de líneas de participación (se deduce).
- Dato: mezcla de inversión por canal mes a mes (18 columnas); mezcla de tráfico web por fuente.

**B. Retícula (waffle)** · Sirve con condiciones (ya establecida en la investigación de referencia; aquí solo se suma evidencia).
- Respaldo: la documentación de Observable Plot dice que «Waffles are useful for reading exact quantities» (confirmé en su fuente en GitHub); el FT dice que las cuadrículas «work best when used on whole numbers» (confirmé). Datawrapper advierte que «sacrifice some readability for being more fun» (confirmé). No encontré un estudio de precisión propio del waffle: el de Kosara y Ziemkiewicz (BELIV 2010) solo lo vi citado (asumo su resultado).
- Ejemplo: la documentación de la marca waffle de Observable Plot (confirmé).
- Cuándo no: para comparar dos waffles con valores cercanos, o con más de cuatro partes.
- Dato: de cada 100 leads de una cohorte cerrada, cuántos llegan a venta (respetando 2.1); reparto de miembros entre las 3 audiencias.

**C. Contribución de los 5 componentes al índice de oportunidad** · Sirve con condiciones.
- Si el índice es una suma ponderada, una barra horizontal partida en sus 5 aportes, en puntos que suman el índice, debajo del bullet graph (asumo que es aditivo; hay que verificarlo en el generador). El FT recomienda la cascada cuando algún componente es negativo (confirmé).
- Cuándo no: si el índice no es aditivo (un máximo, un producto, un percentil). Dibujar aportes que no suman sería mentir (se deduce).

**Marimekko: no sirve aquí.** Codifica en área y en ancho a la vez (ya establecido en la investigación de referencia que el área es de las peores codificaciones); Datawrapper lo presenta como una forma para «challenge» al lector (confirmé). El dato que tentaría a usarlo es inversión por canal y audiencia (5 por 3): va mejor como mapa de calor de 15 celdas con la cifra escrita, o como small multiples de barras (se deduce).

### 3.4 Distribución (cómo se reparten los valores)

**A. Beeswarm o franja de puntos** · Sirve con condiciones.
- Respaldo: Wilke dice que las franjas de puntos están bien «as long as we make sure that we don't plot too many points on top of each other», y el sina plot reparte los puntos en proporción a su densidad (confirmé, *Fundamentals of Data Visualization*, cap. 9). Matejka y Fitzmaurice (CHI 2017) generan conjuntos con la misma media, desviación y correlación que se ven distintos (confirmé en el resumen de búsqueda), y Wilke muestra un caso en que la caja oculta una distribución bimodal (confirmé). Por eso conviene mostrar cada punto y no solo un resumen.
- Ejemplo: `@d3/beeswarm/2` en Observable (confirmé que existe). NYT, «Four Ways to Slice Obama's 2013 Budget Proposal» (13/02/2012): confirmé el título y la fecha; que sea un gráfico de burbujas acomodadas por fuerza, pariente del beeswarm, es de memoria (asumo).
- Cuándo no: con miles de puntos, porque el acomodo ya no entra (asumo el rango de 30 a 300 por fila; viene de guías secundarias). Con 540 días por canal hay que pasar a semanas (unos 78 puntos por canal) (se deduce).
- Dato: CPL semanal por canal (5 filas); conversiones por campaña; menciones por hashtag.

**B. Histograma o franja con la mediana marcada** · Sirve. Es la opción por defecto cuando hay una sola distribución (FT: «The standard way to show a statistical distribution»; confirmé).

**C. Ridgeline** · Sirve con condiciones; no es primera opción en esta demo.
- Respaldo: Wilke dice que «scale to very large numbers of distributions» y que funcionan bien para tendencias de distribuciones en el tiempo; advierte que el propósito «is not to show specific density values» y desaconseja los histogramas superpuestos (confirmé).
- Ejemplo: `@d3/ridgeline-plot` y `@observablehq/plot-ridgeline` en Observable (confirmé que existen).
- Cuándo no: aquí. La curva de densidad es un suavizado, y en la investigación de referencia ya se estableció no dibujar valores que nadie midió; con pocas distribuciones (5 canales, 6 competidores) la franja de puntos muestra lo mismo sin estimar nada (se deduce). La distribución de conversiones por hora y día ya la cubre el mapa de calor.
- Dato que lo justificaría: el sentimiento semanal de 6 competidores, si la pregunta es «quién tiene un sentimiento más disperso».

### 3.5 Relación (cómo se mueve una medida con otra)

**Base ya establecida en la investigación de referencia:** dispersión con rótulo directo, líneas de referencia y escala logarítmica declarada.

**A. Connected scatter (dispersión conectada)** · Sirve con condiciones.
- Respaldo: Haroz, Kosara y Franconeri (2016) encontraron que las de baja complejidad «can be understood with little explanation» y que los lectores las miran primero más que el gráfico de doble eje; el error dominante fue invertir la dirección del tiempo, aun con flechas, y los participantes casi no usaron lenguaje de correlación (confirmé, leí el PDF). Sus pautas: «Give salient cues for the flow of time», recordar la orientación del eje horizontal y anotar (confirmé).
- Ejemplo: NYT, «Driving Shifts Into Reverse», Hannah Fairfield, 02/05/2010: millas por persona contra precio de la gasolina, un punto por año y anotaciones por época (confirmé, vi la imagen publicada). Ojo: usa curvas suavizadas entre puntos, que en la investigación de referencia se descartaron; se copia la idea, no la curva (se deduce).
- Condiciones: un canal por gráfico o como máximo tres; unos 18 puntos mensuales; rectas entre puntos; año o mes escrito en varios puntos; inicio y fin marcados; una frase que diga la relación («cada sol extra en Meta compró leads más caros desde junio») (se deduce).
- Cuándo no: si el mensaje es la correlación (Haroz y otros dicen que el doble eje la hace más visible, pero el doble eje ya se descartó en la investigación de referencia; entonces va una dispersión simple con recta de referencia), o si la trayectoria da vueltas sin patrón (se deduce).
- Dato: inversión mensual contra CPL por canal (rendimientos decrecientes); share of voice contra sentimiento de la marca propia, mes a mes.

**B. Small multiples de dispersión, uno por canal, con ejes comunes** · Sirve con condiciones: ejes iguales en todos los paneles y un solo color (skill dataviz: máximo tres colores categóricos en dispersión; confirmé).

### 3.6 Flujo (recorrido del lead, origen y destino)

Ver 2.1. En resumen: `Etapas` (ya establecido en la investigación de referencia) para el conteo del mes; **curvas de conversión acumulada por cohorte** para «cuánto convierte cada cohorte y en cuánto tiempo»; **parallel sets** para fuente por dispositivo por conversión en web. Sankey solo con cohorte cerrada seguida por ID y nodo «aún abierto».

### 3.7 Ranking que cambia

**A. Bump chart** · Sirve con condiciones.
- Respaldo: no encontré un estudio de percepción propio del bump chart (asumo que no lo hay con ese recorte). La guía de Datawrapper: «Use a bump chart if ranking is important», y advierte que «Reducing data to rankings can sometimes be misleading»; sugiere poner la mayoría de líneas en gris y resaltar pocas (confirmé).
- Ejemplo: Datawrapper, «Your favorite chart type is more flexible than you think» (Tanikawa, 07/10/2021), ranking de tipos de gráfico por año (confirmé); `@observablehq/plot-bump-chart` (confirmé que existe).
- Condiciones: periodos mensuales, no semanales: con share of voice semanal de 6 competidores, dos marcas con valores casi iguales se cruzarían cada semana por ruido, y el gráfico contaría cambios que no existen (se deduce). La marca propia en el color de acento y el resto en gris. El valor (no solo la posición) se escribe al final de cada línea.
- Cuándo no: cuando la distancia importa más que el orden («somos segundos, pero a un punto del primero»); ahí va una línea de valores.
- Dato: ranking de share of voice de los 5 o 6 competidores ficticios por mes; ranking de keywords por interés de búsqueda.

**B. Slope chart** · Sirve con condiciones.
- Respaldo: el FT lo da para rankings («Perfect for showing how ranks have changed over time») y para el cambio, «as long as the data can be simplified into 2 or 3 points without missing a key part of story» (confirmé). Datawrapper: «a line chart where everything between the first and last date has been erased» (confirmé). No encontré un estudio de percepción propio (asumo).
- Ejemplo: `@d3/slope-chart/3` en Observable (confirmé que existe); el tutorial de Datawrapper (confirmé).
- Condiciones: las puntas son promedios de un periodo (por ejemplo, primer trimestre contra último) y no un día suelto; 8 líneas como máximo, con rótulo directo (se deduce).
- Cuándo no: si el camino entre puntas tuvo un pico o una caída que es la historia.
- Dato: share of voice o sentimiento de cada competidor, inicio contra fin del periodo; CPL por canal, primer contra último trimestre.

### 3.8 Desviación contra una meta

**Base ya establecida en la investigación de referencia:** bullet graph con la meta dibujada y el estado escrito; la desviación escrita en porcentaje.

**A. Barras divergentes de desviación porcentual contra la meta** · Sirve.
- Respaldo: el FT define la desviación como variaciones respecto de un punto fijo que «can also be a target» (confirmé). Posición y largo desde un cero común (ya establecido en la investigación de referencia).
- Ejemplo: `@d3/diverging-bar-chart/2` en Observable (confirmé que existe).
- Condición propia del CPL (se deduce): en el CPL, menos es mejor. El lado de la barra debe significar «mejor que la meta» o «peor que la meta», no «más» o «menos», y eso tiene que estar escrito en el eje. El color sigue al estado, no al signo.
- Dato: desviación del CPL de cada canal contra su meta (5 barras ordenadas).

**B. Línea real contra meta con el área entre ambas rellena (difference chart)** · Sirve con condiciones.
- Respaldo: el FT la llama «surplus/deficit filled line» y dice que el sombreado muestra el balance contra una línea base o entre dos series (confirmé).
- Ejemplo: `@d3/difference-chart/2` en Observable (confirmé que existe).
- Condiciones: un canal por gráfico (o small multiples); la meta tiene que existir para todo el periodo; si cambió, la línea escalonada muestra el cambio (se deduce).
- Dato: CPL semanal contra meta de CPL por canal, en el tiempo.

### 3.9 Incertidumbre

**Primero, qué es incierto en una demo sintética.** Solo cuatro cosas lo son de verdad (se deduce): la proyección a fin de mes; las tasas con pocos casos (un canal chico con pocas conversiones); el sentimiento estimado sobre una muestra de menciones; y el índice de oportunidad, cuyos pesos son una decisión de modelo. Una banda que no sale de la varianza real del generador es decoración, y en el lenguaje de la investigación de referencia, MIENTE.

**A. Banda de rango alrededor de una proyección (fan chart)** · Sirve con condiciones.
- Respaldo: el FT recomienda el fan chart para «the uncertainty in future projections» (confirmé). La evidencia de lectura es preocupante: en Belia y otros (2005), 473 investigadores mostraron «severe misconceptions» sobre cómo las barras de error se relacionan con la significancia (confirmé en el resumen de PubMed); en el cono de huracanes, lectores no expertos leyeron el ensanchamiento como que la tormenta crecía (Ruginski, Padilla y otros; confirmé solo en citas secundarias). Hullman y otros (2019), sobre 86 estudios, advierten que evaluar estas formas «is complex» y que se suele medir precisión en vez de calidad de la decisión (confirmé en la página del artículo).
- Ejemplo: Academy de Datawrapper, «How to show confidence intervals in Datawrapper line charts», con relleno entre límite inferior y superior (confirmé en el resumen de búsqueda); `@d3/band-chart/2` en Observable (confirmé que existe).
- Condiciones: la banda empieza donde termina el dato real, con una línea vertical que dice «hoy»; dice qué es en palabras («8 de cada 10 cierres simulados caen aquí»), no «IC 80 %»; un tono claro sin bordes (se deduce).
- Cuándo no: sobre datos históricos ya medidos (no hay incertidumbre de medición que mostrar), ni con bandas inventadas.
- Dato: proyección de leads o de inversión a fin de mes; pronóstico de interés de búsqueda para la próxima temporada.

**B. Punto con intervalo (o intervalo en degradé) para tasas con pocos casos** · Sirve con condiciones.
- Respaldo: Correll y Gleicher (2014), con experimentos en línea, encontraron que la codificación de media y error cambia las decisiones, y recomiendan el degradé (transparencia) y el violín frente a la barra con bigotes para inferencia (confirmé, leí el PDF).
- Ejemplo: Academy de Datawrapper sobre intervalos en barras (confirmé en el resumen de búsqueda).
- Condiciones: solo donde el intervalo cambia la lectura (un canal con pocas conversiones cuyo CPL «bueno» puede ser suerte) (se deduce).
- Dato: tasa de conversión y CPL de influencers o TikTok si el volumen es bajo; sentimiento por competidor.

**C. Quantile dotplot (20 puntos, cada uno un resultado igual de probable)** · Sirve con condiciones.
- Respaldo: Kay, Kola, Hullman y Munson (CHI 2016) lo proponen para pantallas chicas, y reportan estimaciones de probabilidad más precisas que con una curva de densidad (confirmé en el resumen de búsqueda; no leí el PDF).
- Cuándo no: para muchas series a la vez. Sirve para una cifra que importa: «¿llegamos a la meta del mes?» (se deduce).
- Dato: probabilidad de cumplir la meta mensual de leads.

### 3.10 Geografía

Ver 2.3: lista ordenada por zona, mapa de teselas iguales con condiciones, mapa de ubicación con puntos del mismo tamaño. Sin coroplético por distrito.

### 3.11 Calendario (día, hora, semana, mes)

**Base ya establecida en la investigación de referencia:** mapa de calor de un tono para hora por día de semana.

**A. Calendar heatmap (un año, días como celdas en semanas)** · Sirve con condiciones.
- Respaldo: Van Wijk y Van Selow (InfoVis 1999) proponen el calendario porque hace evidente si una similitud se debe a la estación, al día de semana o a otra cosa: «such a representation already exists: a calendar» (confirmé, leí el PDF). Ojo: ellos colorean por grupo de días parecidos (categorías), no por magnitud (confirmé). El FT lo da para patrones diarios, semanales y mensuales «at the expense of showing precision in quantity» (confirmé).
- Ejemplo: `@d3/calendar/2` y `@observablehq/plot-calendar` en Observable (confirmé que existen).
- Condiciones: para encontrar días (picos, feriados, campañas), no para leer cifras; la cifra del día va en el detalle; un tono, escala visible (se deduce).
- Dato: leads diarios totales en los 18 meses (dos bloques de año); conversiones diarias de un canal en campaña.

**B. Cycle plot (subseries por día de la semana o por mes)** · Sirve con condiciones.
- Respaldo: Robbins (2008) muestra que el cycle plot conserva la comparación entre días de la semana y además deja ver la tendencia de cada día, que un gráfico de una línea por semana esconde; Cleveland, Dunn y Terpenning lo introdujeron en 1978 para el componente estacional (confirmé, leí el PDF).
- Ejemplo: el artículo de Robbins en Perceptual Edge, con ventas por día de semana y visitas mensuales a un museo (confirmé).
- Condiciones: por día de semana sí (78 semanas dan 78 puntos por día); por mes, no con 18 meses: la mitad de los meses tiene dos observaciones y la otra mitad una, así que «la estacionalidad» sería ruido o lo que el generador puso a propósito (se deduce).
- Dato: CPL o leads por día de la semana a lo largo del periodo.

**C. Estacionalidad mensual: barras de los 12 meses con el dato de cada año marcado, y el aviso de cuántos años sostienen cada barra** · Sirve con condiciones (se deduce). Si el generador impone una estacionalidad, mostrarla como hallazgo a un posible cliente es circular: se ve lo que se programó. Hay que rotularla como dato de demostración.

### 3.12 Transversal: anotaciones en el propio gráfico

**Sirve, y en una demo que se presenta es casi obligatoria.**
- Respaldo: Stokes, Setlur, Cogley, Satyanarayan y Hearst (IEEE VIS 2022), con 302 participantes, encontraron que «heavily annotated charts were not penalized» y que los lectores preferían el gráfico con más anotaciones; el texto que describe relaciones o estadísticas produjo más conclusiones de ese tipo que el que describe la codificación, y «some kinds of information are best placed in the title», otras cerca del dato (confirmé en la página del artículo). Borkin y otros (2015), con seguimiento ocular de 33 participantes, sostienen que «titles and supporting text should convey the message of a visualization» (confirmé en la página).
- Ejemplo: NYT, «Driving Shifts Into Reverse» (2010), con una anotación por época (confirmé, vi la imagen). Datawrapper llama a las anotaciones «one of the most important elements you can add to your chart or map» (confirmé, Lokhov, 01/11/2024).
- Encaje con la investigación de referencia: no contradice «no leas el gráfico». Stokes y otros miden que rinde más el texto que dice la relación («el CPL de TikTok bajó tras cambiar la creatividad») que el que describe la codificación («la línea azul es TikTok») (se deduce).
- Condición que pesa más: con filtros, una anotación escrita a mano deja de ser cierta cuando cambia el rango. Las anotaciones de evento salen de una tabla de eventos y se dibujan solo si el evento cae en el rango visible (se deduce; aplica la regla de la investigación de referencia de que un texto debe ser cierto en todos los estados).
- Cuándo no: en gráficos chicos donde la anotación tapa el dato; ahí va al pie del bloque.

---

## 4. Veredicto por candidata

| Candidata | Veredicto | Condición o razón | Dato de la demo |
|---|---|---|---|
| Slope chart | Sirve con condiciones | Puntas = promedios de periodo, 8 líneas como máximo, rótulo directo; no si el camino es la historia | SOV o sentimiento por competidor, inicio contra fin |
| Bump chart | Sirve con condiciones | Mensual, no semanal; marca propia resaltada, resto en gris; valor escrito al final | Ranking de SOV de competidores; ranking de keywords |
| Dumbbell (range plot) | Sirve | Dos momentos; si una punta es la meta, va bullet graph | CPL mes anterior contra actual; ocupación hace un año contra hoy |
| Small multiples con eje común | Sirve | Eje común si la pregunta es de nivel; un color más gris; agregar a semana | Leads o CPL por canal; ocupación por sede; keywords |
| Horizon chart | No sirve aquí | Estudiado con lectores entrenados; más lento en la tarea más simple; ventaja solo bajo 24 px | (Keywords: usar small multiples o mapa de calor) |
| Ridgeline | Sirve con condiciones (no es primera opción) | Densidad suavizada choca con «no inventar valores»; con pocas distribuciones gana la franja de puntos | Sentimiento semanal por competidor, si la pregunta es la dispersión |
| Beeswarm | Sirve con condiciones | Unos 30 a 300 puntos por fila; agregar a semana; mediana marcada | CPL semanal por canal; conversiones por campaña |
| Calendar heatmap | Sirve con condiciones | Para encontrar días, no para leer cifras; un tono, escala visible | Leads diarios en 18 meses |
| Waffle | Sirve con condiciones (ya en la investigación de referencia) | Enteros, 4 partes como máximo, uno por bloque, cohorte cerrada | De cada 100 leads de una cohorte; reparto por audiencia |
| Marimekko | No sirve aquí | Área y ancho a la vez; Datawrapper lo da para «challenge» al lector | (Canal por audiencia: mapa de calor de 15 celdas) |
| Sankey o alluvial del lead | No sirve con cohortes por fecha; sirve con condiciones con cohorte cerrada por ID | Necesita conservación de flujo; nodo «aún abierto»; fecha de corte escrita | Recorrido de una cohorte de entrada |
| Parallel sets (alluvial de categorías) | Sirve con condiciones | Tabla cruzada de las mismas sesiones; 3 ejes como máximo | Fuente por dispositivo por conversión web |
| Connected scatter | Sirve con condiciones | 1 a 3 series, unos 18 puntos, rectas, fechas escritas, inicio y fin marcados, frase que diga la relación | Inversión contra CPL por canal, mes a mes |
| Bandas de incertidumbre | Sirve con condiciones | Solo con varianza real del generador; solo hacia adelante; explicada en palabras | Proyección a fin de mes |
| Anotaciones en el gráfico | Sirve | Generadas desde una tabla de eventos, ciertas en todo rango filtrado | Lanzamientos de campaña, feriados, cambios de meta |
| Mapa de teselas o hexágonos | Sirve con condiciones (cuadrados, no hexágonos) | Nombre y cifra en cada tesela; disposición revisada contra mapa real; no es la vista principal | Ocupación y nuevos por sede |
| Cartograma contiguo | No sirve aquí | Lento de leer, deforma formas conocidas; 12 puntos no son un territorio | |
| Coroplético por distrito | No sirve aquí | Ate pesa unas 25 veces Lince por área; la sede es un punto | |

---

## 5. La mejor objeción y cuándo esto estaría equivocado

**Objeción de un escéptico competente:** «Una demo para clientes tiene que impresionar. Si todo es líneas y barras, se ve como cualquier dashboard; las formas raras (sankey, horizon, connected scatter) son las que hacen que el cliente recuerde la demo. Haroz y otros midieron justamente que la gente mira primero el connected scatter.»

**Respuesta:** tiene parte de razón y se incorporó: el connected scatter queda como forma con condiciones porque está medido que atrae la mirada *y* se entiende con poca explicación (Haroz y otros, 2016; confirmé). Borkin y otros (2015) también encuentran que lo memorable suele comunicar bien (confirmé en el resumen). Pero la memorabilidad no rescata una forma que miente (sankey con cohortes) ni una que el lector no decodifica sin práctica (horizon). Lo que se recuerda de una demo de inteligencia de marketing es una conclusión dicha con su cifra, y eso lo dan las anotaciones (Stokes y otros, 2022), no la rareza (se deduce). La regla práctica: **una forma poco común por pantalla como máximo, y solo si su pregunta no se responde igual de bien con una común.**

**Esto estaría equivocado si:**

1. El público de la demo resulta ser analistas que ya leen horizon charts o sankeys a diario. Señal temprana: en la primera presentación piden más densidad o preguntan por la forma de la herramienta que usan. Ahí el horizon vuelve a ser candidato.
2. El generador sintético sí guarda un ID por lead y un estado por fecha. Entonces el sankey de cohorte cerrada pasa de «con condiciones» a buena opción para la pregunta del recorrido. Señal temprana: el esquema del generador tiene una tabla de eventos por lead.
3. Las sedes del generador nuevo se reparten de forma pareja por Lima. Entonces el mapa de ubicación gana peso frente a la lista. Señal temprana: la cuenta por zona de la sección 2.3 deja de tener una zona dominante.

**Límites de la evidencia:** varias formas (slope, bump, dumbbell, beeswarm, calendar) no tienen un estudio de percepción propio que yo haya encontrado; su respaldo es el principio general ya establecido en la investigación de referencia más guías de redacciones (FT, Datawrapper). Los estudios de horizon y connected scatter usan estudiantes universitarios o trabajadores de Mechanical Turk, no ejecutivos de marketing en una reunión (confirmé el perfil de participantes en los tres PDF).

---

## 6. Tabla resumen

| Pregunta | Forma recomendada | Alternativa | Cuándo no |
|---|---|---|---|
| Evolución | Línea (la investigación de referencia); con más de 3 series, small multiples con eje común, uno resaltado | Línea indexada a base 100 | Escalas independientes si la pregunta es de nivel; datos diarios sin agregar |
| Comparación | Dot plot o barras (la investigación de referencia), una lista con barras por bloque | Dumbbell para dos momentos | Dot plot cuando el lector necesita leer proporciones desde cero |
| Parte de un todo | Franja de proporción o retícula (la investigación de referencia) | Barras 100 % por mes; aportes al índice si es aditivo | Más de 5 partes; marimekko; aportes si el índice no suma |
| Distribución | Franja de puntos o beeswarm, mediana marcada | Histograma | Miles de puntos sin agregar; ridgeline con pocas distribuciones |
| Relación | Dispersión (la investigación de referencia) | Connected scatter, 1 a 3 series, con tiempo marcado | Si el mensaje es la correlación; trayectorias sin patrón |
| Flujo | `Etapas` (la investigación de referencia) + curvas de conversión por cohorte | Parallel sets para fuente por dispositivo | Sankey con cohortes por fecha de entrada |
| Ranking que cambia | Bump chart mensual, marca propia resaltada | Slope chart con puntas promediadas | Datos semanales con ruido; cuando la distancia importa más que el orden |
| Desviación contra meta | Bullet graph (la investigación de referencia) + barras divergentes en % contra la meta | Línea real contra meta con área entre ambas | Lado de la barra por signo en vez de por «mejor o peor» en el CPL |
| Incertidumbre | Banda solo en la proyección, explicada en palabras | Punto con intervalo para tasas con pocos casos; quantile dotplot para «¿llegamos?» | Bandas sin varianza real; sobre historia ya medida |
| Geografía | Lista ordenada agrupada por zona | Teselas iguales con nombre y cifra; mapa de ubicación con puntos iguales | Coroplético por distrito; círculos proporcionales; cartograma contiguo |
| Calendario | Hora por día de semana en mapa de calor (la investigación de referencia) | Calendar heatmap para encontrar días; cycle plot por día de semana | Cycle plot mensual con 18 meses; leer cantidades en el calendario |
| (Transversal) | Anotaciones que dicen la relación | Título que dice la conclusión | Anotaciones fijas que dejan de ser ciertas al filtrar |

---

## 7. Fuentes

Estudios (leí el PDF completo, salvo que se indique otra cosa):

- Heer, J., Kong, N. y Agrawala, M. (2009). Sizing the Horizon. CHI 2009. https://idl.uw.edu/papers/horizon · PDF: https://idl.cs.washington.edu/files/2009-TimeSeries-CHI.pdf
- Javed, W., McDonnel, B. y Elmqvist, N. (2010). Graphical Perception of Multiple Time Series. IEEE TVCG 16(6). https://cs.au.dk/~elm/pdf/multilinevis.pdf
- Haroz, S., Kosara, R. y Franconeri, S. (2016). The Connected Scatterplot for Presenting Paired Time Series. IEEE TVCG 22(9). https://eagereyes.org/publications/Haroz-TVCG-2016 · PDF: https://media.eagereyes.org/papers/2016/Haroz-TVCG-2016.pdf
- Ondov, B., Jardine, N., Elmqvist, N. y Franconeri, S. (2018, publicado en TVCG 2019). Face to Face: Evaluating Visual Comparison. https://cs.au.dk/~elm/pdf/face2face.pdf
- Correll, M. y Gleicher, M. (2014). Error Bars Considered Harmful. IEEE TVCG. https://graphics.cs.wisc.edu/Papers/2014/CG14/Preprint.pdf
- Van Wijk, J. y Van Selow, E. (1999). Cluster and Calendar based Visualization of Time Series Data. InfoVis 1999. https://www.win.tue.nl/~vanwijk/clv.pdf
- Robbins, N. (2008). Introduction to Cycle Plots. Perceptual Edge. https://www.perceptualedge.com/articles/guests/intro_to_cycle_plots.pdf
- Nusrat, S., Alam, M. J. y Kobourov, S. (2015). Evaluating Cartogram Effectiveness (leído en ar5iv). https://arxiv.org/abs/1504.02218

Estudios leídos en su página o resumen:

- Stokes, C. y otros (2022). Striking a Balance. IEEE VIS 2022. https://virtual.ieeevis.org/year/2022/paper_v-full-1024.html
- Borkin, M. y otros (2015). Beyond Memorability. IEEE TVCG. https://vcg.seas.harvard.edu/publications/20150101-beyond-memorability-visualization-recognition-and-recall
- Hullman, J. y otros (2019). In Pursuit of Error. IEEE TVCG. https://idl.uw.edu/papers/uncertainty-eval-survey
- Dahnert, M. y otros (2019). Looking beyond the horizon. arXiv. https://arxiv.org/abs/1906.07377
- Kay, M., Kola, T., Hullman, J. y Munson, S. (2016). When(ish) is My Bus? CHI 2016 (solo resumen de búsqueda). https://idl.uw.edu/papers/when-ish-is-my-bus
- Belia, S. y otros (2005). Researchers Misunderstand Confidence Intervals and Standard Error Bars (solo resumen de búsqueda). https://pubmed.ncbi.nlm.nih.gov/16392994/
- Kosara, R., Bendix, F. y Hauser, H. (2006). Parallel Sets (solo resumen de búsqueda). https://www.tableau.com/research/publications/parallel-sets-interactive-exploration-and-visual-analysis-categorical-data
- Matejka, J. y Fitzmaurice, G. (2017). Same Stats, Different Graphs. CHI 2017 (solo resumen de búsqueda). https://doi.org/10.1145/3025453.3025912
- Calvo, Cucchietti y Pérez-Montoro, sobre mapas estáticos y tile grid maps (solo resumen de búsqueda). https://diposit.ub.edu/dspace/bitstream/2445/201822/1/738542.pdf
- Wilke, C. Fundamentals of Data Visualization, cap. 9. https://clauswilke.com/dataviz/boxplots-violins.html

Guías de redacciones y ejemplos publicados:

- Financial Times, Visual Vocabulary (contenido del póster en el README). https://github.com/Financial-Times/chart-doctor/tree/master/visual-vocabulary
- NYT, «Driving Shifts Into Reverse» (Fairfield, 2010). https://archive.nytimes.com/www.nytimes.com/imagepages/2010/05/02/business/02metrics.html
- NYT, «Four Ways to Slice Obama's 2013 Budget Proposal» (2012). https://archive.nytimes.com/www.nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html
- Datawrapper, «A friendly guide to choosing a chart type» (Muth, 2025). https://www.datawrapper.de/blog/chart-types-guide
- Datawrapper, «Charting the corona effect» (Kokkelink, 2020). https://www.datawrapper.de/blog/weekly-chart-governments-during-corona-crisis
- Datawrapper, «New: Small multiple line charts» (2024). https://www.datawrapper.de/blog/small-multiple-line-charts
- Datawrapper, «New: Arrow and Range Plots» (Kokkelink, 2017). https://www.datawrapper.de/blog/new-arrow-and-range-plots
- Datawrapper, «How to create a bump chart». https://www.datawrapper.de/academy/how-to-create-a-bump-chart
- Datawrapper, «Your favorite chart type is more flexible than you think» (Tanikawa, 2021). https://www.datawrapper.de/blog/favorite-popular-chart-types
- Datawrapper, «Introducing Cartograms in Datawrapper» (Muth, 2018). https://www.datawrapper.de/blog/cartograms
- Datawrapper, mapa base de hexágonos de EE. UU. https://www.datawrapper.de/basemaps/usa-states-hexagons
- Datawrapper, «New: Annotations in bar, range, and dot charts» (Lokhov, 2024). https://www.datawrapper.de/blog/annotations-in-bar-charts
- Datawrapper Academy, intervalos de confianza en líneas. https://www.datawrapper.de/academy/how-to-show-confidence-intervals-in-datawrapper-line-charts
- Observable Plot, marca waffle. https://observablehq.com/plot/marks/waffle
- Observable (galería de D3 y Plot; existencia confirmada vía la API): https://observablehq.com/@d3/horizon-chart/2 · https://observablehq.com/@d3/ridgeline-plot · https://observablehq.com/@d3/calendar/2 · https://observablehq.com/@d3/beeswarm/2 · https://observablehq.com/@d3/sankey-component · https://observablehq.com/@d3/parallel-sets · https://observablehq.com/@d3/marimekko-chart · https://observablehq.com/@d3/slope-chart/3 · https://observablehq.com/@observablehq/plot-bump-chart · https://observablehq.com/@d3/band-chart/2 · https://observablehq.com/@d3/difference-chart/2 · https://observablehq.com/@d3/diverging-bar-chart/2 · https://observablehq.com/@d3/index-chart/2 · https://observablehq.com/@d3/stacked-normalized-horizontal-bar · https://observablehq.com/@observablehq/plot-arrow-variation-chart

Contexto de Lima y flujo:

- Wikipedia, List of districts of Lima (superficies). https://en.wikipedia.org/wiki/List_of_districts_of_Lima
- Infobae, «Qué es Lima Moderna y qué distritos la conforman» (2022; solo resumen de búsqueda). https://www.infobae.com/america/peru/2022/07/20/que-es-lima-moderna-y-que-distritos-la-conforman/
- Wikipedia, Sankey diagram. https://en.wikipedia.org/wiki/Sankey_diagram
- Mixpanel, Funnels Advanced Concepts (solo resumen de búsqueda). https://docs.mixpanel.com/docs/reports/funnels/funnels-advanced
