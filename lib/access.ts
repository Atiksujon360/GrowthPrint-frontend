import type { UserRole } from '../types/auth.ts';

export type Workspace = 'admin' | 'portal';

/**
 * Which role may open which workspace. The backend enforces the same rule on every API call; this only
 * keeps users out of screens whose data they could never load.
 */
export function canAccessWorkspace(role: UserRole, workspace: Workspace): boolean {
  return workspace === 'admin' ? role === 'ADMIN' : role === 'CLIENT';
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
