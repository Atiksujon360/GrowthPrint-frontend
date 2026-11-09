import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ActiveView, AuthState, TeamModule, User, UserRole } from '../../types/auth.ts';
import { TEAM_MODULES } from '../../types/auth.ts';
import { apiClient, isMockModeEnv } from '../../lib/api/client.ts';
import { ROLE_LABEL } from '../../lib/access.ts';

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'user-founder',
    name: 'Alex Vance',
    email: 'admin@growthprint.dev',
    role: 'ADMIN',
    title: 'Founder & Principal Engineer',
  },
  TEAM_MEMBER: {
    id: 'user-team',
    name: 'Sam Rivera',
    email: 'team@growthprint.dev',
    role: 'TEAM_MEMBER',
    title: 'Team member',
    permissions: ['CRM', 'SUPPORT', 'PROJECTS'],
  },
  CLIENT: {
    id: 'user-client-meridian',
    name: 'Sarah Chen',
    email: 'clientb@growthprint.dev',
    role: 'CLIENT',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    title: 'VP of Digital Operations',
  },
  GUEST: {
    id: 'user-guest',
    name: 'Public Visitor',
    email: 'visitor@company.com',
    role: 'GUEST',
  },
};

// Mock mode is opt-in (NEXT_PUBLIC_USE_MOCK_API === 'true'); see isMockModeEnv.
const isMockMode = isMockModeEnv();

export const TOKEN_KEY = 'gp_auth_token';

/**
 * Maps a backend role to a frontend role. Unknown roles get no workspace access (GUEST) instead of
 * silently being treated as CLIENT.
 */
export function toFrontendRole(role: string | undefined): UserRole {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'TEAM_MEMBER') return 'TEAM_MEMBER';
  if (role === 'CLIENT') return 'CLIENT';
  return 'GUEST';
}

/** Keeps only module names the frontend knows (unknown values are ignored, never trusted). */
export function toTeamModules(values: readonly string[] | undefined | null): TeamModule[] {
  return (values ?? []).filter((v): v is TeamModule => (TEAM_MODULES as readonly string[]).includes(v));
}

/** Profile shape returned by the backend (login `user`, GET /auth/me, GET /account/profile). */
export interface BackendProfile {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
  clientId?: string | null;
  permissions?: string[] | null;
  jobTitle?: string | null;
}

/** Builds the session user from a backend profile. The backend stays the authority for every permission. */
export function toSessionUser(profile: BackendProfile): User {
  const role = toFrontendRole(profile.role);
  const name = profile.fullName?.trim() || profile.email.split('@')[0];
  return {
    id: profile.id,
    name,
    email: profile.email,
    role,
    clientId: profile.clientId ?? undefined,
    title: profile.jobTitle?.trim() || ROLE_LABEL[role],
    permissions: role === 'TEAM_MEMBER' ? toTeamModules(profile.permissions) : [],
  };
}

export function viewForRole(role: UserRole): ActiveView {
  if (role === 'ADMIN' || role === 'TEAM_MEMBER') return 'ADMIN';
  if (role === 'CLIENT') return 'PORTAL';
  return 'PUBLIC';
}

/** Stores the access token for this browser tab (sessionStorage: cleared when the tab closes). */
export function storeSessionToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // storage unavailable (private mode): the session simply does not survive a refresh
  }
}

/** True when a stored token exists that should be validated on startup (real-API mode only). */
export function hasStoredSession(): boolean {
  if (isMockMode || typeof window === 'undefined') return false;
  try {
    return Boolean(window.sessionStorage?.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

interface LoginApiResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: BackendProfile;
}

/** Turns a backend login response into the session (stores the token). Shared by login and invite acceptance. */
export function sessionFromLoginResponse(data: LoginApiResponse): { user: User; token: string; expiresAt: string } {
  storeSessionToken(data.accessToken);
  return { user: toSessionUser(data.user), token: data.accessToken, expiresAt: data.expiresAt };
}

const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    if (isMockMode) {
      const normalizedEmail = credentials.email.toLowerCase().trim();
      const role: UserRole | null = normalizedEmail.includes('admin') || normalizedEmail.includes('alex')
        ? 'ADMIN'
        : normalizedEmail.includes('team')
          ? 'TEAM_MEMBER'
          : normalizedEmail.includes('client') || normalizedEmail.includes('sarah')
            ? 'CLIENT'
            : null;
      if (!role) {
        return rejectWithValue('Invalid email or password.');
      }
      return {
        user: DEMO_USERS[role],
        token: `mock-jwt-token-${role.toLowerCase()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
    }

    try {
      // skipAuth: no stale token is sent, and a 401 here means wrong credentials, not an expired session.
      const response = await apiClient.post<LoginApiResponse>(
        '/auth/login',
        { email: credentials.email.trim(), password: credentials.password },
        { skipAuth: true },
      );
      const session = sessionFromLoginResponse(response.data);
      if (session.user.role === 'GUEST') {
        storeSessionToken(null);
        return rejectWithValue('This account has no access to a GrowthPrint workspace.');
      }
      return session;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      // One generic message for wrong email AND wrong password (no account enumeration).
      if (status === 401) return rejectWithValue('Invalid email or password.');
      if (status === 429) return rejectWithValue('Too many sign-in attempts. Please wait a few minutes and try again.');
      if (status === 400) return rejectWithValue('Please enter a valid email address and password.');
      return rejectWithValue('We could not reach GrowthPrint. Check your connection and try again.');
    }
  },
);

const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Continue with client-side logout even if the backend call fails
  }
  storeSessionToken(null);
});

// Track validation in progress to prevent duplicate requests
let isValidationInProgress = false;

const validateSession = createAsyncThunk('auth/validateSession', async (_, { rejectWithValue }) => {
  if (isMockMode) {
    return { user: DEMO_USERS.ADMIN };
  }
  if (isValidationInProgress) {
    return rejectWithValue('Validation already in progress');
  }
  if (typeof window === 'undefined') {
    return rejectWithValue('Window not available');
  }
  if (!hasStoredSession()) {
    return rejectWithValue('No token found');
  }

  isValidationInProgress = true;
  try {
    const response = await apiClient.get<BackendProfile>('/auth/me');
    const user = toSessionUser(response.data);
    if (user.role === 'GUEST') {
      throw new Error('Unsupported role');
    }
    return { user };
  } catch {
    storeSessionToken(null);
    return rejectWithValue('Session validation failed');
  } finally {
    isValidationInProgress = false;
  }
});

const GUEST_USER: User = { id: '', name: '', email: '', role: 'GUEST' };

const initialAuthState: AuthState = {
  currentUser: isMockMode ? DEMO_USERS.ADMIN : GUEST_USER,
  isAuthenticated: isMockMode,
  activeView: 'PUBLIC',
  // A stored token is validated on startup (SessionBootstrap); until then protected layouts wait
  // instead of redirecting to the login page.
  isSessionValidating: hasStoredSession(),
  isLoggingIn: false,
};

const signedOut = (state: AuthState) => {
  state.currentUser = GUEST_USER;
  state.isAuthenticated = false;
  state.activeView = 'PUBLIC';
  state.isSessionValidating = false;
  state.isLoggingIn = false;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    switchRole: (state, action: PayloadAction<UserRole>) => {
      const role = action.payload;
      state.currentUser = DEMO_USERS[role];
      state.activeView = viewForRole(role);
    },
    setActiveView: (state, action: PayloadAction<ActiveView>) => {
      state.activeView = action.payload;
    },
    clearAuth: (state) => {
      state.currentUser = GUEST_USER;
      state.isAuthenticated = false;
      state.activeView = 'PUBLIC';
    },
    /** Applies a fresh login response (password change, invitation acceptance). */
    sessionStarted: (state, action: PayloadAction<{ user: User }>) => {
      state.currentUser = action.payload.user;
      state.isAuthenticated = true;
      state.isSessionValidating = false;
      state.activeView = viewForRole(action.payload.user.role);
    },
    /** Updates name/title after a profile edit, without touching role or permissions. */
    profileUpdated: (state, action: PayloadAction<{ name: string; title?: string }>) => {
      state.currentUser.name = action.payload.name;
      if (action.payload.title) state.currentUser.title = action.payload.title;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.isLoggingIn = false;
        state.activeView = viewForRole(action.payload.user.role);
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(logout.fulfilled, signedOut)
      .addCase(logout.rejected, signedOut)
      .addCase(validateSession.pending, (state) => {
        state.isSessionValidating = true;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.isSessionValidating = false;
        state.activeView = viewForRole(action.payload.user.role);
      })
      .addCase(validateSession.rejected, (state, action) => {
        // rejectWithValue puts the reason in action.payload (action.error.message is always "Rejected").
        // A duplicate call (React Strict Mode runs the startup effect twice) must not end the first call's
        // validation: clearing the flag here made protected layouts redirect to login before /auth/me answered.
        if (action.payload === 'Validation already in progress') return;
        state.currentUser = GUEST_USER;
        state.isAuthenticated = false;
        state.activeView = 'PUBLIC';
        state.isSessionValidating = false;
      });
  },
});

export const { switchRole, setActiveView, clearAuth, sessionStarted, profileUpdated } = authSlice.actions;
export { login, logout, validateSession };
export default authSlice.reducer;
