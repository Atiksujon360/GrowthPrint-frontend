// Global responsive audit: measures horizontal overflow + captures screenshots per route/viewport/theme.
// Usage: node scripts/responsive-audit.mjs  (expects `next start` on :3100)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3100';
const OUT = 'docs/design/screenshots/responsive';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  ['d1920', 1920, 1080], ['d1440', 1440, 900], ['laptop1280', 1280, 800], ['laptop1024', 1024, 768],
  ['tablet768', 768, 1024], ['mobile430', 430, 932], ['mobile390', 390, 844], ['mobile360', 360, 800], ['mobile320', 320, 700],
];

const ROUTES = [
  ['public', '/'],
  ['insights', '/insights'],
  ['studio-login', '/studio/ops/login'],
  ['forgot-password', '/forgot-password'],
  ['studio-dashboard', '/studio/ops'],
];

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(500);
}

async function metrics(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const overflowX = de.scrollWidth - de.clientWidth;
    // elements sticking out beyond the right edge (visible, non-fixed, sizeable)
    const vw = window.innerWidth;
    let offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 4 && r.right > vw + 2 && r.left < vw) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') return;
        offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
        if (offenders.length > 4) offenders.length = 5;
      }
    });
    return { overflowX, offenders, title: document.title.slice(0, 40) };
  });
}

const browser = await chromium.launch();
const report = [];

for (const [vpName, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(t => localStorage.setItem('gp-theme', t), theme);
    const page = await ctx.newPage();

    for (const [name, url] of ROUTES) {
      await page.goto(BASE + url);
      await settle(page);
      const m = await metrics(page);
      const fail = m.overflowX > 1;
      report.push({ vp: vpName, theme, route: name, overflowX: m.overflowX, offenders: m.offenders.join(' | ') });
      // screenshot only failures + a baseline set at key sizes
      const baseline = (vpName === 'd1440' || vpName === 'tablet768' || vpName === 'mobile390');
      if (fail || (baseline && theme === 'light')) {
        await page.screenshot({ path: `${OUT}/${vpName}-${name}-${theme}.png`, fullPage: false });
      }
      if (fail) console.log(`OVERFLOW ${vpName}/${theme}/${name}: +${m.overflowX}px :: ${m.offenders[0] || ''}`);
    }
    await ctx.close();
  }
}

// client hub + workspace need the demo portal switch
for (const [vpName, w, h] of [['d1440', 1440, 900], ['tablet768', 768, 1024], ['mobile390', 390, 844], ['mobile320', 320, 700]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await settle(page);
  const portal = page.getByRole('banner').getByRole('button', { name: /client portal/i });
  if (await portal.isVisible().catch(() => false)) {
    await portal.click();
    await page.getByRole('button', { name: /^Portal/ }).first().click();
    await page.waitForURL(/client-hub/, { timeout: 15000 }).catch(() => undefined);
  }
  await settle(page);
  const m = await metrics(page);
  report.push({ vp: vpName, theme: 'demo', route: 'client-hub', overflowX: m.overflowX, offenders: m.offenders.join(' | ') });
  if (m.overflowX > 1) console.log(`OVERFLOW ${vpName}/client-hub: +${m.overflowX}px :: ${m.offenders[0]}`);
  await page.screenshot({ path: `${OUT}/${vpName}-client-hub.png`, fullPage: false });

  await page.goto(BASE + '/workspace');
  await settle(page);
  const mw = await metrics(page);
  report.push({ vp: vpName, theme: 'demo', route: 'workspace', overflowX: mw.overflowX, offenders: mw.offenders.join(' | ') });
  if (mw.overflowX > 1) console.log(`OVERFLOW ${vpName}/workspace: +${mw.overflowX}px :: ${mw.offenders[0]}`);
  await page.screenshot({ path: `${OUT}/${vpName}-workspace.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
const fails = report.filter(r => r.overflowX > 1);
console.log(`\n=== ${report.length} checks, ${fails.length} overflows ===`);
fails.forEach(f => console.log(`${f.vp}/${f.theme}/${f.route}: +${f.overflowX}px :: ${f.offenders.slice(0, 120)}`));
