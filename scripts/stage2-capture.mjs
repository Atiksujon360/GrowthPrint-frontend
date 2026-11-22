// Stage 2B baseline captures: all Studio tabs at key viewports in light+dark.
// Output: docs/design/screenshots/stage2b/
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'docs/design/screenshots/stage2b';
mkdirSync(OUT, { recursive: true });

const TABS = ['Dashboard', 'Leads & CRM', 'Outreach approvals', 'Support queue', 'Projects',
  'Clients', 'Invoices & revenue', 'Automation', 'Activity log', 'AI providers', 'Users & team', 'Settings'];

const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['laptop', 1280, 800],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
];

const browser = await chromium.launch();
const slug = s => s.toLowerCase().replace(/[^a-z]+/g, '-');

async function shoot(page, name) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log('captured', name);
}

async function loginIfNeeded(page) {
  const loginForm = page.locator('form').first();
  if (await loginForm.isVisible().catch(() => false)) {
    console.log('🔐 Logging in...');
    await page.fill('input[type="email"]', 'admin@growthprint.dev');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(1000);
    console.log('✓ Logged in');
  }
}

for (const theme of ['light', 'dark']) {
  for (const [vpName, width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(t => localStorage.setItem('gp-theme', t), theme);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/studio/ops`);
    await page.waitForLoadState('networkidle').catch(() => undefined);

    await loginIfNeeded(page);

    const nav = page.getByRole('navigation', { name: 'Studio navigation' });
    for (const name of TABS) {
      const btn = nav.getByRole('button', { name: new RegExp(`^${name.replace(/[&]/g, '\\$&')}`) });
      if (!(await btn.isVisible().catch(() => false))) { console.log('skip (hidden):', name); continue; }
      await btn.click();
      await shoot(page, `${vpName}-${slug(name)}-${theme}`);
    }
    await ctx.close();
  }
}

await browser.close();
console.log('done');
