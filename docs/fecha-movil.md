# Fecha móvil de la maqueta

La maqueta corta su data de muestra **ayer, en hora de Lima**, y su historia se mueve con ese corte. Así el panel se ve al día, como uno real: el sello dice «Datos al 25 de octubre», las fuentes dicen «al 25 oct» y el selector de mes termina en el último mes cerrado.

Es solo para la demo con data de muestra. **Una implementación real no la usa:** ahí el corte es el último día que entregó cada fuente.

## Cómo se apaga

En `src/muestra/configuracion.js`, `BASE.fechaMovil.activa: false`. La muestra queda fija en `BASE.corte` (la fecha de referencia, hoy el 30 de setiembre de 2026), con las mismas fechas con que se escribió la configuración. No hace falta tocar nada más.

## Cómo funciona

No hay servidor ni proceso diario. La app se calcula entera en el navegador: al abrirse, toma la fecha de hoy en Lima, le resta un día y genera la muestra hasta ahí. **No gasta minutos de GitHub Actions** ni depende de un cron (ver [produccion-actions.md](produccion-actions.md)).

| Pieza | Dónde | Qué hace |
|---|---|---|
| `hoyEnLima()` | `src/muestra/fechaMovil.js` | La fecha de hoy en Lima (`America/Lima`). Sin `Intl`, UTC menos 5 horas. |
| `muestraAl(BASE, corte)` | `src/muestra/fechaMovil.js` | Devuelve la configuración para ese corte: el rango, el calendario y la historia corridos. |
| `CONFIG` | `src/muestra/configuracion.js`, al final | `muestraAl(BASE, ayer)` si la fecha móvil está activa; si no, `BASE`. Es lo único que lee la app. |
| El sello | `src/App.jsx` | «Datos al {corte}», sin año. |

### Las tres clases de fecha

Cada fecha de `configuracion.js` es de una de estas clases. **Al agregar una fecha nueva hay que decidir cuál es** y, si es historia o calendario, sumarla en `muestraAl()`; una fecha que no se suma queda fija y se va quedando atrás.

1. **Rango.** `desde` es el 1 de enero del año anterior al corte (siempre hay un año entero para comparar) y `corte` es ayer.
2. **Calendario: lo que pasa en una fecha del año.** Se repite cada año del rango:
   - feriados: los de fecha fija (`fechaMovil.feriadosFijos`) más el Jueves y el Viernes Santo, calculados desde la Pascua;
   - el Reto de enero (`fechaMovil.campanaEnero`): la campaña de Meta `m-reto`, las campañas `reto-AAAA` del CRM, el evento del primer lunes desde el 5 de enero y el alza de búsquedas y menciones de la marca (`campanaPropia`, seis semanas desde ese lunes);
   - la estacionalidad, el peso del presupuesto y la presión de subasta, que ya van por mes.
3. **Historia: lo que la demo cuenta cerca del corte.** Se corre en **meses enteros**: lo que en la referencia pasa en su último mes cerrado (setiembre de 2026) pasa siempre en el último mes cerrado del corte, que es el mes que el panel abre. Un día que era fin de mes sigue siendo fin de mes. Son:
   - `web.paginas[].desde` (la promo, que además toma el nombre del mes en que empieza: «Promo de octubre», `/promo-octubre`);
   - `sedes[].abre` (Los Olivos);
   - `busquedas[].aparece` (pilates reformer);
   - `palabrasClave[].desde`;
   - las `campanas[].activa` que no son el Reto;
   - `programatica.desde` y `hasta`;
   - `crm.contactoLento.desde`;
   - las campañas del CRM que no son el Reto;
   - `fatigaMeta`;
   - `cambiosCosto` y `cambiosInteraccion`;
   - los `eventos` que no son de campaña (la caída de Meta, las piezas nuevas).

### Lo que no cambia de un día al otro

Lo que el panel ya mostró se mantiene al pasar un día dentro del mismo mes: la data de hace más de un mes es idéntica. Para eso:

- la tendencia (`t` en `generador.js`) corre sobre un tramo fijo (`tramoTendencia`), no sobre el rango;
- el azar del embudo (`generador.js`) y del CRM por dentro (`detalle.js`) va por día, origen y sede;
- el de las búsquedas y la conversación va por término y por marca.

Lo reciente sí cambia, como en un CRM real: las altas y los descartes llegan con días de atraso.

Al empezar un mes, la historia salta al nuevo mes cerrado. Al empezar un año, el rango empieza un año después. En esos dos momentos cambian las cifras de todo el panel. Es esperado.

## Qué no tocar

- **El orden de los flujos de azar.** Cada flujo (`semillaDe(semilla, 'algo', …)`) tiene que ser por entidad o por día. Si uno se comparte entre entidades, agregar un día corre el azar de las que vienen después y el pasado cambia. La prueba «lo que ya se mostró no cambia al pasar un día» lo detecta.
- **El escenario de la demo.** TikTok se encarece desde la segunda quincena del mes anterior (así la cohorte del CRM ya lo ve), sus leads se inscriben menos (`calidad.alta`) y el presupuesto alcanza para que tenga más de 30 inscripciones en cualquier mes. Si se cambia el presupuesto, el reparto, la calidad o `cambiosCosto`, hay que correr las pruebas: la del barrido revisa que la propuesta de reparto aparezca con casos suficientes en 54 cortes de dos años.
- **`src/calculo/` y las pantallas.** No saben que la fecha se mueve. Leen `data.config.corte` como siempre.

## Pruebas

`pruebas/fecha-movil.test.mjs` fija el «hoy» para ser reproducible y revisa:

1. que en la fecha de referencia todo queda como se escribió;
2. que hoy es la fecha de Lima;
3. que el calendario cae donde debe (Semana Santa, el primer lunes de enero, la promo con su mes, los fines de mes);
4. que nada pasa del corte y que el rango empieza el 1 de enero del año anterior;
5. que lo ya mostrado no cambia al pasar un día;
6. que la historia (la propuesta de reparto y la lectura de las piezas nuevas de Meta) aparece en el mes que el panel abre. Lo hace para el 15 y el último día de cada mes, de octubre de 2026 a diciembre de 2028.

`pruebas/calculo.test.mjs` usa la fecha de referencia, así sus resultados no cambian con el día en que se corren.

## Para otro algoritmo

- **Otra maqueta con fecha móvil:**
  1. Se reescribe `BASE` con la historia de la marca nueva para una fecha de referencia.
  2. Se suman a `muestraAl()` las fechas que se agreguen, cada una con su clase.
  3. Se ajusta el escenario hasta que pase el barrido.
- **Un algoritmo con data real:** se apaga (`fechaMovil.activa: false`) o se quita `fechaMovil.js`. El corte lo dan las fuentes (ver «De la muestra a la data real» en [nuevo-algoritmo.md](nuevo-algoritmo.md)). Nunca se mezcla data real con fecha móvil: correría fechas de cosas que pasaron de verdad.
