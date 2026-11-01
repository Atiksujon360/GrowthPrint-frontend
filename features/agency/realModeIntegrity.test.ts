/**
 * Regression tests for the 2026-11-01 frontend integration audit (batch A).
 * Run without NEXT_PUBLIC_USE_MOCK_API set, i.e. the way a deployment that forgets the variable behaves.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import { ApiClient, ApiError } from '../../lib/api/client.ts';
import { store } from '../../store/index.ts';
import agencyReducer, { submitPublicInquiry } from './agencySlice.ts';
import authReducer from '../auth/authSlice.ts';
import type { AgencyState } from '../../types/agency.ts';

type FakeResponse = { status: number; body: unknown };

/** Replaces global fetch; returns the list of calls made. Restore with the returned function. */
function stubFetch(responses: FakeResponse[]) {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const next = responses[Math.min(calls.length - 1, responses.length - 1)]!;
    return new Response(JSON.stringify(next.body), {
      status: next.status,
      headers: { 'content-type': 'application/json' }
    });
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

// ---- Mock mode must be opt-in -------------------------------------------------------------

test('API client uses the real backend unless mock mode is explicitly enabled', () => {
  assert.equal(process.env.NEXT_PUBLIC_USE_MOCK_API, undefined);
  assert.equal(new ApiClient().getMockMode(), false);
});

test('the store starts without mock data in real-API mode', () => {
  const agency = store.getState().agency;
  assert.equal(agency.clients.length, 0, 'clients');
  assert.equal(agency.projects.length, 0, 'projects');
  assert.equal(agency.invoices.length, 0, 'invoices');
  assert.equal(agency.proposals.length, 0, 'proposals');
  assert.equal(agency.requests.length, 0, 'support requests');
  assert.equal(agency.leads.length, 0, 'leads');
});

// ---- Requests must not be duplicated ------------------------------------------------------

test('a failed POST is not retried (retrying could create duplicate records)', async () => {
  const { calls, restore } = stubFetch([{ status: 503, body: { message: 'unavailable' } }]);
  try {
    const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });
    await assert.rejects(client.post('/support-requests/my', { title: 'x' }, { retryDelayMs: 1 }), ApiError);
    assert.equal(calls.length, 1);
  } finally {
    restore();
  }
});

test('a failed GET is still retried', async () => {
  const { calls, restore } = stubFetch([{ status: 503, body: { message: 'unavailable' } }]);
  try {
    const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });
    await assert.rejects(client.get('/clients', { retryDelayMs: 1 }), ApiError);
    assert.equal(calls.length, 3);
  } finally {
    restore();
  }
});

// ---- Expired sessions -------------------------------------------------------------------------

test('a 401 on an authenticated request notifies the app so it can end the session', async () => {
  const { restore } = stubFetch([{ status: 401, body: { message: 'Authentication required' } }]);
  let notified = 0;
  try {
    const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false, onUnauthorized: () => { notified++; } });
    await assert.rejects(client.get('/invoices/my', { retryDelayMs: 1 }), ApiError);
    assert.equal(notified, 1);
  } finally {
    restore();
  }
});

test('a 401 from the login request itself does not trigger the session-expired handler', async () => {
  const { restore } = stubFetch([{ status: 401, body: { message: 'Invalid credentials' } }]);
  let notified = 0;
  try {
    const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false, onUnauthorized: () => { notified++; } });
    await assert.rejects(client.post('/auth/login', { email: 'a', password: 'b' }, { skipAuth: true }), ApiError);
    assert.equal(notified, 0);
  } finally {
    restore();
  }
});

// ---- Session boundaries ---------------------------------------------------------------------

function storeWithData() {
  const agency = agencyReducer(undefined, { type: 'init' });
  return configureStore({
    reducer: { auth: authReducer, agency: agencyReducer },
    preloadedState: {
      agency: {
        ...agency,
        clients: [{ id: 'c1', name: 'Previous user client' }],
        invoices: [{ id: 'i1', clientId: 'c1' }],
        requests: [{ id: 'r1', clientId: 'c1' }]
      } as unknown as AgencyState
    }
  });
}

test('logging out clears all business data from the store', () => {
  const s = storeWithData();
  s.dispatch({ type: 'auth/logout/fulfilled' });
  assert.equal(s.getState().agency.clients.length, 0);
  assert.equal(s.getState().agency.invoices.length, 0);
  assert.equal(s.getState().agency.requests.length, 0);
});

test('a new login starts from an empty store (no data from the previous user)', () => {
  const s = storeWithData();
  s.dispatch({
    type: 'auth/login/fulfilled',
    payload: { user: { id: 'u2', name: 'b', email: 'b@x.test', role: 'CLIENT' }, token: 't', expiresAt: '' }
  });
  assert.equal(s.getState().agency.clients.length, 0);
  assert.equal(s.getState().agency.invoices.length, 0);
});

test('a duplicate session-validation call does not log the user out', () => {
  const s = configureStore({ reducer: { auth: authReducer } });
  s.dispatch({
    type: 'auth/login/fulfilled',
    payload: { user: { id: 'u1', name: 'a', email: 'a@x.test', role: 'ADMIN' }, token: 't', expiresAt: '' }
  });
  s.dispatch({
    type: 'auth/validateSession/rejected',
    payload: 'Validation already in progress',
    error: { message: 'Rejected' }
  });
  assert.equal(s.getState().auth.isAuthenticated, true);
});

// ---- Public inquiry --------------------------------------------------------------------------

test('public inquiry returns the backend reference number and does not fabricate a CRM lead', async () => {
  const { restore } = stubFetch([{
    status: 201,
    body: { referenceNumber: 'GP-INQ-2026-ABCD1234', status: 'RECEIVED', receivedAt: '2026-11-01T10:00:00Z' }
  }]);
  try {
    const s = configureStore({ reducer: { agency: agencyReducer } });
    const before = s.getState().agency.leads.length;
    const result = await s.dispatch(submitPublicInquiry({
      name: 'Alex Morgan',
      businessEmail: 'alex@acme.test',
      company: 'Acme',
      serviceCategory: 'SOFTWARE_DEV',
      projectType: 'Web platform',
      budgetRange: '',
      preferredTimeline: '',
      projectDescription: 'We need help modernising our order portal.',
      preferredContactMethod: 'EMAIL',
      consent: true
    })).unwrap();

    assert.equal((result as { referenceNumber?: string }).referenceNumber, 'GP-INQ-2026-ABCD1234');
    assert.equal(s.getState().agency.leads.length, before, 'no invented lead in the CRM list');
  } finally {
    restore();
  }
});
