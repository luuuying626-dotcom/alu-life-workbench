const key = value => typeof value === 'string' ? value : value.toISOString().slice(0,10);
export function mondayOf(value) { const d=new Date(`${key(value)}T12:00:00`); d.setDate(d.getDate()-((d.getDay()+6)%7)); return key(d); }
export function canAddDailyTask(tasks,date) { return tasks.filter(t=>t.date===date&&!t.done).length<3; }
export function waterMl(cups,cupMl=250) { return Number(cups||0)*Number(cupMl||250); }
export function exerciseCount(logs,weekStart) { const end=new Date(`${weekStart}T12:00:00`); end.setDate(end.getDate()+7); return logs.filter(x=>x.minutes>=20&&x.date>=weekStart&&x.date<key(end)).length; }
export function progressForGoal(goal,goals,tasks) { const ids=new Set([goal.id]); let changed=true; while(changed){changed=false; for(const g of goals) if(g.parentId&&ids.has(g.parentId)&&!ids.has(g.id)){ids.add(g.id);changed=true;} } const items=tasks.filter(t=>ids.has(t.goalId)); return items.length?Math.round(items.filter(t=>t.done).length/items.length*100):0; }
