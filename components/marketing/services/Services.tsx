import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../content.ts';

/* Small drawn visuals, one per service. Decorative (aria-hidden): the text carries the meaning. */
function CodeVisual() {
  const lines = [['<', 'section', ' className', '="hero">'], ['  <', 'h1', '>', 'Build smarter.', '</h1>'], ['  <', 'Inquiry', ' service', '="web" />'], ['</', 'section', '>']];
  return (
    <div aria-hidden="true" className="absolute bottom-0 right-0 hidden w-[56%] rounded-tl-2xl border-l border-t border-white/12 bg-[#0b0716]/90 p-5 font-[ui-monospace,Consolas,monospace] text-[12.5px] leading-6 md:block">
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre">
          <span className="mr-4 text-white/25">{18 + i}</span>
          <span className="text-mk-muted">{l[0]}</span><span className="text-[#b794ff]">{l[1]}</span>
          <span className="text-[#7fd4ff]">{l[2]}</span><span className="text-[#f2c48d]">{l[3]}</span><span className="text-mk-muted">{l[4] ?? ''}</span>
        </div>
      ))}
    </div>
  );
}

function BarsVisual() {
  return (
    <div aria-hidden="true" className="mt-8 flex h-24 items-end gap-2">
      {[38, 62, 48, 80, 56, 92, 70].map((h, i) => (
        <span key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-mk-blue/60 to-mk-violet/80" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function FlowVisual() {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 90" className="mt-8 w-full">
      {[20, 120, 220].map((x, i) => (
        <g key={x}>
          <rect x={x} y="28" width="80" height="34" rx="10" fill="rgb(155 92 255 / 0.14)" stroke="rgb(155 92 255 / 0.55)" />
          {i < 2 && <path d={`M${x + 80} 45 H${x + 100}`} stroke="#9B5CFF" strokeWidth="2" />}
        </g>
      ))}
      <circle cx="304" cy="45" r="9" fill="#5ED6FF" opacity="0.9" /><path d="M300 45l3 3 6-6" stroke="#07050D" strokeWidth="2" fill="none" />
    </svg>
  );
}

function HubVisual() {
  const spokes = [[40, 20], [40, 80], [280, 20], [280, 80], [160, 8], [160, 92]];
  return (
    <svg aria-hidden="true" viewBox="0 0 320 100" className="mt-8 w-full">
      {spokes.map(([x, y], i) => <line key={i} x1="160" y1="50" x2={x} y2={y} stroke="rgb(155 92 255 / 0.5)" strokeWidth="1.5" />)}
      {spokes.map(([x, y], i) => <circle key={`c${i}`} cx={x} cy={y} r="6" fill="#171025" stroke="#9B5CFF" strokeWidth="1.5" />)}
      <circle cx="160" cy="50" r="15" fill="url(#hubg)" /><defs><radialGradient id="hubg"><stop offset="0" stopColor="#9B5CFF" /><stop offset="1" stopColor="#3826B7" /></radialGradient></defs>
    </svg>
  );
}

function ReviewVisual() {
  return (
    <ul aria-hidden="true" className="mt-8 space-y-2.5">
      {['Architecture', 'Performance', 'Security', 'Maintainability'].map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-[13px] text-mk-muted">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-mk-purple to-mk-cyan" style={{ width: `${[86, 72, 80, 64][i]}%` }} /></span>
          <span className="w-28 text-right">{label}</span>
        </li>
      ))}
    </ul>
  );
}

const VISUALS = { websites: CodeVisual, software: BarsVisual, automation: FlowVisual, integration: HubVisual, consulting: ReviewVisual } as const;
/* Asymmetric layout: a wide lead tile and a tall companion, then three tiles in a row. */
const PLACEMENT = {
  websites: 'lg:col-span-4 lg:min-h-[360px]',
  software: 'lg:col-span-2',
  automation: 'lg:col-span-2',
  integration: 'lg:col-span-2',
  consulting: 'lg:col-span-2',
} as const;

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-24 border-t border-mk-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 id="services-title" className="max-w-2xl text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.02em]">
            Everything your business needs to <em className="font-light italic">move forward.</em>
          </h2>
          <p className="max-w-md text-lg font-light leading-relaxed text-mk-muted">
            Five ways we help, usually combined: build the product, connect it, automate around it, and keep it improving.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map(service => {
            const Visual = VISUALS[service.id];
            return (
              <li key={service.id}
                className={`relative overflow-hidden rounded-[22px] border border-mk-line bg-gradient-to-br from-mk-soft via-mk-surface to-mk-bg p-7 sm:p-8 ${PLACEMENT[service.id]}`}>
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-mk-purple/20 blur-[90px]" />
                <div className={service.id === 'websites' ? 'relative md:max-w-[42%]' : 'relative'}>
                  <h3 className="text-xl font-medium sm:text-2xl">{service.title}</h3>
                  <p className="mt-3 font-light leading-relaxed text-mk-muted">{service.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {service.points.map(point => (
                      <li key={point} className="rounded-full border border-white/10 px-3 py-1 text-[13px] text-mk-muted">{point}</li>
                    ))}
                  </ul>
                  <a href="#start" data-service={service.id}
                    className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-white hover:text-mk-violet">
                    Discuss this service <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <Visual />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
