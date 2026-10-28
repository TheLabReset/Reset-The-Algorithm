# The Algorithm

Panel de inteligencia de marketing de The Lab. La demo usa data de muestra de Fit Lab, una marca ficticia.

- **Cómo se diseña un algoritmo:** sigue `docs/guia-algoritmo.md`. Ahí están las cuatro capas, la pestaña, las tipografías por defecto, la tarjeta, los gráficos y las reglas de datos honestos. Si algo nuevo contradice la guía, se actualiza la guía en el mismo cambio.
- **Con qué se construye:** el sistema de diseño Quincha, en `docs/quincha.md`. Para cambiar de marca se cambia la paleta en `src/sistema/tokens.css`; ningún componente se toca.
- **Guía rápida:** `docs/guia-rapida.md` dice qué componente, etiqueta, formato o texto se usa para cada cosa. Toda etiqueta chica es `<Etiqueta>` con un estado del catálogo `src/sistema/estados.js`; un estado nuevo se agrega ahí, nunca en una pantalla. `npm run sistema` rechaza pastillas armadas aparte.
- **Otra marca:** se sigue `docs/nuevo-algoritmo.md`. El nombre de la marca y las palabras de su rubro viven solo en `src/cliente.js`; una prueba falla si aparecen escritas en otro archivo.
- **Producción:** antes de agregar un workflow, un cron o un job de GitHub Actions, se estima en minutos al mes según `docs/produccion-actions.md`. Ningún runner espera a un servicio externo.
- **Ninguna cifra se escribe en un componente.** La data sale de `src/muestra` (generador con semilla fija), se calcula en `src/calculo` y los textos se arman en `src/textos`. Las pantallas (`src/pantallas`) solo pintan.
- **Período por día, como en producción:** atajos o dos fechas, contra el período anterior o un año antes (`src/calculo/periodo.js`). La data llega por día siempre que la fuente lo permita; con menos de 7 días no se publica ninguna variación.
- **Vista general y detalle:** tres tarjetas como máximo por capítulo; lo minucioso va en `Detalle`. Lo nuevo del período va primero, con su sello. La prueba de render lo revisa, junto con el glosario de medios de la guía.
- **Fecha móvil (solo la maqueta):** la muestra corta ayer en Lima y su historia se mueve con el corte. Toda fecha nueva en `src/muestra/configuracion.js` se clasifica (rango, calendario o historia) y se suma a `muestraAl()`; con data real se apaga. Ver `docs/fecha-movil.md`.
- **Antes de cada commit:** `npm run prueba` y `npm run sistema`. Y ninguna cifra, nombre o captura de clientes reales en el repositorio.
- **Textos:** en español peruano, observan y no ordenan, dos frases como máximo por lectura. Pasan por vickyfy.
