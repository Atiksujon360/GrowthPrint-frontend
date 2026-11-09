import React from 'react';

/** Delivery approach. A genuine sequence, so it is numbered and drawn as a timeline. */
const STEPS = [
  { title: 'Discovery', text: 'We learn how the work happens today, where it gets stuck and what a better day looks like, before recommending any technology.' },
  { title: 'Strategy', text: 'We agree what matters first, what it will take and how progress will be shown. You know what is included before work begins.' },
  { title: 'Design', text: 'Flows, screens and the system shape are worked out together, so decisions are cheap to change while they are still on paper.' },
  { title: 'Engineering', text: 'Built in small, tested increments with working previews you can try, so feedback arrives while there is time to use it.' },
  { title: 'Delivery', text: 'A careful release with data, access and monitoring checked, and a written hand-over of how everything fits together.' },
  { title: 'Ongoing improvement', text: 'Every custom build includes 30 days of defect fixes. After that, support and the next improvements when you are ready.' },
];

export function HowWeWorkSection() {
  return (
    <section id="process" aria-labelledby="process-title" className="gp-on-dark bg-navy-950 text-white">
      <div className="gp-frame py-20 md:py-28">
        <h2 id="process-title" className="gp-display max-w-3xl text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] text-balance">
          A delivery approach you can follow.{' '}
          <span className="gp-headline-muted">Six steps, each with something you can see.</span>
        </h2>

        <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative border-t border-white/15 pt-6">
              <span aria-hidden="true" className="absolute -top-px left-0 h-px w-12 bg-brand-400" />
              <p className="text-sm font-medium tabular-nums text-mint-300">Step {i + 1}</p>
              <h3 className="gp-display mt-2 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 max-w-sm text-[0.98rem] leading-relaxed text-white/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
