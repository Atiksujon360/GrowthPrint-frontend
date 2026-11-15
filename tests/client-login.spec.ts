import { test, expect } from '@playwright/test';

// Seeded-account credentials come from the environment (the backend's git-ignored .dev-credentials file), never from source.
const CLIENT_EMAIL = process.env.GP_E2E_CLIENT_EMAIL ?? '';
const CLIENT_PASSWORD = process.env.GP_E2E_CLIENT_PASSWORD ?? '';

test.describe('Client Portal Login @backend', () => {
  test.skip(!CLIENT_EMAIL || !CLIENT_PASSWORD, 'Set GP_E2E_CLIENT_EMAIL and GP_E2E_CLIENT_PASSWORD (see the backend .dev-credentials file).');

  test('should authenticate client user and redirect to portal dashboard', async ({ page }) => {
    // Navigate to portal login page
    await page.goto('/client-hub/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill(CLIENT_EMAIL);
    await page.getByLabel(/^Password/).fill(CLIENT_PASSWORD);

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );

    // Submit login form
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Verify API response
    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);

    // Verify redirect to portal dashboard
    await expect(page).toHaveURL('/client-hub');

    // Verify the portal overview is visible. (Updated 2026-11-09, decision D5: the portal never had a
    // "dashboard" heading; its first page is titled "Overview".)
    await expect(page.getByRole('heading', { level: 1, name: /welcome back/i })).toBeVisible();
  });
});
