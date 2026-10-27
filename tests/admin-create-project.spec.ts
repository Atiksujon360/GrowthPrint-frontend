import { test, expect } from '@playwright/test';

test.describe('Admin Create Project', () => {
  test('should create a new project via Quick Create Modal', async ({ page }) => {
    // Login as admin first
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@growthprint.dev');
    await page.getByLabel(/password/i).fill('Admin123!');

    const loginResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );
    await page.getByRole('button', { name: /continue to workspace/i }).click();
    await loginResponsePromise;

    // Wait for dashboard to load
    await expect(page).toHaveURL('/admin');

    // Open Quick Create Modal (keyboard shortcut Ctrl+K or click button)
    await page.keyboard.press('Control+K');

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Switch to TICKET tab (project/ticket creation)
    await page.getByRole('tab', { name: /ticket/i }).click();

    // Generate unique test data
    const timestamp = Date.now();
    const testProjectName = `E2E Test Project ${timestamp}`;

    // Fill in project details
    await page.getByLabel(/title/i).fill(testProjectName);
    await page.getByLabel(/client/i).selectOption({ index: 0 }); // Select first client
    await page.getByLabel(/category/i).selectOption('WEB_DEVELOPMENT');
    await page.getByLabel(/budget/i).fill('10000');
    await page.getByLabel(/description/i).fill('This is an E2E test project');

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/projects') && response.status() === 201
    );

    // Submit form
    await page.getByRole('button', { name: /create/i }).click();

    // Verify API response
    const response = await apiResponsePromise;
    expect(response.status()).toBe(201);

    // Verify modal closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Navigate to projects tab to verify project appears
    await page.getByRole('tab', { name: /projects/i }).click();

    // Wait for projects to load
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();

    // Verify project appears in list
    await expect(page.getByText(testProjectName)).toBeVisible();
  });
});
