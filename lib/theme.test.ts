import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME, THEME_INIT_SCRIPT, parsePreference, resolveTheme } from './theme.ts';

test('dark is the default, and unknown stored values fall back to it', () => {
  assert.equal(DEFAULT_THEME, 'dark');
  assert.equal(parsePreference(null), 'dark');
  assert.equal(parsePreference('purple'), 'dark');
  assert.equal(parsePreference('light'), 'light');
  assert.equal(parsePreference('system'), 'system');
});

test('system follows the operating system setting; explicit choices ignore it', () => {
  assert.equal(resolveTheme('system', true), 'light');
  assert.equal(resolveTheme('system', false), 'dark');
  assert.equal(resolveTheme('dark', true), 'dark');
  assert.equal(resolveTheme('light', false), 'light');
});

test('the pre-paint script applies the stored theme and survives storage errors', () => {
  const run = (stored: string | null, prefersLight = false, storageThrows = false) => {
    const root = { dataset: {} as Record<string, string> };
    const g = {
      localStorage: { getItem: () => { if (storageThrows) throw new Error('blocked'); return stored; } },
      window: { matchMedia: () => ({ matches: prefersLight }) },
      document: { documentElement: root },
    };
    new Function('localStorage', 'window', 'document', THEME_INIT_SCRIPT)(g.localStorage, g.window, g.document);
    return root.dataset.theme;
  };
  assert.equal(run(null), 'dark');
  assert.equal(run('light'), 'light');
  assert.equal(run('system', true), 'light');
  assert.equal(run('nonsense'), 'dark');
  assert.equal(run('light', false, true), 'dark');
});
