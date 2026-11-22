import { ProjectInquiryForm } from '../../../features/inquiries/ProjectInquiryForm.tsx';

/** Start a project: what happens after sending, next to the form. */
export function ContactSection() {
  return (
    <section id="start" aria-labelledby="start-title" className="mk-cream relative scroll-mt-20 overflow-hidden border-t border-mk-line bg-mk-bg">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-20 -z-10 h-[560px] w-[560px] rounded-full bg-mk-purple/10 blur-[150px]" />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-14 lg:py-32">
        <div className="mk-reveal">
          <h2 id="start-title" className="font-medium leading-[1.1] tracking-[-0.02em] text-[clamp(1.875rem,3.6vw,3.125rem)]">
            Start a <em className="font-light italic">project.</em>
          </h2>
          <p className="mt-6 max-w-md font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
            A few details are enough to begin. A person reads every inquiry; nothing is sent to you automatically.
          </p>
          <ol className="mt-10 space-y-6">
            {[
              ['You send the form', 'You receive a reference number straight away.'],
              ['We review it', 'We read your goals and note the questions we need to ask.'],
              ['We reply', 'By email or with a discovery call, whichever you chose.'],
            ].map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[2.25rem_1fr] gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-mk-purple/50 text-sm font-medium text-mk-violet">{i + 1}</span>
                <div><p className="font-medium text-[clamp(1rem,1.1vw,1.125rem)]">{title}</p><p className="mt-1 font-light text-mk-muted">{text}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mk-reveal"><ProjectInquiryForm /></div>
      </div>
    </section>
  );
}
