/**
 * MVP2 workspace contracts.
 *
 * Shapes mirror the backend DTOs where they already exist (business/membership/invitation: backend
 * `business.dto.BusinessDtos`; client: `client.dto.ClientResponse`; lead: `crm.lead.dto.CrmLeadResponse`).
 * Fields marked "Phase 2" do not exist in the backend yet and are part of the contract the backend must add.
 */

export type BusinessRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
export const BUSINESS_ROLES: readonly BusinessRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'];

export interface Actor {
  id: string;
  email: string;
  name: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  myRole: BusinessRole;
  createdAt: string;
  /** Phase 2: business profile fields. */
  industry?: string;
  teamSize?: TeamSize;
  description?: string;
  website?: string;
  timezone?: string;
  currency?: Currency;
}

export type TeamSize = 'SOLO' | 'SMALL' | 'MEDIUM' | 'LARGE';
export const TEAM_SIZE_LABEL: Record<TeamSize, string> = {
  SOLO: 'Just me',
  SMALL: '2–10 people',
  MEDIUM: '11–50 people',
  LARGE: '50+ people',
};

export type Currency = 'USD' | 'EUR' | 'GBP';
export const CURRENCIES: readonly Currency[] = ['USD', 'EUR', 'GBP'];

export interface Member {
  userId: string;
  email: string;
  fullName: string | null;
  role: BusinessRole;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Exclude<BusinessRole, 'OWNER'>;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'DECLINED';
  expiresAt: string;
  createdAt: string;
}

export interface CreatedInvitation {
  invitation: Invitation;
  /** Shown once; only its hash is stored by the backend. */
  token: string;
  link: string;
}

export interface InvitationPreview {
  businessName: string;
  role: BusinessRole;
  invitedEmail: string;
  expiresAt: string;
}

export type ClientStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type RetainerTier = 'ESSENTIAL_MAINTENANCE' | 'PRO_GROWTH' | 'NONE';

export interface Client {
  id: string;
  name: string;
  legalName: string;
  contactEmail: string;
  phone: string | null;
  website: string;
  status: ClientStatus;
  retainerTier: RetainerTier | null;
  monthlyRetainerHours: number | null;
  contractStartDate: string;
  accountManager: string;
  billingCurrency: Currency;
  notes: string | null;
  /** Phase 2: link back to the lead it was converted from. */
  convertedFromLeadId: string | null;
  createdAt: string;
}

export interface ClientInput {
  name: string;
  legalName?: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  billingCurrency?: Currency;
  retainerTier?: RetainerTier | null;
  monthlyRetainerHours?: number | null;
  contractStartDate?: string;
  accountManager?: string;
  notes?: string;
  status?: ClientStatus;
}

export type PipelineStage =
  | 'DISCOVERED' | 'RESEARCHING' | 'QUALIFIED' | 'NEEDS_REVIEW' | 'READY_FOR_OUTREACH' | 'OUTREACH_APPROVED'
  | 'CONTACTED' | 'REPLIED' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'DO_NOT_CONTACT';

/** Backend enum order (crm_leads_pipeline_stage_valid). */
export const PIPELINE_STAGES: readonly PipelineStage[] = [
  'DISCOVERED', 'RESEARCHING', 'QUALIFIED', 'NEEDS_REVIEW', 'READY_FOR_OUTREACH', 'OUTREACH_APPROVED',
  'CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST', 'DO_NOT_CONTACT',
];

export const STAGE_LABEL: Record<PipelineStage, string> = {
  DISCOVERED: 'Discovered',
  RESEARCHING: 'Researching',
  QUALIFIED: 'Qualified',
  NEEDS_REVIEW: 'Needs review',
  READY_FOR_OUTREACH: 'Ready for outreach',
  OUTREACH_APPROVED: 'Outreach approved',
  CONTACTED: 'Contacted',
  REPLIED: 'Replied',
  MEETING_SCHEDULED: 'Meeting scheduled',
  PROPOSAL_SENT: 'Proposal sent',
  WON: 'Won',
  LOST: 'Lost',
  DO_NOT_CONTACT: 'Do not contact',
};

/** Pipeline groups used by the board and dashboard. */
export const STAGE_GROUPS: ReadonlyArray<{ key: string; label: string; stages: readonly PipelineStage[] }> = [
  { key: 'new', label: 'New', stages: ['DISCOVERED', 'RESEARCHING', 'NEEDS_REVIEW'] },
  { key: 'qualified', label: 'Qualified', stages: ['QUALIFIED', 'READY_FOR_OUTREACH', 'OUTREACH_APPROVED'] },
  { key: 'engaged', label: 'In conversation', stages: ['CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT'] },
  { key: 'closed', label: 'Closed', stages: ['WON', 'LOST', 'DO_NOT_CONTACT'] },
];

export type LeadSource = 'INBOUND_INQUIRY' | 'REFERRAL' | 'OUTBOUND' | 'EVENT' | 'OTHER';
export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  INBOUND_INQUIRY: 'Inbound enquiry',
  REFERRAL: 'Referral',
  OUTBOUND: 'Outbound',
  EVENT: 'Event',
  OTHER: 'Other',
};

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  source: LeadSource;
  pipelineStage: PipelineStage;
  qualificationScore: number | null;
  estimatedValue: number | null;
  nextAction: string | null;
  doNotContact: boolean;
  notes: string | null;
  convertedClientId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInput {
  companyName: string;
  contactName: string;
  contactEmail?: string;
  website?: string;
  industry?: string;
  location?: string;
  source?: LeadSource;
  pipelineStage?: PipelineStage;
  qualificationScore?: number | null;
  estimatedValue?: number | null;
  nextAction?: string;
  doNotContact?: boolean;
  notes?: string;
}

export interface ConvertLeadInput {
  legalName?: string;
  billingCurrency?: Currency;
  contractStartDate?: string;
  accountManager?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}

export type ActivityType =
  | 'BUSINESS_CREATED' | 'BUSINESS_UPDATED' | 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'LEAD_CREATED'
  | 'LEAD_UPDATED' | 'LEAD_STAGE_CHANGED' | 'LEAD_CONVERTED' | 'LEAD_DELETED' | 'MEMBER_INVITED'
  | 'MEMBER_JOINED' | 'MEMBER_ROLE_CHANGED' | 'MEMBER_REMOVED' | 'OWNERSHIP_TRANSFERRED' | 'INVITATION_REVOKED';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  actorName: string;
  createdAt: string;
  link?: string;
}

export interface DashboardSummary {
  clients: { total: number; active: number; newThisMonth: number };
  leads: { open: number; won: number; lost: number; conversionRate: number; pipelineValue: number };
  stageCounts: Array<{ key: string; label: string; count: number }>;
  team: { members: number; pendingInvitations: number };
  priorities: Array<{ id: string; title: string; detail: string; href: string; tone: 'warning' | 'info' }>;
  recentActivity: Activity[];
}

/** Backend-style error (RFC 9457 body subset). */
export interface ServiceError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
