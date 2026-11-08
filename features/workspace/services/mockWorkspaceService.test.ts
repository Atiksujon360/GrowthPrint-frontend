/**
 * The Phase 1 mock must enforce the same authorization and integrity rules as the backend, so screens built
 * against it behave the same once Phase 3 swaps in the HTTP service.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MockWorkspaceService, paginate, slugify } from './mockWorkspaceService.ts';
import type { Actor, ServiceError } from '../model/types.ts';

const owner: Actor = { id: 'u-owner', email: 'owner@example.com', name: 'Olive Owner' };
const stranger: Actor = { id: 'u-stranger', email: 'stranger@example.com', name: 'Sam Stranger' };

async function rejects(promise: Promise<unknown>, status: number): Promise<ServiceError> {
  try {
    await promise;
  } catch (error) {
    assert.equal((error as ServiceError).status, status, (error as ServiceError).message);
    return error as ServiceError;
  }
  assert.fail(`expected a ${status} error`);
}

async function setup() {
  const service = new MockWorkspaceService();
  const businesses = await service.listMyBusinesses(owner);
  const studio = businesses.find(b => b.myRole === 'OWNER');
  const northwind = businesses.find(b => b.myRole === 'MANAGER');
  assert.ok(studio && northwind, 'seed creates an owned and a managed business');
  return { service, studio, northwind };
}

test('seed data: two businesses with different roles', async () => {
  const { service, studio } = await setup();
  const members = await service.listMembers(owner, studio.id);
  assert.deepEqual(members.map(m => m.role).sort(), ['ADMIN', 'MANAGER', 'MEMBER', 'OWNER']);
});

test('a non-member gets 404 for another business and its data (no existence leak)', async () => {
  const { service, studio } = await setup();
  await rejects(service.getBusiness(stranger, studio.id), 404);
  await rejects(service.listClients(stranger, studio.id, {}), 404);
  await rejects(service.listLeads(stranger, studio.id, {}), 404);
});

test('records from one business cannot be read through another business id', async () => {
  const { service, studio, northwind } = await setup();
  const page = await service.listClients(owner, studio.id, { pageSize: 1 });
  const clientId = page.items[0].id;
  await rejects(service.getClient(owner, northwind.id, clientId), 404);
});

test('a manager cannot invite or edit the business profile (403)', async () => {
  const { service, northwind } = await setup();
  await rejects(service.inviteMember(owner, northwind.id, 'new@example.com', 'MEMBER'), 403);
  await rejects(service.updateBusiness(owner, northwind.id, { name: 'Renamed' }), 403);
});

test('a lead converts exactly once, creating a linked client', async () => {
  const { service, studio } = await setup();
  const lead = await service.createLead(owner, studio.id, {
    companyName: 'Acme Bakery', contactName: 'Ann', contactEmail: 'ann@acme.example', pipelineStage: 'QUALIFIED',
  });
  const client = await service.convertLead(owner, studio.id, lead.id, { billingCurrency: 'EUR' });
  assert.equal(client.convertedFromLeadId, lead.id);
  assert.equal(client.billingCurrency, 'EUR');
  const after = await service.getLead(owner, studio.id, lead.id);
  assert.equal(after.pipelineStage, 'WON');
  assert.equal(after.convertedClientId, client.id);
  await rejects(service.convertLead(owner, studio.id, lead.id, {}), 409);
  await rejects(service.changeLeadStage(owner, studio.id, lead.id, 'LOST'), 409);
  await rejects(service.deleteLead(owner, studio.id, lead.id), 409);
});

test('a lead without a contact email cannot be converted', async () => {
  const { service, studio } = await setup();
  const lead = await service.createLead(owner, studio.id, { companyName: 'No Email Ltd', contactName: 'Nia' });
  const error = await rejects(service.convertLead(owner, studio.id, lead.id, {}), 400);
  assert.ok(error.message.length > 0);
});

test('the last owner cannot leave; transferring ownership demotes the old owner to admin', async () => {
  const { service, studio } = await setup();
  await rejects(service.removeMember(owner, studio.id, owner.id), 409);
  const members = await service.listMembers(owner, studio.id);
  const admin = members.find(m => m.role === 'ADMIN');
  assert.ok(admin);
  await service.transferOwnership(owner, studio.id, admin.userId);
  const business = await service.getBusiness(owner, studio.id);
  assert.equal(business.myRole, 'ADMIN');
  await rejects(service.transferOwnership(owner, studio.id, admin.userId), 403);
});

test('invitations are email-bound and single use', async () => {
  const { service, studio } = await setup();
  const invitee: Actor = { id: 'u-invitee', email: 'invitee@example.com', name: 'Ivy Invitee' };
  const created = await service.inviteMember(owner, studio.id, 'Invitee@Example.com', 'MANAGER');
  assert.match(created.link, /\/join-business#token=/);
  await rejects(service.acceptInvitation(stranger, created.token), 400);
  const preview = await service.previewInvitation(invitee, created.token);
  assert.equal(preview.role, 'MANAGER');
  const joined = await service.acceptInvitation(invitee, created.token);
  assert.equal(joined.myRole, 'MANAGER');
  await rejects(service.acceptInvitation(invitee, created.token), 400);
});

test('an invitation stops working when the inviter loses the authority to send it', async () => {
  const { service, studio } = await setup();
  const members = await service.listMembers(owner, studio.id);
  const admin = members.find(m => m.role === 'ADMIN');
  assert.ok(admin);
  const adminActor: Actor = { id: admin.userId, email: admin.email, name: admin.fullName ?? '' };
  const created = await service.inviteMember(adminActor, studio.id, 'late@example.com', 'MEMBER');
  await service.changeMemberRole(owner, studio.id, admin.userId, 'MEMBER');
  const late: Actor = { id: 'u-late', email: 'late@example.com', name: 'Lee Late' };
  await rejects(service.acceptInvitation(late, created.token), 400);
});

test('client creation validates input and returns field errors', async () => {
  const { service, studio } = await setup();
  const error = await rejects(service.createClient(owner, studio.id, { name: '', contactEmail: 'nope' }), 400);
  assert.ok(error.fieldErrors?.name);
  assert.ok(error.fieldErrors?.contactEmail);
});

test('client search and pagination', async () => {
  const { service, studio } = await setup();
  const first = await service.listClients(owner, studio.id, { page: 1, pageSize: 5 });
  assert.equal(first.items.length, 5);
  assert.ok(first.total > 5);
  const none = await service.listClients(owner, studio.id, { search: 'zzz-no-match' });
  assert.equal(none.total, 0);
});

test('dashboard summarises the business it was asked for', async () => {
  const { service, studio, northwind } = await setup();
  const a = await service.getDashboard(owner, studio.id);
  const b = await service.getDashboard(owner, northwind.id);
  assert.ok(a.clients.total > b.clients.total);
  assert.equal(b.clients.total, 2);
});

test('paginate clamps page size and page number', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  assert.equal(paginate(items, { page: 3, pageSize: 10 }).items.length, 5);
  assert.equal(paginate(items, { page: 1, pageSize: 1000 }).pageSize, 100);
  assert.equal(paginate(items, { page: 0, pageSize: 0 }).pageSize, 1);
  assert.equal(paginate(items, { page: 99, pageSize: 10 }).page, 3, 'past-the-end pages clamp to the last page');
  assert.equal(slugify('  Acme & Co. Bakery! '), 'acme-co-bakery');
});
