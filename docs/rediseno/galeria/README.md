# Galería de formas

Prototipo para decidir, en la fase 3, qué forma lleva cada bloque. No es la demo: es la data de muestra y la capa de cálculo que la demo va a usar, dibujadas en dos o tres formas por bloque.

- `index.html`: se abre con doble clic. `artefacto.html` es la misma página sin la envoltura del documento, para publicarla.
- `muestra/`: generador con semilla fija (`generador.js`), su configuración con el origen de cada parámetro (`configuracion.js`), la capa de cálculo pura (`vista.js`), el formateador y utilidades.
- `formas.js`: las formas en SVG propio; cada marca lleva `data-valor`.
- `app.js`: compone los bloques; no calcula.
- `armar.mjs`: junta todo en un solo HTML sin dependencias: `node docs/rediseno/galeria/armar.mjs`.

## Pruebas

| Prueba | Qué comprueba | Prueba negativa |
|---|---|---|
| `node docs/rediseno/galeria/pruebas/formato.prueba.mjs` | 22 casos del formateador | `--sembrar` cambia el separador decimal: 15 de 22 |
| `node docs/rediseno/galeria/pruebas/vista.prueba.mjs` | 12 reglas en 33 períodos: participaciones que suman 100, aportes que suman el índice, sedes que suman el total, ningún delta sin cobertura, ninguna sede sin abrir con valor, ningún mes vacío en conversación, el 14 de julio de 2026 nunca como dato, etapas anidadas | `--sembrar` reabre el día caído de Meta: rojo |
| `node docs/rediseno/galeria/pruebas/humo.mjs` | En Chromium a 1440 y 390 px: etapas y teselas contra la vista, escala común de las zonas de sedes, rótulo de la franja contra su leyenda, título, sin scroll horizontal | Se comprobó sembrando una etapa 10 % más larga y un rótulo de franja con un punto de más: rojo en ambos |

## Paleta de la identidad B (reset.com.pe)

Validada con `validate_palette.js` de la skill de dataviz el 14 de octubre de 2026, modo oscuro sobre `#121211`:

```
#2f8adc,#c3457f,#d67b19,#19aa8e,#8670c0
[PASS] Lightness band         all 5 inside L 0.48–0.67
[PASS] Chroma floor           all 5 >= 0.1
[PASS] CVD separation         worst adjacent #8670c0↔#19aa8e ΔE 13.0 (deutan) · tritan 9.7
[PASS] Normal-vision floor    worst adjacent #d67b19↔#c3457f ΔE 19.3 (normal)
[PASS] Contrast vs surface    all 5 >= 3:1
```

Contraste de los tokens de texto de B sobre sus tres superficies (`#0a0a09`, `#121211`, `#1b1a19`): texto 1, 15,44 a 13,55; texto 2, 10,77 a 9,45; texto 3, 6,86 a 6,02.
