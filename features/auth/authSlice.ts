import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, UserRole } from '../../types/auth.ts';

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'user-founder',
    name: 'Alex Vance',
    email: 'alex@growthprint.agency',
    role: 'ADMIN',
    title: 'Founder & Principal Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  CLIENT: {
    id: 'user-client-meridian',
    name: 'Sarah Chen',
    email: 'sarah.chen@meridianretail.com',
    role: 'CLIENT',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    title: 'VP of Digital Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
  },
  GUEST: {
    id: 'user-guest',
    name: 'Public Visitor',
    email: 'visitor@company.com',
    role: 'GUEST'
  }
};

const initialAuthState: AuthState = {
  currentUser: DEMO_USERS.ADMIN,
  isAuthenticated: true,
  activeView: 'PUBLIC'
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    switchRole: (state, action: PayloadAction<UserRole>) => {
      const role = action.payload;
      state.currentUser = DEMO_USERS[role];
      if (role === 'ADMIN') {
        state.activeView = 'ADMIN';
      } else if (role === 'CLIENT') {
        state.activeView = 'PORTAL';
      } else {
        state.activeView = 'PUBLIC';
      }
    },
    setActiveView: (state, action: PayloadAction<'PUBLIC' | 'PORTAL' | 'ADMIN'>) => {
      state.activeView = action.payload;
    }
  }
});

export const { switchRole, setActiveView } = authSlice.actions;
export default authSlice.reducer;
