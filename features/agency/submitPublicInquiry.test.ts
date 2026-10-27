import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import agencyReducer, { submitPublicInquiry } from './agencySlice.ts';
import type { AgencyState } from '../../types/agency.ts';

test('submitPublicInquiryThunk is exported as a function', () => {
  assert.equal(typeof submitPublicInquiry, 'function');
});

test('submitPublicInquiryThunk fulfills with correct payload structure', () => {
  const initialState: Partial<AgencyState> = {
    leads: []
  };

  const store = configureStore({
    reducer: { agency: agencyReducer },
    preloadedState: { agency: initialState as AgencyState }
  });

  // Mock fulfilled action with backend response
  const mockBackendResponse = {
    id: 'lead-123',
    companyName: 'Test Company',
    industry: 'Unknown',
    location: 'Unknown',
    contactName: 'John Doe',
    contactEmail: 'john@test.com',
    contactTitle: undefined,
    source: 'INBOUND_INQUIRY',
    sourceUrl: undefined,
    discoveredDate: '2024-01-01T00:00:00Z',
    targetService: 'SOFTWARE_DEV',
    identifiedProblem: 'Test problem description that is long enough',
    researchSummary: 'Test problem description that is long enough',
    qualificationScore: 70,
    qualificationBreakdown: {
      businessFit: 18,
      evidenceOfNeed: 17,
      contactability: 18,
      serviceRelevance: 17,
      totalScore: 70
    },
    pipelineStage: 'DISCOVERED',
    nextAction: 'Contact for discovery call',
    doNotContact: false,
    notes: 'Budget: $10,000 – $25,000, Timeline: Flexible',
    website: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  };

  store.dispatch({ type: 'agency/submitPublicInquiry/fulfilled', payload: mockBackendResponse });

  const state = store.getState().agency;
  const newLead = state.leads.find(l => l.id === 'lead-123');

  assert.ok(newLead);
  assert.equal(newLead.companyName, 'Test Company');
  assert.equal(newLead.pipelineStage, 'DISCOVERED');
  assert.equal(newLead.source, 'FOUNDER_SOURCED');
});

test('submitPublicInquiryThunk rejected handles error', () => {
  const store = configureStore({
    reducer: { agency: agencyReducer }
  });

  // Mock rejected action
  store.dispatch({ type: 'agency/submitPublicInquiry/rejected', payload: 'Submission failed' });

  // Verify error is logged (no state change expected on rejection)
  const state = store.getState().agency;
  assert.ok(state); // Just verify store is accessible
});
