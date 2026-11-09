import { Suspense } from 'react';
import { ClientsScreen } from '../../../../../features/workspace/screens/ClientsScreen.tsx';

// useSearchParams needs a Suspense boundary.
export default function Page() {
  return <Suspense><ClientsScreen /></Suspense>;
}
