'use client';

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gp-canvas px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gp-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-gp-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-gp-text mb-2">Page not found</h2>
        <p className="text-gp-text-secondary mb-6">
          The admin workspace page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => router.push('/studio/ops')}
          className="px-4 py-2 bg-gp-primary text-gp-primary-foreground rounded-lg text-sm font-medium hover:bg-gp-primary-hover transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
