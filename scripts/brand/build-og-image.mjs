/**
 * Renders the social share image (Open Graph / Twitter card), 1200 × 630, to public/brand/visuals/growthprint-og.jpg.
 *
 *   npm run dev            (or any running build of the site)
 *   node scripts/brand/build-og-image.mjs            BASE_URL defaults to http://localhost:3000
 *
 * The card is laid out inside the running homepage so it uses the site's own self-hosted Inter font and the official
 * logo and sculpture files. Art direction matches the homepage: neutral dark ground, no glow, purple only as an accent.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const target = path.join(root, 'public/brand/visuals/growthprint-og.jpg');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  document.body.innerHTML = `
  <div style="position:fixed;inset:0;overflow:hidden;background:#09090f;color:#f6f5fa;font-family:var(--font-inter),system-ui,sans-serif;font-feature-settings:'cv11','ss03'">
    <img src="/brand/visuals/growthprint-sculpture.webp" alt="" style="position:absolute;right:-150px;top:-10px;width:640px;height:auto">
    <div style="position:absolute;left:72px;top:64px">
      <img src="/brand/logos/growthprint-logo-horizontal-dark-bg.svg" alt="" style="height:40px;width:auto;display:block">
    </div>
    <div style="position:absolute;left:72px;bottom:72px;width:640px">
      <div style="display:flex;align-items:center;gap:14px;font-size:22px;color:#a3a3b3">
        <span style="display:block;width:36px;height:1px;background:#9b6bff"></span>Your AI-native technology partner
      </div>
      <div style="margin-top:26px;font-size:76px;line-height:0.98;font-weight:600;letter-spacing:-0.04em">Build Smarter.<br>Scale With Confidence.</div>
    </div>
  </div>`;
  document.documentElement.style.overflow = 'hidden';
  await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));
  await document.fonts.ready;
});
const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(target);
console.log('wrote', target);
