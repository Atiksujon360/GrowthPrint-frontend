/**
 * GrowthPrint mark for the dark marketing site: the same rising line as the product logo (GrowthPrintMark),
 * set on a violet-to-blue tile. Decorative: the wordmark or an aria-label carries the name.
 * The gradient id is fixed on purpose: every instance defines the identical gradient, so sharing the id is harmless.
 */
export function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gp-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7426C9" />
          <stop offset="1" stopColor="#3826B7" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="7" fill="url(#gp-mark-gradient)" />
      <path d="M6 20.5 11.5 15l3.5 3.5L22 9.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="9.5" r="2" fill="#fff" />
    </svg>
  );
}
