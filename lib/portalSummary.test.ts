import test from 'node:test';
import assert from 'node:assert/strict';
import { portalSummary } from './portalSummary.ts';
import type { Invoice, Project } from '../types/agency.ts';

const project = (status: string, milestones: Array<{ status: string; dueDate: string }> = []) =>
  ({ status, milestones: milestones.map((m, i) => ({ id: String(i), title: 't', ...m })) }) as unknown as Project;
const invoice = (status: string, totalAmount: number, currency = 'USD') => ({ status, totalAmount, currency }) as Invoice;

test('a new client with no data sees honest empty statements, not invented figures', () => {
  assert.deepEqual(portalSummary([], [], '2026-11-16'), {
    activeProjects: 0, projectsNote: 'No active projects', unpaidInvoices: 0, invoicesNote: 'Nothing to pay',
  });
});

test('completed projects are not counted as active, and overdue milestones are counted', () => {
  const s = portalSummary([
    project('IN_PROGRESS', [{ status: 'PENDING', dueDate: '2026-11-01' }, { status: 'COMPLETED', dueDate: '2026-10-01' }]),
    project('COMPLETED', [{ status: 'PENDING', dueDate: '2020-01-01' }]),
  ], [], '2026-11-16');
  assert.equal(s.activeProjects, 1);
  assert.equal(s.projectsNote, '1 milestone overdue');
});

test('unpaid includes overdue invoices, and amounts are never added across currencies', () => {
  const s = portalSummary([], [invoice('ISSUED', 100), invoice('OVERDUE', 50), invoice('OVERDUE', 70, 'EUR'), invoice('PAID', 999), invoice('DRAFT', 5)], '2026-11-16');
  assert.equal(s.unpaidInvoices, 3);
  assert.equal(s.invoicesNote, '2 overdue, $150.00 + €70.00 in total');
  assert.equal(portalSummary([], [invoice('ISSUED', 810)], '2026-11-16').invoicesNote, '$810.00 due');
});
