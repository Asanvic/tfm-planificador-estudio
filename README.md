# Planificador de estudio · Demo
Abre **index.html** en Chrome. Los archivos de la carpeta src deben permanecer junto al HTML. La demo funciona sin instalación, conexión ni cuenta. Los cambios se conservan en ese navegador si permite almacenamiento local.

## Prueba de cinco minutos
1. Introduce nombre, número de temas y prioridad de cada lección.
2. Revisa las tardes disponibles, la hora de inicio, la fecha del examen y la estimación común (20 minutos por tema de inicio).
3. En **Mes** pulsa un día para abrir su **Semana** y ver las franjas por hora. Ambas vistas incluyen los días sin estudio hasta el examen. Pulsa **Calcular mi plan** para rellenarlas. Con el ejemplo inicial en la primera tarde caben los tres primeros temas de Fundamentos. El cuarto continúa en la segunda tarde.
4. En el panel de previsión, compara el avance previsto por fecha y la cobertura al examen. Elimina una tarde y recalcula para ver cómo cambian ambos.
5. Bajo el anillo, revisa qué porcentaje de cada lección tiene un hueco de estudio.

## Cómo decide
Cada tema ocupa un bloque de la duración estimada. En cada sesión se eligen los temas pendientes por prioridad y después por orden del temario. Una lección puede repartirse entre tardes; cada tema necesita un hueco continuo.

## Archivos
- index.html y src/style.css: pantalla y diseño adaptable.
- src/plan.js: diez lecciones ficticias, tres sesiones y cálculo del calendario. Los datos se incluyen en JavaScript para abrir el archivo directamente.
- src/calendar.js: vistas de semana y mes del mismo plan.
- src/forecast.js: avance acumulado y cobertura a partir del calendario calculado.
- src/app.js: edición, calendario y almacenamiento local.

Primera demo local del TFM. La presentación, el vídeo, el repositorio público y el despliegue corresponden a la fase de entrega.
