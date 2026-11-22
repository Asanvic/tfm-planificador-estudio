'use strict';
function createCalendar(el, escapeText){
  const weekdays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  let view = 'month';
  let selectedDay = null;
  const zoomLevels = [50,75,100,125,150,200];
  let zoomIndex = 0;
  let cursor = Plan.dateKey();
  let deadline, today, pace, calculated;
  const slotsByDay = new Map();
  const localDate = day => new Date(day+'T12:00:00');
  const format = (day,options) => localDate(day).toLocaleDateString('es-ES',options);
  const monday = day => Plan.offset(day,-((localDate(day).getDay()+6)%7));
  function monthStart(day, shift=0){
    const date = localDate(day);
    date.setDate(1);
    date.setMonth(date.getMonth()+shift);
    return Plan.dateKey(date);
  }
  const inRange = day => day>=today && day<=deadline;
  function show(sessions,state){
    calculated=state.calculated;
    today=Plan.dateKey();
    deadline=state.deadline;
    pace=state.pace;
    slotsByDay.clear();
    for(const session of sessions){
      const slots=slotsByDay.get(session.day) || new Map();
      slotsByDay.set(session.day,slots);
      const topics=[];
      for(const item of session.items || []){
        for(let n=item.first;n<=item.last;n++) topics.push({title:item.lesson.title,n});
      }
      const start=Plan.toMinutes(session.start);
      for(let elapsed=0;elapsed<session.min;elapsed+=pace){
        const duration=Math.min(pace,session.min-elapsed);
        const topic=topics[elapsed/pace];
        slots.set(start+elapsed,{duration,topic});
      }
    }
    render();
  }
  function weekGrid(start){
    const days=weekdays.map((_,i)=>Plan.offset(start,i));
    // Las horas enteras mantienen la cuadrícula incluso cuando no hay sesiones.
    const edges = new Set(Array.from({length:25},(_,hour)=>hour*60));
    for(const day of days){
      for(const [startMinute,slot] of slotsByDay.get(day) || []){
        edges.add(startMinute);
        edges.add(startMinute+slot.duration);
      }
    }
    const times = [...edges].sort((a,b)=>a-b);
    const indexAt = new Map(times.map((time,index)=>[time,index]));
    const occupiedUntil = days.map(()=>0);
    const headings=days.map((day,i)=>{
      const selected=day===selectedDay;
      const count=topicCount(day);
      const detail=selected && calculated ? '<small>'+topicLabel(count)+'</small>' : '';
      const style=selected?'chosen-day':inRange(day)?'':'muted';
      return '<th scope="col" class="'+style+'">'+weekdays[i]+' '+Number(day.slice(-2))+
        (day===deadline?'<small>Examen</small>':'')+detail+'</th>';
    }).join('');
    const rows=times.slice(0,-1).map((time,index)=>{
      const cells=days.map((day,column)=>{
        if(time<occupiedUntil[column]) return '';
        const slot=slotsByDay.get(day)?.get(time);
        if(!slot){
          const workingHours=column<5 && time>=8*60 && time<17*60;
          return workingHours ? '<td class="working-hours"></td>' : '<td></td>';
        }
        const end=time+slot.duration;
        occupiedUntil[column]=end;
        const timeLabel=Plan.clock(time)+'–'+Plan.clock(end);
        let label='Pendiente de calcular';
        if(slot.topic) label=escapeText(slot.topic.title)+' · Tema '+slot.topic.n;
        else if(slot.duration<pace) label='Tiempo insuficiente para un tema';
        else if(calculated) label='Sin tema asignado';
        return '<td class="study'+(day===selectedDay?' chosen-slot':'')+'" rowspan="'+(indexAt.get(end)-index)+'"><div class="'+
          (slot.topic?'booked':'free')+'"><strong>'+label+'</strong><small>'+timeLabel+'</small></div></td>';
      }).join('');
      const hour=time%60===0;
      const duration=times[index+1]-time;
      return '<tr data-minute="'+time+'" class="'+(hour?'hour':'')+
        '" style="height:calc('+duration+' * var(--minute-height))"><th scope="row">'+(hour?Plan.clock(time):'')+'</th>'+cells+'</tr>';
    }).join('');
    return '<table class="weekgrid"><thead><tr><th scope="col">Hora</th>'+headings+'</tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function topicCount(day){
    return Array.from(slotsByDay.get(day)?.values() || []).filter(slot=>slot.topic).length;
  }
  const topicLabel=count=>count+(count===1?' tema':' temas');
  function monthGrid(start){
    const end=monthStart(start,1);
    const cells=weekdays.map(d=>'<b class="weekday">'+d+'</b>');
    for(let day=monday(start);day<end || localDate(day).getDay()!==1;day=Plan.offset(day,1)){
      if(day<start || day>=end){cells.push('<div class="muted"></div>');continue;}
      const number=Number(day.slice(-2));
      if(!inRange(day)){cells.push('<div class="muted">'+number+'</div>');continue;}
      const slots=Array.from(slotsByDay.get(day)?.values() || []);
      const count=topicCount(day);
      const minutes=slots.reduce((sum,s)=>sum+s.duration,0);
      const info=minutes?'<small>'+minutes+' min</small>':'';
      const topics=count?'<small>'+topicLabel(count)+'</small>':'';
      const exam=day===deadline?'<small class="exam">Examen</small>':'';
      cells.push('<button data-date="'+day+'" class="'+(count?'assigned':minutes?'available':'')+'" aria-label="'+
        format(day,{dateStyle:'full'})+', ver semana"><b>'+number+'</b>'+exam+info+topics+'</button>');
    }
    return '<div class="monthgrid">'+cells.join('')+'</div>';
  }
  function render(){
    el('week').setAttribute('aria-pressed',String(view==='week'));
    el('month').setAttribute('aria-pressed',String(view==='month'));
    el('weekZoom').hidden=view!=='week' || deadline<today;
    if(deadline<today){
      el('days').classList.remove('week-scroll');
      el('days').innerHTML='<p>La fecha del examen ya ha pasado.</p>';
      el('period').textContent='';el('previous').disabled=true;el('next').disabled=true;return;
    }
    if(cursor<today)cursor=today;
    if(cursor>deadline)cursor=deadline;
    const weekly=view==='week';
    const start=weekly?monday(cursor):monthStart(cursor);
    const end=weekly?Plan.offset(start,6):Plan.offset(monthStart(start,1),-1);
    el('previous').disabled=start<=today;
    el('next').disabled=end>=deadline;
    el('period').textContent=weekly?format(start,{day:'numeric',month:'short'})+' – '+format(end,{day:'numeric',month:'short',year:'numeric'}):
      format(start,{month:'long',year:'numeric'});
    const container=el('days');
    const previousScroll=container.querySelector('.weekgrid') ? container.scrollTop : null;
    container.classList.toggle('week-scroll',weekly);
    container.innerHTML=weekly?weekGrid(start):monthGrid(start);
    if(weekly){
      const morning=container.querySelector('[data-minute="480"]');
      const head=container.querySelector('thead');
      container.scrollTop=previousScroll ?? morning.getBoundingClientRect().top-container.getBoundingClientRect().top+container.scrollTop-head.offsetHeight;
    }else{
      container.scrollTop=0;
    }
  }
  function applyZoom(){
    const percent=zoomLevels[zoomIndex];
    el('days').style.setProperty('--minute-height',1.6*percent/100+'px');
    el('zoomLevel').value=percent+' %';
    el('zoomOut').disabled=zoomIndex===0;
    el('zoomIn').disabled=zoomIndex===zoomLevels.length-1;
  }
  function changeZoom(step){
    const container=el('days');
    const table=container.querySelector('.weekgrid');
    const next=zoomIndex+step;
    if(!table || next<0 || next>=zoomLevels.length) return;
    // Usar la primera hora visible como ancla, también con filas de duración irregular.
    const visibleTop=container.getBoundingClientRect().top+container.clientTop+table.tHead.offsetHeight;
    const row=Array.from(table.tBodies[0].rows).find(row=>row.getBoundingClientRect().bottom>visibleTop);
    const rect=row?.getBoundingClientRect();
    const fraction=rect ? Math.max(0,(visibleTop-rect.top)/rect.height) : 0;
    zoomIndex=next;
    applyZoom();
    if(row){
      const resized=row.getBoundingClientRect();
      container.scrollTop+=resized.top+fraction*resized.height-visibleTop;
    }
  }
  el('zoomOut').onclick=()=>changeZoom(-1);
  el('zoomIn').onclick=()=>changeZoom(1);
  function setView(value){view=value;render();}
  function move(direction){
    selectedDay=null;
    cursor=view==='week'?Plan.offset(monday(cursor),direction*7):monthStart(cursor,direction);
    render();
  }
  el('week').onclick=()=>setView('week');
  el('month').onclick=()=>setView('month');
  el('previous').onclick=()=>move(-1);
  el('next').onclick=()=>move(1);
  el('days').onclick=e=>{
    const button=e.target.closest('button[data-date]');
    if(!button) return;
    cursor=selectedDay=button.dataset.date;
    setView('week');
    const container=el('days');
    const heading=container.querySelector('.chosen-day');
    const firstSlot=container.querySelector('.chosen-slot');
    if(firstSlot){
      container.scrollTop+=firstSlot.getBoundingClientRect().top-container.getBoundingClientRect().top-heading.offsetHeight-8;
    }
    if(heading.getBoundingClientRect().right>container.getBoundingClientRect().right){
      container.scrollLeft+=heading.getBoundingClientRect().right-container.getBoundingClientRect().right+4;
    }
    el('week').focus({preventScroll:true});
  };
  applyZoom();
  return {show};
}
