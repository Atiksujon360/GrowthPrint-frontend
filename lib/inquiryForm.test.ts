import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_INQUIRY, toInquiryPayload, validateInquiry, type InquiryFormValues } from './inquiryForm.ts';

const valid: InquiryFormValues = {
  ...EMPTY_INQUIRY, name: ' Ada Lovelace ', businessEmail: 'ada@company.test', company: 'Analytical Ltd',
  service: 'integration', description: 'Connect our CRM to the invoicing system.', consent: true,
};

test('an empty form reports every required field with a clear message', () => {
  const e = validateInquiry(EMPTY_INQUIRY);
  assert.deepEqual(Object.keys(e).sort(), ['businessEmail', 'company', 'consent', 'description', 'name', 'service']);
});

test('limits match the backend contract', () => {
  assert.ok(validateInquiry({ ...valid, name: 'x'.repeat(121) }).name);
  assert.ok(validateInquiry({ ...valid, company: 'x'.repeat(161) }).company);
  assert.ok(validateInquiry({ ...valid, description: 'too short' }).description);
  assert.ok(validateInquiry({ ...valid, description: 'x'.repeat(5001) }).description);
  assert.ok(validateInquiry({ ...valid, businessEmail: 'not-an-email' }).businessEmail);
  assert.deepEqual(validateInquiry(valid), {});
});

test('the payload uses the API enum, carries the exact service name and omits blank optional answers', () => {
  const p = toInquiryPayload(valid);
  assert.equal(p.serviceCategory, 'SOFTWARE_DEV');
  assert.equal(p.projectType, 'API & System Integration');
  assert.equal(p.name, 'Ada Lovelace');
  assert.equal(p.budgetRange, undefined);
  assert.equal(p.preferredTimeline, undefined);
  assert.equal(p.preferredContactMethod, 'EMAIL');
  assert.equal(p.consent, true);
});

test('a discovery call is sent with the backend value DISCOVERY_CALL', () => {
  assert.equal(toInquiryPayload({ ...valid, contact: 'DISCOVERY_CALL' }).preferredContactMethod, 'DISCOVERY_CALL');
});

test('every service maps to a category the backend accepts', () => {
  const allowed = new Set(['SOFTWARE_DEV', 'WEBSITE_MAINTENANCE', 'TECHNICAL_SEO', 'BUSINESS_AUTOMATION', 'AI_INTEGRATION']);
  for (const id of ['websites', 'software', 'automation', 'integration', 'consulting'] as const) {
    assert.ok(allowed.has(toInquiryPayload({ ...valid, service: id }).serviceCategory), id);
  }
});
