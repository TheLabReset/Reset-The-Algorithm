# El abanico: cómo se muestran las artes

El componente de Quincha para mostrar piezas creativas agrupadas por dueño: anuncios de la competencia, las piezas propias, paneles de vía pública o cualquier conjunto de artes. Cada dueño es un mazo con sus tres piezas más recientes. Al pasar el mouse o con el foco, las cartas se abren en abanico; un clic abre una ventana con todas.

Está hecho y funcionando en la demo de Fit Lab (capa 1, «Qué se busca y qué se publica», y el atajo desde la ficha de cada marca en 4.5). Si un algoritmo nuevo tiene otra marca, cambian los tokens; lo demás se conserva.

## 1. Qué se ve

- **Un mazo por dueño.** Es un botón con la pila de sus tres piezas más recientes, apenas corridas y giradas como cartas en la mano; el nombre; el dato («12 anuncios · el más reciente, del 26 set», o «desde el 16 ago» si hay uno solo) y «Ver todos» (o «Ver el anuncio»).
- **El abanico.** Con el mouse o el foco del teclado, las cartas se separan en arco.
- **La ventana.** Un clic, Enter o Espacio abren todas las piezas de ese dueño en una grilla: la pieza entera, el título, el texto, las plataformas, desde cuándo corre y el enlace a la fuente. Solo se desplaza la ventana, nunca la página de atrás. Escape, la equis o un clic en el velo la cierran, y el foco vuelve al mazo que la abrió.
- **La marca propia va aparte y primero**, con el rótulo «los propios, para comparar». No es competencia.
- **Un segundo camino a la misma ventana:** la ficha de una marca en otro gráfico tiene «Ver sus 12 anuncios».

## 2. Dónde vive

| Pieza | Archivo | Qué hace |
|---|---|---|
| Dominio | `src/calculo/anuncios.js` | Limpia cada pieza, valida enlaces e imágenes, agrupa por dueño, separa la propia, ordena y cuenta las que no tienen nada que mostrar |
| Lectura del mes | `leeAnuncios` en `src/calculo/produccion.js` | Toma los anuncios activos del mes y los pasa por el dominio; `armarVista` los deja en `lee.anuncios` |
| Textos | `src/textos/capas.js` | Fechas con año cuando no es el de la lectura, «el más reciente» solo con más de uno, el orden solo si hay fechas |
| Componentes | `src/sistema/Componentes.jsx` | `Abanico`, `VentanaAnuncios`, `Dialogo` (la ventana modal genérica) y `ArteMuestra` |
| Estilos | `src/sistema/componentes.css` | `.q-mazo`, `.q-carta`, `.q-dialogo`, `.q-anuncio`, `.q-arte` |
| Muestra | `src/muestra/detalle.js` | Un anuncio por cada anuncio activo del mes, con tema, formato y plataformas; sin pieza real |

**Regla de oro:** ningún cálculo en el componente. El componente pinta lo que el dominio decidió, con los textos que le pasa la pantalla.

## 3. La data

Cada pieza normalizada:

```js
{ id, titulo, texto, pie, plataformas: ['Facebook', 'Instagram'], desde: 'AAAA-MM-DD' | null,
  activo: true, enlace: string | null, imagen: string | null, formato: 'Video' | null, arte: 0 | 1 | 2 | null }
```

Lo que entrega el dominio: `{ grupos, propio, sinContenido, total }`. Los grupos van de quien más piezas tiene a quien menos, con «Sin identificar» al final.

**Desde la biblioteca de anuncios de Meta** (`anuncio(a)` en el dominio), lo que deja el scraper por anuncio: `id`, `title`, `text`, `link_caption`, `platforms`, `start_date`, `is_active`, `ad_library_link`, `image_url`. Del lado del scraper:

- el texto se corta a 200 caracteres y el título a 100;
- los marcadores de catálogo dinámico (`{{product.name}}`) se borran;
- la fecha en segundos desde 1970 se pasa a `AAAA-MM-DD`;
- una corrida con cero anuncios falla y conserva el archivo anterior, en vez de publicar un vacío.

**En la muestra** no hay piezas reales: la demo no le atribuye anuncios a marcas reales. Cada anuncio trae su tema y su formato, y `ArteMuestra` dibuja una composición neutra con el tema. El pie de la tarjeta lo dice.

## 4. Las reglas del dominio, y por qué

- **Una pieza sin título, texto, imagen ni enlace no se dibuja**: sería una carta vacía. Se cuenta en `sinContenido` y la pantalla dice cuántas llegaron así.
- **Enlace e imagen con lista blanca de dominio.** Vienen de un scraper: solo pasan `facebook.com/ads/library/` y `*.fbcdn.net`. Un `javascript:` o una página HTML en `image_url` no pasan.
- **La marca propia aparte.** La biblioteca también sigue la página propia; sin esto aparecía como un competidor más.
- **El año en la fecha** cuando no es el de la lectura: un anuncio activo desde marzo del año pasado no se lee como de este año.
- **Textos que no prometen lo que no pasa:** «el más reciente» con uno solo, o «del más reciente al más antiguo» sin fechas, serían falsos.
- **«Desconocida» pasa a «Sin identificar»** y va al final.

## 5. La geometría del abanico

Cada carta recibe `--d`, su distancia al centro de la pila: `d = i − (n − 1) / 2`. Con tres cartas, −1, 0 y +1. La pila se dibuja al revés, así que la más reciente va a la derecha y encima.

| | En reposo | Abierto (mouse o foco) |
|---|---|---|
| Corrimiento horizontal | `d × 0,9rem` | `d × 3,25rem` |
| Corrimiento vertical | 0 | `d² × 0,35rem − 0,25rem`: el centro sube, los costados bajan |
| Giro | `d × 4°` | `d × 9°` |
| Pivote | 50 % 110 %, un poco debajo de la carta | igual |

Por qué funciona como un abanico de verdad:

- **El pivote debajo de la carta** hace que el giro mueva más la punta que la base: se abren en arco, no como un molinete.
- **El `d²` vertical** dibuja la curva de una mano que sostiene las cartas. Con `d` lineal quedaría una escalera.
- **Una sola transición, de `transform`** (`--d-240` con `--curva-productiva`): sin reflujo, y vuelve sola al salir.
- **La carta mide 7,5 rem en proporción 4:5**, el formato vertical de Meta. La pila mide 12 rem para que las cartas abiertas no se corten.
- **La columna mínima de la grilla es de 18 rem**: a ese ancho las cartas abiertas no sobresalen del mazo.
- **Con movimiento reducido no se abren**: el estado abierto es igual al de reposo, y `--d-240` pasa a 0.

## 6. La ventana (`Dialogo`)

Es genérica: sirve para cualquier lista larga.

- **`<dialog>` con `showModal()`.** El navegador atrapa el foco, deja inerte lo de atrás, maneja Escape y dibuja el velo. Sin librerías.
- **El desplazamiento vive en el cuerpo de la ventana**, con `overscroll-behavior: contain`. La página de atrás queda con `q-sin-desplazar` en `<html>`.
- **Un solo camino de cierre.** Escape, la equis y el velo pasan por `close()`, que limpia la clase y devuelve el foco.
- **El velo cierra solo si el clic empezó en el velo**: soltar afuera una selección de texto que empezó adentro no cierra.
- **El foco vuelve a quien la abrió**, y si ya no existe, al mazo de ese dueño.
- **El contenido se monta solo con la ventana abierta**: no se cargan decenas de imágenes hasta que alguien abre.
- **En celular ocupa toda la pantalla** y se cierra con la equis.

## 7. Detalles que importan

- **El mazo es un `<button>`**, con `aria-haspopup="dialog"`: Enter, Espacio y el foco funcionan sin código extra, y `:focus-visible` abre el abanico igual que el mouse.
- **La pila es decoración** (`aria-hidden`, imágenes con `alt=""`). En la ventana, cada imagen dice de quién es.
- **Las imágenes de Meta vencen a los pocos días.** Una que falla sale del mazo y entra la siguiente; si no queda ninguna, las cartas son de texto. En la ventana, la tarjeta sigue sin la imagen. Nunca un recuadro roto.
- **`referrerPolicy="no-referrer"`**: la dirección del panel no viaja a Meta. **`loading="lazy"`**: la ventana puede tener decenas de imágenes.
- **En la ventana la pieza va entera** (`object-fit: contain`, cuadrada); en el mazo, recortada desde arriba (`cover`): es una miniatura.
- **Atributos para las pruebas:** `data-anunciante` en el mazo, `data-previa` en cada carta, `data-anuncio` en cada tarjeta, `data-anuncios` en la grilla, `data-ver-anuncios` en el atajo.

## 8. Estados

| Estado | Qué se ve |
|---|---|
| La fuente está cargando o no cargó | la tarjeta muestra su estado, no los mazos |
| Ningún dueño con piezas | «La biblioteca de anuncios no trajo anuncios de la competencia en este mes» |
| Algunas piezas sin nada que mostrar | los mazos y «N anuncios llegaron sin título, texto ni imagen, y no se muestran» |
| Imágenes vencidas | cartas de texto; en la ventana, la tarjeta sin imagen |
| Una sola pieza | «1 anuncio · desde el 16 ago», «Ver el anuncio», y la ventana no promete orden |
| Una pieza de otro año | «desde el 3 mar 2025» |

## 9. Cómo se prueba

- **`npm run prueba`:** cada marca trae tantas piezas como sus «anuncios activos»; la propia no está entre los grupos; los grupos van de más a menos y las piezas de la más reciente a la más antigua; el dominio rechaza enlaces e imágenes de otros dominios y no dibuja piezas vacías.
- **En el navegador, a 1440 y a 390:** el abanico se abre con el mouse; la ventana abre con un clic y cierra por Escape, la equis y el velo; después de cada cierre el foco vuelve al mazo y la página se vuelve a desplazar; con la ventana abierta, la rueda no mueve la página de atrás; el atajo de la ficha abre la misma ventana; sin desplazamiento horizontal.

## 10. Para otras artes

El abanico sirve para cualquier conjunto de piezas con dueño:

- **Vía pública:** un mazo por marca con las fotos de sus paneles; en la ventana, la foto, la dirección y desde cuándo está.
- **Piezas de TV o radio:** un mazo por marca con el fotograma o una carta de texto con la versión; en la ventana, el reproductor.
- **Las piezas propias:** un solo mazo, para ver la rotación creativa.

En cada caso se escribe la normalización de esa fuente en el dominio (como `anuncio(a)` para Meta) y se conservan las reglas de la sección 4.

## 11. Lo que se aprendió

- **Antes era un carrusel**, y después quedó reducido a tres textos cortados dentro del panel de un punto de otro gráfico: una marca con anuncios y sin ese punto no tenía por dónde abrirse. Por eso la sección es propia y la ficha es solo un atajo.
- **El respaldo del scraper es una página HTML**, no una imagen. Sin la lista blanca, el `<img>` intentaba cargar una página.
- **El estado sin imagen se diseña desde el principio**, porque las imágenes vencen.
