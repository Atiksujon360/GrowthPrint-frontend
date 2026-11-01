/**
 * Regression tests for role-based workspace access and portal data scoping (audit 2026-11-01).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessWorkspace, scopeToClient } from './access.ts';

test('only ADMIN users may open the admin workspace', () => {
  assert.equal(canAccessWorkspace('ADMIN', 'admin'), true);
  assert.equal(canAccessWorkspace('CLIENT', 'admin'), false);
  assert.equal(canAccessWorkspace('GUEST', 'admin'), false);
});

test('only CLIENT users may open the client portal', () => {
  assert.equal(canAccessWorkspace('CLIENT', 'portal'), true);
  assert.equal(canAccessWorkspace('ADMIN', 'portal'), false);
  assert.equal(canAccessWorkspace('GUEST', 'portal'), false);
});

const items = [
  { id: 'p1', clientId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
  { id: 'p2', clientId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' }
];

test('in real-API mode portal data is already scoped by the /my endpoints and is not re-filtered', () => {
  // Real logins carry no clientId, so filtering by the mock fallback id hid every real record.
  assert.deepEqual(scopeToClient(items, undefined, false), items);
});

test('in mock mode portal data is filtered to the demo client', () => {
  assert.deepEqual(scopeToClient(items, undefined, true), []);
  assert.deepEqual(scopeToClient([{ id: 'm', clientId: 'client-meridian' }], undefined, true).length, 1);
});
