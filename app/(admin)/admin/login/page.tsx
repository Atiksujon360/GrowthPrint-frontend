'use client';

import { WorkspaceLoginScreen } from '../../../../features/auth/components/WorkspaceLoginScreen.tsx';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <WorkspaceLoginScreen
      role="ADMIN"
      onSignIn={() => {
        // Redirect is handled by the component
      }}
      onBackToPublic={() => {
        window.location.href = '/';
      }}
    />
  );
}
