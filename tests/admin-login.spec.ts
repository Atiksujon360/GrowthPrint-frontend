import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should authenticate admin user and redirect to dashboard', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/studio/ops/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill('admin@growthprint.dev');
    await page.getByLabel(/^Password/).fill('Admin123!');

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
