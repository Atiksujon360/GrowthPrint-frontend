import { test, expect, type Page } from '@playwright/test';

/**
 * Before/after screenshots for the design transformation. Skipped unless GP_CAPTURE is set ("before" or "after").
 * Runs against the app's own demo mode (NEXT_PUBLIC_USE_MOCK_API=true, see playwright.capture.config.ts), so no
 * backend is contacted. Output: docs/design/screenshots/<GP_CAPTURE>/<viewport>-<screen>.png
 */
const phase = process.env.GP_CAPTURE;
test.skip(!phase, 'Set GP_CAPTURE=before|after to capture design screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const dir = `docs/design/screenshots/${phase}`;

async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(600);
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('public website', async ({ page }) => {
      await page.goto('/');
      await settle(page);
      await page.screenshot({ path: `${dir}/${vp.name}-public-home.png`, fullPage: true });
    });

    test('sign-in and recovery pages', async ({ page }) => {
      for (const [name, url] of [['studio-login', '/studio/ops/login'], ['client-login', '/client-hub/login'],
        ['forgot-password', '/forgot-password']] as const) {
        await page.goto(url);
        await settle(page);
        await page.screenshot({ path: `${dir}/${vp.name}-${name}.png`, fullPage: true });
      }
    });

    test('studio workspace', async ({ page }) => {
      await page.goto('/studio/ops');
      await settle(page);
      await page.screenshot({ path: `${dir}/${vp.name}-studio-dashboard.png`, fullPage: true });
    });

    // Every other studio tab, opened from the sidebar (desktop only; tabs share the same shell).
    if (vp.name === 'desktop') {
      test('studio tabs', async ({ page }) => {
        await page.goto('/studio/ops');
        await settle(page);
        const nav = page.getByRole('navigation', { name: 'Studio navigation' });
        if (!(await nav.isVisible().catch(() => false))) test.skip(true, 'Studio navigation not present in this build');
        const tabs = ['Leads & CRM', 'Outreach approvals', 'Clients', 'Projects', 'Support queue', 'Invoices & revenue',
          'Automation', 'Activity log', 'AI providers', 'Users & team', 'Settings'];
        for (const name of tabs) {
          await nav.getByRole('button', { name: new RegExp(`^${name.replace(/[&]/g, '\\$&')}`) }).click();
          await settle(page);
          await page.screenshot({ path: `${dir}/desktop-studio-${name.toLowerCase().replace(/[^a-z]+/g, '-')}.png`, fullPage: true });
        }
      });
    }

    test('client hub', async ({ page }) => {
      // Demo mode signs in as an admin, so switch to the demo client first (public "Client Portal" button),
      // then navigate client-side so the switched session is kept.
      await page.goto('/');
      await settle(page);
      const portalButton = page.getByRole('banner').getByRole('button', { name: /client portal/i });
      if (await portalButton.isVisible().catch(() => false)) {
        await portalButton.click();
        await page.getByRole('button', { name: /^Portal/ }).first().click();
        await page.waitForURL(/client-hub/, { timeout: 15000 }).catch(() => undefined);
      } else {
        await page.goto('/client-hub');
      }
      await settle(page);
      await page.screenshot({ path: `${dir}/${vp.name}-client-hub.png`, fullPage: true });
    });

    test('business workspace', async ({ page }) => {
      await page.goto('/workspace');
      await settle(page);
      await page.screenshot({ path: `${dir}/${vp.name}-workspace-list.png`, fullPage: true });
      const first = page.getByRole('link', { name: /GrowthPrint Studio/ }).first();
      if (await first.isVisible().catch(() => false)) {
        await first.click();
        await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible({ timeout: 15000 });
        await settle(page);
        await page.screenshot({ path: `${dir}/${vp.name}-workspace-command-centre.png`, fullPage: true });
      }
    });
  });
}
