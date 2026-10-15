# Fit Lab

Marca ficticia del cliente demo de The Algorithm: una cadena de 12 gimnasios en Lima. No representa a ninguna empresa real.

- `guia.html`: la guía de marca completa, versión 4 del 15 de octubre de 2026 (se abre sin servidor). La parte 11 dice cómo entra la marca en The Algorithm.
- `svg/`: el logo en todas sus versiones, con el logotipo convertido a trazos, y `svg/poses/` con las 12 poses en positivo y negativo.
- `investigacion/`: los tres informes en que se basa la guía (motivos y barreras para entrenar, lenguaje y normas en el Perú, color y forma). Cada afirmación lleva su etiqueta: confirmé, se deduce o asumo.
- `fuente/`: los scripts que dibujan el logo y arman la guía. Necesitan `fontkit` y `@fontsource/bricolage-grotesque` instalados junto a los scripts (no son dependencias de la app):
  `node logo.mjs salida && node armar-guia.mjs salida ../guia.html && node verificar-poses.mjs salida` (la última comprueba que ningún objeto de una pose toque la pesa).
  `armar-guia.mjs` lee los colores del panel de `src/sistema/tokens.css` y no arma la guía si uno baja de su contraste mínimo o si la paleta del panel se aparta de la marca. Si se corre desde una copia fuera del repo, la ruta va en `TOKENS=<ruta a tokens.css>`.

**El símbolo** es una pesa rusa que celebra. La versión 1 era una persona con un aro de torso y se leía como un cuerpo grande; una pesa se espera redonda, así que ser redonda es ser pesa. El asa entera la hace reconocible, los brazos finos y la cara mínima la vuelven personaje. El logo no cambia; el humor vive en las poses.

**Color:** rojo #F5332A (energía), menta #3EE6B0 (el guiño, en la mitad fría del círculo que ningún gimnasio de Lima ocupa), tinta y cal. Los contrastes de la guía se miden al armarla, también con simulación de deuteranopía.

**Tipografía:** Bricolage Grotesque (títulos y logotipo) y Atkinson Hyperlegible Next (texto, horarios, sala). Ambas OFL.

**Dentro de The Algorithm** el logo va en negativo sobre la barra de tinta (`public/marca/logo-barra.svg`) y la versión mínima es el favicon (`public/marca/favicon.svg`). El rojo es identidad: el logo, la capa activa y el número de capítulo. Los datos van en menta, con gris para lo que no se resalta; naranja y azul aparecen solo en partes de un todo y no son colores de la marca. La pesa no tiene poses en el panel. El detalle está en la parte 11 de la guía.

La versión monocroma cala la cara con una máscara, así que funciona sobre fondo claro y oscuro.
