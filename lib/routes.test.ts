import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUTES, getDefaultRouteForRole, getLoginRouteForRole, isAdminRoute, isNoIndexPath, isPortalRoute,
  isProtectedRoute, resolveLegacyRoute,
} from './routes.ts';

test('workspaces live under the documented prefixes', () => {
  assert.equal(ROUTES.admin.home, '/studio/ops');
  assert.equal(ROUTES.admin.login, '/studio/ops/login');
  assert.equal(ROUTES.portal.home, '/client-hub');
  assert.equal(ROUTES.portal.login, '/client-hub/login');
});

test('route classification matches whole path segments only', () => {
  assert.equal(isAdminRoute('/studio/ops'), true);
  assert.equal(isAdminRoute('/studio/ops/settings'), true);
  assert.equal(isAdminRoute('/studio/opsx'), false);
  assert.equal(isPortalRoute('/client-hub/settings'), true);
  assert.equal(isPortalRoute('/client-hubs'), false);
  assert.equal(isProtectedRoute('/'), false);
  assert.equal(isProtectedRoute('/forgot-password'), false);
});

test('each role lands in its own workspace; team members use the studio', () => {
  assert.equal(getDefaultRouteForRole('ADMIN'), '/studio/ops');
  assert.equal(getDefaultRouteForRole('TEAM_MEMBER'), '/studio/ops');
  assert.equal(getDefaultRouteForRole('CLIENT'), '/client-hub');
  assert.equal(getDefaultRouteForRole('GUEST'), '/');
  assert.equal(getLoginRouteForRole('TEAM_MEMBER'), '/studio/ops/login');
  assert.equal(getLoginRouteForRole('CLIENT'), '/client-hub/login');
});

test('legacy /portal URLs redirect to the same sub-path under /client-hub', () => {
  assert.deepEqual(resolveLegacyRoute('/portal'), { kind: 'redirect', location: '/client-hub' });
  assert.deepEqual(resolveLegacyRoute('/portal/login'), { kind: 'redirect', location: '/client-hub/login' });
  assert.deepEqual(resolveLegacyRoute('/portal/settings'), { kind: 'redirect', location: '/client-hub/settings' });
});

test('legacy /admin URLs are a plain 404 that does not reveal the studio path', () => {
  assert.deepEqual(resolveLegacyRoute('/admin'), { kind: 'not-found' });
  assert.deepEqual(resolveLegacyRoute('/admin/login'), { kind: 'not-found' });
});

test('unrelated paths that merely start with the same letters pass through', () => {
  assert.deepEqual(resolveLegacyRoute('/administration-guide'), { kind: 'pass' });
  assert.deepEqual(resolveLegacyRoute('/portals'), { kind: 'pass' });
  assert.deepEqual(resolveLegacyRoute('/'), { kind: 'pass' });
});

test('private and one-time-link pages are noindex; marketing pages are not', () => {
  assert.equal(isNoIndexPath('/studio/ops/login'), true);
  assert.equal(isNoIndexPath('/client-hub'), true);
  assert.equal(isNoIndexPath('/reset-password'), true);
  assert.equal(isNoIndexPath('/accept-invite'), true);
  assert.equal(isNoIndexPath('/'), false);
  assert.equal(isNoIndexPath('/forgot-password'), false);
});
