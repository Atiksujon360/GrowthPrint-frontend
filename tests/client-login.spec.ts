import { test, expect } from '@playwright/test';

test.describe('Client Portal Login', () => {
  test('should authenticate client user and redirect to portal dashboard', async ({ page }) => {
    // Navigate to portal login page
    await page.goto('/client-hub/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill('clienta@growthprint.dev');
    await page.getByLabel(/^Password/).fill('ClientA123!');

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
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
  });
});
