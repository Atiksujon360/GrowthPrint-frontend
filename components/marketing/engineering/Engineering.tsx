import { TECHNOLOGY } from '../content.ts';

/**
 * Engineering capabilities, set like a specification sheet, followed by proof: GrowthPrint's own operations platform.
 * Only technologies GrowthPrint delivers today are listed. The screenshot uses demo data and says so. Client case
 * studies are added here once a client has approved publication (none are approved yet).
 */
export function Engineering() {
  return (
    <section id="engineering" aria-labelledby="engineering-title" className="mk-dense scroll-mt-16">
      <span id="work" className="block" aria-hidden="true" />
      <div className="mk-container">
        <div className="mk-grid gap-y-6">
          <h2 id="engineering-title" className="mk-h2 col-span-4 sm:col-span-6 lg:col-span-5">Engineering capabilities</h2>
          <p className="mk-body col-span-4 sm:col-span-6 lg:col-span-5 lg:col-start-8 lg:pt-2">
            The tools we build with every day. We add others when a project needs them, and say so when we do.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-5 border-t border-mk-line-strong lg:mt-16 lg:grid-cols-4">
          {TECHNOLOGY.map(group => (
            <div key={group.group} className="border-b border-mk-line py-7 sm:pr-8 lg:border-b-0 lg:py-9">
              <dt className="text-[0.9375rem] font-semibold text-mk-text">{group.group}</dt>
              <dd className="mt-4">
                <ul className="space-y-2.5">
                  {group.items.map(item => <li key={item} className="mk-body">{item}</li>)}
                </ul>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mk-grid mk-reveal mt-20 items-center gap-y-10 lg:mt-28">
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <p className="mk-small">Our own platform</p>
            <h3 className="mk-h2 mt-3">We run our business on what we build.</h3>
            <p className="mk-body mt-5">
              GrowthPrint Studio and Client Hub handle our inquiries, clients, projects, support requests, proposals and
              invoices. It is a Next.js and Spring Boot system with role-based access and automated tests: the same kind of
              system we build for clients.
            </p>
          </div>
          <figure className="col-span-4 sm:col-span-8 lg:col-span-7 lg:col-start-6">
            <div className="overflow-hidden rounded-xl border border-mk-line bg-mk-surface">
              <img src="/images/work/growthprint-studio-dashboard.webp" width={1440} height={1000} loading="lazy" decoding="async"
                alt="GrowthPrint Studio dashboard with project, lead, client and invoice summaries and charts"
                className="block h-auto w-full" />
            </div>
            <figcaption className="mk-small mt-3">GrowthPrint Studio dashboard, shown with demo data.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
