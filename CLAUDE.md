# The Algorithm

Panel de inteligencia de marketing de The Lab. La demo usa data de muestra de Fit Lab, una marca ficticia.

- **Cómo se diseña un algoritmo:** sigue `docs/guia-algoritmo.md`. Ahí están las cuatro capas, la pestaña, las tipografías por defecto, la tarjeta, los gráficos y las reglas de datos honestos. Si algo nuevo contradice la guía, se actualiza la guía en el mismo cambio.
- **Con qué se construye:** el sistema de diseño Quincha, en `docs/quincha.md`. Para cambiar de marca se cambia la paleta en `src/sistema/tokens.css`; ningún componente se toca.
- **Otra marca:** se sigue `docs/nuevo-algoritmo.md`. El nombre de la marca y las palabras de su rubro viven solo en `src/cliente.js`; una prueba falla si aparecen escritas en otro archivo.
- **Producción:** antes de agregar un workflow, un cron o un job de GitHub Actions, se estima en minutos al mes según `docs/produccion-actions.md`. Ningún runner espera a un servicio externo.
- **Ninguna cifra se escribe en un componente.** La data sale de `src/muestra` (generador con semilla fija), se calcula en `src/calculo` y los textos se arman en `src/textos`. Las pantallas (`src/pantallas`) solo pintan.
- **Fecha móvil (solo la maqueta):** la muestra corta ayer en Lima y su historia se mueve con el corte. Toda fecha nueva en `src/muestra/configuracion.js` se clasifica (rango, calendario o historia) y se suma a `muestraAl()`; con data real se apaga. Ver `docs/fecha-movil.md`.
- **Antes de cada commit:** `npm run prueba` y `npm run sistema`. Y ninguna cifra, nombre o captura de clientes reales en el repositorio.
- **Textos:** en español peruano, observan y no ordenan, dos frases como máximo por lectura. Pasan por vickyfy.
