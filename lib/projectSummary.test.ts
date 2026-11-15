import test from 'node:test';
import assert from 'node:assert/strict';
import { budgetUsage, daysUntil, isoDay, milestoneTimeline } from './projectSummary.ts';

test('milestones are ordered by due date and past-due open ones are overdue', () => {
  const t = milestoneTimeline([
    { id: 'c', title: 'Launch', dueDate: '2026-12-01', status: 'PENDING' },
    { id: 'a', title: 'Discovery', dueDate: '2026-09-01', status: 'COMPLETED' },
    { id: 'b', title: 'Build', dueDate: '2026-11-01', status: 'IN_PROGRESS' },
    { id: 'd', title: 'Design', dueDate: '2026-11-20', status: 'IN_PROGRESS' },
  ], '2026-11-15');
  assert.deepEqual(t.map(m => [m.id, m.state]), [['a', 'done'], ['b', 'overdue'], ['d', 'active'], ['c', 'upcoming']]);
});

test('a completed milestone is never overdue', () => {
  const [m] = milestoneTimeline([{ id: 'a', title: 'A', dueDate: '2020-01-01', status: 'COMPLETED' }], '2026-11-15');
  assert.equal(m.state, 'done');
});

test('budget usage handles a missing budget and overspend', () => {
  assert.equal(budgetUsage({ budgetTotal: 0, budgetSpent: 500 }), null);
  assert.deepEqual(budgetUsage({ budgetTotal: 1000, budgetSpent: 250 }), { spent: 250, total: 1000, remaining: 750, percent: 25, over: false });
  assert.deepEqual(budgetUsage({ budgetTotal: 1000, budgetSpent: 1200 }), { spent: 1200, total: 1000, remaining: 0, percent: 120, over: true });
});

test('days until a target date, and null for bad input', () => {
  assert.equal(daysUntil('2026-11-20', '2026-11-15'), 5);
  assert.equal(daysUntil('2026-11-10', '2026-11-15'), -5);
  assert.equal(daysUntil('2026-11-20T10:00:00Z', '2026-11-15'), 5);
  assert.equal(daysUntil(undefined, '2026-11-15'), null);
  assert.equal(daysUntil('soon', '2026-11-15'), null);
  assert.equal(isoDay(new Date(2026, 0, 5)), '2026-01-05');
});
