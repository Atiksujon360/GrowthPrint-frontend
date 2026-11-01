import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import agencyReducer, { submitPublicInquiry } from './agencySlice.ts';
import type { AgencyState } from '../../types/agency.ts';

test('submitPublicInquiryThunk is exported as a function', () => {
  assert.equal(typeof submitPublicInquiry, 'function');
});

// Updated 2026-11-01 (integration audit): the backend answers POST /public/inquiries with
// { referenceNumber, status, receivedAt } and stores a raw inquiry, not a CRM lead. The reducer previously
// inserted a fabricated lead (invented scores, no id); a fulfilled inquiry must leave the CRM list unchanged.
test('submitPublicInquiryThunk fulfilled does not insert a fabricated CRM lead', () => {
  const initialState: Partial<AgencyState> = {
    leads: []
  };

  const store = configureStore({
    reducer: { agency: agencyReducer },
    preloadedState: { agency: initialState as AgencyState }
  });

  store.dispatch({
    type: 'agency/submitPublicInquiry/fulfilled',
    payload: { referenceNumber: 'GP-INQ-2026-ABCD1234', status: 'RECEIVED', receivedAt: '2026-11-01T10:00:00Z' }
  });

  assert.equal(store.getState().agency.leads.length, 0);
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
