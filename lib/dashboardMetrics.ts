/**
 * Admin dashboard figures derived only from data actually loaded from the backend.
 * Replaces hard-coded history (Jul–Sep 2026 amounts) and invented multipliers
 * ($18.5k per lead, 45% close rate, $1.8k per retainer) that were shown as real numbers.
 */
import type { Invoice, Lead, Client, Project, Proposal } from '../types/agency.ts';

export interface CashFlowPoint {
  month: string;
  /** Sum of PAID invoices whose paidAt falls in the month. */
  collected: number;
  /** Sum of non-void, non-draft invoices whose issueDate falls in the month. */
  invoiced: number;
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Last `months` calendar months (UTC), oldest first, ending with the month of `now`. */
export function buildCashFlowSeries(invoices: readonly Invoice[], now: Date, months = 4): CashFlowPoint[] {
  const buckets = new Map<string, CashFlowPoint>();
  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    buckets.set(monthKey(date), { month: MONTH_LABEL.format(date), collected: 0, invoiced: 0 });
  }

  for (const invoice of invoices) {
    if (invoice.status !== 'DRAFT' && invoice.status !== 'VOID' && invoice.issueDate) {
      const bucket = buckets.get(invoice.issueDate.slice(0, 7));
      if (bucket) bucket.invoiced += invoice.totalAmount;
    }
    if (invoice.status === 'PAID' && invoice.paidAt) {
      const bucket = buckets.get(invoice.paidAt.slice(0, 7));
      if (bucket) bucket.collected += invoice.totalAmount;
    }
  }
  return [...buckets.values()];
}

const CLOSED_STAGES = new Set(['WON', 'LOST', 'DO_NOT_CONTACT']);

export interface PipelineCounts {
  /** Leads with a qualification score of 80 or more. */
  qualified: number;
  /** Leads not yet won, lost or marked do-not-contact. */
  open: number;
}

export function countPipeline(leads: readonly Lead[]): PipelineCounts {
  return {
    qualified: leads.filter(lead => lead.qualificationScore >= 80).length,
    open: leads.filter(lead => !CLOSED_STAGES.has(lead.pipelineStage)).length
  };
}

export function countActiveClients(clients: readonly Client[]): number {
  return clients.filter(client => client.status === 'ACTIVE').length;
}

export function countRetainerClients(clients: readonly Client[]): number {
  return clients.filter(client => client.retainerTier && client.retainerTier !== 'NONE').length;
}

// ---------------------------------------------------------------------------------------------
// COMPREO dashboard figures (docs/ui-transformation/DATA-REQUIREMENTS.md). Pure, from loaded data only.
// ---------------------------------------------------------------------------------------------

const SHORT_MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

/** Month keys (YYYY-MM, UTC) starting `start` months from `now`, for `count` months. */
function monthWindow(now: Date, start: number, count: number): Array<{ key: string; label: string }> {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + start + i, 1));
    return { key: monthKey(d), label: SHORT_MONTH.format(d) };
  });
}

export const ACTIVE_PROJECT_STATUSES = new Set(['IN_PROGRESS', 'WAITING_FOR_CLIENT', 'IN_REVIEW']);

export function countActiveProjects(projects: readonly Project[]): number {
  return projects.filter(p => ACTIVE_PROJECT_STATUSES.has(p.status)).length;
}

/** Delivery load: projects by target completion month, 3 months back to 2 ahead (interim trend). */
export function projectsByTargetMonth(projects: readonly Project[], now: Date): Array<{ label: string; value: number }> {
  return monthWindow(now, -3, 6).map(m => ({
    label: m.label,
    value: projects.filter(p => p.targetCompletionDate?.slice(0, 7) === m.key).length,
  }));
}

export interface MilestoneCounts { open: number; overdue: number; total: number }

export function milestoneCounts(projects: readonly Project[], now: Date): MilestoneCounts {
  const today = now.toISOString().slice(0, 10);
  const all = projects.flatMap(p => p.milestones ?? []);
  const open = all.filter(m => m.status !== 'COMPLETED');
  return { open: open.length, overdue: open.filter(m => m.dueDate && m.dueDate < today).length, total: all.length };
}

/** Milestones due per month (last 4 months and this month): done vs still open. */
export function milestonePerformance(projects: readonly Project[], now: Date): Array<{ label: string; a: number; b: number }> {
  const all = projects.flatMap(p => p.milestones ?? []);
  return monthWindow(now, -4, 5).map(m => {
    const due = all.filter(x => x.dueDate?.slice(0, 7) === m.key);
    return { label: m.label, a: due.filter(x => x.status === 'COMPLETED').length, b: due.filter(x => x.status !== 'COMPLETED').length };
  });
}

/** Sum of a value grouped by a key, largest first, empty groups dropped. */
export function sumBy<T>(items: readonly T[], key: (t: T) => string, value: (t: T) => number): Array<{ label: string; value: number }> {
  const totals = new Map<string, number>();
  for (const item of items) totals.set(key(item), (totals.get(key(item)) ?? 0) + value(item));
  return [...totals.entries()].filter(([, v]) => v > 0).map(([label, v]) => ({ label, value: v })).sort((a, b) => b.value - a.value);
}

export function countBy<T>(items: readonly T[], key: (t: T) => string): Array<{ label: string; value: number }> {
  return sumBy(items, key, () => 1);
}

/** Accepted proposal value by service category (booked revenue). */
export function acceptedValueByService(proposals: readonly Proposal[]): Array<{ label: string; value: number }> {
  return sumBy(proposals.filter(p => p.status === 'ACCEPTED'), p => p.serviceCategory, p => p.totalPrice || 0);
}

export const OPEN_PROPOSAL_STATUSES = new Set(['DRAFT', 'SENT_FOR_REVIEW']);

/** Leads created (or discovered) this calendar month and last month (UTC). */
export function newLeadsThisAndLastMonth(leads: readonly Lead[], now: Date): { thisMonth: number; lastMonth: number } {
  const [last, current] = monthWindow(now, -1, 2).map(m => m.key);
  const keyOf = (l: Lead) => (l.createdAt || l.discoveredDate || '').slice(0, 7);
  return { thisMonth: leads.filter(l => keyOf(l) === current).length, lastMonth: leads.filter(l => keyOf(l) === last).length };
}
