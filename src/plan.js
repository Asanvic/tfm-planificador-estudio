'use strict';
const Plan = (() => {
  const lessons = [
    ['Fundamentos',4,1], ['Práctica guiada',2,1], ['Repaso',1,1],
    ['Terminal',1,2], ['Git y ramas',2,2], ['Revisión de código',1,2],
    ['Diseño de pruebas',2,2], ['APIs',2,2], ['Depuración',2,2], ['Documentación',1,2]
  ];
  function dateKey(date = new Date()){
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    return date.getFullYear()+'-'+month+'-'+day;
  }
  function offset(day, count){
    const date = new Date(day+'T12:00:00');
    date.setDate(date.getDate()+count);
    return dateKey(date);
  }
  function toMinutes(time){
    const [hour,minute] = time.split(':').map(Number);
    return hour*60+minute;
  }
  function clock(minutes){
    return [Math.floor(minutes/60), minutes%60].map(n=>String(n).padStart(2,'0')).join(':');
  }
  const demo = (today=dateKey()) => ({
    deadline:offset(today,21),pace:20,
    lessons:lessons.map(([title,topics,priority],i)=>({id:i+1,title,topics,priority})),
    sessions:[2,4,6].map((days,i)=>({day:offset(today,days),start:'18:00',min:i===2?40:60}))
  });
  function allocate(lessons, progress, minutes, pace) {
    const items=[];
    let slots=Math.floor(minutes/pace);
    const ordered=lessons.slice().sort((a,b)=>a.priority-b.priority || a.id-b.id);
    for(const lesson of ordered){
      if(slots<1) break;
      if(progress.get(lesson.id)>=lesson.topics) continue;
      const previous=progress.get(lesson.id);
      const count=Math.min(slots,lesson.topics-previous);
      items.push({lesson,first:previous+1,last:previous+count,count});
      progress.set(lesson.id,previous+count);
      slots-=count;
    }
    return items;
  }
  function availableSessions(s, today=dateKey()){
    const ordered = s.sessions.filter(x=>x.day>=today && x.day<=s.deadline)
      .slice().sort((a,b)=>a.day.localeCompare(b.day) || a.start.localeCompare(b.start));
    const result = [];
    for(const session of ordered){
      const last = result[result.length-1];
      const start = toMinutes(session.start);
      // Una misma franja introducida dos veces solo aporta esos minutos una vez.
      if(last && last.day===session.day && start<toMinutes(last.start)+last.min){
        last.min = Math.max(last.min,start+session.min-toMinutes(last.start));
      }else{
        result.push({...session});
      }
    }
    return result;
  }
  function schedule(s, today=dateKey()){
    const progress=new Map(s.lessons.map(l=>[l.id,0]));
    const days=availableSessions(s,today).map(day=>{
      const items=allocate(s.lessons,progress,day.min,s.pace);
      const used=items.reduce((n,x)=>n+x.count*s.pace,0);
      return {...day,items,left:day.min-used};
    });
    const pending=s.lessons.filter(l=>progress.get(l.id)<l.topics).map(l=>({l,count:l.topics-progress.get(l.id)}));
    return {days,pending};
  }
  return {demo,schedule,availableSessions,dateKey,offset,toMinutes,clock};
})();
if(typeof module!=='undefined') module.exports=Plan;
