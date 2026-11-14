import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isWorkspacePreviewEnabled } from '../../../lib/featureFlags.ts';
import { JoinBusinessScreen } from '../../../features/workspace/screens/JoinBusinessScreen.tsx';

export const metadata: Metadata = {
  title: 'Join a business · GrowthPrint',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  // Part of the MVP2 workspace preview (production hardening R4).
  if (!isWorkspacePreviewEnabled()) notFound();
  return <JoinBusinessScreen />;
}
