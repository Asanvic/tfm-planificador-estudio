'use strict';
const el = id=>document.getElementById(id);
const key='tfm-estudio-temas-v2';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opts=(choices,current)=>choices.map(([v,t])=>'<option value="'+v+'" '+(v===current?'selected':'')+'>'+esc(t)+'</option>').join('');
const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',month:'short',day:'numeric'});
const example=Plan.demo();
let state=example;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved && saved.sessions && Array.isArray(saved.lessons) && saved.deadline)state=saved;else {
  const old=JSON.parse(localStorage.getItem('tfm-estudio-demo-v1'));
  if(old && Array.isArray(old.lessons) && Array.isArray(old.sessions)){
    state={deadline:old.deadline,pace:20,sessions:old.sessions,lessons:old.lessons.map(l=>{
      const topics=Math.max(1,Math.round(l.min/20));
      return {id:l.id,title:l.title,priority:l.priority,topics};
    })};
    el('hint').textContent='Hemos estimado los temas de tus lecciones guardadas a partir de sus minutos. Revisa las cantidades antes de calcular.';
  }
}}catch{}
state.lessons=state.lessons.map(({id,title,priority,topics})=>({id,title,priority,topics}));
function save(){
  try{localStorage.setItem(key,JSON.stringify(state));el('storage').textContent='Cambios guardados en este navegador.';}
  catch{el('storage').textContent='El navegador solo conserva los cambios durante esta sesión.';}
}
// Los horarios anteriores solo guardaban el día y la duración.
const nextStart = new Map();
for(const session of state.sessions){
  if(!session.start){
    const start = Math.min(nextStart.get(session.day) ?? 18*60,1440-session.min);
    session.start = Plan.clock(start);
  }
  nextStart.set(session.day,Plan.toMinutes(session.start)+session.min);
}
const calendar = createCalendar(el,esc);
function outsideRange(){
  const today=Plan.dateKey();
  return state.sessions.filter(s=>s.day<today || s.day>state.deadline).length;
}
function preview(){
  const today = Plan.dateKey();
  const sessions = Plan.availableSessions(state,today);
  const outside = outsideRange();
  el('summary').textContent = 'Cada casilla completa equivale a '+state.pace+' min. Pulsa «Calcular mi plan» para asignar los temas.'+
    (outside ? ' Huecos fuera de plazo: '+outside+'.' : '');
  state.calculated=false;
  renderForecast(state,Plan.schedule(state,today).days,today);
  calendar.show(sessions,state);
}
function renderSessions(){
  const today=Plan.dateKey();
  el('add').disabled=state.deadline<today;
  el('sessions').innerHTML=state.sessions.map((session,index)=>{
    const warning=session.day>state.deadline ? 'Después del examen · excluido del plan.'
      : session.day<today ? 'Fecha pasada · excluido del plan.' : '';
    const number=index+1;
    return `<div class="slot" data-slot="${index}">
      <input aria-label="Fecha del hueco ${number}" data-field="day" type="date" required
        min="${today}" max="${esc(state.deadline)}" value="${esc(session.day)}"
        aria-describedby="slot-note-${index}" aria-invalid="${Boolean(warning)}">
      <input aria-label="Hora de inicio del hueco ${number}" data-field="start" type="time" required value="${esc(session.start)}">
      <input aria-label="Minutos del hueco ${number}" data-field="min" type="number" min="1" max="1440" required value="${session.min}">
      <button data-remove="${index}" aria-label="Quitar ${esc(dateLabel(session.day))}" title="Quitar">×</button>
      <small class="slot-note" id="slot-note-${index}" role="status">${warning}</small>
    </div>`;
  }).join('');
}
function render(){
  el('pace').value=state.pace;
  el('deadline').value=state.deadline;
  renderSessions();
  el('lessons').innerHTML=state.lessons.map(l=>{
    const label=esc(l.title);
    return '<tr data-id="'+l.id+'"><td><input aria-label="Nombre de lección '+l.id+'" data-field="title" type="text" maxlength="80" required value="'+label+'"></td><td><input data-field="topics" aria-label="Temas de '+label+'" type="number" min="1" max="999" required value="'+l.topics+'"></td><td><select aria-label="Prioridad de '+label+'" data-field="priority">'+opts([[1,'Alta'],[2,'Normal'],[3,'Baja']],l.priority)+'</select></td><td><button data-drop="'+l.id+'" aria-label="Quitar lección '+label+'" title="Quitar">×</button></td></tr>';
  }).join('');

}
function refreshPlan(){
  if(state.calculated && state.lessons.length) showCalculatedPlan();
  else preview();
}
function commit(){refreshPlan();save();render();}
function showCalculatedPlan(){
  const today=Plan.dateKey();
  const plan=Plan.schedule(state,today);
  const count=plan.days.reduce((n,d)=>n+d.items.reduce((sum,x)=>sum+x.count,0),0);
  const outside=outsideRange();
  el('summary').textContent=count+' temas planificados'+(outside?' · '+outside+' huecos fuera de plazo':'');
  state.calculated=true;
  calendar.show(plan.days,state);
  renderForecast(state,plan.days,today);
  el('hint').textContent='';
}
el('calculate').onclick=()=>{
  if(!state.lessons.length){el('hint').textContent='Añade al menos una lección para calcular.';return;}
  showCalculatedPlan();
  save();
  el('resultTitle').focus();
};
el('toggleEditor').onclick=()=>{
  const panel=el('editor');
  panel.hidden=!panel.hidden;
  el('workspace').classList.toggle('calendar-only',panel.hidden);
  el('toggleEditor').setAttribute('aria-expanded',String(!panel.hidden));
  el('toggleEditor').textContent=panel.hidden?'Mostrar temario':'Ocultar temario';
};
el('addLesson').onclick=()=>{
  const id=Math.max(0,...state.lessons.map(l=>l.id))+1;
  state.lessons.push({id,title:'Nueva lección',topics:1,priority:2});commit();
  const title=el('lessons').querySelector('tr:last-child input[type=text]');title.focus();title.select();
};
el('lessons').addEventListener('click',e=>{
  const b=e.target.closest('[data-drop]');if(!b)return;
  const id=Number(b.dataset.drop);state.lessons=state.lessons.filter(l=>l.id!==id);
  commit();
});
document.addEventListener('change',e=>{
  const input=e.target, field=input.dataset.field, row=input.closest('[data-id]'), slot=input.closest('[data-slot]');
  if(!row && !slot && input.id!=='deadline' && input.id!=='pace')return;
  if(slot && field==='day' && (input.validity.rangeOverflow || input.validity.rangeUnderflow)){
    const index=Number(slot.dataset.slot);
    const original=state.sessions[index].day;
    input.value=original;
    const note=el('slot-note-'+index);
    const excluded=original<input.min || original>input.max;
    note.textContent='Elige un día entre hoy y el examen. Se mantiene '+dateLabel(original)+
      (excluded?', fuera de plazo.':'.');
    return;
  }
  if(!input.checkValidity() || (field==='title' && !input.value.trim())){input.reportValidity();render();return;}
  if(row){const l=state.lessons.find(a=>a.id===Number(row.dataset.id));l[field]=field==='title'?input.value.trim():Number(input.value);}
  else if(slot){
    const session=state.sessions[Number(slot.dataset.slot)];
    const value=field==='min'?Number(input.value):input.value;
    const updated={...session,[field]:value};
    if(Plan.toMinutes(updated.start)+updated.min>1440){
      el('hint').textContent='La franja supera la medianoche. Divide el tiempo entre los dos días.';
      render();return;
    }
    session[field]=value;
  }
  else if(input.id==='pace')state.pace=Number(input.value);
  else state.deadline=input.value;
  if(input.id==='deadline' || field==='day') renderSessions();
  refreshPlan();
  save();
});
el('sessions').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){state.sessions.splice(Number(b.dataset.remove),1);commit();}});
el('add').onclick=()=>{state.sessions.push({day:state.deadline,start:'18:00',min:40});commit();};
render();
// Los datos de versiones anteriores pueden carecer de la marca de cálculo.
const returningToPlan = state!==example || performance.getEntriesByType('navigation')[0]?.type==='reload';
if(returningToPlan && state.lessons.length) showCalculatedPlan();
else preview();
