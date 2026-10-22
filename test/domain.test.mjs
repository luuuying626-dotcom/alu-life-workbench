import test from 'node:test';
import assert from 'node:assert/strict';
import { mondayOf, canAddDailyTask, waterMl, exerciseCount, progressForGoal, progressForPlan } from '../src/domain.js';

test('derives a Monday key', () => assert.equal(mondayOf('2026-10-22'), '2026-10-19'));
test('caps open daily tasks at three', () => assert.equal(canAddDailyTask([{date:'2026-10-22'},{date:'2026-10-22'},{date:'2026-10-22'}], '2026-10-22'), false));
test('converts cups to ml', () => assert.equal(waterMl(7,250),1750));
test('counts qualifying weekly exercise only', () => assert.equal(exerciseCount([{date:'2026-10-20',minutes:30},{date:'2026-10-21',minutes:10}], '2026-10-19'),1));
test('rolls child task completion into parent progress', () => assert.equal(progressForGoal({id:'year'},[{id:'year'},{id:'week',parentId:'year'}],[{goalId:'week',done:true},{goalId:'week',done:false}]),50));
test('rolls weekly plan completion up to its annual plan', () => assert.equal(progressForPlan('year', [{id:'year'},{id:'quarter',parentId:'year'},{id:'week',parentId:'quarter',done:true}]),100));
