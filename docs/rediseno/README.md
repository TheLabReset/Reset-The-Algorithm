# Rediseño de The Algorithm

> **Registro histórico.** Esta carpeta guarda cómo se llegó al diseño actual: la auditoría, la investigación, el plan y la galería de octubre de 2026. Algunas decisiones cambiaron después (de tres capas se pasó a cuatro, por ejemplo). Lo vigente está en [`docs/guia-algoritmo.md`](../guia-algoritmo.md), [`docs/quincha.md`](../quincha.md) y [`docs/nuevo-algoritmo.md`](../nuevo-algoritmo.md).

| Fase | Entregable | Estado |
|---|---|---|
| 0 y 1 · Reconocimiento y auditoría | `auditoria/AUDITORIA.md`, `auditoria/CATALOGO-DE-BLOQUES.md`, `auditoria/capturas/` | Cerrada |
| 2 · Investigación | `investigacion/` (seis informes con fuentes) | Cerrada |
| 3 · Plan | `PLAN.md` y `galeria/index.html` | Esperando aprobación |
| 4 · Construcción | | No empieza sin aprobación |

La galería se abre con doble clic (no necesita servidor). Para rearmarla después de tocar `galeria/app.js`, `galeria/formas.js` o `galeria/muestra/`: `node docs/rediseno/galeria/armar.mjs`.

Toda la data es de muestra: sale de `galeria/muestra/generador.js` con semilla fija. Ninguna cifra de un cliente real entra a esta carpeta.
