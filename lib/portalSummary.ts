import type { Invoice, Project } from '../types/agency.ts';
import { milestoneTimeline } from './projectSummary.ts';
import { formatMoney, totalsByCurrency } from './money.ts';

/**
 * What a client's dashboard says about their projects and invoices, computed only from their own loaded data
 * (the API already limits /projects/my and /invoices/my to the signed-in client). Nothing is assumed or invented.
 */
export function portalSummary(projects: readonly Project[], invoices: readonly Invoice[], today: string) {
  const active = projects.filter(p => p.status !== 'COMPLETED');
  const overdueMilestones = active.reduce(
    (n, p) => n + milestoneTimeline(p.milestones ?? [], today).filter(m => m.state === 'overdue').length, 0);
  const unpaid = invoices.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE');
  const overdueInvoices = unpaid.filter(i => i.status === 'OVERDUE').length;
  const unpaidAmount = Object.entries(totalsByCurrency(unpaid, i => i.totalAmount))
    .map(([currency, amount]) => formatMoney(amount, currency)).join(' + ');

  return {
    activeProjects: active.length,
    projectsNote: active.length === 0 ? 'No active projects'
      : overdueMilestones === 0 ? 'No overdue milestones'
      : `${overdueMilestones} milestone${overdueMilestones === 1 ? '' : 's'} overdue`,
    unpaidInvoices: unpaid.length,
    invoicesNote: unpaid.length === 0 ? 'Nothing to pay'
      : overdueInvoices > 0 ? `${overdueInvoices} overdue, ${unpaidAmount} in total`
      : `${unpaidAmount} due`,
  };
}
