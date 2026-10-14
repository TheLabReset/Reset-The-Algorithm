# Auditoría visual y técnica de The Algorithm

**THE LAB · 14 de octubre de 2026 · rama `claude/modest-tesla-a7501f` · build de `main` en `d8ff2fc`**

Etiquetas: **confirmé** (medido ejecutando: build, Chromium, Lighthouse, grep o cálculo), **se deduce** (inferido de lo medido), **asumo** (no comprobado).

Método: se instaló y levantó la demo (`npm ci`, `vite build`, `vite preview`), se capturaron las cuatro capas a 1440, 1024 y 390 px con Playwright, con los acordeones abiertos, el tooltip, el foco con teclado y la data caída (todas las peticiones a `/data/*` bloqueadas), y se corrió Lighthouse 12.8.2 en escritorio y móvil. Las cifras de la demo se recalcularon desde `src/data/mockData.js` con Node. El detalle bloque por bloque está en `CATALOGO-DE-BLOQUES.md`.

---

## Veredicto

La demo no falla por fea: falla porque **sus cifras se contradicen entre sí y su pantalla afirma cosas que no son verdad**, y alguien que ve dashboards cada semana lo nota en el primer minuto. El share of voice de la competencia suma 105 %, el índice de oportunidad no es la suma ponderada de sus propios componentes (78 contra 81,5), el presupuesto está ejecutado al 100 % en una capa y al 93 % en la otra, los cinco canales tienen el mismo CPL implícito mientras la pantalla anuncia tres distintos, y el período que se muestra sale del reloj del navegador (octubre) sobre data fija de enero. Encima de eso está la capa visual: cuatro colores saturados que no codifican nada, todo con el mismo peso, una torta, un doble eje y rótulos de «Live», «IA Activa» y «Sistema activo» sobre data que nunca cambia. Lo técnico no es lo que impide lucirse (Lighthouse da 100 de rendimiento en escritorio); lo que lo impide es que **no hay data con tiempo** (solo siete días escritos a mano) y **no hay una capa de cálculo**: 236 números están escritos dentro de los componentes. Sin un generador y una función pura que arme la vista, cualquier forma nueva heredaría las mismas contradicciones.

---

## Antes de todo: un hallazgo que no es de diseño

**El repositorio `TheLabReset/Reset-The-Algorithm` es público** (confirmé con la API de GitHub el 14/10/2026) y hoy contiene, en `data/`, `public/data/trends/latest.json`, `scrapers/` y `docs/`, archivos con el nombre de un cliente real anterior (una universidad), sus competidores y sus temas, y la historia de commits nombra a otros clientes de la agencia (confirmé con `grep` y `git log`). `public/data/` se copia a `dist/` y se sirve sin autenticación. Este rediseño no agrega nada de eso, pero tampoco lo borra de la historia: es una decisión que no es reversible y que queda como pregunta abierta en el plan.

---

## Inventario medido

| Medida | Valor | Cómo se midió |
|---|---:|---|
| Colores hex literales en `src/` | 10 distintos (17 usos) | `grep` sobre `src/` |
| Clases de la paleta por defecto de Tailwind (`red-400`, `yellow-500`, `green-500`…) | 56 usos | `grep` |
| Tokens referenciados que no existen en `tailwind.config.js` | 3 (`fitzone-orange`, `fitzone-lime`, `fitzone-darkOrange`) | `grep` cruzado |
| Tamaños de letra en uso | 10 de la escala + `10px` | CSS compilado |
| Usos de `text-[10px]` (bajo el mínimo de 12 px) | 71 | `grep` |
| Radios distintos | 6, con variantes responsivas (`rounded-lg sm:rounded-xl`) | CSS compilado |
| Sombras distintas | 7, incluido un brillo violeta | CSS compilado |
| Familias tipográficas cargadas | **0**. Inter está declarada y no se carga; `document.fonts` vacío. Se ve Inter solo si está instalada en la máquina; si no, Helvetica o Arial | Chromium, CDP `getPlatformFontsForNode` |
| Íconos de lucide distintos | 44, 12 de ellos dentro de un cuadro de color sobre un título | `grep` |
| Librerías de gráficos | Recharts 2: 2 gráficos (1 de líneas, 1 torta) | `grep` |
| Bundle por chunk (gzip) | JS de la app 25,9 kB · Recharts 155,8 kB · CSS 5,7 kB. Recharts es el 86 % del JS y se carga aunque la capa inicial no lo use | `vite build` |
| `prefers-reduced-motion` | 0 reglas; con la preferencia activa siguen `spin`, `fadeIn`, `pulse` y la animación de Recharts | CSS compilado y Chromium con `reducedMotion: 'reduce'` |
| `:focus-visible` o estilos de foco propios | 0; el anillo por defecto del navegador casi no se ve sobre el fondo oscuro | `grep` y `1440-foco-teclado.png` |
| `tabular-nums` | 0 | CSS compilado |
| Atributos `aria-*` y `role` | 0 | `grep` |
| Favicon | `/vite.svg` no existe; responde 200 con `text/html` | `curl` |
| Lighthouse escritorio | Rendimiento 100 · Accesibilidad 90 · Buenas prácticas 100 · SEO 91. 19 fallos de contraste | Lighthouse 12.8.2 |
| Lighthouse móvil | Rendimiento 96 (LCP 2,4 s) · Accesibilidad 75. 18 fallos de contraste, 1 botón sin nombre | Lighthouse 12.8.2 |
| Scroll horizontal a 390 px | Ninguno en las cuatro capas (`scrollWidth` = 390); las tablas hacen scroll dentro de su caja (ancho mínimo de 400 a 550 px) | Chromium |
| Números escritos a mano dentro de componentes | 236 literales de 2 o más cifras (133 en la capa 1) | `grep` aproximado |
| Data cargada y nunca pintada | `trends`, `tiktok`, `meta`, `ga4`, `ml/insights`: se piden por red y solo se guardan en el estado. Solo `ml/predictions.json` llega a la pantalla | `grep` de cada variable |
| Código muerto | `src/data/keywords.js` (440 líneas, nunca importado); `SEDES_PERFORMANCE` importado y no usado; `CONTENT_PILLARS` no usado | `grep` |

Las dependencias desactualizadas y deprecadas, medidas contra el registry, están en «Lo técnico».

---

## Qué data hay

| Fuente | Campos | Granularidad | Rango | ¿Se pinta? |
|---|---|---|---|---|
| `src/data/mockData.js` | KPIs (actual y anterior), GA4 (sesiones, páginas, fuentes, dispositivos, distritos), índice de oportunidad y 5 componentes, 6 servicios, 12 sedes, 6 competidores, 4 campañas, presupuesto por canal, 5 pilares, alertas | Una foto mensual | «Enero 2026», sin fechas | En parte |
| `src/data/config.js` | Marca, capas, mensajes, fuentes, canales, 12 sedes, 3 audiencias con embudo, horarios, estacionalidad, servicios, umbrales de CPL | Configuración | Sin fechas | En parte |
| `OptimizationLayer.jsx` (dentro del componente) | Leads, alcance, engagement e inversión diarios | Día | 14 al 20 de enero (7 días) | Sí |
| `DataLayer.jsx` (dentro del componente) | 8 keywords, 8 hashtags, 6 sonidos, 6 temas, 4 campañas, 10 páginas | Foto | Sin fechas | Sí |
| `public/data/*/latest.json` | Trends, TikTok, Meta, GA4 simulado, salidas del modelo | Foto | Sellado el 21/01/2026 | Solo `ml/predictions` |

**Qué se puede graficar hoy** (se deduce): casi nada que tenga tiempo. Una línea de 7 días y fotos. Ninguna comparación contra período anterior se puede calcular: los «anteriores» están escritos a mano. Ninguna forma de evolución, calendario, estacionalidad, ranking que cambia o incertidumbre tiene data detrás. Por eso la primera pieza de la construcción es el generador.

---

## Hallazgos por severidad

### ALTA · el gráfico o la cifra dicen algo falso, o la jerarquía no deja ver qué importa

| # | Hallazgo | Medición | Captura |
|---|---|---|---|
| A1 | **Cifras que se contradicen entre sí.** Share of voice de la competencia suma 105 %. El índice de oportunidad dice 78 y sus componentes ponderados suman 81,5. Presupuesto ejecutado 100 % (capa 3) contra 93 % (capa 4). Los leads por canal reparten exactamente igual que la inversión, así que el CPL implícito es $13,51 en los cinco canales, mientras la pantalla anuncia $10,50, $14,20 y $8,80, y un promedio de $11,20 que no sale de ninguna división posible (23 200/1 850 = 12,54; 25 000/1 850 = 13,51). «92/100» en el texto y 82/100 en la tabla para la misma keyword. «8,5/10» en el análisis y 8,2 en la tarjeta | Recalculado con Node desde `mockData.js` (confirmé) | `1440-optimization.png`, `1440-execution.png`, `1440-decision.png`, `1440-data.png` |
| A2 | **El período y la frescura mienten.** Los chips «1-14 Octubre 2026» y «Sem 42» y la «Última actualización» salen del reloj del navegador; la data es fija del 21 de enero y el gráfico dice «14 Ene» a «20 Ene» debajo de un chip de octubre | `new Date()` en cuatro componentes (confirmé) | `1440-optimization-linea-tooltip.png` |
| A3 | **Rótulos de sistema vivo sobre data estática**: «Live», «IA Activa», «Auto-optimización activa», «Sistema activo» con punto que late | Ninguno depende de un estado (confirmé en el código) | `1440-execution.png`, `1440-optimization.png` |
| A4 | **La fuente caída no se ve.** Con toda la data bloqueada, la capa 1 se ve igual, los cuatro puntos de fuente siguen verdes, y los puntajes cambian sin aviso (global 7,8 → 8,2; GA4 6,5 → 8,8; Trends 9,0 → 8,5) porque el componente tiene valores de respaldo escritos a mano | Playwright con `/data/*` abortado (confirmé) | `1440-data.png` contra `1440-error-data-caida.png` |
| A5 | **La leyenda miente.** «Leads» tiene un punto violeta y la línea es naranja | `bg-fitzone-purple` contra `stroke="#FF6B35"` (confirmé) | `1440-optimization-linea-tooltip.png` |
| A6 | **Doble eje y curvas que inventan días.** Leads (0 a 100) y engagement (0 a 60 000) en dos escalas superpuestas: las curvas parecen moverse juntas por cómo se eligieron los ejes. `type="monotone"` dibuja valores entre días que nadie midió | `OptimizationLayer.jsx` (confirmé) | `1440-optimization-linea-tooltip.png` |
| A7 | **Un delta pegado a la cifra equivocada.** «Nuevos miembros 476» muestra «+22,4 %», que es la variación de leads; la de miembros es +19,6 % | `PERFORMANCE_KPIS.leads.trend` en la tarjeta de miembros (confirmé) | `1440-optimization.png` |
| A8 | **Jerarquía plana.** Cada capa abre con varios bloques de color lleno (violeta, cian, verde, ámbar) que pesan lo mismo; la capa 1 abre con texto y deja las tablas de las cuatro fuentes cerradas por defecto. No hay un veredicto por capa | Capturas a 1440: 4 superficies llenas en la capa 1, 3 en la 2, 2 en la 3, 5 en la 4 (confirmé contando) | `1440-data.png` |
| A9 | **Marcas reales con data y juicios inventados.** Competidores reales con share of voice, sentimiento, «nivel de amenaza» y frases como «máquinas ocupadas» o «masificación», y una «promoción agresiva» con fecha. Artistas y canciones reales en «sonidos trending». Todo es data de muestra y nada lo dice en pantalla | `mockData.js`, `DataLayer.jsx` (confirmé) | `1440-optimization.png` |

### MEDIA · forma subóptima, estados ausentes, accesibilidad

| # | Hallazgo | Medición | Captura |
|---|---|---|---|
| M1 | **Torta para comparar cinco canales**, con dos naranjas casi iguales (Meta `#FF6B35` y Display `#F97316`) y un tooltip oscuro sobre oscuro que dice «Display : 10» sin unidad | Validador de la skill de dataviz sobre la paleta de la torta: ΔE 2,8 con visión normal y 1,4 con deuteranopía entre esos dos; FALLA (confirmé) | `1440-optimization-torta.png` |
| M2 | **Embudo de tarjetas del mismo tamaño**: 2 500 000 y 476 ocupan lo mismo; la forma no muestra dónde se pierde | `OptimizationLayer.jsx` (confirmé) | `1440-optimization.png` |
| M3 | **Estados ausentes.** No hay vacío, error, fuera de rango ni «no medido». El «cargando» es una espera fija de 800 ms que no espera nada | `setTimeout(800)` (confirmé) | `1440-00-cargando.png` |
| M4 | **Accesibilidad.** Lighthouse 90 en escritorio y 75 en móvil; 19 y 18 fallos de contraste; un botón solo ícono sin nombre; cero `aria`; foco casi invisible; 71 textos de 10 px; color como única señal en CTR, CPL, rebote y sentimiento; movimiento reducido no respetado | Lighthouse y Chromium (confirmé) | `1440-foco-teclado.png` |
| M5 | **Formato de números en inglés y sin regla**: «1,850», «$11.2» junto a «$11.20», «42800» sin separar en el tooltip, «$9.8»; `toLocaleString()` sin locale en 6 lugares (depende del navegador del cliente); 17 `toFixed` sueltos | `grep` (confirmé) | `1440-optimization-linea-tooltip.png` |
| M6 | **Idioma.** 22 palabras sin tilde en pantalla («Recomendacion», «Analisis», «Tamano», «Peru») y mezcla con inglés («OVERPERFORMING», «Early birds», «Score», «Trials», «Performance») | `grep` (confirmé) | `1440-decision.png` |
| M7 | **Cifras sin comparación ni período**: la mayoría de los «+X %» no dicen contra qué; «Confianza 94 %» no tiene método | Catálogo, filas D2, D4, I4, I5 (confirmé) | `1440-decision.png` |
| M8 | **Formas que obligan a cruzar columnas**: volumen y tono por tema, share of voice y sentimiento por marca, leads y CPL por servicio, en tablas o tarjetas separadas | Catálogo, filas D7, E5, O8 | `1440-data-abierto.png` |

### BAJA · estética y consistencia

| # | Hallazgo | Medición |
|---|---|---|
| B1 | Inter declarada y no cargada: la tipografía depende de la máquina del cliente | `document.fonts` vacío (confirmé) |
| B2 | 6 radios y 7 sombras, con variantes por ancho de pantalla; brillo violeta en bloques | CSS compilado (confirmé) |
| B3 | 44 íconos, 12 en cuadro de color sobre un título; la mancuerna del cliente demo como logo de un producto de Reset | `grep` (confirmé) |
| B4 | Favicon inexistente que responde HTML; `theme-color` `#7C3AED` | `curl` (confirmé) |
| B5 | Tokens fantasma (`fitzone-orange`, `fitzone-lime`) y colores de gráfico que no son del sistema (`#FF6B35`, `#00D4FF`, `#B8FF00`): restos de una paleta anterior | `grep` (confirmé) |
| B6 | El producto se llama «The Algorithm by Reset» en la cabecera y «FitZone Algorithm» en el pie y en la carga | Capturas (confirmé) |

---

## Señales de AI slop presentes

Contra la lista negra de la investigación de referencia del proyecto anterior (sección 9, 16 señales). 13 de 16 presentes.

| # | Señal | ¿Está? | Dónde |
|---|---|---|---|
| 1 | Una sola familia sin decidir (Inter para todo) | Sí, y además no se carga | `tailwind.config.js`, `index.css` |
| 2 | Grilla de N KPIs idénticos | Sí | Capa 4, cuatro tarjetas; capa 1, cuatro tarjetas de fuente; GA4, cuatro cifras |
| 3 | Color de marca usado como estado | Sí | Violeta = prioridad alta y «TOP»; verde = capa 3, TikTok y mejora |
| 4 | Degradados que no codifican nada | Sí, 3 | Análisis multi-fuente |
| 5 | Franja lateral de color en tarjetas redondeadas | Sí: 3 en el código, 8 en pantalla | Insights (4), multi-fuente (1), alertas (3) |
| 6 | Ícono en cuadradito sobre cada título | Sí, 12 en el código | Todas las capas |
| 7 | Símbolo literal del rubro como logo | Sí | Mancuerna |
| 8 | Rótulos en MAYÚSCULAS con tracking | Sí, 34 `uppercase` | Rótulos de fuente, badges, cabeceras de tabla |
| 9 | Mismo radio grande y sombra en todo | Sí, y arbitrario: 6 radios, 7 sombras | Todo |
| 10 | Punto que late o «Live» en data estática | Sí | Pie, capa 3, capa 4 |
| 11 | Badges que repiten el título | Sí | «Consolidado», «ACTIVA» en las tres audiencias, «Nuestra Marca» |
| 12 | Entradas animadas al cargar | Sí | `fadeIn` en cada cambio de capa, Recharts al montar |
| 13 | Paleta por defecto de Tailwind | Sí, 56 usos | Estados y prioridades |
| 14 | Información crítica escondida | Sí, en acordeón (no en tooltip) | Las tablas de las cuatro fuentes y el «cómo se calcula» |
| 15 | Copy de folleto y cifras redondas inventadas | Sí | «Tecnología que te Impulsa», «Distribución inteligente», «Excelente retencion», confianza 92 % y 94 % |
| 16 | «Powered by» | No | |

---

## Lo que se conserva y por qué

- **El recorrido de cuatro capas** (señal, decisión, activación, resultado). Es el argumento comercial del producto y ordena la reunión: primero lo que pasa afuera, al final lo que pasó con la plata. Se conserva la idea, no los nombres en inglés ni los colores por capa.
- **El modelo de contenido**: fuentes, canales, audiencias, sedes, servicios, competencia, índice con componentes. Es lo que un cliente de marketing reconoce como suyo. Lo que cambia es que todo sale de un generador con tiempo.
- **El índice de oportunidad con componentes ponderados**: es la pieza más «producto» de la demo. Se conserva calculado de verdad (que sume) y dibujado como bullet graph.
- **Que funcione en celular sin scroll horizontal** (confirmé a 390 px). Se conserva como requisito.
- **El rendimiento**: Lighthouse 100 en escritorio. El presupuesto de bundle del plan parte de no empeorar esto.
- **El tema oscuro**, de forma provisional: es la identidad que ya conocen quienes vieron la demo. Se decide en el plan con la investigación de identidad.

---

## Lo técnico que impide lucirse

1. **No hay data con tiempo ni capa de cálculo.** Es el bloqueo principal. Sin serie diaria no hay período anterior, estacionalidad, calendario ni ranking que cambia; sin una función pura, cada componente recalcula a su manera y las cifras se contradicen (A1, A7).
2. **Recharts 2 pesa 155,8 kB gzip para dos gráficos** y no deja marcar cada barra con un `data-valor` que una prueba pueda cruzar contra la data. La medición comparada con alternativas actuales está en la investigación (`docs/rediseno/investigacion/05-graficos-y-stack.md`).
3. **Sin pruebas, sin lint, sin chequeo de tokens.** Nada impide que vuelva a entrar un color o un número suelto.
4. **Tipografía no cargada y sin cifras tabulares**: una columna de números no se alinea.
5. **Accesibilidad estructural**: sin roles, sin foco, sin alternativa en tabla para los gráficos.
6. **Netlify fija Node 18** en `netlify.toml` (asumo que ya no tiene soporte; se verifica en la investigación técnica).
