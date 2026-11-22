/**
 * Colour theme. Light is the default; the visitor can choose dark or follow the system setting.
 * The choice is stored in localStorage and applied as html[data-theme] before first paint (THEME_INIT_SCRIPT in
 * app/layout.tsx), so there is no flash of the wrong theme. One implementation for every route group.
 */
export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'gp-theme';
export const DEFAULT_THEME: ThemePreference = 'light';

export function parsePreference(value: string | null | undefined): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT_THEME;
}

export function resolveTheme(preference: ThemePreference, systemPrefersLight: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersLight ? 'light' : 'dark';
  return preference;
}

/**
 * Runs inline in <head> before the page paints. Kept dependency-free and defensive: storage can throw in private
 * modes, in which case the default (dark) applies.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');`
  + `if(p!=='light'&&p!=='dark'&&p!=='system')p='${DEFAULT_THEME}';`
  + `var t=p==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):p;`
  + `document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='${DEFAULT_THEME}';}})();`;
