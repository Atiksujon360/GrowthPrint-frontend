/**
 * Display labels for backend codes. The backend sends upper snake case (PAID_AD_HOC_SUPPORT); screens show sentence
 * case ("Paid ad hoc support"). Display only: the codes themselves are never changed or sent back from here.
 */
const ACRONYMS = new Set(['AI', 'SEO', 'API', 'SLA', 'CRM', 'USD', 'EUR', 'GBP', 'CSV', 'PDF', 'URL', 'ID']);

const OVERRIDES: Record<string, string> = {
  NONE: 'None',
  SOFTWARE_DEV: 'Software development',
  PRO_GROWTH: 'Pro growth',
  CRITICAL_BLOCKER: 'Critical blocker',
  DO_NOT_CONTACT: 'Do not contact',
};

export function humanizeCode(code: string | null | undefined): string {
  if (!code) return '';
  if (OVERRIDES[code]) return OVERRIDES[code];
  if (!/^[A-Z0-9_]+$/.test(code)) return code; // already human text
  return code
    .split('_')
    .filter(Boolean)
    .map((word, i) => (ACRONYMS.has(word) ? word : i === 0 ? word.charAt(0) + word.slice(1).toLowerCase() : word.toLowerCase()))
    .join(' ');
}
