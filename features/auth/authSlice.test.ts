import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout, clearAuth, validateSession } from './authSlice.ts';

test('login fulfilled updates auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);
  assert.equal(store.getState().auth.currentUser.email, 'test@example.com');
  assert.equal(store.getState().auth.currentUser.role, 'ADMIN');
});

test('logout fulfilled clears auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  // Then logout
  store.dispatch({ type: 'auth/logout/fulfilled' });

  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.currentUser.role, 'GUEST');
});

test('clearAuth resets to unauthenticated state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  // Then clear
  store.dispatch(clearAuth());

  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.currentUser.id, '');
});

test('login rejected does not authenticate user', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // In mock mode, initial state is authenticated
  // We test that rejected action doesn't change it to unauthenticated
  const initialAuthState = store.getState().auth.isAuthenticated;

  // Simulate rejected login
  store.dispatch({ type: 'auth/login/rejected', error: new Error('Invalid credentials') });

  // State should remain as it was (rejected action doesn't change state)
  assert.equal(store.getState().auth.isAuthenticated, initialAuthState);
});

test('login CLIENT role sets PORTAL view', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CLIENT' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.activeView, 'PORTAL');
});

test('login ADMIN role sets ADMIN view', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.activeView, 'ADMIN');
});

test('validateSession fulfilled restores auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // In mock mode, initial state is authenticated
  // In real mode, initial state is unauthenticated
  // We test that fulfilled action sets authenticated state regardless of initial state
  store.dispatch({ type: 'auth/validateSession/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    }
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);
  assert.equal(store.getState().auth.currentUser.email, 'test@example.com');
  assert.equal(store.getState().auth.activeView, 'ADMIN');
});

test('validateSession rejected clears auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);

  // Simulate failed session validation (expired token, 401, etc.)
  store.dispatch({ type: 'auth/validateSession/rejected', error: { message: 'Session validation failed' } });

  // Should clear auth state
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.currentUser.role, 'GUEST');
  assert.equal(store.getState().auth.activeView, 'PUBLIC');
});

test('validateSession pending sets validating flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  assert.equal(store.getState().auth.isSessionValidating, false);

  store.dispatch({ type: 'auth/validateSession/pending' });

  assert.equal(store.getState().auth.isSessionValidating, true);
});

test('validateSession fulfilled clears validating flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/validateSession/pending' });
  assert.equal(store.getState().auth.isSessionValidating, true);

  store.dispatch({ type: 'auth/validateSession/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    }
  }});

  assert.equal(store.getState().auth.isSessionValidating, false);
});

test('validateSession rejected clears validating flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/validateSession/pending' });
  assert.equal(store.getState().auth.isSessionValidating, true);

  store.dispatch({ type: 'auth/validateSession/rejected', error: new Error('Session validation failed') });

  assert.equal(store.getState().auth.isSessionValidating, false);
});

test('validateSession rejected with no token message clears auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);

  // Simulate no token found during validation
  store.dispatch({ type: 'auth/validateSession/rejected', error: { message: 'No token found' } });

  // Should clear auth state
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.currentUser.role, 'GUEST');
  assert.equal(store.getState().auth.activeView, 'PUBLIC');
});

test('validateSession rejected with validation in progress message does not clear auth state', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);

  // Simulate duplicate validation request (should not clear state)
  // Need to set error.message property on the action
  const action = { type: 'auth/validateSession/rejected', error: { message: 'Validation already in progress' } };
  store.dispatch(action);

  // Auth state should remain intact
  assert.equal(store.getState().auth.isAuthenticated, true);
  assert.equal(store.getState().auth.currentUser.email, 'test@example.com');
});

test('logout rejected still clears auth state (backend failure does not block logout)', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  // Set authenticated state first
  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isAuthenticated, true);

  // Simulate backend logout failure
  store.dispatch({ type: 'auth/logout/rejected', error: { message: 'Network error' } });

  // Should still clear auth state client-side
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.currentUser.role, 'GUEST');
  assert.equal(store.getState().auth.activeView, 'PUBLIC');
  assert.equal(store.getState().auth.isSessionValidating, false);
});

test('validateSession CLIENT role sets PORTAL view', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/validateSession/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CLIENT' as const
    }
  }});

  assert.equal(store.getState().auth.activeView, 'PORTAL');
});

test('validateSession GUEST role sets PUBLIC view', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/validateSession/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'GUEST' as const
    }
  }});

  assert.equal(store.getState().auth.activeView, 'PUBLIC');
});

test('login pending sets logging in flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  assert.equal(store.getState().auth.isLoggingIn, false);

  store.dispatch({ type: 'auth/login/pending' });

  assert.equal(store.getState().auth.isLoggingIn, true);
});

test('login fulfilled clears logging in flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/login/pending' });
  assert.equal(store.getState().auth.isLoggingIn, true);

  store.dispatch({ type: 'auth/login/fulfilled', payload: {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const
    },
    token: 'test-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }});

  assert.equal(store.getState().auth.isLoggingIn, false);
});

test('login rejected clears logging in flag', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });

  store.dispatch({ type: 'auth/login/pending' });
  assert.equal(store.getState().auth.isLoggingIn, true);

  store.dispatch({ type: 'auth/login/rejected', error: { message: 'Invalid credentials' } });

  assert.equal(store.getState().auth.isLoggingIn, false);
});
