import test from 'node:test';
import assert from 'node:assert/strict';
import { pageWindow } from './pageWindow.ts';

test('pageWindow shows every page when there are few', () => {
  assert.deepEqual(pageWindow(1, 1), [1]);
  assert.deepEqual(pageWindow(2, 3), [1, 2, 3]);
  assert.deepEqual(pageWindow(1, 4), [1, 2, 3, 4]);
});

test('pageWindow collapses distant pages into gaps', () => {
  assert.deepEqual(pageWindow(6, 12), [1, 'gap', 5, 6, 7, 'gap', 12]);
  assert.deepEqual(pageWindow(1, 12), [1, 2, 'gap', 12]);
  assert.deepEqual(pageWindow(12, 12), [1, 'gap', 11, 12]);
});

test('pageWindow clamps out-of-range input', () => {
  assert.deepEqual(pageWindow(0, 0), [1]);
  assert.deepEqual(pageWindow(99, 3), [1, 2, 3]);
});
