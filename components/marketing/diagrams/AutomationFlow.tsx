/**
 * A small, honest diagram of how an automation runs: a document arrives, software extracts the details, a person
 * approves, the systems are updated. Labels are real text, so the figure is readable by screen readers through its
 * caption and scales with the page. No figures or results are implied.
 */
const STEPS = [
  { label: 'Document arrives', note: 'Email, upload or form' },
  { label: 'Details extracted', note: 'AI reads and checks fields' },
  { label: 'Person approves', note: 'Exceptions go to your team' },
  { label: 'Systems updated', note: 'CRM, finance, notifications' },
] as const;

export function AutomationFlow() {
  return (
    <figure className="rounded-xl border border-mk-line bg-mk-surface p-6 sm:p-8">
      <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-4">
        {/* the connecting line: vertical on mobile, horizontal from sm */}
        <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-mk-line-strong sm:bottom-auto sm:left-[7px] sm:right-[12%] sm:top-[7px] sm:h-px sm:w-auto" />
        {STEPS.map((step, i) => (
          <li key={step.label} className="relative grid grid-cols-[15px_1fr] gap-4 sm:block">
            <span aria-hidden="true"
              className={`relative z-10 mt-[3px] block h-[15px] w-[15px] rounded-full border sm:mt-0 ${i === 2 ? 'border-mk-accent bg-mk-accent' : 'border-mk-line-strong bg-mk-surface'}`} />
            <div className="sm:mt-5">
              <p className="text-[0.9375rem] font-medium text-mk-text">{step.label}</p>
              <p className="mk-small mt-1">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mk-small mt-8 border-t border-mk-line pt-5">
        A typical automation: software handles the routine path, and a person decides on the exceptions.
      </figcaption>
    </figure>
  );
}
