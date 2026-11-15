import { test, expect } from '@playwright/test';

// Seeded-account credentials come from the environment (the backend's git-ignored .dev-credentials file), never from source.
const ADMIN_EMAIL = process.env.GP_E2E_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.GP_E2E_ADMIN_PASSWORD ?? '';

/**
 * Quick create from the studio (requires backend for sign-in).
 *
 * Updated 2026-11-09 (owner decision D5): the previous version expected Ctrl+K to open a "project" form with tabs,
 * budget and category fields. That UI never existed: Ctrl+K opens the command palette, and Quick create is a
 * lead / support-ticket form. This test now checks the real flow without submitting, so it writes no data.
 */
test.describe('Admin Quick Create @backend', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set GP_E2E_ADMIN_EMAIL and GP_E2E_ADMIN_PASSWORD (see the backend .dev-credentials file).');

  test('opens Quick create from the top bar and offers lead and ticket forms', async ({ page }) => {
    await page.goto('/studio/ops/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/^Password/).fill(ADMIN_PASSWORD);

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
