/**
 * The workspace data contract used by every MVP2 screen.
 *
 * Phase 1 ships an in-memory implementation (`mockWorkspaceService.ts`). Phase 3 adds an HTTP implementation
 * against the backend; screens and the RTK Query layer do not change. Every method takes the acting user so the
 * implementation can authorize, exactly as the backend derives the actor from the session.
 */
import type {
  Activity, Actor, Business, BusinessRole, Client, ClientInput, ConvertLeadInput, CreatedInvitation,
  DashboardSummary, Invitation, InvitationPreview, Lead, LeadInput, ListQuery, Member, Page, PipelineStage,
  TeamSize, Currency,
} from '../model/types.ts';

export interface CreateBusinessInput {
  name: string;
  slug?: string;
  industry?: string;
  teamSize?: TeamSize;
  description?: string;
  website?: string;
  timezone?: string;
  currency?: Currency;
}

export type UpdateBusinessInput = Partial<Omit<CreateBusinessInput, 'slug'>>;

export interface WorkspaceService {
  listMyBusinesses(actor: Actor): Promise<Business[]>;
  createBusiness(actor: Actor, input: CreateBusinessInput): Promise<Business>;
  getBusiness(actor: Actor, businessId: string): Promise<Business>;
  updateBusiness(actor: Actor, businessId: string, input: UpdateBusinessInput): Promise<Business>;

  listMembers(actor: Actor, businessId: string): Promise<Member[]>;
  changeMemberRole(actor: Actor, businessId: string, userId: string, role: BusinessRole): Promise<Member>;
  removeMember(actor: Actor, businessId: string, userId: string): Promise<void>;
  transferOwnership(actor: Actor, businessId: string, userId: string): Promise<Member>;

  listInvitations(actor: Actor, businessId: string): Promise<Invitation[]>;
  inviteMember(actor: Actor, businessId: string, email: string, role: Exclude<BusinessRole, 'OWNER'>): Promise<CreatedInvitation>;
  revokeInvitation(actor: Actor, businessId: string, invitationId: string): Promise<void>;
  previewInvitation(actor: Actor, token: string): Promise<InvitationPreview>;
  acceptInvitation(actor: Actor, token: string): Promise<Business>;
  declineInvitation(actor: Actor, token: string): Promise<void>;

  listClients(actor: Actor, businessId: string, query: ListQuery): Promise<Page<Client>>;
  getClient(actor: Actor, businessId: string, clientId: string): Promise<Client>;
  createClient(actor: Actor, businessId: string, input: ClientInput): Promise<Client>;
  updateClient(actor: Actor, businessId: string, clientId: string, input: ClientInput): Promise<Client>;

  listLeads(actor: Actor, businessId: string, query: ListQuery): Promise<Page<Lead>>;
  getLead(actor: Actor, businessId: string, leadId: string): Promise<Lead>;
  createLead(actor: Actor, businessId: string, input: LeadInput): Promise<Lead>;
  updateLead(actor: Actor, businessId: string, leadId: string, input: LeadInput): Promise<Lead>;
  changeLeadStage(actor: Actor, businessId: string, leadId: string, stage: PipelineStage): Promise<Lead>;
  deleteLead(actor: Actor, businessId: string, leadId: string): Promise<void>;
  convertLead(actor: Actor, businessId: string, leadId: string, input: ConvertLeadInput): Promise<Client>;

  getDashboard(actor: Actor, businessId: string): Promise<DashboardSummary>;
  listActivity(actor: Actor, businessId: string, limit?: number): Promise<Activity[]>;
}
