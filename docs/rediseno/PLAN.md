# Plan del rediseño de The Algorithm

**THE LAB · 14 de octubre de 2026 · rama `claude/modest-tesla-a7501f` · fase 3, para aprobación**

Etiquetas: **confirmé** (medido ejecutando), **se deduce**, **asumo**. La auditoría está en `auditoria/`, la investigación en `investigacion/` y la galería en `galeria/index.html` (se abre sin servidor).

---

## 0. La respuesta corta

**Propongo rehacer la demo sobre una data de muestra con tiempo y una capa de cálculo única, y recién encima cambiar la forma.** Lo que más pesa, en este orden:

1. **Hoy la demo se contradice a sí misma** (share of voice que suma 105 %, un índice que no es la suma de sus partes, el presupuesto al 100 % en una capa y al 93 % en otra, el período sacado del reloj) y no tiene ninguna serie de tiempo salvo siete días escritos a mano (confirmé, `auditoria/AUDITORIA.md`). Ninguna forma nueva arregla eso. El generador con semilla y `armarVista` ya existen como prototipo en `galeria/muestra/`. Un verificador adversarial les encontró 10 defectos graves fuera del período por defecto (por ejemplo, el día en que Meta no entregó datos se sumaba como dato); están corregidos y hoy pasan 12 reglas en 33 períodos, con prueba negativa (confirmé, `galeria/pruebas/`). Esa es la mejor evidencia de por qué esta pieza va primero.
2. **La forma la elige la pregunta, y el título dice la lectura calculada.** Cada bloque abre con una conclusión escrita a partir del dato, que cae al título descriptivo si el dato no la sostiene. Es lo que alguien que ve dashboards cada semana nota en los primeros diez segundos (se deduce del informe de referencias, patrones 1 y 2).

Antes de construir necesito cinco decisiones (sección 10). La más urgente no es de diseño: **el repo es público y tiene data y nombres de un cliente real** (confirmé).

---

## 1. Qué cambia de fondo

| Hoy | Después | Por qué |
|---|---|---|
| Números escritos dentro de 4 componentes (236 literales) | Generador con semilla fija (`src/muestra/`), configuración con el origen de cada parámetro, y `armarVista(data, filtros)` pura | Una sola implementación de cada regla; se prueba sin navegador; cambiar la configuración cambia la pantalla |
| Una foto de enero y 7 días | 638 días (1 de enero de 2025 al 30 de setiembre de 2026), 4 canales, 12 sedes, embudo de cohorte, hora del lead, búsquedas y conversación semanales | Período anterior y año anterior comparables para cualquier corte; estacionalidad real de Google Trends (informe 06 §4.4) |
| Competidores reales con juicios inventados («masificación», «nivel de amenaza») | Competidores reales (Smart Fit, b2, Bio Ritmo, KO, Mega Force) solo con conversación de muestra que suma 100 % con «Otros», sin sentimiento ni atributos, con la marca «dato de muestra» en el mismo bloque | Pedido del usuario (competencia real) dentro del límite que sostiene el D. Leg. 1044: la data sintética no es verdadera, así que ningún juicio sobre una marca real queda amparado (informe 06 §3; no reemplaza a un abogado) |
| «FitZone» (existe un gimnasio y un software con ese nombre) | Marca ficticia de trabajo «Vitalto», verificada sin homónimo en Perú en web y dominios | Falta revisar Indecopi a mano: su buscador dio error 502 desde este entorno (informe 06 §1) |
| Dólares y soles mezclados | Todo en soles | Una sola moneda (regla R13) |
| Recharts 2 (deprecado; su chunk pesa 155,8 kB gzip y quitarlo baja la app en 115 kB, porque parte de ese chunk lo comparte la app; 2 gráficos) | SVG propio con d3 modular (≈ 15 kB) y `data-valor` en cada marca | Medido en la auditoría (chunk) y en el informe 05 (app con y sin Recharts; 15 contra 109 kB para línea más barras); y la prueba de humo cruza pantalla contra cálculo |

---

## 2. El sistema

### 2.1 Tokens

Dos capas, como en la investigación de referencia: **primitivos** (paleta en OKLCH, nadie los usa directo) y **semánticos** (lo único que tocan los componentes). Valores completos y contrastes medidos en `investigacion/04-identidad.md`; los de la identidad B, en `galeria/plantilla.html`.

| Familia | Tokens semánticos | Regla |
|---|---|---|
| Superficies | `--fondo`, `--superficie`, `--elevada` | Tres niveles; el bloque no lleva sombra |
| Texto | `--texto-1`, `--texto-2`, `--texto-3` | Todos ≥ 4,5:1 sobre las tres superficies de su tema (confirmé en ambas identidades) |
| Bordes | `--borde` (decorativo), `--borde-control` (≥ 3:1) | |
| Acento | `--acento`, `--foco` | Marca y selección. **Nunca estado** |
| Estado | `--mejora`, `--empeora`, `--atencion` | Siempre con flecha y signo escritos; nunca como relleno de serie |
| Series | `--s1` a `--s5` en orden fijo, `--previa` gris | Validadas con el validador de la skill de dataviz en claro y oscuro (A: peor ΔE adyacente con daltonismo 16,7 y 17,5, informe 04; B: 13,0, salida en `galeria/README.md`). Dispersión y pequeños múltiplos: 3 series como máximo |
| Secuencial | `--q0` a `--q6`, un solo tono | Mapas de calor, teselas, calendario |
| Tipografía | `--f-cifra` Bebas Neue (solo la cifra protagonista y el título de capa), `--f-texto` Montserrat variable con `tnum` | Montserrat con `tnum` deja los 10 dígitos en un solo ancho en los pesos 400, 600 y 700 (confirmé en el archivo, informe 04). Escala de texto 12, 13, 15, 17, 22, 28; cifras 22, 34, 48, 64. Nada bajo 12 px |
| Espacio | Base 4: 4 a 16 dentro de un componente, 16 a 32 entre componentes, 40 a 64 entre secciones | |
| Radio | 6 control, 10 bloque, 14 lo que flota | Tres radios con rol (hoy hay 6 sin rol) |
| Elevación | Sin sombra en bloques; sombra solo en popover, menú y panel lateral | |
| Movimiento | 70, 110, 150, 240 ms con `cubic-bezier(0.2, 0, 0.38, 0.9)`; 400 ms solo en el recorrido guiado; todo a 0 con `prefers-reduced-motion` | Informe 03 |

Un chequeo automático (`npm run sistema`) rechaza colores, tamaños de letra, radios y duraciones escritos fuera de `tokens.css`, en CSS y en JSX, con prueba negativa de casos sembrados.

### 2.2 Formato de números y fechas

Formateador propio (el `Intl.NumberFormat('es-PE')` da punto decimal y coma de miles, al revés de la norma peruana; confirmé ejecutando en el proyecto anterior). Prototipo en `galeria/muestra/formato.js` con 22 casos en `galeria/pruebas/formato.prueba.mjs` (confirmé 22 de 22; con el separador cambiado, 15 de 22).

| Caso | Hoy | Después |
|---|---|---|
| Conteo | 1,850 | 1850 · 12 500 (espacio duro desde 5 cifras) |
| Dinero | $11.2 | S/ 15,78 en CPL; S/ 58 521 en inversión, sin céntimos (setiembre de 2026 en la muestra) |
| Porcentaje | 2.7% | 2,7 % |
| Variación | -17.0 | −17 % (menos tipográfico; el cero sin signo ni color) |
| Período | «1-14 Octubre 2026» del reloj | «1 al 30 de setiembre de 2026», de los filtros |
| No medido | 0 o nada | «sin dato», nunca cero |
| Conteo chico | 0 % | «<1 %» si hay casos |

El separador decimal es la pregunta 4.

### 2.3 Componentes y la regla que cumplen por construcción

| Componente | Reemplaza a | Regla que cumple solo |
|---|---|---|
| `Bloque` | Tarjetas sueltas | Declara sus fuentes; si una no cargó o el período no cae en su serie, pinta el estado y no los hijos |
| `Lectura` (título calculado) | Títulos descriptivos en inglés | Recibe una condición y dos textos; si la condición no se cumple con el dato, muestra el descriptivo. Se prueba en todos los estados |
| `Cifra` + `Delta` | Tarjetas de cuatro colores | Sin comparación exige el motivo escrito; `null` dibuja «sin dato»; el cero no lleva color ni flecha; color con flecha, signo y texto para lector de pantalla |
| `Linea` | Recharts con doble eje | Una escala; rectas entre días; un día sin dato corta la línea; valor final rotulado; período anterior en gris; eventos dibujados al pie |
| `Dumbbell` | Tarjetas por canal | Dos valores de la misma escala por fila; la diferencia es el largo |
| `Bala` | Pastillas de estado | Meta dibujada; estado también escrito; bandas en un solo tono |
| `Barras` | Torta, listas | Un color; período anterior como raya; el cero no dibuja nada; ordenadas |
| `Etapas` | Embudo de tarjetas iguales | Solo con cohorte: cada etapa es subconjunto de la anterior por construcción; si la cohorte no maduró, lo dice |
| `Reticula` | Porcentajes sueltos | 100 cuadros por mayor resto; solo la parte que importa en color |
| `Slope` | Tarjetas de competencia | Dos momentos, una escala, rótulos que no se pisan |
| `MapaCalor` | Pastillas «Muy alta» | Un tono, escala visible, `null` rayado |
| `ListaSedes` / `Teselas` | (no existía) | Teselas iguales: ningún distrito pesa más por su superficie |
| `Aluvial` | (no existía) | Solo con cohorte cerrada; si no, se niega a dibujar |
| `Tabla` | Tablas centradas | Números a la derecha y tabulares, barra en celda opcional, alternativa de cada gráfico |
| `Ayuda` | Acordeones con «Cómo se calcula» | Toggletip: qué mide, fórmula, fuente, qué no incluye; Escape cierra, el foco vuelve |

### 2.4 Estados

| Estado | Ejemplo en la data de muestra | Qué dice | Qué no hace |
|---|---|---|---|
| Cargando | Solo si tarda más de 1 s (la data local carga antes) | Esqueleto con la altura final | Spinner de pantalla completa |
| La fuente no cargó | Meta, 14 de julio de 2026 (está en la data) | «Meta no entregó datos ese día»; la línea se corta | Mostrar cero |
| Sin datos en el período | Un rango sin pauta | «Hubo pauta cero en esas fechas» | Verse igual que la caída |
| Fuera de lo medido | Los Olivos antes del 2 de marzo de 2026; cualquier fecha antes del 1 de enero de 2025 | «La sede abrió el 2 de marzo: sin año anterior» | Comparar contra una ventana sin serie |
| En maduración | Leads de los últimos 14 días | «Cohorte abierta: faltan inscripciones por ocurrir» | Comparar una tasa inmadura contra una cerrada |
| No se mide | La conversación no se abre por sede | «Este bloque no sigue el filtro de sede» | Simular un filtro que no existe |

Un selector «Estados» (como el de la maqueta de referencia) deja mostrarlos en la reunión.

---

## 3. Mapa de data a forma

Una fila por bloque del catálogo. La forma elegida y por qué le gana a las otras dos candidatas. Las seis más importantes están dibujadas en la galería.

| Bloque | Forma elegida | Le gana a | Por qué |
|---|---|---|---|
| G1 Cabecera | Barra con período escrito, frescura por fuente y «datos de muestra al 30 de setiembre de 2026» | Reloj; «actualizado hace X» | La única fecha verdadera es la de corte de cada fuente |
| G2 Navegación | Cuatro pestañas numeradas (es un recorrido) | Botones de colores; menú lateral | El número dice que hay un orden; el color no decía nada |
| G3 Pie | Crédito en texto | Punto que late | Nada vivo |
| D1 Veredicto de señales | `Cifra`: demanda de la categoría (índice de «gimnasio», 4 semanas) contra el año anterior + frescura por fuente | Puntaje global /10; cuatro puntajes /10 | Un dato medible con comparación, en vez de un puntaje inventado |
| D2 Cuatro fuentes | Pequeños múltiplos con eje común, una línea por fuente y la frase que la línea no dice | Cuatro tarjetas de texto; una línea con cuatro series | Se ve qué fuente se mueve sin leer párrafos |
| D3 Multi-fuente | Se funde con la capa 2 como «sugerencia del modelo» | Bloque con degradado | Es una decisión, no una señal |
| D4 Búsquedas | Dumbbell: interés de cada término, año anterior contra ahora | Tabla con «↑»; bump chart | La pregunta es cuánto cambió; con 6 términos el bump se enreda |
| D5 Hashtags | Se borra; si se conserva, dot plot de crecimiento solo local | Tabla con vistas globales | «2,5 B globales» no dice nada sobre Lima |
| D6 Sonidos | Se borra | | No responde ninguna pregunta y nombra artistas reales |
| D7 Temas en redes | Dispersión volumen contra crecimiento, rótulo directo | Tabla; barras dobles | Dos medidas por tema en un plano. Sin sentimiento numérico |
| D8 Campañas Meta | Pasa a capa 4 como `Bala` por campaña | Tabla con colores | Es resultado, no señal |
| D9 a D11 Web | Capa 4: una cifra (conversiones web) con comparación y franja de fuentes | Cuatro tarjetas; lista de % | Una cifra protagonista; el resto en texto |
| D12 Páginas | `Tabla` con barra en celda y cobertura del recorte escrita | Tabla centrada | Números alineados y el recorte declarado |
| D13 Keywords | Va a la `Ayuda` de la fuente | Bloque violeta | Es método, no resultado |
| C1 Conversación (nuevo) | **Slope** de share of voice, hace un año contra ahora | Bump chart; franja del mes | Galería, bloque 6: con dos marcas casi empatadas el bump zigzaguea por un punto |
| I2 Índice | **Bullet 0 a 100** con marca del mes anterior y franja de aportes | Línea de 12 meses; barras de puntaje | Galería, bloque 4: el largo se lee con precisión y los aportes dicen qué lo mueve |
| I3 Componentes | Lista de aportes debajo del bullet (puntaje × peso) | Cinco tarjetas | Hoy no suman; ahora suman el índice por construcción |
| I4, I5, E4 Sugerencias | Una sola lista de tres, título con cifra, «sugerencia del modelo», enlace al bloque que la sostiene | Cinco tarjetas con confianza inventada | Sin porcentaje de confianza que no se calcula |
| I6 Audiencias | `Tabla` de tres filas con CPL real contra meta (punto y raya) | Tarjetas | Hoy solo hay meta, sin real |
| I7 Pilares | Dispersión alcance contra tasa de interacción (data de `CONTENT_PILLARS`, hoy sin usar) | Tarjetas de eslóganes | Es inteligencia, no copy |
| E2 Presupuesto | Línea de inversión acumulada contra la recta del plan, con hoy marcado | Barra al 100 %; cifra sola | Responde «¿vamos al ritmo?», que es la pregunta real |
| E3 Canales | **Dumbbell** % de inversión contra % de leads, y `Bala` de CPL contra meta al lado | Dispersión | Galería, bloque 2: la diferencia es el largo; la dispersión con 4 puntos sobra |
| E5 Servicios | Dispersión volumen contra CPL | Tarjetas de seis cifras | Dos medidas por servicio |
| E6 Cuándo pautar | **Mapa de calor hora × día** | Líneas por día; barras por franja | Una pieza, un tono; galería, bloque 7 |
| E7 Sedes (nuevo) | **Lista ordenada por zona** con raya del año anterior | Teselas; dumbbell | Galería, bloque 5: largo sobre escala común; las teselas quedan para el recorrido |
| O2 KPIs | `Cifra` protagonista: leads del período con año anterior; CPL y inversión en texto | Cuatro tarjetas | Una cifra grande por bloque |
| O3 Evolución | **Línea diaria con el año anterior en gris** y eventos al pie | Pequeños múltiplos; calendario | Galería, bloque 1 |
| O4 Leads por canal | Se funde con E3 | Torta | Ya lo responde el dumbbell |
| O5 Embudo | **Etapas** de una cohorte cerrada | Retícula; aluvial | Galería, bloque 3; la retícula va como resumen «de cada 100» y el aluvial como momento del recorrido |
| O6 Umbrales CPL | `Bala` por audiencia con bandas meta, alerta y pausa | Listas de umbrales | Hoy no muestra el CPL actual |
| O7 Alertas | Anotaciones sobre la línea de O3 el día que ocurren | Tarjetas con franja lateral | El evento se ve donde movió la cifra |
| O8 Competencia | Se funde con C1 | Tarjetas con amenaza | Sin juicios sobre marcas reales |

---

## 4. La narrativa de cada pantalla

Cada capa abre con un veredicto (una cifra con su comparación), sigue con el porqué y cierra con el detalle. Ninguna capa tiene más de tres secciones.

| Capa | Primero (veredicto) | Después (por qué) | Al final (detalle) |
|---|---|---|---|
| 1 · Señales | Demanda de la categoría contra el año anterior, y las fuentes al día | Búsquedas que cambian; conversación contra la competencia | Temas en redes; método de cada fuente en su ayuda |
| 2 · Decisión | Índice de oportunidad con su mes anterior | Qué lo mueve (aportes) y las tres sugerencias del modelo | Audiencias y pilares |
| 3 · Activación | Ritmo de inversión contra el plan | Qué canal rinde por sol (dumbbell y CPL contra meta) | Sedes; hora × día; estacionalidad |
| 4 · Resultado | Leads del período con año anterior y CPL | Evolución diaria con eventos; dónde se pierden (etapas) | Campañas contra meta; web; tabla completa |

La jerarquía tiene cinco niveles y ninguno más: título de capa, sección, lectura (título calculado), pieza y nota. Una cifra grande por bloque.

---

## 5. Momentos «wow»

Cada uno responde dos preguntas: qué hace que un cliente diga «esto no lo había visto» y por qué además comunica mejor. Si solo impresiona, se cae.

| Momento | Qué ve el cliente | Por qué comunica mejor |
|---|---|---|
| **1. Recorrido guiado «modo sala»** | 6 a 8 pasos con teclado o clicker (flechas, AvPág y RePág), cada paso con su URL. Un paso «adivinen primero» oculta cuánto trae Meta antes de revelarlo | Obliga a formular la comparación antes de verla; nada depende del hover, que en sala nadie ve (Tse 2016, informe 02). El movimiento expresivo (400 ms) vive solo aquí |
| **2. Títulos que se reescriben con el filtro** | Cambia el período y la lectura cambia («Meta trae el 62 % de los leads con el 44 % de la inversión» pasa a otra frase, o al título descriptivo si el dato no la sostiene), y cada marca viaja a su nuevo lugar en 240 ms | La conclusión está escrita y es verdad en todos los estados (si no lo es, cae al descriptivo). El movimiento sirve para seguir la marca (Heer y Robertson 2007), no para decorar |
| **3. Honestidad visible** | El selector «Estados» muestra el día que Meta no entregó datos, la cohorte en maduración y la sede nueva sin comparación | Un cliente que ya se quemó con un dashboard que mentía reconoce el problema al instante. Es el argumento de venta de Reset, mostrado y no dicho |
| **4. Aluvial de una cohorte cerrada** (condicional) | De canal a destino, cada cinta es un conteo real | Solo como paso del recorrido y con la cohorte cerrada escrita; en el tablero va `Etapas`. Riesgo: invita a comparar tasas de canales con pocos casos (Display tiene alrededor de 100 leads en un mes) |

Se cayeron por impresionar sin comunicar: medidor radial, contadores que suben, vidrio y brillo detrás de cifras, mapa coroplético de distritos, horizon chart (se lee más lento, Heer, Kong y Agrawala 2009), sankey de cohortes abiertas (miente: informe 01).

---

## 6. La galería

`docs/rediseno/galeria/index.html`: seis bloques con tres formas cada uno, más el mapa de calor, dibujados con la data de muestra y la misma `armarVista`. Se conmutan la identidad (A guía, B reset.com.pe) y el tema (oscuro, claro). 789 marcas con `data-valor`; sin scroll horizontal a 390 px; sin errores de consola (confirmé en Chromium).

Pruebas en `galeria/pruebas/`, cada una con su prueba negativa (confirmé): `vista.prueba.mjs` barre 33 períodos con 12 reglas; `humo.mjs` cruza en Chromium etapas, teselas, escala común de sedes, rótulo contra leyenda y título a 1440 y 390 px; `formato.prueba.mjs`. La galería muestra el período por defecto (setiembre de 2026 contra setiembre de 2025); los otros períodos se prueban en la capa de cálculo, no en pantalla.

**Lo que te pido elegir:** una forma por bloque (mi recomendación va primero, con borde) y una identidad.

---

## 7. Lo técnico

| Cambio | Peso (gzip) | Riesgo | Cuándo |
|---|---:|---|---|
| Quitar Recharts 2 (deprecado) y dibujar con d3 modular (`d3-scale`, `d3-shape`, `d3-array`) | −115 kB / +15 kB | Mantener ≈ 10 componentes de gráfico propios; señal de alarma si pasan de 12 | Con el rediseño |
| `lucide-react` 0.294 → 1.x, con unos 15 íconos (hoy 44) | ≈ 4 kB | Bajo | Con el rediseño |
| Montserrat variable + Bebas Neue autoalojadas (`@fontsource`, subconjunto latino) | 37,1 + 13,4 kB | Bajo. Si gana la identidad B, sus fuentes son comerciales y necesitan licencia web | Con el rediseño |
| Quitar `date-fns` (nadie lo importa) | 0 | Ninguno | PR aparte, ya |
| Netlify: Node 18 (sin soporte desde el 30/04/2025) → 22 | 0 | Bajo | PR aparte, ya |
| Vite 5 → 8 | build de 5,4 a 1,6 s | Falla `manualChunks`; probado solo el build de producción | PR aparte |
| Tailwind 4 | | Borra `tailwind.config.js`, que usa el playbook, y cambió el 23 % de los píxeles de la capa 1 en la prueba (las otras capas, menos del 2 %) | No ahora |
| React 19 | +23 kB | lucide 0.294 no lo declara compatible | No ahora |

Todo medido en el informe 05 (confirmé ahí). La licencia de cada paquete nuevo es MIT o ISC.

**Presupuesto declarado:** JS inicial ≤ 100 kB gzip (hoy 181,7 kB: 25,9 de la app más 155,8 de Recharts), CSS ≤ 15 kB, fuentes ≤ 55 kB, LCP móvil ≤ 2,5 s, Lighthouse ≥ 90 en rendimiento y accesibilidad en escritorio y móvil (hoy la accesibilidad da 90 y 75).

---

## 8. Fases de la construcción y cómo se cierra cada una

| Fase | Qué se construye | Se cierra cuando (verificado ejecutando) |
|---|---|---|
| 4.1 | Generador y `armarVista` en `src/muestra/` y `src/calculo/`, desde el prototipo de la galería | Pruebas de las 15 reglas de coherencia sobre 20 semillas; prueba negativa de cada una (se siembra el defecto y da rojo); tres cifras cruzadas a mano con una calculadora aparte; barrido de todos los períodos mensuales y de 30 días del rango |
| 4.2 | Tokens, formateador, componentes, chequeo del sistema | Chequeo de tokens con casos sembrados en rojo; formateador con casos y prueba negativa; validador de paleta en ambos temas |
| 4.3 | Guía viva del sistema hecha con los componentes reales | Capturas a 1440 y 390 px, revisadas |
| 4.4 | Las cuatro capas con todos sus estados | Prueba de humo en Chromium que cruza cada `data-valor` y cada título contra `armarVista` en los escenarios feos (fuente caída, período vacío, un solo día, el máximo, sede nueva, cohorte abierta); Lighthouse; teclado de punta a punta; `prefers-reduced-motion` |
| 4.5 | Recorrido guiado | Recorrido completo con teclado y con reducción de movimiento; cada paso con su URL recargable |

Al cierre de 4.4 y 4.5: verificadores adversariales en paralelo, de solo lectura («encuentra dónde miente la pantalla»), y la prueba de los cinco segundos con un subagente que solo ve la captura de cada bloque. Antes de cada commit, el chequeo de fugas (fuera del repo) sobre lo agregado.

---

## 9. Cómo se mide «deslumbrar»

| Criterio | Cómo se mide |
|---|---|
| Cinco segundos | Subagente que solo ve la captura del bloque y dice qué entiende; se compara con la lectura esperada |
| Prueba de borrar | Se quita cada elemento; si no se pierde información, se va |
| Variedad con razón | Ningún par de bloques vecinos con la misma forma sin que la pregunta lo pida (el mapa de la sección 3 lo cumple hoy) |
| Una cifra protagonista por bloque | Con comparación y período escritos |
| WCAG 2.2 AA | Texto 4,5:1, marcas 3:1, foco visible, teclado, color nunca solo |
| 390 px | Sin scroll horizontal |
| Movimiento | `prefers-reduced-motion` a 0 |
| Lighthouse y bundle | Sección 7 |

---

## 10. Preguntas abiertas (solo tú puedes responderlas)

1. **El repo es público y tiene data y nombres de clientes reales** (`data/`, `public/data/trends/latest.json`, `scrapers/`, `docs/`, y la historia de commits). **Recomiendo:** pasarlo a privado hoy, y en una ventana coordinada borrar esos archivos y purgar la historia con `git filter-repo`. La purga reescribe la historia y no tiene vuelta atrás: no la hago sin tu permiso explícito.
2. **Identidad: A (guía de la agencia, violeta `#6F42C1`) o B (reset.com.pe: negro, beige `#E8E2DF`, verde `#00FF63`)**. La guía manda, pero el violeta no aparece en el sitio público (confirmé en su CSS) y la guía misma lo marca como señal de IA. **Recomiendo B** si Reset tiene licencia web de Sanomat, Aeonik y Druk para este dominio: es la marca que el cliente ya conoce. Si no, A. Las dos están en la galería.
3. **Sector y nombres: gimnasios en Lima, cliente ficticio «Vitalto», competidores reales con solo conversación de muestra.** **Recomiendo** aprobarlo, revisar «Vitalto» en Indecopi (clases 41 y 44) y pasar a un abogado la regla «marcas reales solo con data neutra». Si hay duda legal, la alternativa más segura es usar para la competencia la serie real de Google Trends descargada con fecha (es dato público y verdadero).
4. **Separador decimal: coma (norma peruana, 11,20) o punto (como lo muestran Meta y Google, 11.20).** **Recomiendo** la coma con espacio de miles: es la norma y el formateador lo resuelve en una constante. Señal de alarma: que en la primera reunión alguien lea mal una cifra.
5. **Tema por defecto: oscuro con «modo sala» claro a un clic, o claro por defecto.** **Recomiendo** oscuro por defecto si la demo se muestra sobre todo en laptop o pantalla, y claro si se proyecta en salas iluminadas: con luz ambiente el gris de texto más claro cae a 3,4:1 en oscuro y a 4,0:1 en claro (modelado en el informe 04, no medido con un proyector).

Supuestos que tomo si no dices otra cosa (asumo): las metas de costo por lead y las bandas del índice son supuestos de la muestra y se rotulan así en pantalla; meses escritos «setiembre», como se usa en Perú; fecha de corte de la muestra 30 de setiembre de 2026; período por defecto, el último mes cerrado contra el mismo mes del año anterior; enero queda como mes histórico destacado.

---

## 11. La mejor objeción

**«Es una demo con data inventada. Tanto rigor de cálculo es invisible para el cliente; lo que vende es que se vea espectacular.»**

Respuesta: el cliente que ve dashboards cada semana no audita el cálculo, pero sí nota la contradicción, y la de hoy se nota en el primer minuto (un share of voice que suma 105 % está en pantalla). La demo vende la capacidad de Reset de hacer un tablero en el que se puede confiar; una cifra que no cuadra vende lo contrario. Y el rigor es lo que permite lo espectacular: los títulos que se reescriben con el filtro y el modo «Estados» solo son posibles porque una función pura arma todo lo que se pinta.

## 12. Cuándo este plan estaría equivocado

- **Si la demo se manda por enlace más de lo que se presenta en sala.** Entonces el recorrido guiado pierde valor y la exploración libre lo gana. Señal temprana: el equipo comercial manda el enlace antes de la reunión.
- **Si el cliente desconfía de títulos que «opinan».** Señal temprana: en las primeras demos preguntan «¿eso lo dice la data o ustedes?» frente a un título.
- **Si el equipo no puede mantener gráficos propios.** Señal temprana: pasar de 12 componentes de gráfico, o un pedido de forma nueva que tarde más de un día.
