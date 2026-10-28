# Quincha

El sistema de diseño de The Algorithm: colores, tipografía, componentes, gráficos y el chequeo que los vigila. La [guía del algoritmo](guia-algoritmo.md) dice **qué** se muestra y en qué orden; Quincha dice **con qué** se construye.

## El nombre

La quincha es la técnica limeña de caña y barro: una trama liviana de caña que se rellena con barro. Es flexible, se arma con lo que hay a mano y aguanta los temblores mejor que un muro rígido.

El sistema quiere lo mismo:

- **Liviano.** CSS plano y gráficos SVG propios, sin librerías de gráficos ni de estilos. Las únicas dependencias son React, los íconos de Lucide y las tipografías de la marca.
- **Flexible.** Una trama fija (componentes, reglas) que se rellena con la marca de cada cliente. Para otro cliente se cambia un solo archivo, la paleta, y lo demás se adapta.
- **Resiste temblores.** Cuando algo se mueve (una fuente que no carga, un color nuevo, un cambio apurado), el sistema lo dice en vez de romperse en silencio. Un chequeo automático atrapa el error antes de que llegue a pantalla, y cada tarjeta sabe decir «la fuente no cargó» en lugar de dibujar un cero.

El algoritmo de referencia tiene su propio sistema con nombre de material de construcción. Quincha sigue esa línea con un material de la costa.

## 1. Tokens: la trama y el relleno

Todo valor visual sale de `src/sistema/tokens.css`, en dos niveles:

| Nivel | Qué es | Quién lo usa |
|---|---|---|
| **Primitivos** (`--p-*`) | La paleta del cliente: en Fit Lab, tinta, cal, rojo, menta y sus neutros cálidos | Solo los semánticos. Ningún componente los toca. |
| **Semánticos** | Para qué sirve cada color: `--texto-2` es texto de lectura, `--empeora` es una variación desfavorable, `--serie-1` es el color de los datos | Los componentes, y nada más |

Los semánticos se agrupan por función:

- **Superficies:** `--fondo` (la página), `--superficie-capitulo` (el panel que agrupa), `--superficie` (la tarjeta) y `--barra` (la barra superior).
- **Texto:** `--texto-1` (cifras y títulos), `--texto-2` (lectura) y `--texto-3` (notas y ejes).
- **Acento:** `--acento` y `--acento-texto`, el rojo de la marca. Es identidad (la capa activa, el número de capítulo), nunca dato.
- **Estado:** `--mejora`, `--empeora` y `--atencion`, y sus fondos `--mejora-suave` y `--empeora-suave` (las pastillas «Rinde» y «Costosa»). Siempre van con flecha, signo o ícono, para que el color nunca vaya solo.
- **Datos:**
  - `--serie-1`: barras y líneas, en el color de datos de la marca;
  - `--serie-resto`: el resto, cuando hay un resalte;
  - `--previa`: el período de comparación, siempre en gris;
  - `--s2`, `--s3` y `--s4` (menta, naranja y azul): partes de un todo, que en un gráfico van en orden azul, naranja y menta;
  - `--q0` a `--q6`: la rampa para magnitud.

**Claro por defecto.** Se proyecta en reuniones y se lee de día. El oscuro no invierte el claro: tiene sus propios niveles, y lo más claro es lo más cercano al lector.

Tipografía, espacios, radios, duraciones y sombras también son tokens (`--t-*`, `--e-*`, `--r-*`, `--d-*`). Si un componente escribe `13px` o `#333`, el chequeo lo marca.

## 2. Cómo se separa sin cortar el flujo

Siete reglas, en `src/sistema/componentes.css`:

1. **Tres niveles de superficie:** página, capítulo y tarjeta. La profundidad la da el valor de la superficie, no las sombras ni los bordes gruesos. El número y el título del capítulo van dentro del panel del capítulo, y ese panel se distingue de la página en los dos temas: en oscuro, la página es más oscura que el capítulo y la tarjeta la más clara. Al cambiar de marca, el negro de la marca no reemplaza al fondo de la página si queda igual al capítulo; `npm run sistema` falla si página y capítulo, o capítulo y tarjeta, no se distinguen.
2. Cada capítulo abre con su **número y su pregunta** dentro del mismo panel, sin franjas a todo el ancho.
3. Entre capítulos hay **el doble de aire** que entre tarjetas.
4. Lo que no sigue el período **dice su propia ventana**, con alfiler en vez de calendario.
5. Cada tarjeta dice **su universo al pie** (pauta, CRM, sitio, búsquedas, conversación, modelo). Lo de universos distintos no se suma.
6. **Una sola cifra grande por pantalla de lectura:** la del resumen. Adentro, las cifras acompañan.
7. **Se resalta sin franjas.** Nada de tarjetas con una barra de color al costado o arriba, ni bordes gruesos: es el resalte de plantilla que delata un diseño armado en automático. Lo importante va primero, más grande o con más peso; la gravedad de algo se dice con una palabra («grave», «para revisar»), no con un color de borde. El chequeo marca cualquier borde de más de 2 px.

## 3. Tipografía

Tres papeles: **títulos y cifras** (`--f-titulo`), **texto** (`--f-texto`) y **tablas** (`--f-tabla`).

- Si el cliente tiene tipografías de marca que se pueden usar, van esas. Fit Lab usa Bricolage Grotesque y Atkinson Hyperlegible Next.
- Si no, van las del algoritmo de referencia: Sofia Sans Condensed en títulos, Sofia Sans en texto y Sofia Sans Semi Condensed en tablas. No vienen instaladas: el paso está en [nuevo-algoritmo.md](nuevo-algoritmo.md).

Las cifras van en números tabulares. Si la tipografía de texto tiene el cero cruzado, se reemplazan solo los dígitos.

**Escala** (`--t-13` a `--t-36`, en px): 13 para ejes, pies y etiquetas; 14 para tablas; 16 para la lectura; 19 para el título de tarjeta; 24 para el capítulo; 28 y 36 para la cabecera de capa. Cifras: 24 y 32 (`--c-24`, `--c-32`). Pesos de la letra variable: 400 lectura, 560 rótulos, 640 cifras, 700 títulos. Se subió un escalón en octubre de 2026: la de antes (12, 13, 15, 17, 20) dejaba niveles muy pegados y lo secundario chico, más con Sofia Sans, que es más baja que una letra común (altura de x 0,49 contra 0,53 de Arial).

**Una letra condensada solo desde 24 px.** Más chica se aprieta. El título de tarjeta va en `--f-tarjeta`: la de texto si la de títulos es condensada, la de títulos si no lo es. El modo presentar sube toda la escala con `--escala-presentar`.

## 4. Componentes

Están en `src/sistema/Componentes.jsx`. No calculan: reciben cifras ya armadas por `src/calculo` y textos ya escritos por `src/textos`. Para elegir rápido qué usar (componente, etiqueta, formato o texto), [guia-rapida.md](guia-rapida.md).

| Componente | Para qué |
|---|---|
| `NavegacionCapas` | Las cuatro pestañas; la activa con fondo teñido y una marca redonda abajo |
| `IndiceCapa` | «En esta capa», al costado, marca el capítulo que se está leyendo |
| `FuentesCapa` | Cada fuente con su fecha de corte y su estado (punto y texto) |
| `Resumen`, `Frase` | Las cifras de la capa y, debajo, una frase por plataforma contra su objetivo |
| `Seccion`, `AvisosCapitulo` | El capítulo y las alertas que sostiene, una línea cada una |
| `Bloque`, `Ventana`, `Ayuda`, `Estado` | La tarjeta: título, ventana, ayuda, lectura, cuerpo y pie; y lo que muestra cuando falta el dato o está cargando |
| `Tabla` | Números a la derecha, barra junto a la cifra, subtítulo, tono contra el objetivo y fila destacada |
| `Flujo` | Una fila por plataforma, un paso por columna (de la inversión a la inscripción) |
| `ListaAlertas` | Qué mirar: lista numerada por nivel, cada fila se abre con el detalle |
| `SugerenciaModelo` | La propuesta del modelo, con robot y una columna por plataforma |
| `SelectorPeriodo` | El período: el tramo y el atajo en el botón; adentro, los atajos, dos fechas (una fecha fuera de la data se marca y se dice por qué) y con qué se compara |
| `PanelLateral`, `Monitoreo` | El panel de la derecha (cada uno con su propio título accesible; la página de atrás no se desplaza) y Qué se monitorea |
| `Detalle`, `DetallesAbiertos` | El detalle de un capítulo: el botón al pie, «Ver el detalle: …», y el panel ancho con lo minucioso. Un ancla `#detalle-s-x-y` lo abre. La prueba de render los abre todos con `DetallesAbiertos` |
| `Etiqueta` | La única etiqueta chica, en cinco variantes (`borde`, `llena`, `tinta`, `texto`, `rotulo`); tono e icono salen del catálogo `src/sistema/estados.js`. Cuándo va cada una: [guia-rapida.md](guia-rapida.md) |
| `ChipUniverso`, `ChipFuente`, `SelloNuevo`, `SelloMuestra` | Atajos de `Etiqueta`: el universo de una cifra, una fuente con problema, «Nuevo» (con `q-sobre-carta`, sobre un mazo) y la fecha de la muestra en la barra |
| `Abanico`, `VentanaAnuncios`, `ArteMuestra` | Las artes agrupadas por dueño: un mazo que se abre en abanico y una ventana con todas las piezas. Detalle en [abanico.md](abanico.md) |
| `Dialogo` | La ventana modal genérica (`<dialog>` nativo): foco atrapado, solo se desplaza su cuerpo, el foco vuelve a quien la abrió |
| `BarraDemo` | Los estados de la demo |

## 5. Gráficos

Están en `src/sistema/graficos`. Son SVG propios, y cada marca lleva su valor en `data-valor` para que una prueba pueda cruzarlo con el cálculo.

**En uso:**
- `Linea` (con comparación en gris y área clara);
- `Barras`;
- `Histograma`;
- `Columnas` (dos medidas lado a lado, cada una con su escala);
- `Franja` (partes de un todo);
- `Etapas`;
- `Reticula` (de cada 100);
- `Dispersion`;
- `Proyeccion` (escenario con rango);
- `DosLineas`;
- `Acumulado`.

**En reserva**, porque hoy no los usa ninguna pantalla: `Bala` (contra un objetivo), `Multiplos`, `Pesas`, `Pendiente` y `MapaCalor`.

Reglas de forma:
- una sola escala por gráfico, nunca doble eje;
- líneas rectas entre puntos, sin suavizar;
- un día sin dato es un hueco, no un cero;
- el texto nunca lleva el color de la serie: la marca de color al lado lleva la identidad;
- una sola marca resaltada por gráfico y el resto en gris claro;
- «Ver como tabla» visible debajo.

## 6. El chequeo

`npm run sistema` revisa el código real, no una lista aparte:

1. Ningún color escrito a mano fuera de `tokens.css`.
2. Tamaños de letra, espacios, radios, sombras y duraciones salen de tokens. Ningún borde pasa de 2 px (sin franjas de resalte).
3. **Nada huérfano:** todo primitivo lo usa un semántico, todo semántico lo usa un componente, y ningún componente usa un primitivo o un token que no existe.
4. El oscuro por preferencia del sistema y el oscuro por botón son idénticos.
5. **Contraste medido**, en los dos temas:

| Qué | Mínimo |
|---|---|
| Texto sobre cualquier superficie | 4,5:1 |
| Marcas de interfaz (bordes de control, foco, acento) | 3:1 |
| Marcas de datos sobre la tarjeta | 3:1 |
| La serie frente a su comparación | 2:1 |
| El color de datos frente al gris del resto | 2:1 |
| Dos escalones vecinos de una rampa | 1,2:1 |

6. **Una sola etiqueta:** ninguna regla fuera de `.q-etiqueta` arma una pastilla (letra de 12 o 13 px, relleno, radio y fondo o borde) y ninguna clase se llama chip, badge, insignia, pastilla, pill o tag. Un botón, un campo y lo que flota no cuentan.

La última fila es la regla de la casa: **nunca dos grises vecinos que se confundan**. Nació de una corrección real, porque los dos últimos grises de un gráfico no se distinguían.

El chequeo tiene su propia prueba (`pruebas/sistema.test.mjs`): se le siembra un error de cada tipo y tiene que atraparlo. Un chequeo que no se prueba no sirve.

## 7. Un cliente nuevo

1. Cambiar los primitivos de `tokens.css` por la paleta del cliente: su negro, su blanco, su color de identidad y su color para datos.
2. Si tiene tipografías propias, cambiar `--f-titulo` y `--f-texto`. Si no, quedan las de referencia.
3. Correr `npm run sistema`. Va a decir qué par no alcanza su contraste; se ajusta el primitivo hasta que pase. No se ajusta la regla.
4. Mirar cada capa en claro y oscuro, a 1440 y a 390 de ancho.

Ningún componente se toca para cambiar de marca. Si hace falta tocar uno, falta un semántico.
