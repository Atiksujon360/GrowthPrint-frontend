'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

/**
 * Frame for sign-in, password recovery and invitation pages: a calm brand panel (desktop) and a focused
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
    <div className="min-h-screen bg-ink-50 px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto grid min-h-[min(720px,calc(100vh-5rem))] max-w-5xl overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[0_24px_64px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between bg-ink-950 p-10 text-white lg:flex">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-brand-700">GP</span>
            <span className="text-sm font-semibold tracking-tight">GrowthPrint</span>
          </Link>
          <div>
            <p className="text-2xl font-semibold leading-snug tracking-tight">{panel.heading}</p>
            <ul className="mt-6 space-y-3">
              {panel.points.map(point => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-ink-300">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-center gap-2 text-xs text-ink-400">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Encrypted connection · Private workspace
          </p>
        </aside>

        <main className="flex flex-col p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">GP</span>
              <span className="text-sm font-semibold text-ink-900">GrowthPrint</span>
            </Link>
            <Link href="/" className="ml-auto rounded-md text-sm font-medium text-ink-500 hover:text-brand-700">
              Back to website
            </Link>
          </div>
          <div className="mx-auto my-auto w-full max-w-sm py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
            {subtitle && <div className="mt-2 text-sm leading-6 text-ink-500">{subtitle}</div>}
            <div className="mt-7">{children}</div>
          </div>
          {footer && <div className="text-center text-xs text-ink-500">{footer}</div>}
        </main>
      </div>
    </div>
  );
}
