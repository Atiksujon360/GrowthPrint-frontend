import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Hanken_Grotesk, Schibsted_Grotesk } from 'next/font/google';
import { AppProviders } from './providers';
import './globals.css';

// Self-hosted at build time by next/font (no request to Google at runtime, no layout shift).
// Hanken Grotesk: interface and body text. Schibsted Grotesk: display headlines and page titles.
const uiFont = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const displayFont = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-display-face', display: 'swap' });

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
    <html lang="en" className={`${uiFont.variable} ${displayFont.variable}`}>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
