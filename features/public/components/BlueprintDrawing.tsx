/**
 * Hero visual: a system blueprint (website, client portal, API, automations, data, AI assist) drawn on a navy
 * grid. It is the page's one orchestrated motion: lines draw in once; prefers-reduced-motion shows it finished.
 * Pure SVG + CSS, no JavaScript and no image download.
 */
const NODES = [
  { id: 'web', x: 40, y: 48, w: 150, label: 'Website', sub: 'Fast, findable pages' },
  { id: 'portal', x: 40, y: 228, w: 150, label: 'Client portal', sub: 'Approvals and invoices' },
  { id: 'api', x: 262, y: 138, w: 128, label: 'API layer', sub: 'One source of truth' },
  { id: 'auto', x: 450, y: 48, w: 150, label: 'Automations', sub: 'Retries and alerts' },
  { id: 'data', x: 450, y: 228, w: 150, label: 'Database', sub: 'Backed up, audited' },
  { id: 'ai', x: 262, y: 280, w: 128, label: 'AI assist', sub: 'Human approval' },
] as const;

const LINKS = [
  'M190 76 C 225 76, 225 166, 262 166',
  'M190 256 C 225 256, 225 166, 262 166',
  'M390 166 C 420 166, 420 76, 450 76',
  'M390 166 C 420 166, 420 256, 450 256',
  'M326 194 L 326 280',
];

export function BlueprintDrawing() {
  return (
    <figure className="relative overflow-hidden rounded-2xl bg-navy-950 p-4 text-white ring-1 ring-navy-800 sm:p-6">
      <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img"
        aria-labelledby="blueprint-title blueprint-desc">
        <title id="blueprint-title">A connected business system</title>
        <desc id="blueprint-desc">
          A website and a client portal connect through one API layer to automations, a database and an AI assistant
          that keeps a person in the approval loop.
        </desc>
        <defs>
          <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0H0V100" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="400" fill="url(#bp-grid)" />
        <rect width="640" height="400" fill="url(#bp-grid-major)" />

        {LINKS.map((d, i) => (
          <path key={d} d={d} className="gp-draw" fill="none" stroke="var(--color-mint-300)" strokeWidth="1.6"
            style={{ ['--len' as string]: 260, ['--delay' as string]: `${300 + i * 140}ms` }} />
        ))}

        {NODES.map((n, i) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={n.w} height="56" rx="10" className="gp-draw" fill="rgb(255 255 255 / 0.03)"
              stroke={n.id === 'api' ? 'var(--color-brand-400)' : 'rgb(255 255 255 / 0.55)'} strokeWidth="1.2"
              style={{ ['--len' as string]: 2 * (n.w + 56), ['--delay' as string]: `${i * 110}ms` }} />
            <g className="gp-fade-late" style={{ ['--delay' as string]: `${700 + i * 90}ms` }}>
              <text x={n.x + 14} y={n.y + 24} fill="white" fontSize="14" fontWeight="600"
                fontFamily="var(--font-display)">{n.label}</text>
              <text x={n.x + 14} y={n.y + 42} fill="rgb(255 255 255 / 0.6)" fontSize="11.5"
                fontFamily="var(--font-ui)">{n.sub}</text>
            </g>
          </g>
        ))}

        {/* Growth line along the base: the "growth" in the print. */}
        <path d="M40 388 L 180 382 L 300 385 L 420 370 L 600 352" className="gp-draw" fill="none"
          stroke="var(--color-brand-400)" strokeWidth="2.2" strokeLinecap="round"
          style={{ ['--len' as string]: 600, ['--delay' as string]: '1100ms' }} />
        <circle cx="600" cy="352" r="4.5" className="gp-fade-late" fill="var(--color-brand-400)"
          style={{ ['--delay' as string]: '2200ms' }} />
      </svg>
      <figcaption className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-[0.8rem] text-white/60">
        <span>Illustrative system blueprint</span>
        <span>Designed, built and supported end to end</span>
      </figcaption>
    </figure>
  );
}
