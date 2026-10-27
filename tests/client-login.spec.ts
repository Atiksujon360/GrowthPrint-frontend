import { test, expect } from '@playwright/test';

test.describe('Client Portal Login', () => {
  test('should authenticate client user and redirect to portal dashboard', async ({ page }) => {
    // Navigate to portal login page
    await page.goto('/portal/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /everything your team needs/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill('clienta@growthprint.dev');
    await page.getByLabel(/password/i).fill('ClientA123!');

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );

    // Submit login form
    await page.getByRole('button', { name: /continue to workspace/i }).click();

    // Verify API response
    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);

    // Verify redirect to portal dashboard
    await expect(page).toHaveURL('/portal');

    // Verify dashboard is visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
