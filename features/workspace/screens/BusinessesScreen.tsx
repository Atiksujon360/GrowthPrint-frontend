'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Plus } from 'lucide-react';
import { useMyBusinessesQuery, errorMessage } from '../api/workspaceApi.ts';
import { ROLE_LABEL } from '../model/permissions.ts';
import { TEAM_SIZE_LABEL } from '../model/types.ts';
import { ROUTES, workspaceRoutes } from '../../../lib/routes.ts';
import { initialsOf } from '../../../lib/access.ts';
import { useAppSelector } from '../../../store/hooks.ts';
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/forms.tsx';
import { PageHeader, StatusPill } from '../../../components/ui/workspace-kit.tsx';
import { MockDataBanner } from '../components/WorkspaceShell.tsx';

export function BusinessesScreen() {
  const { data, isLoading, error, refetch } = useMyBusinessesQuery();
  const user = useAppSelector(s => s.auth.currentUser);

  return (
    <div className="min-h-screen bg-ink-50">
      <MockDataBanner />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href={ROUTES.admin.home} className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-xs font-black text-brand-300" aria-hidden="true">GP</span>
            GrowthPrint
          </Link>
          <Link href={ROUTES.admin.home} className="text-sm text-ink-500 hover:text-brand-700">Back to studio</Link>
        </div>
        <PageHeader
          title={`Welcome${user.name ? `, ${user.name.split(' ')[0]}` : ''}`}
          description="Choose a business to work in, or set up a new one. Each business keeps its own clients, leads and team."
          actions={(
            <Link href={ROUTES.workspace.newBusiness}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              <Plus className="h-4 w-4" aria-hidden="true" /> Create a business
            </Link>
          )}
        />

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading businesses">
            <Skeleton className="h-36" /><Skeleton className="h-36" />
          </div>
        )}
        {error && <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.length === 0 && (
          <EmptyState
            icon={<Building2 className="h-8 w-8" />}
            title="You're not part of a business yet"
            description="Create your business to start organising clients, leads and your team — or open the invitation link a teammate sent you."
            action={<Link href={ROUTES.workspace.newBusiness} className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Create a business</Link>}
          />
        )}
        {data && data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.map(b => (
              <li key={b.id}>
                <Link href={workspaceRoutes(b.id).home}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-ink-200 bg-white p-5 shadow-xs transition-colors hover:border-brand-300 focus-visible:border-brand-500">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-sm font-bold text-brand-300" aria-hidden="true">
                      {initialsOf(b.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink-900">{b.name}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-500">{b.industry ?? 'Business'}{b.teamSize ? ` · ${TEAM_SIZE_LABEL[b.teamSize]}` : ''}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <StatusPill tone={b.myRole === 'OWNER' ? 'brand' : 'neutral'}>{ROLE_LABEL[b.myRole]}</StatusPill>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                      Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
