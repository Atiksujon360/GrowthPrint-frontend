'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Copy, Link2, MailPlus, RefreshCw, ShieldAlert, ShieldCheck, UserPlus, Users } from 'lucide-react';
import {
  fieldErrorsOf, messageOf, userAdminApi,
  type ManagedRole, type ManagedUser, type OneTimeLink, type SecurityOverview,
} from '../../../lib/api/account.ts';
import { initialsOf } from '../../../lib/access.ts';
import { TEAM_MODULES, type TeamModule } from '../../../types/auth.ts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addToast, fetchClients } from '../../../store/index.ts';
import {
  Avatar, Button, Card, EmptyState, ErrorState, Notice, SelectField, Skeleton, TextField,
} from '../../../components/ui/forms.tsx';
import { EMAIL_PATTERN } from '../../../lib/passwordRules.ts';

const MODULE_LABEL: Record<TeamModule, string> = {
  CRM: 'Leads & CRM', CLIENTS: 'Clients', PROJECTS: 'Projects', SUPPORT: 'Support requests',
  PROPOSALS: 'Proposals', OUTREACH: 'Outreach',
};
const ROLE_LABEL: Record<ManagedRole, string> = { ADMIN: 'Administrator', TEAM_MEMBER: 'Team member', CLIENT: 'Client user' };
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  INVITED: 'bg-amber-50 text-amber-800 ring-amber-200',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-200',
  DISABLED: 'bg-ink-100 text-ink-600 ring-ink-200',
};
const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Active', INVITED: 'Invited', SUSPENDED: 'Suspended', DISABLED: 'Disabled' };

/**
 * ADMIN-only user, staff and permission management. The backend enforces every rule shown here
 * (ADMIN only, no self-suspension or self-demotion, last-admin protection, client logins stay clients),
 * so the UI explains the rules but never relies on hiding buttons for security.
 */
export function TeamManagement() {
  const dispatch = useAppDispatch();
  const selfId = useAppSelector(state => state.auth.currentUser.id);
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'' | ManagedRole>('');
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const [issuedLink, setIssuedLink] = useState<{ title: string; email: string; link: OneTimeLink } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setUsers(await userAdminApi.list(roleFilter ? { role: roleFilter } : {}));
    } catch (err) {
      setError(messageOf(err, 'Users could not be loaded.'));
    }
  }, [roleFilter]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? []).filter(u => !q || u.email.toLowerCase().includes(q) || (u.fullName ?? '').toLowerCase().includes(q)
      || (u.clientName ?? '').toLowerCase().includes(q));
  }, [users, query]);

  const replaceUser = (updated: ManagedUser) =>
    setUsers(list => (list ?? []).map(u => (u.id === updated.id ? updated : u)));

  const run = async <T,>(action: () => Promise<T>, success: string): Promise<T | undefined> => {
    try {
      const result = await action();
      dispatch(addToast({ type: 'success', message: success }));
      return result;
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Action not completed', message: messageOf(err, 'Please try again.') }));
      return undefined;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Users & team</h1>
          <p className="mt-1 text-sm text-ink-500">Invite team members and client users, control access and deactivate accounts.</p>
        </div>
        <Button onClick={() => setInviting(v => !v)} icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}>
          {inviting ? 'Close invitation form' : 'Invite user'}
        </Button>
      </header>

      <SecurityOverviewCard />

      {issuedLink && (
        <OneTimeLinkNotice
          title={issuedLink.title}
          email={issuedLink.email}
          link={issuedLink.link}
          onDismiss={() => setIssuedLink(null)}
        />
      )}

      {inviting && (
        <InviteForm
          onCancel={() => setInviting(false)}
          onInvited={(user, link) => {
            setUsers(list => [user, ...(list ?? [])]);
            setIssuedLink({ title: 'Invitation created', email: user.email, link });
            setInviting(false);
          }}
        />
      )}

      <Card
        title="All accounts"
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="user-search">Search users</label>
            <input id="user-search" type="search" placeholder="Search name, email or client" value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-h-10 w-56 rounded-xl border border-ink-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
            <label className="sr-only" htmlFor="role-filter">Filter by role</label>
            <select id="role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value as '' | ManagedRole)}
              className="min-h-10 rounded-xl border border-ink-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100">
              <option value="">All roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="TEAM_MEMBER">Team members</option>
              <option value="CLIENT">Client users</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => void load()} aria-label="Refresh user list"
              icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>Refresh</Button>
          </div>
        )}
      >
        {error && <ErrorState message={error} onRetry={load} />}
        {!users && !error && (
          <div className="space-y-3" role="status" aria-label="Loading users">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}
        {users && visible.length === 0 && (
          <EmptyState icon={<Users className="h-8 w-8" />} title="No users match"
            description={query ? 'Try a different search.' : 'Invite your first team member or client user.'} />
        )}
        {users && visible.length > 0 && (
          <ul className="divide-y divide-ink-100">
            {visible.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === selfId}
                onChanged={replaceUser}
                run={run}
                onLink={(title, link) => setIssuedLink({ title, email: user.email, link })}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function UserRow({ user, isSelf, onChanged, run, onLink }: {
  user: ManagedUser;
  isSelf: boolean;
  onChanged: (u: ManagedUser) => void;
  run: <T>(action: () => Promise<T>, success: string) => Promise<T | undefined>;
  onLink: (title: string, link: OneTimeLink) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modules, setModules] = useState<TeamModule[]>(user.permissions);

  const act = async <T,>(action: () => Promise<T>, success: string, after?: (r: T) => void) => {
    setBusy(true);
    const result = await run(action, success);
    if (result !== undefined && after) after(result);
    setBusy(false);
  };

  const name = user.fullName || user.email;
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar initials={initialsOf(user.fullName ?? undefined, user.email)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            {name}{isSelf && <span className="ml-2 text-xs font-normal text-ink-500">(you)</span>}
          </p>
          <p className="truncate text-xs text-ink-500">
            {user.email} · {ROLE_LABEL[user.role]}{user.clientName ? ` · ${user.clientName}` : ''}
          </p>
          {user.role === 'TEAM_MEMBER' && (
            <p className="mt-1 text-xs text-ink-500">
              Access: {user.permissions.length ? user.permissions.map(m => MODULE_LABEL[m]).join(', ') : 'none yet'}
            </p>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[user.accountStatus] ?? ''}`}>
          {STATUS_LABEL[user.accountStatus] ?? user.accountStatus}
        </span>
        <div className="flex flex-wrap gap-2">
          {user.accountStatus === 'INVITED' && (
            <Button size="sm" variant="secondary" disabled={busy} icon={<MailPlus className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => act(() => userAdminApi.reissueInvitation(user.id), 'New invitation link created',
                link => onLink('New invitation link', link))}>
              Resend invite
            </Button>
          )}
          {user.accountStatus === 'ACTIVE' && !isSelf && (
            <Button size="sm" variant="secondary" disabled={busy} icon={<Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => act(() => userAdminApi.passwordResetLink(user.id), 'Password reset link created',
                link => onLink('Password reset link', link))}>
              Reset link
            </Button>
          )}
          {user.role === 'TEAM_MEMBER' && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(v => !v)} aria-expanded={editing}>
              Permissions
            </Button>
          )}
          {user.role !== 'CLIENT' && !isSelf && user.accountStatus !== 'INVITED' && (
            <Button size="sm" variant="ghost" disabled={busy}
              onClick={() => act(() => userAdminApi.changeRole(user.id, user.role === 'ADMIN' ? 'TEAM_MEMBER' : 'ADMIN'),
                'Role changed — their sessions were signed out', onChanged)}>
              {user.role === 'ADMIN' ? 'Make team member' : 'Make administrator'}
            </Button>
          )}
          {!isSelf && user.accountStatus === 'ACTIVE' && (
            <Button size="sm" variant="danger" disabled={busy} icon={<ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => {
                if (window.confirm(`Suspend ${name}? They will be signed out immediately.`)) {
                  void act(() => userAdminApi.suspend(user.id), 'User suspended and signed out', onChanged);
                }
              }}>
              Suspend
            </Button>
          )}
          {!isSelf && (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DISABLED') && (
            <Button size="sm" variant="secondary" disabled={busy} icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => act(() => userAdminApi.reactivate(user.id), 'User re-activated', onChanged)}>
              Re-activate
            </Button>
          )}
        </div>
      </div>
      {editing && user.role === 'TEAM_MEMBER' && (
        <fieldset className="mt-4 rounded-xl border border-ink-200 p-4">
          <legend className="px-1 text-sm font-medium text-ink-800">Studio modules for {name}</legend>
          <ModuleCheckboxes value={modules} onChange={setModules} disabled={busy} />
          <p className="mt-2 text-xs text-ink-500">Finance, AI settings and user management are never available to team members.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" loading={busy} onClick={() => act(() => userAdminApi.replacePermissions(user.id, modules),
              'Permissions updated — effective immediately', updated => { onChanged(updated); setEditing(false); })}>
              Save permissions
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setModules(user.permissions); setEditing(false); }}>Cancel</Button>
          </div>
        </fieldset>
      )}
    </li>
  );
}

function ModuleCheckboxes({ value, onChange, disabled }: {
  value: TeamModule[]; onChange: (m: TeamModule[]) => void; disabled?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {TEAM_MODULES.map(module => (
        <label key={module} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-ink-700 hover:bg-ink-50">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600" disabled={disabled}
            checked={value.includes(module)}
            onChange={e => onChange(e.target.checked ? [...value, module] : value.filter(m => m !== module))} />
          {MODULE_LABEL[module]}
        </label>
      ))}
    </div>
  );
}

function InviteForm({ onCancel, onInvited }: {
  onCancel: () => void;
  onInvited: (user: ManagedUser, link: OneTimeLink) => void;
}) {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(state => state.agency.clients);
  const [form, setForm] = useState({ email: '', fullName: '', role: 'TEAM_MEMBER' as ManagedRole, clientId: '', clientRole: 'CLIENT_OWNER' });
  const [modules, setModules] = useState<TeamModule[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.role === 'CLIENT' && clients.length === 0) void dispatch(fetchClients());
  }, [form.role, clients.length, dispatch]);

  const set = (key: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const found: Record<string, string> = {};
    if (!form.fullName.trim()) found.fullName = 'Enter the person’s name.';
    if (!EMAIL_PATTERN.test(form.email.trim())) found.email = 'Enter a valid email address.';
    if (form.role === 'CLIENT' && !form.clientId) found.clientId = 'Choose the client this person belongs to.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError(null);
    try {
      const result = await userAdminApi.invite({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        role: form.role,
        clientId: form.role === 'CLIENT' ? form.clientId : undefined,
        clientRole: form.role === 'CLIENT' ? form.clientRole : undefined,
        permissions: form.role === 'TEAM_MEMBER' ? modules : undefined,
      });
      onInvited(result.user, result.invitation);
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      setFormError(messageOf(err, 'The invitation could not be created.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Invite a user" description="They receive a one-time link to choose their own password. You never set or see it.">
      {formError && <Notice tone="error" className="mb-5">{formError}</Notice>}
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" required value={form.fullName} maxLength={160} autoComplete="off"
            onChange={e => set('fullName', e.target.value)} error={errors.fullName} disabled={saving} />
          <TextField label="Email address" type="email" required value={form.email} maxLength={254} autoComplete="off"
            onChange={e => set('email', e.target.value)} error={errors.email} disabled={saving} />
          <SelectField label="Role" required value={form.role} disabled={saving}
            onChange={e => set('role', e.target.value)} error={errors.role}
            options={[
              { value: 'TEAM_MEMBER', label: 'Team member — selected studio modules' },
              { value: 'CLIENT', label: 'Client user — their company in the client hub' },
              { value: 'ADMIN', label: 'Administrator — full access' },
            ]} />
          {form.role === 'CLIENT' && (
            <>
              <SelectField label="Client" required value={form.clientId} disabled={saving}
                onChange={e => set('clientId', e.target.value)} error={errors.clientId}
                options={[{ value: '', label: clients.length ? 'Choose a client…' : 'No clients loaded' },
                  ...clients.map(c => ({ value: c.id, label: c.name }))]} />
              <SelectField label="Client role" value={form.clientRole} disabled={saving}
                onChange={e => set('clientRole', e.target.value)}
                options={[
                  { value: 'CLIENT_OWNER', label: 'Account owner' },
                  { value: 'CLIENT_PROJECT_MANAGER', label: 'Project manager' },
                  { value: 'CLIENT_FINANCE', label: 'Finance' },
                  { value: 'CLIENT_MEMBER', label: 'Member' },
                ]} />
            </>
          )}
        </div>
        {form.role === 'TEAM_MEMBER' && (
          <fieldset className="rounded-xl border border-ink-200 p-4">
            <legend className="px-1 text-sm font-medium text-ink-800">Studio modules</legend>
            <ModuleCheckboxes value={modules} onChange={setModules} disabled={saving} />
          </fieldset>
        )}
        {form.role === 'ADMIN' && (
          <Notice tone="warning">Administrators can see finance, change AI settings and manage every user, including you.</Notice>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving} loadingText="Creating…">Create invitation</Button>
        </div>
      </form>
    </Card>
  );
}

function OneTimeLinkNotice({ title, email, link, onDismiss }: {
  title: string; email: string; link: OneTimeLink; onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Notice tone="success" title={`${title} for ${email}`}>
      <p>Send this link to the person through a channel you trust. It works once, expires
        {' '}{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(link.expiresAt))},
        and is shown only now.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="max-w-full break-all rounded-lg bg-white px-3 py-2 text-xs text-ink-800 ring-1 ring-emerald-200">{link.link}</code>
        <Button size="sm" variant="secondary" onClick={copy} icon={<Copy className="h-3.5 w-3.5" aria-hidden="true" />}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>Done</Button>
      </div>
    </Notice>
  );
}

function SecurityOverviewCard() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    userAdminApi.securityOverview().then(setOverview, () => setError(true));
  }, []);
  if (error) return null;
  if (!overview) return <Skeleton className="h-28 w-full" />;
  return (
    <Card title="Security overview" description="Read-only. These values are set in the backend configuration.">
      {!overview.emailDeliveryConfigured && (
        <Notice tone="warning" className="mb-4" title="Email delivery is not configured">
          Password reset emails are not sent yet. Use “Reset link” on a user to create a one-time link and share it
          yourself. See SECURITY.md in the backend for how to connect an email provider.
        </Notice>
      )}
      <dl className="grid gap-4 text-sm sm:grid-cols-4">
        <div><dt className="text-ink-500">Session length</dt><dd className="font-semibold text-ink-900">{overview.accessTokenMinutes} min</dd></div>
        <div><dt className="text-ink-500">Reset link validity</dt><dd className="font-semibold text-ink-900">{overview.passwordResetMinutes} min</dd></div>
        <div><dt className="text-ink-500">Invitation validity</dt><dd className="font-semibold text-ink-900">{overview.invitationHours} h</dd></div>
        <div><dt className="text-ink-500">Active administrators</dt><dd className="font-semibold text-ink-900">{overview.activeAdmins}</dd></div>
      </dl>
      <p className="mt-4 text-xs text-ink-500">Password rule: {overview.passwordPolicy}</p>
    </Card>
  );
}
