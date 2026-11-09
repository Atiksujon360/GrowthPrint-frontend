import type { Metadata } from 'next';
import { ForgotPasswordScreen } from '../../../features/auth/components/RecoveryScreens.tsx';

export const metadata: Metadata = {
  title: 'Forgot password · GrowthPrint',
  robots: { index: true, follow: true },
  referrer: 'no-referrer',
};

export default function Page() {
  return <ForgotPasswordScreen />;
}
