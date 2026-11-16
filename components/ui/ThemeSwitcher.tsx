'use client';

import { useEffect, useRef, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { THEME_STORAGE_KEY, parsePreference, resolveTheme, type ThemePreference } from '../../lib/theme.ts';

const OPTIONS: Array<{ value: ThemePreference; label: string; Icon: typeof Moon }> = [
  { value: 'dark', label: 'Dark theme', Icon: Moon },
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'system', label: 'Use system theme', Icon: Monitor },
];

function apply(preference: ThemePreference) {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = resolveTheme(preference, prefersLight);
}

/**
 * Dark / light / system choice as a radio group: Tab reaches the group, arrow keys move between options.
 * The choice persists in localStorage; "system" follows operating-system changes while the page is open.
 */
export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const [preference, setPreference] = useState<ThemePreference>('dark');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* storage blocked: default applies */ }
    setPreference(parsePreference(stored));
  }, []);

  useEffect(() => {
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => apply('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const choose = (value: ThemePreference) => {
    setPreference(value);
    try { localStorage.setItem(THEME_STORAGE_KEY, value); } catch { /* not persisted, still applied */ }
    apply(value);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + OPTIONS.length) % OPTIONS.length;
    choose(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Colour theme"
      className={`inline-flex items-center gap-0.5 rounded-xl border border-mk-line p-1 ${className}`}>
      {OPTIONS.map(({ value, label, Icon }, i) => {
        const checked = preference === value;
        return (
          <button key={value} ref={el => { refs.current[i] = el; }} type="button" role="radio" aria-checked={checked}
            aria-label={label} title={label} tabIndex={checked ? 0 : -1} onClick={() => choose(value)} onKeyDown={e => onKeyDown(e, i)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${checked ? 'bg-mk-text/10 text-mk-text' : 'text-mk-dim hover:text-mk-text'}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
