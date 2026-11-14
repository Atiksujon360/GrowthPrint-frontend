/**
 * Regression tests for role-based workspace access and portal data scoping (audit 2026-11-01).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessWorkspace, canUseStudioTab, initialsOf, scopeToClient } from './access.ts';
import { toFrontendRole, toSessionUser, toTeamModules } from '../features/auth/authSlice.ts';

test('only staff (ADMIN, TEAM_MEMBER) may open the internal studio', () => {
  assert.equal(canAccessWorkspace('ADMIN', 'admin'), true);
  assert.equal(canAccessWorkspace('TEAM_MEMBER', 'admin'), true);
  assert.equal(canAccessWorkspace('CLIENT', 'admin'), false);
  assert.equal(canAccessWorkspace('GUEST', 'admin'), false);
  assert.equal(canAccessWorkspace('TEAM_MEMBER', 'portal'), false);
});

test('team members only see the studio tabs for the modules they were granted', () => {
  const member = { role: 'TEAM_MEMBER' as const, permissions: ['CRM' as const] };
  assert.equal(canUseStudioTab(member, 'DASHBOARD'), true);
  assert.equal(canUseStudioTab(member, 'SETTINGS'), true);
  assert.equal(canUseStudioTab(member, 'LEADS'), true);
  assert.equal(canUseStudioTab(member, 'CLIENTS'), false);
  // Never grantable: finance, AI settings, user management
  assert.equal(canUseStudioTab({ role: 'TEAM_MEMBER', permissions: ['CRM', 'CLIENTS', 'PROJECTS', 'SUPPORT', 'PROPOSALS', 'OUTREACH'] }, 'INVOICES'), false);
  assert.equal(canUseStudioTab(member, 'AI_SETTINGS'), false);
  assert.equal(canUseStudioTab(member, 'TEAM'), false);
  assert.equal(canUseStudioTab({ role: 'ADMIN' }, 'TEAM'), true);
  assert.equal(canUseStudioTab({ role: 'CLIENT' }, 'DASHBOARD'), false);
});

test('backend roles and permissions are mapped defensively', () => {
  assert.equal(toFrontendRole('TEAM_MEMBER'), 'TEAM_MEMBER');
  assert.equal(toFrontendRole('SUPERUSER'), 'GUEST');
  assert.deepEqual(toTeamModules(['CRM', 'INVOICES', 'ROOT', 'SUPPORT']), ['CRM', 'SUPPORT']);

  const member = toSessionUser({ id: 'u1', email: 'sam.rivera@example.com', role: 'TEAM_MEMBER',
    fullName: 'Sam Rivera', permissions: ['PROJECTS'] });
  assert.equal(member.name, 'Sam Rivera');
  assert.deepEqual(member.permissions, ['PROJECTS']);
  assert.equal(member.avatarUrl, undefined);

  // Only team members carry permissions, whatever the payload says
  const admin = toSessionUser({ id: 'a1', email: 'owner@example.com', role: 'ADMIN', permissions: ['CRM'] });
  assert.deepEqual(admin.permissions, []);
  assert.equal(admin.name, 'owner');
});

test('initials avatars are derived from name or email', () => {
  assert.equal(initialsOf('Sarah Chen'), 'SC');
  assert.equal(initialsOf(undefined, 'olive.owner@acme.test'), 'OO');
  assert.equal(initialsOf('', 'x@y.z'), 'X');
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
