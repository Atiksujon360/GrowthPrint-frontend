'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, UserRound } from 'lucide-react';
import { accountApi, fieldErrorsOf, messageOf, type AccountProfile } from '../../../lib/api/account.ts';
import { checkPasswordRules, validateNewPassword } from '../../../lib/passwordRules.ts';
import { getLoginRouteForRole } from '../../../lib/routes.ts';
import { ROLE_LABEL, initialsOf } from '../../../lib/access.ts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';
import { clearAuth, profileUpdated, sessionFromLoginResponse, sessionStarted, storeSessionToken } from '../../auth/authSlice.ts';
import {
  Avatar, Button, Card, ErrorState, Notice, PasswordField, PasswordRequirements, SelectField, Skeleton, TextField,
} from '../../../components/ui/forms.tsx';

const MODULE_LABEL: Record<string, string> = {
  CRM: 'Leads & CRM', CLIENTS: 'Clients', PROJECTS: 'Projects', SUPPORT: 'Support requests',
  PROPOSALS: 'Proposals', OUTREACH: 'Outreach',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active', INVITED: 'Invitation pending', SUSPENDED: 'Suspended', DISABLED: 'Disabled',
};

const CLIENT_ROLE_LABEL: Record<string, string> = {
  CLIENT_OWNER: 'Account owner', CLIENT_PROJECT_MANAGER: 'Project manager', CLIENT_FINANCE: 'Finance',
  CLIENT_MEMBER: 'Member',
};

function timezoneOptions(current: string): Array<{ value: string; label: string }> {
  let zones: string[] = [];
  try {
    zones = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];
  } catch {
    zones = [];
  }
  if (zones.length === 0) zones = ['UTC', 'Asia/Kuala_Lumpur', 'Asia/Singapore', 'Europe/London', 'America/New_York'];
  if (current && !zones.includes(current)) zones = [current, ...zones];
  return [{ value: '', label: 'Use my browser time zone' }, ...zones.map(z => ({ value: z, label: z.replace(/_/g, ' ') }))];
}

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

/**
 * Self-service account settings for every role: profile + preferences, password, sessions and a read-only
 * summary of role, status and permissions. Role, status, email and permissions cannot be changed here:
 * the backend has no endpoint that lets a user change them for themselves.
 */
export function AccountSettings() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setProfile(await accountApi.getProfile());
    } catch (err) {
      setLoadError(messageOf(err, 'Your account details could not be loaded.'));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Account settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your profile, password and how GrowthPrint contacts you.</p>
      </header>
      {loadError && <ErrorState message={loadError} onRetry={load} />}
      {!profile && !loadError && (
        <div className="space-y-4" role="status" aria-label="Loading account settings">
          <Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" />
        </div>
      )}
      {profile && (
        <>
          <AccountSummary profile={profile} />
          <ProfileForm profile={profile} onSaved={setProfile} />
          <PasswordForm email={profile.email} />
          <SessionsCard role={profile.role} />
        </>
      )}
    </div>
  );
}

function AccountSummary({ profile }: { profile: AccountProfile }) {
  const role = profile.role as keyof typeof ROLE_LABEL;
  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar initials={initialsOf(profile.fullName ?? undefined, profile.email)} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-ink-900">{profile.fullName || profile.email}</p>
          <p className="truncate text-sm text-ink-500">{profile.email}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:text-right">
          <dt className="text-ink-500">Role</dt>
          <dd className="font-medium text-ink-900">
            {ROLE_LABEL[role] ?? profile.role}
            {profile.clientRole ? ` · ${CLIENT_ROLE_LABEL[profile.clientRole] ?? profile.clientRole}` : ''}
          </dd>
          <dt className="text-ink-500">Status</dt>
          <dd className="font-medium text-emerald-700">{STATUS_LABEL[profile.accountStatus] ?? profile.accountStatus}</dd>
          <dt className="text-ink-500">Last sign-in</dt>
          <dd className="text-ink-800">{formatDate(profile.lastLoginAt)}</dd>
          <dt className="text-ink-500">Password changed</dt>
          <dd className="text-ink-800">{formatDate(profile.passwordChangedAt)}</dd>
        </dl>
      </div>
      {profile.role === 'TEAM_MEMBER' && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <p className="text-sm font-medium text-ink-800">Your studio access</p>
          {profile.permissions.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {profile.permissions.map(p => (
                <li key={p} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">{MODULE_LABEL[p] ?? p}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-ink-500">No modules have been granted yet. Ask the administrator for access.</p>
          )}
          <p className="mt-2 text-xs text-ink-500">Permissions are managed by the administrator.</p>
        </div>
      )}
    </Card>
  );
}

function ProfileForm({ profile, onSaved }: { profile: AccountProfile; onSaved: (p: AccountProfile) => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    jobTitle: profile.jobTitle ?? '',
    timezone: profile.timezone ?? '',
    emailNotifications: profile.emailNotifications,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const zones = useMemo(() => timezoneOptions(form.timezone), [form.timezone]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const found: Record<string, string> = {};
    if (form.fullName.trim().length > 160) found.fullName = 'Use at most 160 characters.';
    if (form.phone && !/^[+0-9 ()\-.]{4,40}$/.test(form.phone.trim())) found.phone = 'Use digits, spaces and + ( ) - . only.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const saved = await accountApi.updateProfile({ ...form, fullName: form.fullName.trim() });
      onSaved(saved);
      dispatch(profileUpdated({ name: saved.fullName || saved.email.split('@')[0], title: saved.jobTitle ?? undefined }));
      dispatch(addToast({ type: 'success', title: 'Profile saved', message: 'Your details have been updated.' }));
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      dispatch(addToast({ type: 'error', title: 'Profile not saved', message: messageOf(err, 'Please check the form and try again.') }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profile" description="How your name and contact details appear to the GrowthPrint team.">
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" autoComplete="name" value={form.fullName} maxLength={160}
            onChange={e => set('fullName', e.target.value)} error={errors.fullName} disabled={saving} />
          <TextField label="Email" value={profile.email} readOnly disabled
            help="Contact the administrator to change the email you sign in with." />
          <TextField label="Phone" type="tel" autoComplete="tel" value={form.phone} maxLength={40}
            onChange={e => set('phone', e.target.value)} error={errors.phone} disabled={saving} />
          <TextField label="Job title" autoComplete="organization-title" value={form.jobTitle} maxLength={120}
            onChange={e => set('jobTitle', e.target.value)} error={errors.jobTitle} disabled={saving} />
          <SelectField label="Time zone" value={form.timezone} options={zones}
            onChange={e => set('timezone', e.target.value)} error={errors.timezone} disabled={saving} />
        </div>
        <fieldset className="rounded-xl border border-ink-200 p-4">
          <legend className="px-1 text-sm font-medium text-ink-800">Notifications</legend>
          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600"
              checked={form.emailNotifications} onChange={e => set('emailNotifications', e.target.checked)} disabled={saving} />
            <span>
              Email me about activity on my account
              <span className="block text-xs text-ink-500">Security emails (like password resets) are always sent.</span>
            </span>
          </label>
        </fieldset>
        <div className="flex justify-end">
          <Button type="submit" loading={saving} loadingText="Saving…" icon={<UserRound className="h-4 w-4" aria-hidden="true" />}>
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm({ email }: { email: string }) {
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'current' | 'password' | 'confirm', string>>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const inFlight = useRef(false);
  const rules = useMemo(() => checkPasswordRules(next, email), [next, email]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const found: typeof errors = { ...validateNewPassword(next, confirm, email) };
    if (!current) found.current = 'Enter your current password.';
    if (current && next && current === next) found.password = 'Choose a password you are not using now.';
    setErrors(found);
    setDone(false);
    if (Object.keys(found).length) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const response = await accountApi.changePassword(current, next);
      // The backend revoked every older token; keep this device signed in with the fresh one.
      const session = sessionFromLoginResponse(response);
      dispatch(sessionStarted({ user: session.user }));
      setCurrent(''); setNext(''); setConfirm('');
      setDone(true);
    } catch (err) {
      const fields = fieldErrorsOf(err);
      setErrors({
        current: fields.currentPassword,
        password: fields.newPassword,
      });
      if (!fields.currentPassword && !fields.newPassword) {
        dispatch(addToast({ type: 'error', title: 'Password not changed', message: messageOf(err, 'Please try again.') }));
      }
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  return (
    <Card title="Password" description="Changing your password signs you out on every other device.">
      {done && <Notice tone="success" className="mb-5">Password changed. Other devices have been signed out.</Notice>}
      <form noValidate onSubmit={submit} className="space-y-5">
        <PasswordField label="Current password" autoComplete="current-password" required value={current}
          onChange={e => { setCurrent(e.target.value); setErrors(x => ({ ...x, current: undefined })); }}
          error={errors.current} disabled={saving} />
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField label="New password" autoComplete="new-password" required value={next}
            onChange={e => { setNext(e.target.value); setErrors(x => ({ ...x, password: undefined })); }}
            error={errors.password} disabled={saving} />
          <PasswordField label="Confirm new password" autoComplete="new-password" required value={confirm}
            onChange={e => { setConfirm(e.target.value); setErrors(x => ({ ...x, confirm: undefined })); }}
            error={errors.confirm} disabled={saving} />
        </div>
        <PasswordRequirements rules={rules} />
        <div className="flex justify-end">
          <Button type="submit" loading={saving} loadingText="Changing…" icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SessionsCard({ role }: { role: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentRole = useAppSelector(state => state.auth.currentUser.role);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const signOutEverywhere = async () => {
    setBusy(true);
    try {
      await accountApi.signOutEverywhere();
      storeSessionToken(null);
      dispatch(clearAuth());
      router.replace(getLoginRouteForRole(currentRole === 'GUEST' ? (role as typeof currentRole) : currentRole));
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Could not sign out everywhere', message: messageOf(err, 'Please try again.') }));
      setBusy(false);
    }
  };

  return (
    <Card title="Sessions" description="Lost a device or signed in on a shared computer? End every session at once.">
      {!confirming ? (
        <Button variant="secondary" onClick={() => setConfirming(true)} icon={<LogOut className="h-4 w-4" aria-hidden="true" />}>
          Sign out everywhere
        </Button>
      ) : (
        <div className="space-y-3">
          <Notice tone="warning">This signs you out on all devices, including this one. You&apos;ll need to sign in again.</Notice>
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" loading={busy} loadingText="Signing out…" onClick={signOutEverywhere}>Yes, sign out everywhere</Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
