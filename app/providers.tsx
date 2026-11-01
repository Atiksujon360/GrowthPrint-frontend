'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store, addToast } from '../store/index.ts';
import { validateSession, clearAuth } from '../features/auth/authSlice.ts';
import { hasStoredSession } from '../features/auth/authSlice.ts';
import { setUnauthorizedHandler } from '../lib/api/client.ts';

/**
 * Restores a stored session on startup and ends it when the backend rejects the token.
 * - Page refresh: a token in sessionStorage is validated via GET /auth/me instead of being ignored.
 * - Expired/revoked token: any authenticated 401 clears the token and auth state; the protected
 *   layouts then send the user to their login page.
 */
function SessionBootstrap() {
  useEffect(() => {
    if (hasStoredSession()) {
      void store.dispatch(validateSession());
    }

    setUnauthorizedHandler(() => {
      if (!store.getState().auth.isAuthenticated) {
        return;
      }
      try {
        window.sessionStorage.removeItem('gp_auth_token');
      } catch {
        // storage unavailable: auth state is still cleared below
      }
      store.dispatch(clearAuth());
      store.dispatch(addToast({
        type: 'warning',
        title: 'Session expired',
        message: 'Please sign in again to continue.'
      }));
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  return null;
}

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      {children}
    </Provider>
  );
}
