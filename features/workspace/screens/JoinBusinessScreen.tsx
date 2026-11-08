'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import {
  useAcceptInvitationMutation, useDeclineInvitationMutation, useInvitationPreviewQuery, errorMessage,
} from '../api/workspaceApi.ts';
import { ROLE_DESCRIPTION, ROLE_LABEL } from '../model/permissions.ts';
import { formatDate } from '../model/format.ts';
import { AuthShell } from '../../auth/components/AuthShell.tsx';
import { Button, Notice, Skeleton } from '../../../components/ui/forms.tsx';
import { useAppSelector } from '../../../store/hooks.ts';
import { ROUTES, workspaceRoutes } from '../../../lib/routes.ts';

/** Session-only hand-off so a signed-out invitee can sign in and come back without the token staying in the URL. */
export const PENDING_INVITE_KEY = 'gp_pending_business_invite';

function readToken(): string | null {
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
  if (fromHash) {
    try { sessionStorage.setItem(PENDING_INVITE_KEY, fromHash); } catch { /* storage blocked: token kept in memory only */ }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return fromHash;
  }
  try { return sessionStorage.getItem(PENDING_INVITE_KEY); } catch { return null; }
}

function clearToken() {
  try { sessionStorage.removeItem(PENDING_INVITE_KEY); } catch { /* ignore */ }
}

export function JoinBusinessScreen() {
  const router = useRouter();
  const { isAuthenticated, isSessionValidating, currentUser } = useAppSelector(s => s.auth);
  const tokenRef = useRef<string | null | undefined>(undefined);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [done, setDone] = useState<'declined' | null>(null);

  useEffect(() => {
    // Read once per mount: Strict Mode runs effects twice, and the first run scrubs the fragment.
    if (tokenRef.current === undefined) tokenRef.current = readToken();
    setToken(tokenRef.current);
  }, []);

  const signedIn = isAuthenticated && currentUser.role !== 'CLIENT';
  const preview = useInvitationPreviewQuery(token ?? '', { skip: !token || !signedIn });
  const [accept, { isLoading: accepting, error: acceptError }] = useAcceptInvitationMutation();
  const [decline, { isLoading: declining, error: declineError }] = useDeclineInvitationMutation();

  if (token === undefined || isSessionValidating) {
    return <AuthShell eyebrow="Business invitation" title="Checking your invitation…"><Skeleton className="h-24" /></AuthShell>;
  }

  if (!token) {
    return (
      <AuthShell eyebrow="Business invitation" title="This link is incomplete">
        <Notice tone="error">The invitation link is missing its code. Open the full link from your invitation, or ask for a new one.</Notice>
      </AuthShell>
    );
  }

  if (done === 'declined') {
    return (
      <AuthShell eyebrow="Business invitation" title="Invitation declined">
        <p className="text-sm text-ink-600">You won't be added. The person who invited you can send a new invitation if needed.</p>
        <Link href={ROUTES.workspace.home} className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">Go to your businesses</Link>
      </AuthShell>
    );
  }

  if (!signedIn) {
    return (
      <AuthShell eyebrow="Business invitation" title="Sign in to accept"
        subtitle="Use the account for the email address the invitation was sent to.">
        <Notice tone="info">After you sign in, come back to this page — we'll keep the invitation for this browser session.</Notice>
        <Link href={ROUTES.admin.login} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  if (preview.isLoading) {
    return <AuthShell eyebrow="Business invitation" title="Checking your invitation…"><Skeleton className="h-24" /></AuthShell>;
  }

  if (preview.error || !preview.data) {
    return (
      <AuthShell eyebrow="Business invitation" title="This invitation can't be used">
        <Notice tone="error">{errorMessage(preview.error, 'This invitation is invalid or has expired.')}</Notice>
        <p className="mt-4 text-sm text-ink-600">You're signed in as <strong>{currentUser.email}</strong>. If the invitation was sent to another address, sign in with that account.</p>
        <Link href={ROUTES.workspace.home} onClick={clearToken} className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">Go to your businesses</Link>
      </AuthShell>
    );
  }

  const p = preview.data;
  const busy = accepting || declining;

  return (
    <AuthShell eyebrow="Business invitation" title={`Join ${p.businessName}`}
      subtitle={`You've been invited as ${ROLE_LABEL[p.role]}.`}>
      <div className="space-y-5">
        {(acceptError || declineError) && <Notice tone="error">{errorMessage(acceptError ?? declineError)}</Notice>}
        <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
          <dl className="space-y-1 text-sm">
            <div><dt className="sr-only">Business</dt><dd className="font-semibold text-ink-900">{p.businessName}</dd></div>
            <div><dt className="sr-only">Role</dt><dd className="text-ink-700">{ROLE_LABEL[p.role]} — {ROLE_DESCRIPTION[p.role]}</dd></div>
            <div><dt className="sr-only">Invited email</dt><dd className="text-ink-500">For {p.invitedEmail} · expires {formatDate(p.expiresAt)}</dd></div>
          </dl>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button fullWidth loading={accepting} loadingText="Joining…" disabled={busy} onClick={async () => {
            const result = await accept(token);
            if ('data' in result && result.data) { clearToken(); router.replace(workspaceRoutes(result.data.id).home); }
          }}>Accept and join</Button>
          <Button fullWidth variant="secondary" loading={declining} loadingText="Declining…" disabled={busy} onClick={async () => {
            const result = await decline(token);
            if (!('error' in result)) { clearToken(); setDone('declined'); }
          }}>Decline</Button>
        </div>
      </div>
    </AuthShell>
  );
}
