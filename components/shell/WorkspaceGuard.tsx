'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '../../store/hooks.ts';
import { canAccessWorkspace, type Workspace } from '../../lib/access.ts';
import { ROUTES, getDefaultRouteForRole } from '../../lib/routes.ts';

const LOGIN_PATH: Record<Workspace, string> = {
  admin: ROUTES.admin.login,
  portal: ROUTES.portal.login
};

/**
 * Protects a workspace route group.
 * - Not signed in -> that workspace's login page.
 * - Signed in with the wrong role (e.g. a CLIENT opening /admin) -> the user's own workspace.
 * - While a stored session is being validated (page refresh) -> loading state, no redirect.
 */
export function WorkspaceGuard({ workspace, children }: Readonly<{ workspace: Workspace; children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isSessionValidating, currentUser } = useAppSelector(state => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  const isLoginPage = pathname === LOGIN_PATH[workspace];
  const hasAccess = isAuthenticated && canAccessWorkspace(currentUser.role, workspace);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoginPage || isSessionValidating) return;
    if (!isAuthenticated) {
      router.replace(LOGIN_PATH[workspace]);
    } else if (!hasAccess) {
      router.replace(getDefaultRouteForRole(currentUser.role));
    }
  }, [isAuthenticated, hasAccess, isSessionValidating, router, isMounted, isLoginPage, workspace, currentUser.role]);

  if (!isMounted || (isSessionValidating && !isLoginPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFD]">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!hasAccess && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
