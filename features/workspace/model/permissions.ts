/**
 * Business-role rules shared by the UI and the mock service.
 *
 * Membership rules mirror the implemented backend (`BusinessMembershipService`). Client/lead permissions are the
 * proposed Phase 2 contract (the backend still guards those modules with global roles). The UI uses these only to
 * hide or disable controls; the backend remains the authority and must enforce the same rules.
 */
import type { BusinessRole, Lead } from './types.ts';

const RANK: Record<BusinessRole, number> = { OWNER: 4, ADMIN: 3, MANAGER: 2, MEMBER: 1 };

export const atLeast = (role: BusinessRole, minimum: BusinessRole): boolean => RANK[role] >= RANK[minimum];
export const outranks = (role: BusinessRole, other: BusinessRole): boolean => RANK[role] > RANK[other];

export type WorkspaceAction =
  | 'business.edit'
  | 'members.view'
  | 'members.invite'
  | 'members.manage'
  | 'ownership.transfer'
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'leads.view'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.convert'
  | 'leads.delete';

const MINIMUM: Record<WorkspaceAction, BusinessRole> = {
  'business.edit': 'ADMIN',
  'members.view': 'MEMBER',
  'members.invite': 'ADMIN',
  'members.manage': 'ADMIN',
  'ownership.transfer': 'OWNER',
  'clients.view': 'MEMBER',
  'clients.create': 'MANAGER',
  'clients.edit': 'MANAGER',
  'leads.view': 'MEMBER',
  'leads.create': 'MEMBER',
  'leads.edit': 'MANAGER',
  'leads.convert': 'MANAGER',
  'leads.delete': 'ADMIN',
};

export function can(role: BusinessRole | undefined, action: WorkspaceAction): boolean {
  return role !== undefined && atLeast(role, MINIMUM[action]);
}

export function minimumRoleFor(action: WorkspaceAction): BusinessRole {
  return MINIMUM[action];
}

/** Roles the actor may assign to a member who currently has `targetRole` (backend changeRole rules). */
export function assignableRoles(actorRole: BusinessRole, targetRole: BusinessRole): BusinessRole[] {
  if (actorRole === 'OWNER') return ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'];
  if (!atLeast(actorRole, 'ADMIN') || !outranks(actorRole, targetRole)) return [];
  return (['MANAGER', 'MEMBER'] as BusinessRole[]).filter(r => outranks(actorRole, r));
}

/** Whether the actor may remove `targetRole` (or leave, when it is themself). */
export function canRemove(actorRole: BusinessRole, targetRole: BusinessRole, isSelf: boolean): boolean {
  if (isSelf) return true;
  if (actorRole === 'OWNER') return true;
  return atLeast(actorRole, 'ADMIN') && outranks(actorRole, targetRole);
}

/** Roles the actor may invite (never OWNER; ADMIN only by an OWNER). */
export function invitableRoles(actorRole: BusinessRole): Array<Exclude<BusinessRole, 'OWNER'>> {
  if (actorRole === 'OWNER') return ['ADMIN', 'MANAGER', 'MEMBER'];
  if (actorRole === 'ADMIN') return ['MANAGER', 'MEMBER'];
  return [];
}

export type ConversionBlocker = 'ALREADY_CONVERTED' | 'NOT_ELIGIBLE_STAGE' | 'DO_NOT_CONTACT' | 'NO_CONTACT_EMAIL';

/** Why a lead cannot be converted (null = it can). Mirrors backend LeadConversionService. */
export function conversionBlocker(lead: Pick<Lead, 'convertedClientId' | 'pipelineStage' | 'doNotContact' | 'contactEmail'>):
  ConversionBlocker | null {
  if (lead.convertedClientId) return 'ALREADY_CONVERTED';
  if (lead.doNotContact || lead.pipelineStage === 'DO_NOT_CONTACT') return 'DO_NOT_CONTACT';
  if (lead.pipelineStage === 'LOST') return 'NOT_ELIGIBLE_STAGE';
  if (!lead.contactEmail || !lead.contactEmail.trim()) return 'NO_CONTACT_EMAIL';
  return null;
}

export const CONVERSION_BLOCKER_TEXT: Record<ConversionBlocker, string> = {
  ALREADY_CONVERTED: 'This lead has already been converted to a client.',
  NOT_ELIGIBLE_STAGE: 'Lost leads cannot be converted.',
  DO_NOT_CONTACT: 'Leads marked “do not contact” cannot be converted.',
  NO_CONTACT_EMAIL: 'Add a contact email before converting this lead.',
};

export const ROLE_LABEL: Record<BusinessRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};

export const ROLE_DESCRIPTION: Record<BusinessRole, string> = {
  OWNER: 'Full control, including ownership transfer and every admin action.',
  ADMIN: 'Manages the business profile, team members below Admin and invitations.',
  MANAGER: 'Creates and edits clients and leads, and converts leads into clients.',
  MEMBER: 'Views clients and leads and adds new leads.',
};
