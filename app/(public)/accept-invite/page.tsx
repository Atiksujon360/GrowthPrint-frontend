import type { Metadata } from 'next';
import { AcceptInviteScreen } from '../../../features/auth/components/RecoveryScreens.tsx';

export const metadata: Metadata = {
  title: 'Accept invitation · GrowthPrint',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  return <AcceptInviteScreen />;
}
