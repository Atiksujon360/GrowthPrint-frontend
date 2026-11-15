import { SERVICES, type ServiceId } from '../components/marketing/content.ts';

/**
 * Project inquiry form rules, mirroring POST /api/v1/public/inquiries (PublicInquiryRequest):
 * name 1–120, businessEmail valid and ≤254, company 1–160, serviceCategory one of the five LeadEnums values,
 * projectType 1–160, budgetRange and preferredTimeline optional ≤120, projectDescription 15–5000,
 * preferredContactMethod EMAIL | PHONE | DISCOVERY_CALL, consent true.
 */
export interface InquiryFormValues {
  name: string;
  businessEmail: string;
  company: string;
  service: ServiceId | '';
  budgetRange: string;
  timeline: string;
  description: string;
  contact: 'EMAIL' | 'DISCOVERY_CALL';
  consent: boolean;
}

export type InquiryErrors = Partial<Record<keyof InquiryFormValues, string>>;

export const EMPTY_INQUIRY: InquiryFormValues = {
  name: '', businessEmail: '', company: '', service: '', budgetRange: '', timeline: '', description: '', contact: 'EMAIL', consent: false,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiry(v: InquiryFormValues): InquiryErrors {
  const e: InquiryErrors = {};
  const name = v.name.trim(), email = v.businessEmail.trim(), company = v.company.trim(), description = v.description.trim();
  if (!name) e.name = 'Enter your name.';
  else if (name.length > 120) e.name = 'Use 120 characters or fewer.';
  if (!email) e.businessEmail = 'Enter your business email.';
  else if (!EMAIL.test(email) || email.length > 254) e.businessEmail = 'Enter an email address like name@company.com.';
  if (!company) e.company = 'Enter your company name.';
  else if (company.length > 160) e.company = 'Use 160 characters or fewer.';
  if (!v.service) e.service = 'Choose the service closest to what you need.';
  if (description.length < 15) e.description = 'Tell us a little more: at least 15 characters.';
  else if (description.length > 5000) e.description = 'Keep it under 5,000 characters.';
  if (!v.consent) e.consent = 'Please agree so we can review your details and reply.';
  return e;
}

/** The request body for the API. Optional answers left blank are omitted, never filled with defaults. */
export function toInquiryPayload(v: InquiryFormValues) {
  const service = SERVICES.find(s => s.id === v.service);
  if (!service) throw new Error('A service must be chosen before submitting.');
  return {
    name: v.name.trim(),
    businessEmail: v.businessEmail.trim(),
    company: v.company.trim(),
    serviceCategory: service.category,
    projectType: service.title,
    budgetRange: v.budgetRange.trim() || undefined,
    preferredTimeline: v.timeline.trim() || undefined,
    projectDescription: v.description.trim(),
    preferredContactMethod: v.contact,
    consent: v.consent,
  };
}
