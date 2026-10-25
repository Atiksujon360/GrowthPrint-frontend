import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GrowthPrint — Practical software for growing teams',
  description:
    'GrowthPrint helps growing teams build useful software, improve existing systems, and automate the work that slows them down.',
};

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
