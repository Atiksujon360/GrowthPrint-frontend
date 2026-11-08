import type { Metadata } from 'next';
import { JoinBusinessScreen } from '../../../features/workspace/screens/JoinBusinessScreen.tsx';

export const metadata: Metadata = {
  title: 'Join a business · GrowthPrint',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  return <JoinBusinessScreen />;
}
