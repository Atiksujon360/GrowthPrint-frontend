import React from 'react';

/**
 * Work. GrowthPrint has no published client case studies yet, so these are labelled illustrative engagements:
 * typical problems and the approach, not claims about a specific customer. Each has a before/after diagram
 * instead of a stock photo.
 */
const CASES = [
  {
    kind: 'Illustrative engagement',
    area: 'Operations and internal tools',
    title: 'Replacing spreadsheet hand-offs with one internal web app',
    problem: 'Orders, stock and status updates live in several spreadsheets and inboxes, so information is re-typed, delayed and occasionally wrong.',
    approach: 'A focused web application with one shared database, role-based access, integrations with the tools already in use, and a simple status view for customers.',
    outcomes: ['One source of truth instead of copies that drift apart', 'Less manual re-typing and fewer copy-paste mistakes', 'Clear status for the team and for customers'],
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    diagram: 'consolidate' as const,
  },
  {
    kind: 'Illustrative engagement',
    area: 'Process automation',
    title: 'Automating a repetitive workflow, with a human approval step',
    problem: 'Status updates arrive by email and file attachments, and someone has to read, re-enter and forward each one by hand.',
    approach: 'An automation that reads incoming updates, validates them, retries safely when a system is down, and asks a person to approve anything consequential.',
    outcomes: ['Routine updates handled automatically and logged', 'Failures are visible and retried instead of silently lost', 'People stay in control of important decisions'],
    stack: ['TypeScript', 'Java / Spring Boot', 'PostgreSQL', 'Webhooks'],
    diagram: 'automate' as const,
  },
];

export function CaseStudiesSection() {
  return (
    <section id="work" aria-labelledby="work-title" className="border-b border-ink-200 bg-ink-50">
      <div className="gp-frame py-20 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="work-title" className="gp-display max-w-3xl text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] text-ink-950 text-balance">
            The kind of work we take on.{' '}
            <span className="gp-headline-muted">Typical problems, and how they get solved.</span>
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-ink-600">
            These are illustrative examples, not specific clients. Ask for references relevant to your project.
          </p>
        </div>

        <div className="mt-14 space-y-6">
          {CASES.map(c => (
            <article key={c.title} className="grid overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200 lg:grid-cols-12">
              <div className="flex items-center bg-navy-950 p-6 lg:col-span-5 lg:p-8">
                <CaseDiagram kind={c.diagram} />
              </div>
              <div className="p-6 sm:p-10 lg:col-span-7">
                <p className="text-sm text-ink-500">
                  <span className="mr-2 inline-flex rounded-full bg-mint-100 px-2.5 py-0.5 font-medium text-mint-800">{c.kind}</span>
                  {c.area}
                </p>
                <h3 className="gp-display mt-4 text-[1.7rem] font-semibold leading-tight text-ink-950">{c.title}</h3>
                <dl className="mt-6 grid gap-5 text-[0.98rem] leading-relaxed sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink-900">The problem</dt>
                    <dd className="mt-1 text-ink-600">{c.problem}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-900">The approach</dt>
                    <dd className="mt-1 text-ink-600">{c.approach}</dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-ink-100 pt-5">
                  <p className="text-sm font-semibold text-ink-900">Designed to improve</p>
                  <ul className="mt-2 space-y-1.5">
                    {c.outcomes.map(o => (
                      <li key={o} className="flex gap-3 text-[0.98rem] text-ink-700">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{o}
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
                  {c.stack.map(t => <li key={t} className="rounded-md bg-ink-100 px-2.5 py-1 text-sm font-medium text-ink-700">{t}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Before/after diagram: scattered sources on the left, the organised system on the right. */
function CaseDiagram({ kind }: { kind: 'consolidate' | 'automate' }) {
  const before = kind === 'consolidate' ? ['Spreadsheet A', 'Spreadsheet B', 'Inbox', 'Chat'] : ['Email', 'Attachments', 'Manual re-entry', 'Forwarding'];
  const after = kind === 'consolidate' ? 'One web app' : 'Automation';
  const tail = kind === 'consolidate' ? 'Status for customers' : 'Person approves';
  return (
    <svg viewBox="0 0 360 240" className="h-auto w-full" role="img"
      aria-label={`Before: ${before.join(', ')}. After: ${after}, then ${tail.toLowerCase()}.`}>
      <pattern id={`g-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="rgb(255 255 255 / 0.06)" />
      </pattern>
      <rect width="360" height="240" fill={`url(#g-${kind})`} />
      <text x="10" y="18" fill="rgb(255 255 255 / 0.5)" fontSize="11" fontFamily="var(--font-ui)">Before</text>
      <text x="200" y="18" fill="rgb(255 255 255 / 0.5)" fontSize="11" fontFamily="var(--font-ui)">After</text>
      {before.map((b, i) => (
        <g key={b}>
          <rect x="10" y={34 + i * 48} width="120" height="34" rx="8" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeDasharray="4 4" />
          <text x="22" y={56 + i * 48} fill="rgb(255 255 255 / 0.75)" fontSize="12" fontFamily="var(--font-ui)">{b}</text>
          <path d={`M130 ${51 + i * 48} C 165 ${51 + i * 48}, 165 120, 200 120`} fill="none" stroke="var(--color-mint-300)" strokeOpacity="0.7" />
        </g>
      ))}
      <rect x="200" y="98" width="140" height="44" rx="10" fill="rgb(22 160 131 / 0.18)" stroke="var(--color-brand-400)" />
      <text x="214" y="125" fill="white" fontSize="14" fontWeight="600" fontFamily="var(--font-display)">{after}</text>
      <path d="M270 142 V 178" stroke="var(--color-mint-300)" />
      <rect x="200" y="178" width="140" height="34" rx="8" fill="none" stroke="rgb(255 255 255 / 0.55)" />
      <text x="214" y="200" fill="rgb(255 255 255 / 0.85)" fontSize="12" fontFamily="var(--font-ui)">{tail}</text>
    </svg>
  );
}
