import type { Metadata } from 'next';
import { ResetPasswordScreen } from '../../../features/auth/components/RecoveryScreens.tsx';

export const metadata: Metadata = {
  title: 'Reset password · GrowthPrint',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  return <ResetPasswordScreen />;
}
