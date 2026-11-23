/**
 * Our Work. Only genuine work is shown: GrowthPrint's own operations platform, clearly labelled as an internal
 * product. Its screenshots use demo data, and the caption says so. Client case studies are added here once a client
 * has approved publication (TODO: none are approved yet).
 */
export function OurWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="mk-dark scroll-mt-24 border-t border-mk-line bg-mk-bg">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-24 -z-10 h-[480px] w-[480px] rounded-full bg-mk-purple/10 blur-[140px]" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div className="mk-reveal">
            <p className="inline-flex items-center gap-2 rounded-full border border-mk-purple/40 bg-mk-purple/10 px-4 py-2 text-[13px] font-medium text-mk-purple">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mk-purple" /> Internal GrowthPrint product
            </p>
            <h2 id="work-title" className="mt-6 font-medium leading-[1.1] tracking-[-0.02em] text-[clamp(1.875rem,3.6vw,3.125rem)]">
              We run our own agency on software we built.
            </h2>
            <p className="mt-6 font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
              GrowthPrint Studio and Client Hub cover our whole operation: inquiries and leads, clients, projects and milestones,
              support requests with estimates, proposals, invoices with PDF export and payment checks, team access and optional AI
              suggestions. It is the same kind of system we build for clients.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] font-medium text-mk-muted">
              {['Next.js and React frontend', 'Spring Boot API', 'PostgreSQL with migrations', 'Role-based access', 'Client self-service portal', 'Automated test suites'].map(item => (
                <li key={item} className="flex items-center gap-2.5"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mk-violet" />{item}</li>
              ))}
            </ul>
          </div>

          <figure className="mk-reveal relative">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-mk-purple/10 blur-[100px]" />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-mk-surface shadow-[0_50px_120px_-40px_rgb(0_0_0/0.8)] ring-1 ring-white/5">
              <img src="/images/work/growthprint-studio-dashboard.webp" width={1440} height={1000} decoding="async"
                alt="GrowthPrint Studio dashboard with project, lead, client and invoice summaries and charts"
                className="block w-full" />
            </div>
            <figcaption className="mt-4 text-[13px] text-mk-dim">GrowthPrint Studio dashboard, shown with demo data.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
