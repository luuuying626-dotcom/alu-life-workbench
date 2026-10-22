import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState } from '../src/store.js';

test('migrates legacy goals to zero-progress stage goals without inheriting plan completion', () => {
  const state = normalizeState({ goals: [{ id: 'finance', title: '应急金', done: true }], plans: [{ id: 'old', title: '存 500', done: true }] });
  assert.equal(state.goals[0].type, 'stage');
  assert.equal(state.goals[0].stagePercent, 0);
  assert.equal(state.plans[0].done, true);
});

test('normalizes a saved daily log with all record fields', () => {
  const state = normalizeState({ logs: { '2026-10-23': { sleep: { bedtime: '23:00' } } } });
  assert.deepEqual(state.logs['2026-10-23'].meals, { breakfast: '', lunch: '', dinner: '' });
  assert.deepEqual(state.logs['2026-10-23'].exercise, []);
  assert.equal(state.logs['2026-10-23'].waterCups, 0);
});
