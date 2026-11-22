'use strict';
function renderForecast(state, sessions, today){
  const total = state.lessons.reduce((sum, lesson) => sum + lesson.topics, 0);
  const panel = document.getElementById('forecast');
  let message = '';
  if(!total) message = 'Añade una lección para ver la previsión.';
  else if(state.deadline < today) message = 'Elige una fecha de examen de hoy en adelante.';
  for(const note of panel.querySelectorAll('.forecast-message')) note.textContent = message;
  panel.classList.toggle('awaiting-plan', Boolean(message));
  if(message) return;

  const byLesson = new Map();
  const daily = new Map();
  for(const session of sessions){
    let assigned = 0;
    for(const item of session.items){
      assigned += item.count;
      const id=item.lesson.id;
      byLesson.set(id,(byLesson.get(id) || 0)+item.count);
    }
    if(assigned) daily.set(session.day, (daily.get(session.day) || 0) + assigned);
  }

  // Las fechas ISO en UTC permiten medir días de calendario incluso si cambia la hora local.
  const start = Date.parse(today);
  const span = Date.parse(state.deadline) - start;
  const y = count => 100 - 100 * count / total;
  let covered = 0;
  let path = 'M0 '+y(covered);
  for(const [day, count] of daily){
    const x = span ? 100 * (Date.parse(day) - start) / span : 100;
    covered += count;
    path += ' H'+x+' V'+y(covered);
  }
  path += ' H100';
  const percent = 100 * covered / total;
  const formatPercent = new Intl.NumberFormat('es-ES',{style:'percent',maximumFractionDigits:1});
  const formatted = formatPercent.format(covered/total);
  const shortDate = day => new Date(day+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});
  document.getElementById('trendLine').setAttribute('d',path);
  document.getElementById('trendArea').setAttribute('d',path+' V100 H0 Z');
  document.getElementById('trendDescription').textContent =
    'Previsión acumulada hasta '+covered+' de '+total+' temas programados al examen ('+formatted+').';
  document.getElementById('fromDate').textContent = span ? 'Hoy · '+shortDate(today) : 'Inicio de hoy';
  document.getElementById('toDate').textContent = span ? 'Examen · '+shortDate(state.deadline) : 'Fin de hoy · examen';
  document.getElementById('coverageRing').style.setProperty('--coverage',percent+'%');
  document.getElementById('percent').textContent = formatted;
  document.getElementById('coveredCount').textContent = covered+' de '+total+' temas programados';
  const rows=state.lessons.map(lesson=>{
    const row=document.createElement('li');
    const title=document.createElement('span');
    const value=document.createElement('strong');
    title.textContent=lesson.title;
    value.textContent=formatPercent.format((byLesson.get(lesson.id) || 0)/lesson.topics);
    row.append(title,value);
    return row;
  });
  document.getElementById('lessonCoverage').replaceChildren(...rows);
}
