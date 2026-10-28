# Guía rápida

Qué se usa para cada cosa. Antes de escribir un estilo, una pastilla o un formato nuevo, se busca aquí: si ya existe, se usa; si no existe, se agrega al sistema (no a la pantalla) y se anota en esta guía en el mismo cambio. El porqué de cada regla está en [quincha.md](quincha.md) (el sistema) y en [guia-algoritmo.md](guia-algoritmo.md) (el estándar del panel).

## 1. Etiquetas: una sola forma

Toda etiqueta chica (un estado, una fuente, un sello, el nivel de una alerta) es `<Etiqueta>`, de `src/sistema/Componentes.jsx`. La **variante** dice qué es; el **estado** (o el tono) dice de qué color va, desde el catálogo `src/sistema/estados.js`.

| Variante | Para qué | Ejemplo | Atajo |
|---|---|---|---|
| `borde` (por defecto) | Un dato del contexto, sin juicio | Universo de una cifra, una fuente con problema, la ventana de una tarjeta, palabras repetidas | `ChipUniverso`, `ChipFuente`, `Ventana` |
| `llena` | Un estado con juicio | Rinde, Costosa, Sin leads, Saturada | |
| `tinta` | Una marca que se ve de lejos | Nuevo | `SelloNuevo` |
| `texto` | Un nivel o un sello sin caja | El nivel de una alerta, «Datos al…» en la barra | `SelloMuestra` |
| `rotulo` | El nombre de un grupo, en mayúsculas grises | «Los propios» en un mazo | |

```jsx
<Etiqueta variante="llena" estado="costosa">{ESTADO_PIEZA.costosa}</Etiqueta>
<Etiqueta estado="fuente-parcial">GA4 · 2 días sin dato</Etiqueta>
<SelloNuevo />
```

**Tonos** (`TONOS` en `estados.js`): `neutro` sin juicio, `fuerte` dato principal, `bien` favorable, `atencion` parcial o para revisar, `alerta` desfavorable sin urgencia, `grave` desfavorable y urgente, `barra` sobre la barra oscura. Cada tono sale de un token semántico (`--mejora`, `--empeora`, `--atencion` y sus fondos suaves); la marca de un cliente cambia los tokens, nunca el catálogo.

**El catálogo de estados** (`ESTADOS` en `estados.js`) le da a cada estado su tono y su icono:

| Grupo | Estados |
|---|---|
| Fuentes | `fuente-ok`, `fuente-parcial`, `fuente-no-cargo` |
| Niveles de alerta | `nivel-atencion`, `nivel-revisar`, `nivel-oportunidad`, `nivel-bien` |
| Piezas y campañas | `sin-leads`, `costosa`, `saturada`, `rinde`, `aprendizaje`, `poca-data` |

Reglas:

- **El color nunca va solo:** una etiqueta con juicio lleva icono y palabra. La palabra vive en `src/textos`; el icono, en el catálogo.
- **Un estado nuevo se agrega al catálogo**, con su tono y su icono, y su palabra en `src/textos`. Un estado que no está en el catálogo rompe el render a propósito (`estadoDe` lo avisa con el nombre del archivo).
- **Dónde va no es cómo se ve.** Las clases de ubicación (`q-junto` junto a un nombre, `q-sobre-carta` sobre un mazo, `q-nivel` en una alerta) solo ubican; el aspecto es siempre el de la variante.
- **Ninguna pantalla arma su pastilla.** `npm run sistema` rechaza una regla de CSS con letra chica, radio y fondo o borde fuera de `.q-etiqueta`, y cualquier clase llamada chip, badge, insignia, pastilla, pill o tag.

## 2. Piezas de pantalla

| Necesito | Uso |
|---|---|
| Un capítulo con número, pregunta y avisos | `Seccion` + `AvisosCapitulo` |
| Una tarjeta | `Bloque` (título, lectura, ventana, ayuda, cuerpo, pie con universo). Tres como máximo por capítulo |
| Lo minucioso del capítulo | `Detalle`, al pie del capítulo, con ancla `#detalle-s-x-y` |
| Falta el dato, cargando, fuente caída | `Bloque` con `estado` (usa `Estado`): nunca un cero en su lugar |
| Una tabla | `Tabla` (números a la derecha, `barra`, `destacada`, `apagadas`) |
| Elegir entre pocas opciones | `Grupo` (botones segmentados) |
| El período | `SelectorPeriodo`, con los atajos de `src/calculo/periodo.js` |
| Un panel a la derecha | `PanelLateral` |
| Una ventana modal | `Dialogo` |
| Un gráfico | `src/sistema/graficos/` (ver [quincha.md](quincha.md), §5) |

## 3. Formatos de cifras y fechas

De `src/sistema/formato.js`. Ninguna pantalla formatea a mano.

| Qué | Función | Sale |
|---|---|---|
| Número | `numero(n, dec)` | 47 600 · 1402 (espacio duro desde cinco cifras, coma decimal) |
| Número grande | `compacto(n)` | 47,6 mil |
| Dinero | `dolares(n, dec)` | $1402 · $8,90 |
| Porcentaje | `porcentaje(p, dec)`, con `p` en puntos (34, no 0,34) | 34 % |
| Variación | `variacion(p, dec)`, en puntos | +12 % · −3 % (menos tipográfico; el cero sin signo) |
| Fechas | `fecha`, `fechaCorta`, `fechaSinAnio`, `rangoFechas`, `mesAnio` | 3 de octubre de 2026 · 3 oct |
| Sin medición | `NO_MEDIDO` | sin dato (lo devuelve cualquier formato con un valor que no es número) |

## 4. Textos que se repiten

De `src/textos/comun.js`. Una frase sobre el período o la comparación se arma con estas funciones, para que diga lo mismo en todo el panel.

| Qué | Función |
|---|---|
| El período en palabras | `periodoTexto(P)`, `dePeriodo`, `delPeriodo`, `enElPeriodo`, `resumenTitulo` |
| Contra qué se compara | `comparacionTexto(P)`, `frenteATexto`, `contra`, `comparacionCorta`, `pieComparacion` |
| Una variación en una frase | `variacionFrase(sujeto, cambio, P)`, `frente`, `cuanto` |
| Pocos días para comparar | `notaComparacion(P, DIAS_MINIMOS)` |
| Tramos y ventanas | `tramoFechas`, `ventanaTexto`, `fechasCortas`, `fechasConAnio`, `mesFuenteTexto` |
| Listas y números chicos | `lista`, `enLetras`, `capital` |

Las palabras de cada medio siguen el glosario de [guia-algoritmo.md](guia-algoritmo.md), §8. Los textos observan y no ordenan, dos frases como máximo por lectura.

## 5. Tokens, en una línea cada uno

- **Color:** solo semánticos (`--texto-1/2/3`, `--superficie`, `--mejora`, `--empeora`, `--atencion`, `--serie-1`, `--previa`…). Los primitivos `--p-*` son de `tokens.css` y de nadie más.
- **Letra:** `--t-13` a `--t-36`; cifras `--c-24`, `--c-32`. Pesos `--peso-lectura`, `--peso-rotulo`.
- **Aire:** `--e-1` a `--e-16`. Radios `--r-*`. Duraciones `--d-*`. Ningún borde de más de 2 px.

## 6. Qué revisa cada chequeo

| Comando | Atrapa |
|---|---|
| `npm run sistema` | Colores, tamaños y espacios escritos a mano; tokens huérfanos; contraste en los dos temas; franjas de resalte; pastillas armadas fuera de `Etiqueta` |
| `npm run prueba` | Cálculo, período, piezas, fecha móvil, el catálogo de estados completo, y el render de cada capa (texto roto, glosario, tres tarjetas, lo nuevo primero) |
