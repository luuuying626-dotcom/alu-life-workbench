export const STORAGE_KEY = 'alu-workbench-2';

const baseGoals = () => [
  { id: 'exam', title: '考研：2027 年 12 月完成初试', type: 'stage', stagePercent: 0, unit: '', targetValue: 0, currentValue: 0 },
  { id: 'english', title: '英语：考研能力 + 日常交流', type: 'stage', stagePercent: 0, unit: '', targetValue: 0, currentValue: 0 },
  { id: 'health', title: '运动健康：每周 3 次运动', type: 'number', unit: '次', targetValue: 156, currentValue: 0, stagePercent: 0 },
  { id: 'finance', title: '财务安全：建立 20,000 元应急金', type: 'number', unit: '元', targetValue: 20000, currentValue: 0, stagePercent: 0 }
];

const normalizeGoal = goal => ({ title: '未命名目标', type: 'stage', unit: '', targetValue: 0, currentValue: 0, stagePercent: 0, ...goal, type: goal?.type === 'number' ? 'number' : 'stage', stagePercent: goal?.type ? Number(goal.stagePercent || 0) : 0, currentValue: Number(goal?.currentValue || 0), targetValue: Number(goal?.targetValue || 0) });
const normalizeLog = log => ({ waterCups: Number(log?.waterCups || 0), meals: { breakfast: log?.meals?.breakfast || log?.meals?.早餐 || '', lunch: log?.meals?.lunch || log?.meals?.午餐 || '', dinner: log?.meals?.dinner || log?.meals?.晚餐 || '' }, exercise: Array.isArray(log?.exercise) ? log.exercise : [], sleep: log?.sleep || null, study: Boolean(log?.study) });

export function createInitialState() {
  return { profile: { waterCupMl: 250, waterTargetMl: 1750 }, settings: { encouragement: '把生活过成喜欢的样子，好运会悄悄靠近你。' }, goals: baseGoals(), plans: [], tasks: [], logs: {}, reviews: {} };
}

export function normalizeState(value) {
  const base = createInitialState();
  const state = value && typeof value === 'object' ? value : {};
  const goals = (Array.isArray(state.goals) && state.goals.length ? state.goals : base.goals).map(normalizeGoal);
  const plans = Array.isArray(state.plans) ? state.plans.map(plan => ({ id: plan.id, title: plan.title || '未命名计划', level: plan.level || '年度', period: plan.period || '', parentId: plan.parentId || null, goalId: plan.goalId || null, note: plan.note || '', done: Boolean(plan.done), actions: Array.isArray(plan.actions) ? plan.actions : [] })) : [];
  const logs = Object.fromEntries(Object.entries(state.logs || {}).map(([date, log]) => [date, normalizeLog(log)]));
  return { ...base, ...state, profile: { ...base.profile, ...state.profile }, settings: { ...base.settings, ...state.settings }, goals, plans, tasks: Array.isArray(state.tasks) ? state.tasks : [], logs, reviews: state.reviews || {} };
}

export function createRepository(storage = localStorage) {
  return { load: () => normalizeState(JSON.parse(storage.getItem(STORAGE_KEY) || 'null')), save: state => storage.setItem(STORAGE_KEY, JSON.stringify(state)) };
}
