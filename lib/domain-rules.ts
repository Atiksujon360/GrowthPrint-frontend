import type { 
  SupportCategory, 
  SupportRequestStatus, 
  LeadScoreBreakdown, 
  InvoiceLineItem 
} from '../types/agency.ts';
import type { UserRole } from '../types/auth.ts';

/**
 * Decimal-safe round to 2 decimal places to avoid floating point inaccuracies
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates financial support estimate cost
 */
export function calculateEstimateCost(params: {
  hours: number;
  hourlyRate: number;
  emergencyMultiplier?: number;
  discountPercent?: number;
}): { subtotal: number; discount: number; total: number } {
  const { hours, hourlyRate, emergencyMultiplier = 1.0, discountPercent = 0 } = params;
  
  if (hours <= 0 || hourlyRate < 0) {
    return { subtotal: 0, discount: 0, total: 0 };
  }

  const effectiveRate = hourlyRate * emergencyMultiplier;
  const subtotal = roundToTwoDecimals(hours * effectiveRate);
  const clampedDiscountPercent = Math.max(0, Math.min(100, discountPercent));
  const discount = roundToTwoDecimals(subtotal * (clampedDiscountPercent / 100));
  const total = roundToTwoDecimals(subtotal - discount);

  return { subtotal, discount, total };
}

/**
 * Classifies a support request according to contract status
 */
export function classifySupportRequest(params: {
  requestType: 'BUG' | 'CONTENT_UPDATE' | 'NEW_FEATURE' | 'PERFORMANCE' | 'CONSULTING';
  hasActiveRetainer: boolean;
  remainingRetainerHours: number;
  isWithinWarranty: boolean;
}): { category: SupportCategory; billable: boolean; reason: string } {
  const { requestType, hasActiveRetainer, remainingRetainerHours, isWithinWarranty } = params;

  // 1. If covered under defect warranty (e.g. bug on recently delivered project within 30-day warranty)
  if (isWithinWarranty && (requestType === 'BUG' || requestType === 'PERFORMANCE')) {
    return {
      category: 'WARRANTY_OR_DEFECT_REVIEW',
      billable: false,
      reason: 'Covered under project delivery warranty verification.'
    };
  }

  // 2. Substantial new feature requests require separate project scoping regardless of basic maintenance
  if (requestType === 'NEW_FEATURE') {
    return {
      category: 'NEW_PROJECT',
      billable: true,
      reason: 'Requires scoped specification and commercial project proposal.'
    };
  }

  // 3. If client has active retainer with hours remaining (maintenance, bug fixes, updates)
  if (hasActiveRetainer && remainingRetainerHours > 0) {
    return {
      category: 'INCLUDED_SUPPORT',
      billable: false,
      reason: `Covered under monthly maintenance retainer (${remainingRetainerHours}h available).`
    };
  }

  // 4. Default to paid ad-hoc support
  return {
    category: 'PAID_AD_HOC_SUPPORT',
    billable: true,
    reason: 'Ad-hoc technical services billed at standard contract hourly rate.'
  };
}

/**
 * Computes AI lead qualification score and breakdown
 */
export function calculateLeadScore(breakdown: Omit<LeadScoreBreakdown, 'totalScore'>): LeadScoreBreakdown {
  const businessFit = Math.max(0, Math.min(25, breakdown.businessFit));
  const evidenceOfNeed = Math.max(0, Math.min(25, breakdown.evidenceOfNeed));
  const contactability = Math.max(0, Math.min(25, breakdown.contactability));
  const serviceRelevance = Math.max(0, Math.min(25, breakdown.serviceRelevance));

  const totalScore = businessFit + evidenceOfNeed + contactability + serviceRelevance;

  return {
    businessFit,
    evidenceOfNeed,
    contactability,
    serviceRelevance,
    totalScore
  };
}

/**
 * Validates allowable state transitions for support requests
 */
export function canTransitionRequestStatus(
  current: SupportRequestStatus,
  target: SupportRequestStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  if (current === target) return { allowed: true };

  // Clients can only approve/decline estimates or close when waiting for client
  if (role === 'CLIENT') {
    if (current === 'AWAITING_CLIENT_APPROVAL' && target === 'READY_TO_START') {
      return { allowed: true };
    }
    if (current === 'WAITING_FOR_CLIENT' && target === 'IN_PROGRESS') {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: 'Clients cannot arbitrarily modify internal agency operational states.' 
    };
  }

  // Admin state transition rules
  const validAdminTransitions: Record<SupportRequestStatus, SupportRequestStatus[]> = {
    NEW: ['NEEDS_CLASSIFICATION', 'ESTIMATE_PENDING', 'READY_TO_START'],
    NEEDS_CLASSIFICATION: ['ESTIMATE_PENDING', 'READY_TO_START', 'IN_PROGRESS'],
    ESTIMATE_PENDING: ['AWAITING_CLIENT_APPROVAL', 'READY_TO_START'],
    AWAITING_CLIENT_APPROVAL: ['READY_TO_START', 'COMPLETED'],
    READY_TO_START: ['IN_PROGRESS'],
    IN_PROGRESS: ['WAITING_FOR_CLIENT', 'COMPLETED'],
    WAITING_FOR_CLIENT: ['IN_PROGRESS', 'COMPLETED'],
    COMPLETED: ['IN_PROGRESS'] // Re-opening if necessary
  };

  const allowedTargets = validAdminTransitions[current] || [];
  if (allowedTargets.includes(target)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid transition from ${current} to ${target}.`
  };
}

/**
 * Calculates invoice subtotal, tax, and total
 */
export function calculateInvoiceTotals(
  items: InvoiceLineItem[],
  taxPercent: number
): { subtotal: number; taxAmount: number; totalAmount: number } {
  const subtotal = roundToTwoDecimals(
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  );
  const taxAmount = roundToTwoDecimals(subtotal * (Math.max(0, taxPercent) / 100));
  const totalAmount = roundToTwoDecimals(subtotal + taxAmount);

  return { subtotal, taxAmount, totalAmount };
}
