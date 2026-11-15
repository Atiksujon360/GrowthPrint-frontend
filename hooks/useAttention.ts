import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks.ts';
import { buildAttentionNotifications, buildRetainerAlert } from '../lib/attention.ts';
import { isoDay } from '../lib/projectSummary.ts';
import type { AppNotification, SystemAlert } from '../types/ui.ts';

/**
 * Studio "needs attention" notifications and the retainer banner, computed from the loaded API data.
 * Read and dismissed state is kept per session (ui.acknowledgedIds); the items themselves are never stored.
 */
export function useAttention(): { notifications: AppNotification[]; retainerAlert: SystemAlert | null } {
  const requests = useAppSelector(s => s.agency.requests);
  const drafts = useAppSelector(s => s.agency.outreachDrafts);
  const invoices = useAppSelector(s => s.agency.invoices);
  const projects = useAppSelector(s => s.agency.projects);
  const leads = useAppSelector(s => s.agency.leads);
  const clients = useAppSelector(s => s.agency.clients);
  const acknowledged = useAppSelector(s => s.ui.acknowledgedIds);
  const today = isoDay(new Date());

  return useMemo(() => {
    const notifications = buildAttentionNotifications({ requests, drafts, invoices, projects, leads, today })
      .map(n => ({ ...n, isRead: acknowledged.includes(n.id) }));
    const alert = buildRetainerAlert(clients);
    return { notifications, retainerAlert: alert && !acknowledged.includes(alert.id) ? alert : null };
  }, [requests, drafts, invoices, projects, leads, clients, acknowledged, today]);
}
