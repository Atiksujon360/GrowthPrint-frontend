import type { Client, Invoice, Project } from '../types/agency.ts';
import { totalsByCurrency } from './money.ts';

export interface RetainerUsage {
  used: number;
  allowance: number;
  /** Hours still available this month; 0 once the allowance is used up. */
  left: number;
  /** 0–100 for the meter (capped), even when usage runs over. */
  percent: number;
  overBy: number;
}

/** Retainer hours for the current month, or null for ad-hoc clients (no allowance). */
export function retainerUsage(client: Pick<Client, 'monthlyRetainerHours' | 'consumedHoursCurrentMonth'>): RetainerUsage | null {
  const allowance = client.monthlyRetainerHours ?? 0;
  if (allowance <= 0) return null;
  const used = Math.max(0, client.consumedHoursCurrentMonth ?? 0);
  return {
    used,
    allowance,
    left: Math.max(0, allowance - used),
    percent: Math.min(100, Math.round((used / allowance) * 100)),
    overBy: Math.max(0, used - allowance),
  };
}

const OPEN_INVOICE = new Set<Invoice['status']>(['ISSUED', 'OVERDUE']);
const CLOSED_PROJECT = new Set<Project['status']>(['COMPLETED']);

/** The client's own projects and invoices, newest first, with outstanding amounts per currency. */
export function clientRelations(clientId: string, projects: readonly Project[], invoices: readonly Invoice[]) {
  const ownProjects = projects
    .filter(p => p.clientId === clientId)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  const ownInvoices = invoices
    .filter(i => i.clientId === clientId)
    .sort((a, b) => (b.issueDate ?? '').localeCompare(a.issueDate ?? ''));
  const open = ownInvoices.filter(i => OPEN_INVOICE.has(i.status));
  return {
    projects: ownProjects,
    activeProjectCount: ownProjects.filter(p => !CLOSED_PROJECT.has(p.status)).length,
    invoices: ownInvoices,
    overdueCount: open.filter(i => i.status === 'OVERDUE').length,
    outstanding: totalsByCurrency(open, i => i.totalAmount),
  };
}
