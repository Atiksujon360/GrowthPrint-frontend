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
