/**
 * Admin dashboard figures derived only from data actually loaded from the backend.
 * Replaces hard-coded history (Jul–Sep 2026 amounts) and invented multipliers
 * ($18.5k per lead, 45% close rate, $1.8k per retainer) that were shown as real numbers.
 */
import type { Invoice, Lead, Client } from '../types/agency.ts';

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
