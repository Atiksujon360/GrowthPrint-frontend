import test from 'node:test';
import assert from 'node:assert/strict';
import { humanizeCode } from './labels.ts';

test('humanizeCode turns backend codes into sentence case', () => {
  assert.equal(humanizeCode('PAID_AD_HOC_SUPPORT'), 'Paid ad hoc support');
  assert.equal(humanizeCode('AWAITING_CLIENT_APPROVAL'), 'Awaiting client approval');
  assert.equal(humanizeCode('TECHNICAL_SEO'), 'Technical SEO');
  assert.equal(humanizeCode('AI_INTEGRATION'), 'AI integration');
  assert.equal(humanizeCode('SOFTWARE_DEV'), 'Software development');
  assert.equal(humanizeCode('URGENT'), 'Urgent');
});

test('humanizeCode leaves human text and empty values alone', () => {
  assert.equal(humanizeCode('Already readable'), 'Already readable');
  assert.equal(humanizeCode(''), '');
  assert.equal(humanizeCode(null), '');
  assert.equal(humanizeCode(undefined), '');
});
