/**
 * Renders the GrowthPrint explainer film (explainer.html) to public/media/growthprint-explainer.webm.
 * Each frame is laid out by window.renderAt(t) and captured with Playwright, then encoded to VP8/WebM by the ffmpeg
 * that ships with Playwright (no extra install). Also writes the poster image.
 *
 *   node scripts/marketing-media/render-explainer.mjs            full render (58 s at 30 fps)
 *   PREVIEW=1 node scripts/marketing-media/render-explainer.mjs  stills of each scene only, into out/preview-*.jpg
 *
 * Needs scripts/marketing-media/out/sculpture-0.png (run render-sculpture.mjs first).
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(here, 'out');
mkdirSync(out, { recursive: true });
mkdirSync(path.join(root, 'public/media'), { recursive: true });

const FPS = 30;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, 'explainer.html')).href);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60_000 });
const duration = await page.evaluate(() => window.DURATION);

async function frameAt(t) {
  await page.evaluate((s) => window.renderAt(s), t);
  return page.screenshot({ type: 'jpeg', quality: 92 });
}

// Poster only: POSTER_AT=11 re-renders the poster from that moment without re-rendering the film.
const POSTER_AT = Number(process.env.POSTER_AT || 11);
async function writePoster() {
  await sharp(await frameAt(POSTER_AT)).webp({ quality: 86 }).toFile(path.join(root, 'public/media/growthprint-explainer-poster.webp'));
}
if (process.env.POSTER_ONLY) {
  await writePoster();
  await browser.close();
  console.log('poster written');
  process.exit(0);
}

if (process.env.PREVIEW) {
  for (const t of [3, 6.6, 10, 18, 26, 35, 44, 52, 56]) {
    await sharp(await frameAt(t)).resize(960).toFile(path.join(out, `preview-${String(t).replace('.', '_')}.jpg`));
  }
  await browser.close();
  console.log('previews written to', out);
  process.exit(0);
}

// 1. frames, concatenated into one MJPEG stream file (the bundled ffmpeg reads image2pipe)
const mjpeg = path.join(out, 'explainer.mjpeg');
const stream = createWriteStream(mjpeg);
const total = Math.round(duration * FPS);
for (let i = 0; i < total; i++) {
  const buf = await frameAt(i / FPS);
  if (!stream.write(buf)) await new Promise((r) => stream.once('drain', r));
  if (i % 150 === 0) console.log(`frame ${i}/${total}`);
}
await new Promise((r) => stream.end(r));

// 2. poster: the "Meet GrowthPrint" moment (text left, sculpture right, so the play button sits on open space)
await writePoster();
await browser.close();

// 3. encode with Playwright's bundled ffmpeg (VP8 is the codec it includes)
const pwDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.cache'), 'ms-playwright');
const ffmpeg = readdirSync(pwDir).filter((d) => d.startsWith('ffmpeg-')).sort()
  .map((d) => path.join(pwDir, d, process.platform === 'win32' ? 'ffmpeg-win64.exe' : 'ffmpeg-linux'))
  .find((f) => existsSync(f) && spawnSync(f, ['-hide_banner', '-encoders']).stdout.toString().includes('libvpx'));
if (!ffmpeg) throw new Error('No Playwright ffmpeg with VP8 support found. Run: npx playwright install ffmpeg');
const target = path.join(root, 'public/media/growthprint-explainer.webm');
const res = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', mjpeg,
  '-c:v', 'libvpx', '-b:v', '2800k', '-crf', '10', '-qmin', '4', '-qmax', '40', '-deadline', 'good', '-cpu-used', '1',
  '-auto-alt-ref', '0', '-pix_fmt', 'yuv420p', '-y', target], { stdio: 'inherit' });
if (res.status !== 0) throw new Error('ffmpeg failed');
rmSync(mjpeg);
console.log('wrote', target);
