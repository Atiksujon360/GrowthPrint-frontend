#!/usr/bin/env node

/**
 * Stage 2B: Studio/Ops Screenshot Baselines
 * Captures all 11 Studio tabs in both themes at key viewports
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SCREENSHOT_DIR = join(ROOT, 'docs', 'design', 'screenshots', 'stage2b');

const TABS = [
  'DASHBOARD',
  'LEADS',
  'OUTREACH',
  'REQUESTS',
  'PROJECTS',
  'CLIENTS',
  'INVOICES',
  'AUTOMATION',
  'ACTIVITY',
  'AI_SETTINGS',
  'SETTINGS',
  'TEAM'
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const THEMES = ['light', 'dark'];

async function ensureDir(dir) {
  const fs = await import('fs/promises');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // exists
  }
}

async function setTheme(page, theme) {
  const themeValue = theme === 'light' ? 'light' : 'dark';
  await page.evaluate(`localStorage.setItem('gp-theme', '${themeValue}')`);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // theme transition
}

async function navigateToTab(page, tab) {
  // Studio uses client-side tab navigation via AdminLayout
  // Click on the nav item with matching data-tab or text
  const tabSelector = `button:has-text("${tab.replace('_', ' ')}")`;
  try {
    await page.click(tabSelector);
    await page.waitForTimeout(800); // tab transition
  } catch (e) {
    // Fallback: try clicking by aria-label or data attribute
    const fallbackSelectors = [
      `[data-tab="${tab}"]`,
      `[aria-label*="${tab.replace('_', ' ')}"]`,
      `text=${tab.replace('_', ' ')}`,
    ];
    for (const selector of fallbackSelectors) {
      try {
        await page.click(selector);
        await page.waitForTimeout(800);
        return;
      } catch (e2) {
        // continue
      }
    }
    throw new Error(`Could not navigate to tab ${tab}`);
  }
}

async function captureTab(browser, tab, viewport, theme) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    locale: 'en-US',
  });
  const page = await context.newPage();

  const outputDir = join(SCREENSHOT_DIR, viewport.name, theme);
  await ensureDir(outputDir);

  try {
    // Navigate to Studio
    await page.goto('http://localhost:3000/studio/ops', { waitUntil: 'networkidle' });

    // Check if logged in; if not, this will need manual login
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      console.log(`⚠️  Not logged in for ${tab}/${viewport.name}/${theme} - skipping`);
      await context.close();
      return;
    }

    // Set theme
    await setTheme(page, theme);

    // Navigate to tab
    await navigateToTab(page, tab);

    // Wait for content to settle
    await page.waitForTimeout(1000);

    // Capture
    const filename = `${tab.toLowerCase()}.png`;
    const outputPath = join(outputDir, filename);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✓ Captured ${tab}/${viewport.name}/${theme} → ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed ${tab}/${viewport.name}/${theme}:`, error.message);
  } finally {
    await context.close();
  }
}

async function main() {
  await ensureDir(SCREENSHOT_DIR);

  const browser = await chromium.launch({ headless: true });

  console.log('📸 Stage 2B Studio/Ops Screenshot Baselines');
  console.log(`Output: ${SCREENSHOT_DIR}\n`);

  for (const tab of TABS) {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        await captureTab(browser, tab, viewport, theme);
      }
    }
  }

  await browser.close();
  console.log('\n✨ Capture complete');
}

main().catch(console.error);
