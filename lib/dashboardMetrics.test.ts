import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCashFlowSeries, countPipeline, countActiveClients, countRetainerClients } from './dashboardMetrics.ts';
import type { Invoice, Lead, Client } from '../types/agency.ts';

const invoice = (overrides: Partial<Invoice>): Invoice => ({
  id: 'i', invoiceNumber: 'INV', clientId: 'c', clientName: 'C', clientEmail: 'c@x.test',
  issueDate: '2026-10-05', dueDate: '2026-10-20', lineItems: [], subtotal: 0, taxPercent: 0,
  taxAmount: 0, totalAmount: 100, currency: 'USD', status: 'ISSUED', ...overrides
});

test('cash flow is computed from real invoices only (no hard-coded history)', () => {
  const series = buildCashFlowSeries([
    invoice({ issueDate: '2026-09-10', status: 'PAID', paidAt: '2026-10-02T09:00:00Z', totalAmount: 500 }),
    invoice({ issueDate: '2026-10-05', status: 'ISSUED', totalAmount: 250 }),
    invoice({ issueDate: '2026-10-06', status: 'DRAFT', totalAmount: 999 }),
    invoice({ issueDate: '2026-10-07', status: 'VOID', totalAmount: 999 })
  ], new Date('2026-10-15T00:00:00Z'));

  assert.deepEqual(series.map(p => p.month), ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026']);
  assert.deepEqual(series.map(p => p.invoiced), [0, 0, 500, 250]);
  assert.deepEqual(series.map(p => p.collected), [0, 0, 0, 500]);
});

test('with no invoices every month is zero', () => {
  const series = buildCashFlowSeries([], new Date('2026-11-01T00:00:00Z'));
  assert.ok(series.every(p => p.collected === 0 && p.invoiced === 0));
});

test('pipeline and client figures are counts, not invented currency estimates', () => {
  const leads = [
    { qualificationScore: 85, pipelineStage: 'QUALIFIED' },
    { qualificationScore: 90, pipelineStage: 'WON' },
    { qualificationScore: 40, pipelineStage: 'DISCOVERED' }
  ] as Lead[];
  assert.deepEqual(countPipeline(leads), { qualified: 2, open: 2 });

  const clients = [
    { status: 'ACTIVE', retainerTier: 'PRO_GROWTH' },
    { status: 'INVITED', retainerTier: 'NONE' },
    { status: 'ACTIVE' }
  ] as Client[];
  assert.equal(countActiveClients(clients), 2);
  assert.equal(countRetainerClients(clients), 1);
});

import {
  countActiveProjects, projectsByTargetMonth, milestoneCounts, milestonePerformance, acceptedValueByService,
  countBy, newLeadsThisAndLastMonth,
} from './dashboardMetrics.ts';
import type { Project, Proposal } from '../types/agency.ts';

const NOW = new Date('2026-11-09T10:00:00Z');
const project = (over: Partial<Project>): Project => ({
  id: 'p', reference: 'R', name: 'P', clientId: 'c', clientName: 'C', serviceCategory: 'SOFTWARE_DEV', description: '',
  status: 'IN_PROGRESS', progressPercent: 0, startDate: '2026-01-01', targetCompletionDate: '2026-11-20', budgetTotal: 0,
  budgetSpent: 0, milestones: [], deliverables: [], assignedLead: '', updatedAt: '2026-11-01', ...over,
} as Project);

test('active projects count in-progress, waiting and in-review only', () => {
  assert.equal(countActiveProjects([project({}), project({ status: 'WAITING_FOR_CLIENT' }), project({ status: 'COMPLETED' }), project({ status: 'PLANNED' })]), 2);
});

test('projects by target month covers 3 months back to 2 ahead', () => {
  const series = projectsByTargetMonth([project({ targetCompletionDate: '2026-11-20' }), project({ targetCompletionDate: '2026-08-02' }), project({ targetCompletionDate: '2025-01-01' })], NOW);
  assert.deepEqual(series.map(s => s.label), ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']);
  assert.deepEqual(series.map(s => s.value), [1, 0, 0, 1, 0, 0]);
});

test('milestone counts and monthly performance', () => {
  const p = project({ milestones: [
    { id: '1', title: 'a', dueDate: '2026-11-01', status: 'PENDING' },
    { id: '2', title: 'b', dueDate: '2026-11-30', status: 'IN_PROGRESS' },
    { id: '3', title: 'c', dueDate: '2026-10-05', status: 'COMPLETED' },
  ] });
  assert.deepEqual(milestoneCounts([p], NOW), { open: 2, overdue: 1, total: 3 });
  const perf = milestonePerformance([p], NOW);
  assert.deepEqual(perf.find(m => m.label === 'Oct'), { label: 'Oct', a: 1, b: 0 });
  assert.deepEqual(perf.find(m => m.label === 'Nov'), { label: 'Nov', a: 0, b: 2 });
});

test('accepted proposal value groups by service and ignores other statuses', () => {
  const pr = (status: string, serviceCategory: string, totalPrice: number) => ({ status, serviceCategory, totalPrice } as unknown as Proposal);
  assert.deepEqual(acceptedValueByService([pr('ACCEPTED', 'SOFTWARE_DEV', 100), pr('ACCEPTED', 'SOFTWARE_DEV', 50), pr('DRAFT', 'AI_INTEGRATION', 999), pr('ACCEPTED', 'TECHNICAL_SEO', 20)]),
    [{ label: 'SOFTWARE_DEV', value: 150 }, { label: 'TECHNICAL_SEO', value: 20 }]);
});

test('countBy and new leads this vs last month', () => {
  const leads = [{ source: 'REFERRAL', createdAt: '2026-11-02' }, { source: 'REFERRAL', createdAt: '2026-10-30' }, { source: 'INBOUND_INQUIRY', discoveredDate: '2026-11-05' }] as unknown as Lead[];
  assert.deepEqual(countBy(leads, l => l.source), [{ label: 'REFERRAL', value: 2 }, { label: 'INBOUND_INQUIRY', value: 1 }]);
  assert.deepEqual(newLeadsThisAndLastMonth(leads, NOW), { thisMonth: 2, lastMonth: 1 });
});
