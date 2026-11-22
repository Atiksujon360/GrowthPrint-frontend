/**
 * Original hero artwork for the GrowthPrint marketing site: a cinematic "engineering system" composition —
 * a perspective grid floor, layered glow orbs, glass interface panels with top-edge highlights, flowing
 * coral light ribbons, orbit rings and connection nodes. Drawn entirely in SVG with the marketing palette
 * vars, so it re-themes inside its .mk-dark scope. Decorative only; the copy carries the meaning.
 */
export function HeroVisual() {
  return (
    <svg viewBox="0 0 640 640" className="mk-float h-auto w-full" role="img"
      aria-label="Abstract illustration of connected software systems: glowing orange ribbons, orbit rings, glass interface panels and a perspective grid">
      <defs>
        <radialGradient id="hv-glow-a" cx="30%" cy="22%" r="70%">
          <stop offset="0%" style={{ stopColor: '#FF572E', stopOpacity: 0.55 }} />
          <stop offset="50%" style={{ stopColor: '#FF572E', stopOpacity: 0.18 }} />
          <stop offset="100%" style={{ stopColor: '#FF572E', stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="hv-glow-b" cx="78%" cy="82%" r="65%">
          <stop offset="0%" style={{ stopColor: '#FF9A70', stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: '#FF9A70', stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="hv-ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF572E" />
          <stop offset="55%" stopColor="#FF7845" />
          <stop offset="100%" stopColor="#FF9A70" />
        </linearGradient>
        <linearGradient id="hv-ribbon-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9A70" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF572E" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="hv-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#291E2C" />
          <stop offset="100%" stopColor="#19121D" />
        </linearGradient>
        <linearGradient id="hv-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF572E" stopOpacity="0" />
          <stop offset="50%" stopColor="#FF572E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF9A70" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hv-sphere" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="35%" stopColor="#FFB38A" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#FF572E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF572E" stopOpacity="0.02" />
        </radialGradient>
        <filter id="hv-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* ambient light pools */}
      <ellipse cx="205" cy="165" rx="310" ry="250" fill="url(#hv-glow-a)" />
      <ellipse cx="475" cy="505" rx="290" ry="225" fill="url(#hv-glow-b)" />

      {/* perspective engineering grid, fading toward the horizon */}
      <g stroke="#FF7845" strokeOpacity="0.14">
        {[70, 140, 210, 280, 350, 420, 490, 560].map(x => <line key={`v${x}`} x1={320 + (x - 320) * 0.55} y1="610" x2={x} y2="330" />)}
        {[380, 420, 470, 530, 600].map(y => <line key={`h${y}`} x1="20" y1={y} x2="620" y2={y} />)}
      </g>
      <rect x="20" y="330" width="600" height="280" fill="url(#hv-glow-b)" opacity="0.05" />

      {/* orbital rings */}
      <g fill="none">
        <ellipse cx="335" cy="315" rx="238" ry="122" transform="rotate(-18 335 315)" stroke="#FF572E" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 8" />
        <ellipse cx="335" cy="315" rx="238" ry="122" transform="rotate(24 335 315)" stroke="#FF9A70" strokeOpacity="0.22" strokeWidth="1" />
        <ellipse cx="335" cy="315" rx="170" ry="86" transform="rotate(-8 335 315)" stroke="#FF7845" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="1 6" />
      </g>
      <circle cx="472" cy="238" r="7" fill="#FF572E" />
      <circle cx="472" cy="238" r="14" fill="#FF572E" opacity="0.25" filter="url(#hv-soft)" />
      <circle cx="182" cy="418" r="5" fill="#FF9A70" />

      {/* lit glass orb — the dimensional focal element */}
      <g>
        <circle cx="255" cy="200" r="86" fill="url(#hv-sphere)" />
        <circle cx="255" cy="200" r="86" fill="none" stroke="#FF9A70" strokeOpacity="0.35" strokeWidth="1.5" />
        <ellipse cx="228" cy="168" rx="26" ry="15" fill="#FFFFFF" opacity="0.5" transform="rotate(-24 228 168)" filter="url(#hv-soft)" />
        <ellipse cx="255" cy="286" rx="70" ry="10" fill="#FF572E" opacity="0.12" filter="url(#hv-soft)" />
      </g>

      {/* flowing light ribbons with soft under-glow */}
      <g fill="none" strokeLinecap="round">
        <path d="M60 430 C 150 350, 210 470, 300 400 S 470 300, 560 380" stroke="#FF572E" strokeOpacity="0.35" strokeWidth="40" filter="url(#hv-soft)" />
        <path d="M60 430 C 150 350, 210 470, 300 400 S 470 300, 560 380" stroke="url(#hv-ribbon)" strokeWidth="22" opacity="0.95" />
        <path d="M60 472 C 160 402, 240 502, 330 442 S 480 352, 570 422" stroke="url(#hv-ribbon-soft)" strokeWidth="13" />
        <path d="M90 252 C 190 192, 260 282, 350 232 S 500 162, 580 212" stroke="url(#hv-ribbon-soft)" strokeWidth="9" />
      </g>

      {/* connection nodes with dashed links — the automation motif */}
      <g stroke="#FF7845" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 6" fill="none">
        <path d="M150 210 L 250 290" />
        <path d="M430 300 L 500 210" />
        <path d="M300 480 L 390 430" />
      </g>
      <g>
        <circle cx="150" cy="210" r="10" fill="#19121D" stroke="#FF572E" strokeWidth="2.5" />
        <circle cx="150" cy="210" r="3.5" fill="#FF572E" />
        <circle cx="250" cy="290" r="13" fill="#FF572E" />
        <circle cx="250" cy="290" r="20" fill="#FF572E" opacity="0.22" filter="url(#hv-soft)" />
        <circle cx="430" cy="300" r="10" fill="#19121D" stroke="#FF9A70" strokeWidth="2.5" />
        <circle cx="430" cy="300" r="3.5" fill="#FF9A70" />
        <circle cx="500" cy="210" r="8" fill="#19121D" stroke="#FF7845" strokeWidth="2" />
        <circle cx="300" cy="480" r="10" fill="#19121D" stroke="#FF572E" strokeWidth="2.5" />
        <circle cx="300" cy="480" r="3.5" fill="#FF572E" />
        <circle cx="390" cy="430" r="13" fill="#FF9A70" />
      </g>

      {/* glass interface panels with lit top edges */}
      <g>
        <rect x="428" y="378" width="152" height="98" rx="16" fill="url(#hv-panel)" stroke="#FF7845" strokeOpacity="0.35" />
        <rect x="428" y="378" width="152" height="98" rx="16" fill="#FFFFFF" opacity="0.04" />
        <rect x="428" y="378" width="152" height="2" rx="1" fill="url(#hv-edge)" />
        <rect x="444" y="396" width="72" height="9" rx="4.5" fill="#FF572E" opacity="0.9" />
        <rect x="444" y="416" width="120" height="6" rx="3" fill="#F7F2F3" opacity="0.28" />
        <rect x="444" y="430" width="98" height="6" rx="3" fill="#F7F2F3" opacity="0.2" />
        <rect x="444" y="450" width="54" height="14" rx="7" fill="#FF572E" opacity="0.9" />
      </g>
      <g>
        <rect x="68" y="118" width="122" height="78" rx="14" fill="url(#hv-panel)" stroke="#FF7845" strokeOpacity="0.3" />
        <rect x="68" y="118" width="122" height="2" rx="1" fill="url(#hv-edge)" />
        <circle cx="95" cy="145" r="9" fill="none" stroke="#FF9A70" strokeWidth="4" strokeDasharray="34 22" transform="rotate(-90 95 145)" />
        <rect x="114" y="137" width="54" height="8" rx="4" fill="#F7F2F3" opacity="0.3" />
        <rect x="114" y="153" width="36" height="6" rx="3" fill="#F7F2F3" opacity="0.2" />
        <rect x="114" y="165" width="44" height="6" rx="3" fill="#F7F2F3" opacity="0.16" />
      </g>
      <g>
        <rect x="518" y="88" width="88" height="62" rx="12" fill="url(#hv-panel)" stroke="#FF7845" strokeOpacity="0.3" />
        <rect x="518" y="88" width="88" height="2" rx="1" fill="url(#hv-edge)" />
        {[0, 1, 2].map(i => <rect key={i} x="534" y={104 + i * 14} width={i === 2 ? 32 : 54} height="6" rx="3" fill="#FF9A70" opacity={0.85 - i * 0.25} />)}
      </g>

      {/* rising signal dots along the left beam */}
      <g fill="#FF572E">
        <circle cx="120" cy="330" r="3" opacity="0.7" />
        <circle cx="132" cy="352" r="2.5" opacity="0.5" />
        <circle cx="146" cy="376" r="2" opacity="0.35" />
      </g>

      {/* sparkle accents */}
      <g fill="#FF9A70">
        <path d="M210 88 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" opacity="0.85" />
        <path d="M562 298 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" opacity="0.7" />
        <path d="M596 470 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" opacity="0.6" />
      </g>
    </svg>
  );
}
