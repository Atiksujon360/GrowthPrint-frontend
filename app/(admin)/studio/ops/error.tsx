'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gp-canvas px-4">
      <div className="max-w-md w-full">
        <div className="bg-gp-surface rounded-2xl border border-gp-border shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gp-danger-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gp-danger" />
          </div>
          <h2 className="text-xl font-bold text-gp-text mb-2">Something went wrong</h2>
          <p className="text-gp-text-secondary mb-6">
            We encountered an error loading the admin workspace. Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-gp-primary text-gp-primary-foreground rounded-lg text-sm font-medium hover:bg-gp-primary-hover transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push('/studio/ops/login')}
              className="px-4 py-2 border border-gp-border text-gp-text rounded-lg text-sm font-medium hover:bg-gp-surface-secondary transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
