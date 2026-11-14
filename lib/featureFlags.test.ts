import test from 'node:test';
import assert from 'node:assert/strict';
import { isWorkspacePreviewEnabled } from './featureFlags.ts';

test('workspace preview is off unless explicitly enabled', () => {
  assert.equal(isWorkspacePreviewEnabled(undefined), false);
  assert.equal(isWorkspacePreviewEnabled(''), false);
  assert.equal(isWorkspacePreviewEnabled('false'), false);
  assert.equal(isWorkspacePreviewEnabled('TRUE'), false);
  assert.equal(isWorkspacePreviewEnabled('true'), true);
});
