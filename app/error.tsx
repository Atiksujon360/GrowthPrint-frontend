'use client';

import { useEffect } from 'react';
import { ErrorState } from '../components/ui/AsyncState.tsx';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD] px-6 text-[#182230]"><div className="w-full max-w-md"><ErrorState title="Something went wrong" message="GrowthPrint could not render this view. Please try again." onRetry={reset} /></div></main>;
}
