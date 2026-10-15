# Nuevo algoritmo para otra marca

El paso a paso para duplicar este repositorio y armar el algoritmo de otro cliente sin perder lo que ya se decidió.

> **Para Claude Code.** Cuando te digan «lee el playbook y adaptemos para [cliente]», lee este archivo completo, la [guía del algoritmo](guia-algoritmo.md) y [Quincha](quincha.md) antes de tocar nada. Luego avanza por fases, en orden, y espera la aprobación del usuario al cierre de cada una. No empieces a editar antes de cerrar la fase 1.

Los tres documentos se reparten así:

| Documento | Responde |
|---|---|
| [guia-algoritmo.md](guia-algoritmo.md) | Qué se muestra y en qué orden: capas, navegación, tarjeta, gráficos, datos honestos, el modelo |
| [quincha.md](quincha.md) | Con qué se construye: tokens, tipografía, componentes, gráficos y el chequeo |
| Este archivo | Cómo se pasa todo eso a otro cliente |

## Tres reglas antes de empezar

1. **¿Lo vamos a poder entregar con la data real?** La referencia es el algoritmo que la agencia ya tiene en producción. Una vista nueva entra si sale de fuentes que de verdad vamos a tener para este cliente. Si no, no entra, aunque se vea bien.
2. **Ninguna cifra, nombre ni captura de un cliente real entra al repositorio.** Tampoco como fixture ni recortada. El material de referencia vive en un directorio temporal, fuera del repo. Antes de cada commit se busca que no haya quedado adentro ninguna cifra ni nombre, del cliente o de sus competidores.
3. **Lo decidido no se rediscute por cliente.** Las cuatro capas, la pestaña, la tarjeta, la frase del objetivo, el formato de números y el tono ya están en la guía. Si un cliente de verdad necesita otra cosa, se cambia la guía en el mismo commit y se dice por qué.

## Paso 0: duplicar el repositorio

```bash
# 1. Crear el repositorio nuevo en GitHub (vacío) y clonar este encima
git clone <url de este repo> algoritmo-<cliente>
cd algoritmo-<cliente>
git remote set-url origin <url del repo nuevo>

# 2. Rama de trabajo del cliente
git checkout -b claude/algoritmo-<cliente>

# 3. Confirmar que todo pasa antes de cambiar nada
npm ci
npm run prueba      # reglas de cálculo, anclas y que la marca viva en un solo archivo
npm run sistema     # tokens, contraste y espacios
npm run dev         # http://localhost:3000
```

Si las pruebas no pasan en el repo recién clonado, se arregla eso primero. Adaptar sobre una base rota esconde los errores nuevos.

## Fase 0: preguntas iniciales

Hacer todas juntas. Lo que el usuario no sepa se investiga en la fase 1.

**Las responde el usuario:**

1. Nombre de la marca, cómo se escribe y si tiene sigla.
2. Rubro, país y ciudades.
3. Objetivo de la pauta: leads, ventas, alcance, tráfico o visitas.
4. Inversión mensual aproximada, en dólares.
5. Plataformas de pauta activas (Google Ads, Meta Ads, TikTok Ads, otras) y el objetivo de costo por lead de cada una.
6. **Fuentes que de verdad vamos a tener:** GA4, CRM (cuál y con qué etapas), cuentas de pauta, Google Trends, biblioteca de anuncios de Meta. Lo que no esté acá no se muestra en el algoritmo.
7. Cómo se llama a quien compra (socio, alumno, paciente, cliente) y cómo se llama la conversión final en el CRM (inscripción, matrícula, compra).
8. Sedes, campus o tiendas, si el CRM las registra.
9. De cuatro a seis productos o servicios que se siguen.
10. Competidores que el cliente reconoce.
11. Identidad visual: logo en SVG, colores y tipografías de marca con licencia de uso.

**Se investigan si faltan:** estacionalidad del rubro, palabras que se buscan, hashtags, rangos de costo por lead y de conversión del rubro en el país.

## Fase 1: investigación en paralelo

Un subagente por bloque, todos a la vez. Cada cifra trae su fuente y su etiqueta: **confirmé** (tiene fuente primaria) o **asumo** (no la tiene). Fuentes del Perú primero, luego de Latinoamérica y al final globales.

| Bloque | Qué busca | Termina en |
|---|---|---|
| A. Marca | Colores, tipografías, tono, logo | Fase 2 |
| B. Mercado | Estacionalidad mensual del rubro, feriados que lo mueven | `estacionalidad`, `feriados` |
| C. Competencia | De cinco a seis marcas, su presencia en redes y sus anuncios activos | `conversacion`, `redesMarcas` |
| D. Embudo | Rangos de contacto, cita y conversión del rubro | `embudo`, `crm` |
| E. Búsquedas | Palabras de categoría, de intención y de marca; hashtags | `busquedas`, `palabrasClave`, `hashtags` |
| F. Pauta | CPM, CTR y conversión por plataforma en el país | `canales` |

Los hallazgos se presentan juntos y se espera la validación antes de seguir. Para un research largo está la skill `deep-research-thelab`.

**No se usan tablas de referencia sin fuente.** El costo por lead de la muestra no se escribe: se deriva de CPM, CTR y conversión (`CPL = CPM / (1000 · CTR · CVR)`), y cada uno de esos tres valores lleva su etiqueta.

## Fase 2: marca y paleta

Todo sale de Quincha ([quincha.md](quincha.md), sección «Un cliente nuevo»):

1. **Paleta.** Cambiar los primitivos de `src/sistema/tokens.css` por los del cliente: su oscuro, su claro, su color de identidad y su color para datos. Los semánticos no se tocan.
2. **Tipografías.** Hay tres papeles: `--f-titulo` (títulos y cifras), `--f-texto` y `--f-tabla`.
   - Si la marca tiene las suyas con licencia, se instalan con `@fontsource-variable`, se importan en `src/main.jsx` y van en esos tokens. Fit Lab usa Bricolage Grotesque y Atkinson Hyperlegible Next, y sus tablas usan la de texto.
   - Si no, van las de referencia: `npm install @fontsource-variable/sofia-sans @fontsource-variable/sofia-sans-condensed @fontsource-variable/sofia-sans-semi-condensed` (licencia OFL). Condensed en `--f-titulo`, Sofia Sans en `--f-texto` y Semi Condensed en `--f-tabla`.
   - Si la tipografía de texto tacha el cero, se reemplazan solo los dígitos (`'Cifras de la marca'` en `src/sistema/base.css`). Si no lo tacha, ese bloque se borra junto con su nombre en `--f-texto`.
   - Las tipografías de la marca anterior se desinstalan.
3. **Logo.** Se reemplazan los dos archivos de `public/marca/` y se mantienen sus nombres: `favicon.svg` y `logo-barra.svg` (en negativo, porque va sobre la barra oscura).
4. Correr `npm run sistema`. Dice qué par de colores no alcanza su contraste, en claro y en oscuro. Se ajusta el primitivo hasta que pase; la regla no se ajusta.
5. Mirar las cuatro capas en claro y en oscuro.
6. Escribir cómo entra la marca al panel: qué es identidad y qué es dato, qué versión del logo va en la barra y qué partes de la marca no entran (personajes, humor). El modelo es la parte 11 de la guía de Fit Lab (`docs/marca/fit-lab/guia.html`).

Se presenta la paleta propuesta con sus contrastes medidos y se espera la aprobación.

## Fase 3: el cliente y su data de muestra

Los archivos van en este orden. Después de cada uno se corre `npm run prueba`.

| # | Archivo | Qué se cambia |
|---|---|---|
| 1 | `src/cliente.js` | Nombre, rubro, ciudad, la búsqueda principal y cómo se llama a quien compra (en singular y en plural). Es el único archivo que nombra a la marca: una prueba falla si aparece escrita en otro lado. |
| 2 | `src/muestra/configuracion.js` | Los parámetros del generador, cada uno con su origen (confirmé o asumo). Ver la lista de abajo. |
| 3 | `src/capas/estructura.js` | Los capítulos de cada capa y su pregunta. Se agrega o se quita un capítulo; las capas no cambian. |
| 4 | `src/textos/` | El vocabulario del embudo (ver la fase 4). |
| 5 | `src/pantallas/` | Solo si se agregó o se quitó un capítulo. |

**En `configuracion.js`, por bloque:**

- `canales` y `plataformas`: las plataformas como las ve el cliente. Google Ads es una sola plataforma aunque tenga campañas de Search y de Display. `metaCpl` es el objetivo que da el cliente.
- `presupuestoMensual`, `pesoPresupuestoMes`, `presionSubasta`.
- `embudo` y `crm.etapas`: las etapas reales del CRM del cliente, con sus nombres.
- `sedes`: solo si el CRM registra la sede.
- `web.fuentes` y `web.paginas`: las páginas reales del sitio.
- `busquedas`: la primera es la búsqueda principal y su `id` es el mismo de `CLIENTE.busqueda`. La de marca lleva `propia: true`.
- `conversacion` y `redesMarcas`: la competencia. Solo lo publicado, sin sentimiento inventado ni participación de mercado.
- `hashtags`, `palabrasClave`, `terminosBusqueda`, `campanas`, `productos`.
- `eventos`: los días en que una fuente no cargó, para que la demo muestre un hueco y no un cero.
- `cambiosCosto` y la `calidad` de cada canal: el escenario forzado que hace que el modelo proponga mover inversión en el último mes. Se ajusta hasta que la prueba «el último mes de la muestra trae una propuesta de reparto» pase, sin tocar el modelo.

**No se tocan** `src/sistema/` (los componentes de Quincha) ni `src/calculo/` (las reglas). Si un cliente de verdad necesita otra regla, se cambia con su prueba y se anota en la guía.

## Fase 4: textos

Las reglas no cambian con el cliente:

- Español peruano. Sin rayas largas y sin «gente».
- **Observan, no ordenan.** Nunca «se recomienda» ni un verbo en infinitivo como orden («Aumentar», «Reducir»). Lo que se puede hacer se dice como algo que se puede mirar o conversar con el cliente («Si esas búsquedas corresponden a lo que ofrece la marca. Si no, se pueden pausar.»).
- Dos frases como máximo por lectura. Cada comparación dice frente a qué.
- Las cifras chicas al inicio de una frase van en letras.
- **Números:** coma decimal y espacio para los miles desde las cinco cifras (1250, 74 200, 7,20 %). Sale de `src/sistema/formato.js`, que sigue la norma peruana; ningún texto formatea a mano.
- Un dato que falta dice «sin dato», nunca cero.
- De la competencia, solo lo observable, sin adjetivos.
- Todo texto pasa por la skill `vickyfy` antes de entregar.

**Vocabulario del rubro.** Lo que nombra a la marca sale de `src/cliente.js`. El embudo de la muestra es el de un gimnasio (lead, contacto, cita, asiste, inscripción), y ese vocabulario está escrito en `src/textos/` y en los títulos de las pantallas. Para otro rubro se reescribe ahí, a mano y con vickyfy. Los nombres internos del cálculo (`altas`, `inscritos`, `cpa`) no se renombran: cambia lo que se lee, no el código.

| | Gimnasio (muestra) | Universidad | Salud | Inmobiliaria | Retail |
|---|---|---|---|---|---|
| `cliente` / `clientes` | socio / socios | alumno / alumnos | paciente / pacientes | comprador / compradores | cliente / clientes |
| Sede | sede | campus | sede o clínica | proyecto | tienda |
| Paso intermedio | clase de prueba | charla o visita | consulta inicial | visita al proyecto | primera compra |
| Conversión | inscripción | matrícula | atención | separación | compra |
| Producto | membresía | carrera o programa | especialidad | tipología | categoría |

«Lead» se queda en todos los rubros, porque así lo reportan las plataformas y el CRM.

## Fase 5: revisión antes de entregar

- [ ] `npm run prueba` y `npm run sistema` pasan.
- [ ] La búsqueda de fugas no encuentra cifras ni nombres de clientes reales en lo agregado.
- [ ] Ninguna mención al cliente anterior: `git grep -i` con su nombre, su rubro y sus productos.
- [ ] Captura de cada capa a 1440 y a 390 de ancho, en claro y en oscuro, revisada a ojo. Sin scroll horizontal.
- [ ] La barra de la demo: con datos, cargando, el CRM no cargó y GA4 no cargó. Cada tarjeta dice lo que falta en vez de dibujar ceros.
- [ ] El índice «En esta capa» marca Resumen arriba de todo, sigue la lectura al bajar y un clic no cambia de capa.
- [ ] El modelo muestra una propuesta en Activación estratégica (el escenario forzado funciona).
- [ ] Cada lectura tiene dos frases como máximo y pasó por vickyfy.
- [ ] `npm run artefacto -- <salida.html>` arma la página para publicar.
- [ ] Commits por fase en la rama del cliente. No se pushea a main, no se mergea y no se despliega sin permiso.

## De la muestra a la data real

Hoy toda cifra sale del generador. Para conectar data real se reemplaza la fuente y nada más: el cálculo, los textos y las pantallas quedan igual.

**La única puerta es `armarVista(data, filtros, estado)`** en `src/calculo/vista.js`. Recibe un objeto `data` con esta forma, que hoy arman `generar()` y `detallar()`:

| Campo | Forma | Fuente real |
|---|---|---|
| `config` | La configuración del cliente | `src/muestra/configuracion.js`, sin los parámetros del generador |
| `dias`, `semanas` | Fechas ISO del rango | Calendario |
| `pauta[canal][]` | `{fecha, inversion, impresiones, clics, leads}` por día; un día sin dato lleva `sinDato: true` | Google Ads, Meta Ads, TikTok Ads |
| `web[]` | `{fecha, fuentes, organicos, paginas, solicitudesPorPagina}` por día | GA4 |
| `cohortes[]` | `{fecha, canal, sede, leads, contactos, citas, asisten, altas}` | CRM |
| `porHora[]` | `{fecha, horas[24]}` | CRM |
| `busquedas[]` | `{id, termino, propia, semanas: [{semana, indice}]}` | Google Trends |
| `conversacion[]` | `{id, nombre, propia, semanas: [{semana, menciones}]}` | Escucha social |

El detalle (campañas, palabras clave, términos, CRM por lead, hashtags, redes, regiones y GA4 por hora) lo arma `detallar()` en `src/muestra/detalle.js`. **Esta es la primera costura que hay que abrir:** hoy `src/calculo/produccion.js` llama a `detallar()` directo. Un lector de data real tiene que devolver el detalle con la misma forma y entrar por ese mismo punto.

**Antes de pasar a producción** se lee [produccion-actions.md](produccion-actions.md): cómo cobra GitHub los workflows, lo que ya nos pasó y la lista de lo que tiene que estar listo, incluido que el repo sea privado.

Las carpetas `scrapers/`, `ml/` y `apify-actors/` son el pipeline de datos anterior. Todavía no están conectadas al panel; sus guías están en `docs/SCRAPERS_GUIDE.md`, `docs/APIFY_SCRAPERS.md`, `docs/API_SETUP_GUIDE.md` y `docs/ML_ARCHITECTURE_PLAN.md`.

## Qué cambió frente al playbook anterior

Este archivo reemplaza a «Adaptación para Nuevos Clientes», que describía el stack anterior (Tailwind, Recharts y `src/data/mockData.js`). Se conservaron las preguntas iniciales, los bloques de investigación, el mapa de términos por rubro y el trabajo por fases con aprobación. Se quitaron tres cosas que hoy serían un retroceso:

- **El tono «se recomienda considerar…».** La regla es observar, no ordenar.
- **Las tablas de reparto por objetivo y de costo por lead por rubro.** No tenían fuente; hoy cada parámetro lleva su origen y el costo por lead se deriva.
- **El formato 1.250 / 7,20 %.** Los miles van con espacio, según la norma peruana que sigue `formato.js`.
