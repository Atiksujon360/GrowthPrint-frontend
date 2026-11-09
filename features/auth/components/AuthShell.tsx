'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { GrowthPrintMark } from '../../public/components/GrowthPrintMark.tsx';

/**
 * Frame for sign-in, password recovery and invitation pages: a navy blueprint panel (desktop) beside a focused
 * single-column form. No stock photos, invented customers or marketing claims.
 */
export function AuthShell({ eyebrow, title, subtitle, children, footer, aside }: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  aside?: { heading: string; points: string[] };
}) {
  const panel = aside ?? {
    heading: 'Secure access to your GrowthPrint workspace',
    points: [
      'Accounts are protected with strong password rules and sign-in limits',
      'Changing or resetting a password signs out every other device',
      'Every sensitive account change is recorded',
    ],
  };
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Blueprint grid, purely decorative. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage: 'linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        <Link href="/" className="relative flex w-fit items-center gap-2.5 rounded-md focus-visible:outline-white">
          <GrowthPrintMark className="h-8 w-8" tone="light" />
          <span className="gp-display text-lg font-semibold">GrowthPrint</span>
        </Link>
        <div className="relative">
          <p className="gp-display max-w-md text-[2rem] font-semibold leading-[1.12]">{panel.heading}</p>
          <ul className="mt-8 max-w-md space-y-4">
            {panel.points.map(point => (
              <li key={point} className="flex gap-3 text-[0.98rem] leading-6 text-white/70">
                <Check className="mt-1 h-4 w-4 shrink-0 text-mint-300" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/50">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Encrypted connection. Private workspace.
        </p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 rounded-md lg:hidden">
            <GrowthPrintMark className="h-7 w-7" />
            <span className="gp-display font-semibold text-ink-950">GrowthPrint</span>
          </Link>
          <Link href="/" className="ml-auto inline-flex min-h-10 items-center rounded-md text-sm font-medium text-ink-600 hover:text-brand-700">
            Back to website
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[26rem] py-12">
          <p className="text-sm font-medium text-brand-700">{eyebrow}</p>
          <h1 className="gp-display mt-2 text-[2.1rem] font-semibold leading-tight text-ink-950">{title}</h1>
          {subtitle && <div className="mt-3 text-[0.98rem] leading-relaxed text-ink-600">{subtitle}</div>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="text-center text-sm text-ink-500">{footer}</div>}
      </main>
    </div>
  );
}
