'use client';

import { useActivityQuery, errorMessage } from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import { ActivityList } from '../components/ActivityList.tsx';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { ErrorState, Skeleton } from '../../../components/ui/forms.tsx';
import { PageHeader } from '../../../components/ui/workspace-kit.tsx';

export function ActivityScreen() {
  const { businessId, business } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const { data, isLoading, error, refetch } = useActivityQuery(businessId);

  return (
    <>
      <PageHeader title="Activity" description="Everything that changed in this business, newest first."
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Activity' }]} />
      {error ? <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} /> : (
        <section aria-label="Activity" className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs">
          {isLoading
            ? <div className="space-y-3 p-5" role="status" aria-label="Loading activity">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}</div>
            : <ActivityList items={data ?? []} businessHome={r.home} />}
        </section>
      )}
    </>
  );
}
