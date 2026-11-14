import { Suspense } from 'react';
import { LeadsScreen } from '../../../../../features/workspace/screens/LeadsScreen.tsx';

// useSearchParams needs a Suspense boundary.
export default function Page() {
  return <Suspense><LeadsScreen /></Suspense>;
}
