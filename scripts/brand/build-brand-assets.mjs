/**
 * Builds every GrowthPrint logo and icon file from the official mark specification:
 *   28×28 viewBox, rounded square rx=7 filled with a diagonal gradient #7426C9 → #3826B7,
 *   white growth line M6 20.5 11.5 15l3.5 3.5L22 9.5 (stroke 2.4, round caps and joins), white dot at (22, 9.5) r=2.
 * The wordmark is "GrowthPrint" set in Poppins SemiBold Italic, the lettering used on the live site. The font
 * (Latin subset, SIL Open Font License) is embedded in the SVGs so they render identically in any browser.
 *
 *   node scripts/brand/build-brand-assets.mjs
 *
 * Output: public/brand/logos/*.svg|png, public/brand/icons/*.png, app/icon.svg, app/apple-icon.png.
 * Uses Playwright's Chromium (text measurement and PNG rendering) and sharp, both already in node_modules.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const logos = path.join(root, 'public/brand/logos');
const icons = path.join(root, 'public/brand/icons');
mkdirSync(logos, { recursive: true });
mkdirSync(icons, { recursive: true });

const fontB64 = readFileSync(path.join(here, 'fonts/poppins-600-italic-latin.woff2')).toString('base64');
const FONT_CSS = `@font-face{font-family:'GP Wordmark';font-style:italic;font-weight:600;src:url(data:font/woff2;base64,${fontB64}) format('woff2');}`;

const INK = '#191329';      // text on light backgrounds (light theme text token)
const WHITE = '#FFFFFF';

/** The mark at the origin, 28×28 units, scaled by `s`. `mono` draws it in one colour (tile cut-out line and dot). */
function mark(s = 1, x = 0, y = 0, mono = null, gradId = 'gp-g') {
  const t = `translate(${x} ${y}) scale(${s})`;
  if (mono) {
    // One colour: tile in the colour, line and dot knocked out to the background through a mask.
    return `<g transform="${t}"><mask id="${gradId}-m"><rect width="28" height="28" rx="7" fill="#fff"/>`
      + `<path d="M6 20.5 11.5 15l3.5 3.5L22 9.5" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<circle cx="22" cy="9.5" r="2" fill="#000"/></mask><rect width="28" height="28" rx="7" fill="${mono}" mask="url(#${gradId}-m)"/></g>`;
  }
  return `<g transform="${t}"><rect width="28" height="28" rx="7" fill="url(#${gradId})"/>`
    + `<path d="M6 20.5 11.5 15l3.5 3.5L22 9.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<circle cx="22" cy="9.5" r="2" fill="#fff"/></g>`;
}
const GRAD = (id = 'gp-g') => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7426C9"/><stop offset="1" stop-color="#3826B7"/></linearGradient>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<style>${FONT_CSS}</style><svg id="m" xmlns="http://www.w3.org/2000/svg"><text id="t" font-family="GP Wordmark" font-style="italic" font-weight="600" font-size="100" letter-spacing="-1">GrowthPrint</text></svg>`);
await page.evaluate(() => document.fonts.ready);
// Advance width and the ink box of the text at font-size 100 (baseline at y=0).
const metrics = await page.evaluate(() => {
  const t = document.getElementById('t');
  const b = t.getBBox();
  return { advance: t.getComputedTextLength(), x: b.x, y: b.y, w: b.width, h: b.height };
});

function wordmark(fontSize, x, baseline, fill) {
  return `<text x="${x}" y="${baseline}" font-family="GP Wordmark, Poppins, sans-serif" font-style="italic" font-weight="600" font-size="${fontSize}" letter-spacing="${(-0.01 * fontSize).toFixed(2)}" fill="${fill}">GrowthPrint</text>`;
}
const svgDoc = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title><defs><style>${FONT_CSS}</style>${GRAD()}</defs>${body}</svg>`;
const svgMarkOnly = (size, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${title}"><title>${title}</title><defs>${GRAD()}</defs>${body}</svg>`;

// Horizontal lock-up: mark height 56, wordmark cap-height aligned to the mark's optical centre, gap = 0.4 × mark.
function horizontal(textFill, mono = null) {
  const m = 56, fs = 40, gap = 22;
  const textW = metrics.advance * fs / 100 + 6;            // +6 for the italic overhang of the final "t"
  const baseline = m / 2 + (fs * 0.70) / 2;                // centre the x-height-ish block on the mark
  const w = Math.ceil(m + gap + textW), h = m;
  return svgDoc(w, h, mark(m / 28, 0, 0, mono) + wordmark(fs, m + gap, baseline.toFixed(1), textFill), 'GrowthPrint');
}
// Stacked lock-up: mark above, wordmark centred below.
function stacked(textFill, mono = null) {
  const m = 96, fs = 40, textW = metrics.advance * fs / 100 + 6;
  const w = Math.ceil(Math.max(m, textW) + 8), h = m + 22 + 44;
  return svgDoc(w, h, mark(m / 28, (w - m) / 2, 0, mono) + wordmark(fs, ((w - textW) / 2 + 2).toFixed(1), m + 22 + 34, textFill), 'GrowthPrint');
}

const files = {
  'growthprint-logo-horizontal-dark-bg.svg': horizontal(WHITE),
  'growthprint-logo-horizontal-light-bg.svg': horizontal(INK),
  'growthprint-logo-stacked-dark-bg.svg': stacked(WHITE),
  'growthprint-logo-stacked-light-bg.svg': stacked(INK),
  'growthprint-logo-horizontal-mono-white.svg': horizontal(WHITE, WHITE),
  'growthprint-logo-horizontal-mono-ink.svg': horizontal(INK, INK),
  'growthprint-mark.svg': svgMarkOnly(28, mark(1), 'GrowthPrint'),
  'growthprint-mark-mono-white.svg': svgMarkOnly(28, mark(1, 0, 0, WHITE), 'GrowthPrint'),
  'growthprint-mark-mono-ink.svg': svgMarkOnly(28, mark(1, 0, 0, INK), 'GrowthPrint'),
};
for (const [name, svg] of Object.entries(files)) writeFileSync(path.join(logos, name), svg);

// PNG exports rendered by Chromium (it honours the embedded font), at 2× for sharp edges.
async function renderPng(svg, outFile, scale = 2, background = 'transparent') {
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  await page.setViewportSize({ width: Math.ceil(w * scale), height: Math.ceil(h * scale) });
  await page.setContent(`<style>html,body{margin:0;background:${background}}svg{display:block;width:${w * scale}px;height:${h * scale}px}</style>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('svg').screenshot({ path: outFile, omitBackground: background === 'transparent' });
}
for (const name of Object.keys(files)) {
  await renderPng(files[name], path.join(logos, name.replace('.svg', '.png')), name.includes('mark') ? 16 : 2);
}

// Icons: the mark alone. Maskable icons keep the mark inside the 80 % safe zone on the brand background.
const markSvg = files['growthprint-mark.svg'];
await sharp(Buffer.from(markSvg)).resize(192).png().toFile(path.join(icons, 'icon-192.png'));
await sharp(Buffer.from(markSvg)).resize(512).png().toFile(path.join(icons, 'icon-512.png'));
await sharp(Buffer.from(markSvg)).resize(32).png().toFile(path.join(icons, 'favicon-32.png'));
const maskable = (size) => sharp({ create: { width: size, height: size, channels: 4, background: '#080710' } })
  .composite([{ input: Buffer.from(markSvg.replace(/width="28" height="28"/, `width="${Math.round(size * 0.62)}" height="${Math.round(size * 0.62)}"`)), gravity: 'center' }]).png();
await maskable(512).toFile(path.join(icons, 'icon-maskable-512.png'));
await maskable(400).toFile(path.join(icons, 'social-avatar-400.png'));
await sharp(Buffer.from(markSvg)).resize(180).flatten({ background: '#080710' }).png().toFile(path.join(root, 'app/apple-icon.png'));
writeFileSync(path.join(root, 'app/icon.svg'), markSvg);

await browser.close();
console.log('brand assets written:', Object.keys(files).length * 2 + 7, 'files; wordmark advance at 100px =', metrics.advance.toFixed(1));
