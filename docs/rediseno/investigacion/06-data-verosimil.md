# 06. Data verosímil para la demo de «The Algorithm»

Fecha de la investigación: 14/10/2026. Repo revisado en solo lectura: `/home/user/Reset-The-Algorithm` (`src/data/mockData.js`, `src/data/config.js`, más búsquedas puntuales en `src/components` y `src/data/keywords.js`).

Etiquetas: **confirmé** (verificado contra fuente o ejecutando), **se deduce** (inferido de lo confirmado), **asumo** (no comprobado).

Encargo vigente: la marca del cliente demo es ficticia y los competidores son marcas reales. Este informe sigue esa corrección del coordinador.

---

## 0. Respuesta corta

1. **«FitZone» no sirve como nombre ficticio**: existe un gimnasio «Gimnasio Fit Zone» en Instagram (@gimnasiofitzone) y un producto de software para gimnasios llamado «Virtuagym FitZone™» (confirmé). Propongo **Vitalto** como primera opción, con Andaro, Kinesta, Movera y Lumbra de respaldo (sección 1).
2. **Sector: recomiendo quedarse en gimnasios** (pregunta abierta para el usuario). Es el único candidato que encaja con el embudo por leads que ya tiene el dashboard, tiene 4 o 5 competidores reales con presencia digital y no choca con la cartera conocida de Reset. Alternativas: cines (mejor riesgo reputacional, embudo de compra en vez de leads) y comida rápida (data más rica por hora, pero cerca de consumo masivo de alimentos).
3. **Dos premisas del encargo no se sostienen con Google Trends**: en Perú «gimnasio» **no** baja en diciembre (índice 1.00, igual a la media anual) y **no** hay patrón «lunes alto, sábado bajo» (la semana es plana, ±3 %). El mes más bajo es junio (0.87). Confirmé esto descargando las series (sección 4.4).
4. **La data actual ya trae afirmaciones falsas sobre marcas reales**: dice que Smart Fit está «sin clases grupales», pero su web lista «Clases grupales con profesores» en los tres planes. También le pone un precio de «S/79-109», cuando la web muestra S/ 89,90 a S/ 129,90 (confirmé el 14/10/2026). Eso es lo que más urge corregir (sección 3).

---

## 1. Nombre ficticio del cliente demo

### 1.1 ¿Existe «FitZone»?

| Búsqueda | Hallazgo | Etiqueta |
|---|---|---|
| «FitZone gimnasio Perú» (web) | Ninguna cadena con ese nombre en prensa de negocios peruana | confirmé |
| «"Fit Zone" … Perú gimnasio instagram» | Perfil **@gimnasiofitzone** «Gimnasio Fit Zone», ~2,969 seguidores, último post visible «Estamos cerrados»; ciudad no identificada | confirmé que existe; asumo que puede ser peruano |
| «"FitZone" marca registrada gimnasio» | **Virtuagym FitZone™**, producto de software para gimnasios (business.virtuagym.com/es/fitzone); marca «FIT ZONE» en EE. UU. de Rejuvenate Franchise Corp. (2009, vigencia no verificada) | confirmé |
| Dominios | fitzone.com responde (200); fitzone.pe y fitzone.com.pe no resuelven | confirmé |
| Indecopi (buscador de signos) | No accesible desde este entorno: el proxy devuelve 502 para servicio.indecopi.gob.pe y pss.indecopi.gob.pe | confirmé el bloqueo |

Conclusión (se deduce): el nombre ya está en uso en el mismo rubro y, peor, en un producto de tecnología para gimnasios, que es justo el ángulo «tecnología» con el que la demo vende a FitZone. Conviene cambiarlo.

### 1.2 Cinco candidatos verificados

Método por candidato: búsqueda web con rubro y país, búsqueda web general (instagram/brand/company), y prueba de dominios `.pe`, `.com.pe` y `.com`. Para los dominios usé un control: gestion.pe y smartfit.com.pe sí responden por el mismo proxy, así que un `.pe` que no resuelve se deduce no registrado o sin web activa.

| # | Nombre | Perú (rubro y general) | Fuera de Perú | .pe / .com.pe | .com | Lectura |
|---|---|---|---|---|---|---|
| 1 | **Vitalto** | Sin resultados | Sin resultados (el buscador lo corrige a Veralto, empresa de agua en EE. UU.) | no resuelven | «This website is for sale» | **El más limpio**. «Vital» + «alto» sugiere salud y meta, sirve para gimnasio |
| 2 | **Andaro** | Sin resultados | DJ en Rumania (@djandaro), plaza comercial en Avándaro (México), festival en Italia | no resuelven | redirige (301), sin contenido identificable | Usable; ninguno es fitness ni Perú |
| 3 | **Kinesta** | Sin resultados | Empresa de belleza en Corea (kinesta.co.kr), transporte en Reino Unido, una tipografía | no resuelven | detrás de Cloudflare | Usable para gimnasio; **no** usarlo si el sector termina siendo cosmética |
| 4 | **Movera** | Sin resultados fitness | Mudanzas en Reino Unido (@wearemovera), mayorista de camping en Alemania (movera.com) | no resuelven | Movera Camping Großhandel | Usable; suena a «moverse» |
| 5 | **Lumbra** | Solo una localidad en la región Lima (bamwor.com) | lumbra.com / lumbra.ai: empresa de IA «Intent to Insight» | no resuelven | empresa de IA | Usable pero el último: una empresa de IA con lema de «insight» puede confundirse con el producto de la demo |

Descartados en el camino (confirmé el motivo): **Brío** (Brio Fitness en Missoula, EE. UU., y en Beirut; Brio Spa en resorts Vidanta, México), **Kallpa** (Kallpa Fitness en Ecuador; Kallpa Securities y Asociación Kallpa en Lima), **Vértice** (estudio boutique «Vértice by Ana & Fer» en CDMX), **Ondra** (se asocia al escalador Adam Ondra), **Ritmara** (ritmara.com es una app polaca de ciclismo).

Límite honesto: no pude consultar Indecopi ni la base de marcas de la OMPI (es una aplicación JS). **Antes de publicar la demo con el nombre elegido, alguien debe buscarlo a mano en el buscador de signos de Indecopi** (clases 41 y 44 para gimnasio). Esa es la única verificación que falta y es barata.

---

## 2. Sector para la marca ficticia (pregunta abierta)

### 2.1 Qué sectores quedan fuera por parecerse a clientes de Reset

Cartera pública de Reset (confirmé, notas de prensa de 2025 y 2026): clientes en educación, telecomunicaciones, fintech y banca, automotriz, clínicas, retail de tecnología y consumo masivo de alimentos. Los nombres se omiten en el repo a propósito: esta demo la ven otros clientes.

Se deduce que quedan descartados o con riesgo alto esos mismos sectores. No encontré en fuentes públicas ningún cliente de Reset en gimnasios, cines o comida rápida (se deduce, con la salvedad de que la lista pública es parcial).

### 2.2 Matriz de evaluación

Escala cualitativa (alta, media, baja), con el criterio que la sostiene. Amplitud estacional = mes más alto / mes más bajo del índice mensual de Google Trends Perú 2022-2025, calculado por mí (confirmé con las series descargadas el 14/10/2026; detalle en 4.4).

| Sector | Estacionalidad (Trends) | Geografía Lima | Embudo por leads (encaja con el dashboard actual) | Competidores reales con presencia digital | Parecido a cliente Reset | Riesgo reputacional con marcas reales |
|---|---|---|---|---|---|---|
| **Gimnasios** | Media: 1.43 («gimnasio»), pico en enero | Alta: sedes por distrito, NSE | **Alta**: lead → visita/prueba → alta | 4 a 5 (ver 2.3) | Bajo | Medio-bajo |
| **Cines** | Media-alta: 1.73 («cine»), pico en julio | Alta: complejos en malls | Baja: es compra de entradas, no lead | 6 (ver 2.3) | Bajo | **Bajo** |
| **Comida rápida / QSR** | Media: 1.49 («pollo a la brasa»), picos julio y diciembre | Alta: locales y zonas de delivery | Baja: pedido, no lead | 6 o más (ver 2.3) | Medio (consumo masivo de alimentos, sector de un cliente) | Medio (salud, inocuidad) |
| Inmobiliaria | Media: 1.45 («departamento en venta») | Alta | Alta (lead → visita a sala → separación) | Muchas, fragmentadas | Bajo | Medio (precios, ventas) |
| Seguros | Media: 1.52 («soat») | Baja | Alta | 5 (Rímac, Pacífico, Mapfre, La Positiva, Interseguro: asumo, no verifiqué presencia) | Medio (cerca de banca) | Medio-alto (regulado por SBS) |
| Cosmética | Alta: 1.88 («perfume»), pico nov-dic | Media | Media | Belcorp, Natura, Yanbal (asumo) | Medio (consumo masivo) | Medio |
| Retail de moda | Alta (asumo, no medí) | Alta | Baja | Muchos | Medio (sector de un cliente) | Medio |
| Delivery | Asumo media | Alta | Baja | 2 o 3 (Rappi, PedidosYa; asumo) | Bajo | Medio |
| Aerolíneas low cost | Asumo alta | Baja (rutas, no distritos) | Baja | 3 (LATAM, Sky, JetSMART; asumo) | Bajo | **Alto** (seguridad, reclamos) |
| Telecom, fintech, clínicas | n/a | n/a | n/a | n/a | **Alto** (sectores de clientes actuales) | n/a |

Lectura (se deduce): la estacionalidad no separa mucho a los candidatos (todos entre 1.4 y 1.9). Lo que decide es el embudo: el dashboard ya está construido sobre leads, CPL, pruebas y WhatsApp. Gimnasio e inmobiliaria son los dos sectores que lo usan tal cual. Entre los dos, el gimnasio tiene competidores más nítidos y menos sensibles.

### 2.3 Competidores reales de los tres mejores candidatos

**Gimnasios (Lima)**

| Marca | Presencia y tamaño público | Fuente y fecha | Etiqueta |
|---|---|---|---|
| Smart Fit | ~90 locales en Perú; planes S/ 89,90 (Fit), S/ 99,90 (Smart), S/ 129,90 (Black); smartfit.com.pe | Infomercado y Gestión, 2025; web consultada 14/10/2026 | confirmé |
| Bio Ritmo (grupo Smart Fit) | Segmento premium; segunda sede en Santa Cruz, Miraflores | Revista Economía, 2025-2026 | confirmé |
| b2 | 10 locales al cierre de 2025, 3 aperturas confirmadas para 2026; Infomercado habla de 12 sedes (nota sin fecha) | Gestión, 2026; Infomercado | confirmé (conteo actual sin resolver) |
| KO | 4 locales en Lima, expansión internacional | Gestión, ~fines de 2024 | confirmé (dato de 2024) |
| Mega Force | Sedes en SJL, Los Olivos, Ventanilla, Ate | Nota de la CCL sin fecha | confirmé que la nota existe; vigencia no verificada |

Problemas con los competidores que usa hoy la demo:
- **Sportlife**: no encontré evidencia de sedes en Lima. La única nota es de 2014 y habla de un gimnasio corporativo en Arequipa. La demo le asigna 5 sedes y 8 % de participación (confirmé ambos hechos; se deduce que el dato de la demo no tiene sustento).
- **Bodytech** cerró en Perú en julio de 2024 (Gestión, Peru Retail; confirmé). Si la serie empieza antes de esa fecha, no conviene narrarlo.
- **KO**: la demo dice 7 sedes; Gestión dice 4 (confirmé la discrepancia).

**Cines**: Cineplanet, Cinemark, Cinépolis, UVK Multicines, Cinestar y Movie Time participaron en la Fiesta del Cine 2025 (La Cámara, CCL; confirmé). No encontré conteos de salas recientes: los de Apoyo & Asociados son de 2017-2018 (confirmé que son viejos).

**Comida rápida**: KFC, Pizza Hut, Bembos, McDonald's (Arcos Dorados), Papa John's (70 tiendas, Infomercado, inicios de 2025; confirmé), Popeyes, Burger King. Los conteos por cadena de Mapcity son de hace más de una década (confirmé que no hay dato 2025 por cadena salvo Papa John's).

### 2.4 Recomendación (sin decidir)

Me quedaría en **gimnasios** con la marca renombrada, por dos razones:
1. **Encaje con el producto**: el embudo lead → prueba → alta, el CPL y las sedes por distrito ya están en las cuatro capas del dashboard. Cambiar a cines o QSR obliga a rediseñar KPIs (de CPL a costo por compra o ticket promedio).
2. **Riesgo bajo de parecerse a un cliente**: no hay gimnasio en la cartera pública de Reset.

Lo que juega en contra, y conviene que el usuario lo pese: el mercado está muy concentrado (Smart Fit y Bio Ritmo son el mismo grupo), así que con marcas reales cualquier dato de muestra cae casi siempre sobre la misma empresa. Una cadena ficticia de 12 sedes queda del tamaño de b2, lo cual es verosímil (se deduce de los conteos de 2.3).

Si el usuario prioriza riesgo reputacional mínimo sobre encaje con el dashboard, **cines** es la mejor alternativa.

---

## 3. Qué mostrar de una marca real con data de muestra

### 3.1 Marco que encontré

- **D. Leg. 1044, Ley de Represión de la Competencia Desleal** (texto en vLex; confirmé las citas, no las cotejé con El Peruano):
  - Art. 2: se aplica a actos «cuyo efecto o finalidad, de modo directo o indirecto, sea concurrir en el mercado».
  - Art. 11 (denigración): actos que tengan como efecto, real o potencial, menoscabar la imagen o reputación de un agente. Art. 11.2: se reputan lícitos solo si «constituyan información verdadera por su condición objetiva, verificable y ajustada a la realidad» (más otros requisitos).
  - Art. 12 (comparación): presentar ventajas de la oferta propia frente a la competidora; lícito solo si cumple el 11.2.
  - La Sala de Indecopi exige alusión directa o indirecta al competidor para configurar denigración o comparación (Res. 0106-2024/SDC, caso Win, vía LP Derecho; confirmé). Un artículo de Foro Jurídico PUCP sostiene que la *exceptio veritatis* hace riesgosa la publicidad comparativa en Perú (confirmé).
- **Decisión 486 de la CAN, art. 157**: permite usar una marca ajena sin permiso si es de buena fe, con fines de identificación o información, sin usarla como marca propia y sin inducir a confusión; el Tribunal Andino la interpreta de forma restrictiva (Asuntos Legales e IUS360; confirmé el resumen, no el texto oficial).
- **CONAR, Código de Ética Publicitaria**: no conseguí el texto vigente. Solo confirmé que existe, que se basa en legalidad, decencia, veracidad y lealtad, y que la versión de 2007 figura como derogada. **No lo cito como regla.**

Se deduce, y no reemplaza la opinión de un abogado:
- Una demo comercial de Reset busca captar clientes en el mercado de agencias, así que podría caer en el ámbito del art. 2.
- Si caen ahí, la data sintética **nunca puede ampararse en la excepción de veracidad**, porque por definición no es verdadera. Por eso **ningún juicio negativo atado a una marca real queda protegido**, aunque diga «muestra».
- Los logos son el uso de marca más expuesto. Escribir el nombre en texto, con fin informativo, es lo más defendible.

### 3.2 Reglas prácticas para el generador y la UI

**Se puede mostrar (con etiqueta «Dato de muestra» visible en el mismo widget, no en un pie de página):**
- Interés de búsqueda relativo y share of search. Mejor aún si se usa la **serie real de Google Trends**, descargada con fecha. Es dato público y verdadero, y elimina el problema de fondo.
- Share of voice en social y volumen de menciones como cifras neutras que sumen 100 % dentro del set (incluyendo «Otros»).
- Datos públicos verificados y fechados: número de sedes con su fuente, precio publicado en la web de la marca con fecha de consulta.

**No mostrar sobre marcas reales:**
- Juicios cualitativos o atributos negativos: «masificación», «máquinas ocupadas», «atención básica», «muy caro», «infraestructura variable», `threat_level`, «capturar usuarios insatisfechos».
- Métricas internas que nadie puede observar desde afuera: market share inventado, ingresos, miembros, sentimiento numérico, CPL o inversión de la competencia.
- Hechos inventados con forma de noticia: la alerta «Smart Fit lanzó promoción "Sin matrícula + 1 mes gratis"» (`mockData.js`, alerta id 2) es una afirmación fáctica falsa sobre una empresa real.
- Logos de terceros.

**Lo que hay hoy en el repo y choca con esto** (confirmé leyendo el código):

| Ubicación | Contenido | Problema |
|---|---|---|
| `mockData.js` `COMPETENCIA` | Smart Fit: debilidades «Masificación», «Sin clases grupales», «Atención básica»; precio «S/79-109»; fortaleza «Sin permanencia» | Su web lista «Clases grupales con profesores», precios de S/ 89,90 a S/ 129,90 y 12 meses de fidelidad en Fit y Black (confirmé, 14/10/2026). **Afirmaciones falsas sobre una empresa real** |
| `mockData.js` `COMPETENCIA` | Sportlife con 5 sedes y 8 %; KO con 7 sedes | Sin sustento (Sportlife) o contradice a Gestión (KO: 4) |
| `mockData.js` `COMPETENCIA` | Bio Ritmo y FitZone ambos con `rank: 3` | Ranking duplicado |
| `mockData.js` `COMPETITOR_INSIGHTS` | `threat_level`, tópicos «máquinas ocupadas», «muy caro», «precio alto» | Juicio negativo sobre marcas reales |
| `mockData.js` `ALERTS` id 2 | Promoción inventada de Smart Fit | Hecho falso |
| `mockData.js` `OPPORTUNITY_SCORE` | «Smart Fit saturando low-cost» | Juicio |
| `DataLayer.jsx:158` | «usuarios insatisfechos con masificación de Smart Fit» | Juicio |
| `DecisionLayer.jsx:40` | «Competir con oferta agresiva de Smart Fit» | Atribuye una conducta inventada |

---

## 4. Benchmarks para calibrar (Perú, luego LatAm, luego global)

Aviso general (confirmé): **no encontré ninguna fuente primaria pública con CPM, CTR, CPC o CPL por plataforma para Perú.** Lo que hay son blogs de agencias con rangos que no coinciden entre sí y que casi nunca dicen de dónde salen. Los uso solo como orden de magnitud. Los benchmarks con metodología (LocaliQ/WordStream) son de anunciantes mayormente de EE. UU. y sirven para ratios (CTR, CVR), no para costos absolutos.

Tipo de cambio de referencia: S/ 3,393 por US$ (cierre BCRP del 23/09/2026, vía TuCambista; confirmé con fuente secundaria). Para la demo conviene fijar uno y declararlo.

### 4.1 Medios pagados

| Canal | Perú | LatAm | Global (EE. UU. mayormente) |
|---|---|---|---|
| **Meta** CPM | US$2-4 ≈ S/ 7,5-15 (Itera, 14/07/2026, atribuido a AdAmigo 2026); blogs peruanos dan S/ 8-25 sin metodología | US$2 (Colombia) a ~US$4 (México); US$2-8 según país (Itera) | CPM Facebook global feb-2025 ~US$10 (blog, no verificado) |
| Meta CTR / CPC / CVR / CPL | Sin fuente | CPC ecommerce ~US$0,67 (Itera, atribuido a 27five) | **Health & Fitness, campañas de leads**: CTR 3,09 %, CPC US$1,84, CVR 7,98 %, CPL US$27,11. Tráfico: CTR 1,86 %, CPC US$0,64 (LocaliQ, actualizado 23/09/2026; período de datos no declarado) |
| **Google Search** | CPC promedio Perú US$0,47 (Statista/Semrush, dic-2024, vía Merca2.0 16/05/2025; todas las categorías) | Colombia 0,58; México 0,66; Chile 0,70 (misma fuente) | **Health & Fitness**: CTR 5,81 %, CPC US$6,17, CVR 6,94 %, CPL US$67,36 (LocaliQ «2026 Search Advertising Benchmarks», actualizado 01/06/2026) |
| **Google Display** | Sin fuente | Sin fuente | CTR 0,46 %, CPC US$0,63 (Focus Digital 2025, pero theadspend dice que esas cifras vienen de WordStream 2018-2019); CPM US$2,80 (blog secundario, sin fuente primaria) |
| **TikTok** CPM | US$3-5 (Itera, 04/06/2026, sin fuente); US$3-8 (agencia de Lima, sin fuente) | US$2-10 (blog 2026) | Mediana US$8,50 (blog 2026) |
| TikTok CTR / CPC | Sin fuente | CPC US$0,40-1,50, CTR 1,5-3 % (Itera, «referencias de agencias», sin nombre) | Sin fuente con metodología |

Hallazgo útil para las reglas (confirmé con aritmética): en la tabla de LocaliQ para Meta, CPC / CVR no da el CPL publicado (1,84 / 0,0798 = US$23,06 frente a 27,11). Se deduce que promedian ratios por anunciante en vez de dividir totales. Es exactamente el error que el generador debe evitar (regla R4).

### 4.2 Landing y embudo

| Métrica | Valor | Fuente | Etiqueta |
|---|---|---|---|
| Conversión de landing, fitness y nutrición | Mediana 4,2 %; percentil 75: 26,8 %; n = 1.367 páginas | Unbounce, página de industria fitness (edición 2020 o 2021, no pude fijarla) | confirmé el dato, año sin confirmar |
| Lead → miembro (gimnasios) | 10-20 % como rango defendible; fuentes de proveedores dan desde 3-6 % hasta 30-50 % | Blogs de proveedores (Glofox, Club OS, Keepme vía terceros) | confirmé que el rango es amplio; ninguna fuente primaria |
| Prueba → miembro | 28-35 % en estudios bien gestionados | Atribuido a Glofox por un tercero | confirmé la cita, no el estudio |
| No-show en citas | ~30 % | Atribuido a Reminderly por un tercero | ídem |
| Perú, cualquier sector | Sin fuente | n/a | confirmé que no hay |

Embudo propuesto para el generador, gimnasio (asumo, anclado a lo de arriba): lead → contacto efectivo 70-85 % → cita o pase de prueba 35-50 % de los contactados → asiste 65-75 % de los citados → alta 30-40 % de los que asisten. Resultado: lead → alta ≈ 8-15 %, dentro del rango de proveedores. Rezago típico: alta a 3-10 días del lead (asumo).

### 4.3 Calibración derivada (no fijar el CPL a mano)

Ejemplo para Meta Lead Ads, gimnasio, Lima (asumo los valores; los anclajes están en 4.1):
CPM S/ 12 · CTR 1,5 % · CVR clic → lead 8 % ⇒ CPC = 12 / (1000 × 0,015) = **S/ 0,80** ⇒ CPL = 0,80 / 0,08 = **S/ 10** (confirmé la aritmética).
La demo actual tiene CPL «$11,20» en dólares, ≈ S/ 38. Es verosímil solo si se lee como costo por **lead calificado** o por prueba (se deduce). Conviene pasar todo a soles.

### 4.4 Estacionalidad, día de la semana y hora (Google Trends, descargado el 14/10/2026)

Método (confirmé ejecutando): API pública de Trends, término «gimnasio», geo PE, zona horaria de Lima. El índice mensual es cada mes dividido entre la media de su año, promediado 2022-2025. El índice semanal es cada día dividido entre su media móvil centrada de 7 días.

**Mensual, «gimnasio» (media anual = 1,00)**

| Ene | Feb | Mar | Abr | May | Jun | Jul | Ago | Set | Oct | Nov | Dic |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1,24 | 1,14 | 1,01 | 0,89 | 0,93 | **0,87** | 0,96 | 1,08 | 0,98 | 0,96 | 0,94 | 1,00 |

- Enero es el pico los cuatro años (rango 1,19-1,28; confirmé).
- **Diciembre no es bajo** (rango 0,91-1,06). El valle es abril-junio, el invierno limeño (se deduce la causa, no la comprobé).
- Agosto 2024 tiene un pico anómalo (100, el máximo de la serie) que no expliqué.
- La marca «smart fit» se comporta distinto: diciembre 1,53 y julio 1,26, con mayo como valle (0,73). Se deduce que responde a promociones de la marca, no a demanda de categoría.

**Día de la semana**: «gimnasio» 2025: lun 1,00 · mar 0,98 · mié 1,00 · jue 0,99 · vie 0,99 · sáb 1,07 · dom 0,98. En 2024 (ene-ago) sale igual de plano. **No hay «lunes alto, sábado bajo» en búsquedas** (confirmé). En cambio, «smart fit» 2025 sube el fin de semana (sáb 1,36, dom 1,20) y baja de martes a viernes (0,82-0,90).

**Feriados**: en «gimnasio» la búsqueda **sube** en casi todos los feriados de 2025 (Jueves Santo 1,40; 1 de mayo 1,24; 7 de junio 1,24; 28 de julio 1,17; 8 de diciembre 1,17). Baja en Navidad (0,86), Año Nuevo 2026 (0,92) y 31 de diciembre (0,88) (confirmé). Se deduce que la gente busca horarios de atención en feriado. Para leads y conversiones no tengo dato: asumo que bajan en feriado, al revés que la búsqueda.

**Hora**: solo hay datos horarios para los últimos 7 días, son muestreados y a las 4 a. m. dan 0 por umbral de volumen. **No concluyente** (confirmé la limitación). Para la ocupación de sedes por hora (picos de 6 a 8 a. m. y de 6 a 9 p. m.) no encontré fuente: asumo.

**Para el generador** (se deduce): usar el índice mensual de arriba para la demanda orgánica y para el volumen de búsqueda. Para pauta, dejar que la inversión siga la demanda (más presupuesto en enero y febrero) y que el CPM suba en enero y en noviembre-diciembre por competencia en subasta (asumo, sin fuente).

### 4.5 Dispositivos

StatCounter, Perú, setiembre 2026: móvil 51,63 %, escritorio 47,65 %, tableta 0,71 % (confirmé). Ojo: mide páginas vistas de toda la web, no tráfico de pauta. Para tráfico que llega desde Meta o TikTok el móvil debería pasar el 90 % (asumo, sin fuente). La demo actual usa 78 / 18 / 4, que es razonable para un sitio con más de la mitad del tráfico pagado (se deduce). Sugiero que el mix salga por canal (social casi todo móvil, búsqueda de marca con más escritorio) y que el total se calcule, no que se fije.

### 4.6 Calendario que debe notarse en la serie

Feriados nacionales (16 por año, D. Leg. 713 y modificatorias). 2026: La República, 05/01/2026 (confirmé; también recalculé los días de la semana). 2025: mismas fechas fijas más la Semana Santa de 2025 (Panamericana; confirmé Semana Santa, 7/6, 28-29/7, 6/8, 30/8, 8/10; se deduce 23/7 y 9/12 por ser fijas).

| Feriado | 2025 | 2026 |
|---|---|---|
| Año Nuevo | mié 1/1 | jue 1/1 |
| Jueves y Viernes Santo | jue 17/4, vie 18/4 | jue 2/4, vie 3/4 |
| Día del Trabajo | jue 1/5 | vie 1/5 |
| Batalla de Arica y Día de la Bandera | sáb 7/6 | dom 7/6 |
| San Pedro y San Pablo | dom 29/6 | lun 29/6 |
| Día de la Fuerza Aérea | mié 23/7 | jue 23/7 |
| Fiestas Patrias | lun 28/7, mar 29/7 | mar 28/7, mié 29/7 |
| Batalla de Junín | mié 6/8 | jue 6/8 |
| Santa Rosa de Lima | sáb 30/8 | dom 30/8 |
| Combate de Angamos | mié 8/10 | jue 8/10 |
| Todos los Santos | sáb 1/11 | dom 1/11 |
| Inmaculada Concepción | lun 8/12 | mar 8/12 |
| Batalla de Ayacucho | mar 9/12 | mié 9/12 |
| Navidad | jue 25/12 | vie 25/12 |

Días no laborables para el sector público (opcionales para el privado): vie 2/5/2025, vie 26/12/2025 y vie 2/1/2026 (DS 042-2025-PCM); lun 27/7/2026 (DS 075-2026-PCM). Confirmé con prensa que cita las normas, no con El Peruano.

Otros eventos que mueven la data (confirmé fechas con prensa):
- Elecciones generales: 12/4/2026 (primera vuelta) y 7/6/2026 (segunda vuelta).
- Cyber Wow 2025: 7-10/4, 14-17/7 y 3-6/11.
- Gratificaciones: se pagan hasta el 15 de julio y el 15 de diciembre (asumo; Ley 27735 de memoria, no verifiqué).

---

## 5. Reglas de coherencia por construcción

### 5.1 Principio

Generar **solo conteos atómicos** en la granularidad más fina: día × canal × campaña × sede (y dispositivo si se muestra). Todo lo demás se **deriva** por suma, y todo ratio sale de **totales**. Nunca se escribe a mano un total, un porcentaje o un «período anterior».

### 5.2 Reglas e invariantes (cada una se comprueba con un test que corre sobre varias semillas)

| # | Regla | Cómo se garantiza por construcción |
|---|---|---|
| R1 | Subconjunto ≤ conjunto (clics ≤ impresiones, leads ≤ clics, citas ≤ leads, altas ≤ asistencias) | Adelgazamiento binomial: `clics ~ Binomial(impresiones, ctr)`, `leads ~ Binomial(clics, cvr)`, etc. Es imposible que el hijo supere al padre |
| R2 | Total = suma de partes (por canal, sede, distrito, dispositivo, fuente) | Los totales no se guardan: se calculan. Para repartir un total ya fijado se usa una multinomial, que suma exacto |
| R3 | Proporciones en [0, 100] y que sumen 100 | Se calculan de conteos. Para mostrar se redondea con el método del mayor residuo, así la suma visible da 100 |
| R4 | CPL = inversión total / leads totales; igual CPC, CPM, CTR, CVR | Funciones `ratio(sumA, sumB)` sobre agregados. Prohibido promediar ratios diarios. Ejemplo real del problema: la tabla de LocaliQ de 4.1 |
| R5 | Frecuencia = impresiones / alcance ≥ 1 y alcance ≤ población objetivo | Alcance con curva de saturación: `alcance = P · (1 − exp(−impresiones / (k · P)))`, con P = población del target y k ≥ 1. Cumple alcance ≤ P y alcance ≤ impresiones |
| R6 | El alcance no se suma entre días ni entre canales | Se calcula por ventana (7 d, 28 d, mes, total) desde impresiones acumuladas. Entre canales: `1 − Π(1 − alcance_i / P)` (supuesto de independencia), que queda entre el máximo y la suma |
| R7 | Duraciones ≥ 0, tasas de rebote en [0, 1] | Duración lognormal; rebote con distribución Beta |
| R8 | Inversión ≤ presupuesto del período | Ritmo diario con ruido lognormal y tope acumulado mensual |
| R9 | Sesiones pagadas ≤ clics | `sesiones = Binomial(clics, 0.75-0.9)` por pérdida de medición (asumo el rango) |
| R10 | Conversiones por distrito suman las altas totales | Hoy no cumple: suman 563 frente a 476 (confirmé, sección 5.4) |
| R11 | Período anterior y año anterior salen de la misma serie | Los deltas se calculan comparando ventanas. Nunca se escribe `previous: 398` |
| R12 | Rankings únicos y SOV que suma 100 con «Otros» | Ranking ordenado sobre el valor; SOV normalizado |
| R13 | Moneda única | Todo en soles. Si se muestra US$, una sola tasa declarada |
| R14 | Censura a la derecha | Los leads de los últimos días todavía no maduran. O se marca la ventana como «en maduración» o se cortan las cohortes inmaduras de los ratios de embudo |
| R15 | Nada después de la fecha final | Assert sobre todas las fechas |

### 5.3 Ruido creíble sin dependencias

- **PRNG con semilla**: `mulberry32` o `sfc32` (unas 10 líneas). **Un stream por entidad**, sembrado con un hash de `semilla|canal|campaña|sede|fecha`. Así, agregar un canal no cambia las series de los demás (se deduce que es lo que da estabilidad entre versiones).
- **Normal**: Box-Muller.
- **Gamma**: Marsaglia-Tsang. Con dos Gamma salen la **Beta** y la **binomial negativa**.
- **Conteos**: binomial negativa como mezcla Gamma-Poisson (`λ' = λ · Gamma(r, 1/r)`, luego Poisson(λ')), con r entre 10 y 50 según el canal (asumo). Poisson por el método de Knuth si λ < 30; si es mayor, aproximación normal redondeada y truncada en 0. Binomial exacta si n es chico; si es grande, aproximación normal acotada a [0, n].
- **Costos y precios**: lognormal con `μ = ln(media) − σ²/2`, para que la media se conserve.
- **Ruido multiplicativo con memoria**: AR(1) en escala log (`e_t = ρ·e_{t−1} + ε`, ρ ≈ 0,6-0,8). Sin esto la serie parece ruido blanco y se nota artificial (asumo).
- **Estructura**: tendencia × estacionalidad mensual (4.4) × día de la semana × feriado × eventos (lanzamientos de campaña como escalón, fatiga creativa como CTR que decae con la frecuencia acumulada, cambios de presupuesto en fechas fijas) × ruido.
- **Atípicos**: pocos y explicables (un viral, un día con caída de tracking), cada uno con su anotación en la data para que el dashboard lo pueda contar.

### 5.4 Incoherencias que ya tiene la data actual

Confirmé importando `mockData.js` con Node y recalculando:

| Dato | Valor en la demo | Recalculado | Regla |
|---|---|---|---|
| CPL | 11,20 | inversión 23.200 / leads calificados 1.850 = **12,54**; / leads totales 2.475 = **9,37** | R4 |
| Share of voice (`COMPETITOR_INSIGHTS`) | suma **105 %** | debe ser 100 | R3 / R12 |
| Market share (`COMPETENCIA`) | suma 89 % sin «Otros» | falta la categoría | R12 |
| Conversiones por distrito | 563 | altas del mes 476 | R10 |
| Formularios de Lead Ads por servicio | 680 frente a 520 leads (Básica), y así en los 6 servicios | el subconjunto supera al conjunto, o están mal definidos | R1 |
| Campañas CRM | 1.440 leads e inversión 19.900 | KPI general: 2.475 leads e inversión 23.200 | R2 |
| CPL de Meta en `BUDGET_ALLOCATION` | «$10.50» | campañas Meta del CRM: 11,81 y 22,11 | R4 |
| Moneda | CPL en US$, precios en S/ | n/a | R13 |
| Coherencias que sí cumple | sesiones por fuente, dispositivo y distrito suman 68.500; frecuencia = 8,5 M / 2,5 M = 3,4 | ok | n/a |

### 5.5 Rango de fechas

Propuesta: **del miércoles 1/1/2025 al miércoles 30/9/2026 (638 días, 21 meses)**, con «hoy» de la demo fijo en 30/9/2026. Confirmé el conteo y los días de la semana.

Por qué 21 y no 18 meses:
- Con 21 meses entran **dos eneros** (el pico de la categoría), dos Semanas Santas, dos Fiestas Patrias y las elecciones de 2026. Así enero 2026 tiene su año anterior para comparar.
- Con 18 meses (abr 2025 a set 2026) el único enero queda sin comparación interanual.

Comparables disponibles:
- Últimos 30 días frente a los 30 anteriores y frente al mismo tramo de 2025.
- Q3 2026 frente a Q2 2026 y frente a Q3 2025.
- Enero a setiembre 2026 frente al mismo período de 2025.

Notas de implementación:
- Fecha final fija, no `Date.now()`. Con semilla y fechas fijas la salida es idéntica en cada build. La UI debe decir «datos de muestra al 30/09/2026».
- Si más adelante se quiere mover el rango, que el generador reciba la fecha final y recalcule feriados por calendario. No desplazar la serie: los feriados cambian de día de la semana.
- La narrativa actual de la demo está fechada en enero de 2026 («Propósito 2026», alertas del 20/01/2026). Con esta propuesta, enero queda como un mes histórico destacado dentro de la serie, no como el «ahora». Es una decisión de guion para el usuario.

---

## 6. Objeción escéptica y respuesta

**Objeción**: «Con benchmarks de EE. UU. y blogs sin metodología, la calibración es tan inventada como la data actual».

**Respuesta**: en parte es cierto, y por eso el informe no propone fijar costos con esas fuentes. Propone dos cosas que sí se sostienen:
1. Fijar los **ratios** (CTR, CVR, proporciones del embudo) dentro de rangos con fuente, y derivar los costos (CPC, CPL) por aritmética desde un CPM peruano de orden de magnitud.
2. Usar **series reales** donde existen (Google Trends) para lo estacional.

El verosímil que importa en una demo es la coherencia interna, y esa se puede garantizar por construcción. La precisión externa de un CPM peruano no se puede garantizar con fuentes públicas.

## 7. Cuándo esto estaría equivocado

- **Nombres**: si Vitalto (u otro candidato) aparece registrado en Indecopi en las clases 41 o 44. La señal temprana es la búsqueda manual en el buscador de signos, que no pude hacer.
- **Sector**: si Reset tiene o negocia hoy un cliente de gimnasios que no sale en prensa. La señal temprana es preguntar a cuentas antes de cerrar.
- **Estacionalidad**: Trends mide interés relativo de búsqueda, no leads ni altas. Si la data real de un gimnasio mostrara leads planos en enero, el índice no serviría para leads. La señal sería comparar con cualquier cuenta real de la categoría que Reset tenga a mano.

## Fuentes principales

- Gestión, b2 ampliará su red en 2026: https://gestion.pe/economia/empresas/gimnasios-b2-ampliara-su-red-en-2026-con-nuevas-sedes-en-lima-y-su-primera-operacion-en-provincias-noticia/
- Infomercado, Smart Fit 2025: https://infomercado.pe/smart-fit-proyecta-crecer-23-en-2025-y-abre-el-camino-al-fitness-premium-con-bio-ritmo/
- Gestión, salida de Bodytech: https://gestion.pe/economia/empresas/bodytech-se-despide-del-peru-que-pasara-con-sus-afiliados-empresas-gimnasios-smart-fit-noticia/
- Gestión, KO: https://gestion.pe/economia/empresas/ko-continua-con-su-expansion-internacional-cual-es-su-proximo-destino-fitness-gimnasios-yoga-eeuu-miami-lima-noticia/
- Peru Retail, Sportlife Arequipa (2014): https://www.peru-retail.com/sportlife-apuesta-por-los-gimnasios-corporativos-en-arequipa/
- CCL, Mega Force: https://lacamara.pe/gimnasios-mega-force-tu-opcion-para-iniciar-una-rutina-de-ejercicios/
- Smart Fit, planes (consultado 14/10/2026): https://www.smartfit.com.pe/planes
- Revista Economía, clientes de Reset: https://www.revistaeconomia.com/?p=87655 y https://www.revistaeconomia.com/?p=75160
- La Cámara, Fiesta del Cine 2025: https://lacamara.pe/fiesta-del-cine-2025-entradas-a-6-soles-desde-cuando-cinemark-cineplanet-uvk-cinestar-peru-lima/
- Infomercado, Papa John's 70 tiendas: https://infomercado.pe/papa-johns-alcanza-las-70-tiendas-en-peru-e-inicia-el-2025-con-expansion-en-arequipa
- D. Leg. 1044 (vLex): https://vlex.com.pe/vid/39079607
- LP Derecho, Res. 0106-2024/SDC: https://lpderecho.pe/comercial-win-competencia-desleal-frase-ya-nos-metieron-la-ra-alude-denunciantes-resolucion-0106-2024-sdc-indecopi/
- Foro Jurídico PUCP, publicidad comparativa: https://revistas.pucp.edu.pe/index.php/forojuridico/article/view/22137
- Decisión 486 art. 157: https://ius360.com/mas-alla-del-agotamiento-el-uso-informativo-de-la-marca-y-sus-limites/ y https://www.asuntoslegales.com.co/analisis/sara-merizalde-533166/usos-permitidos-de-una-marca-ajena-2429511
- LocaliQ, Search Benchmarks 2026: https://localiq.com/blog/search-advertising-benchmarks/
- LocaliQ, Facebook Benchmarks: https://localiq.com/blog/facebook-advertising-benchmarks/
- Merca2.0, CPC por país (Statista/Semrush dic-2024): https://www.merca20.com/ranking-de-paises-con-el-cpc-mas-caro-cuanto-cuesta-aparecer-en-google-ads/
- Itera, Meta y TikTok LatAm 2026: https://somositera.com/cuanto-cuesta-publicidad-meta-ads-facebook-instagram/ y https://somositera.com/cuanto-cuesta-publicidad-tiktok-ads/
- theadspend, Display: https://theadspend.com/blog/google-display-overall
- Unbounce fitness: https://unbounce.com/industry/fitness
- Google Trends (API pública, descargado el 14/10/2026): https://trends.google.com/trends/explore?geo=PE&q=gimnasio
- StatCounter Perú: https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/peru
- La República, feriados 2026: https://larepublica.pe/economia/2025/12/26/feriados-2026-en-peru-calendario-oficial-con-fines-de-semana-largos-y-puentes-para-planificar-tu-ano-1697462
- LP Derecho, DS 042-2025-PCM: https://lpderecho.pe/dias-no-laborables-sector-publico-2025-decreto-supremo-042-2025-pcm/
- Infobae, DS 075-2026-PCM: https://www.infobae.com/peru/2026/07/27/el-30-y-31-de-julio-son-feriados-o-dias-no-laborables-en-peru-atento-a-lo-que-dice-la-norma/
- RPP, segunda vuelta 2026: https://rpp.pe/politica/elecciones/onpe-cuando-es-la-segunda-vuelta-en-peru-elecciones-2026-noticia-1688514
- Infomercado, Cyber Wow 2025: https://infomercado.pe/cuando-es-el-cyber-wow-2025-fechas-y-marcas-que-participaran-en-peru/
- INEI, Censos 2025, Lima Metropolitana 10.129.708 habitantes (sirve como techo de alcance): https://www.gob.pe/institucion/inei/noticias/1417313-censos-nacionales-2025-lima-metropolitana-continua-siendo-la-provincia-mas-poblada
