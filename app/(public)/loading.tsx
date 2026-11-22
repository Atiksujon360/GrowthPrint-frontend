import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gp-canvas">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gp-primary" />
        <p className="text-sm text-gp-text-muted">Loading...</p>
      </div>
    </div>
  );
}
