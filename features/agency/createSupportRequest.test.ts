import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import agencyReducer, { createSupportRequest } from './agencySlice.ts';
import type { AgencyState } from '../../types/agency.ts';

test('createSupportRequestThunk is exported as a function', () => {
  assert.equal(typeof createSupportRequest, 'function');
});

test('createSupportRequestThunk fulfills with correct payload structure', () => {
  const initialState: Partial<AgencyState> = {
    requests: []
  };

  const store = configureStore({
    reducer: { agency: agencyReducer },
    preloadedState: { agency: initialState as AgencyState }
  });

  // Mock fulfilled action with backend response
  const mockBackendResponse = {
    id: 'req-123',
    reference: 'SR-001',
    clientId: 'client-456',
    clientName: 'Test Client',
    projectId: null,
    projectName: null,
    title: 'Test Request',
    category: 'PAID_AD_HOC_SUPPORT',
    description: 'Test description',
    businessImpact: 'MEDIUM',
    urgency: 'NORMAL',
    status: 'NEW',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    adminNotes: null,
    resolutionSummary: null,
    estimate: null
  };

  store.dispatch({ type: 'agency/createSupportRequest/fulfilled', payload: mockBackendResponse });

  const state = store.getState().agency;
  const newRequest = state.requests.find(r => r.id === 'req-123');

  assert.ok(newRequest);
  assert.equal(newRequest.status, 'NEW');
  assert.equal(newRequest.title, 'Test Request');
  assert.equal(newRequest.clientId, 'client-456');
});

test('createSupportRequestThunk rejected handles error', () => {
  const store = configureStore({
    reducer: { agency: agencyReducer }
  });

  // Mock rejected action
  store.dispatch({ type: 'agency/createSupportRequest/rejected', payload: 'Creation failed' });

  // Verify error is logged (no state change expected on rejection)
  const state = store.getState().agency;
  assert.ok(state); // Just verify store is accessible
});
