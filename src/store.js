export const STORAGE_KEY = 'alu-workbench-2';

const goals = [
  { id: 'exam', title: '考研：2027 年 12 月完成初试' },
  { id: 'english', title: '英语：考研能力 + 日常交流' },
  { id: 'health', title: '运动健康：每周 3 次运动' },
  { id: 'finance', title: '财务安全：建立 1–2 万元应急金' }
];

const planRoots = () => goals.map(goal => ({ ...goal, level: '年度', period: '2027', note: '', done: false }));

export function createInitialState() {
  return { profile: { waterCupMl: 250, waterTargetMl: 1750 }, goals, plans: planRoots(), tasks: [], logs: {}, reviews: {} };
}

export function normalizeState(value) {
  const base = createInitialState();
  const state = value && typeof value === 'object' ? value : {};
  const savedGoals = Array.isArray(state.goals) && state.goals.length ? state.goals : base.goals;
  const savedPlans = Array.isArray(state.plans) && state.plans.length ? state.plans : savedGoals.map(goal => ({ ...goal, level: '年度', period: '2027', note: '', done: false }));
  return { ...base, ...state, profile: { ...base.profile, ...state.profile }, goals: savedGoals, plans: savedPlans, tasks: Array.isArray(state.tasks) ? state.tasks : [], logs: state.logs || {}, reviews: state.reviews || {} };
}

export function createRepository(storage = localStorage) {
  return { load: () => normalizeState(JSON.parse(storage.getItem(STORAGE_KEY) || 'null')), save: state => storage.setItem(STORAGE_KEY, JSON.stringify(state)) };
}
