/**
 * Renders the GrowthPrint sculpture (sculpture.html) to transparent images with Playwright's Chromium,
 * then writes optimised WebP files for the website with sharp (both are already in node_modules).
 *
 *   node scripts/marketing-media/render-sculpture.mjs
 *
 * Output: public/images/growthprint-sculpture.webp (1200 px) and -720.webp, plus a PNG master in
 * scripts/marketing-media/out/ (git-ignored) for the video.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(here, 'out');
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(root, 'public/images'), { recursive: true });

const size = Number(process.env.SIZE || 1600);
const angles = (process.env.ANGLES || '0').split(',').map(Number);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: size, height: size } });
for (const angle of angles) {
  const url = pathToFileURL(path.join(here, 'sculpture.html')).href + `?size=${size}&angle=${angle}`;
  await page.goto(url);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
  const file = path.join(outDir, `sculpture-${angle}.png`);
  await page.locator('canvas').screenshot({ path: file, omitBackground: true });
  console.log('rendered', file);
}
await browser.close();

if (!process.env.ANGLES) {
  const master = path.join(outDir, 'sculpture-0.png');
  await sharp(master).resize(1200).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(path.join(root, 'public/images/growthprint-sculpture.webp'));
  await sharp(master).resize(720).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(path.join(root, 'public/images/growthprint-sculpture-720.webp'));
  console.log('wrote public/images/growthprint-sculpture.webp and -720.webp');
}
