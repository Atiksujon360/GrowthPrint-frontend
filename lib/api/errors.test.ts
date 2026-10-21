import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from './client.ts';
import { getErrorMessage } from './errors.ts';

test('getErrorMessage preserves API error messages', () => {
  assert.equal(getErrorMessage(new ApiError('Service unavailable')), 'Service unavailable');
});

test('getErrorMessage handles standard errors and fallback values', () => {
  assert.equal(getErrorMessage(new Error('Network failed')), 'Network failed');
  assert.equal(getErrorMessage(null), 'Something went wrong. Please try again.');
});
