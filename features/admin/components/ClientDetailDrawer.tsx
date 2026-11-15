import React, { useEffect, useMemo } from 'react';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { fetchInvoices, fetchProjects } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { DetailDrawer, DrawerSection, FactList } from '../../../components/ui/DetailDrawer.tsx';
import { canUseStudioTab } from '../../../lib/access.ts';
import { humanizeCode } from '../../../lib/labels.ts';
import { formatMoney } from '../../../lib/money.ts';
import { clientRelations, retainerUsage } from '../../../lib/clientSummary.ts';
import type { Client } from '../../../types/agency.ts';

/** Client details: retainer hours this month, contact, contract, and the client's own projects and invoices. */
export function ClientDetailDrawer({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(s => s.auth.currentUser);
  const projects = useAppSelector(s => s.agency.projects);
  const invoices = useAppSelector(s => s.agency.invoices);
  // Only load what this account may open; team members without a module would get 403.
  const canSeeProjects = canUseStudioTab(currentUser, 'PROJECTS');
  const canSeeInvoices = canUseStudioTab(currentUser, 'INVOICES');

  useEffect(() => {
    if (!client) return;
    if (canSeeProjects && projects.length === 0) dispatch(fetchProjects());
    if (canSeeInvoices && invoices.length === 0) dispatch(fetchInvoices());
    // Load once per opened client; list lengths are read at open time on purpose.
  }, [client?.id, canSeeProjects, canSeeInvoices, dispatch]);

  const relations = useMemo(
    () => (client ? clientRelations(client.id, projects, invoices) : null),
    [client, projects, invoices],
  );

  if (!client || !relations) return null;
  const usage = retainerUsage(client);
  const outstanding = Object.entries(relations.outstanding);
  const website = client.website?.trim();

  return (
    <DetailDrawer
      open
      onClose={onClose}
      title={client.name}
      subtitle={client.legalName && client.legalName !== client.name ? client.legalName : undefined}
      badge={<StatusBadge status={client.status} />}
      footer={(
        <>
          <a href={`mailto:${client.contactEmail}`}
            className="inline-flex h-10 items-center gap-2 rounded-gp-control bg-gp-primary px-4 text-sm font-semibold text-white hover:bg-gp-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary">
            <Mail className="h-4 w-4" aria-hidden="true" /> Email {client.name}
          </a>
          {website && (
            <a href={website} target="_blank" rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-gp-control border border-gp-border px-4 text-sm font-semibold text-gp-text hover:bg-gp-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary">
              Open website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </>
      )}
    >
      <DrawerSection title="Retainer this month" aside={humanizeCode(client.retainerTier) || 'No retainer'}>
        {usage ? (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-2xl font-semibold tabular-nums text-gp-text">
                {usage.overBy > 0 ? `${usage.overBy} h over` : `${usage.left} h left`}
              </p>
              <p className="text-sm tabular-nums text-gp-text-secondary">{usage.used} of {usage.allowance} h used</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gp-divider" role="meter"
              aria-label="Retainer hours used" aria-valuemin={0} aria-valuemax={usage.allowance} aria-valuenow={Math.min(usage.used, usage.allowance)}
              aria-valuetext={`${usage.used} of ${usage.allowance} hours used`}>
              <div className={`h-full rounded-full ${usage.overBy > 0 ? 'bg-gp-danger' : usage.percent >= 85 ? 'bg-amber-500' : 'bg-gp-primary'}`}
                style={{ width: `${usage.percent}%` }} />
            </div>
            {usage.overBy > 0 && (
              <p className="mt-2 text-sm text-gp-danger">Usage is past the monthly allowance. Agree extra hours or a top-up with the client.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gp-text-secondary">Billed ad hoc. No monthly hours are reserved for this client.</p>
        )}
      </DrawerSection>

      <DrawerSection title="Contact">
        <FactList items={[
          { term: 'Email', value: (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gp-text-muted" aria-hidden="true" />
              <a className="text-gp-primary hover:underline" href={`mailto:${client.contactEmail}`}>{client.contactEmail}</a>
              <CopyButton value={client.contactEmail} title="Copy client email" />
            </span>
          ) },
          { term: 'Phone', value: client.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gp-text-muted" aria-hidden="true" />
              <a className="hover:underline" href={`tel:${client.phone}`}>{client.phone}</a>
            </span>
          ) },
          { term: 'Website', value: website && website.replace(/^https?:\/\//, '') },
          { term: 'Account manager', value: client.accountManager },
        ]} />
      </DrawerSection>

      <DrawerSection title="Contract">
        <FactList items={[
          { term: 'Client since', value: client.contractStartDate },
          { term: 'Billing currency', value: client.billingCurrency },
        ]} />
      </DrawerSection>

      {canSeeProjects && (
        <DrawerSection title="Projects" aside={relations.projects.length > 0 ? `${relations.activeProjectCount} active of ${relations.projects.length}` : undefined}>
          {relations.projects.length === 0 ? (
            <p className="text-sm text-gp-text-secondary">No projects for this client yet.</p>
          ) : (
            <ul className="divide-y divide-gp-divider">
              {relations.projects.slice(0, 5).map(p => (
                <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gp-text">{p.name}</p>
                    <p className="text-xs text-gp-text-secondary">{p.reference}, due {p.targetCompletionDate}</p>
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-gp-text-secondary">{p.progressPercent}%</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </DrawerSection>
      )}

      {canSeeInvoices && (
        <DrawerSection title="Invoices" aside={relations.overdueCount > 0
          ? <span className="font-semibold text-gp-danger">{relations.overdueCount} overdue</span> : undefined}>
          {outstanding.length > 0 && (
            <div className="mb-3 rounded-gp-control bg-gp-canvas px-3.5 py-3">
              <p className="text-xs text-gp-text-secondary">Outstanding</p>
              <p className="text-lg font-semibold tabular-nums text-gp-text">
                {outstanding.map(([currency, amount]) => formatMoney(amount, currency)).join(' + ')}
              </p>
            </div>
          )}
          {relations.invoices.length === 0 ? (
            <p className="text-sm text-gp-text-secondary">No invoices for this client yet.</p>
          ) : (
            <ul className="divide-y divide-gp-divider">
              {relations.invoices.slice(0, 5).map(i => (
                <li key={i.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gp-text">{i.invoiceNumber}</p>
                    <p className="text-xs text-gp-text-secondary">Issued {i.issueDate}, due {i.dueDate}</p>
                  </div>
                  <span className="text-sm tabular-nums text-gp-text">{formatMoney(i.totalAmount, i.currency)}</span>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </DrawerSection>
      )}

      {client.notes && (
        <DrawerSection title="Internal notes">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gp-text">{client.notes}</p>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}
