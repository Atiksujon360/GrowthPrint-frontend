export type UserRole = 'ADMIN' | 'TEAM_MEMBER' | 'CLIENT' | 'GUEST';

/** Internal modules an admin can grant to a team member (backend TeamModule). */
export type TeamModule = 'CRM' | 'CLIENTS' | 'PROJECTS' | 'SUPPORT' | 'PROPOSALS' | 'OUTREACH';

export const TEAM_MODULES: readonly TeamModule[] = ['CRM', 'CLIENTS', 'PROJECTS', 'SUPPORT', 'PROPOSALS', 'OUTREACH'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  avatarUrl?: string;
  title?: string;
  /** TEAM_MEMBER module permissions (empty for other roles). */
  permissions?: TeamModule[];
}

export type ActiveView = 'PUBLIC' | 'PORTAL' | 'ADMIN';

export interface AuthState {
  currentUser: User;
  isAuthenticated: boolean;
  activeView: ActiveView;
  isSessionValidating: boolean;
  isLoggingIn: boolean;
}
