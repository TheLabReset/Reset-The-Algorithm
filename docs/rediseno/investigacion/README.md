# Investigación del rediseño (fase 2)

Seis informes hechos en paralelo el 14 de octubre de 2026, cada uno con un ángulo distinto y sus fuentes. Cada afirmación lleva **confirmé**, **se deduce** o **asumo**. Lo que ya estaba establecido en la investigación de referencia de THE LAB (documento interno de un proyecto anterior, que no está en este repo) se cita y no se repite.

| Informe | Pregunta | Respuesta corta |
|---|---|---|
| `01-formas.md` | ¿Qué forma responde cada tipo de pregunta? | Líneas, puntos y barras sobre escala común; small multiples; una sola forma poco común por pantalla. Horizon, marimekko, cartograma y coroplético por distrito, fuera. El sankey de leads miente con cohortes salvo cohorte cerrada con nodo «aún abierto» |
| `02-referencias.md` | ¿Qué copiar de FT, NYT, Reuters, Bloomberg, Pudding, Datawrapper, Observable, Linear, Stripe, Vercel, PostHog? | Título con la conclusión calculada del dato; meta dibujada con área de diferencia; recorrido por pasos con teclado; frescura por fuente; nada crítico en hover |
| `03-movimiento.md` | ¿Qué se anima y con qué soporte de navegador? | 240 ms en lectura, solo al cambiar algo; emparejar marcas por clave; View Transitions solo para cambio de capa y recorrido; recorrido guiado sin dependencia nueva |
| `04-identidad.md` | ¿Paleta, tipografía y tema desde las guías de la agencia? | Paleta en dos capas en OKLCH desde el violeta de la guía, validada para daltonismo; Montserrat con `tnum` y Bebas Neue para la cifra protagonista. Discrepancia: reset.com.pe no usa ese violeta |
| `05-graficos-y-stack.md` | ¿Gráficos propios o librería? ¿Qué está desactualizado? | d3 modular con SVG propio (15 kB contra 109 kB); Recharts 2 deprecado; Node 18 sin soporte; Vite 8 en PR aparte |
| `06-data-verosimil.md` | ¿Qué sector, qué nombres, qué benchmarks, qué reglas de coherencia? | Seguir en gimnasios con marca ficticia; competidores reales solo con data neutra; estacionalidad de Google Trends; 15 reglas por construcción |
