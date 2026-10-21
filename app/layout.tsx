import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
