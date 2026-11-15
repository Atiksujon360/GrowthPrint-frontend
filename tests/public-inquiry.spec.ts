import { test, expect } from '@playwright/test';

/**
 * Project inquiry form on the homepage (#start). Updated for the 2026-11-15 homepage redesign: the form is inline
 * instead of a modal. Contract-level checks with a stubbed API are in marketing-home.spec.ts.
 */
test.describe('Public Inquiry Form', () => {
  test('fills the inline form and keeps the values', async ({ page }) => {
    await page.goto('/#start');
    const form = page.locator('#start form');
    await form.getByLabel('Full name').fill('Test User');
    await form.getByLabel('Business email').fill('test-inquiry@example.com');
    await form.getByLabel('Company').fill('Test Company');
    await form.getByLabel('What are you trying to achieve?').fill('This is a test inquiry for E2E testing with sufficient details');
    await form.getByLabel(/I agree that GrowthPrint can store these details/).check();

    await expect(form.getByLabel('Full name')).toHaveValue('Test User');
    await expect(form.getByLabel('Business email')).toHaveValue('test-inquiry@example.com');
    await expect(form.getByLabel('Company')).toHaveValue('Test Company');
  });

  // Writes a real inquiry to the backend's database, so it runs only when GP_E2E_BACKEND_WRITES=1 is set against an
  // isolated test database (never the shared Render database).
  test('should submit inquiry and create lead (requires backend) @backend', async ({ page }) => {
    test.skip(process.env.GP_E2E_BACKEND_WRITES !== '1', 'Set GP_E2E_BACKEND_WRITES=1 with an isolated test database');
    const timestamp = Date.now();
    await page.goto('/#start');
    const form = page.locator('#start form');
    await form.getByLabel('Full name').fill('Test User');
    await form.getByLabel('Business email').fill(`test-inquiry-${timestamp}@example.com`);
    await form.getByLabel('Company').fill(`Test Company ${timestamp}`);
    await form.getByLabel('Service').selectOption({ label: 'Custom Software Development' });
    await form.getByLabel('What are you trying to achieve?').fill('This is a test inquiry for E2E testing with sufficient details');
    await form.getByLabel(/I agree that GrowthPrint can store these details/).check();

    const apiResponsePromise = page.waitForResponse(response => response.url().includes('/public/inquiries') && response.request().method() === 'POST');
    await form.getByRole('button', { name: /Send inquiry/ }).click();
    const response = await apiResponsePromise;
    expect(response.status()).toBe(201);
    const { referenceNumber } = await response.json();
    await expect(page.getByText(referenceNumber)).toBeVisible();
  });
});
