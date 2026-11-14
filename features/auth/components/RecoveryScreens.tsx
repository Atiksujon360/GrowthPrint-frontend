'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { accountApi, fieldErrorsOf, messageOf, type InvitationPreview } from '../../../lib/api/account.ts';
import { checkPasswordRules, EMAIL_PATTERN, readTokenFromHash, validateNewPassword } from '../../../lib/passwordRules.ts';
import { getDefaultRouteForRole, ROUTES } from '../../../lib/routes.ts';
import { useAppDispatch } from '../../../store/hooks.ts';
import { sessionFromLoginResponse, sessionStarted } from '../authSlice.ts';
import { Button, Notice, PasswordField, PasswordRequirements, Skeleton, TextField } from '../../../components/ui/forms.tsx';
import { AuthShell } from './AuthShell.tsx';

/** Removes the token from the address bar so it is not kept in history or shared by copy/paste. */
function scrubHash() {
  if (typeof window !== 'undefined' && window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

/** Reads the one-time token from the URL fragment once, on the client. */
function useFragmentToken(): { token: string | null; ready: boolean } {
  const [state, setState] = useState<{ token: string | null; ready: boolean }>({ token: null, ready: false });
  // Read once per mount: React Strict Mode runs effects twice in development, and the first run removes the
  // fragment, so a second read would wrongly find no token.
  const tokenRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (tokenRef.current === undefined) {
      tokenRef.current = readTokenFromHash(window.location.hash);
      scrubHash();
    }
    setState({ token: tokenRef.current, ready: true });
  }, []);
  return state;
}

// ---------------------------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------------------------

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address, like name@company.com.');
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      await accountApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setFormError(messageOf(err, 'We could not send the request. Please try again.'));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthShell eyebrow="Password reset" title="Check your email">
        <div className="space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          {/* Same message whether or not the address has an account (no account enumeration). */}
          <Notice tone="success">
            If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to reset the password.
            The link works once and expires after a short time.
          </Notice>
          <p className="text-sm leading-6 text-ink-500">
            Didn&apos;t get it? Check your spam folder, or ask the GrowthPrint administrator to send you a reset link.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => { setSent(false); }}>Use another email</Button>
            <Link href={ROUTES.portal.login} className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-brand-700 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Enter the email you sign in with. If it belongs to an account, we'll send a link to choose a new password."
    >
      {formError && <Notice tone="error" className="mb-5">{formError}</Notice>}
      <form noValidate onSubmit={submit} className="space-y-5">
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); setError(undefined); }}
          error={error}
          disabled={submitting}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting} loadingText="Sending…">Send reset link</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Remembered it?{' '}
        <Link href={ROUTES.portal.login} className="font-semibold text-brand-700 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------------------------
// Shared "choose a new password" form
// ---------------------------------------------------------------------------------------------

function NewPasswordForm({ email, submitLabel, onSubmit }: {
  email?: string;
  submitLabel: string;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'password' | 'confirm', string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const rules = useMemo(() => checkPasswordRules(password, email), [password, email]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const found = validateNewPassword(password, confirm, email);
    setErrors(found);
    if (Object.keys(found).length) return;
    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(password);
    } catch (err) {
      const fields = fieldErrorsOf(err);
      if (fields.newPassword || fields.password) {
        setErrors({ password: fields.newPassword ?? fields.password });
      } else {
        setFormError(messageOf(err, 'Something went wrong. Please try again.'));
      }
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      {formError && <Notice tone="error" className="mb-5">{formError}</Notice>}
      <form noValidate onSubmit={submit} className="space-y-5">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => { setPassword(e.target.value); setErrors(x => ({ ...x, password: undefined })); }}
          error={errors.password}
          help={<PasswordRequirements rules={rules} />}
          disabled={submitting}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setErrors(x => ({ ...x, confirm: undefined })); }}
          error={errors.confirm}
          disabled={submitting}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting} loadingText="Saving…">{submitLabel}</Button>
      </form>
    </>
  );
}

function InvalidLink({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-5">
      <Notice tone="error" title={title}>{body}</Notice>
      <Link href={ROUTES.public.forgotPassword} className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
        Request a new link
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------------------------

export function ResetPasswordScreen() {
  const { token, ready } = useFragmentToken();
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'done'>('checking');

  useEffect(() => {
    if (!ready) return;
    if (!token) { setStatus('invalid'); return; }
    accountApi.verifyResetToken(token).then(() => setStatus('valid'), () => setStatus('invalid'));
  }, [ready, token]);

  return (
    <AuthShell
      eyebrow="Password reset"
      title={status === 'done' ? 'Password updated' : 'Choose a new password'}
      subtitle={status === 'valid' ? 'Your new password replaces the old one and signs out every other device.' : undefined}
    >
      {status === 'checking' && (
        <div className="space-y-3" role="status" aria-label="Checking your link">
          <Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-1/2" />
        </div>
      )}
      {status === 'invalid' && (
        <InvalidLink
          title="This reset link can't be used"
          body="It may have expired, already been used, or been replaced by a newer link. Request a new one to continue."
        />
      )}
      {status === 'valid' && token && (
        <NewPasswordForm
          submitLabel="Save new password"
          onSubmit={async password => {
            await accountApi.resetPassword(token, password);
            setStatus('done');
          }}
        />
      )}
      {status === 'done' && (
        <div className="space-y-5">
          <Notice tone="success">Your password has been changed. For your security, every existing session was signed out.</Notice>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.portal.login} className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
              Sign in to the client hub
            </Link>
            <Link href={ROUTES.admin.login} className="inline-flex min-h-11 items-center rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-800 hover:bg-ink-50">
              Studio sign-in
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------------------------
// Accept invitation
// ---------------------------------------------------------------------------------------------

const ROLE_COPY: Record<string, string> = {
  ADMIN: 'as an administrator of the GrowthPrint studio',
  TEAM_MEMBER: 'as a team member in the GrowthPrint studio',
  CLIENT: 'to the GrowthPrint client hub',
};

export function AcceptInviteScreen() {
  const { token, ready } = useFragmentToken();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    if (!ready) return;
    if (!token) { setStatus('invalid'); return; }
    accountApi.previewInvitation(token).then(
      result => { setPreview(result); setStatus('valid'); },
      () => setStatus('invalid'),
    );
  }, [ready, token]);

  const greeting = preview?.fullName ? `Welcome, ${preview.fullName.split(' ')[0]}` : 'Set up your account';

  return (
    <AuthShell
      eyebrow="Account setup"
      title={status === 'valid' ? greeting : 'Set up your account'}
      subtitle={status === 'valid' && preview ? (
        <>You&apos;ve been invited {ROLE_COPY[preview.role] ?? 'to GrowthPrint'}
          {preview.clientName ? <> for <strong className="text-ink-800">{preview.clientName}</strong></> : null}.
          Choose a password for <strong className="text-ink-800">{preview.email}</strong>.</>
      ) : undefined}
    >
      {status === 'checking' && (
        <div className="space-y-3" role="status" aria-label="Checking your invitation">
          <Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" />
        </div>
      )}
      {status === 'invalid' && (
        <Notice tone="error" title="This invitation can't be used">
          It may have expired, already been accepted, or been replaced by a newer invitation. Ask the person who
          invited you to send a new link.
        </Notice>
      )}
      {status === 'valid' && token && preview && (
        <NewPasswordForm
          email={preview.email}
          submitLabel="Create account and sign in"
          onSubmit={async password => {
            const response = await accountApi.acceptInvitation(token, password);
            const session = sessionFromLoginResponse(response);
            dispatch(sessionStarted({ user: session.user }));
            router.replace(getDefaultRouteForRole(session.user.role));
          }}
        />
      )}
    </AuthShell>
  );
}
