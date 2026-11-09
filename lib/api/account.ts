/**
 * Account, password-recovery and user-management API calls.
 * Every rule (who may do what, password policy, token validity) is enforced by the backend; these helpers only
 * shape requests and responses.
 */
import { apiClient } from './client.ts';
import type { BackendProfile } from '../../features/auth/authSlice.ts';
import type { TeamModule } from '../../types/auth.ts';

export interface AccountProfile extends BackendProfile {
  createdAt: string;
  accountStatus: string;
  clientRole?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  timezone?: string | null;
  emailNotifications: boolean;
  permissions: string[];
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: BackendProfile;
}

export interface UpdateProfileInput {
  fullName: string;
  phone: string;
  jobTitle: string;
  timezone: string;
  emailNotifications: boolean;
}

export const accountApi = {
  // ---- public (no token) -------------------------------------------------------------------
  async requestPasswordReset(email: string): Promise<string> {
    const res = await apiClient.post<{ message: string }>('/auth/password/forgot', { email: email.trim() },
      { skipAuth: true, retries: 0 });
    return res.data.message;
  },
  async verifyResetToken(token: string): Promise<void> {
    await apiClient.post('/auth/password/reset/verify', { token }, { skipAuth: true, retries: 0 });
  },
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password/reset', { token, newPassword }, { skipAuth: true, retries: 0 });
  },
  async previewInvitation(token: string): Promise<InvitationPreview> {
    return (await apiClient.post<InvitationPreview>('/auth/invitations/preview', { token },
      { skipAuth: true, retries: 0 })).data;
  },
  async acceptInvitation(token: string, password: string): Promise<LoginResponse> {
    return (await apiClient.post<LoginResponse>('/auth/invitations/accept', { token, password },
      { skipAuth: true, retries: 0 })).data;
  },

  // ---- signed-in user (own account only) ---------------------------------------------------
  async getProfile(): Promise<AccountProfile> {
    return (await apiClient.get<AccountProfile>('/account/profile')).data;
  },
  async updateProfile(input: UpdateProfileInput): Promise<AccountProfile> {
    return (await apiClient.patch<AccountProfile>('/account/profile', input)).data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<LoginResponse> {
    return (await apiClient.post<LoginResponse>('/account/password', { currentPassword, newPassword },
      { retries: 0 })).data;
  },
  async signOutEverywhere(): Promise<void> {
    await apiClient.post('/account/sessions/revoke', undefined, { retries: 0 });
  },
};

// ---- admin: users, staff, permissions -------------------------------------------------------

export type ManagedRole = 'ADMIN' | 'TEAM_MEMBER' | 'CLIENT';
export type AccountStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface ManagedUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: ManagedRole;
  accountStatus: AccountStatus;
  clientId?: string | null;
  clientName?: string | null;
  clientRole?: string | null;
  permissions: TeamModule[];
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt: string;
}

export interface OneTimeLink {
  token: string;
  link: string;
  expiresAt: string;
}

export interface InvitationPreview {
  email: string;
  fullName?: string | null;
  role: string;
  clientName?: string | null;
}

export interface InviteUserInput {
  email: string;
  fullName: string;
  role: ManagedRole;
  clientId?: string;
  clientRole?: string;
  permissions?: TeamModule[];
}

export interface SecurityOverview {
  emailDeliveryConfigured: boolean;
  accessTokenMinutes: number;
  passwordResetMinutes: number;
  invitationHours: number;
  passwordMinLength: number;
  passwordPolicy: string;
  grantableModules: TeamModule[];
  activeAdmins: number;
}

export const userAdminApi = {
  async list(filters: { role?: ManagedRole; clientId?: string } = {}): Promise<ManagedUser[]> {
    return (await apiClient.get<ManagedUser[]>('/admin/users', { params: filters })).data;
  },
  async invite(input: InviteUserInput): Promise<{ user: ManagedUser; invitation: OneTimeLink }> {
    return (await apiClient.post<{ user: ManagedUser; invitation: OneTimeLink }>('/admin/users', input,
      { retries: 0 })).data;
  },
  async reissueInvitation(id: string): Promise<OneTimeLink> {
    return (await apiClient.post<OneTimeLink>(`/admin/users/${encodeURIComponent(id)}/invitation`, undefined,
      { retries: 0 })).data;
  },
  async passwordResetLink(id: string): Promise<OneTimeLink> {
    return (await apiClient.post<OneTimeLink>(`/admin/users/${encodeURIComponent(id)}/password-reset-link`,
      undefined, { retries: 0 })).data;
  },
  async suspend(id: string): Promise<ManagedUser> {
    return (await apiClient.post<ManagedUser>(`/admin/users/${encodeURIComponent(id)}/suspend`, undefined,
      { retries: 0 })).data;
  },
  async reactivate(id: string): Promise<ManagedUser> {
    return (await apiClient.post<ManagedUser>(`/admin/users/${encodeURIComponent(id)}/reactivate`, undefined,
      { retries: 0 })).data;
  },
  async changeRole(id: string, role: 'ADMIN' | 'TEAM_MEMBER'): Promise<ManagedUser> {
    return (await apiClient.patch<ManagedUser>(`/admin/users/${encodeURIComponent(id)}/role`, { role })).data;
  },
  async replacePermissions(id: string, modules: TeamModule[]): Promise<ManagedUser> {
    return (await apiClient.put<ManagedUser>(`/admin/users/${encodeURIComponent(id)}/permissions`, { modules })).data;
  },
  async securityOverview(): Promise<SecurityOverview> {
    return (await apiClient.get<SecurityOverview>('/admin/security/overview')).data;
  },
};

/** Field errors from an RFC 9457-style backend error body ({ fieldErrors: { name: message } }). */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  const data = (error as { data?: { fieldErrors?: Record<string, string> } })?.data;
  return data?.fieldErrors ?? {};
}

/** The backend's human-readable message, or a fallback. Never shows stack traces or raw objects. */
export function messageOf(error: unknown, fallback: string): string {
  const e = error as { data?: { message?: string; detail?: string }; isNetworkError?: boolean; status?: number };
  if (e?.isNetworkError) return 'We could not reach GrowthPrint. Check your connection and try again.';
  if (e?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  const message = e?.data?.message ?? e?.data?.detail;
  return typeof message === 'string' && message.length < 300 ? message : fallback;
}
