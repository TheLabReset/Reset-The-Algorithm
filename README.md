# The Algorithm by The Lab

Panel de inteligencia de marketing de The Lab. Junta la pauta, el CRM, las búsquedas, las redes y el sitio de un cliente, y los lee en cuatro capas. Esta demo usa data de muestra de **Fit Lab**, una cadena de gimnasios ficticia.

## Las cuatro capas

Van en el orden en que trabaja la agencia: escuchar el mercado, leer lo que dice el modelo, activar la pauta y medir el resultado. Todo se mueve con el período (atajos o dos fechas, contra el período anterior o un año antes), con la data por día. Cada capítulo lleva tres tarjetas como máximo; lo minucioso va en su detalle.

1. **Captura de señales:** qué se busca (Google Trends), qué se publica en el rubro (TikTok) y quién entra al sitio (GA4).
2. **Inteligencia de mercado:** índice de oportunidad con su historia, qué mirar (alertas y lo que va bien), temporada y escenario si nada cambia.
3. **Activación estratégica:** reparto de la inversión por plataforma y producto, sugerencia del modelo, cada plataforma (Google Ads, Meta Ads, TikTok Ads) con sus campañas, las piezas y campañas con su estado, y las horas del sitio.
4. **Rendimiento y optimización:** leads y acumulado del período, de la pauta al CRM, el CRM por dentro, cuándo y dónde entran los leads, y la competencia.

## Documentación

| Documento | Para qué |
|---|---|
| [`docs/guia-algoritmo.md`](docs/guia-algoritmo.md) | Cómo se diseña un algoritmo: capas, navegación, período, tarjeta, gráficos, datos honestos, glosario de medios y lo que dice el modelo |
| [`docs/fecha-movil.md`](docs/fecha-movil.md) | La maqueta al día: corta ayer en Lima; cómo funciona y cómo se apaga |
| [`docs/quincha.md`](docs/quincha.md) | El sistema de diseño: tokens, tipografía, componentes, gráficos y el chequeo |
| [`docs/abanico.md`](docs/abanico.md) | Cómo se muestran las artes: el abanico de anuncios y su ventana |
| [`docs/nuevo-algoritmo.md`](docs/nuevo-algoritmo.md) | **Duplicar el repo para otra marca**, paso a paso, y cómo conectar data real |
| [`docs/produccion-actions.md`](docs/produccion-actions.md) | **Pasar a producción:** cómo cobra GitHub Actions, lo que ya nos pasó y cómo gastar lo menos posible |
| [`docs/marca/fit-lab/`](docs/marca/fit-lab/) | La marca ficticia de la demo: logo, guía e investigación |
| [`CLAUDE.md`](CLAUDE.md) | Las reglas que sigue Claude Code en este repo |

## Correr la demo

Necesita Node 18 o más nuevo.

```bash
npm ci
npm run dev                          # http://localhost:3000
npm run prueba                       # reglas de cálculo, anclas y marca en un solo archivo
npm run sistema                      # tokens, contraste y espacios de Quincha
npm run build                        # build de producción en dist/
npm run artefacto -- salida.html     # la app en un solo HTML, para publicarla sin servidor
```

`npm run prueba` y `npm run sistema` se corren antes de cada commit.

## Cómo está armado

Ninguna cifra se escribe en un componente. La data entra por un solo lado, se calcula en un solo lado y las pantallas solo pintan.

```
src/
├── cliente.js        Quién es el cliente: nombre, rubro, búsqueda principal. Único archivo que nombra a la marca
├── muestra/          Generador de data de muestra con semilla fija y su configuración (cada parámetro con su origen); corta ayer (fecha móvil, docs/fecha-movil.md)
├── calculo/          Reglas puras: vista.js es la única puerta entre la data y la pantalla
├── textos/           Las lecturas, en español peruano: observan, no ordenan
├── capas/            Las cuatro capas y sus capítulos
├── pantallas/        Una pantalla por capa; solo pintan
└── sistema/          Quincha: tokens, componentes, gráficos SVG propios y formato de cifras
pruebas/              Pruebas de cálculo, período, piezas, fecha móvil, render de cada capa (texto, glosario, tres tarjetas por capítulo) y del chequeo de Quincha (node --test)
herramientas/         El chequeo del sistema y el armado del artefacto
public/marca/         favicon.svg y logo-barra.svg del cliente
```

**Dependencias:** React 18, Vite 5, los íconos de Lucide y las tipografías de la marca (`@fontsource-variable`). Los gráficos son SVG propios y los estilos son CSS plano con tokens, sin librerías de gráficos ni de estilos.

## Un cliente nuevo

Se sigue [`docs/nuevo-algoritmo.md`](docs/nuevo-algoritmo.md). En corto:

1. `src/cliente.js`: la marca y cómo habla su rubro.
2. `src/sistema/tokens.css`: la paleta y las tipografías.
3. `public/marca/`: el logo, con los mismos nombres de archivo.
4. `src/muestra/configuracion.js`: la data de muestra calibrada al rubro.
5. `src/textos/`: el vocabulario del embudo.

Los componentes no se tocan para cambiar de marca.

## Pipeline de datos anterior

`scrapers/`, `ml/` y `apify-actors/` vienen de la versión anterior del proyecto: scrapers de Google Trends, TikTok y Meta en Apify, y un pipeline de ML. **Todavía no están conectados al panel**, que hoy lee solo la data de muestra. Sus guías: [`SCRAPERS_GUIDE.md`](docs/SCRAPERS_GUIDE.md), [`APIFY_SCRAPERS.md`](docs/APIFY_SCRAPERS.md), [`API_SETUP_GUIDE.md`](docs/API_SETUP_GUIDE.md), [`API_REQUIREMENTS.md`](docs/API_REQUIREMENTS.md) y [`ML_ARCHITECTURE_PLAN.md`](docs/ML_ARCHITECTURE_PLAN.md). Las variables de entorno están en `.env.example`.

`docs/rediseno/` guarda el registro del rediseño (auditoría, investigación, plan y galería). Es historia: lo vigente está en la guía y en Quincha.

## Licencia

Propiedad de The Lab. Todos los derechos reservados.
