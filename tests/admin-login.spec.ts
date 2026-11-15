import { test, expect } from '@playwright/test';

// Seeded-account credentials come from the environment (the backend's git-ignored .dev-credentials file), never from source.
const ADMIN_EMAIL = process.env.GP_E2E_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.GP_E2E_ADMIN_PASSWORD ?? '';

test.describe('Admin Login @backend', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set GP_E2E_ADMIN_EMAIL and GP_E2E_ADMIN_PASSWORD (see the backend .dev-credentials file).');

  test('should authenticate admin user and redirect to dashboard', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/studio/ops/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/^Password/).fill(ADMIN_PASSWORD);

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );

    // Submit login form
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Verify API response
    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);

    // Verify redirect to admin dashboard
    await expect(page).toHaveURL('/studio/ops');

    // Verify dashboard is visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
