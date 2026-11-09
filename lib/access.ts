import type { TeamModule, User, UserRole } from '../types/auth.ts';

export type Workspace = 'admin' | 'portal';

/**
 * Which role may open which workspace. The backend enforces the same rule on every API call; this only
 * keeps users out of screens whose data they could never load.
 * The internal studio ("admin" workspace) is shared by ADMIN and TEAM_MEMBER; TEAM_MEMBER sees only the
 * modules an admin granted (see {@link canUseStudioTab}).
 */
export function canAccessWorkspace(role: UserRole, workspace: Workspace): boolean {
  if (workspace === 'admin') {
    return role === 'ADMIN' || role === 'TEAM_MEMBER';
  }
  return role === 'CLIENT';
}

/** Studio tabs and the module a team member needs for each. null = ADMIN only; 'ALL' = every staff user. */
export const STUDIO_TAB_ACCESS = {
  DASHBOARD: 'ALL',
  SETTINGS: 'ALL',
  LEADS: 'CRM',
  OUTREACH: 'OUTREACH',
  REQUESTS: 'SUPPORT',
  PROJECTS: 'PROJECTS',
  CLIENTS: 'CLIENTS',
  INVOICES: null,
  AUTOMATION: null,
  ACTIVITY: null,
  AI_SETTINGS: null,
  TEAM: null,
} as const satisfies Record<string, TeamModule | 'ALL' | null>;

export type StudioTab = keyof typeof STUDIO_TAB_ACCESS;

/**
 * Whether a studio tab is shown to this user. Hiding a tab is a convenience only: the backend returns 403
 * for every module the user has not been granted.
 */
export function canUseStudioTab(user: Pick<User, 'role' | 'permissions'>, tab: StudioTab): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role !== 'TEAM_MEMBER') return false;
  const required: TeamModule | 'ALL' | null = STUDIO_TAB_ACCESS[tab];
  if (required === 'ALL') return true;
  if (required === null) return false;
  return (user.permissions ?? []).includes(required);
}

/** Demo client used by the mock data set (features/agency/initialData.ts). */
export const MOCK_CLIENT_ID = 'client-meridian';

/**
 * Portal data scoping.
 * Real-API mode: the store only ever holds data from the client's own `/my` endpoints (it is cleared on
 * every login/logout), and real logins carry no clientId, so the items are returned as they are.
 * Filtering by the mock fallback id used to hide every real record.
 * Mock mode: filter the shared demo data set down to the demo client.
 */
export function scopeToClient<T extends { clientId: string }>(
  items: readonly T[],
  clientId: string | undefined,
  mockMode: boolean
): T[] {
  if (!mockMode) {
    return [...items];
  }
  const id = clientId || MOCK_CLIENT_ID;
  return items.filter(item => item.clientId === id);
}

/** Two-letter initials for avatars (no third-party images). */
export function initialsOf(name: string | undefined, email?: string): string {
  const source = (name && name.trim()) || (email ? email.split('@')[0] : '') || '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  TEAM_MEMBER: 'Team member',
  CLIENT: 'Client',
  GUEST: 'Visitor',
};
