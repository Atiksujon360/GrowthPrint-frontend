import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { DetailDrawer, DrawerSection, FactList } from '../../../components/ui/DetailDrawer.tsx';
import { humanizeCode } from '../../../lib/labels.ts';
import { formatMoney } from '../../../lib/money.ts';
import { budgetUsage, daysUntil, isoDay, milestoneTimeline, type MilestoneState } from '../../../lib/projectSummary.ts';
import type { Project } from '../../../types/agency.ts';

const STATE_LABEL: Record<MilestoneState, string> = {
  done: 'Done',
  active: 'In progress',
  overdue: 'Overdue',
  upcoming: 'Not started',
};

function Marker({ state }: { state: MilestoneState }) {
  if (state === 'done') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gp-primary text-gp-primary-foreground">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  const ring = state === 'overdue' ? 'border-gp-danger bg-gp-danger-soft' : state === 'active' ? 'border-gp-primary bg-gp-primary-soft' : 'border-gp-border bg-gp-surface';
  const dot = state === 'overdue' ? 'bg-gp-danger' : state === 'active' ? 'bg-gp-primary' : '';
  return (
    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${ring}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
    </span>
  );
}

function timeToTarget(days: number | null, completed: boolean): string | null {
  if (days === null || completed) return null;
  if (days === 0) return 'Due today';
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} to go`;
  return `${-days} day${days === -1 ? '' : 's'} past target`;
}

/** Project details: progress, milestone timeline, budget, scope and deliverables. */
export function ProjectDetailDrawer({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const clients = useAppSelector(s => s.agency.clients);
  const today = isoDay(new Date());
  const timeline = useMemo(() => (project ? milestoneTimeline(project.milestones ?? [], today) : []), [project, today]);

  if (!project) return null;
  const completed = project.status === 'COMPLETED';
  const budget = budgetUsage(project);
  // Projects carry no currency of their own: use the client's billing currency, else USD as the projects table does.
  const currency = clients.find(c => c.id === project.clientId)?.billingCurrency ?? 'USD';
  const doneCount = timeline.filter(m => m.state === 'done').length;
  const overdueCount = timeline.filter(m => m.state === 'overdue').length;
  const days = daysUntil(project.targetCompletionDate, today);
  const remaining = timeToTarget(days, completed);

  return (
    <DetailDrawer
      open
      onClose={onClose}
      title={project.name}
      subtitle={(
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span>{project.clientName}</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-gp-text-muted">
            {project.reference}<CopyButton value={project.reference} title="Copy project reference" />
          </span>
        </span>
      )}
      badge={<StatusBadge status={project.status} />}
    >
      <DrawerSection title="Progress" aside={remaining && (
        <span className={days !== null && days < 0 ? 'font-semibold text-gp-danger' : undefined}>{remaining}</span>
      )}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-2xl font-semibold tabular-nums text-gp-text">{project.progressPercent}%</p>
          <p className="text-sm text-gp-text-secondary">Target {project.targetCompletionDate || '–'}</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gp-divider" role="progressbar" aria-label="Project progress"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progressPercent}>
          <div className="h-full rounded-full bg-gp-primary" style={{ width: `${Math.min(100, Math.max(0, project.progressPercent))}%` }} />
        </div>
      </DrawerSection>

      <DrawerSection title="Milestones" aside={timeline.length > 0 ? (
        <span>
          {doneCount} of {timeline.length} done
          {overdueCount > 0 && <span className="font-semibold text-gp-danger">, {overdueCount} overdue</span>}
        </span>
      ) : undefined}>
        {timeline.length === 0 ? (
          <p className="text-sm text-gp-text-secondary">No milestones yet. Add them on the project to track delivery dates.</p>
        ) : (
          <ol className="relative">
            {timeline.map((m, index) => (
              <li key={m.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < timeline.length - 1 && (
                  <span aria-hidden="true" className={`absolute left-[9px] top-6 bottom-0 w-0.5 ${m.state === 'done' ? 'bg-gp-primary' : 'bg-gp-border'}`} />
                )}
                <span className="relative mt-0.5 shrink-0"><Marker state={m.state} /></span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${m.state === 'done' ? 'text-gp-text-secondary' : 'text-gp-text'}`}>{m.title}</p>
                  <p className={`text-xs ${m.state === 'overdue' ? 'font-semibold text-gp-danger' : 'text-gp-text-secondary'}`}>
                    {STATE_LABEL[m.state]}, due {m.dueDate || '–'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DrawerSection>

      <DrawerSection title="Budget" aside={budget ? `${budget.percent}% used` : undefined}>
        {budget ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-semibold tabular-nums text-gp-text">{formatMoney(budget.spent, currency)}</p>
              <p className="text-sm tabular-nums text-gp-text-secondary">of {formatMoney(budget.total, currency)}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gp-divider" aria-hidden="true">
              <div className={`h-full rounded-full ${budget.over ? 'bg-gp-danger' : budget.percent >= 85 ? 'bg-gp-warning' : 'bg-gp-accent'}`}
                style={{ width: `${Math.min(100, budget.percent)}%` }} />
            </div>
            <p className={`mt-2 text-sm ${budget.over ? 'text-gp-danger' : 'text-gp-text-secondary'}`}>
              {budget.over
                ? `${formatMoney(budget.spent - budget.total, currency)} over budget.`
                : `${formatMoney(budget.remaining, currency)} left.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gp-text-secondary">No budget set for this project.</p>
        )}
      </DrawerSection>

      <DrawerSection title="Details">
        <FactList items={[
          { term: 'Service', value: humanizeCode(project.serviceCategory) },
          { term: 'Project lead', value: project.assignedLead },
          { term: 'Started', value: project.startDate },
          { term: 'Last updated', value: project.updatedAt?.slice(0, 10) },
        ]} />
      </DrawerSection>

      {project.description && (
        <DrawerSection title="Scope">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gp-text">{project.description}</p>
        </DrawerSection>
      )}

      {project.deliverables?.length > 0 && (
        <DrawerSection title="Deliverables">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gp-text marker:text-gp-text-muted">
            {project.deliverables.map(d => <li key={d}>{d}</li>)}
          </ul>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}
