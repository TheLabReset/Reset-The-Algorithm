# 04 · Identidad visual y color de The Algorithm

Investigación de THE LAB para el rediseño de «The Algorithm», 14/10/2026. Solo lectura sobre el repo. Scripts, fuentes descargadas y salidas en `scratchpad/identidad/`.

Etiquetas: **confirmé** (verificado contra fuente o ejecutando), **se deduce** (inferido), **asumo** (no comprobado).

---

## 0 · La respuesta corta

1. **La web pública de Reset no usa el violeta.** reset.com.pe es negra con texto beige `#E8E2DF` y un verde neón `#00FF63` como acento, con Sanomat Web, Aeonik y Druk Condensed. `#6F42C1` no aparece ni en su CSS ni en su HTML (confirmé, 14/10/2026). Gana la guía: el violeta `#6F42C1` es la marca de este producto, pero la discrepancia queda reportada abajo para que Reset la decida.
2. **La paleta propuesta sale de un solo tono, H = 295,0°** (el de `#6F42C1`), con grises de croma 0,004 a 0,018. Todos los tokens de texto pasan 4,5:1 en las tres superficies de su tema: el más justo es «mejora» claro con 4,77:1 (confirmé ejecutando).
3. **Datos:** violeta, naranja, cian, oliva y azul, en ese orden. Pasan el validador de la skill en claro y en oscuro: CVD adyacente 16,7 y 17,5, visión normal 17,4 y 17,7. Las tres primeras series pasan además la prueba de todos los pares (confirmé, salida pegada en §4). La paleta actual falla en ambos modos.
4. **Tipografía:** Montserrat sirve para cifras tabulares. Con `tnum`, sus diez dígitos pasan a un solo ancho de 700 unidades en los pesos 400, 600 y 700. Trae U+2212 y U+00A0, pero **no trae U+202F** (confirmé en el archivo). Bebas Neue no tiene minúsculas, así que se limita a cifras grandes.
5. **Tema:** ambos, con el oscuro por defecto y uno claro como «modo sala». La evidencia sobre proyección es débil. Lo que sí medí es que el oscuro pierde más contraste en los grises medios cuando hay luz ambiente.

---

## 1 · Identidad pública de Reset (tarea 1)

**Fuente:** `https://reset.com.pe/` (HTTP 200, WordPress 7.1.3, tema `teampicol-reset-150f09da85ad` v0.2.23 de Picol Estudio). Descargué el HTML y el `style.css` (1 014 447 bytes, con las fuentes embebidas en base64) y los analicé con un script (confirmé). El sitio es el de la agencia de medios de Lima: habla de «planning de medios ATL y digitales» y de «54 socios» (confirmé en el texto de la página). La prensa sectorial la describe igual (Mercado Negro, America Retail).

| Qué | En reset.com.pe | En la guía de The Lab |
|---|---|---|
| Fondo | `html{background-color:#000}` | producto oscuro con vidrio |
| Texto | `#E8E2DF`, que el CSS llama `.color-white` | no lo define |
| Acento | `#00FF63` «green-neon» (19 usos: menú activo, hover, puntos del carrusel) | violeta `#6F42C1` |
| Error de formulario | `#FF60FF` | no lo define |
| Tipografías cargadas | **Sanomat Web** (pesos 300 a 900, 65 usos), **Aeonik** (16), **Druk Condensed** 900 (11), Myriad Pro (4) | **Bebas Neue** y **Montserrat** |
| `#6F42C1` | **0 apariciones** en CSS y HTML | color de marca |

- Los violetas que sí aparecen en el HTML (`#9b51e0` como `--wp--preset--color--vivid-purple`, y `#ab1dfe` dentro del degradado preestablecido «purple-crush») son la paleta por defecto del núcleo de WordPress, no de Reset (confirmé en las variables y clases preestablecidas de WordPress del HTML).
- El logo (`logo-footer.svg`) es monocromo, sin `fill`: hereda el color del contexto (confirmé).
- **Lectura:** se deduce que la guía describe la identidad de los productos internos de Reset (SiReset), no la de su web corporativa. Druk Condensed en la web y Bebas Neue en la guía cumplen el mismo papel: una condensada de exhibición en mayúsculas. **Recomendación:** usar la guía y pedirle a Reset una línea que confirme que el violeta es la marca de producto. Hay un puente posible: el beige `#E8E2DF` como texto-1 del tema oscuro (15,2:1 sobre `#0F0A1A`). No lo adopto porque su tono es cálido (48,6°) y choca con grises teñidos de violeta. Queda como decisión abierta.

---

## 2 · El antes, medido (tarea 6)

**`tailwind.config.js` (confirmé leyendo):** todos los colores son valores por defecto de Tailwind. `#7C3AED` es violet-600, `#5B21B6` violet-800, `#A78BFA` violet-400, `#06B6D4` cyan-500, `#10B981` emerald-500, `#F59E0B` amber-500, `#EF4444` red-500, `#9CA3AF` gray-400 y `#6B7280` gray-500 (confirmé contra `node_modules/tailwindcss/colors`). Los comentarios hablan de «FitZone», el cliente demo anterior.

Otros hallazgos del repo:
- **Inter se declara pero nunca se carga.** No hay `@font-face` ni enlace a Google Fonts, así que se ve la fuente del sistema (confirmé con grep en `index.html`, `src` y `public`).
- **`fitzone-orange`, `fitzone-lime` y `fitzone-darkOrange` se usan 22 veces y no existen en el config.** El CSS compilado de `dist` las tiene 0 veces, así que esas clases no pintan nada (confirmé).
- **Los gráficos no usan los tokens.** `OptimizationLayer.jsx` pinta con `#FF6B35`, `#00D4FF`, `#B8FF00` y `#8884d8`, que es el relleno de ejemplo de la documentación de Recharts (confirmé en el código; el origen de `#8884d8` es de memoria).
- **El estado se usa como serie.** `success` es `#10B981`, el mismo esmeralda de la serie 3. Lo mismo pasa con `warning` y la serie 4, y con `error` y la serie 5 (confirmé en el config).
- **El racimo que la guía marca está completo:** degradados violeta (`gradient-fitzone*`), resplandor (`fitzone-glow`, `pulse-glow`), fondo violeta-negro saturado (`#0F0A1A` con C 0,034 y `#1A1432` con C 0,057) y favicon `/vite.svg` (confirmé).
- `#6F42C1` sobre el fondo actual `#0F0A1A` da 2,99:1: ni siquiera alcanza el 3:1 de una marca gráfica (confirmé).

**Validador sobre la paleta de datos actual (confirmé ejecutando):**

```
$ node validate_palette.js "#7C3AED,#06B6D4,#10B981,#F59E0B,#EF4444" --mode light
  [PASS] Lightness band         all 5 inside L 0.43–0.77
  [PASS] Chroma floor           all 5 >= 0.1
  [PASS] CVD separation         worst adjacent #F59E0B↔#10B981 ΔE 8.9 (protan) · tritan 3.4
  [FAIL] Normal-vision floor    worst adjacent #10B981↔#06B6D4 ΔE 12.5 (normal): below 15, hard to tell apart even with full color vision
  [WARN] Contrast vs surface    below 3:1: relief required (visible labels or table view): [["#06B6D4",2.36],["#10B981",2.47],["#F59E0B",2.09]]
  → FAILED   exit 1

$ node validate_palette.js "#7C3AED,#06B6D4,#10B981,#F59E0B,#EF4444" --mode dark --surface "#0F0A1A"
  [FAIL] Lightness band         outside band: [["#06B6D4",0.715],["#10B981",0.696],["#F59E0B",0.769]]
  [PASS] Chroma floor           all 5 >= 0.1
  [PASS] CVD separation         worst adjacent #F59E0B↔#10B981 ΔE 8.9 (protan) · tritan 3.4
  [FAIL] Normal-vision floor    worst adjacent #10B981↔#06B6D4 ΔE 12.5 (normal): below 15, ...
  [PASS] Contrast vs surface    all 5 >= 3:1
  → FAILED   exit 1
```
Sobre la card `#1A1432` el resultado es idéntico. Los colores reales de `OptimizationLayer` (`#FF6B35,#00D4FF,#B8FF00` sobre `#1A1432`) fallan la banda de luminosidad: L 0,705, 0,804 y 0,918 (confirmé, en `identidad/validacion-antes-graficos.txt`).

---

## 3 · Paleta propuesta: primitivos y semánticos (tarea 2)

**Método.** Seguí la sección 3.2 de la investigación de referencia como procedimiento, sin copiar sus valores. Todo se deriva en OKLCH con el tono fijo H = 295,0°, calculado desde `#6F42C1` = `oklch(50,2% 0,188 295,0)`. Cuando un color se sale de sRGB, baja el croma y se mantienen L y H (`clampChroma` de culori 4.0.1). El script es `identidad/scripts/paleta.mjs`. Para el contraste, el WCAG de culori coincide con la función `contrast()` del validador de la skill al tercer decimal en cinco pares de prueba (confirmé).

### 3.1 Primitivos

| Token | Hex | OKLCH | vs blanco | vs gris-975 |
|---|---|---|---|---|
| violeta-50 | `#f7f5ff` | 97,5% 0,013 295 | 1,08 | 18,38 |
| violeta-100 | `#eee9ff` | 94,4% 0,030 296 | 1,18 | 16,75 |
| violeta-200 | `#ddd4ff` | 89,1% 0,059 295 | 1,41 | 14,11 |
| violeta-300 | `#c5b4fb` | 80,9% 0,100 295 | 1,86 | 10,67 |
| violeta-400 | `#ab91f2` | 71,9% 0,140 295 | 2,60 | 7,62 |
| violeta-500 | `#9572e7` | 63,9% 0,171 295 | 3,60 | 5,51 |
| violeta-600 | `#8257d9` | 56,9% 0,190 295 | 4,87 | 4,07 |
| **violeta-700** | **`#6f42c1`** | **50,2% 0,188 295** | **6,51** | 3,05 |
| violeta-800 | `#572e9d` | 41,9% 0,169 295 | 9,20 | 2,16 |
| violeta-900 | `#3d206f` | 33,1% 0,129 295 | 12,85 | 1,54 |
| violeta-950 | `#261547` | 25,1% 0,089 295 | 16,40 | 1,21 |
| gris-0 | `#ffffff` | 100% 0 | 1,00 | 19,83 |
| gris-25 | `#fcfbfe` | 99,0% 0,004 | 1,03 | 19,24 |
| gris-50 | `#f6f5f9` | 97,2% 0,005 | 1,09 | 18,27 |
| gris-100 | `#edecf1` | 94,5% 0,007 | 1,18 | 16,88 |
| gris-200 | `#dedde3` | 90,0% 0,008 | 1,35 | 14,69 |
| gris-300 | `#c7c6ce` | 83,0% 0,011 | 1,69 | 11,71 |
| gris-400 | `#a5a3ac` | 72,0% 0,013 | 2,49 | 7,97 |
| gris-500 | `#817f88` | 60,1% 0,014 | 3,94 | 5,03 |
| gris-600 | `#66646f` | 50,9% 0,017 | 5,81 | 3,42 |
| gris-700 | `#4d4b56` | 41,9% 0,018 | 8,55 | 2,32 |
| gris-800 | `#33313b` | 31,9% 0,018 | 12,78 | 1,55 |
| gris-850 | `#26242d` | 26,6% 0,017 | 15,30 | 1,30 |
| gris-900 | `#1c1a23` | 22,4% 0,018 | 17,19 | 1,15 |
| gris-950 | `#100e16` | 17,0% 0,017 | 19,15 | 1,04 |
| gris-975 | `#0a090f` | 14,4% 0,013 | 19,83 | 1,00 |
| verde-600 | `#1d7d3e` | 52,0% 0,130 150 | | |
| verde-300 | `#6ed889` | 79,9% 0,149 150 | | |
| rojo-600 | `#c22826` | 53,1% 0,190 27 | | |
| rojo-300 | `#fa887d` | 74,9% 0,141 27 | | |
| ambar-700 | `#956211` | 53,9% 0,110 72 | | |
| ambar-300 | `#ffbc63` | 84,0% 0,131 72 | | |

Los grises tienen el tono de la marca (292° a 296°) con croma de 0,004 a 0,018. El fondo oscuro actual tiene C 0,034 y la card C 0,057: entre dos y tres veces más violeta. Eso es lo que hoy se lee como «violeta-negro» (confirmé los números).

### 3.2 Semánticos y su contraste (confirmé ejecutando; mínimo 4,5:1 para texto y 3:1 para controles y foco)

Las tres cifras de cada fila son el contraste sobre fondo / superficie / superficie elevada del mismo tema.

**Tema claro**: fondo `#f6f5f9` (gris-50) · superficie `#fcfbfe` (gris-25) · superficie elevada `#ffffff` (gris-0)

| Token | Hex | Contraste | Mín |
|---|---|---|---|
| texto-1 | `#100e16` gris-950 | 17,65 / 18,58 / 19,15 | 17,65 |
| texto-2 | `#4d4b56` gris-700 | 7,88 / 8,29 / 8,55 | 7,88 |
| texto-3 | `#66646f` gris-600 | 5,35 / 5,63 / 5,81 | 5,35 |
| acento (y texto de enlace) | `#6f42c1` violeta-700 | 6,00 / 6,32 / 6,51 | 6,00 |
| foco | `#8257d9` violeta-600 | 4,48 / 4,72 / 4,87 | 4,48 (pide 3:1) |
| mejora | `#1d7d3e` verde-600 | 4,77 / 5,02 / 5,18 | 4,77 |
| empeora | `#c22826` rojo-600 | 5,34 / 5,62 / 5,79 | 5,34 |
| atención | `#956211` ambar-700 | 4,80 / 5,05 / 5,21 | 4,80 |
| no medido | `#66646f` gris-600 | 5,35 / 5,63 / 5,81 | 5,35 |
| borde de control | `#817f88` gris-500 | 3,63 / 3,83 / 3,94 | 3,63 (pide 3:1) |
| borde decorativo | `#dedde3` gris-200 | 1,24 / 1,31 / 1,35 | no aplica |

**Tema oscuro**: fondo `#0a090f` (gris-975) · superficie `#100e16` (gris-950) · superficie elevada `#1c1a23` (gris-900)

| Token | Hex | Contraste | Mín |
|---|---|---|---|
| texto-1 | `#f6f5f9` gris-50 | 18,27 / 17,65 / 15,84 | 15,84 |
| texto-2 | `#c7c6ce` gris-300 | 11,71 / 11,31 / 10,15 | 10,15 |
| texto-3 | `#a5a3ac` gris-400 | 7,97 / 7,69 / 6,91 | 6,91 |
| acento (relleno) | `#ab91f2` violeta-400 | 7,62 / 7,35 / 6,60 | 6,60 |
| texto de enlace | `#c5b4fb` violeta-300 | 10,67 / 10,30 / 9,25 | 9,25 |
| foco | `#c5b4fb` violeta-300 | 10,67 / 10,30 / 9,25 | 9,25 |
| mejora | `#6ed889` verde-300 | 11,19 / 10,80 / 9,70 | 9,70 |
| empeora | `#fa887d` rojo-300 | 8,39 / 8,10 / 7,27 | 7,27 |
| atención | `#ffbc63` ambar-300 | 11,92 / 11,52 / 10,34 | 10,34 |
| no medido | `#a5a3ac` gris-400 | 7,97 / 7,69 / 6,91 | 6,91 |
| borde de control | `#817f88` gris-500 | 5,03 / 4,86 / 4,36 | 4,36 |
| borde decorativo | `#33313b` gris-800 | 1,55 / 1,50 / 1,35 | no aplica |

**Cruce de temas.** El script también midió cada token sobre las superficies del otro tema. Ninguno pasa 4,5:1 fuera de su tema; el mejor es «mejora» claro sobre el fondo oscuro, con 3,83. Eso confirma que no hay tokens compartidos entre temas, salvo `borde-control`.

**Reglas que salen de los números:**
- **El violeta de marca nunca es estado.** Mejora es verde (150°), empeora es rojo (27°) y atención es ámbar (72°). Los tres están a 120° o más de la marca. Su distancia ΔE al acento va de 28 a 38 (confirmé).
- **El botón primario** del tema claro es `#6f42c1` con texto blanco (6,51:1). En el oscuro es `#ab91f2` con texto gris-950 (7,35:1). Sobre fondo oscuro la marca literal da 3,05:1, así que en oscuro **el acento es el violeta-400, no el 700** (confirmé).
- **«No medido» comparte color con texto-3 a propósito.** Lo que lo identifica es la raya tipográfica U+2014 y la textura a 135°, no el color. Así no compite con el gris de «período anterior» (se deduce, siguiendo la convención de la investigación de referencia 3.4 como método).
- **El gris de texto más claro permitido es gris-600 en claro y gris-400 en oscuro.** El gris-500 solo sirve para bordes de control y marcas (3,6 a 5,0:1).

### 3.3 Bloque CSS (dos capas)

```css
:root {
  /* Primitivos: solo los usan los semánticos */
  --violeta-300:#c5b4fb; --violeta-400:#ab91f2; --violeta-600:#8257d9; --violeta-700:#6f42c1; /* marca, 6,51:1 sobre blanco */
  --gris-0:#ffffff; --gris-25:#fcfbfe; --gris-50:#f6f5f9; --gris-200:#dedde3; --gris-300:#c7c6ce; --gris-400:#a5a3ac;
  --gris-500:#817f88; --gris-600:#66646f; --gris-700:#4d4b56; --gris-800:#33313b; --gris-900:#1c1a23; --gris-950:#100e16; --gris-975:#0a090f;
  --verde-600:#1d7d3e; --verde-300:#6ed889; --rojo-600:#c22826; --rojo-300:#fa887d; --ambar-700:#956211; --ambar-300:#ffbc63;

  /* Semánticos, tema claro */
  --fondo:var(--gris-50); --superficie:var(--gris-25); --superficie-elevada:var(--gris-0);
  --texto-1:var(--gris-950); --texto-2:var(--gris-700); --texto-3:var(--gris-600);   /* 17,65 · 7,88 · 5,35 mín */
  --borde:var(--gris-200); --borde-control:var(--gris-500);
  --acento:var(--violeta-700); --acento-texto:var(--violeta-700); --foco:var(--violeta-600);
  --mejora:var(--verde-600); --empeora:var(--rojo-600); --atencion:var(--ambar-700); --no-medido:var(--gris-600);
}
:root[data-theme="oscuro"] {
  --fondo:var(--gris-975); --superficie:var(--gris-950); --superficie-elevada:var(--gris-900);
  --texto-1:var(--gris-50); --texto-2:var(--gris-300); --texto-3:var(--gris-400);   /* 15,84 · 10,15 · 6,91 mín */
  --borde:var(--gris-800); --borde-control:var(--gris-500);
  --acento:var(--violeta-400); --acento-texto:var(--violeta-300); --foco:var(--violeta-300);
  --mejora:var(--verde-300); --empeora:var(--rojo-300); --atencion:var(--ambar-300); --no-medido:var(--gris-400);
}
```
Si el oscuro va por defecto, el selector se invierte. El JSON completo está en `identidad/tokens.json`.

---

## 4 · Paleta de datos (tarea 3)

**Cómo salió el orden.** Fijé el violeta como serie 1 y probé todas las permutaciones de 3 y 4 tonos entre cian, naranja, rosa, azul, oliva y turquesa. Cada candidato pasó por `validate()` de la skill en ambos modos (`paleta.mjs --buscar`). De 50 órdenes válidos elegí el de mayor CVD adyacente mínimo que además pasa la prueba de todos los pares con sus tres primeras series (confirmé).

| Serie | Tono | Claro | OKLCH claro | Oscuro | OKLCH oscuro |
|---|---|---|---|---|---|
| 1 | violeta (marca) | `#7544cd` | 52,0% 0,200 295 | `#8b61e3` | 60,0% 0,189 295 |
| 2 | naranja | `#dd6f23` | 66,0% 0,160 50 | `#d66919` | 64,0% 0,160 50 |
| 3 | cian | `#0090a8` | 60,1% 0,106 215 | `#0096af` | 62,0% 0,109 215 |
| 4 | oliva | `#848e2d` | 61,9% 0,120 115 | `#7e8826` | 60,0% 0,120 115 |
| 5 | azul | `#1762b6` | 50,0% 0,150 255 | `#337bd0` | 58,1% 0,149 255 |
| período anterior | gris-500 | `#817f88` | 60,1% 0,014 296 | `#817f88` | igual |

- **Período anterior:** 3,83:1 sobre la superficie clara y 4,86:1 sobre la oscura. Su ΔE mínimo contra las series es 10,5 en claro y 11,0 en oscuro (confirmé).
- **Tope:** por defecto se usan 4 series; la 5 queda solo para casos que la necesiten. En dispersión y small multiples el tope es 3 (lo valida la prueba de todos los pares).
- **Rampa secuencial (un tono, violeta):** en claro va de poco a mucho `#eee9ff,#ddd4ff,#c5b4fb,#ab91f2,#9572e7,#8257d9,#6f42c1,#572e9d,#3d206f`. En oscuro el ancla se invierte: `#3d206f` … `#ddd4ff`. Para uso ordinal, en claro se empieza en violeta-400 y en oscuro se termina en violeta-700.
- **Par divergente: violeta ↔ naranja, con gris al centro.** No uso verde ↔ rojo porque esos tonos son de estado. En claro: `#6130b1,#8a66d9,#b39ef2 | #edecf1 | #eb9666,#c46016,#873d00`. En oscuro: `#bda8fc,#9572e7,#6e44bc | #33313b | #984b16,#d26c28,#f5a06f`. Los brazos son simétricos en L, con ΔL entre brazos de 0,001 o menos (confirmé).

**Estado reservado, medido.** Distancia ΔE (OKLab ×100) de cada serie al estado más cercano:

| | Peor par en claro | Peor par en oscuro |
|---|---|---|
| serie ↔ estado | oliva ↔ atención **11,7**; naranja ↔ atención 14,1; naranja ↔ empeora 14,9 | naranja ↔ empeora **12,7** |

Ningún hex se repite entre series y estados. Barrí los tonos de oliva (100° a 130°), atención (65° a 88°), empeora (22° a 27°) y naranja (45° a 55°), y ninguna combinación supera ΔE 14 en todos los pares: la oliva queda entre el ámbar y el verde, y el naranja entre el rojo y el ámbar (confirmé). Por eso el estado se apoya en algo más que el color: va siempre como texto con flecha y signo, nunca como relleno de serie. Como referencia, la paleta por defecto de la skill tiene pares de 4,8 (confirmé en `palette.md`).

**Salida del validador (después):**

```
$ node validate_palette.js #7544cd,#dd6f23,#0090a8,#848e2d,#1762b6 --mode light --surface #fcfbfe
  [PASS] Lightness band         all 5 inside L 0.43–0.77
  [PASS] Chroma floor           all 5 >= 0.1
  [PASS] CVD separation         worst adjacent #848e2d↔#0090a8 ΔE 16.7 (protan) · tritan 11.4
  [PASS] Normal-vision floor    worst adjacent #848e2d↔#0090a8 ΔE 17.4 (normal)
  [PASS] Contrast vs surface    all 5 >= 3:1
  → ALL CHECKS PASS   exit 0
  (con --surface #f6f5f9, el fondo claro: idéntico, exit 0)

$ node validate_palette.js #8b61e3,#d66919,#0096af,#7e8826,#337bd0 --mode dark --surface #100e16
  [PASS] Lightness band         all 5 inside L 0.48–0.67
  [PASS] Chroma floor           all 5 >= 0.1
  [PASS] CVD separation         worst adjacent #7e8826↔#0096af ΔE 17.5 (deutan) · tritan 11.3
  [PASS] Normal-vision floor    worst adjacent #7e8826↔#0096af ΔE 17.7 (normal)
  [PASS] Contrast vs surface    all 5 >= 3:1
  → ALL CHECKS PASS   exit 0
  (con --surface #1c1a23, la superficie elevada: idéntico, exit 0)

$ node validate_palette.js #7544cd,#dd6f23,#0090a8 --mode light --surface #fcfbfe --pairs all
  [PASS] CVD separation         worst all-pairs #0090a8↔#7544cd ΔE 14.3 (deutan) · tritan 15.1
  [PASS] Normal-vision floor    worst all-pairs #0090a8↔#7544cd ΔE 22.5 (normal)      → exit 0
$ node validate_palette.js #8b61e3,#d66919,#0096af --mode dark --surface #100e16 --pairs all
  [PASS] CVD separation         worst all-pairs #0096af↔#8b61e3 ΔE 11.0 (deutan) · tritan 11.7
  [PASS] Normal-vision floor    worst all-pairs #0096af↔#8b61e3 ΔE 20.2 (normal)      → exit 0

$ node validate_palette.js #ab91f2,#9572e7,#8257d9,#6f42c1,#572e9d,#3d206f --ordinal --mode light --surface #fcfbfe
  [PASS] Lightness monotone · [PASS] Adjacent ΔL >= 0.06 · [PASS] Light-end contrast #ab91f2 at 2.53:1 · [PASS] Single hue 0°   exit 0
$ node validate_palette.js #6f42c1,#8257d9,#9572e7,#ab91f2,#c5b4fb,#ddd4ff --ordinal --mode dark --surface #100e16
  [PASS] ... Light-end contrast #6f42c1 at 2.94:1 · Single hue 0°   exit 0
Divergente, cada brazo desde el centro con --ordinal: los cuatro con exit 0
  (claro: extremos 2.24:1 y 2.24:1; oscuro: 2.93:1 y 3.06:1)
```
La salida completa, sin recortar, está en `identidad/validacion-despues.txt`. La prueba negativa es la paleta actual, que el mismo validador hace fallar (§2).

---

## 5 · Tipografía (tarea 4)

**Archivos medidos** (confirmé abriéndolos con fontkit 2.0.4, script `identidad/scripts/fuentes.js`):
- `Montserrat[wght].ttf` completo de github.com/google/fonts (727,5 kB, 2 747 glifos)
- `BebasNeue-Regular.ttf` completo (60,0 kB)
- Los subconjuntos latinos de @fontsource 5.3.0 y @fontsource-variable

| | Montserrat | Bebas Neue |
|---|---|---|
| Feature `tnum` | sí, en el archivo completo y en el subconjunto latino | sí |
| Dígitos sin `tnum` | **proporcionales**: 10 anchos en 400 (de 361 para el «1» a 662 para el «0») | ya tabulares: 1 ancho de 400 |
| Dígitos con `tnum` | **1 ancho, 700 unidades**, en los pesos 400, 600 y 700 | 1 ancho, 400 |
| U+2212 (menos) | sí, avance 560 (575 en 400 estático) | sí, 400 |
| U+00A0 (espacio duro) | sí, 250 a 262 | sí, 160 |
| U+202F (espacio fino duro) | **no** | **no** |
| U+2009 (espacio fino) | sí, 131 | no |
| Minúsculas | sí | **no**: «a» y «A» tienen el mismo contorno |
| Tildes, ñ, ¿, ¡, %, $, / | todos presentes | todos presentes |
| Peso latino woff2 | **37,1 kB** variable (todos los pesos) · 18,3 kB por peso estático | **13,4 kB** |

**Lo que implica:**
- **Montserrat sirve para tablas, pero hay que activarle `font-variant-numeric: tabular-nums`.** Por defecto sus dígitos son proporcionales y una columna no se alinea (confirmé). El costo: un dígito tabular mide 0,70 em contra 0,58 em de promedio proporcional, así que las columnas numéricas salen un 21% más anchas. El «1» tabular queda con aire a los lados (de 361 pasa a 700). No hace falta buscar otra fuente: cumple la condición que se pidió (se deduce).
- **Separador de miles:** U+00A0, porque ninguna de las dos trae U+202F y un glifo prestado de otra fuente desalinea las columnas. Esto se repite con Montserrat por la misma razón que en la investigación de referencia (confirmé la ausencia de U+202F). El menos tipográfico U+2212 está en ambas.
- **Variable o estática:** con tres o más pesos conviene el archivo variable (37,1 kB contra 18,3 kB × 3 = 55 kB). Montserrat variable más Bebas suman unos **50,5 kB** de subconjunto latino (confirmé los tamaños).
- **Bebas Neue para cifras grandes, sí.** Sus dígitos son tabulares por naturaleza y la fuente es condensada: siete dígitos ocupan 2 800 unidades contra 4 900 de Montserrat tabular (43% menos), lo que sirve para el KPI principal de cada capa. Para no caer en «todo en mayúsculas»:
  - Bebas va **solo en la cifra protagonista y en un título de capa corto**, de tres palabras como máximo y uno por pantalla.
  - Nunca en párrafos, botones, rótulos de eje, encabezados de tabla ni el copy de los estados.
  - La unidad que acompaña a la cifra («mil», «kB», «vs. set.») va en Montserrat, porque Bebas la convertiría en mayúsculas.
  - Bebas no trae U+2009, así que una cifra en Bebas agrupa con U+00A0 (160 unidades, el ancho justo para una condensada).

  (Se deduce. Asumo que Reset acepta que el resto de títulos vaya en Montserrat 600 o 700.)
- En la web pública, Druk Condensed cumple el mismo papel que Bebas. Bebas es la versión libre y autoalojable de esa decisión (se deduce).

---

## 6 · ¿Claro u oscuro? (tarea 5)

**Evidencia de proyección: débil.**
- El repo dice que la SPA es «para presentaciones a clientes» (confirmé en `Adaptación para Nuevos Clientes`, línea 9). No dice si se proyecta, se muestra en un televisor o se comparte en una videollamada.
- No encontré ningún estudio controlado que compare fondo claro contra oscuro bajo luz ambiente. Lo que hay son guías de práctica, divididas: Duarte recomienda fondo oscuro en salas oscuras y Tufte es escéptico. El único estudio revisado por pares, en *Heliyon* (2024), mide la iluminancia, no la polaridad (confirmé por búsqueda; no leí el paper completo).

**Lo que sí se puede calcular.** Un proyector no puede dar negro: su negro es la luz de la sala reflejada en la pantalla. Lo modelé sumando a ambas luminancias una fracción *a* del blanco proyectado (`paleta.mjs`, sección «lavado»; el modelo es mío y la fracción *a* real de una sala es supuesto):

| a (luz ambiente) | texto-1 claro / oscuro | texto-3 claro / oscuro | empeora claro / oscuro |
|---|---|---|---|
| 0,05 | 10,2 / 9,7 | 4,6 / 4,5 | 4,6 / 4,7 |
| 0,10 | 7,2 / 6,9 | **4,0 / 3,4** | 4,0 / 3,5 |
| 0,20 | 4,8 / 4,6 | 3,2 / 2,4 | 3,2 / 2,5 |

El gris actual `#9CA3AF` sobre la card `#1A1432` baja a 4,2, 3,2 y 2,4.

**Lectura (se deduce):** con el par principal, la polaridad casi no cambia nada. La diferencia aparece en los tonos medios. El texto-3 oscuro tiene 6,9 a 8,0:1 nominal, más que el claro, y aun así queda por debajo con luz. En oscuro el contraste depende de un denominador cercano a cero, y la luz de la sala se lo come. En una sala iluminada, el tema claro aguanta mejor los grises y los estados.

**Recomendación: ambos temas sobre los mismos tokens, con el oscuro por defecto y un «modo sala» claro a un clic.**
- El oscuro va por defecto porque es la demo actual, es el registro de reset.com.pe (fondo `#000`) y es lo que describe la guía. Además el vidrio solo se gana su lugar en oscuro, sobre gráficos.
- El claro existe porque, si la sala está iluminada, es el que no se lava.
- **Si Reset confirma que la mayoría de demos se proyectan en salas con luz, conviene invertir el valor por defecto.** Es la pregunta que más cambia esta decisión.
- En proyección, texto-3 no debe cargar información que haga falta para decidir; solo metadatos (se deduce de la tabla).

**Vidrio, con las cinco condiciones de la guía** (opacidad calculada en `identidad/scripts/vidrio.mjs`):
- Se mide contra el peor punto de lo que hay detrás. En oscuro, el panel `#1c1a23` sobre un blanco `#f6f5f9` necesita **α ≥ 0,61** para texto-1, **≥ 0,75** para texto-2 y **≥ 0,86** para texto-3. En claro, el panel blanco sobre `#100e16` necesita ≥ 0,45, ≥ 0,72 y ≥ 0,89 (confirmé ejecutando).
- **Regla:** el vidrio lleva α ≥ 0,75 y solo texto-1 o texto-2. El texto-3 nunca va sobre vidrio, porque necesitaría un panel prácticamente opaco y ahí el vidrio ya no aporta nada.
- **Dónde va:** en oscuro, solo en lo que flota sobre algo que valga la pena ver. Es decir, el tooltip y el popover de filtros sobre un gráfico, y la barra superior cuando el contenido pasa por debajo al hacer scroll. Nunca en las cards de capa, que no flotan. En claro el vidrio casi no se percibe: el panel es opaco con borde, y solo la barra superior lleva desenfoque (se deduce).
- **Se retira el resto del racimo:** `gradient-fitzone*`, `fitzone-glow`, `pulse-glow` y el fondo violeta saturado. La marca aparece como acento puntual, con uno por módulo (von Restorff en la guía de psicología).

---

## 7 · La mejor objeción

**«El violeta `#6F42C1` está dentro del rango que las guías marcan como señal de sitio hecho por IA, y la web de Reset ni siquiera lo usa. ¿Por qué no construir sobre el negro y verde neón de reset.com.pe?»**

Respuesta: la guía de The Lab manda y nombra el violeta como marca (§1 de técnicas). La guía dice que la señal no es el color sino el racimo. Esta propuesta quita el resto del racimo:
- grises casi neutros, con C ≤ 0,018 contra 0,034 y 0,057 de hoy;
- sin degradados ni resplandor;
- tipografía de marca cargada de verdad;
- violeta solo como acento.

Igual la objeción tiene fuerza comercial: una demo de la agencia que no se parece a la web de la agencia rompe la prueba del recorte. Por eso queda como la decisión abierta n.º 1 para Reset (§1). Cambiar de opinión cuesta poco, porque los semánticos solo apuntan a primitivos: es cambiar H en `paleta.mjs` y volver a correr.

**Segunda objeción: «la oliva es fea para un dashboard comercial».** Es una cuestión de gusto que no voy a defender con números. Pero es la que da el mejor orden medido. La alternativa válida más cercana (`violeta, cian, naranja, azul, rosa`) baja el CVD adyacente en claro a 6,6, en la banda que exige codificación secundaria (confirmé). Si se prefiere, se toma esa y se rotula siempre en directo.

## 8 · Cuándo esto estaría equivocado

- **Si Reset dice que su marca de producto ya no es el violeta**, porque la web pública indica un giro a negro y neón: hay que rehacer los primitivos, aunque el método se mantiene. Señal temprana: la primera reacción del equipo de Reset al ver la propuesta junto a reset.com.pe.
- **Si las demos se proyectan casi siempre en salas iluminadas**, el oscuro por defecto está mal elegido. Señal temprana: en la primera prueba con el proyector real, desde la última fila, el texto-3 y el violeta de la serie 1 sobre oscuro no se leen.
- **Si se usan las cinco series a la vez junto a deltas de estado**, la oliva y el naranja quedan a 11,7 y 12,7 de atención y empeora. Señal temprana: alguien pregunta si una línea naranja «está en rojo».

## 9 · Archivos

- `scratchpad/identidad/scripts/paleta.mjs`: derivación, contrastes, lavado y búsqueda de órdenes (`--buscar`)
- `scratchpad/identidad/scripts/datos.mjs`, `estado-vs-series.mjs` y `vidrio.mjs`: paleta de datos, distancia serie↔estado y opacidad del vidrio
- `scratchpad/identidad/scripts/fuentes.js`: verificación de las fuentes en el archivo
- `scratchpad/identidad/tokens.json`, `paleta-salida.txt`, `validacion-despues.txt`, `validacion-antes-graficos.txt`, `vidrio-salida.txt`
- `scratchpad/identidad/web/`: HTML, CSS y logo de reset.com.pe tal como se descargaron el 14/10/2026
- `scratchpad/identidad/fonts-src/` y `deps/node_modules/@fontsource*`: las fuentes medidas

Fuentes web: [reset.com.pe](https://reset.com.pe/) · [Mercado Negro, Reset](https://www.mercadonegro.pe/mercado-negro-tv/reset-somos-una-agencia-de-medios-que-rompe-con-lo-tradicional) · [America Retail, Effie 2025](https://americaretail-malls.com/paises/peru/reset-brilla-en-los-effie-awards-peru-2025-la-agencia-independiente-mas-premiada-por-tercer-ano-consecutivo/) · [Tufte, fondo para proyección](https://www.edwardtufte.com/?p=515) · [PolicyViz, light vs dark](https://policyviz.com/2014/04/03/light-vs-dark-backgrounds/) · [Heliyon 2024, legibilidad proyectada](https://doaj.org/article/17412f16ae83406aad4c1c5781ddc53b)
