import { ENGAGEMENTS, PROCESS, TECHNOLOGY } from '../content.ts';

/** Technology: what we build with, grouped. Plain lists, no logos (we use no trademarked marks). */
export function Technology() {
  return (
    <section aria-labelledby="tech-title" className="border-t border-mk-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-28">
        <h2 id="tech-title" className="max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          Engineering capabilities, <em className="font-light italic">end to end.</em>
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-mk-line bg-mk-line sm:grid-cols-2 lg:grid-cols-4">
          {TECHNOLOGY.map(group => (
            <div key={group.group} className="bg-mk-bg p-7 sm:p-8">
              <h3 className="text-lg font-medium text-white">{group.group}</h3>
              <ul className="mt-5 space-y-3">
                {group.items.map(item => <li key={item} className="font-light text-mk-muted">{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** How we work: a true sequence, so the steps are numbered and joined by a line. */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="relative scroll-mt-24 overflow-hidden border-t border-mk-line">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-[500px] w-[700px] rounded-full bg-mk-blue/15 blur-[150px]" />
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <h2 id="process-title" className="max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          How a project <em className="font-light italic">comes together.</em>
        </h2>
        <ol className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
          <span aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-mk-violet/70 via-mk-blue/60 to-mk-cyan/50 lg:block" />
          {PROCESS.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[3rem_1fr] gap-5 lg:block">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-mk-violet/60 bg-mk-bg text-[15px] font-medium text-white">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="lg:mt-7 lg:pr-4">
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="mt-3 font-light leading-relaxed text-mk-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Ways to work together. Deliberately no prices: those are agreed per project. */
export function Engagement() {
  return (
    <section aria-labelledby="engage-title" className="border-t border-mk-line">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-14 lg:py-32">
        <div>
          <h2 id="engage-title" className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Ways to work <em className="font-light italic">together.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-mk-muted">
            Pick the shape that matches the work. Scope and pricing are agreed with you in writing before anything starts.
          </p>
        </div>
        <div className="overflow-hidden rounded-[22px] border border-mk-line">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Engagement models</caption>
            <thead className="hidden bg-mk-surface text-sm text-mk-dim md:table-header-group">
              <tr><th scope="col" className="px-6 py-4 font-normal">Model</th><th scope="col" className="px-6 py-4 font-normal">Fits when</th><th scope="col" className="px-6 py-4 font-normal">You get</th></tr>
            </thead>
            <tbody>
              {ENGAGEMENTS.map(e => (
                <tr key={e.title} className="block border-t border-mk-line first:border-t-0 md:table-row md:first:border-t">
                  <th scope="row" className="block px-6 pt-6 text-lg font-medium md:table-cell md:py-6 md:align-top">{e.title}</th>
                  <td className="block px-6 pt-2 font-light text-mk-muted md:table-cell md:py-6 md:align-top">{e.fits}</td>
                  <td className="block px-6 pb-6 pt-2 font-light text-mk-muted md:table-cell md:py-6 md:align-top">{e.gets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
