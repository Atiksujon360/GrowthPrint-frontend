import { test, expect } from '@playwright/test';

/**
 * Quick create from the studio (requires backend for sign-in).
 *
 * Updated 2026-11-09 (owner decision D5): the previous version expected Ctrl+K to open a "project" form with tabs,
 * budget and category fields. That UI never existed: Ctrl+K opens the command palette, and Quick create is a
 * lead / support-ticket form. This test now checks the real flow without submitting, so it writes no data.
 */
test.describe('Admin Quick Create', () => {
  test('opens Quick create from the top bar and offers lead and ticket forms', async ({ page }) => {
    await page.goto('/studio/ops/login');
    await page.getByLabel(/email/i).fill('admin@growthprint.dev');
    await page.getByLabel(/^Password/).fill('Admin123!');

    const loginResponsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await loginResponsePromise;
    await expect(page).toHaveURL('/studio/ops');

    await page.getByRole('button', { name: /new record/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Quick-create record' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /new lead/i })).toBeVisible();
    await expect(dialog.getByText(/company name/i)).toBeVisible();

    await dialog.getByRole('button', { name: /support ticket/i }).click();
    await expect(dialog.getByText(/ticket title/i)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
