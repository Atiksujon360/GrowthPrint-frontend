import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * Public homepage: navigation, calls to action, the explainer video (real file, real captions) and the project
 * inquiry form. The inquiry API is stubbed with the backend's documented contract (POST /public/inquiries:
 * 201 { referenceNumber, status, receivedAt }) so these tests write nothing anywhere.
 */

type Captured = { body: Record<string, unknown> | null; calls: number };

async function stubInquiryApi(page: Page, status: number, body: unknown): Promise<Captured> {
  const captured: Captured = { body: null, calls: 0 };
  await page.route('**/api/v1/public/inquiries', async (route: Route) => {
    const origin = await route.request().headerValue('origin');
    const cors = {
      'Access-Control-Allow-Origin': origin ?? 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'authorization, content-type, x-requested-with, x-correlation-id',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    captured.calls += 1;
    captured.body = route.request().postDataJSON();
    return route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return captured;
}

async function fillValidInquiry(page: Page) {
  const form = page.locator('#start form');
  await form.getByLabel('Full name').fill('Ada Lovelace');
  await form.getByLabel('Business email').fill('ada@company.test');
  await form.getByLabel('Company').fill('Analytical Engines Ltd');
  await form.getByLabel('Service').selectOption({ label: 'API & System Integration' });
  await form.getByLabel(/budget range/i).selectOption('$10,000 – $25,000');
  await form.getByLabel('What are you trying to achieve?').fill('Connect our CRM to the invoicing system so orders stop being typed twice.');
  await form.getByLabel('Book a discovery call').check();
  await form.getByLabel(/I agree that GrowthPrint can store these details/).check();
  return form;
}

test.describe('Homepage', () => {
  test('hero shows the brand message and both calls to action lead somewhere real', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Build Smarter\.\s*Scale Without\s*Limits\./);
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const label of ['Home', 'About Us', 'Services', 'Our Work', 'Insights']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    await page.getByRole('link', { name: /Watch What We Do/ }).click();
    await expect(page).toHaveURL(/#meet$/);
    await expect(page.getByRole('heading', { name: /Technology should make business/ })).toBeInViewport();

    await page.getByRole('link', { name: /Start a Project/ }).first().click();
    await expect(page).toHaveURL(/#start$/);
    await expect(page.locator('#start form')).toBeInViewport();
  });

  test('the explainer video waits for the visitor, then plays with English captions', async ({ page }) => {
    await page.goto('/#meet');
    const video = page.locator('#meet video');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', '/media/growthprint-explainer-poster.webp');
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);

    await page.getByRole('button', { name: /Play the overview/ }).click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 10_000 }).toBeGreaterThan(0.3);
    expect(await video.evaluate((v: HTMLVideoElement) => v.controls)).toBe(true);
    expect(await video.evaluate((v: HTMLVideoElement) => Math.round(v.duration))).toBe(58);

    const captions = await video.evaluate(async (v: HTMLVideoElement) => {
      const track = v.textTracks[0];
      track.mode = 'showing';
      for (let i = 0; i < 40 && (!track.cues || track.cues.length === 0); i++) await new Promise(r => setTimeout(r, 100));
      return { kind: track.kind, lang: track.language, cues: track.cues?.length ?? 0 };
    });
    expect(captions).toEqual({ kind: 'captions', lang: 'en', cues: 14 });
  });

  test('the inquiry form explains what is missing and sends nothing until it is valid', async ({ page }) => {
    const api = await stubInquiryApi(page, 201, {});
    await page.goto('/#start');
    await page.locator('#start form').getByRole('button', { name: /Send inquiry/ }).click();
    for (const message of ['Enter your name.', 'Enter your business email.', 'Enter your company name.',
      'Choose the service closest to what you need.', 'Tell us a little more: at least 15 characters.',
      'Please agree so we can review your details and reply.']) {
      await expect(page.getByText(message)).toBeVisible();
    }
    await expect(page.locator('#start form').getByLabel('Full name')).toBeFocused();
    expect(api.calls).toBe(0);
  });

  test('a valid inquiry is sent with the backend contract and shows the reference it returns', async ({ page }) => {
    const api = await stubInquiryApi(page, 201, { referenceNumber: 'GP-INQ-2026-ABC12345', status: 'RECEIVED', receivedAt: '2026-11-15T10:00:00Z' });
    await page.goto('/#start');
    const form = await fillValidInquiry(page);
    await form.getByRole('button', { name: /Send inquiry/ }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Inquiry received' })).toBeVisible();
    await expect(page.getByText('GP-INQ-2026-ABC12345')).toBeVisible();
    expect(api.calls).toBe(1);
    expect(api.body).toMatchObject({
      name: 'Ada Lovelace', businessEmail: 'ada@company.test', company: 'Analytical Engines Ltd',
      serviceCategory: 'SOFTWARE_DEV', projectType: 'API & System Integration', budgetRange: '$10,000 – $25,000',
      preferredContactMethod: 'DISCOVERY_CALL', consent: true,
    });
    expect(api.body).not.toHaveProperty('preferredTimeline');
  });

  test('an API refusal shows the API message and keeps what the visitor typed', async ({ page }) => {
    await stubInquiryApi(page, 429, { status: 429, message: 'Too many inquiries from this address. Please try again in a minute.' });
    await page.goto('/#start');
    const form = await fillValidInquiry(page);
    await form.getByRole('button', { name: /Send inquiry/ }).click();
    await expect(form.getByRole('alert')).toContainText('Too many inquiries');
    await expect(form.getByLabel('Full name')).toHaveValue('Ada Lovelace');
    await expect(page.getByText('Inquiry received')).toHaveCount(0);
  });

  test('"Discuss this service" preselects that service in the form', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-service="automation"]').click();
    await expect(page).toHaveURL(/#start$/);
    await expect(page.locator('#start form').getByLabel('Service')).toHaveValue('automation');
  });
});

test.describe('Homepage on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menu opens and closes with the keyboard, and nothing overflows sideways', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();
    await expect(page.locator('#mk-menu').getByRole('link', { name: 'Services' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mk-menu')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });
});
