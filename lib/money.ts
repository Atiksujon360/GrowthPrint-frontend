/**
 * Money display helpers. Amounts are always shown in their own currency: invoices may be in USD, EUR,
 * GBP, CAD or AUD, so totals are never summed across currencies.
 */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    // Unknown currency code: still show the number and the code rather than failing.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Sums amounts per currency, e.g. { USD: 1200, EUR: 300 }. */
export function totalsByCurrency<T extends { currency: string }>(items: readonly T[], amountOf: (item: T) => number): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    totals[item.currency] = Math.round(((totals[item.currency] ?? 0) + amountOf(item)) * 100) / 100;
  }
  return totals;
}

/** True for a positive amount with at most two decimal places (the backend rule for payments). */
export function isValidPaymentAmount(value: string): boolean {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;
  return Number(value) > 0;
}
