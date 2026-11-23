import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../content.ts';

/* Small drawn visuals, one per service. Decorative (aria-hidden): the text carries the meaning. */
function CodeVisual() {
  const lines = [['<', 'section', ' className', '="hero">'], ['  <', 'h1', '>', 'Build smarter.', '</h1>'], ['  <', 'Inquiry', ' service', '="web" />'], ['</', 'section', '>']];
  return (
    <div aria-hidden="true" className="absolute bottom-0 right-0 hidden w-[56%] rounded-tl-2xl border-l border-t border-mk-line bg-mk-code p-5 font-[ui-monospace,Consolas,monospace] text-[12.5px] leading-6 md:block">
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre">
          <span className="mr-4 text-white/25">{18 + i}</span>
          <span className="text-mk-muted">{l[0]}</span><span className="text-[#ffb38a]">{l[1]}</span>
          <span className="text-[#e8c9ae]">{l[2]}</span><span className="text-[#ffd2a8]">{l[3]}</span><span className="text-mk-muted">{l[4] ?? ''}</span>
        </div>
      ))}
    </div>
  );
}

function BarsVisual() {
  return (
    <div aria-hidden="true" className="mt-8 flex h-24 items-end gap-2">
      {[38, 62, 48, 80, 56, 92, 70].map((h, i) => (
        <span key={i} className="flex-1 rounded-t-md bg-mk-purple/80" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function FlowVisual() {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 90" className="mt-8 w-full">
      {[20, 120, 220].map((x, i) => (
        <g key={x}>
          <rect x={x} y="28" width="80" height="34" rx="10" fill="var(--mk-purple)" fillOpacity="0.14" stroke="var(--mk-purple)" strokeOpacity="0.6" />
          {i < 2 && <path d={`M${x + 80} 45 H${x + 100}`} stroke="var(--mk-purple)" strokeWidth="2" />}
        </g>
      ))}
      <circle cx="304" cy="45" r="9" fill="var(--mk-purple)" opacity="0.9" /><path d="M300 45l3 3 6-6" stroke="var(--mk-code)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function HubVisual() {
  const spokes = [[40, 20], [40, 80], [280, 20], [280, 80], [160, 8], [160, 92]];
  return (
    <svg aria-hidden="true" viewBox="0 0 320 100" className="mt-8 w-full">
      {spokes.map(([x, y], i) => <line key={i} x1="160" y1="50" x2={x} y2={y} stroke="var(--mk-purple)" strokeOpacity="0.5" strokeWidth="1.5" />)}
      {spokes.map(([x, y], i) => <circle key={`c${i}`} cx={x} cy={y} r="6" fill="var(--mk-surface)" stroke="var(--mk-purple)" strokeWidth="1.5" />)}
      <circle cx="160" cy="50" r="15" fill="var(--mk-purple)" />
    </svg>
  );
}

function ReviewVisual() {
  return (
    <ul aria-hidden="true" className="mt-8 space-y-2.5">
      {['Architecture', 'Performance', 'Security', 'Maintainability'].map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-[13px] text-mk-muted">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-mk-line"><span className="block h-full rounded-full bg-mk-purple/80" style={{ width: `${[86, 72, 80, 64][i]}%` }} /></span>
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
    <section id="services" aria-labelledby="services-title" className="mk-cream scroll-mt-24 border-t border-mk-line bg-mk-bg">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="mk-reveal flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 id="services-title" className="max-w-2xl font-medium leading-[1.08] tracking-[-0.02em] text-[clamp(2rem,3.8vw,3.375rem)]">
            Everything your business needs to <em className="font-light italic">move forward.</em>
          </h2>
          <p className="max-w-md font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
            Five ways we help, usually combined: build the product, connect it, automate around it, and keep it improving.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map(service => {
            const Visual = VISUALS[service.id];
            return (
              <li key={service.id}
                className={`mk-reveal relative overflow-hidden rounded-2xl border p-7 transition-transform duration-300 ease-out hover:-translate-y-1 sm:p-8 ${PLACEMENT[service.id]} ${service.id === 'websites'
                  ? 'mk-dark border-white/10 bg-gradient-to-br from-[#211824] via-[#19121D] to-[#100B12] shadow-[0_40px_90px_-40px_rgb(16_11_18/0.7)]'
                  : 'border-mk-line bg-gradient-to-br from-mk-soft via-mk-surface to-mk-bg'}`}>
                <div className={service.id === 'websites' ? 'relative md:max-w-[42%]' : 'relative'}>
                  <h3 className="font-medium text-[clamp(1.125rem,1.5vw,1.375rem)] sm:text-[1.375rem]">{service.title}</h3>
                  <p className="mt-3 font-light leading-[1.65] text-[clamp(0.9375rem,1.1vw,1rem)] text-mk-muted">{service.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {service.points.map(point => (
                      <li key={point} className="rounded-full border border-mk-line px-3 py-1 text-[13px] font-medium text-mk-muted">{point}</li>
                    ))}
                  </ul>
                  <a href="#start" data-service={service.id}
                    className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-mk-text transition-colors duration-150 hover:text-mk-violet">
                    Discuss this service <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
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
