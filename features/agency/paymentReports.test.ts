/**
 * Client payment reporting and admin verification (backend contract of 2026-11-01).
 * A client may only REPORT a payment; only an admin's verification marks an invoice paid.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import agencyReducer, {
  reportInvoicePayment,
  fetchMyPaymentReports,
  verifyPaymentReport,
  rejectPaymentReport
} from './agencySlice.ts';
import type { AgencyState } from '../../types/agency.ts';

type Call = { url: string; method: string; body: unknown };

function stubFetch(status: number, body: unknown) {
  const original = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

const report = (overrides: Record<string, unknown> = {}) => ({
  id: 'r1', invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0001', invoiceStatus: 'ISSUED', clientId: 'c1',
  amount: 1210, currency: 'EUR', paymentMethod: 'BANK_TRANSFER', reference: 'ACH-123', paidOn: '2026-11-01',
  note: null, status: 'PENDING', reportedByUserId: 'u1', reportedAt: '2026-11-01T10:00:00Z',
  reviewedAt: null, reviewNote: null, ...overrides
});

function storeWithInvoice() {
  const base = agencyReducer(undefined, { type: 'init' });
  return configureStore({
    reducer: { agency: agencyReducer },
    preloadedState: {
      agency: { ...base, invoices: [{ id: 'inv-1', status: 'ISSUED' }] } as unknown as AgencyState
    }
  });
}

test('a client payment report goes to the client endpoint and never to the admin "mark paid" endpoint', async () => {
  const { calls, restore } = stubFetch(201, report());
  try {
    const s = storeWithInvoice();
    await s.dispatch(reportInvoicePayment({
      invoiceId: 'inv-1',
      amount: 1210,
      paymentMethod: 'BANK_TRANSFER',
      reference: 'ACH-123',
      paidOn: '2026-11-01'
    })).unwrap();

    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.method, 'POST');
    assert.match(calls[0]!.url, /\/invoices\/my\/inv-1\/reconcile$/);
    assert.deepEqual(calls[0]!.body, { amount: 1210, paymentMethod: 'BANK_TRANSFER', reference: 'ACH-123', paidOn: '2026-11-01' });
  } finally {
    restore();
  }
});

test('reporting a payment records a PENDING report and leaves the invoice unpaid', async () => {
  const { restore } = stubFetch(201, report());
  try {
    const s = storeWithInvoice();
    await s.dispatch(reportInvoicePayment({ invoiceId: 'inv-1', amount: 1210, paymentMethod: 'BANK_TRANSFER', paidOn: '2026-11-01' })).unwrap();

    const state = s.getState().agency;
    assert.equal(state.paymentReports['inv-1']?.[0]?.status, 'PENDING');
    assert.equal(state.invoices[0]!.status, 'ISSUED');
  } finally {
    restore();
  }
});

test('a client sees the reports for their own invoice', async () => {
  const { calls, restore } = stubFetch(200, [report(), report({ id: 'r0', status: 'REJECTED' })]);
  try {
    const s = storeWithInvoice();
    await s.dispatch(fetchMyPaymentReports('inv-1')).unwrap();
    assert.match(calls[0]!.url, /\/invoices\/my\/inv-1\/payment-reports$/);
    assert.equal(s.getState().agency.paymentReports['inv-1']?.length, 2);
  } finally {
    restore();
  }
});

test('admin verification uses the admin endpoint and marks the invoice paid from the server response', async () => {
  const { calls, restore } = stubFetch(200, report({ status: 'VERIFIED', invoiceStatus: 'PAID', reviewedAt: '2026-11-02T09:00:00Z' }));
  try {
    const s = storeWithInvoice();
    await s.dispatch(verifyPaymentReport({ reportId: 'r1', note: 'Funds received' })).unwrap();

    assert.match(calls[0]!.url, /\/invoices\/payment-reports\/r1\/verify$/);
    assert.equal(s.getState().agency.invoices[0]!.status, 'PAID');
    assert.equal(s.getState().agency.paymentReports['inv-1']?.[0]?.status, 'VERIFIED');
  } finally {
    restore();
  }
});

test('rejecting a report requires a note and keeps the invoice unpaid', async () => {
  const s = storeWithInvoice();
  await assert.rejects(s.dispatch(rejectPaymentReport({ reportId: 'r1', note: '   ' })).unwrap());

  const { calls, restore } = stubFetch(200, report({ status: 'REJECTED', reviewNote: 'Not received' }));
  try {
    await s.dispatch(rejectPaymentReport({ reportId: 'r1', note: 'Not received' })).unwrap();
    assert.match(calls[0]!.url, /\/invoices\/payment-reports\/r1\/reject$/);
    assert.equal(s.getState().agency.invoices[0]!.status, 'ISSUED');
  } finally {
    restore();
  }
});
