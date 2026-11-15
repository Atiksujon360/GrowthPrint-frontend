import test from 'node:test';
import assert from 'node:assert/strict';
import { retainerUsage, clientRelations } from './clientSummary.ts';
import type { Invoice, Project } from '../types/agency.ts';

const invoice = (o: Partial<Invoice>): Invoice => ({
  id: 'i', invoiceNumber: 'INV', clientId: 'c1', clientName: 'C', clientEmail: 'c@x.test',
  issueDate: '2026-10-05', dueDate: '2026-10-20', lineItems: [], subtotal: 0, taxPercent: 0,
  taxAmount: 0, totalAmount: 100, currency: 'USD', status: 'ISSUED', ...o,
});
const project = (o: Partial<Project>): Project => ({
  id: 'p', reference: 'P', name: 'P', clientId: 'c1', clientName: 'C', serviceCategory: 'WEB_DEVELOPMENT' as Project['serviceCategory'],
  description: '', status: 'IN_PROGRESS', progressPercent: 0, startDate: '2026-01-01', targetCompletionDate: '2026-12-01',
  budgetTotal: 0, budgetSpent: 0, milestones: [], deliverables: [], assignedLead: '', updatedAt: '2026-10-01', ...o,
});

test('retainer usage is null for ad-hoc clients', () => {
  assert.equal(retainerUsage({ monthlyRetainerHours: 0, consumedHoursCurrentMonth: 3 }), null);
  assert.equal(retainerUsage({}), null);
});

test('retainer usage reports hours left and caps the meter when over', () => {
  assert.deepEqual(retainerUsage({ monthlyRetainerHours: 20, consumedHoursCurrentMonth: 5 }),
    { used: 5, allowance: 20, left: 15, percent: 25, overBy: 0 });
  assert.deepEqual(retainerUsage({ monthlyRetainerHours: 10, consumedHoursCurrentMonth: 14 }),
    { used: 14, allowance: 10, left: 0, percent: 100, overBy: 4 });
});

test('client relations keep only the client\'s records and total open invoices per currency', () => {
  const r = clientRelations('c1', [
    project({ id: 'a', updatedAt: '2026-09-01' }),
    project({ id: 'b', updatedAt: '2026-10-01', status: 'COMPLETED' }),
    project({ id: 'x', clientId: 'c2' }),
  ], [
    invoice({ id: '1', totalAmount: 100, status: 'ISSUED' }),
    invoice({ id: '2', totalAmount: 50, status: 'OVERDUE' }),
    invoice({ id: '3', totalAmount: 70, status: 'OVERDUE', currency: 'EUR' }),
    invoice({ id: '4', totalAmount: 999, status: 'PAID' }),
    invoice({ id: '5', totalAmount: 999, status: 'DRAFT' }),
    invoice({ id: '6', clientId: 'c2', totalAmount: 999 }),
  ]);
  assert.deepEqual(r.projects.map(p => p.id), ['b', 'a']);
  assert.equal(r.activeProjectCount, 1);
  assert.equal(r.invoices.length, 5);
  assert.equal(r.overdueCount, 2);
  assert.deepEqual(r.outstanding, { USD: 150, EUR: 70 });
});
