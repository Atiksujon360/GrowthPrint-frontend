import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAttentionNotifications, buildRetainerAlert, type AttentionInput } from './attention.ts';
import type { Client, Invoice, Lead, OutreachDraft, Project, SupportRequest } from '../types/agency.ts';

const empty: AttentionInput = { requests: [], drafts: [], invoices: [], projects: [], leads: [], today: '2026-11-15' };
const req = (status: string) => ({ status }) as SupportRequest;
const draft = (status: string) => ({ status }) as OutreachDraft;
const inv = (status: string, totalAmount: number, currency = 'USD') => ({ status, totalAmount, currency }) as Invoice;
const proj = (status: string, milestones: Array<{ status: string; dueDate: string }>) => ({ status, milestones }) as unknown as Project;
const lead = (pipelineStage: string, doNotContact = false) => ({ pipelineStage, doNotContact }) as Lead;
const client = (o: Partial<Client>) => ({ id: 'c1', name: 'Acme', status: 'ACTIVE', monthlyRetainerHours: 20, consumedHoursCurrentMonth: 0, ...o }) as Client;

test('an empty workspace has no notifications and no banner (nothing is invented)', () => {
  assert.deepEqual(buildAttentionNotifications(empty), []);
  assert.equal(buildRetainerAlert([]), null);
});

test('real counts become notifications, most urgent first', () => {
  const list = buildAttentionNotifications({
    ...empty,
    requests: [req('NEW'), req('NEEDS_CLASSIFICATION'), req('COMPLETED')],
    invoices: [inv('OVERDUE', 100), inv('OVERDUE', 50), inv('OVERDUE', 70, 'EUR'), inv('PAID', 999)],
    drafts: [draft('AWAITING_HUMAN_APPROVAL'), draft('SENT')],
    projects: [proj('IN_PROGRESS', [{ status: 'PENDING', dueDate: '2026-11-01' }, { status: 'COMPLETED', dueDate: '2026-01-01' }, { status: 'PENDING', dueDate: '2026-12-01' }]),
      proj('COMPLETED', [{ status: 'PENDING', dueDate: '2020-01-01' }])],
    leads: [lead('READY_FOR_OUTREACH'), lead('READY_FOR_OUTREACH', true), lead('WON')],
  });
  assert.deepEqual(list.map(n => n.title), [
    '2 support requests need triage',
    '3 invoices are overdue',
    '1 outreach draft is waiting for approval',
    '1 project milestone is overdue',
    '1 lead is ready for outreach',
  ]);
  assert.equal(list[1].message, '$150.00 + €70.00 is past its due date.');
  assert.ok(list.every(n => n.id.startsWith('attn:') && n.isRead === false));
});

test('ids change with the count, so a changed situation is unread again', () => {
  const one = buildAttentionNotifications({ ...empty, requests: [req('NEW')] })[0].id;
  const two = buildAttentionNotifications({ ...empty, requests: [req('NEW'), req('NEW')] })[0].id;
  assert.notEqual(one, two);
});

test('the retainer banner appears only at 85 percent or more, for the closest client', () => {
  assert.equal(buildRetainerAlert([client({ consumedHoursCurrentMonth: 16 })]), null); // 80%
  const a = buildRetainerAlert([client({ consumedHoursCurrentMonth: 17 }), client({ id: 'c2', name: 'Beta', consumedHoursCurrentMonth: 19 })])!;
  assert.match(a.message, /^Beta has used 19 of 20 hours this month \(95%\)\./);
  assert.match(a.message, /1 more client is also close to the limit\./);
  assert.equal(a.title, 'Retainer hours running low');
});

test('over the allowance is reported as used up, and suspended or ad-hoc clients are ignored', () => {
  const over = buildRetainerAlert([client({ consumedHoursCurrentMonth: 24 })])!;
  assert.equal(over.title, 'Retainer hours used up');
  assert.match(over.message, /\(120%\)/);
  assert.equal(buildRetainerAlert([client({ status: 'SUSPENDED', consumedHoursCurrentMonth: 30 }), client({ id: 'c3', monthlyRetainerHours: 0, consumedHoursCurrentMonth: 5 })]), null);
});
