# Producción: minutos de GitHub Actions

Cómo cobra GitHub los workflows, qué ya nos pasó en producción y cómo diseñar para gastar lo menos posible. Se lee **antes de pasar un algoritmo a producción con una marca** y cada vez que se agrega un workflow, un cron o un job.

Sale de lo que se midió en un algoritmo que ya está en producción. Acá van las lecciones y el método, sin nombres ni datos de ese proyecto. Las pocas mediciones que quedan (cuánto paga un job corto, una corrida de CI) dicen cómo se comportan los workflows, no el cliente. Las de cada cliente se miden en su propio repositorio (sección 7).

Etiquetas: **confirmé** es medido o leído en la fuente; **se deduce** es calculado de lo medido; **asumo** es lo que no se pudo comprobar.

## En corto

- **Ningún runner espera a un servicio externo.** Lo que tarda en Apify, en un CRM o en una API se lanza y se recoge en dos tiempos. Es la regla que más minutos ahorra.
- **Lo que no cambia todos los días no corre todos los días.** Antes de un cron diario, ver si lunes, miércoles y viernes alcanza.
- **La CI de cada push es lo que más pesa en los días de desarrollo.** Un push por cambio terminado, no uno por paso intermedio.
- **La cuota es de la cuenta, no del repo.** Ninguna regla de un repositorio protege a la cuenta entera: eso lo pone el dueño en la facturación (sección 6).

## 1. Cómo cobra GitHub

Leído en la documentación de GitHub el 15 de octubre de 2026 (confirmé). Son datos que cambian: antes de armar un presupuesto, revisar la página vigente ([facturación de Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).

| Plan del dueño del repo | Minutos incluidos al mes (repos privados) |
|---|---:|
| GitHub Free (cuenta personal) | 2.000 |
| GitHub Pro (cuenta personal) | 3.000 |
| GitHub Free para organizaciones | 2.000 |
| GitHub Team | 3.000 |
| GitHub Enterprise Cloud | 50.000 |

- **Un fondo por cuenta.** Los minutos incluidos se comparten entre todos los repos privados del dueño (la cuenta personal o la organización) y vuelven a cero al empezar cada mes. Se le cobran al dueño del repo, no a quien disparó la corrida.
- **Sin método de pago, al agotarse la cuota se bloquea todo.** GitHub no arranca ningún job de ningún repo privado de esa cuenta hasta el mes siguiente. Con método de pago, el excedente se cobra y un presupuesto puede ponerle tope. GitHub avisa por correo al 90 % y al 100 % de lo incluido.
- **Cada job se redondea hacia arriba al minuto.** Un job de 35 segundos paga 1. Un workflow de dos jobs cortos paga 2 aunque tarde 40 segundos en total. En el proyecto medido, lo facturado fue 1,09 veces el reloj en promedio y hasta 1,8 veces en los workflows más cortos.
- **Un job cancelado paga lo que alcanzó a correr.** `cancel-in-progress` evita terminar una corrida vieja, pero no devuelve lo que ya gastó.
- **Precio por minuto, runner estándar de 2 núcleos:** Linux $0,006, Windows $0,010 (unas 1,7 veces Linux) y macOS $0,062 (unas 10 veces). Todo se corre en `ubuntu-latest`.
- **Un repo público no paga minutos** en runners estándar. Pero todo lo que tiene se ve, y un algoritmo con data de un cliente va en un repo privado. El ahorro no justifica abrirlo.
- **El repo no muestra lo facturado.** El endpoint `/timing` de la API devuelve 0, y el consumo de la cuenta solo lo ve el dueño en Settings, Billing. Por eso se estima desde los jobs (sección 7).

## 2. Lo que ya nos pasó

En orden de cuánto costó. Cada lección quedó como regla en la sección 5.

1. **Un workflow esperaba a Apify con el runner prendido.** Lanzaba las mediciones de Google Trends una tras otra y esperaba cada una: una hora por corrida, dos veces por semana. Era el workflow que más gastaba. Se partió en dos: uno lanza las mediciones, guarda la ficha y termina en un minuto; otro pasa varias veces, de un minuto cada vez, y recoge lo que ya está listo. El gasto de esa parte bajó a menos de una sexta parte.
2. **Se acabó la cuota de la cuenta y el panel quedó días sin data.** GitHub dejó de arrancar jobs con el mensaje «The job was not started because recent account payments have failed or your spending limit needs to be increased». Nada avisó antes: se notó porque la data dejó de moverse. Al medir, el repo del algoritmo no alcanzaba la cuota solo; el resto lo gastaban otros repos privados de la misma cuenta.
3. **La CI programada corría todos los días.** Hace falta, porque los commits de data del bot no disparan la CI (GitHub no crea corridas desde un push hecho con `GITHUB_TOKEN`) y un chequeo de data se puede poner rojo sin que nadie toque código. Pasó a lunes, miércoles y viernes: un rojo que depende de la data se ve igual dos días después, y la publicación diaria tiene su propio control antes de publicar.
4. **La CI de cada push se concentra en los días de desarrollo.** Una corrida completa paga unos 8 minutos. En tres días de trabajo intenso se fue casi todo el gasto de dos semanas de CI.
5. **Dependencias que nadie usaba.** Cada `npm ci` paga bajar cada paquete. No se midió cuánto bajó al sacarlas: queda como regla, no como cifra.
6. **El rebuild completo del CRM se fue alargando.** Relee dos años de registros cada semana, así que crece con el CRM: es la corrida más cara. Bajar su frecuencia es una decisión de negocio, no de minutos.
7. **GitHub crea tarde, o no crea, algunas corridas programadas.** No cuesta minutos, pero obliga a diseñar distinto. La documentación lo dice: con mucha carga, el cron se atrasa y algunas corridas se pierden. Por eso cada pieza tolera el retraso, y el recolector pasa varias veces: no es para gastar más, es para que alguna llegue.

## 3. Diseño que gasta poco

1. **Lanzar y recoger, nunca esperar.** El trabajo largo lo hace el servicio externo, que se paga aparte. El runner solo arranca y recoge.
2. **La frecuencia sigue a la data.** Lo que cambia por semana no corre por día.
3. **La CI corre solo lo que el cambio puede romper.** Un primer job barato («qué cambió») decide: con código, build y todos los chequeos; con solo documentos, la revisión de documentos, sin instalar nada.
4. **Un paso dentro de un workflow que ya corre sale más barato que un workflow nuevo.** Cada job paga su checkout, su instalación y su minuto mínimo.
5. **Todo job tiene `timeout-minutes`.** Sin tope, un runner colgado se queda las seis horas que GitHub da por omisión: un solo cuelgue puede costar más que un mes entero de un workflow chico.
6. **Grupos de concurrencia** para que dos workflows que escriben lo mismo no choquen y haya que volver a correr uno.

## 4. El presupuesto, antes de producción

Cada workflow se estima así, y la tabla se guarda en el repo del cliente:

> minutos al mes = corridas en 30 días × jobs por corrida × minutos por job, cada job redondeado hacia arriba

| Workflow | Corridas en 30 días | Minutos por corrida | Minutos en 30 días | Supuesto |
|---|---:|---:|---:|---|
| … | | | | |
| **Total programado** | | | | |
| CI de push y PR | depende del desarrollo | | aparte | |

**Ejemplo para ver el orden de magnitud** (cifras inventadas, no de un proyecto): un job que espera 55 minutos a un servicio, dos veces por semana, son unos 470 minutos al mes. El mismo trabajo en dos tiempos, con un job de 1 minuto para lanzar y siete de 1 minuto para recoger, son unos 70. Con una cuota de 2.000 compartida con otros repos, la primera versión sola se come casi un cuarto.

## 5. Reglas

Para cualquier cambio de código, de workflow o de horario:

1. **Medir antes de agregar.** Un workflow, un cron o un job nuevo se estima en minutos al mes y se anota en la tabla de la sección 4.
2. **Nunca esperar con el runner prendido.** Si algo tarda en otro servicio, se lanza y se recoge en dos tiempos.
3. **Un push por cambio terminado.** La CI corre en cada push a un PR abierto y en cada push a `main`, así que el merge la vuelve a correr. Un push a una rama sin PR abierto no la dispara: se puede subir el trabajo en curso para no perderlo y abrir el PR al final. Antes de abrirlo, correr los chequeos en local (en este repo, `npm run prueba` y `npm run sistema`). Un push para «ver si la CI pasa» cuesta lo mismo que uno bueno.
4. **Ningún rebuild completo a mano sin necesidad.** Si faltan unos días, se usa una recuperación por rango.
5. **Nada corre todos los días si no hace falta.**
6. **Todo job nuevo lleva `timeout-minutes`**, ajustado a lo que dura de verdad más un margen.
7. **Ninguna dependencia sin uso** en ningún `package.json`.
8. **Un chequeo nuevo en la CI se mide.** Suma a cada corrida, programada o de push.
9. **Sin runners de Windows ni de macOS**, salvo que algo solo corra ahí.
10. **Sin `[skip ci]` en commits de código** para ahorrar: la CI es la alarma.

## 6. Lo que protege la cuenta (lo decide el dueño)

Ninguna regla del repositorio protege a la cuenta entera. Antes de producción, el dueño de la cuenta:

- **Pone un método de pago y un presupuesto de Actions con avisos al 75, 90 y 100 %.** Hay que decidir qué pasa al llegar al tope. Con «Stop usage when budget limit is reached», GitHub frena todo, como cuando se acabó la cuota. Sin esa opción, sigue corriendo y se cobra el excedente.
- **Revisa el consumo de los otros repos privados de la cuenta** (Settings, Billing, Usage). Si la cuenta se acerca a su cuota, la causa puede estar en otro repo.
- **Elige dónde vive el repo.** En una organización, los minutos son de la organización y no se mezclan con los repos personales de nadie.

## 7. Cómo medir

Lo facturado no sale de la API del repo. Se estima desde los jobs:

1. Listar las corridas del período: `GET /repos/<dueño>/<repo>/actions/runs?created=>=AAAA-MM-DD&per_page=100`, paginando con `page`.
2. Para cada corrida, sus jobs: `GET /repos/<dueño>/<repo>/actions/runs/<id>/jobs?filter=all`.
3. Facturado de cada job: `ceil((completed_at − started_at) / 60 s)`. Un job `skipped` cuenta 0. Se suma por workflow.
4. Lo facturado de verdad, y lo de los otros repos, lo ve el dueño de la cuenta en Settings, Billing.

Se mide de nuevo cuando cambia un workflow, un cron o el tamaño del CRM, y al menos una vez al mes. Las cifras van con su fecha.

## 8. Señales tempranas

- **La corrida más cara** (en general, el rebuild del CRM) dura más que su promedio del último mes: crece con el CRM.
- **La CI programada** dura más que de costumbre: un chequeo nuevo o una dependencia nueva.
- **Un job de recolección** dura más de 2 minutos: puede estar esperando en vez de recoger. Si se colgara hasta su tope en cada vuelta, el gasto se multiplica por ese tope.
- **El aviso del 75 % del presupuesto**, cuando exista.

## 9. Antes de pasar a producción

- [ ] El repo es privado y vive en la cuenta o la organización que va a pagar.
- [ ] La tabla de la sección 4 está llena, con su total y su fecha.
- [ ] Ningún job espera a un servicio externo.
- [ ] Todo job tiene `timeout-minutes` y todo cron tiene una frecuencia justificada.
- [ ] La CI decide qué correr según lo que cambió.
- [ ] El dueño de la cuenta configuró el método de pago, el presupuesto y los avisos.
- [ ] Hay un día al mes para medir de nuevo.
