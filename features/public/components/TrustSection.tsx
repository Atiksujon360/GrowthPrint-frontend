import React from 'react';

/** Why GrowthPrint: commitments stated plainly. No testimonials, logos or statistics are claimed. */
const COMMITMENTS = [
  { title: 'You work with the engineer', text: 'GrowthPrint is a small studio on purpose. The person you talk to plans, builds and supports your software, so nothing is lost in hand-offs.' },
  { title: 'A clear plan before we start', text: 'We agree the important pieces, the milestones and what done means, so you always know what is being built.' },
  { title: 'Straightforward estimates', text: 'Clear pricing and a clear explanation of the work. If a request falls outside the plan, we talk about it before it becomes a surprise.' },
  { title: 'Careful with your data and code', text: 'Role-based access, validated inputs, hashed passwords and reviewed changes. Your data is used only for your project.' },
  { title: 'Help after launch', text: 'Every custom software delivery includes 30 days of defect fixes and performance tuning at no extra cost.' },
  { title: 'One place for everything', text: 'Your private client portal keeps milestones, estimates, approvals, requests and invoices together.' },
];

export function TrustSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  return (
    <section id="why-growthprint" aria-labelledby="why-title" className="border-b border-ink-200 bg-white">
      <div className="gp-frame py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 id="why-title" className="gp-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] text-ink-950 text-balance">
                A small studio, by design.{' '}
                <span className="gp-headline-muted">Clear communication and careful engineering.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-600">
                GrowthPrint suits founders and growing teams who want a dependable technical partner: someone who listens,
                explains the trade-offs in plain language, and follows through.
              </p>
            </div>
          </div>
          <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {COMMITMENTS.map(c => (
              <div key={c.title} className="border-t border-ink-200 py-7">
                <dt className="gp-display text-xl font-semibold text-ink-950">{c.title}</dt>
                <dd className="mt-2 text-[0.98rem] leading-relaxed text-ink-600">{c.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-8 rounded-2xl bg-brand-50 p-8 ring-1 ring-brand-100 sm:p-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h3 className="gp-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight text-ink-950">
              Have something that needs fixing or building?
            </h3>
            <p className="mt-3 text-lg text-ink-700">
              Tell us what is happening today and where you want to get to. We aim to reply within one business day with a useful next step.
            </p>
          </div>
          <button onClick={onOpenQuote}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-navy-950 px-6 font-semibold text-white transition-colors hover:bg-brand-700">
            Start a conversation
          </button>
        </div>
      </div>
    </section>
  );
}
