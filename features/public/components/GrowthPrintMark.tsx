/**
 * GrowthPrint mark: a rising line drawn on a blueprint square. Decorative next to the wordmark (aria-hidden).
 */
export function GrowthPrintMark({ className = 'h-7 w-7', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const square = tone === 'dark' ? 'var(--color-navy-950)' : 'white';
  const grid = tone === 'dark' ? 'rgb(255 255 255 / 0.14)' : 'rgb(10 22 40 / 0.12)';
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" focusable="false">
      <rect width="28" height="28" rx="7" fill={square} />
      <path d="M7 0v28M14 0v28M21 0v28M0 7h28M0 14h28M0 21h28" stroke={grid} strokeWidth="0.75" />
      <path d="M6 20.5 11.5 15l3.5 3.5L22 9.5" fill="none" stroke="var(--color-mint-300)" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="9.5" r="2" fill="var(--color-brand-400)" />
    </svg>
  );
}
