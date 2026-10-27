import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should authenticate admin user and redirect to dashboard', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin/login');

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /run the work behind the work/i })).toBeVisible();

    // Fill in credentials (using seed data accounts)
    await page.getByLabel(/email/i).fill('admin@growthprint.dev');
    await page.getByLabel(/password/i).fill('Admin123!');

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );

    // Submit login form
    await page.getByRole('button', { name: /continue to workspace/i }).click();

    // Verify API response
    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);

    // Verify redirect to admin dashboard
    await expect(page).toHaveURL('/admin');

    // Verify dashboard is visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
