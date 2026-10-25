import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, UserRole } from '../../types/auth.ts';
import { apiClient } from '../../lib/api/client.ts';

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

// Check if mock mode is enabled
const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

// Async thunks for real authentication
const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, use demo users
      const normalizedEmail = credentials.email.toLowerCase().trim();
      if (normalizedEmail.includes('admin') || normalizedEmail.includes('alex')) {
        return {
          user: DEMO_USERS.ADMIN,
          token: 'mock-jwt-token-admin',
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        };
      } else if (normalizedEmail.includes('client') || normalizedEmail.includes('sarah')) {
        return {
          user: DEMO_USERS.CLIENT,
          token: 'mock-jwt-token-client',
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        };
      }
      return rejectWithValue('Invalid credentials in mock mode. Use admin@growthprint.agency or sarah.chen@meridianretail.com');
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      const data = response.data as {
        accessToken: string;
        tokenType: string;
        expiresAt: string;
        user: {
          id: string;
          email: string;
          role: string;
        };
      };

      // Store JWT token in sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('gp_auth_token', data.accessToken);
      }

      // Map backend role to frontend role
      const frontendRole: UserRole = data.user.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';

      const user: User = {
        id: data.user.id,
        name: data.user.email.split('@')[0], // Use email prefix as name for now
        email: data.user.email,
        role: frontendRole,
        title: frontendRole === 'ADMIN' ? 'Administrator' : 'Client User',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
      };

      return {
        user,
        token: data.accessToken,
        expiresAt: data.expiresAt
      };
    } catch (error: any) {
      // Log error message only, not the full error object to avoid exposing tokens
      console.error('Login failed:', error.message);
      return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
    }
  }
);

const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Call backend logout endpoint (client-side token discard)
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue with client-side logout even if backend call fails
    console.error('Backend logout failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Clear token from sessionStorage
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('gp_auth_token');
  }

  return;
});

// Track validation in progress to prevent duplicate requests
let isValidationInProgress = false;

const validateSession = createAsyncThunk('auth/validateSession', async (_, { rejectWithValue }) => {
  // In mock mode, skip validation (already authenticated in initial state)
  if (isMockMode) {
    return { user: DEMO_USERS.ADMIN };
  }

  // Prevent duplicate validation requests
  if (isValidationInProgress) {
    return rejectWithValue('Validation already in progress');
  }

  // Check if token exists in sessionStorage
  if (typeof window === 'undefined') {
    return rejectWithValue('Window not available');
  }

  const token = window.sessionStorage.getItem('gp_auth_token');
  if (!token) {
    return rejectWithValue('No token found');
  }

  isValidationInProgress = true;

  try {
    const response = await apiClient.get('/auth/me');

    const data = response.data as {
      id: string;
      email: string;
      role: string;
      createdAt: string;
    };

    // Map backend role to frontend role
    const frontendRole: UserRole = data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';

    const user: User = {
      id: data.id,
      name: data.email.split('@')[0],
      email: data.email,
      role: frontendRole,
      title: frontendRole === 'ADMIN' ? 'Administrator' : 'Client User',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
    };

    return { user };
  } catch (error: any) {
    // If validation fails (401, 403, network error), clear invalid token
    console.error('Session validation failed:', error.message);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('gp_auth_token');
    }
    return rejectWithValue('Session validation failed');
  } finally {
    isValidationInProgress = false;
  }
});

const initialAuthState: AuthState = {
  currentUser: isMockMode ? DEMO_USERS.ADMIN : {
    id: '',
    name: '',
    email: '',
    role: 'GUEST'
  },
  isAuthenticated: isMockMode,
  activeView: 'PUBLIC',
  isSessionValidating: false,
  isLoggingIn: false
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
    },
    clearAuth: (state) => {
      state.currentUser = {
        id: '',
        name: '',
        email: '',
        role: 'GUEST'
      };
      state.isAuthenticated = false;
      state.activeView = 'PUBLIC';
    }
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
        if (action.payload.user.role === 'ADMIN') {
          state.activeView = 'ADMIN';
        } else if (action.payload.user.role === 'CLIENT') {
          state.activeView = 'PORTAL';
        } else {
          state.activeView = 'PUBLIC';
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.error('Login rejected:', action.error?.message || 'Unknown error');
        state.isLoggingIn = false;
        // Keep state as-is (unauthenticated)
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = {
          id: '',
          name: '',
          email: '',
          role: 'GUEST'
        };
        state.isAuthenticated = false;
        state.activeView = 'PUBLIC';
        state.isSessionValidating = false;
        state.isLoggingIn = false;
      })
      .addCase(logout.rejected, (state) => {
        // Even if backend logout fails, clear auth state client-side
        state.currentUser = {
          id: '',
          name: '',
          email: '',
          role: 'GUEST'
        };
        state.isAuthenticated = false;
        state.activeView = 'PUBLIC';
        state.isSessionValidating = false;
        state.isLoggingIn = false;
      })
      .addCase(validateSession.pending, (state) => {
        state.isSessionValidating = true;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.isSessionValidating = false;
        if (action.payload.user.role === 'ADMIN') {
          state.activeView = 'ADMIN';
        } else if (action.payload.user.role === 'CLIENT') {
          state.activeView = 'PORTAL';
        } else {
          state.activeView = 'PUBLIC';
        }
      })
      .addCase(validateSession.rejected, (state, action) => {
        // Only clear auth state if the rejection is due to actual validation failure
        // not due to duplicate request prevention
        const errorMessage = action.error?.message;
        if (errorMessage !== 'Validation already in progress') {
          state.currentUser = {
            id: '',
            name: '',
            email: '',
            role: 'GUEST'
          };
          state.isAuthenticated = false;
          state.activeView = 'PUBLIC';
        }
        state.isSessionValidating = false;
      });
  }
});

export const { switchRole, setActiveView, clearAuth } = authSlice.actions;
export { login, logout, validateSession };
export default authSlice.reducer;
