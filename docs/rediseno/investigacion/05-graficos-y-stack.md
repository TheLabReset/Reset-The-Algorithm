# 05 · Gráficos y stack de The Algorithm

Medido el 14/10/2026 en Node 22.22, npm 10.9, esbuild 0.28.2 y Chromium de Playwright 1.56. Todo se corrió en el scratchpad; en el repo no se escribió nada (el `docs/rediseno/` sin rastrear que muestra `git status` ya estaba cuando empecé).

## 0. La respuesta corta

**Recomiendo gráficos propios con d3 modular (d3-scale, d3-shape, d3-array, d3-time-format) y SVG escrito en React.** Dos razones, en este orden:

1. **Se puede verificar lo que se dibuja.** Con marcado propio cada barra y punto lleva `data-valor` sin pelear con la librería, y la prueba de humo cruza valor y geometría contra el JSON. Lo demostré en Chromium: las 6 opciones SVG pasan el cruce, y los dos defectos sembrados dan rojo (confirmé).
2. **Pesa unos 100 kB gzip menos.** Recharts cuesta unos 115 kB gzip en la app real; el equivalente con d3 pesa 15 kB (confirmé las dos cifras; el total de unos 87 kB gzip que quedaría se deduce).

Si el equipo prefiere no mantener SVG propio, la alternativa es **Recharts 3, no Recharts 2**: la 2 está deprecada en npm (confirmé).

En stack: **sí** conviene quitar `date-fns`, subir Node en Netlify y pasar a Vite 8 ahora. **No** conviene pasar a Tailwind 4 ni a React 19 todavía. El detalle está en la sección 6.

---

## 1. Qué hay hoy en el repo

| Hecho | Etiqueta |
|---|---|
| Recharts solo se importa en `src/components/OptimizationLayer.jsx` y dibuja **2 gráficos**: una línea con **doble eje** y curva `monotone` (líneas 187 a 197) y una **torta** (líneas 211 a 227) | confirmé |
| `date-fns` está en `package.json` pero **ningún archivo lo importa** (lo busqué en src, scrapers, ml y apify-actors) | confirmé |
| lucide-react se usa con **44 íconos distintos**, no 25 | confirmé |
| `vite.config.js` define `manualChunks: { recharts: ['recharts'] }` con la forma objeto | confirmé |
| Netlify fija `NODE_VERSION = "18"` (`netlify.toml`, línea 16) | confirmé |
| Build actual (Vite 5.4.21, reconstruido en una copia): `recharts` 155,0 kB gzip e `index` 25,5 kB gzip | confirmé |
| El playbook de adaptación (Fase 2) manda cambiar los hex en `tailwind.config.js` y, en su lista de verificación, pide que «los gráficos de Recharts muestren datos» | confirmé |

Doble eje, torta y curvas suavizadas son justo las tres formas que el método de referencia descarta (sección 5.3). Por eso el rediseño reemplaza estos dos gráficos de todos modos, se use o no una librería (se deduce).

---

## 2. Peso de cada opción

El bundle mínimo de cada opción tiene un gráfico de líneas (7 días) y uno de barras horizontales (5 canales), los dos con ejes, montados en React. Lo armé con `esbuild --bundle --minify --format=esm`, con `react` y `react-dom` como external, y lo comprimí con `gzip -9`. Los archivos de entrada están en `libs/src/`. La línea base (solo el montaje, sin gráficos) pesa 0,2 kB.

| Opción | Versión | Renderiza | JS min (kB) | JS gzip (kB) |
|---|---|---|---:|---:|
| d3 modular + SVG propio | scale 4.0.2 · shape 3.2.0 · array 3.2.4 · time-format 4.1.0 · interpolate 3.0.1 | SVG | 43 | 15 |
| uPlot | 1.6.32 | canvas | 53 | 24 (+0,7 de CSS) |
| visx (shape, scale, axis, group) | 4.0.0 | SVG | 68 | 24 |
| Chart.js (con registro selectivo) | 4.5.1 | canvas | 166 | 58 |
| Observable Plot | 0.6.17 | SVG | 278 | 94 |
| Recharts 2 | 2.15.4 | SVG | 396 | 109 |
| Recharts 3 | 3.10.1 | SVG | 388 | 113 |
| nivo (line + bar) | 0.99.0 | SVG | 346 | 116 |
| ECharts modular, canvas | 6.1.0 | canvas | 529 | 180 |
| ECharts modular, SVG | 6.1.0 | SVG | 536 | 184 |

Controles hechos para que estas cifras no engañen:

- **El tree-shaking funcionó.** El import completo pesa más: ECharts 383 kB gzip y `chart.js/auto` 70 kB gzip (confirmé). El metafile de ECharts muestra que solo entran line, bar, grid, tooltip y aria. Sin tooltip ni aria todavía pesa 171 kB gzip (confirmé).
- **Qué arrastra cada librería**, según el metafile: Recharts 3 trae redux toolkit, immer, es-toolkit y decimal.js; Recharts 2 trae lodash (33 kB min) y react-smooth; nivo trae lodash y react-spring; Plot trae d3-geo, d3-selection y d3-transition (confirmé).
- **En la app real**, con esbuild sobre `src/main.jsx` y React incluido: la app completa pesa 187,3 kB gzip; sin Recharts (reemplazado por stubs), 71,9 kB gzip. **Recharts cuesta 115 kB gzip** (confirmé). React 18 con react-dom pesa 45,5 kB gzip (confirmé).
- Vite/Rollup comprime con otra configuración, así que estas cifras pueden moverse unos pocos por ciento (se deduce). El orden entre opciones no cambia.

---

## 3. Estado de cada paquete

Las fechas salen de `npm view <pkg> time --json`, la deprecación de `npm view <pkg>@<v> deprecated` y las descargas de `api.npmjs.org`, semana del 06/10 al 12/10/2026 (confirmé).

| Paquete | Versión | Último release | Licencia | ¿Deprecado? | Descargas/semana |
|---|---|---|---|---|---:|
| recharts 2.x | 2.15.4 | 20/06/2025 | MIT | **Sí**: «1.x and 2.x branches are no longer active. Bump to Recharts v3» | 27,8 M (solo la 2.x) |
| recharts 3.x | 3.10.1 | 25/07/2026 | MIT | no | 26,9 M (solo la 3.x) |
| @visx/shape | 4.0.0 | 11/06/2026 | MIT | no | 6,7 M |
| @observablehq/plot | 0.6.17 | 14/02/2025 | ISC | no | 0,76 M |
| echarts | 6.1.0 | 19/05/2026 | Apache-2.0 | no | 6,4 M |
| chart.js | 4.5.1 | 13/10/2025 | MIT | no | 12,7 M |
| uplot | 1.6.32 | 14/03/2025 | MIT | no | 0,66 M |
| @nivo/bar · @nivo/line | 0.99.0 | 23/05/2025 | MIT | no | 0,95 M · 0,92 M |
| d3-scale | 4.0.2 | 24/09/2021 | ISC | no | 75,7 M |
| d3-shape | 3.2.0 | 20/12/2022 | ISC | no | 95,8 M |
| d3-array | 3.2.4 | 30/05/2023 | ISC | no | 107,7 M |
| d3-time-format | 4.1.0 | 04/12/2021 | ISC | no | 77,5 M |
| d3-interpolate | 3.0.1 | 05/06/2021 | ISC | no | 81,6 M |

Cómo leer esta tabla:

- Las descargas incluyen las transitivas: d3-scale y d3-shape se bajan, entre otras cosas, porque Recharts depende de ellas. No miden cuánta gente las elige directamente (se deduce).
- d3 no publica desde 2021 a 2023. Esto se lee como madurez, no como abandono: no tiene deprecación y Recharts 2 y 3 lo siguen usando por dentro (se deduce). Es el principal riesgo de la recomendación; ver la sección 7.
- nivo sigue en 0.x y Plot en 0.6. Las dos pueden romper la API en una versión menor (se deduce por semver).

---

## 4. Accesibilidad

Lo medí en Chromium: busqué `role`, `aria-*` y elementos con `tabindex` dentro del gráfico, y probé Tab más flecha derecha. Ninguna librería generó una tabla alternativa: hubo 0 `<table>` en las 10 pruebas (confirmé).

| Opción | Qué trae (probado) | Teclado | Fuente |
|---|---|---|---|
| Recharts 2 | Nada por defecto. Con `accessibilityLayer` agrega `svg role="application"`, `tabindex`, y un `div role="status"` con `aria-live` | Con `accessibilityLayer`, las flechas mueven el tooltip (confirmé) | Wiki «Recharts and accessibility»: «false by default in 2.x, true by default in 3.0» |
| Recharts 3 | Lo mismo que la 2 con la capa, pero **activado por defecto** (confirmé) | Flechas (confirmé). Con VoiceOver hay que apagar QuickNav, según la wiki | Wiki y guía de migración 3.0 |
| visx | Nada propio. El código de shape, axis y group no tiene `aria-` ni `tabIndex` (confirmé con grep); los roles los pone uno | No | Código fuente instalado |
| Observable Plot | `ariaLabel`, `ariaDescription` y `ariaHidden` por marca y por figura. Rotula sola los ejes (`aria-label="x-axis tick"`, confirmé en el DOM). El canal `title` genera `<title>` | No (0 enfocables) | `src/mark.d.ts` de 0.6.17 |
| ECharts | `AriaComponent` (opcional) arma un `aria-label` descriptivo y patrones (decal). **En la prueba generó «the data for 2026-10-06 is 0, 118»**: está en inglés y mezcla el índice con el valor (confirmé) | No documentado | Handbook ECharts, «Aria» |
| Chart.js | Nada. El código fuente tiene 0 `aria-` (confirmé). La documentación deja en manos del desarrollador el `role="img"`, el `aria-label` y el contenido de respaldo dentro del `<canvas>` | No | chartjs.org/docs, «Accessibility» |
| uPlot | Nada. El código fuente tiene 0 `aria-` y 0 `role` (confirmé) | No | `uPlot.esm.js` |
| nivo | `role`, `ariaLabel`, `ariaLabelledBy` y `ariaDescribedBy`. En bar: `isFocusable`, `barAriaLabel`, `barRole`, `barAriaHidden` y otros (confirmé en los tipos). En line: `isFocusable`, `pointAriaLabel` | `isFocusable` existe; no lo probé en navegador (asumo que funciona) | `dist/types` de @nivo/bar y @nivo/line 0.99 |
| d3 + SVG propio | Lo que uno escriba: `role="img"`, `<title>` y `aria-labelledby` en la prueba (confirmé). La tabla alternativa también se escribe a mano | Lo que uno escriba | |

Lectura: ninguna opción entrega gratis la tabla alternativa que usa el método de referencia. La única con navegación por teclado lista es Recharts 3 (confirmé). Con SVG propio, la accesibilidad cuesta escribir unas líneas por componente, y queda bajo control del equipo (se deduce).

---

## 5. La prueba clave: `data-valor` en cada marca

Prueba en Chromium (`libs/pw/probar.cjs` y `libs/pw/geom.cjs`) con dos controles:

1. Hay exactamente 12 marcas con `data-valor` (7 puntos y 5 barras), y sus valores coinciden con la data.
2. **Cruce geométrico.** Un `data-valor` copiado del dato no prueba que la barra mida bien. Por eso además se comprueba que ancho/valor sea constante en las barras y que la altura de cada punto sea lineal en su valor (error menor a 1 px).

| Opción | ¿`data-*` por marca? | Cómo | Cruce |
|---|---|---|---|
| d3 + SVG propio | Sí, nativo | Atributo JSX en `<rect>` y `<circle>` | verde (confirmé) |
| visx | Sí | Las props extra de `<Bar>` llegan al `<rect>` | verde (confirmé) |
| Recharts 2 y 3 | Sí | Barras: `<Cell data-valor>` llega al `<path>` de cada barra **sin reemplazar el dibujo** (confirmé en las dos versiones). Puntos: hace falta la función `dot`, que reemplaza el dibujo del punto | verde (confirmé) |
| Observable Plot | Sí | Con el *render transform* (`render?: RenderFunction`): después de `next()`, se anota cada hijo del `<g>` según `index[k]` | verde (confirmé) |
| nivo | Sí, pero reemplazando el dibujo | `barComponent` propio y una capa propia para los puntos | verde (confirmé) |
| ECharts (SVG) | No | No hay opción para atributos por elemento: 0 de 12 (se deduce de la prueba y de la API) | no aplica |
| ECharts (canvas), Chart.js, uPlot | No | Canvas | no aplica |

**Prueba negativa** (confirmé): con la barra de Meta dibujada un 10 % de más y `data-valor` correcto, la razón ancho/valor da 1,10 y la prueba sale **rojo**. Con un punto 20 leads más abajo, el error da 25 px y sale **rojo**. Las versiones sanas dan 1,00 y 0 px.

Matiz importante: en Recharts y nivo, poner `data-valor` en los puntos obliga a reemplazar su dibujo con código propio. Ahí se pierde parte de lo que se paga en peso (se deduce).

---

## 6. Dependencias del repo y qué actualizar

`npm outdated --json` y `npm audit` se corrieron en `scratchpad/repo-copy` (copia de `package.json`, `package-lock.json` y `node_modules`).

| Paquete | Instalada | Fecha | Última | Fecha | Licencia | Deprecada | Nota |
|---|---|---|---|---|---|---|---|
| react / react-dom | 18.3.1 | 26/04/2024 | 19.3.1 | 14/10/2026 | MIT | no | |
| recharts | 2.15.4 | 20/06/2025 | 3.10.1 | 25/07/2026 | MIT | **sí** | rama 2.x inactiva |
| lucide-react | 0.294.0 | 28/11/2023 | 1.57.0 | 14/10/2026 | ISC | no | 0.294 declara peer `react ≤18` |
| date-fns | 2.30.0 | 30/04/2023 | 4.4.0 | 29/05/2026 | MIT | no | **no se usa** |
| @vitejs/plugin-react | 4.7.0 | 18/07/2025 | 6.1.2 | 05/10/2026 | MIT | no | la 6 exige `vite ^8` |
| vite | 5.4.21 | 20/10/2025 | 8.3.4 | 08/10/2026 | MIT | no | la 5.x ya no recibe parches |
| tailwindcss | 3.4.18 | 01/10/2025 | 4.3.3 | 16/07/2026 | MIT | no | etiqueta `v3-lts` = 3.4.19 (10/12/2025) |
| postcss | 8.5.6 | 16/06/2025 | 8.5.30 | 12/10/2026 | MIT | no | avisos de seguridad hasta 8.5.22 |
| autoprefixer | 10.4.22 | 10/11/2025 | 10.6.1 | 15/09/2026 | MIT | no | |
| @types/react | 18.3.27 | 18/11/2025 | 19.3.0 | 09/09/2026 | MIT | no | |
| @types/react-dom | 18.3.7 | 30/04/2025 | 19.3.0 | 09/09/2026 | MIT | no | |

Contexto que mueve la decisión (todo confirmé):

- **Soporte de Vite** (vite.dev/releases): reciben parches 8.3, 8.2 y 7.3, y solo seguridad 8.1 y 6.4. «All versions before these are no longer supported.» La 5.x quedó fuera; su último release es del 20/10/2025.
- **Node** (calendario oficial): Node 18 terminó el 30/04/2025 y Node 20 el 30/04/2026. **Netlify construye con Node 18.** Vite 8 exige `^20.19.0 || >=22.12.0`.
- **npm audit**: 17 avisos (1 low, 3 moderate, 13 high, 0 critical). Casi todos son de herramientas de build y del servidor de desarrollo (vite, esbuild, rollup, la cadena de tailwind 3). El único que viaja en el bundle publicado es **lodash**, que entra por Recharts 2 (confirmé con `npm ls`). Que no sea explotable en una demo estática con data propia se deduce. Con Vite 8 bajan a 10 (confirmé).

### Pruebas de actualización (en copias, con build y comparación de píxeles en las 4 capas a 1440 px)

| Cambio | Qué hubo que tocar | Resultado | Píxeles distintos (capas 1 · 2 · 3 · 4) |
|---|---|---|---:|
| Vite 5 → **8.3.4** + plugin-react **6.1.2** | Falla con `TypeError: manualChunks is not a function`. Se arregla quitando el bloque `rollupOptions` de `vite.config.js` | Build en 1,6 s contra 5,4 s (una corrida); JS 174,9 kB gzip contra 180,5; mismo DOM, 2 gráficos y 0 errores de consola | 0,00 · 0,00 · 0,00 · 0,11 % |
| Tailwind 3 → **4.3.3** (herramienta oficial `@tailwindcss/upgrade`) | 9 archivos tocados, **borra `tailwind.config.js`** y pasa los tokens a `@theme` en `index.css` | Construye, pero cambia el interlineado del texto de las tarjetas: la capa 1 crece 25 px | **22,93** · 0,01 · 0,13 · 1,45 % |
| React 18 → **19.3.1** | Nada | Mismo DOM y 0 errores, pero el runtime pasa de 45,5 a **68,8 kB gzip** (+23). Además lucide 0.294 no declara React 19 | 0,00 · 0,00 · 0,00 · 0,02 % |
| lucide 0.294 → **1.57** | Nada: los 44 nombres siguen existiendo como alias (por ejemplo `CircleAlert as AlertCircle`) | Build sin errores | no medido |

El 0,11 % de la capa 4 con Vite 8 se lo atribuyo a la animación de Recharts en el momento de la captura (asumo). Las capturas están en `scratchpad/capturas/`.

### Peso de lucide-react (íconos con tree-shaking, React external)

| Caso | 0.294.0 (gzip kB) | 1.57.0 (gzip kB) |
|---:|---:|---:|
| 25 íconos | 2,7 | 4,3 |
| 44 íconos (los que usa el repo) | 4,0 | 6,1 |
| Todo el paquete sin tree-shaking | 114,3 | no medido |

El tree-shaking funciona. Los íconos no son un problema de peso (confirmé).

### Qué hacer y cuándo

| Acción | Cuándo | Riesgo | Por qué |
|---|---|---|---|
| Quitar `date-fns` | Ahora | Nulo | No se importa en ningún lado (confirmé) |
| Netlify a `NODE_VERSION = "22"` | Ahora | Bajo | Node 18 y 20 ya terminaron. La 22 tiene soporte hasta el 30/04/2027 (confirmé). Si se quiere más plazo, la 24 llega hasta el 30/04/2028 |
| Vite 8 + plugin-react 6 | Ahora, en un PR aparte y antes del rediseño | Bajo | Un solo cambio de config y píxeles iguales (confirmé). La 5.x ya no recibe parches. Falta probar `npm run dev` y HMR, que no medí |
| Recharts 2 → d3 propio | Con el rediseño | Medio (código nuevo) | Secciones 2 y 5. De paso desaparece lodash del bundle |
| lucide 1.x | Con el rediseño | Bajo | +2 kB. Los alias se mantienen; el dibujo de algunos íconos pudo cambiar (asumo, no lo comparé) |
| Tailwind 4 | **No ahora** | Medio-alto | Mueve el layout que el cliente ya vio y rompe la Fase 2 del playbook, que manda editar hex en `tailwind.config.js`. Solo vale la pena si el rediseño reescribe los estilos desde cero; en ese caso conviene empezar directo en v4 y actualizar el playbook en el mismo PR (se deduce) |
| React 19 | **No ahora** | Bajo técnico, pero sin beneficio | +23 kB gzip y nada que la demo necesite. Revisarlo cuando una dependencia lo exija (se deduce) |

---

## 7. La mejor objeción y su respuesta

**«El equipo es pequeño. Escribir gráficos propios es código que alguien tiene que mantener, mientras que una librería lo resuelve gratis.»**

Respuesta: hoy son 2 gráficos, y los dos se van a reemplazar igual por motivos de diseño. El rediseño necesita pocos tipos: línea, barras y quizá una proporción o una tabla. Además, el playbook de adaptación cambia data, textos y tokens por cliente, no la forma de los gráficos. El código de dibujo se escribe una vez y no se toca en cada adaptación (se deduce de leer las Fases 0 a 2). Y la librería no es gratis: para poner `data-valor` en los puntos de Recharts o nivo igual hay que escribir la función que dibuja el punto (confirmé).

Si aun así se elige librería, **Recharts 3** es la mejor opción: 113 kB, MIT, activa, con teclado por defecto y `data-*` vía `<Cell>`. visx (24 kB) es el punto medio si se quiere ahorrar escribir los ejes, a cambio de 4 dependencias más (se deduce).

## 8. Cuándo esto estaría equivocado

- **Si el rediseño pide muchos tipos de gráfico interactivos** (zoom, cepillado, mapas, sankey) o nadie del equipo se hace cargo del código SVG, la librería gana. **Señal temprana:** más de unos 8 componentes de gráfico, o que agregar un tipo nuevo tome más de un día.
- **Si Vite 8 se porta distinto en desarrollo.** Solo comparé el build de producción. **Señal temprana:** errores en `npm run dev` o HMR que no recarga.
- **Si las cifras de peso se usan con más precisión que la del método.** Son de esbuild con `gzip -9`, no de Vite; una diferencia de 2 o 3 kB entre opciones no dice nada. La diferencia de 100 kB sí.

## Archivos

- Entradas de cada opción: `scratchpad/libs/src/*.jsx`; script de build: `scratchpad/libs/build.sh`
- Bundles medidos: `scratchpad/libs/out/`; con React incluido, para el navegador: `scratchpad/libs/outfull/`
- Pruebas en Chromium: `scratchpad/libs/pw/probar.cjs` (data-valor y accesibilidad), `geom.cjs` (cruce geométrico y prueba negativa), `pix.cjs` (diferencia de píxeles), `cmp.cjs` (DOM)
- Copias del repo: `scratchpad/repo-copy` (Vite 5), `scratchpad/v8`, `scratchpad/tw4`, `scratchpad/r19`
