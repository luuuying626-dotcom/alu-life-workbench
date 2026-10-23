import test from 'node:test';
import assert from 'node:assert/strict';
import { mondayOf, canAddDailyTask, waterMl, exerciseCount, progressForGoal, progressForPlan, goalProgress, applyGoalValue, periodFor, validParent, clockText } from '../src/domain.js';

test('derives a Monday key', () => assert.equal(mondayOf('2026-10-22'), '2026-10-19'));
test('caps open daily tasks at three', () => assert.equal(canAddDailyTask([{date:'2026-10-22'},{date:'2026-10-22'},{date:'2026-10-22'}], '2026-10-22'), false));
test('converts cups to ml', () => assert.equal(waterMl(7,250),1750));
test('counts qualifying weekly exercise only', () => assert.equal(exerciseCount([{date:'2026-10-20',minutes:30},{date:'2026-10-21',minutes:10}], '2026-10-19'),1));
test('rolls child task completion into parent progress', () => assert.equal(progressForGoal({id:'year'},[{id:'year'},{id:'week',parentId:'year'}],[{goalId:'week',done:true},{goalId:'week',done:false}]),50));
test('rolls weekly plan completion up to its annual plan', () => assert.equal(progressForPlan('year', [{id:'year'},{id:'quarter',parentId:'year'},{id:'week',parentId:'quarter',done:true}]),100));
test('keeps a 500 yuan saving contribution at 3 percent of a 20,000 yuan goal', () => assert.equal(goalProgress({ type: 'number', targetValue: 20000, currentValue: 500 }), 3));
test('adds numeric progress without completing the annual goal', () => assert.equal(applyGoalValue({ type: 'number', targetValue: 20000, currentValue: 0 }, 500).currentValue, 500));
test('derives selectable period keys', () => { assert.equal(periodFor('季度', '2027-05-02'), '2027 Q2'); assert.equal(periodFor('月度', '2027-05-02'), '2027-05'); assert.equal(periodFor('周度', '2027-05-02'), '2027-04-26'); });
test('allows only direct plan parents', () => { assert.equal(validParent('月度', { level: '季度' }), true); assert.equal(validParent('月度', { level: '年度' }), false); });
test('formats a live clock without a date or year', () => assert.equal(clockText(new Date('2026-10-23T09:05:00')), '09:05'));
