import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureDailyLog, weeklyRecordSummary } from '../src/domain.js';

test('creates and stores a daily record for a new date', () => {
  const logs = {};
  const today = ensureDailyLog(logs, '2026-10-22');
  today.study = true;

  assert.equal(logs['2026-10-22'].study, true);
  assert.deepEqual(logs['2026-10-22'].exercise, []);
});

test('summarizes completed habits and exercise for a review week', () => {
  const summary = weeklyRecordSummary({
    '2026-10-19': { study: true, meals: { 早餐: true, 午餐: true }, exercise: [{ minutes: 30, source: 'Keep' }] },
    '2026-10-20': { study: true, meals: { 早餐: true }, exercise: [] }
  }, '2026-10-19');

  assert.deepEqual(summary, { studyDays: 2, mealChecks: 3, exerciseCount: 1, exerciseMinutes: 30 });
});
