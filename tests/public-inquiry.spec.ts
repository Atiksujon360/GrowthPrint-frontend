import { test, expect } from '@playwright/test';

test.describe('Public Inquiry Form', () => {
  test('should open modal and fill form', async ({ page }) => {
    // Generate unique test data to avoid collisions
    const timestamp = Date.now();
    const testEmail = `test-inquiry-${timestamp}@example.com`;
    const testCompany = `Test Company ${timestamp}`;

    // Navigate to public home page
    await page.goto('/');

    // Click "Tell us what you need" button in header to open inquiry modal
    await page.getByRole('banner').getByRole('button', { name: /tell us what you need/i }).click();

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill out inquiry form using container-based selectors
    const modal = page.getByRole('dialog');
    await modal.getByPlaceholder(/alex morgan/i).fill('Test User');
    await modal.getByPlaceholder(/alex@company.com/i).fill(testEmail);
    await modal.getByPlaceholder(/acme logistics ltd/i).fill(testCompany);
    await modal.getByPlaceholder(/tell us what is happening today/i).fill('This is a test inquiry for E2E testing with sufficient details');

    // Check consent checkbox
    await modal.getByLabel(/i agree that growthprint can review these details/i).check();

    // Verify form is filled (check that values are present)
    await expect(modal.getByPlaceholder(/alex morgan/i)).toHaveValue('Test User');
    await expect(modal.getByPlaceholder(/alex@company.com/i)).toHaveValue(testEmail);
    await expect(modal.getByPlaceholder(/acme logistics ltd/i)).toHaveValue(testCompany);

    // Close modal using Cancel button
    await modal.getByRole('button', { name: /cancel/i }).click();

    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  // Writes a real inquiry to the backend's database, so it runs only when GP_E2E_BACKEND_WRITES=1 is set against an
  // isolated test database (never the shared Render database).
  test('should submit inquiry and create lead (requires backend)', async ({ page }) => {
    test.skip(process.env.GP_E2E_BACKEND_WRITES !== '1', 'Set GP_E2E_BACKEND_WRITES=1 with an isolated test database');
    // Generate unique test data to avoid collisions
    const timestamp = Date.now();
    const testEmail = `test-inquiry-${timestamp}@example.com`;
    const testCompany = `Test Company ${timestamp}`;

    // Navigate to public home page
    await page.goto('/');

    // Click "Tell us what you need" button in header to open inquiry modal
    await page.getByRole('banner').getByRole('button', { name: /tell us what you need/i }).click();

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill out inquiry form using container-based selectors
    const modal = page.getByRole('dialog');
    await modal.getByPlaceholder(/alex morgan/i).fill('Test User');
    await modal.getByPlaceholder(/alex@company.com/i).fill(testEmail);
    await modal.getByPlaceholder(/acme logistics ltd/i).fill(testCompany);
    await modal.getByPlaceholder(/tell us what is happening today/i).fill('This is a test inquiry for E2E testing with sufficient details');

    // Check consent checkbox
    await modal.getByLabel(/i agree that growthprint can review these details/i).check();

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/public/inquiries')
    );

    // Submit form
    await modal.getByRole('button', { name: /send my note/i }).click();

    // Verify API response (may fail if backend not running)
    const response = await apiResponsePromise;
    expect(response.status()).toBe(201);

    // The modal confirms the submission instead of closing (unchanged behaviour since MVP1; decision D5).
    await expect(page.getByRole('dialog').getByText(/thanks — we got it/i)).toBeVisible();
  });
});
