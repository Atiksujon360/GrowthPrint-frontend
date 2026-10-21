import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatCurrency, 
  formatRelativeTime, 
  formatDate, 
  formatHours, 
  formatBytes,
  truncate,
  getInitials,
  slugify,
  cn
} from './utils.ts';

test('formatCurrency formats standard amounts correctly', () => {
  assert.equal(formatCurrency(13475), '$13,475');
  assert.equal(formatCurrency(810), '$810');
  assert.equal(formatCurrency(956.25), '$956.25');
  assert.equal(formatCurrency(0), '$0');
});

test('formatCurrency compact mode formats thousands as k', () => {
  assert.equal(formatCurrency(18500, 'USD', true), '$18.5k');
  assert.equal(formatCurrency(24000, 'USD', true), '$24k');
  assert.equal(formatCurrency(500, 'USD', true), '$500');
});

test('formatHours formats integer and decimal hours', () => {
  assert.equal(formatHours(15), '15 hrs');
  assert.equal(formatHours(8.5), '8.5 hrs');
  assert.equal(formatHours(0), '0 hrs');
});

test('formatBytes handles standard byte thresholds', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576 * 2.5), '2.5 MB');
});

test('truncate shortens strings with ellipsis only when exceeding max length', () => {
  assert.equal(truncate('Short text', 20), 'Short text');
  assert.equal(truncate('A quick brown fox jumps over the lazy dog', 15), 'A quick brown f...');
});

test('getInitials extracts two letters from multi-word names', () => {
  assert.equal(getInitials('Alex Mercer'), 'AM');
  assert.equal(getInitials('Sarah Chen'), 'SC');
  assert.equal(getInitials('GrowthPrint'), 'GR');
});

test('slugify produces valid url slugs', () => {
  assert.equal(slugify('B2B Wholesale Portal & Warehouse Sync!'), 'b2b-wholesale-portal-warehouse-sync');
  assert.equal(slugify('   hello    world  '), 'hello-world');
});

test('cn joins conditional classes properly', () => {
  assert.equal(cn('px-4', true && 'py-2', false && 'hidden', null, 'text-sm'), 'px-4 py-2 text-sm');
});

test('formatRelativeTime produces expected relative text', () => {
  const now = new Date();
  assert.equal(formatRelativeTime(now.toISOString()), 'just now');

  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  assert.equal(formatRelativeTime(fiveMinutesAgo.toISOString()), '5m ago');

  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  assert.equal(formatRelativeTime(twoHoursAgo.toISOString()), '2h ago');
});
