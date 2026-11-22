import { BrandMark } from '../BrandMark.tsx';
import { NAV_LINKS, SERVICES } from '../content.ts';

/**
 * Footer. Contact: the address already published on the previous site (TODO owner: confirm it is monitored).
 * No social links are shown because none have been verified (TODO owner: add official profiles when available).
 */
export function MarketingFooter() {
  return (
    <footer className="mk-dark border-t border-mk-line bg-mk-bg">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-14">
        <div>
          <a href="/#top" className="inline-flex items-center gap-3" aria-label="GrowthPrint, back to top">
            <BrandMark className="h-10 w-10" /><span className="text-[17px] font-semibold italic">GrowthPrint</span>
          </a>
          <p className="mt-5 max-w-xs font-light leading-[1.65] text-[15px] text-mk-muted">
            Your technology partner for building, modernizing and automating the future of your business.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-[15px] font-medium text-mk-text">Company</h2>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map(l => <li key={l.label}><a href={l.href} className="font-light text-[15px] text-mk-muted hover:text-mk-text">{l.label}</a></li>)}
            <li><a href="/#faq" className="font-light text-[15px] text-mk-muted hover:text-mk-text">FAQ</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-[15px] font-medium text-mk-text">Services</h2>
          <ul className="mt-4 space-y-3">
            {SERVICES.map(s => <li key={s.id}><a href="/#services" className="font-light text-[15px] text-mk-muted hover:text-mk-text">{s.title}</a></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-[15px] font-medium text-mk-text">Contact</h2>
          <ul className="mt-4 space-y-3">
            <li><a href="/#start" className="font-light text-[15px] text-mk-muted hover:text-mk-text">Start a project</a></li>
            <li><a href="mailto:contact@growthprint.agency" className="font-light text-[15px] text-mk-muted hover:text-mk-text">contact@growthprint.agency</a></li>
            <li><a href="/client-hub/login" className="font-light text-[15px] text-mk-muted hover:text-mk-text">Client sign-in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mk-line">
        <p className="mx-auto max-w-[1440px] px-5 py-6 text-sm font-light text-mk-dim sm:px-8 lg:px-14">
          &copy; {new Date().getFullYear()} GrowthPrint. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
