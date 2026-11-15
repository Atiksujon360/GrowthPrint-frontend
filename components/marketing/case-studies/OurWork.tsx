/**
 * Our Work. Only genuine work is shown: GrowthPrint's own operations platform, clearly labelled as an internal
 * product. Its screenshots use demo data, and the caption says so. Client case studies are added here once a client
 * has approved publication (TODO: none are approved yet).
 */
export function OurWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-24 border-t border-mk-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="inline-flex rounded-full border border-mk-cyan/40 bg-mk-cyan/[0.06] px-3.5 py-1.5 text-[13px] text-[#bfefff]">
              Internal GrowthPrint product
            </p>
            <h2 id="work-title" className="mt-6 text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
              We run our own agency on software we built.
            </h2>
            <p className="mt-6 text-lg font-light leading-relaxed text-mk-muted">
              GrowthPrint Studio and Client Hub cover our whole operation: inquiries and leads, clients, projects and milestones,
              support requests with estimates, proposals, invoices with PDF export and payment checks, team access and optional AI
              suggestions. It is the same kind of system we build for clients.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] text-mk-muted">
              {['Next.js and React frontend', 'Spring Boot API', 'PostgreSQL with migrations', 'Role-based access', 'Client self-service portal', 'Automated test suites'].map(item => (
                <li key={item} className="flex items-center gap-2.5"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mk-violet" />{item}</li>
              ))}
            </ul>
          </div>

          <figure className="relative">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-mk-blue/20 blur-[100px]" />
            <div className="overflow-hidden rounded-[18px] border border-white/15 bg-mk-surface shadow-[0_40px_100px_-40px_rgb(56_38_183/0.8)]">
              <img src="/images/work/growthprint-studio-dashboard.webp" width={1440} height={1000} loading="lazy" decoding="async"
                alt="GrowthPrint Studio dashboard with project, lead, client and invoice summaries and charts"
                className="block w-full" />
            </div>
            <figcaption className="mt-4 text-sm text-mk-dim">GrowthPrint Studio dashboard, shown with demo data.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
