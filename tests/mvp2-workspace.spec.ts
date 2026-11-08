import { test, expect, type Page } from '@playwright/test';

/**
 * MVP2 Phase 1 — business workspace, Command Centre and CRM, running on the isolated mock workspace service.
 * Only the studio session is stubbed (GET /auth/me); no backend or database is used. Screenshots of the major
 * screens are written to docs/architecture/screenshots/mvp2-frontend/.
 */
const SHOTS = 'docs/architecture/screenshots/mvp2-frontend';

async function signInAsStudioUser(page: Page) {
  await page.addInitScript(() => window.sessionStorage.setItem('gp_auth_token', 'e2e-stub-token'));
  // The API base URL is another origin (localhost:8090), so the stub must answer the CORS preflight too.
  const cors = {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  await page.route('**/auth/me', route => route.request().method() === 'OPTIONS'
    ? route.fulfill({ status: 204, headers: cors })
    : route.fulfill({
      status: 200, contentType: 'application/json', headers: cors,
      body: JSON.stringify({ id: 'e2e-owner', email: 'olive.owner@example.com', role: 'ADMIN', fullName: 'Olive Owner' }),
    }));
}

async function openBusiness(page: Page, name: string) {
  await page.goto('/workspace');
  await page.getByRole('link', { name: new RegExp(name) }).first().click();
  await expect(page.getByRole('navigation', { name: 'Workspace' })).toBeVisible();
}

test.describe('MVP2 business workspace (mock data)', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsStudioUser(page);
  });

  test('business list, switcher and Command Centre', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.getByRole('link', { name: /GrowthPrint Studio/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Northwind Cleaning Co/ })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/01-businesses.png`, fullPage: true });

    await openBusiness(page, 'GrowthPrint Studio');
    await expect(page.getByRole('heading', { level: 1, name: /Command Centre/i })).toBeVisible();
    await expect(page.getByText(/sample data/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/02-command-centre.png`, fullPage: true });

    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: 'Activity' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Activity' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/09-settings.png`, fullPage: true });
    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: /Leads/ }).click();
    await expect(page.getByText(/Showing 1–10 of/)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/10-leads.png`, fullPage: true });

    await page.getByRole('button', { name: /Switch business/ }).click();
    await page.getByRole('button', { name: /Northwind Cleaning Co/ }).click();
    await expect(page.getByRole('button', { name: /Current business: Northwind Cleaning Co/ })).toBeVisible();
  });

  test('onboarding creates a business and opens it', async ({ page }) => {
    await page.goto('/workspace/new');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText(/at least 2 characters|Enter (a|the|your) business name/i).first()).toBeVisible();
    await page.getByLabel(/^Business name/).fill('Harbour Bakery');
    await page.screenshot({ path: `${SHOTS}/03-onboarding.png`, fullPage: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel(/^Industry/).selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Create business' }).click();
    await expect(page.getByRole('button', { name: /Current business: Harbour Bakery/ })).toBeVisible();
    await expect(page).toHaveURL(/\/workspace\/[^/]+$/);
  });

  test('clients: search, empty result and create', async ({ page }) => {
    await openBusiness(page, 'GrowthPrint Studio');
    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: 'Clients' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Clients' })).toBeVisible();
    await expect(page.getByText(/Showing 1–10 of/)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/04-clients.png`, fullPage: true });

    await page.getByLabel('Search clients').fill('zzz-nothing');
    await expect(page.getByText('No clients match your filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await page.getByRole('button', { name: 'New client' }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Create client/ }).click();
    await expect(dialog.getByText(/Enter (the|a) (client|business) name/i).first()).toBeVisible();
    await dialog.getByLabel(/^Client name|^Name/).fill('Riverside Florist');
    await dialog.getByLabel(/^Contact email/).fill('hello@riverside.example');
    await dialog.getByRole('button', { name: /Create client/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Riverside Florist' })).toBeVisible();
  });

  test('manager converts a lead to a client exactly once and sees role restrictions', async ({ page }) => {
    await openBusiness(page, 'Northwind Cleaning Co');
    const nav = page.getByRole('navigation', { name: 'Workspace' });
    await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();

    await nav.getByRole('link', { name: /Leads/ }).click();
    await page.getByRole('link', { name: 'Camden Coworking' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Camden Coworking' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete lead' })).toHaveCount(0); // ADMIN+ only
    await page.screenshot({ path: `${SHOTS}/05-lead-detail.png`, fullPage: true });

    await page.getByRole('button', { name: 'Convert to client' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('It can only be done once.', { exact: false })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/06-convert-dialog.png` });
    await dialog.getByRole('button', { name: 'Convert to client' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Camden Coworking' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Converted from a lead' })).toBeVisible();

    await page.getByRole('link', { name: 'Converted from a lead' }).click();
    await expect(page.getByText('Converted to a client')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Convert to client' })).toHaveCount(0);
    await expect(page.getByText('Locked after conversion.')).toBeVisible();

    await nav.getByRole('link', { name: 'Team' }).click();
    await expect(page.getByRole('button', { name: 'Invite member' })).toHaveCount(0);
    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('button', { name: 'Save profile' })).toHaveCount(0);
  });

  test('owner invites a member, copies the one-time link and changes a role', async ({ page }) => {
    await openBusiness(page, 'GrowthPrint Studio');
    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: 'Team' }).click();
    await expect(page.getByLabel('Role for Ava Tan')).toBeVisible();
    await expect(page.getByText('No pending invitations.')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/07-team.png`, fullPage: true });

    await page.getByRole('button', { name: 'Invite member' }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^Email address/).fill('new.hire@example.com');
    await dialog.getByLabel(/^Role/).selectOption('MANAGER');
    await dialog.getByRole('button', { name: 'Create invitation' }).click();
    await expect(dialog.getByLabel('Invitation link')).toHaveValue(/\/join-business#token=/);
    await page.screenshot({ path: `${SHOTS}/08-invitation-link.png` });
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'new.hire@example.com' })).toContainText('Manager');

    await page.getByLabel('Role for Ava Tan').selectOption('MANAGER');
    dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Change role' }).click();
    await expect(page.getByLabel('Role for Ava Tan')).toHaveValue('MANAGER');

    await expect(page.getByRole('button', { name: 'Leave' })).toBeDisabled(); // last owner
  });

  test('a business id the user does not belong to shows a no-access page', async ({ page }) => {
    await page.goto('/workspace/biz-does-not-exist');
    await expect(page.getByText("You don't have access to this business")).toBeVisible();
  });

  test('join page without a token explains the link is incomplete', async ({ page }) => {
    await page.goto('/join-business');
    await expect(page.getByRole('heading', { name: 'This link is incomplete' })).toBeVisible();
  });
});
