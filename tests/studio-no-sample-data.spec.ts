import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * A real (non-demo) Studio must never show made-up customers, notifications or banners.
 * The API is stubbed with empty lists, so the only thing that could appear is hardcoded sample content.
 */
const SAMPLE_STRINGS = ['Sarah Chen', 'Meridian Retail', 'Nexus Logistics', 'Vanguard Freight', 'October Retainer Notice', 'David Sterling'];

async function signInWithEmptyApi(page: Page) {
  await page.addInitScript(() => window.sessionStorage.setItem('gp_auth_token', 'e2e-stub-token'));
  await page.route('**/api/v1/**', async (route: Route) => {
    const origin = await route.request().headerValue('origin');
    const cors = {
      'Access-Control-Allow-Origin': origin ?? 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'authorization, content-type, x-requested-with, x-correlation-id',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    };
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const body = req.url().includes('/auth/me')
      ? { id: 'e2e-admin', email: 'admin@example.test', role: 'ADMIN', fullName: 'Ada Admin' }
      : [];
    return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.describe('Studio without sample data', () => {
  test('a new account sees no notifications, no banner and no sample customers', async ({ page }) => {
    await signInWithEmptyApi(page);
    await page.goto('/studio/ops');
    await expect(page.getByRole('heading', { level: 1 }).or(page.getByText(/Good (morning|afternoon|evening)/))).toBeVisible();

    // No banner, and the bell has no unread count.
    await expect(page.getByRole('button', { name: 'Dismiss banner' })).toHaveCount(0);
    const bell = page.getByRole('button', { name: /^Notifications/ });
    await expect(bell).toHaveAccessibleName('Notifications (0 unread)');

    await bell.click();
    await expect(page.getByRole('banner').getByText('Nothing needs your attention right now.')).toBeVisible();

    const text = await page.locator('body').innerText();
    for (const sample of SAMPLE_STRINGS) {
      expect(text, `"${sample}" is sample content and must not appear in a real Studio`).not.toContain(sample);
    }
  });
});
