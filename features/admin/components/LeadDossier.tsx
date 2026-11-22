import React, { useId } from 'react';
import { ExternalLink, Mail, ShieldAlert } from 'lucide-react';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { DetailDrawer, DrawerSection, FactList } from '../../../components/ui/DetailDrawer.tsx';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { humanizeCode } from '../../../lib/labels.ts';
import type { Lead, LeadPipelineStage } from '../../../types/agency.ts';

/** Every stage the backend accepts (CrmLeadPipelineStage), in pipeline order. */
export const LEAD_STAGES: LeadPipelineStage[] = [
  'DISCOVERED', 'RESEARCHING', 'QUALIFIED', 'NEEDS_REVIEW', 'READY_FOR_OUTREACH', 'OUTREACH_APPROVED',
  'CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST', 'DO_NOT_CONTACT',
];

const SCORE_PARTS: Array<{ key: keyof Lead['qualificationBreakdown']; label: string }> = [
  { key: 'businessFit', label: 'Fit with what we do' },
  { key: 'evidenceOfNeed', label: 'Evidence of need' },
  { key: 'contactability', label: 'Reachable decision maker' },
  { key: 'serviceRelevance', label: 'Matches a service' },
];

function ScoreBreakdown({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-2.5">
      {SCORE_PARTS.map(({ key, label }) => {
        const value = Math.max(0, Math.min(25, lead.qualificationBreakdown?.[key] ?? 0));
        return (
          <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
            <span className="text-sm text-gp-text">{label}</span>
            <span className="text-sm tabular-nums text-gp-text-secondary">{value} / 25</span>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-gp-divider" aria-hidden="true">
              <div className="h-full rounded-full bg-gp-accent" style={{ width: `${(value / 25) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The lead's research and evidence, plus the stage control. Shared by the inline inspector and the drawer. */
export function LeadDossierBody({ lead, onStageChange }: { lead: Lead; onStageChange: (stage: LeadPipelineStage) => void }) {
  const stageId = useId();
  return (
    <>
      {lead.doNotContact && (
        <p className="mb-4 flex items-start gap-2 rounded-gp-control bg-gp-danger-soft px-3 py-2.5 text-sm text-gp-danger">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Marked do not contact. Don't send outreach to this lead.
        </p>
      )}

      <DrawerSection title="Pipeline stage">
        <label htmlFor={stageId} className="sr-only">Pipeline stage for {lead.companyName}</label>
        <select id={stageId} value={lead.pipelineStage}
          onChange={(e) => onStageChange(e.target.value as LeadPipelineStage)}
          className="h-10 w-full rounded-gp-control border border-gp-border bg-gp-surface px-3 text-sm text-gp-text focus:border-gp-primary focus:outline-none focus:ring-2 focus:ring-gp-primary/20">
          {LEAD_STAGES.map(stage => <option key={stage} value={stage}>{humanizeCode(stage)}</option>)}
        </select>
      </DrawerSection>

      <DrawerSection title="Match score" aside={<span className="text-base font-semibold tabular-nums text-gp-text">{lead.qualificationScore} / 100</span>}>
        <ScoreBreakdown lead={lead} />
      </DrawerSection>

      <DrawerSection title="The problem we found">
        <p className="text-sm leading-relaxed text-gp-text">{lead.identifiedProblem || 'Not recorded yet.'}</p>
      </DrawerSection>

      {lead.researchSummary && (
        <DrawerSection title="Research notes">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gp-text-secondary">{lead.researchSummary}</p>
        </DrawerSection>
      )}

      <DrawerSection title="Where it came from">
        <FactList items={[
          { term: 'Source', value: humanizeCode(lead.source) },
          { term: 'Evidence link', value: lead.sourceUrl && (
            <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-gp-primary-strong hover:underline">
              {lead.sourceUrl.replace(/^https?:\/\//, '')}<ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          ) },
          { term: 'Found on', value: lead.discoveredDate },
          { term: 'Service', value: humanizeCode(lead.targetService) },
        ]} />
      </DrawerSection>

      <DrawerSection title="Contact">
        <FactList items={[
          { term: 'Name', value: [lead.contactName, lead.contactTitle].filter(Boolean).join(', ') },
          { term: 'Email', value: lead.contactEmail && (
            <span className="inline-flex items-center gap-1.5">
              <span className="break-all">{lead.contactEmail}</span>
              <CopyButton value={lead.contactEmail} title="Copy email address" />
            </span>
          ) },
          { term: 'Last contact', value: lead.lastContactDate },
          { term: 'Next step', value: lead.nextAction },
        ]} />
      </DrawerSection>

      {lead.notes && (
        <DrawerSection title="Notes">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gp-text">{lead.notes}</p>
        </DrawerSection>
      )}
    </>
  );
}

function OutreachButton({ lead, onOpenOutreach }: { lead: Lead; onOpenOutreach: (id: string) => void }) {
  return (
    <button type="button" disabled={lead.doNotContact} onClick={() => onOpenOutreach(lead.id)}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-gp-control bg-gp-primary px-4 text-sm font-semibold text-gp-primary-foreground hover:bg-gp-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary">
      <Mail className="h-4 w-4" aria-hidden="true" /> Draft outreach
    </button>
  );
}

function LeadSubtitle({ lead }: { lead: Lead }) {
  const where = [lead.industry, lead.location].filter(Boolean).join(', ');
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      {where}
      {lead.website && (
        <a href={lead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gp-primary-strong hover:underline">
          Website<ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </span>
  );
}

/** Inline inspector card for the split view (wide screens). */
export function LeadInspectorPanel({ lead, onStageChange, onOpenOutreach }: {
  lead: Lead; onStageChange: (stage: LeadPipelineStage) => void; onOpenOutreach: (id: string) => void;
}) {
  return (
    <section aria-label={`${lead.companyName} details`} className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col rounded-gp-card border border-gp-border bg-gp-surface">
      <header className="flex items-start gap-3 border-b border-gp-border px-6 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gp-text">{lead.companyName}</h3>
          <div className="mt-0.5 text-sm text-gp-text-secondary"><LeadSubtitle lead={lead} /></div>
        </div>
        <StatusBadge status={lead.pipelineStage} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5"><LeadDossierBody lead={lead} onStageChange={onStageChange} /></div>
      <footer className="border-t border-gp-border px-6 py-4"><OutreachButton lead={lead} onOpenOutreach={onOpenOutreach} /></footer>
    </section>
  );
}

/** Drawer version for the full-table view. */
export function LeadDetailDrawer({ lead, onClose, onStageChange, onOpenOutreach }: {
  lead: Lead | null; onClose: () => void; onStageChange: (stage: LeadPipelineStage) => void; onOpenOutreach: (id: string) => void;
}) {
  if (!lead) return null;
  return (
    <DetailDrawer open onClose={onClose} title={lead.companyName} subtitle={<LeadSubtitle lead={lead} />}
      badge={<StatusBadge status={lead.pipelineStage} />}
      footer={<OutreachButton lead={lead} onOpenOutreach={(id) => { onClose(); onOpenOutreach(id); }} />}>
      <LeadDossierBody lead={lead} onStageChange={onStageChange} />
    </DetailDrawer>
  );
}
