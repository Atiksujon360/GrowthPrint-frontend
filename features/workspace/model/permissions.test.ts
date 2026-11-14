import test from 'node:test';
import assert from 'node:assert/strict';
import { assignableRoles, can, canRemove, conversionBlocker, invitableRoles, minimumRoleFor } from './permissions.ts';

test('role ladder: each action is allowed from its minimum role upwards', () => {
  assert.equal(can('MEMBER', 'leads.create'), true);
  assert.equal(can('MEMBER', 'leads.edit'), false);
  assert.equal(can('MANAGER', 'leads.convert'), true);
  assert.equal(can('MANAGER', 'leads.delete'), false);
  assert.equal(can('ADMIN', 'leads.delete'), true);
  assert.equal(can('ADMIN', 'ownership.transfer'), false);
  assert.equal(can('OWNER', 'ownership.transfer'), true);
  assert.equal(can(undefined, 'clients.view'), false);
  assert.equal(minimumRoleFor('business.edit'), 'ADMIN');
});

test('assignable roles follow the backend change-role rules', () => {
  assert.deepEqual(assignableRoles('OWNER', 'MEMBER'), ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']);
  assert.deepEqual(assignableRoles('ADMIN', 'MEMBER'), ['MANAGER', 'MEMBER']);
  assert.deepEqual(assignableRoles('ADMIN', 'ADMIN'), [], 'admins cannot change peers');
  assert.deepEqual(assignableRoles('MANAGER', 'MEMBER'), [], 'managers cannot manage members');
});

test('removal: owners remove anyone, admins only lower ranks, everyone may leave', () => {
  assert.equal(canRemove('OWNER', 'OWNER', false), true);
  assert.equal(canRemove('ADMIN', 'MANAGER', false), true);
  assert.equal(canRemove('ADMIN', 'ADMIN', false), false);
  assert.equal(canRemove('MEMBER', 'MEMBER', false), false);
  assert.equal(canRemove('MEMBER', 'MEMBER', true), true);
});

test('invitable roles never include OWNER and admins cannot invite admins', () => {
  assert.deepEqual(invitableRoles('OWNER'), ['ADMIN', 'MANAGER', 'MEMBER']);
  assert.deepEqual(invitableRoles('ADMIN'), ['MANAGER', 'MEMBER']);
  assert.deepEqual(invitableRoles('MANAGER'), []);
});

test('conversion blockers mirror backend LeadConversionService', () => {
  const ok = { convertedClientId: null, pipelineStage: 'QUALIFIED' as const, doNotContact: false, contactEmail: 'a@b.co' };
  assert.equal(conversionBlocker(ok), null);
  assert.equal(conversionBlocker({ ...ok, convertedClientId: 'cli-1' }), 'ALREADY_CONVERTED');
  assert.equal(conversionBlocker({ ...ok, doNotContact: true }), 'DO_NOT_CONTACT');
  assert.equal(conversionBlocker({ ...ok, pipelineStage: 'DO_NOT_CONTACT' }), 'DO_NOT_CONTACT');
  assert.equal(conversionBlocker({ ...ok, pipelineStage: 'LOST' }), 'NOT_ELIGIBLE_STAGE');
  assert.equal(conversionBlocker({ ...ok, contactEmail: '  ' }), 'NO_CONTACT_EMAIL');
});
