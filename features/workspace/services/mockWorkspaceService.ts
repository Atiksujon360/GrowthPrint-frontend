/**
 * In-memory workspace backend for Phase 1 (frontend-first). It enforces the same rules as the real backend
 * (membership → 404 for outsiders, role ranks, ≥1 owner, single-use email-bound invitations, one-time lead
 * conversion) so the UI is built against realistic behaviour. It is NOT a security boundary.
 *
 * Isolation: only `services/index.ts` chooses this implementation; screens never import it directly.
 */
import type {
  Activity, ActivityType, Actor, Business, BusinessRole, Client, ClientInput, ConvertLeadInput, CreatedInvitation,
  DashboardSummary, Invitation, InvitationPreview, Lead, LeadInput, ListQuery, Member, Page, PipelineStage,
  ServiceError,
} from '../model/types.ts';
import { PIPELINE_STAGES, STAGE_GROUPS, STAGE_LABEL } from '../model/types.ts';
import { atLeast, can, conversionBlocker, CONVERSION_BLOCKER_TEXT, outranks, ROLE_LABEL, type WorkspaceAction } from '../model/permissions.ts';
import type { CreateBusinessInput, UpdateBusinessInput, WorkspaceService } from './workspaceService.ts';

type StoredBusiness = Omit<Business, 'myRole'>;
interface StoredMembership { businessId: string; userId: string; role: BusinessRole; status: 'ACTIVE' | 'REMOVED'; joinedAt: string }
interface StoredUser { id: string; email: string; fullName: string | null }
interface StoredInvitation extends Invitation { businessId: string; token: string; invitedBy: string }
interface StoredClient extends Client { businessId: string }
interface StoredLead extends Lead { businessId: string }
interface StoredActivity extends Activity { businessId: string }

export interface MockState {
  seededFor: string[];
  users: StoredUser[];
  businesses: StoredBusiness[];
  memberships: StoredMembership[];
  invitations: StoredInvitation[];
  clients: StoredClient[];
  leads: StoredLead[];
  activities: StoredActivity[];
}

export interface StateStore {
  load(): MockState | null;
  save(state: MockState): void;
}

export const emptyState = (): MockState => ({
  seededFor: [], users: [], businesses: [], memberships: [], invitations: [], clients: [], leads: [], activities: [],
});

export function fail(status: number, message: string, fieldErrors?: Record<string, string>): never {
  const error: ServiceError = { status, message, ...(fieldErrors ? { fieldErrors } : {}) };
  throw error;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY = 86_400_000;

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8) : Math.random().toString(16).slice(2, 10);
  return `${prefix}_${random}${idCounter}`;
}

function newToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').slice(0, 43);
}

export function slugify(name: string): string {
  const slug = name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
  return slug.length < 2 ? 'business' : slug;
}

export class MockWorkspaceService implements WorkspaceService {
  private state: MockState;
  // Plain fields (not constructor parameter properties) so `node --experimental-strip-types` can run the tests.
  private readonly store: StateStore | null;
  private readonly now: () => Date;
  private readonly latencyMs: number;

  constructor(
    store: StateStore | null = null,
    now: () => Date = () => new Date(),
    latencyMs = 0,
    initialState?: MockState,
  ) {
    this.store = store;
    this.now = now;
    this.latencyMs = latencyMs;
    this.state = initialState ?? store?.load() ?? emptyState();
  }

  /** For tests and the dev "reset demo data" action. */
  reset(state: MockState = emptyState()): void {
    this.state = state;
    this.persist();
  }

  snapshot(): MockState {
    return structuredClone(this.state);
  }

  // ---------------------------------------------------------------------------------------------
  // Infrastructure
  // ---------------------------------------------------------------------------------------------

  private async run<T>(fn: () => T): Promise<T> {
    if (this.latencyMs > 0) await new Promise(r => setTimeout(r, this.latencyMs));
    const result = fn();
    this.persist();
    return structuredClone(result);
  }

  private persist(): void {
    this.store?.save(this.state);
  }

  private iso(offsetMs = 0): string {
    return new Date(this.now().getTime() + offsetMs).toISOString();
  }

  private ensureUser(actor: Actor): void {
    if (!this.state.users.some(u => u.id === actor.id)) {
      this.state.users.push({ id: actor.id, email: actor.email.toLowerCase(), fullName: actor.name || null });
    }
    if (!this.state.seededFor.includes(actor.id)) {
      this.state.seededFor.push(actor.id);
      seedDemoData(this, this.state, actor, this.now());
    }
  }

  /** Membership gate: outsiders and unknown businesses get the same 404. */
  private access(actor: Actor, businessId: string, action: WorkspaceAction): { business: StoredBusiness; role: BusinessRole } {
    this.ensureUser(actor);
    const business = this.state.businesses.find(b => b.id === businessId && b.status === 'ACTIVE');
    const membership = this.state.memberships.find(
      m => m.businessId === businessId && m.userId === actor.id && m.status === 'ACTIVE');
    if (!business || !membership) fail(404, 'Business not found');
    if (!can(membership.role, action)) {
      fail(403, 'Your role in this business does not allow this action');
    }
    return { business, role: membership.role };
  }

  record(businessId: string, type: ActivityType, message: string, actor: Actor | null, link?: string, at?: string): void {
    this.state.activities.unshift({
      id: newId('act'), businessId, type, message, actorName: actor?.name || actor?.email || 'System',
      createdAt: at ?? this.iso(), link,
    });
    if (this.state.activities.length > 500) this.state.activities.length = 500;
  }

  private toBusiness(b: StoredBusiness, role: BusinessRole): Business {
    return { ...b, myRole: role };
  }

  private toMember(m: StoredMembership): Member {
    const user = this.state.users.find(u => u.id === m.userId);
    return { userId: m.userId, email: user?.email ?? 'unknown', fullName: user?.fullName ?? null, role: m.role, joinedAt: m.joinedAt };
  }

  private activeOwners(businessId: string): number {
    return this.state.memberships.filter(m => m.businessId === businessId && m.status === 'ACTIVE' && m.role === 'OWNER').length;
  }

  private stripBusiness<T extends { businessId: string }>(item: T): Omit<T, 'businessId'> {
    const { businessId: _ignored, ...rest } = item;
    return rest;
  }

  // ---------------------------------------------------------------------------------------------
  // Businesses
  // ---------------------------------------------------------------------------------------------

  listMyBusinesses(actor: Actor) {
    return this.run(() => {
      this.ensureUser(actor);
      return this.state.memberships
        .filter(m => m.userId === actor.id && m.status === 'ACTIVE')
        .map(m => ({ m, b: this.state.businesses.find(b => b.id === m.businessId && b.status === 'ACTIVE') }))
        .filter((x): x is { m: StoredMembership; b: StoredBusiness } => Boolean(x.b))
        .map(({ m, b }) => this.toBusiness(b, m.role))
        .sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  createBusiness(actor: Actor, input: CreateBusinessInput) {
    return this.run(() => {
      this.ensureUser(actor);
      const name = input.name?.trim() ?? '';
      if (!name) fail(400, 'Request validation failed', { name: 'Name is required' });
      if (name.length > 160) fail(400, 'Request validation failed', { name: 'Name must be at most 160 characters' });
      let slug = input.slug?.trim() || slugify(name);
      if (!/^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$/.test(slug)) {
        fail(400, 'Request validation failed', { slug: 'Use lowercase letters, numbers and hyphens (2–80 characters)' });
      }
      if (input.slug && this.state.businesses.some(b => b.slug === slug)) {
        fail(409, 'That business address is already taken');
      }
      const base = slug;
      for (let i = 2; this.state.businesses.some(b => b.slug === slug); i++) slug = `${base}-${i}`;
      const business: StoredBusiness = {
        id: newId('biz'), name, slug, status: 'ACTIVE', createdAt: this.iso(),
        industry: input.industry?.trim() || undefined, teamSize: input.teamSize,
        description: input.description?.trim() || undefined, website: input.website?.trim() || undefined,
        timezone: input.timezone || undefined, currency: input.currency ?? 'USD',
      };
      this.state.businesses.push(business);
      this.state.memberships.push({ businessId: business.id, userId: actor.id, role: 'OWNER', status: 'ACTIVE', joinedAt: this.iso() });
      this.record(business.id, 'BUSINESS_CREATED', `Created ${name}`, actor);
      return this.toBusiness(business, 'OWNER');
    });
  }

  getBusiness(actor: Actor, businessId: string) {
    return this.run(() => {
      const { business, role } = this.access(actor, businessId, 'clients.view');
      return this.toBusiness(business, role);
    });
  }

  updateBusiness(actor: Actor, businessId: string, input: UpdateBusinessInput) {
    return this.run(() => {
      const { business, role } = this.access(actor, businessId, 'business.edit');
      if (input.name !== undefined) {
        const name = input.name.trim();
        if (!name) fail(400, 'Request validation failed', { name: 'Name is required' });
        business.name = name;
      }
      if (input.industry !== undefined) business.industry = input.industry.trim() || undefined;
      if (input.teamSize !== undefined) business.teamSize = input.teamSize;
      if (input.description !== undefined) business.description = input.description.trim() || undefined;
      if (input.website !== undefined) business.website = input.website.trim() || undefined;
      if (input.timezone !== undefined) business.timezone = input.timezone || undefined;
      if (input.currency !== undefined) business.currency = input.currency;
      this.record(businessId, 'BUSINESS_UPDATED', 'Updated the business profile', actor);
      return this.toBusiness(business, role);
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Members
  // ---------------------------------------------------------------------------------------------

  listMembers(actor: Actor, businessId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'members.view');
      const order: Record<BusinessRole, number> = { OWNER: 0, ADMIN: 1, MANAGER: 2, MEMBER: 3 };
      return this.state.memberships
        .filter(m => m.businessId === businessId && m.status === 'ACTIVE')
        .sort((a, b) => order[a.role] - order[b.role] || a.joinedAt.localeCompare(b.joinedAt))
        .map(m => this.toMember(m));
    });
  }

  changeMemberRole(actor: Actor, businessId: string, userId: string, newRole: BusinessRole) {
    return this.run(() => {
      const { role: actorRole } = this.access(actor, businessId, 'members.manage');
      const target = this.state.memberships.find(m => m.businessId === businessId && m.userId === userId && m.status === 'ACTIVE');
      if (!target) fail(404, 'Member not found');
      const previous = target.role;
      if (previous === newRole) return this.toMember(target);
      const ownerInvolved = previous === 'OWNER' || newRole === 'OWNER';
      if (ownerInvolved && actorRole !== 'OWNER') fail(403, 'Only an owner can grant or remove the owner role');
      if (actorRole !== 'OWNER' && (!outranks(actorRole, previous) || !outranks(actorRole, newRole))) {
        fail(403, 'You can only manage roles below your own');
      }
      if (previous === 'OWNER' && this.activeOwners(businessId) <= 1) {
        fail(409, 'A business must keep at least one owner. Transfer ownership first.');
      }
      target.role = newRole;
      this.record(businessId, 'MEMBER_ROLE_CHANGED', `Changed ${this.toMember(target).email} from ${ROLE_LABEL[previous]} to ${ROLE_LABEL[newRole]}`, actor, '/team');
      return this.toMember(target);
    });
  }

  removeMember(actor: Actor, businessId: string, userId: string) {
    return this.run(() => {
      const leaving = actor.id === userId;
      const { role: actorRole } = this.access(actor, businessId, leaving ? 'members.view' : 'members.manage');
      const target = this.state.memberships.find(m => m.businessId === businessId && m.userId === userId && m.status === 'ACTIVE');
      if (!target) fail(404, 'Member not found');
      if (!leaving && actorRole !== 'OWNER' && !outranks(actorRole, target.role)) {
        fail(403, 'You can only remove members ranked below you');
      }
      if (target.role === 'OWNER' && this.activeOwners(businessId) <= 1) {
        fail(409, 'A business must keep at least one owner. Transfer ownership first.');
      }
      target.status = 'REMOVED';
      this.record(businessId, 'MEMBER_REMOVED',
        leaving ? `${actor.email} left the business` : `Removed ${this.toMember(target).email}`, actor, '/team');
    });
  }

  transferOwnership(actor: Actor, businessId: string, userId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'ownership.transfer');
      if (actor.id === userId) fail(400, 'You already own this business');
      const target = this.state.memberships.find(m => m.businessId === businessId && m.userId === userId && m.status === 'ACTIVE');
      const current = this.state.memberships.find(m => m.businessId === businessId && m.userId === actor.id && m.status === 'ACTIVE');
      if (!target || !current) fail(404, 'Member not found');
      target.role = 'OWNER';
      current.role = 'ADMIN';
      this.record(businessId, 'OWNERSHIP_TRANSFERRED', `Transferred ownership to ${this.toMember(target).email}`, actor, '/team');
      return this.toMember(target);
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Invitations
  // ---------------------------------------------------------------------------------------------

  private publicInvitation(i: StoredInvitation): Invitation {
    return { id: i.id, email: i.email, role: i.role, status: i.status, expiresAt: i.expiresAt, createdAt: i.createdAt };
  }

  listInvitations(actor: Actor, businessId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'members.invite');
      const now = this.now().getTime();
      return this.state.invitations
        .filter(i => i.businessId === businessId && i.status === 'PENDING' && Date.parse(i.expiresAt) > now)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(i => this.publicInvitation(i));
    });
  }

  inviteMember(actor: Actor, businessId: string, rawEmail: string, role: Exclude<BusinessRole, 'OWNER'>) {
    return this.run(() => {
      const { role: actorRole } = this.access(actor, businessId, 'members.invite');
      const email = rawEmail.trim().toLowerCase();
      if (!EMAIL.test(email)) fail(400, 'Request validation failed', { email: 'Enter a valid email address' });
      if (actorRole !== 'OWNER' && !outranks(actorRole, role)) fail(403, 'You can only invite roles below your own');
      const existingUser = this.state.users.find(u => u.email === email);
      if (existingUser && this.state.memberships.some(
        m => m.businessId === businessId && m.userId === existingUser.id && m.status === 'ACTIVE')) {
        fail(409, 'This person is already a member of the business');
      }
      this.state.invitations
        .filter(i => i.businessId === businessId && i.email === email && i.status === 'PENDING')
        .forEach(i => { i.status = 'REVOKED'; });
      const token = newToken();
      const invitation: StoredInvitation = {
        id: newId('inv'), businessId, email, role, status: 'PENDING', token, invitedBy: actor.id,
        createdAt: this.iso(), expiresAt: this.iso(3 * DAY),
      };
      this.state.invitations.push(invitation);
      this.record(businessId, 'MEMBER_INVITED', `Invited ${email} as ${ROLE_LABEL[role]}`, actor, '/team');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      return { invitation: this.publicInvitation(invitation), token, link: `${origin}/join-business#token=${token}` } satisfies CreatedInvitation;
    });
  }

  revokeInvitation(actor: Actor, businessId: string, invitationId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'members.invite');
      const invitation = this.state.invitations.find(i => i.id === invitationId && i.businessId === businessId);
      if (!invitation) fail(404, 'Invitation not found');
      if (invitation.status === 'PENDING') {
        invitation.status = 'REVOKED';
        this.record(businessId, 'INVITATION_REVOKED', `Revoked the invitation for ${invitation.email}`, actor, '/team');
      }
    });
  }

  private usableInvitation(actor: Actor, token: string): StoredInvitation {
    this.ensureUser(actor);
    const invitation = this.state.invitations.find(i => i.token === token);
    if (!invitation || invitation.status !== 'PENDING' || Date.parse(invitation.expiresAt) <= this.now().getTime()) {
      fail(400, 'This invitation is invalid or has expired.');
    }
    if (invitation.email !== actor.email.toLowerCase()) {
      fail(400, 'This invitation was sent to a different email address.');
    }
    const inviter = this.state.memberships.find(
      m => m.businessId === invitation.businessId && m.userId === invitation.invitedBy && m.status === 'ACTIVE');
    if (!inviter || !(inviter.role === 'OWNER' || (atLeast(inviter.role, 'ADMIN') && outranks(inviter.role, invitation.role)))) {
      invitation.status = 'REVOKED';
      fail(400, 'This invitation is no longer valid.');
    }
    return invitation;
  }

  previewInvitation(actor: Actor, token: string) {
    return this.run(() => {
      const invitation = this.usableInvitation(actor, token);
      const business = this.state.businesses.find(b => b.id === invitation.businessId);
      if (!business) fail(400, 'This invitation is invalid or has expired.');
      return { businessName: business.name, role: invitation.role, invitedEmail: invitation.email, expiresAt: invitation.expiresAt };
    });
  }

  acceptInvitation(actor: Actor, token: string) {
    return this.run(() => {
      const invitation = this.usableInvitation(actor, token);
      const business = this.state.businesses.find(b => b.id === invitation.businessId && b.status === 'ACTIVE');
      if (!business) fail(400, 'This invitation is invalid or has expired.');
      let membership = this.state.memberships.find(m => m.businessId === business.id && m.userId === actor.id);
      invitation.status = 'ACCEPTED';
      if (membership?.status === 'ACTIVE') {
        return this.toBusiness(business, membership.role);
      }
      if (membership) {
        membership.status = 'ACTIVE';
        membership.role = invitation.role;
      } else {
        membership = { businessId: business.id, userId: actor.id, role: invitation.role, status: 'ACTIVE', joinedAt: this.iso() };
        this.state.memberships.push(membership);
      }
      this.record(business.id, 'MEMBER_JOINED', `${actor.email} joined as ${ROLE_LABEL[invitation.role]}`, actor, '/team');
      return this.toBusiness(business, membership.role);
    });
  }

  declineInvitation(actor: Actor, token: string) {
    return this.run(() => {
      const invitation = this.usableInvitation(actor, token);
      invitation.status = 'DECLINED';
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Clients
  // ---------------------------------------------------------------------------------------------

  listClients(actor: Actor, businessId: string, query: ListQuery) {
    return this.run(() => {
      this.access(actor, businessId, 'clients.view');
      const q = query.search?.trim().toLowerCase() ?? '';
      const items = this.state.clients
        .filter(c => c.businessId === businessId)
        .filter(c => !query.status || c.status === query.status)
        .filter(c => !q || [c.name, c.legalName, c.contactEmail, c.accountManager].some(v => v.toLowerCase().includes(q)))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => this.stripBusiness(c) as Client);
      return paginate(items, query);
    });
  }

  getClient(actor: Actor, businessId: string, clientId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'clients.view');
      const client = this.state.clients.find(c => c.id === clientId && c.businessId === businessId);
      if (!client) fail(404, 'Client not found');
      return this.stripBusiness(client) as Client;
    });
  }

  private validateClient(input: ClientInput): void {
    const errors: Record<string, string> = {};
    if (!input.name?.trim()) errors.name = 'Name is required';
    else if (input.name.trim().length > 120) errors.name = 'Name must be at most 120 characters';
    if (!input.contactEmail?.trim()) errors.contactEmail = 'Contact email is required';
    else if (!EMAIL.test(input.contactEmail.trim())) errors.contactEmail = 'Contact email must be valid';
    if (input.monthlyRetainerHours != null && (input.monthlyRetainerHours < 0 || input.monthlyRetainerHours > 744)) {
      errors.monthlyRetainerHours = 'Retainer hours must be between 0 and 744';
    }
    if (Object.keys(errors).length) fail(400, 'Request validation failed', errors);
  }

  createClient(actor: Actor, businessId: string, input: ClientInput) {
    return this.run(() => {
      const { business } = this.access(actor, businessId, 'clients.create');
      this.validateClient(input);
      const client = this.newClient(businessId, input, actor, business.currency ?? 'USD', null);
      this.state.clients.push(client);
      this.record(businessId, 'CLIENT_CREATED', `Added client ${client.name}`, actor, `/clients/${client.id}`);
      return this.stripBusiness(client) as Client;
    });
  }

  newClient(businessId: string, input: ClientInput, actor: Actor, currency: Client['billingCurrency'], leadId: string | null,
            createdAt?: string): StoredClient {
    const name = input.name.trim();
    return {
      id: newId('cli'), businessId, name, legalName: input.legalName?.trim() || name,
      contactEmail: input.contactEmail.trim(), phone: input.phone?.trim() || null, website: input.website?.trim() || '',
      status: input.status ?? 'ACTIVE', retainerTier: input.retainerTier ?? null,
      monthlyRetainerHours: input.monthlyRetainerHours ?? null,
      contractStartDate: input.contractStartDate || this.iso().slice(0, 10),
      accountManager: input.accountManager?.trim() || actor.name || 'GrowthPrint',
      billingCurrency: input.billingCurrency ?? currency, notes: input.notes?.trim() || null,
      convertedFromLeadId: leadId, createdAt: createdAt ?? this.iso(),
    };
  }

  updateClient(actor: Actor, businessId: string, clientId: string, input: ClientInput) {
    return this.run(() => {
      this.access(actor, businessId, 'clients.edit');
      const client = this.state.clients.find(c => c.id === clientId && c.businessId === businessId);
      if (!client) fail(404, 'Client not found');
      this.validateClient(input);
      Object.assign(client, {
        name: input.name.trim(), legalName: input.legalName?.trim() || input.name.trim(),
        contactEmail: input.contactEmail.trim(), phone: input.phone?.trim() || null, website: input.website?.trim() || '',
        status: input.status ?? client.status, retainerTier: input.retainerTier ?? null,
        monthlyRetainerHours: input.monthlyRetainerHours ?? null,
        contractStartDate: input.contractStartDate || client.contractStartDate,
        accountManager: input.accountManager?.trim() || client.accountManager,
        billingCurrency: input.billingCurrency ?? client.billingCurrency, notes: input.notes?.trim() || null,
      });
      this.record(businessId, 'CLIENT_UPDATED', `Updated client ${client.name}`, actor, `/clients/${client.id}`);
      return this.stripBusiness(client) as Client;
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Leads
  // ---------------------------------------------------------------------------------------------

  listLeads(actor: Actor, businessId: string, query: ListQuery) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.view');
      const q = query.search?.trim().toLowerCase() ?? '';
      const stages = query.status ? STAGE_GROUPS.find(g => g.key === query.status)?.stages ?? [query.status] : null;
      const items = this.state.leads
        .filter(l => l.businessId === businessId)
        .filter(l => !stages || stages.includes(l.pipelineStage))
        .filter(l => !q || [l.companyName, l.contactName, l.contactEmail ?? '', l.industry ?? ''].some(v => v.toLowerCase().includes(q)))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(l => this.stripBusiness(l) as Lead);
      return paginate(items, query);
    });
  }

  getLead(actor: Actor, businessId: string, leadId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.view');
      return this.stripBusiness(this.findLead(businessId, leadId)) as Lead;
    });
  }

  private findLead(businessId: string, leadId: string): StoredLead {
    const lead = this.state.leads.find(l => l.id === leadId && l.businessId === businessId);
    if (!lead) fail(404, 'Lead not found');
    return lead;
  }

  private validateLead(input: LeadInput): void {
    const errors: Record<string, string> = {};
    if (!input.companyName?.trim()) errors.companyName = 'Company name is required';
    if (!input.contactName?.trim()) errors.contactName = 'Contact name is required';
    if (input.contactEmail?.trim() && !EMAIL.test(input.contactEmail.trim())) errors.contactEmail = 'Contact email must be valid';
    if (input.qualificationScore != null && (input.qualificationScore < 0 || input.qualificationScore > 100)) {
      errors.qualificationScore = 'Score must be between 0 and 100';
    }
    if (input.estimatedValue != null && input.estimatedValue < 0) errors.estimatedValue = 'Value cannot be negative';
    if (Object.keys(errors).length) fail(400, 'Request validation failed', errors);
  }

  createLead(actor: Actor, businessId: string, input: LeadInput) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.create');
      this.validateLead(input);
      const lead = this.newLead(businessId, input);
      this.state.leads.push(lead);
      this.record(businessId, 'LEAD_CREATED', `Added lead ${lead.companyName}`, actor, `/leads/${lead.id}`);
      return this.stripBusiness(lead) as Lead;
    });
  }

  newLead(businessId: string, input: LeadInput, createdAt?: string): StoredLead {
    const at = createdAt ?? this.iso();
    return {
      id: newId('lead'), businessId, companyName: input.companyName.trim(), contactName: input.contactName.trim(),
      contactEmail: input.contactEmail?.trim() || null, website: input.website?.trim() || null,
      industry: input.industry?.trim() || null, location: input.location?.trim() || null,
      source: input.source ?? 'INBOUND_INQUIRY', pipelineStage: input.pipelineStage ?? 'DISCOVERED',
      qualificationScore: input.qualificationScore ?? null, estimatedValue: input.estimatedValue ?? null,
      nextAction: input.nextAction?.trim() || null, doNotContact: input.doNotContact ?? false,
      notes: input.notes?.trim() || null, convertedClientId: null, convertedAt: null, createdAt: at, updatedAt: at,
    };
  }

  updateLead(actor: Actor, businessId: string, leadId: string, input: LeadInput) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.edit');
      const lead = this.findLead(businessId, leadId);
      this.validateLead(input);
      if (lead.convertedClientId && input.pipelineStage && input.pipelineStage !== 'WON') {
        fail(409, 'This lead was converted to a client and stays Won');
      }
      Object.assign(lead, {
        companyName: input.companyName.trim(), contactName: input.contactName.trim(),
        contactEmail: input.contactEmail?.trim() || null, website: input.website?.trim() || null,
        industry: input.industry?.trim() || null, location: input.location?.trim() || null,
        source: input.source ?? lead.source, qualificationScore: input.qualificationScore ?? null,
        estimatedValue: input.estimatedValue ?? null, nextAction: input.nextAction?.trim() || null,
        doNotContact: input.doNotContact ?? lead.doNotContact, notes: input.notes?.trim() || null,
        updatedAt: this.iso(),
      });
      this.record(businessId, 'LEAD_UPDATED', `Updated lead ${lead.companyName}`, actor, `/leads/${lead.id}`);
      return this.stripBusiness(lead) as Lead;
    });
  }

  changeLeadStage(actor: Actor, businessId: string, leadId: string, stage: PipelineStage) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.edit');
      const lead = this.findLead(businessId, leadId);
      if (!PIPELINE_STAGES.includes(stage)) fail(400, 'Unknown pipeline stage');
      if (lead.convertedClientId && stage !== 'WON') fail(409, 'This lead was converted to a client and stays Won');
      const previous = lead.pipelineStage;
      lead.pipelineStage = stage;
      if (stage === 'DO_NOT_CONTACT') lead.doNotContact = true;
      lead.updatedAt = this.iso();
      if (previous !== stage) {
        this.record(businessId, 'LEAD_STAGE_CHANGED', `Moved ${lead.companyName} to ${STAGE_LABEL[stage]}`, actor, `/leads/${lead.id}`);
      }
      return this.stripBusiness(lead) as Lead;
    });
  }

  deleteLead(actor: Actor, businessId: string, leadId: string) {
    return this.run(() => {
      this.access(actor, businessId, 'leads.delete');
      const lead = this.findLead(businessId, leadId);
      if (lead.convertedClientId) fail(409, 'A lead that was converted to a client cannot be deleted');
      this.state.leads = this.state.leads.filter(l => l !== lead);
      this.record(businessId, 'LEAD_DELETED', `Deleted lead ${lead.companyName}`, actor);
    });
  }

  /** One transaction: either the client exists and the lead is Won + linked, or nothing changed. */
  convertLead(actor: Actor, businessId: string, leadId: string, input: ConvertLeadInput) {
    return this.run(() => {
      const { business } = this.access(actor, businessId, 'leads.convert');
      const lead = this.findLead(businessId, leadId);
      const blocker = conversionBlocker(lead);
      if (blocker === 'ALREADY_CONVERTED') fail(409, CONVERSION_BLOCKER_TEXT[blocker]);
      if (blocker === 'NO_CONTACT_EMAIL') fail(400, CONVERSION_BLOCKER_TEXT[blocker]);
      if (blocker) fail(409, CONVERSION_BLOCKER_TEXT[blocker]);
      const client = this.newClient(businessId, {
        name: lead.companyName, legalName: input.legalName, contactEmail: lead.contactEmail as string,
        website: lead.website ?? undefined, billingCurrency: input.billingCurrency,
        contractStartDate: input.contractStartDate, accountManager: input.accountManager,
      }, actor, business.currency ?? 'USD', lead.id);
      this.state.clients.push(client);
      lead.convertedClientId = client.id;
      lead.convertedAt = this.iso();
      lead.pipelineStage = 'WON';
      lead.updatedAt = lead.convertedAt;
      this.record(businessId, 'LEAD_CONVERTED', `Converted ${lead.companyName} into a client`, actor, `/clients/${client.id}`);
      return this.stripBusiness(client) as Client;
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Command Centre
  // ---------------------------------------------------------------------------------------------

  getDashboard(actor: Actor, businessId: string) {
    return this.run((): DashboardSummary => {
      const { role } = this.access(actor, businessId, 'clients.view');
      const clients = this.state.clients.filter(c => c.businessId === businessId);
      const leads = this.state.leads.filter(l => l.businessId === businessId);
      const monthStart = new Date(this.now().getFullYear(), this.now().getMonth(), 1).toISOString();
      const won = leads.filter(l => l.pipelineStage === 'WON').length;
      const lost = leads.filter(l => l.pipelineStage === 'LOST' || l.pipelineStage === 'DO_NOT_CONTACT').length;
      const open = leads.length - won - lost;
      const closed = won + lost;
      const staleCutoff = this.now().getTime() - 14 * DAY;
      const priorities: DashboardSummary['priorities'] = [];
      const readyToConvert = leads.filter(l => !l.convertedClientId && l.pipelineStage === 'PROPOSAL_SENT');
      readyToConvert.slice(0, 2).forEach(l => priorities.push({
        id: `conv-${l.id}`, title: `Follow up on ${l.companyName}`,
        detail: 'Proposal sent — convert to a client once they accept.', href: `/leads/${l.id}`, tone: 'info',
      }));
      leads.filter(l => !['WON', 'LOST', 'DO_NOT_CONTACT'].includes(l.pipelineStage) && Date.parse(l.updatedAt) < staleCutoff)
        .slice(0, 3).forEach(l => priorities.push({
          id: `stale-${l.id}`, title: `${l.companyName} has gone quiet`,
          detail: 'No change in 14+ days. Decide the next step or close it.', href: `/leads/${l.id}`, tone: 'warning',
        }));
      const noNextAction = leads.filter(l => l.pipelineStage === 'QUALIFIED' && !l.nextAction).length;
      if (noNextAction) {
        priorities.push({ id: 'next-action', title: `${noNextAction} qualified lead${noNextAction > 1 ? 's' : ''} without a next step`,
          detail: 'Add a next action so nothing slips.', href: '/leads?stage=qualified', tone: 'warning' });
      }
      const pendingInvitations = atLeast(role, 'ADMIN')
        ? this.state.invitations.filter(i => i.businessId === businessId && i.status === 'PENDING'
          && Date.parse(i.expiresAt) > this.now().getTime()).length
        : 0;
      return {
        clients: {
          total: clients.length,
          active: clients.filter(c => c.status === 'ACTIVE').length,
          newThisMonth: clients.filter(c => c.createdAt >= monthStart).length,
        },
        leads: {
          open, won, lost,
          conversionRate: closed === 0 ? 0 : Math.round((won / closed) * 100),
          pipelineValue: leads.filter(l => !['WON', 'LOST', 'DO_NOT_CONTACT'].includes(l.pipelineStage))
            .reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0),
        },
        stageCounts: STAGE_GROUPS.map(g => ({ key: g.key, label: g.label,
          count: leads.filter(l => g.stages.includes(l.pipelineStage)).length })),
        team: {
          members: this.state.memberships.filter(m => m.businessId === businessId && m.status === 'ACTIVE').length,
          pendingInvitations,
        },
        priorities: priorities.slice(0, 5),
        recentActivity: this.state.activities.filter(a => a.businessId === businessId).slice(0, 8)
          .map(a => this.stripBusiness(a) as Activity),
      };
    });
  }

  listActivity(actor: Actor, businessId: string, limit = 50) {
    return this.run(() => {
      this.access(actor, businessId, 'clients.view');
      return this.state.activities.filter(a => a.businessId === businessId).slice(0, limit)
        .map(a => this.stripBusiness(a) as Activity);
    });
  }
}

export function paginate<T>(items: T[], query: ListQuery): Page<T> {
  const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(query.page ?? 1, 1), lastPage);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total };
}

// -------------------------------------------------------------------------------------------------
// Demo data: two businesses so business switching and role-aware UI can be exercised.
// -------------------------------------------------------------------------------------------------

const DEMO_CLIENTS: Array<[string, string, Client['status']]> = [
  ['Meridian Retail Group', 'ops@meridian.example', 'ACTIVE'],
  ['Harbor Logistics', 'hello@harbor.example', 'ACTIVE'],
  ['Northwind Clinics', 'it@northwind.example', 'ACTIVE'],
  ['Atlas Property Care', 'admin@atlas.example', 'ACTIVE'],
  ['Brightside Dental', 'office@brightside.example', 'ACTIVE'],
  ['Copperleaf Studio', 'studio@copperleaf.example', 'INVITED'],
  ['Evergreen Accounting', 'team@evergreen.example', 'ACTIVE'],
  ['Fable & Co', 'hi@fable.example', 'ACTIVE'],
  ['Granite Engineering', 'pm@granite.example', 'SUSPENDED'],
  ['Juniper Wellness', 'care@juniper.example', 'ACTIVE'],
  ['Keystone Legal', 'office@keystone.example', 'ACTIVE'],
  ['Lumen Education', 'admin@lumen.example', 'ACTIVE'],
  ['Mosaic Events', 'events@mosaic.example', 'ACTIVE'],
];

const DEMO_LEADS: Array<[string, string, PipelineStage, number | null, number, string | null]> = [
  ['Orchid Hotels', 'Priya Nair', 'PROPOSAL_SENT', 82, 18000, 'Check proposal feedback on Friday'],
  ['Pinecrest Schools', 'Daniel Ortiz', 'MEETING_SCHEDULED', 74, 12000, 'Discovery call Tuesday 10:00'],
  ['Quarry Fitness', 'Amira Hassan', 'QUALIFIED', 68, 6000, null],
  ['Riverside Vets', 'Tom Becker', 'CONTACTED', 55, 4500, 'Send case study'],
  ['Summit Builders', 'Lena Park', 'REPLIED', 71, 22000, 'Prepare estimate'],
  ['Tidewater Foods', 'Marcus Lee', 'DISCOVERED', null, 8000, null],
  ['Union Coworking', 'Sofia Rossi', 'RESEARCHING', 40, 3000, 'Find decision maker'],
  ['Vista Opticians', 'Chen Wei', 'QUALIFIED', 77, 9000, null],
  ['Willow Florists', 'Hannah Cole', 'LOST', 30, 2500, null],
  ['Yellowstone Travel', 'Ivan Petrov', 'READY_FOR_OUTREACH', 63, 7000, 'Draft intro email'],
  ['Zenith Analytics', 'Grace Kim', 'PROPOSAL_SENT', 88, 30000, 'Answer security questionnaire'],
  ['Alder Bakery', 'Noah Smith', 'DO_NOT_CONTACT', null, 1500, null],
];

function seedDemoData(service: MockWorkspaceService, state: MockState, actor: Actor, now: Date): void {
  const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * DAY).toISOString();
  const teammates: StoredUser[] = [
    { id: `${actor.id}-tm-admin`, email: 'maya.lim@growthprint.example', fullName: 'Maya Lim' },
    { id: `${actor.id}-tm-manager`, email: 'jon.reyes@growthprint.example', fullName: 'Jon Reyes' },
    { id: `${actor.id}-tm-member`, email: 'ava.tan@growthprint.example', fullName: 'Ava Tan' },
    { id: `${actor.id}-tm-owner2`, email: 'rafael.cruz@northwind.example', fullName: 'Rafael Cruz' },
  ];
  teammates.forEach(t => { if (!state.users.some(u => u.id === t.id)) state.users.push(t); });

  const primary: StoredBusiness = {
    id: newId('biz'), name: 'GrowthPrint Studio', slug: uniqueSlug(state, 'growthprint-studio'), status: 'ACTIVE',
    createdAt: at(120), industry: 'Software & IT services', teamSize: 'SMALL', currency: 'USD',
    description: 'Custom software, maintenance and automation for small businesses.',
    website: 'https://growthprint.example', timezone: 'Asia/Kuala_Lumpur',
  };
  const secondary: StoredBusiness = {
    id: newId('biz'), name: 'Northwind Cleaning Co', slug: uniqueSlug(state, 'northwind-cleaning'), status: 'ACTIVE',
    createdAt: at(60), industry: 'Cleaning & maintenance', teamSize: 'MEDIUM', currency: 'GBP',
    description: 'Commercial cleaning for offices and clinics.', timezone: 'Europe/London',
  };
  state.businesses.push(primary, secondary);
  const join = (businessId: string, userId: string, role: BusinessRole, daysAgo: number) =>
    state.memberships.push({ businessId, userId, role, status: 'ACTIVE', joinedAt: at(daysAgo) });
  join(primary.id, actor.id, 'OWNER', 120);
  join(primary.id, teammates[0].id, 'ADMIN', 100);
  join(primary.id, teammates[1].id, 'MANAGER', 80);
  join(primary.id, teammates[2].id, 'MEMBER', 30);
  join(secondary.id, teammates[3].id, 'OWNER', 60);
  join(secondary.id, actor.id, 'MANAGER', 45);

  DEMO_CLIENTS.forEach(([name, email, status], i) => {
    state.clients.push(service.newClient(primary.id, {
      name, contactEmail: email, status, website: `https://${email.split('@')[1]}`,
      retainerTier: i % 3 === 0 ? 'PRO_GROWTH' : i % 3 === 1 ? 'ESSENTIAL_MAINTENANCE' : null,
      monthlyRetainerHours: i % 3 === 2 ? null : 10 + (i % 4) * 5,
      accountManager: i % 2 ? 'Maya Lim' : actor.name || 'GrowthPrint',
    }, actor, 'USD', null, at(110 - i * 7)));
  });
  DEMO_LEADS.forEach(([company, contact, stage, score, value, next], i) => {
    const lead = service.newLead(primary.id, {
      companyName: company, contactName: contact,
      contactEmail: stage === 'DO_NOT_CONTACT' ? undefined : `${contact.split(' ')[0].toLowerCase()}@${company.split(' ')[0].toLowerCase()}.example`,
      industry: ['Hospitality', 'Education', 'Fitness', 'Veterinary', 'Construction', 'Food'][i % 6],
      source: (['INBOUND_INQUIRY', 'REFERRAL', 'OUTBOUND', 'EVENT'] as const)[i % 4], pipelineStage: stage,
      qualificationScore: score, estimatedValue: value, nextAction: next ?? undefined,
      doNotContact: stage === 'DO_NOT_CONTACT',
    }, at(40 - i * 3));
    lead.updatedAt = at(i % 4 === 3 ? 20 : i);
    state.leads.push(lead);
  });

  ['Brightline Offices', 'Kensington Dental'].forEach((name, i) => state.clients.push(service.newClient(secondary.id, {
    name, contactEmail: `facilities@${name.split(' ')[0].toLowerCase()}.example`, billingCurrency: 'GBP',
  }, { id: teammates[3].id, email: teammates[3].email, name: 'Rafael Cruz' }, 'GBP', null, at(50 - i * 10))));
  state.leads.push(service.newLead(secondary.id, {
    companyName: 'Camden Coworking', contactName: 'Ellie Ward', contactEmail: 'ellie@camden.example',
    pipelineStage: 'QUALIFIED', estimatedValue: 5400, qualificationScore: 70,
  }, at(5)));

  service.record(primary.id, 'LEAD_STAGE_CHANGED', `Moved Zenith Analytics to ${STAGE_LABEL.PROPOSAL_SENT}`, { id: teammates[1].id, email: teammates[1].email, name: 'Jon Reyes' }, undefined, at(0.2));
  service.record(primary.id, 'CLIENT_UPDATED', 'Updated client Harbor Logistics', { id: teammates[0].id, email: teammates[0].email, name: 'Maya Lim' }, undefined, at(1));
  service.record(primary.id, 'MEMBER_JOINED', 'Ava Tan joined as Member', null, '/team', at(30));
  service.record(secondary.id, 'BUSINESS_CREATED', 'Created Northwind Cleaning Co', { id: teammates[3].id, email: teammates[3].email, name: 'Rafael Cruz' }, undefined, at(60));
}

function uniqueSlug(state: MockState, base: string): string {
  let slug = base;
  for (let i = 2; state.businesses.some(b => b.slug === slug); i++) slug = `${base}-${i}`;
  return slug;
}
