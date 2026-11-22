'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../content.ts';
import { BrandMark } from '../BrandMark.tsx';

/**
 * Transparent top navigation. The active link follows the section in view (sections are observed by id).
 * Below the lg breakpoint the links move into a full-width sheet; Escape closes it and focus returns to the button.
 */
export function MarketingNav() {
  const [active, setActive] = useState<string>('top');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.section).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] });
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`mk-dark fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || open ? 'bg-mk-bg/80 backdrop-blur-xl' : 'bg-transparent'}`}>
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-14">
        <a href="/#top" className="flex items-center gap-3 rounded-lg" aria-label="GrowthPrint home">
          <BrandMark className="h-10 w-10 lg:h-11 lg:w-11" />
          <span className="text-[17px] font-semibold italic tracking-tight lg:text-[18px]">GrowthPrint</span>
        </a>

        <ul className="hidden items-center gap-10 lg:flex xl:gap-14">
          {NAV_LINKS.map(link => {
            const isActive = link.section !== null && active === link.section;
            return (
              <li key={link.label}>
                <a href={link.href} aria-current={isActive ? 'true' : undefined}
                  className={`relative block py-2 text-[15px] font-medium transition-colors ${isActive ? 'text-mk-text' : 'text-mk-muted hover:text-mk-text'}`}>
                  {link.label}
                  <span aria-hidden="true"
                    className={`absolute -bottom-1 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-mk-purple transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <a href="/#start"
            className="hidden h-12 items-center rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-7 text-[15px] font-medium text-mk-accent-fg shadow-[0_10px_30px_-12px_rgb(249_115_22/0.6)] transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.98] sm:inline-flex">
            Contact Us
          </a>
          <button ref={buttonRef} type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="mk-menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-mk-line text-mk-text lg:hidden">
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mk-menu" className="mk-menu-in border-t border-mk-line px-5 pb-8 pt-4 sm:px-8 lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <a href={link.href} onClick={() => setOpen(false)}
                  className="block border-b border-mk-line py-4 text-[18px] font-medium text-mk-muted hover:text-mk-text">{link.label}</a>
              </li>
            ))}
          </ul>
          <a href="/#start" onClick={() => setOpen(false)}
            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue text-[15px] font-medium text-mk-accent-fg">
            Contact Us
          </a>
        </div>
      )}
    </header>
  );
}
