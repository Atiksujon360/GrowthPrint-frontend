import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowthPrint — AI-Powered IT Services Agency Platform',
  description:
    'GrowthPrint is an AI-powered IT services agency platform combining a premium public agency experience, client portal, and founder operations workspace.',
  openGraph: {
    title: 'GrowthPrint — AI-Powered IT Services Agency Platform',
    description:
      'GrowthPrint is an AI-powered IT services agency platform combining a premium public agency experience, client portal, and founder operations workspace.',
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
