# Planificador de estudio

Trabajo de Fin de Máster de **Alejandro Santos Vicente** para el Máster en Desarrollo con IA, edición E.3 (FD).

## Descripción

Aplicación web que distribuye los temas de un curso entre los huecos de estudio disponibles hasta una fecha de examen. El estudiante introduce sus lecciones, el número de temas, las prioridades y sus horarios. La aplicación calcula qué temas caben, los sitúa en un calendario y muestra la cobertura prevista.

El objetivo es responder a una pregunta concreta: **qué puedo preparar con el tiempo que tengo y cómo cambia el plan si pierdo una sesión**.

## Tecnologías

- **HTML:** estructura de la pantalla y formularios.
- **CSS:** diseño adaptable y presentación del calendario.
- **JavaScript:** cálculo del plan, interacción y representación de resultados.
- **localStorage:** conservación de los datos en el mismo navegador.
- **SVG y CSS:** curva de avance previsto y anillo de cobertura.

La IA se utilizó como apoyo durante el desarrollo y la documentación. El reparto de temas lo calcula JavaScript con reglas deterministas; la aplicación no realiza llamadas a un modelo de IA.

## Instalación y ejecución

1. Descarga el repositorio mediante **Code → Download ZIP** y descomprime el archivo, o clónalo si utilizas Git.
2. Abre `index.html` con **Google Chrome**.
3. Mantén la carpeta `src/` junto a `index.html`.

La aplicación se abre directamente: no requiere instalar dependencias, iniciar un servidor ni crear una cuenta. No hay credenciales de acceso.

Las ediciones se guardan en ese navegador cuando permite almacenamiento local. No se sincronizan entre dispositivos. En una ventana de incógnito se conservarán durante esa sesión.

## Funcionalidades principales

- Añadir, editar y quitar lecciones, con número de temas y prioridad.
- Definir el examen, los minutos estimados por tema y los huecos de estudio.
- Asignar temas en orden de prioridad y, en caso de empate, por orden del temario.
- Consultar el calendario en vistas mensual y semanal.
- Abrir la semana de un día seleccionado y ajustar el zoom del horario.
- Recalcular al cambiar una lección, una franja o la fecha del examen.
- Ver la cobertura total, el porcentaje de cada lección y la curva de avance previsto.
- Recuperar los datos al volver a abrir la aplicación en el mismo navegador.

Los porcentajes representan **temas programados**, no aprendizaje o estudio ya realizado.

## Cómo se calcula el plan

1. Se consideran las sesiones comprendidas entre el día actual y el examen, ambos incluidos.
2. Se ordenan por fecha y hora. Los intervalos que se solapan se unen para contar sus minutos una sola vez.
3. Cada tema necesita un bloque continuo de la duración estimada. Por ejemplo, con 20 minutos por tema, en una sesión de 50 minutos caben dos temas.
4. Se asignan primero las lecciones de prioridad alta. Una lección puede continuar en otra sesión; un tema no se divide entre huecos.
5. La cobertura compara los temas con hueco asignado con el total del temario.

Es una regla sencilla y explicable; no busca todas las combinaciones posibles para obtener una solución matemática óptima.

## Ejemplo de uso

En una apertura nueva se cargan **10 lecciones ficticias, 18 temas y tres sesiones de 60, 60 y 40 minutos**. Las fechas se calculan a partir del día de apertura y el ritmo inicial es de 20 minutos por tema.

1. Pulsa **Calcular mi plan**.
2. La primera sesión contiene los temas 1, 2 y 3 de Fundamentos.
3. La segunda contiene el tema 4 de Fundamentos y los temas 1 y 2 de Práctica guiada.
4. La tercera contiene Repaso y el primer tema de Terminal.
5. Se programan ocho temas: **8 de 18, un 44,4 %**.
6. Quita la tercera sesión. El plan pasa a seis temas: **6 de 18, un 33,3 %**.

Para repetir el ejemplo sin modificar tus datos guardados, abre `index.html` en una ventana de incógnito.

## Estructura del proyecto

```text
planificador-estudio/
├── README.md
├── index.html
├── src/
│   ├── app.js
│   ├── calendar.js
│   ├── forecast.js
│   ├── plan.js
│   └── style.css
└── docs/
    └── Presentacion_TFM.pptx
```

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Formularios y zonas de edición, calendario y previsión. |
| `src/plan.js` | Datos de demostración, selección de sesiones y asignación de temas. |
| `src/app.js` | Edición de datos, validación, recálculo y almacenamiento local. |
| `src/calendar.js` | Vistas mensual y semanal, selección de día y zoom. |
| `src/forecast.js` | Cobertura por lección y avance acumulado previsto. |
| `src/style.css` | Diseño adaptable y estilos de la interfaz. |

## Límites de esta versión

- Se utiliza una duración común para todos los temas.
- El plan depende del reloj local del dispositivo y de las estimaciones introducidas.
- La cobertura prevista no registra qué temas se han estudiado realmente.
- Los datos quedan en el navegador; no hay sincronización ni copia en un servidor.
- Las franjas que cruzan la medianoche deben dividirse en dos días.

## Enlaces de entrega

| Recurso | Estado |
| --- | --- |
| Código en GitHub | [Repositorio del proyecto](https://github.com/Asanvic/tfm-planificador-estudio) |
| Presentación | En preparación; se incluirá en `docs/Presentacion_TFM.pptx`. |
| Vídeo con explicación del autor | Pendiente de grabación. Su enlace público se añadirá antes de la entrega. |

La aplicación se entrega para ejecución local. El formulario del centro permite dejar el enlace de despliegue vacío cuando no existe.
