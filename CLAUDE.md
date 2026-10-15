# The Algorithm

Panel de inteligencia de marketing de The Lab. La demo usa data de muestra de Fit Lab, una marca ficticia.

- **Cómo se diseña un algoritmo:** sigue `docs/guia-algoritmo.md`. Ahí están las cuatro capas, la pestaña, las tipografías por defecto, la tarjeta, los gráficos y las reglas de datos honestos. Si algo nuevo contradice la guía, se actualiza la guía en el mismo cambio.
- **Ninguna cifra se escribe en un componente.** La data sale de `src/muestra` (generador con semilla fija), se calcula en `src/calculo` y los textos se arman en `src/textos`. Las pantallas (`src/pantallas`) solo pintan.
- **Antes de cada commit:** `npm run prueba` y `npm run sistema`. Y ninguna cifra, nombre o captura de clientes reales en el repositorio.
- **Textos:** en español peruano, observan y no ordenan, dos frases como máximo por lectura. Pasan por vickyfy.
