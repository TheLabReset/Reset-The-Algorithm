# 03 · Movimiento: soporte, constancia de objeto y recorrido guiado

THE LAB · investigación para el rediseño de «The Algorithm» · 14 de octubre de 2026

**Respuesta para decidir:** no hace falta ninguna librería nueva de animación. Las marcas se siguen con la vista subiendo Recharts de 2.15 a 3.10 (que ya es dependencia) y usando `animationMatchBy={matchByDataKey(...)}` a 240 ms. Las View Transitions sirven para cambiar de capa y para el recorrido guiado, pero **no para las barras ni los puntos de un gráfico SVG**: lo probé en Chromium 156 y los `<rect>` internos no se capturan. El recorrido guiado se arma con unas 80 líneas propias: pasos con URL, flechas y PageUp/PageDown (lo que mandan los presentadores inalámbricos), Escape, anillo por fuera del bloque y leyenda acoplada abajo, nunca encima de la cifra.

Los dos factores que más pesan:

1. **El emparejamiento por clave, no la duración ni la técnica.** Hoy Recharts empareja marcas por posición en el arreglo. Si un filtro reordena un ranking, la barra de arriba «se convierte» en otra marca. Ese es el error que confunde a un cliente, y se corrige con una propiedad (confirmé, prueba ejecutada en §2.4).
2. **Quién controla el navegador.** La demo corre en la laptop de quien presenta. El soporte que importa en la reunión es el de ese Chrome. El de los clientes solo pesa cuando abren el enlace después en su iPhone, y para eso basta con mejora progresiva (se deduce).

Lo que ya cubren el documento de diseño de referencia (§10) y la guía de técnicas §3 a §5 (régimen 70/110/150/240 ms, solo animar ante un cambio de la persona, movimiento reducido a 0, toggletip, panel no modal, modo presentación con filtros en el título, antipatrones) no se repite aquí. Este documento agrega datos de soporte medidos, la mecánica para seguir marcas y el diseño del recorrido.

---

## 1. Soporte por navegador, sacado de MDN browser-compat-data ejecutando

### 1.1 Método

- Instalé `@mdn/browser-compat-data` **8.1.5** (`__meta.timestamp` 2026-10-08T12:46:21Z) en `scratchpad/bcd` y lo leí con un script propio (`scratchpad/extract.cjs`). Para cada clave tomo la primera entrada de soporte sin flag, sin prefijo, sin nombre alternativo y sin `version_removed`. Si antes hubo una implementación parcial, la indico (confirmé).
- Estable vigente según el mismo BCD: Chrome 155 (2026-10-06), Edge 154 (2026-09-24), Firefox 157 (2026-09-29), Safari y Safari iOS 27 (2026-09-14), Chrome Android 155 (confirmé).
- Baseline: lo calculé con `web-features` **3.42.0** (publicado en npm el 2026-10-14), que es el conjunto de datos que alimenta web.dev/baseline y webstatus.dev. Lo crucé contra la API de webstatus.dev (`api.webstatus.dev/v1/features/<id>`), consultada el 2026-10-14, y coincide en las seis funciones que revisé (confirmé).
- Cuota de uso: crucé la versión mínima de BCD con las cuotas por versión de `caniuse-lite` **1.0.30001816** (publicado el 2026-10-13), a nivel global y para **Perú** (`regions/PE.js`). El script es `scratchpad/coverage.cjs` (confirmé).
  - **Límite del cálculo:** caniuse-lite agrupa todo Chrome Android en su última versión, y en Perú Chrome Android es el 46 % del tráfico. Eso **infla** las cifras de lo que solo existe en Chromium reciente (`interestfor`, `popover=hint`, `position-anchor` conforme). Tómalas como techo, no como dato. Samsung Internet, Opera y UC cuentan como «sin soporte», así que el resto de cifras son un piso (se deduce).
  - Reparto en Perú según caniuse-lite: Chrome Android 46,3 %, Chrome escritorio 36,3 %, Edge 5,2 %, Safari iOS 5,1 %, Firefox 1,8 %. A nivel global, Safari iOS pesa 14,8 % (confirmé). Por eso en Perú las coberturas salen más altas que en el promedio mundial.

### 1.2 Tabla

Versión mínima con soporte completo y estándar. «parcial desde N» = hubo una implementación anterior incompleta. Cobertura: global / Perú, octubre de 2026.

| Función | Chrome | Edge | Firefox | Safari | Safari iOS | Chrome Android | Baseline (web-features) | Cobertura global / PE |
|---|---|---|---|---|---|---|---|---|
| `document.startViewTransition` (mismo documento) | 111 | 111 | 144 | 18 | 18 | 111 | nueva desde 2025-10-14 | 94 % / 96 % |
| `view-transition-name` | 111 | 111 | 144 | 18 | 18 | 111 | (dentro de la anterior) | 94 % / 96 % |
| `view-transition-name: match-element` | 137 | 137 | 144 | 18.4 | 18.4 | 137 | no calculado | no medido |
| `view-transition-class` | 125 | 125 | 144 | 18.2 | 18.2 | 125 | nueva desde 2025-10-14 | 92 % / 93 % |
| Tipos (`:active-view-transition-type`) | 125 | 125 | 147 | 18.2 | 18.2 | 125 | no calculado | no medido |
| Transición acotada `Element.startViewTransition` | 147 | 147 | no | no | no | 147 | experimental | no aplica |
| Entre documentos `@view-transition` | 126 | 126 | no | 18.2 | 18.2 | 126 | limitada | 90 % / 92 % |
| `anchor-name`, `anchor()` | 125 | 125 | 147 | 26 | 26 | 125 | limitada (ver nota) | 90 % / 92 % |
| `position-anchor` | 151 (parcial desde 125) | 151 | 151 (parcial desde 147) | 27 (parcial desde 26) | 27 | 151 | limitada | 73 % / 82 % (techo) |
| `@position-try` | 125 | 125 | 147 | 26 | 26 | 125 | limitada | no medido |
| `position-try-fallbacks` | 128 | 128 | 147 | 26 | 26 | 128 | limitada | no medido |
| `position-area` | 129 | 129 | 147 | 26 | 26 | 129 | limitada | no medido |
| `@starting-style` | 117 | 117 | 129 | 17.5 | 17.5 | 117 | nueva desde 2024-08-06 | 95 % / 96 % |
| `transition-behavior: allow-discrete` | 117 | 117 | 129 | 17.4 | 17.4 | 117 | nueva desde 2024-08-06 | 95 % / 96 % |
| … transicionar `display` | 117 | 117 | **no** | 18 | 18 | 117 | n/a | n/a |
| Atributo `popover` | 114 | 114 | 125 | 17 | 17 | 114 | nueva desde 2025-01-27 | 95 % / 96 % |
| `popovertarget` | 114 | 114 | 125 | 17 | 17 | 114 | (dentro de popover) | 95 % / 96 % |
| `popover="hint"` | 151 (parcial desde 133) | 151 | 153 (parcial desde 149) | solo preview | no | 151 | limitada | 72 % / 82 % (techo) |
| `interestfor` (interest invokers) | 142 | 142 | no | no | no | 142 | limitada, experimental y **no estándar** | 72 % / 83 % (techo) |
| `animation-timeline` (`scroll()`, `view()`) | 115 | 115 | **solo preview** | 26 | 26 | 115 | limitada | 89 % / 94 % |
| `oklch()` | 111 | 111 | 113 | 15.4 | 15.4 | 111 | amplia (2025-11-09) | 97 % / 98 % |
| … sintaxis relativa `oklch(from …)` | 122 | 122 | 128 | 18 | 18 | 122 | no calculado | no medido |
| `color-mix()` | 111 | 111 | 113 | 16.2 | 16.2 | 111 | amplia (2025-11-09) | 96 % / 98 % |
| `@container` (tamaño) | 105 | 105 | 110 | 16 | 16 | 105 | amplia (2025-08-14) | 97 % / 99 % |
| … consultas de estilo | 111 | 111 | 151 | 18 | 18 | 111 | nueva desde 2026-05-19 | no medido |
| `font-variant-numeric` (`tabular-nums`) | 52 | 79 | 34 | 9.1 | 9.3 | 52 | amplia | 98 % / 100 % |
| `text-wrap: balance` | 114 | 114 | 121 | 17.5 | 17.5 | 114 | nueva desde 2024-05-13 | 95 % / 97 % |
| `text-wrap: pretty` | 117 | 117 | **no** | 26 | 26 | 117 | limitada | 89 % / 94 % |
| `@property` | 85 | 85 | 128 | 16.4 | 16.4 | 85 | nueva desde 2024-07-09 | 97 % / 98 % |
| `:focus-visible` | 86 | 86 | 85 | 15.4 | 15.4 | 86 | amplia | 98 % / 100 % |
| `prefers-reduced-motion` | 74 | 79 | 63 | 10.1 | 10.3 | 74 | amplia | 98 % / 100 % |
| Anidamiento CSS (`&`) | 120 (parcial desde 112) | 120 | 117 | 17.2 (parcial desde 16.5) | 17.2 | 120 | amplia (2026-06-11) | 94 % / 95 % |
| `light-dark()` | 123 | 123 | 120 | 17.5 | 17.5 | 123 | nueva desde 2024-05-13 | 94 % / 94 % |
| Atributo `inert` (lo necesita el recorrido) | 102 | 102 | 112 | 15.5 | 15.5 | 102 | n/a | 98 % / 99 % |
| `Element.animate()` (WAAPI, para FLIP) | 36 | 79 | 48 | 13.1 | 13.4 | 36 | n/a | 98 % / 100 % |

Notas que cambian decisiones:

- **Posicionamiento anclado:** web-features lo marca «limitado» porque `position-visibility: anchor-valid / anchor-visible` falta en Chrome y Firefox. El núcleo (`anchor-name`, `anchor()`, `position-area`, `@position-try`) está en los tres motores estables desde Chrome 125, Firefox 147 y Safari 26 (confirmé). La diferencia de `position-anchor` entre versiones es solo su **valor inicial** (`auto` o `none` en vez de `normal`, según las notas de BCD) (confirmé). Si siempre declaras `position-anchor` de manera explícita, esa diferencia deja de importar (se deduce).
- **`interestfor`** figura en BCD como experimental y **no estándar** (`standard_track: false`) (confirmé). Además, abrir algo con hover choca con la regla ya adoptada de que lo crítico no vive en el hover. Se descarta.
- **Las View Transitions entre documentos no aplican**: The Algorithm es una SPA de Vite con un solo `index.html` (confirmé, repo). Solo interesa la variante del mismo documento.
- **Las animaciones por scroll siguen sin Firefox estable** (solo preview en BCD 8.1.5) (confirmé). Esto corrige a la guía de técnicas §4, que dice «soporte en todos los motores relevantes». Para Firefox ese dato no se sostiene a octubre de 2026.

### 1.3 Veredicto para 2026

**A. Usar sin fallback.** Su soporte es universal y su falla rompería algo, pero no va a fallar: `font-variant-numeric`, `prefers-reduced-motion`, `:focus-visible`, `@container` de tamaño, `oklch()`, `color-mix()`, `@property`, WAAPI, `inert`, anidamiento CSS. Además, Vite y PostCSS pueden bajar el anidamiento si hiciera falta (confirmé los datos; la conclusión se deduce).

**B. Usar sin fallback porque su ausencia no rompe nada** (mejora progresiva gratis, con detección):
- `document.startViewTransition`, protegido con `if (!document.startViewTransition) { update(); return; }`.
- `view-transition-class`, `@starting-style`, `transition-behavior: allow-discrete`, `text-wrap: balance` y `pretty`.
- `popover` (se deduce). Hay una excepción: en Firefox no se puede transicionar `display`, así que la salida de un popover será un corte seco allí (confirmé el dato; el efecto se deduce).

**C. Mejora progresiva con fallback explícito:**
- **Posicionamiento anclado**, detrás de `@supports (anchor-name: --a)`. Fallback: leyenda acoplada abajo, que de todos modos es lo que recomiendo en §3.
- **`light-dark()`** (94 %), con un color plano declarado antes.
- **Consultas de estilo**, que en Firefox existen recién desde la 151.
- **Animaciones por scroll**, siempre dentro de `@supports (animation-timeline: view())` y de `prefers-reduced-motion: no-preference`.

**D. No usar todavía:** `interestfor`, `popover="hint"` (Safari solo preview, iOS no) y `Element.startViewTransition` acotado (solo Chromium 147 o superior, experimental).

---

## 2. Qué se anima al cambiar un filtro para que una marca se siga con la vista

### 2.1 Lo que dice la evidencia

- **Constancia de objeto** (Bostock, «Object Constancy», 16 de mayo de 2012). Un elemento gráfico que representa un dato concreto «puede seguirse visualmente a través de la transición». El mecanismo es una función de clave en el *join*, y la animación solo se usa «cuando mejora la comprensión». Entre conjuntos de datos no relacionados conviene un corte o un fundido (confirmé).
- **Heer y Robertson, 2007** («Animated Transitions in Statistical Data Graphics», IEEE TVCG 13(6), InfoVis 2007). Leí el PDF completo. Lo que sirve aquí (confirmé, texto del artículo):
  - *Respetar la correspondencia semántica*: una marca que representa un dato no debe reutilizarse para otro dato en la transición.
  - *Evitar la ambigüedad*: animar la altura de una barra cuando en realidad se cambió de variable «abusa de la constancia de objeto».
  - *Mantener gráficos válidos en los estados intermedios*.
  - *Minimizar la oclusión*: para los reordenamientos usaron **escalonado**, pequeños retrasos de inicio entre elementos.
  - *Escenificación simple*: separar el reescalado del eje del cambio de valores. La escenificación agresiva de «una cosa a la vez» se desaconseja. El artículo anota además que la mayoría de los participantes se rió al ver la transición multietapa de barras apiladas, y que eso «podría no ser deseable en una presentación».
  - *Evitar reescalar ejes cuando se pueda*: usar escalas comunes entre pasos, porque el reescalado subió el error de estimación.
  - Para entradas y salidas por filtro usaron **fundido de opacidad**, no barras que crecen desde la base ni capas que caen. Así evitaron cambios sin significado.
- **Interpolación de rutas** (Bostock, «Path Transitions», 19 de enero de 2012). Interpolar el atributo `d` de una línea punto por punto produce un «meneo». La solución es emparejar por x (fecha) o trasladar la línea, no transformar la forma (confirmé).

### 2.2 La tensión con la regla de 240 ms (la mejor objeción)

Heer y Robertson probaron transiciones de **1,25 s** y recomiendan **alrededor de 1 s**, citando a Robertson y otros. Para movimientos pequeños admiten que «probablemente se puede ir más rápido» (confirmé). La regla de la casa topa en 240 ms. Un escéptico diría que 240 ms es demasiado poco para seguir una barra que salta tres puestos.

Respuesta:
- En **lectura**, la tarea no es estimar cuánto cambió (para eso está la cifra escrita). La tarea es no perder la identidad de la marca. Con emparejamiento por clave, un desplazamiento de 240 ms con la curva productiva de Carbon basta para ver «Alfa bajó». Además, la mayoría de los cambios de filtro mueven poco (se deduce, sin prueba con usuarios).
- La regla se sostiene si se cumplen dos condiciones de Heer y Robertson, que **reducen** lo que el ojo debe seguir:
  1. **Dominio del eje fijo por vista**, para que no haya reescalado y por lo tanto tampoco una segunda etapa.
  2. **Cero animación cuando cambia la métrica** (corte o fundido de 110 ms).
- En el **recorrido guiado**, donde quien presenta cuenta el cambio en voz alta, se puede usar `slow-01` de Carbon, 400 ms. Ese movimiento ya no está entre el lector y la cifra: es el camino. Es la única excepción que propongo y la dejo como **decisión del equipo**, no como hecho.

Tokens confirmados desde el paquete `@carbon/motion` 11.54.0 (npm, 2026-10-07): 70 / 110 / 150 / 240 / 400 / 700 ms. Curva productiva estándar `cubic-bezier(0.2, 0, 0.38, 0.9)`, expresiva estándar `cubic-bezier(0.4, 0.14, 0.3, 1)`, entrada productiva `cubic-bezier(0, 0, 0.38, 0.9)`, salida productiva `cubic-bezier(0.2, 0, 1, 0.9)` (confirmé).

### 2.3 Qué se anima y qué no

| Cambio de la persona | Qué hacer | Por qué |
|---|---|---|
| Período o filtro, **misma métrica y mismas marcas** | Las marcas viajan a su nuevo valor o posición, **emparejadas por clave** (marca o fecha), 240 ms, curva productiva | Constancia de objeto |
| Una marca entra o sale por filtro | Fundido de opacidad: 150 ms al entrar, 110 ms al salir (curvas de entrada y salida) | Heer y Robertson: el fundido evita cambios sin significado |
| Reordenamiento de ranking | Traslado vertical por clave, sin escalonado en lectura | Con 240 ms no queda margen para escalonar; el escalonado va en el recorrido si se quiere |
| Cambio de métrica (leads a engagement) | **No animar las marcas.** Corte, o fundido del bloque de 110 ms | «Evitar la ambigüedad» |
| Cambio de escala o dominio | Evitarlo con un dominio fijo por vista; si es inevitable, mover ejes y marcas juntos en una sola etapa de 240 ms | Reescalar sube el error |
| Línea con más o menos días | Emparejar puntos por fecha; los días nuevos entran por fundido | Evita el «meneo» de rutas |
| Cambio de capa (pestaña) | Fundido cruzado del área principal, 150 ms (View Transition, ver §2.4) | Orientar, no decorar |

**No se anima nunca:**
- **Los dígitos.** Nada de contadores que suben ni cifras interpoladas: los estados intermedios son números falsos (se deduce de «mantener gráficos válidos»).
- **La entrada de los gráficos al montar.** Hoy Recharts dibuja cada línea en 1500 ms y cada torta en 400 + 1500 ms cada vez que se cambia de capa (confirmé, valores por defecto en `node_modules/recharts/lib`).
- **Rótulos de ejes** que se transforman como texto, ni **colores** de identidad de una marca.
- **Indicadores perpetuos.** El punto verde del pie de página usa `animate-pulse`, que en Tailwind 3.4.18 es `2s … infinite` (confirmé). Es movimiento que se dispara solo, ya está en la lista de antipatrones y, si se considera parpadeo de más de 5 s, cae en WCAG 2.2.2 (nivel A) (asumo que aplica; la redacción exige un mecanismo para pausar).

### 2.4 Tres técnicas, medidas en un navegador real

Las pruebas corren en Chromium 156.0.8078.4 headless (Playwright), con los scripts en `scratchpad/pw/` y `scratchpad/bundle/rtest/`.

**a) Transición de atributos SVG con Recharts. Recomendada para las marcas.**
- Recharts 2.15.4 (el del repo) empareja barras por índice (`prevData[index]`) y puntos de línea por índice con estiramiento proporcional (confirmé, código fuente). No mira `prefers-reduced-motion` en ninguna parte (confirmé, grep sin resultados).
- Recharts **3.9** (2026-06-23) agregó `animationMatchBy` con `matchByIndex`, `matchAppend` y `matchByDataKey(clave)` en Bar, Line, Area, Scatter, Pie, Radar, RadialBar y Funnel. Además, `isAnimationActive` vale `'auto'` por defecto, lo que desactiva la animación con `prefers-reduced-motion: reduce` (confirmé, `lib/animation/JavascriptAnimate.js` y `CSSTransitionAnimate.js` de la 3.10.1).
- **Prueba ejecutada:** un ranking de tres marcas en el que un filtro hace que Alfa baje del primer al segundo puesto. A mitad de la animación (confirmé):
  - **Por índice:** las tres barras se quedan en su fila (y = 19, 75, 132) y solo cambian de ancho. La fila de arriba pasa de Alfa a Gama sin que se note.
  - **Con `matchByDataKey('marca')`:** las barras viajan entre filas (y = 78, 46, 102 a mitad de camino). Cada marca conserva su barra.
- **Trampa:** si se pasa `isAnimationActive={true}` explícito, se pierde el respeto automático a `reduce`. Hay que dejar `'auto'` o pasar `false` (confirmé, código).
- **Costo:** Recharts es un *major* (2 a 3). El bundle con los componentes que usa el repo pasa de 115,5 KB a 122,8 KB gzip (+7,2 KB) (confirmé, esbuild 0.28.2, React como externo). Los cambios que rompen compatibilidad entre 2 y 3 no los revisé (asumo que existen; hay que leer la guía de migración antes de estimar).

**b) View Transitions. Recomendadas solo para cambiar de capa y para el recorrido.**
- **No capturan elementos internos de SVG.** Puse `view-transition-name` en un `<rect>` y en un `<g>` dentro de `<svg>`: no aparecen entre los grupos capturados. Sí se capturan el `<svg>` raíz y los elementos HTML (confirmé, prueba). Como Recharts dibuja en SVG, **las View Transitions no pueden mover barras ni puntos individuales**. Solo podrían hacerlo si el gráfico estuviera hecho con elementos HTML. La especificación dice que la propiedad no tiene efecto si la caja principal del elemento no se renderiza, y es consistente con la prueba (se deduce).
- **Bloquean los clics durante toda la transición:**
  - Con la configuración por defecto, un clic real sobre un botón durante la transición no llegó (0 clics).
  - Con solo `::view-transition { pointer-events: none }` **tampoco llegó** (0 clics).
  - Con `:root { view-transition-name: none }` **más** `pointer-events: none` sí llegó (1 clic).
  - La especificación lo explica: los elementos que participan en una transición no responden al *hit testing*, y mientras dura la supresión de renderizado todo apunta al elemento documento (confirmé, especificación y prueba).
  - Chris Coyier documenta lo mismo (Frontend Masters, 7 de agosto de 2026) (confirmé).
- **La transición acotada** (`elemento.startViewTransition`) deja pasar los clics fuera de su alcance (1 clic en la prueba) (confirmé), pero solo existe en Chromium 147 o superior.
- **El texto se vuelve imagen.** Las instantáneas se renderizan como contenido reemplazado, «como un `<img>`». Si el bloque cambia de tamaño, el texto se estira y se ve borroso durante la transición. La mitigación es `object-fit` o igualar la altura del grupo (confirmé, Chrome for Developers, actualizado el 25 de septiembre de 2024). Por eso **no conviene envolver una card con cifras en una View Transition que cambie de tamaño** (se deduce).
- **Los nombres duplicados cancelan la transición entera** y `ready` se rechaza (confirmé, MDN y Chrome for Developers). En React, el nombre debe salir de la clave estable de la marca, nunca del índice.
- **Uso correcto aquí:** fundido cruzado del `<main>` al cambiar de capa (`view-transition-name: capa` en `<main>`, `:root` en `none`), 150 ms, y desplazamiento del anillo del recorrido. Con `reduce`, se llama `update()` directo.

**c) FLIP con WAAPI. Para listas y tablas HTML.**
- Para filas de una tabla de competidores o tarjetas que se reordenan: medir antes, aplicar el cambio, medir después y animar `transform` desde la diferencia. Funciona con elementos HTML, no bloquea la interacción y no rasteriza el texto (se deduce del mecanismo; WAAPI tiene 98 % de cobertura según la tabla).
- El helper propio, emparejado por `data-key` y con `reduce` en 0, pesa **386 B gzip** (confirmé, medido).

| Técnica | Sirve para | Bloquea clics | Texto | Soporte |
|---|---|---|---|---|
| Atributos SVG (Recharts 3 + `matchByDataKey`) | Barras, puntos, sectores | No | Vectorial | Todos (JS) |
| View Transition de documento | Cambio de capa, anillo del recorrido | **Sí**, salvo `:root` en `none` | Rasterizado | 94 % / 96 % |
| FLIP con WAAPI | Filas y cards HTML | No | Nítido | 98 % / 100 % |

---

## 3. Modo presentación y recorrido guiado

### 3.1 Patrones publicados

- **Tableau Story Points.** Cada punto puede usar una vista distinta o la misma en otro estado. Los filtros y ordenamientos de un punto se guardan con «Update». En el modo presentación de Desktop se avanza con las flechas y se sale con Esc. En la web se usa la flecha en pantalla (confirmé, ayuda de Tableau). **Lección: un paso = un estado guardado de filtros.**
- **Looker Studio, «Present».** Ofrece ajuste a pantalla, a ancho o tamaño real, avance automático opcional y vuelve a la primera página al terminar. Se sale con ESC. Refresca datos solo de la página que viene (confirmé, documentación de Google). La navegación con flechas solo la afirma una guía de terceros (asumo).
- **Flourish Stories.** Diapositivas como estados de una visualización, con transición animada cuando se reutiliza la misma, y flechas en pantalla (confirmé solo por el fragmento de su centro de ayuda; la página devolvió 403). No encontré soporte de teclado (no sé).
- **Scrollytelling (Pudding, Scrollama).** Gráfico fijo que avanza por pasos al hacer scroll (confirmé, Goldenberg 2017). Archie Tse (NYT, Malofiej 2016) contó que los lectores no llegaban al contenido escondido en *steppers*, pestañas y tooltips y que «solo quieren hacer scroll» (confirmé que la charla existe; la cifra del 85 % que circula no la verifiqué). **Para una reunión no aplica:** el scroll lo controla el lector, y aquí quien controla es la persona que presenta, con un clicker (se deduce).
- **Hex y Mode.** No encontré documentación de un modo presentación propio. Hex publica «Apps» con pestañas (no sé si tienen un modo diapositivas; no lo afirmo).

### 3.2 Recomendación concreta, sin dependencia nueva

**Modelo:** un arreglo de pasos en un archivo de datos, y un hook `useRecorrido` de unas 80 líneas (se deduce del alcance).

```js
// src/data/recorrido.js
export const PASOS = [
  { id: 'panorama', capa: 'data', bloque: 'kpis', filtros: { periodo: '30d' },
    titulo: 'Así viene la categoría', nota: 'Qué mirar primero' },
  { id: 'competidores', capa: 'data', bloque: 'ranking-marcas', filtros: { periodo: '30d' }, ... },
  ...
];
```

1. **Pasos con URL** (`#recorrido/competidores`). Al recargar se vuelve al mismo paso. Esto importa porque el botón Play de los presentadores Logitech R400, R700 y R800 envía **F5 y Esc de manera alternada** (confirmé, tabla HID de Logitech). F5 recarga la página. Además, durante el recorrido conviene `preventDefault()` en `keydown` de F5 (asumo que Chrome permite cancelarlo; hay que probarlo con el clicker real).
2. **Teclado:**
   - Siguiente: `ArrowRight`, `PageDown`, `Space`. Anterior: `ArrowLeft`, `PageUp`. Logitech manda PageDown y PageUp en «siguiente» y «anterior» (confirmé).
   - `Home` y `End` van al primer y al último paso. `Escape` sale.
   - `.` (pantalla en negro en el clicker, confirmé) se ignora o pone el fondo en negro.
   - **No capturar teclas si el foco está en un `input`, `select` o control deslizante**, para no robarle las flechas a un filtro (se deduce).
3. **Foco:**
   - El recorrido **no es modal**: no hay trampa de foco ni `inert` en el resto, porque quien presenta puede necesitar tocar un filtro en vivo (se deduce, en línea con el panel no modal de §10).
   - Al cambiar de paso, el foco va al bloque resaltado (`tabindex="-1"`, `focus({ preventScroll: true })`) y luego `scrollIntoView({ block: 'center' })`.
   - Una región `aria-live="polite"` anuncia «Paso 3 de 7: Competidores».
   - Al salir con Escape, el foco vuelve al botón «Presentar».
4. **Resaltar sin oscurecer la cifra:**
   - El bloque activo lleva un **anillo por fuera**: `outline: 3px solid var(--acento); outline-offset: 6px`. El `outline` no ocupa espacio ni tapa contenido, y con margen positivo se dibuja fuera del bloque (se deduce de la definición de `outline`).
   - **No usar la capa oscura con `box-shadow` de 9999 px** que usan las librerías de tours. Oscurece todo lo demás y en proyector se pierde contraste (se deduce; no medí lúmenes).
   - El resto del dashboard **no se atenúa**: si quien presenta señala otra cifra, tiene que leerse.
   - La nota del paso va en una **barra acoplada abajo**, que nunca se superpone al bloque. Con `@supports (anchor-name: --a)` se puede anclar al costado del bloque, con `position-try-fallbacks: flip-block, flip-inline`. Es opcional y su fallback es la barra (se deduce).
5. **Movimiento** (aquí vive el momento expresivo, en el camino):
   - Entre pasos, el anillo se desplaza del bloque anterior al siguiente: un solo elemento con `pointer-events: none`, animado con WAAPI, 400 ms, curva expresiva de Carbon.
   - Si el paso cambia de capa, fundido cruzado del `<main>` con View Transition (`:root` en `none`).
   - Si el paso cambia filtros, las marcas se mueven por clave como en §2.
   - **Con `prefers-reduced-motion: reduce`, todo pasa a 0**: el anillo salta, `scrollIntoView` sin `behavior: 'smooth'` y sin View Transition.
   - Sin avance automático. Si algún día se agrega, WCAG 2.2.2 exige poder pausarlo (confirmé, criterio A).
   - WCAG 2.3.3 (AAA) pide que la animación disparada por interacción se pueda desactivar y lista `prefers-reduced-motion` como técnica suficiente (C39 y SCR40) (confirmé).
6. **Pantalla completa:** no llamar a `requestFullscreen()`. En pantalla completa, el navegador se queda con Esc para salir y es probable que la página no reciba ese Escape (asumo, no lo probé). Mejor que la persona use F11 o el modo del sistema operativo.

---

## 4. Librerías: medidas y veredicto

Pesos con esbuild 0.28.2, `--bundle --minify --format=esm`, React como externo y `gzip -9`. Datos del registro npm consultados el 2026-10-14. Ninguna está deprecada (`npm view … deprecated` vacío) (confirmé).

| Paquete y entrada | gzip | Última versión (fecha) | Licencia | Veredicto |
|---|---|---|---|---|
| Helper nativo (FLIP + View Transition + reduce) | **0,4 KB** | n/a | propia | **Usar** |
| `recharts` 3.10.1 (vs 2.15.4) | 122,8 KB (+7,2 KB vs 115,5 KB) | 3.10.1 (2026-07-25) | MIT | **Usar: subir de versión** |
| `motion` 14.2.0, `motion/react` (`motion` + `AnimatePresence`) | 46,8 KB | 14.2.0 (2026-10-13) | MIT | No: el costo no se justifica para 240 ms |
| `motion/react-mini` (`useAnimate`) | 3,5 KB | igual | MIT | Única alternativa razonable si se quiere secuenciar desde React |
| `motion` vanilla (`animate`, `stagger`) | 24,1 KB | igual | MIT | No |
| `gsap` 3.15.0, núcleo | 27,6 KB | 3.15.0 (2026-04-13) | «Standard no-charge license», **no es OSI** | No: licencia propietaria en una demo para clientes |
| `gsap` + `Flip` | 36,3 KB | igual | igual | No |
| `d3-transition` 3.0.1 + `d3-selection` | 12,5 KB | 3.0.1 (2021-06-09) | ISC | No: estable pero sin cambios desde 2021, y pelea con React por el DOM |

`framer-motion` sigue publicándose en paralelo con la misma versión, 14.2.0 (2026-10-13), y no está deprecada (confirmé). La mención de GSAP en el header de otro producto de la agencia, en la guía de técnicas §4, es de ese producto. Este repo no usa ninguna librería de animación (confirmé, `package.json`).

---

## 5. Lo que encontré en el repo que afecta esto

- Ningún archivo menciona `prefers-reduced-motion`, `motion-reduce` ni `motion-safe` (confirmé).
- El contenedor `animate-fadeIn` envuelve las cuatro capas, pero el `div` persiste. La animación solo corre en la primera carga y **cambiar de capa es un corte seco**, seguido del dibujo de 1,5 s de Recharts (se deduce del código).
- Los botones de capa usan `transition-all duration-300`: 300 ms, fuera del régimen, y `all` anima propiedades que fuerzan repintado (confirmé el código; lo segundo se deduce).

---

## 6. Cuándo esto estaría equivocado y la señal temprana

- **Si quien presenta no usa Chrome** (por ejemplo, Firefox anterior a 144 o Safari 17 en una Mac sin actualizar), el cambio de capa y el anillo del recorrido degradan a corte. No se rompe nada, pero se pierde el momento. **Señal:** en el primer ensayo, ejecutar `typeof document.startViewTransition` en la consola de la laptop de reuniones.
- **Si 240 ms resulta corto para seguir reordenamientos grandes**, el cliente pregunta «¿cuál era la mía?» después de filtrar. **Señal:** en una prueba de pasillo con 5 personas, pedir que digan a dónde se movió su marca tras un filtro que la mueve tres o más puestos. Si fallan más de una, subir a 400 ms solo en reordenamientos o agregar escalonado.
- **Si la migración de Recharts 2 a 3 rompe más de lo esperado.** **Señal:** más de un día de trabajo en la rama de migración. Plan B: Recharts 2 con `isAnimationActive={false}` en reordenamientos (corte limpio, que es honesto) y FLIP solo en tablas HTML.
- **Las coberturas de `interestfor`, `popover=hint` y `position-anchor` están infladas** por cómo caniuse-lite agrupa Chrome Android. Si alguien las cita como dato, la conclusión de «no usar» no cambia, pero la cifra sí.

---

## 7. Fuentes (consultadas el 14 de octubre de 2026)

- MDN browser-compat-data 8.1.5 (npm, 2026-10-08); web-features 3.42.0 (npm, 2026-10-14); caniuse-lite 1.0.30001816 (npm, 2026-10-13).
- webstatus.dev API: `https://api.webstatus.dev/v1/features/{view-transitions, anchor-positioning, scroll-driven-animations, interest-invokers, popover-hint, text-wrap-pretty}`.
- W3C, CSS View Transitions Module Level 1, editor's draft: https://drafts.csswg.org/css-view-transitions-1/
- MDN, «Using the View Transition API»: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
- Chrome for Developers, «Same-document view transitions» (actualizado el 25-09-2024): https://developer.chrome.com/docs/web-platform/view-transitions/same-document
- Coyier, C. (2026-08-07). «View Transitions: Careful Not To Make Stuff Unclickable». https://blog.master.dev/view-transitions-careful-not-to-make-stuff-unclickable/
- Bostock, M. (2012-05-16). «Object Constancy». https://bost.ocks.org/mike/constancy/
- Bostock, M. (2012-01-19). «Path Transitions». https://bost.ocks.org/mike/path/
- Heer, J. y Robertson, G. (2007). Animated Transitions in Statistical Data Graphics. IEEE TVCG 13(6), 1240-1247. https://homes.cs.washington.edu/~jheer/files/2007-AnimatedTrans-InfoVis.pdf
- `@carbon/motion` 11.54.0 (npm, 2026-10-07); Carbon, Motion: https://carbondesignsystem.com/elements/motion/overview/
- Recharts 3.10.1, código y tipos en npm (`lib/animation/matchBy.js`, `types/cartesian/Line.d.ts`).
- Tableau, «Create a Story»: https://help.tableau.com/current/pro/desktop/en-us/story_create.htm
- Google, «Present a report» (Looker Studio): https://docs.cloud.google.com/looker/docs/studio/present-a-report
- Flourish Help Center, «Creating a story» (solo fragmento de búsqueda): https://helpcenter.flourish.studio/hc/en-us/articles/8761559998351-Creating-a-story
- Goldenberg, R. (2017). «Responsive scrollytelling best practices». https://pudding.cool/process/responsive-scrollytelling/
- Nieman Lab y otros sobre Tse (2016), «Why We Are Doing Fewer Interactives».
- Logitech, «HID and keyboard codes for Logitech R400, R700 and R800 presenters»: https://support.logi.com/hc/en-gb/articles/360023345333
- W3C, Understanding SC 2.3.3 y SC 2.2.2 (WCAG 2.2).

## Anexo: cómo reproducir

Todo está en `/tmp/claude-0/-home-user-Reset-The-Algorithm/51ea13ac-07df-5599-bcc2-d4fad49d92aa/scratchpad/`:

- `extract.cjs`: tabla BCD. Se corre con `node extract.cjs $PWD/bcd`.
- `coverage.cjs`: cobertura global y para Perú.
- `pw/vt-test.mjs` y `pw/vt-scoped.mjs`: captura SVG y bloqueo de clics en View Transitions.
- `bundle/rtest/`: emparejamiento por índice frente a por clave en Recharts 3.
- `bundle/e/*.js`: entradas mínimas para medir pesos.

El repositorio no se modificó.
