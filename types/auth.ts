export type UserRole = 'ADMIN' | 'CLIENT' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  avatarUrl?: string;
  title?: string;
}

export type ActiveView = 'PUBLIC' | 'PORTAL' | 'ADMIN';

export interface AuthState {
  currentUser: User;
  isAuthenticated: boolean;
  activeView: ActiveView;
}
