'use client';

import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { useBusinessQuery, errorMessage, errorStatus } from '../api/workspaceApi.ts';
import type { Business, BusinessRole } from '../model/types.ts';
import { can, type WorkspaceAction } from '../model/permissions.ts';
import { ROUTES } from '../../../lib/routes.ts';
import { ErrorState, Skeleton } from '../../../components/ui/forms.tsx';
import { WorkspaceShell } from './WorkspaceShell.tsx';

interface ScopeValue { businessId: string; business: Business; role: BusinessRole; can: (a: WorkspaceAction) => boolean }

const ScopeContext = createContext<ScopeValue | null>(null);

/** The active business for the current page. Only rendered once the backend confirmed membership. */
export function useBusinessScope(): ScopeValue {
  const value = useContext(ScopeContext);
  if (!value) throw new Error('useBusinessScope must be used inside BusinessScope');
  return value;
}

export function useRouteParam(name: string): string {
  const params = useParams<Record<string, string | string[]>>();
  const raw = params?.[name];
  return decodeURIComponent(Array.isArray(raw) ? raw[0] : raw ?? '');
}

/**
 * Loads the business named in the URL. Non-members and unknown ids both get the backend's 404, so the URL alone
 * never grants access; a member removed while a page is open lands here on the next request.
 */
export function BusinessScope({ children }: { children: ReactNode }) {
  const businessId = useRouteParam('businessId');
  const { data: business, error, isLoading, refetch } = useBusinessQuery(businessId);

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="space-y-4" role="status" aria-label="Loading business">
        <Skeleton className="h-10 w-64" /><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" />
      </div>
    );
  } else if (error && errorStatus(error) === 404) {
    content = (
      <div className="mx-auto max-w-md py-16 text-center">
        <ShieldOff className="mx-auto h-10 w-10 text-ink-400" aria-hidden="true" />
        <h1 className="mt-4 text-lg font-semibold text-ink-900">You don't have access to this business</h1>
        <p className="mt-2 text-sm text-ink-500">It may not exist, or your membership was removed. Ask an owner or admin to invite you again.</p>
        <Link href={ROUTES.workspace.home} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          Go to your businesses
        </Link>
      </div>
    );
  } else if (error || !business) {
    content = <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  } else {
    content = (
      <ScopeContext.Provider value={{ businessId, business, role: business.myRole, can: a => can(business.myRole, a) }}>
        {children}
      </ScopeContext.Provider>
    );
  }
  return <WorkspaceShell businessId={businessId}>{content}</WorkspaceShell>;
}

/** Shown when the current role may not use a page (the backend would answer 403 as well). */
export function NoPermission({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-900">Your role can't {what}</p>
      <p className="mt-1 text-sm text-ink-500">Ask an owner or admin of this business if you need access.</p>
    </div>
  );
}
