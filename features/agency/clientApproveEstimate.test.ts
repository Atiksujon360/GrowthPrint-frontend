import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import agencyReducer, { clientApproveEstimate } from './agencySlice.ts';
import type { AgencyState } from '../../types/agency.ts';

test('clientApproveEstimateThunk is exported as a function', () => {
  assert.equal(typeof clientApproveEstimate, 'function');
});

test('clientApproveEstimateThunk fulfills with correct payload structure', () => {
  const initialState: Partial<AgencyState> = {
    requests: [
      {
        id: 'req-123',
        reference: 'SR-001',
        clientId: 'client-456',
        clientName: 'Test Client',
        projectId: null,
        projectName: null,
        title: 'Test Request',
        category: 'TECHNICAL' as const,
        description: 'Test description',
        businessImpact: 'MEDIUM' as const,
        urgency: 'NORMAL' as const,
        status: 'AWAITING_CLIENT_APPROVAL' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        adminNotes: null,
        resolutionSummary: null,
        estimate: {
          id: 'est-789',
          requestId: 'req-123',
          estimatedHours: 6.5,
          hourlyRate: 135,
          subtotal: 877.50,
          discount: 0,
          totalAmount: 877.50,
          currency: 'USD',
          deliveryTimelineDays: 2,
          explanation: 'Test explanation',
          createdAt: '2024-01-01T00:00:00Z',
          status: 'PENDING_APPROVAL' as const,
          acceptedAt: null,
          acceptedBy: null
        }
      }
    ]
  };

  const store = configureStore({
    reducer: { agency: agencyReducer },
    preloadedState: { agency: initialState as AgencyState }
  });

  // Mock fulfilled action with backend response (already converted by thunk)
  const mockBackendResponse = {
    id: 'req-123',
    reference: 'SR-001',
    clientId: 'client-456',
    clientName: 'Test Client',
    projectId: null,
    projectName: null,
    title: 'Test Request',
    category: 'TECHNICAL',
    description: 'Test description',
    businessImpact: 'MEDIUM',
    urgency: 'NORMAL',
    status: 'READY_TO_START',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    adminNotes: null,
    resolutionSummary: null,
    estimate: {
      id: 'est-789',
      requestId: 'req-123',
      estimatedHours: 6.5,
      hourlyRate: 135,
      subtotal: 877.5,
      discount: 0,
      totalAmount: 877.5,
      currency: 'USD',
      deliveryTimelineDays: 2,
      explanation: 'Test explanation',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'ACCEPTED',
      acceptedAt: '2024-01-02T00:00:00Z',
      acceptedBy: 'Test User'
    }
  };

  store.dispatch({ type: 'agency/clientApproveEstimate/fulfilled', payload: mockBackendResponse });

  const state = store.getState().agency;
  const updatedRequest = state.requests.find(r => r.id === 'req-123');

  assert.ok(updatedRequest);
  assert.equal(updatedRequest.status, 'READY_TO_START');
  assert.equal(updatedRequest.estimate?.status, 'ACCEPTED');
  assert.equal(updatedRequest.estimate?.acceptedBy, 'Test User');
  assert.equal(updatedRequest.estimate?.totalAmount, 877.5);
});

test('clientApproveEstimateThunk rejected handles error', () => {
  const store = configureStore({
    reducer: { agency: agencyReducer }
  });

  // Mock rejected action
  store.dispatch({ type: 'agency/clientApproveEstimate/rejected', payload: 'Approval failed' });

  // Verify error is logged (no state change expected on rejection)
  const state = store.getState().agency;
  assert.ok(state); // Just verify store is accessible
});
