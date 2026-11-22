import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Hanken_Grotesk, Inter, Poppins, Schibsted_Grotesk, Sora } from 'next/font/google';
import { AppProviders } from './providers';
import { THEME_INIT_SCRIPT } from '../lib/theme';
import './globals.css';

// Self-hosted at build time by next/font (no request to Google at runtime, no layout shift).
// Hanken Grotesk: interface and body text (legacy, being phased out). Schibsted Grotesk: display headlines (legacy, being phased out).
const uiFont = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const displayFont = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-display-face', display: 'swap' });
// Sora: premium heading and display typography (new GrowthPrint brand).
const headingFont = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });
// Inter: the application typeface (Enterprise UI Kit, decision D2), applied inside `.gp-app` only.
const appFont = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Poppins: the public marketing site (geometric display with true italics for the hero headline) - being phased out.
const marketingFont = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-poppins', display: 'swap' });

export const metadata: Metadata = {
  title: 'GrowthPrint — Practical software for growing teams',
  description:
    'GrowthPrint helps growing teams build useful software, improve existing systems, and automate the work that slows them down.',
  openGraph: {
    title: 'GrowthPrint — Practical software for growing teams',
    description:
      'GrowthPrint helps growing teams build useful software, improve existing systems, and automate the work that slows them down.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${uiFont.variable} ${displayFont.variable} ${headingFont.variable} ${appFont.variable} ${marketingFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
