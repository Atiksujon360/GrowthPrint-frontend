import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatMoney, formatRelative } from './format.ts';

test('formatMoney formats whole currency amounts and survives bad codes', () => {
  assert.match(formatMoney(4500, 'USD'), /4,?500/);
  assert.match(formatMoney(4500, 'NOPE'), /4,?500/);
});

test('formatDate returns a dash for missing or invalid dates', () => {
  assert.equal(formatDate(null), '—');
  assert.equal(formatDate(undefined), '—');
  assert.equal(formatDate('not-a-date'), '—');
  assert.notEqual(formatDate('2026-03-12T10:00:00Z'), '—');
});

test('formatRelative uses relative wording for recent events', () => {
  const now = new Date('2026-11-08T12:00:00Z');
  assert.equal(formatRelative('2026-11-08T11:59:40Z', now), 'just now');
  assert.equal(formatRelative('2026-11-08T11:55:00Z', now), '5 min ago');
  assert.equal(formatRelative('2026-11-08T09:00:00Z', now), '3 h ago');
  assert.equal(formatRelative('2026-11-07T12:00:00Z', now), 'yesterday');
  assert.equal(formatRelative('2026-11-04T12:00:00Z', now), '4 days ago');
  assert.equal(formatRelative('bad', now), '—');
});
