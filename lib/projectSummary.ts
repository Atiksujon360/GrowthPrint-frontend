import type { Project, ProjectMilestone } from '../types/agency.ts';

export type MilestoneState = 'done' | 'active' | 'overdue' | 'upcoming';

export interface TimelineMilestone extends ProjectMilestone {
  state: MilestoneState;
}

/** Local calendar date as YYYY-MM-DD (milestone due dates are plain dates). */
export function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Milestones in due-date order. Anything not completed whose due date has passed is overdue. */
export function milestoneTimeline(milestones: readonly ProjectMilestone[], today: string): TimelineMilestone[] {
  return [...milestones]
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .map(m => {
      let state: MilestoneState;
      if (m.status === 'COMPLETED') state = 'done';
      else if (m.dueDate && m.dueDate < today) state = 'overdue';
      else if (m.status === 'IN_PROGRESS') state = 'active';
      else state = 'upcoming';
      return { ...m, state };
    });
}

/** Budget use, or null when no budget is set (avoids a divide-by-zero "NaN%"). */
export function budgetUsage(project: Pick<Project, 'budgetTotal' | 'budgetSpent'>) {
  if (!project.budgetTotal || project.budgetTotal <= 0) return null;
  const spent = Math.max(0, project.budgetSpent ?? 0);
  const percent = Math.round((spent / project.budgetTotal) * 100);
  return { spent, total: project.budgetTotal, remaining: Math.max(0, project.budgetTotal - spent), percent, over: spent > project.budgetTotal };
}

/** Whole days from today to the target date; negative when the target has passed. Null for a missing or bad date. */
export function daysUntil(target: string | undefined, today: string): number | null {
  if (!target) return null;
  const t = Date.parse(`${target.slice(0, 10)}T00:00:00Z`);
  const n = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(t) || Number.isNaN(n)) return null;
  return Math.round((t - n) / 86_400_000);
}
