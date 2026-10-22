import { createRepository } from './store.js';
import { mondayOf, waterMl, exerciseCount, canAddDailyTask, ensureDailyLog, weeklyRecordSummary, progressForPlan } from './domain.js';

const repo = createRepository();
const today = new Date().toLocaleDateString('sv-SE');
const nav = ['总览', '计划', '记录', '复盘', '我的'];
const levels = ['年度', '季度', '月度', '周度'];
const $ = selector => document.querySelector(selector);
const escape = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
let state = repo.load();
let view = '总览';

const save = () => repo.save(state);
const log = date => ensureDailyLog(state.logs, date || today);
const percent = plan => progressForPlan(plan.id, state.plans);
const weekStart = mondayOf(today);
const planRoots = () => state.plans.filter(plan => !plan.parentId);

function taskCard() {
  const tasks = state.tasks.filter(task => task.date === today);
  return `<section class="card"><h2>今日最重要的事</h2>${tasks.map(task => `<p><button class="ghost" data-done="${task.id}">${task.done ? '✓' : '○'}</button> ${escape(task.title)}</p>`).join('') || '<p class="small">今天先安排一件小事就很好。</p>'}<form id="task"><input name="title" placeholder="新增个人任务"><button>加入今天</button></form></section>`;
}

function home() {
  const todayLog = log();
  const exercise = exerciseCount(Object.values(state.logs).flatMap(item => item.exercise || []), weekStart);
  return `<section class="hero"><small>阿卢的生活工作台</small><h1>今天，先照顾好自己 🌺</h1><p>完成一点点，也是在靠近远方。</p></section>${taskCard()}<section class="grid"><div class="metric"><b>晨间学习</b><p>${todayLog.study ? '已完成' : '还没开始'}</p><button data-study>完成</button></div><div class="metric"><b>本周运动</b><p>${exercise}/3 次</p><small>每次至少 20 分钟</small></div><div class="metric"><b>饮水</b><p>${waterMl(todayLog.waterCups)} / 1750ml</p>${Array.from({ length: 7 }, (_, index) => `<button data-water="${index + 1}">${index < todayLog.waterCups ? '💧' : '○'}</button>`).join('')}</div><div class="metric"><b>睡眠</b><p>${escape(todayLog.sleep?.feeling || '未记录')}</p></div></section><section class="card"><h2>年度主线</h2>${planRoots().map(plan => `<p>${escape(plan.title)} ${percent(plan)}%<span class="bar"><i style="width:${percent(plan)}%"></i></span></p>`).join('')}</section>`;
}

function planNode(plan, depth = 0) {
  const children = state.plans.filter(item => item.parentId === plan.id);
  const open = depth < 1 ? ' open' : '';
  return `<details class="plan-node"${open}><summary><span class="badge">${plan.level}</span><b>${escape(plan.title)}</b><strong>${percent(plan)}%</strong></summary><form data-plan-form="${plan.id}" class="plan-edit"><label>名称<input name="title" value="${escape(plan.title)}" required></label><label>时间段<input name="period" value="${escape(plan.period || '')}" placeholder="例如：2027 Q1 / 3 月 / 第 1 周"></label><label>具体安排<textarea name="note" placeholder="这段时间具体要做什么？">${escape(plan.note || '')}</textarea></label><label class="row"><input name="done" type="checkbox" ${plan.done ? 'checked' : ''}>我已完成这一项</label><button>保存这条计划</button></form>${children.length ? `<div class="plan-children">${children.map(child => planNode(child, depth + 1)).join('')}</div>` : '<p class="small">还没有下一级计划，可在上方“新增计划”里补充。</p>'}</details>`;
}

function plans() {
  const counts = levels.map(level => `${level} ${state.plans.filter(plan => plan.level === level).length}`).join(' · ');
  const parentOptions = state.plans.map(plan => `<option value="${plan.id}">${escape(plan.level)}｜${escape(plan.title)}</option>`).join('');
  return `<section class="hero"><h1>计划</h1><p>年度 → 季度 → 月度 → 周度；完成下级会自动汇总到上级。</p></section><section class="card"><h2>新增计划</h2><form id="add-plan"><input name="title" required placeholder="例如：完成英语基础 1–12 课"><select name="level">${levels.map(level => `<option>${level}</option>`).join('')}</select><select name="parent"><option value="">无上级（新增年度目标）</option>${parentOptions}</select><input name="period" placeholder="时间段，例如：2027 Q1"><textarea name="note" placeholder="这一段具体怎么做？"></textarea><button>添加到计划</button></form><p class="small">${counts}</p></section><section class="card"><h2>我的计划树</h2>${planRoots().map(plan => planNode(plan)).join('')}</section>`;
}

function recordArchive() {
  const dates = [...new Set([...Object.keys(state.logs), ...state.tasks.map(task => task.date)])].sort().reverse();
  if (!dates.length) return '<p class="small">从今天开始记录，内容会自动汇总在这里。</p>';
  return dates.map(date => { const item = state.logs[date] || {}; const tasks = state.tasks.filter(task => task.date === date); const meals = Object.entries(item.meals || {}).filter(([, done]) => done).map(([meal]) => meal).join('、') || '未记录'; const exercise = (item.exercise || []).map(value => `${escape(value.source)} ${value.minutes} 分钟`).join('；') || '无'; return `<details class="record-day" ${date === today ? 'open' : ''}><summary><b>${date}${date === today ? '（今天）' : ''}</b><span>${item.study ? '学习 ✓' : ''} ${exercise !== '无' ? '运动 ✓' : ''}</span></summary><p>晨间学习：${item.study ? '完成' : '未记录'}；饮水：${waterMl(item.waterCups)}ml</p><p>三餐：${meals}</p><p>运动：${exercise}</p><p>睡眠：${item.sleep ? `${escape(item.sleep.bedtime || '未填')} 入睡，${escape(item.sleep.wake || '未填')} 起床，${escape(item.sleep.feeling || '')}` : '未记录'}</p><p>任务：${tasks.length ? tasks.map(task => `${task.done ? '✓' : '○'} ${escape(task.title)}`).join('；') : '无'}</p></details>`; }).join('');
}

function records() {
  const todayLog = log();
  return `<section class="hero"><h1>今日记录</h1><p>填完会保存在这台手机里，并汇总到下方记录合集。</p></section><section class="card"><form id="exercise"><h3>运动</h3><select name="source"><option>Keep</option><option>游泳</option><option>骑行</option></select><input name="minutes" type="number" min="1" required placeholder="运动分钟数"><button>记录运动</button></form><h3>三餐</h3>${['早餐', '午餐', '晚餐'].map(meal => `<label class="row"><input data-meal="${meal}" type="checkbox" ${todayLog.meals[meal] ? 'checked' : ''}>正常吃了${meal}</label>`).join('')}<form id="sleep"><h3>睡眠</h3><input name="bedtime" type="time" value="${escape(todayLog.sleep?.bedtime || '')}"><input name="wake" type="time" value="${escape(todayLog.sleep?.wake || '')}"><select name="feeling"><option ${todayLog.sleep?.feeling === '睡得不错' ? 'selected' : ''}>睡得不错</option><option ${todayLog.sleep?.feeling === '一般' ? 'selected' : ''}>一般</option><option ${todayLog.sleep?.feeling === '很累' ? 'selected' : ''}>很累</option></select><button>保存睡眠</button></form></section><section class="card"><h2>记录合集</h2>${recordArchive()}</section>`;
}

function review() {
  const summary = weeklyRecordSummary(state.logs, weekStart);
  const old = state.reviews[weekStart] || {};
  return `<section class="hero"><h1>本周复盘</h1><p>${weekStart} 开始的一周</p></section><section class="grid"><div class="metric"><b>学习</b><p>${summary.studyDays} 天</p></div><div class="metric"><b>运动</b><p>${summary.exerciseCount} 次</p></div><div class="metric"><b>运动时长</b><p>${summary.exerciseMinutes} 分钟</p></div><div class="metric"><b>正常吃饭</b><p>${summary.mealChecks} 餐</p></div></section><form class="card" id="review">${['最满意的一件事', '没完成的原因', '下周最重要的 1–3 件事'].map(label => `<label>${label}<textarea name="${label}">${escape(old[label] || '')}</textarea></label>`).join('')}<button>保存复盘</button></form>`;
}

function profile() { return `<section class="hero"><h1>我的</h1></section><section class="card"><button id="export">导出 JSON 备份</button><p class="small">记录当前保存在本机浏览器的“阿卢工作台”数据中。清除浏览器数据前，请先导出备份。</p></section>`; }
function page() { return view === '总览' ? home() : view === '计划' ? plans() : view === '记录' ? records() : view === '复盘' ? review() : profile(); }

function render() {
  $('#app').innerHTML = `${page()}<nav class="nav">${nav.map(name => `<button data-nav="${name}" class="${name === view ? 'active' : ''}">${name}</button>`).join('')}</nav>`;
  document.querySelectorAll('[data-nav]').forEach(button => button.onclick = () => { view = button.dataset.nav; render(); });
  document.querySelectorAll('[data-water]').forEach(button => button.onclick = () => { log().waterCups = Number(button.dataset.water); save(); render(); });
  document.querySelectorAll('[data-done]').forEach(button => button.onclick = () => { const task = state.tasks.find(item => item.id === button.dataset.done); task.done = !task.done; save(); render(); });
  $('[data-study]')?.addEventListener('click', () => { log().study = true; save(); render(); });
  $('#task')?.addEventListener('submit', event => { event.preventDefault(); const title = new FormData(event.target).get('title').trim(); if (title && canAddDailyTask(state.tasks, today)) { state.tasks.push({ id: crypto.randomUUID(), title, date: today, done: false }); save(); render(); } });
  $('#add-plan')?.addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target)); if (!data.title.trim()) return; state.plans.push({ id: crypto.randomUUID(), title: data.title.trim(), level: data.level, parentId: data.parent || null, period: data.period.trim(), note: data.note.trim(), done: false }); save(); render(); });
  document.querySelectorAll('[data-plan-form]').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); const plan = state.plans.find(item => item.id === form.dataset.planForm); const data = new FormData(form); plan.title = data.get('title').trim(); plan.period = data.get('period').trim(); plan.note = data.get('note').trim(); plan.done = data.get('done') === 'on'; save(); render(); }));
  $('#exercise')?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); log().exercise.push({ date: today, minutes: Number(data.get('minutes')), source: data.get('source') }); save(); render(); });
  document.querySelectorAll('[data-meal]').forEach(input => input.onchange = () => { log().meals[input.dataset.meal] = input.checked; save(); render(); });
  $('#sleep')?.addEventListener('submit', event => { event.preventDefault(); log().sleep = Object.fromEntries(new FormData(event.target)); save(); render(); });
  $('#review')?.addEventListener('submit', event => { event.preventDefault(); state.reviews[weekStart] = Object.fromEntries(new FormData(event.target)); save(); render(); });
  $('#export')?.addEventListener('click', () => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' })); link.download = 'alu-workbench-backup.json'; link.click(); });
}

render();
