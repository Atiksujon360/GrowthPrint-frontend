import type { Client, Invoice, Lead, OutreachDraft, Project, SupportRequest } from '../types/agency.ts';
import type { AppNotification, SystemAlert } from '../types/ui.ts';
import { formatMoney, totalsByCurrency } from './money.ts';

/**
 * "Needs attention" items for the Studio bell and banner, computed from the data already loaded from the API.
 * Nothing here is stored or invented: when there is nothing to do, there is nothing to show.
 * Ids carry the count (or percentage step) so that a changed situation shows up as new again after it was read.
 */
export interface AttentionInput {
  requests: readonly SupportRequest[];
  drafts: readonly OutreachDraft[];
  invoices: readonly Invoice[];
  projects: readonly Project[];
  leads: readonly Lead[];
  /** Local calendar day, YYYY-MM-DD. */
  today: string;
}

export const ATTENTION_PREFIX = 'attn:';

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export function buildAttentionNotifications(input: AttentionInput): AppNotification[] {
  const out: AppNotification[] = [];
  const add = (n: Omit<AppNotification, 'timestamp' | 'isRead'>) => out.push({ ...n, timestamp: '', isRead: false });

  const untriaged = input.requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION').length;
  if (untriaged > 0) {
    add({
      id: `${ATTENTION_PREFIX}requests:${untriaged}`, category: 'ACTION_REQUIRED', priority: 'HIGH', targetTab: 'REQUESTS',
      title: `${untriaged} support ${plural(untriaged, 'request needs', 'requests need')} triage`,
      message: 'Classify them so each client gets an estimate or a reply.',
    });
  }

  const overdue = input.invoices.filter(i => i.status === 'OVERDUE');
  if (overdue.length > 0) {
    const totals = Object.entries(totalsByCurrency(overdue, i => i.totalAmount))
      .map(([currency, amount]) => formatMoney(amount, currency)).join(' + ');
    add({
      id: `${ATTENTION_PREFIX}invoices:${overdue.length}`, category: 'FINANCIAL', priority: 'HIGH', targetTab: 'INVOICES',
      title: `${overdue.length} ${plural(overdue.length, 'invoice is', 'invoices are')} overdue`,
      message: `${totals} is past its due date.`,
    });
  }

  const drafts = input.drafts.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL').length;
  if (drafts > 0) {
    add({
      id: `${ATTENTION_PREFIX}drafts:${drafts}`, category: 'OUTREACH', priority: 'MEDIUM', targetTab: 'OUTREACH',
      title: `${drafts} outreach ${plural(drafts, 'draft is', 'drafts are')} waiting for approval`,
      message: 'Nothing is sent until a person approves it.',
    });
  }

  const lateMilestones = input.projects
    .filter(p => p.status !== 'COMPLETED')
    .reduce((n, p) => n + (p.milestones ?? []).filter(m => m.status !== 'COMPLETED' && m.dueDate && m.dueDate < input.today).length, 0);
  if (lateMilestones > 0) {
    add({
      id: `${ATTENTION_PREFIX}milestones:${lateMilestones}`, category: 'ACTION_REQUIRED', priority: 'MEDIUM', targetTab: 'PROJECTS',
      title: `${lateMilestones} project ${plural(lateMilestones, 'milestone is', 'milestones are')} overdue`,
      message: 'Open Projects to see which ones slipped.',
    });
  }

  const ready = input.leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH' && !l.doNotContact).length;
  if (ready > 0) {
    add({
      id: `${ATTENTION_PREFIX}leads:${ready}`, category: 'OUTREACH', priority: 'LOW', targetTab: 'LEADS',
      title: `${ready} ${plural(ready, 'lead is', 'leads are')} ready for outreach`,
      message: 'Draft a message for them in Leads and CRM.',
    });
  }
  return out;
}

/** Banner about the retainer closest to its monthly hours (85% or more), or null when no one is close. */
export function buildRetainerAlert(clients: readonly Client[]): SystemAlert | null {
  const close = clients
    .filter(c => c.status === 'ACTIVE' && (c.monthlyRetainerHours ?? 0) > 0)
    .map(c => ({ client: c, ratio: Math.max(0, c.consumedHoursCurrentMonth ?? 0) / (c.monthlyRetainerHours as number) }))
    .filter(x => x.ratio >= 0.85)
    .sort((a, b) => b.ratio - a.ratio);
  if (close.length === 0) return null;

  const { client, ratio } = close[0];
  const percent = Math.round(ratio * 100);
  const used = client.consumedHoursCurrentMonth ?? 0;
  const allowance = client.monthlyRetainerHours as number;
  const others = close.length - 1;
  const step = ratio >= 1 ? 'over' : String(Math.floor(percent / 5) * 5);
  return {
    id: `${ATTENTION_PREFIX}retainer:${client.id}:${step}:${close.length}`,
    type: 'warning',
    title: ratio >= 1 ? 'Retainer hours used up' : 'Retainer hours running low',
    message: `${client.name} has used ${used} of ${allowance} hours this month (${percent}%).`
      + (others > 0 ? ` ${others} more ${plural(others, 'client is', 'clients are')} also close to the limit.` : ''),
    actionLabel: 'View clients',
    actionTab: 'CLIENTS',
  };
}
