import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, totalsByCurrency, isValidPaymentAmount } from './money.ts';

test('amounts are formatted in their own currency (no "$1,210 EUR")', () => {
  assert.equal(formatMoney(1210, 'EUR'), '€1,210.00');
  assert.equal(formatMoney(99.5, 'USD'), '$99.50');
});

test('outstanding totals are kept per currency instead of being summed into "USD"', () => {
  const totals = totalsByCurrency(
    [{ currency: 'USD', totalAmount: 100.1 }, { currency: 'EUR', totalAmount: 50 }, { currency: 'USD', totalAmount: 0.2 }],
    i => i.totalAmount
  );
  assert.deepEqual(totals, { USD: 100.3, EUR: 50 });
});

test('payment amounts must be positive with at most two decimals', () => {
  assert.equal(isValidPaymentAmount('1210'), true);
  assert.equal(isValidPaymentAmount('1210.50'), true);
  assert.equal(isValidPaymentAmount('0'), false);
  assert.equal(isValidPaymentAmount('-5'), false);
  assert.equal(isValidPaymentAmount('10.005'), false);
  assert.equal(isValidPaymentAmount('abc'), false);
});
