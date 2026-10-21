import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateEstimateCost, 
  classifySupportRequest, 
  calculateLeadScore, 
  canTransitionRequestStatus,
  calculateInvoiceTotals
} from './domain-rules.ts';

test('calculateEstimateCost computes accurate decimal totals without floating point drift', () => {
  const result = calculateEstimateCost({
    hours: 8.5,
    hourlyRate: 125,
    discountPercent: 10
  });

  // 8.5 * 125 = 1062.50
  // discount 10% = 106.25
  // total = 956.25
  assert.equal(result.subtotal, 1062.50);
  assert.equal(result.discount, 106.25);
  assert.equal(result.total, 956.25);
});

test('calculateEstimateCost with emergency multiplier', () => {
  const result = calculateEstimateCost({
    hours: 4,
    hourlyRate: 150,
    emergencyMultiplier: 1.5,
    discountPercent: 0
  });

  // 4 * (150 * 1.5) = 4 * 225 = 900
  assert.equal(result.total, 900);
});

test('classifySupportRequest identifies warranty coverage for bug fixes', () => {
  const classification = classifySupportRequest({
    requestType: 'BUG',
    hasActiveRetainer: false,
    remainingRetainerHours: 0,
    isWithinWarranty: true
  });

  assert.equal(classification.category, 'WARRANTY_OR_DEFECT_REVIEW');
  assert.equal(classification.billable, false);
});

test('classifySupportRequest honors active monthly retainer hours', () => {
  const classification = classifySupportRequest({
    requestType: 'CONTENT_UPDATE',
    hasActiveRetainer: true,
    remainingRetainerHours: 12,
    isWithinWarranty: false
  });

  assert.equal(classification.category, 'INCLUDED_SUPPORT');
  assert.equal(classification.billable, false);
});

test('classifySupportRequest routes new feature requests to new project scope', () => {
  const classification = classifySupportRequest({
    requestType: 'NEW_FEATURE',
    hasActiveRetainer: true,
    remainingRetainerHours: 10,
    isWithinWarranty: false
  });

  assert.equal(classification.category, 'NEW_PROJECT');
  assert.equal(classification.billable, true);
});

test('classifySupportRequest defaults to paid ad-hoc when out of retainer hours', () => {
  const classification = classifySupportRequest({
    requestType: 'PERFORMANCE',
    hasActiveRetainer: true,
    remainingRetainerHours: 0,
    isWithinWarranty: false
  });

  assert.equal(classification.category, 'PAID_AD_HOC_SUPPORT');
  assert.equal(classification.billable, true);
});

test('calculateLeadScore clamps values between 0-25 per category and sums accurately', () => {
  const score = calculateLeadScore({
    businessFit: 24,
    evidenceOfNeed: 22,
    contactability: 20,
    serviceRelevance: 25
  });

  assert.equal(score.totalScore, 91);
  assert.equal(score.businessFit, 24);

  // Test over-range clamping
  const clamped = calculateLeadScore({
    businessFit: 40,
    evidenceOfNeed: 30,
    contactability: 10,
    serviceRelevance: -5
  });

  assert.equal(clamped.businessFit, 25);
  assert.equal(clamped.evidenceOfNeed, 25);
  assert.equal(clamped.serviceRelevance, 0);
  assert.equal(clamped.totalScore, 60);
});

test('canTransitionRequestStatus enforces role restrictions on clients', () => {
  // Client cannot jump from NEW to IN_PROGRESS directly
  const clientIllegal = canTransitionRequestStatus('NEW', 'IN_PROGRESS', 'CLIENT');
  assert.equal(clientIllegal.allowed, false);

  // Client CAN approve estimate (AWAITING_CLIENT_APPROVAL -> READY_TO_START)
  const clientApproval = canTransitionRequestStatus('AWAITING_CLIENT_APPROVAL', 'READY_TO_START', 'CLIENT');
  assert.equal(clientApproval.allowed, true);

  // Admin CAN transition NEW -> NEEDS_CLASSIFICATION
  const adminAllowed = canTransitionRequestStatus('NEW', 'NEEDS_CLASSIFICATION', 'ADMIN');
  assert.equal(adminAllowed.allowed, true);
});

test('calculateInvoiceTotals computes subtotal, tax amount, and total with accuracy', () => {
  const items = [
    { id: '1', description: 'Web Architecture Sprint', quantity: 1, unitPrice: 3200, amount: 3200 },
    { id: '2', description: 'API Integration Testing', quantity: 10, unitPrice: 150, amount: 1500 }
  ];
  // subtotal = 4700
  // tax 8% = 376
  // total = 5076
  const totals = calculateInvoiceTotals(items, 8);
  assert.equal(totals.subtotal, 4700);
  assert.equal(totals.taxAmount, 376);
  assert.equal(totals.totalAmount, 5076);
});
