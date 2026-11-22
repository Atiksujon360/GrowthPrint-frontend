/**
 * Renders the GrowthPrint illustration library (asset-studio.html scenes) to transparent WebP files.
 *
 *   node scripts/marketing-media/render-assets.mjs
 *
 * Output: public/illustrations/<category>/<name>.webp  (transparent, brand palette, theme-safe)
 * Masters (PNG) stay in scripts/marketing-media/out/illustrations/ (git-ignored).
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(here, 'out', 'illustrations');
mkdirSync(outDir, { recursive: true });

/** name → { category, scene, ratio } — all decorative, no text/logos/data. */
const ASSETS = [
  // A. Dashboard
  ['dashboard-overview',        'dashboard', 'orbit',     '1x1'],
  ['dashboard-analytics',       'dashboard', 'columns',   '16x9'],
  ['dashboard-projects',        'dashboard', 'cards',     '1x1'],
  ['dashboard-team',            'dashboard', 'people',    '1x1'],
  ['dashboard-growth',          'dashboard', 'columns',   '1x1'],
  ['dashboard-monitoring',      'dashboard', 'gauge',     '1x1'],
  // B. Project management
  ['projects-active',           'projects',  'cards',     '4x3'],
  ['projects-completed',        'projects',  'cards',     '4x3'],
  ['projects-milestones',       'projects',  'pipeline',  '16x9'],
  ['projects-tasks',            'projects',  'cards',     '1x1'],
  ['projects-deliverables',     'projects',  'doc',       '4x3'],
  ['projects-collaboration',    'projects',  'chat',      '4x3'],
  // C. CRM & clients
  ['crm-relationships',         'crm',       'hub',       '1x1'],
  ['crm-client-profiles',       'crm',       'cards',     '1x1'],
  ['crm-lead-pipeline',         'crm',       'pipeline',  '16x9'],
  ['crm-opportunities',         'crm',       'columns',   '1x1'],
  ['crm-onboarding',            'crm',       'doc',       '4x3'],
  ['crm-communication',         'crm',       'chat',      '1x1'],
  // D. Automation & AI
  ['automation-workflow',       'automation','pipeline',  '16x9'],
  ['automation-ai-orchestration','automation','branch',    '1x1'],
  ['automation-processes',      'automation','pipeline',  '16x9'],
  ['automation-connected-systems','automation','hub',     '1x1'],
  ['automation-api',            'automation','pipeline',  '4x3'],
  ['automation-execution',      'automation','branch',    '4x3'],
  // E. Billing & finance
  ['billing-invoices',          'billing',   'doc',       '4x3'],
  ['billing-payments',          'billing',   'coin',      '1x1'],
  ['billing-analytics',         'billing',   'columns',   '16x9'],
  ['billing-revenue',           'billing',   'columns',   '1x1'],
  ['billing-management',        'billing',   'doc',       '1x1'],
  // F. Team & collaboration
  ['team-management',           'team',      'people',    '1x1'],
  ['team-collaboration',        'team',      'chat',      '4x3'],
  ['team-permissions',          'team',      'shield',    '1x1'],
  ['team-invitations',          'team',      'people',    '4x3'],
  ['team-communication',        'team',      'chat',      '1x1'],
  ['team-activity',             'team',      'pulse',     '16x9'],
  // G. Empty states
  ['empty-projects',            'empty',     'empty',     '1x1'],
  ['empty-clients',             'empty',     'empty',     '1x1'],
  ['empty-notifications',       'empty',     'empty',     '1x1'],
  ['empty-search',              'empty',     'empty',     '1x1'],
  ['empty-invoices',            'empty',     'empty',     '1x1'],
  ['empty-tasks',               'empty',     'empty',     '1x1'],
  ['empty-activity',            'empty',     'empty',     '1x1'],
  ['empty-integrations',        'empty',     'empty',     '1x1'],
  // H. Onboarding
  ['onboarding-welcome',        'onboarding','ascent',    '4x3'],
  ['onboarding-first-business', 'onboarding','cards',     '4x3'],
  ['onboarding-invite-team',    'onboarding','people',    '4x3'],
  ['onboarding-connect',        'onboarding','hub',       '4x3'],
  ['onboarding-configure',      'onboarding','layers',    '4x3'],
  ['onboarding-first-project',  'onboarding','pipeline',  '4x3'],
  // I. Technical
  ['tech-cloud',                'technical', 'cloud',     '1x1'],
  ['tech-database',             'technical', 'db',        '1x1'],
  ['tech-development',          'technical', 'code',      '1x1'],
  ['tech-integrations',         'technical', 'hub',       '1x1'],
  ['tech-api',                  'technical', 'pipeline',  '16x9'],
  ['tech-security',             'technical', 'shield',    '1x1'],
  ['tech-deployment',           'technical', 'deploy',    '16x9'],
  ['tech-monitoring',           'technical', 'pulse',     '16x9'],
];

const SIZES = { '1x1':[640,640], '4x3':[640,480], '16x9':[640,360] };

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 700, height: 500 } });
const html = pathToFileURL(path.join(here, 'asset-studio.html')).href;

for (const [name, category, sceneName, ratio] of ASSETS) {
  const [w, h] = SIZES[ratio];
  await page.setViewportSize({ width: w + 40, height: h + 40 });
  await page.goto(`${html}?scene=${sceneName}&ratio=${ratio}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 15000 });
  const png = path.join(outDir, `${name}.png`);
  await page.locator('#stage').screenshot({ path: png, omitBackground: true });
  const dir = path.join(root, 'public/illustrations', category);
  mkdirSync(dir, { recursive: true });
  await sharp(png).webp({ quality: 88, alphaQuality: 95, effort: 6 })
    .toFile(path.join(dir, `${name}.webp`));
  console.log('rendered', category + '/' + name + '.webp', `(${w}x${h})`);
}
await browser.close();
console.log(`\nDone: ${ASSETS.length} assets → public/illustrations/`);
