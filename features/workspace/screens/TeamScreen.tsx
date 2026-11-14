'use client';

import { useState, type FormEvent } from 'react';
import { Check, Copy, Crown, MailPlus, UserMinus } from 'lucide-react';
import {
  useChangeMemberRoleMutation, useInvitationsQuery, useInviteMemberMutation, useMembersQuery, useRemoveMemberMutation,
  useRevokeInvitationMutation, useTransferOwnershipMutation, errorMessage, fieldErrors,
} from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import {
  assignableRoles, canRemove, invitableRoles, ROLE_DESCRIPTION, ROLE_LABEL,
} from '../model/permissions.ts';
import type { BusinessRole, CreatedInvitation, Member } from '../model/types.ts';
import { formatDate } from '../model/format.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { initialsOf } from '../../../lib/access.ts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';
import { Avatar, Button, Card, ErrorState, Notice, SelectField, TextField } from '../../../components/ui/forms.tsx';
import { Dialog, LoadingRows, PageHeader, StatusPill, TableShell, td, th, type Tone } from '../../../components/ui/workspace-kit.tsx';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../../lib/routes.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_TONE: Record<BusinessRole, Tone> = { OWNER: 'brand', ADMIN: 'info', MANAGER: 'neutral', MEMBER: 'neutral' };

type Pending =
  | { kind: 'remove'; member: Member }
  | { kind: 'leave'; member: Member }
  | { kind: 'role'; member: Member; role: BusinessRole }
  | null;

export function TeamScreen() {
  const { businessId, business, role, can } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const me = useAppSelector(s => s.auth.currentUser.id);
  const members = useMembersQuery(businessId);
  const invitations = useInvitationsQuery(businessId, { skip: !can('members.invite') });
  const [changeRole, { isLoading: changingRole }] = useChangeMemberRoleMutation();
  const [removeMember, { isLoading: removing }] = useRemoveMemberMutation();
  const [revokeInvitation] = useRevokeInvitationMutation();
  const [pending, setPending] = useState<Pending>(null);
  const [inviting, setInviting] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const confirmPending = async () => {
    if (!pending) return;
    if (pending.kind === 'role') {
      const result = await changeRole({ businessId, userId: pending.member.userId, role: pending.role });
      if ('error' in result) dispatch(addToast({ type: 'error', title: 'Role not changed', message: errorMessage(result.error) }));
      else dispatch(addToast({ type: 'success', message: `${pending.member.fullName ?? pending.member.email} is now ${ROLE_LABEL[pending.role]}.` }));
      setPending(null);
      return;
    }
    const result = await removeMember({ businessId, userId: pending.member.userId });
    if ('error' in result) {
      dispatch(addToast({ type: 'error', title: pending.kind === 'leave' ? "You couldn't leave" : 'Member not removed', message: errorMessage(result.error) }));
      setPending(null);
      return;
    }
    if (pending.kind === 'leave') {
      dispatch(addToast({ type: 'success', message: `You left ${business.name}.` }));
      router.push(ROUTES.workspace.home);
      return;
    }
    dispatch(addToast({ type: 'success', message: `${pending.member.fullName ?? pending.member.email} was removed.` }));
    setPending(null);
  };

  const owners = members.data?.filter(m => m.role === 'OWNER').length ?? 0;
  const pendingInvites = invitations.data?.filter(i => i.status === 'PENDING') ?? [];

  return (
    <>
      <PageHeader
        title="Team"
        description="Who can work in this business, and what they can do."
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Team' }]}
        actions={(
          <>
            {can('ownership.transfer') && (
              <Button variant="secondary" onClick={() => setTransferring(true)} icon={<Crown className="h-4 w-4" aria-hidden="true" />}>Transfer ownership</Button>
            )}
            {can('members.invite') && (
              <Button onClick={() => setInviting(true)} icon={<MailPlus className="h-4 w-4" aria-hidden="true" />}>Invite member</Button>
            )}
          </>
        )}
      />

      {members.error ? <ErrorState message={errorMessage(members.error)} onRetry={() => void members.refetch()} /> : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs">
          <TableShell caption="Members">
            <thead>
              <tr>
                <th scope="col" className={th}>Member</th>
                <th scope="col" className={th}>Role</th>
                <th scope="col" className={`${th} hidden md:table-cell`}>Joined</th>
                <th scope="col" className={`${th} text-right`}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            {members.isLoading ? <LoadingRows cols={4} rows={4} /> : (
              <tbody>
                {members.data?.map(m => {
                  const isSelf = m.userId === me;
                  const options = isSelf ? [] : assignableRoles(role, m.role);
                  const removable = !isSelf && can('members.manage') && canRemove(role, m.role, false);
                  const lastOwner = isSelf && m.role === 'OWNER' && owners <= 1;
                  const name = m.fullName ?? m.email;
                  return (
                    <tr key={m.userId}>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <Avatar initials={initialsOf(name)} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-900">{name}{isSelf && <span className="ml-1.5 text-xs font-normal text-ink-500">(you)</span>}</p>
                            <p className="truncate text-xs text-ink-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        {can('members.manage') && options.length > 1 ? (
                          <label className="sr-only" htmlFor={`role-${m.userId}`}>Role for {name}</label>
                        ) : null}
                        {can('members.manage') && options.length > 1 ? (
                          <select id={`role-${m.userId}`} value={m.role} disabled={changingRole}
                            onChange={e => setPending({ kind: 'role', member: m, role: e.target.value as BusinessRole })}
                            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100">
                            {options.map(o => <option key={o} value={o}>{ROLE_LABEL[o]}</option>)}
                          </select>
                        ) : <StatusPill tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</StatusPill>}
                      </td>
                      <td className={`${td} hidden text-sm text-ink-600 md:table-cell`}>{formatDate(m.joinedAt)}</td>
                      <td className={`${td} text-right`}>
                        {removable && (
                          <Button variant="ghost" size="sm" onClick={() => setPending({ kind: 'remove', member: m })}
                            icon={<UserMinus className="h-4 w-4" aria-hidden="true" />}>Remove<span className="sr-only"> {name}</span></Button>
                        )}
                        {isSelf && (
                          <Button variant="ghost" size="sm" disabled={lastOwner}
                            title={lastOwner ? 'Transfer ownership before leaving.' : undefined}
                            onClick={() => setPending({ kind: 'leave', member: m })}>Leave</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </TableShell>
        </div>
      )}

      {can('members.invite') && (
        <Card title="Pending invitations" className="mt-6">
          {invitations.isLoading ? <p className="text-sm text-ink-500">Loading invitations…</p>
            : invitations.error ? <ErrorState message={errorMessage(invitations.error)} onRetry={() => void invitations.refetch()} />
            : pendingInvites.length === 0 ? <p className="text-sm text-ink-500">No pending invitations.</p>
            : (
              <ul className="divide-y divide-ink-100">
                {pendingInvites.map(i => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{i.email}</p>
                      <p className="text-xs text-ink-500">{ROLE_LABEL[i.role]} · expires {formatDate(i.expiresAt)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      const result = await revokeInvitation({ businessId, invitationId: i.id });
                      dispatch(addToast('error' in result
                        ? { type: 'error', title: 'Invitation not revoked', message: errorMessage(result.error) }
                        : { type: 'success', message: `Invitation for ${i.email} revoked.` }));
                    }}>Revoke<span className="sr-only"> invitation for {i.email}</span></Button>
                  </li>
                ))}
              </ul>
            )}
        </Card>
      )}

      <Card title="Roles" className="mt-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'] as BusinessRole[]).map(r2 => (
            <div key={r2}>
              <dt className="text-sm font-medium text-ink-900">{ROLE_LABEL[r2]}</dt>
              <dd className="text-sm text-ink-600">{ROLE_DESCRIPTION[r2]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Dialog open={pending !== null} onClose={() => setPending(null)} dismissible={!removing && !changingRole} size="sm"
        title={pending?.kind === 'role' ? `Change role to ${ROLE_LABEL[pending.role]}?`
          : pending?.kind === 'leave' ? `Leave ${business.name}?`
          : pending ? `Remove ${pending.member.fullName ?? pending.member.email}?` : ''}
        description={pending?.kind === 'role' ? `${pending.member.fullName ?? pending.member.email} will be able to: ${ROLE_DESCRIPTION[pending.role].toLowerCase()}`
          : pending?.kind === 'leave' ? "You'll lose access straight away. Someone with admin rights must invite you again."
          : 'They lose access to this business straight away. Their past activity is kept.'}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={removing || changingRole}>Cancel</Button>
            <Button variant={pending?.kind === 'role' ? 'primary' : 'danger'} onClick={() => void confirmPending()}
              loading={removing || changingRole} loadingText="Saving…">
              {pending?.kind === 'role' ? 'Change role' : pending?.kind === 'leave' ? 'Leave business' : 'Remove member'}
            </Button>
          </>
        )} />

      {can('members.invite') && <InviteDialog open={inviting} onClose={() => setInviting(false)} actorRole={role} businessId={businessId} />}
      {can('ownership.transfer') && members.data && (
        <TransferDialog open={transferring} onClose={() => setTransferring(false)} businessId={businessId}
          businessName={business.name} candidates={members.data.filter(m => m.userId !== me)} />
      )}
    </>
  );
}

function InviteDialog({ open, onClose, actorRole, businessId }: {
  open: boolean; onClose: () => void; actorRole: BusinessRole; businessId: string;
}) {
  const roles = invitableRoles(actorRole);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Exclude<BusinessRole, 'OWNER'>>(roles[roles.length - 1] ?? 'MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [invite, { isLoading }] = useInviteMemberMutation();

  const close = () => {
    setEmail(''); setError(null); setCreated(null); setCopied(false);
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!EMAIL.test(email.trim())) { setError('Enter a valid email address.'); return; }
    setError(null);
    const result = await invite({ businessId, email: email.trim(), role: inviteRole });
    if ('data' in result && result.data) setCreated(result.data);
    else setError(fieldErrors(result.error).email ?? errorMessage(result.error));
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (created) {
    return (
      <Dialog open={open} onClose={close} title="Invitation created"
        description={`Send this link to ${created.invitation.email}. Only that email address can use it.`}
        footer={<Button onClick={close}>Done</Button>}>
        <div className="space-y-4">
          <Notice tone="warning">This link is shown once. If it's lost, revoke the invitation and send a new one.</Notice>
          <div className="flex items-stretch gap-2">
            <label htmlFor="invite-link" className="sr-only">Invitation link</label>
            <input id="invite-link" readOnly value={created.link} onFocus={e => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-xs text-ink-800" />
            <Button variant="secondary" onClick={() => void copy()}
              icon={copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="sr-only" aria-live="polite">{copied ? 'Link copied to clipboard' : ''}</p>
          <p className="text-xs text-ink-500">Expires {formatDate(created.invitation.expiresAt)}. In Phase 1 no email is sent.</p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={close} dismissible={!isLoading} title="Invite a team member"
      description="They join with the role you choose. You can change it later."
      footer={(
        <>
          <Button variant="ghost" onClick={close} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="invite-form" loading={isLoading} loadingText="Creating…">Create invitation</Button>
        </>
      )}>
      <form id="invite-form" noValidate onSubmit={submit} className="space-y-5">
        <TextField label="Email address" type="email" required autoComplete="off" value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }} error={error ?? undefined} />
        <SelectField label="Role" value={inviteRole} onChange={e => setInviteRole(e.target.value as Exclude<BusinessRole, 'OWNER'>)}
          options={roles.map(r2 => ({ value: r2, label: ROLE_LABEL[r2] }))} help={ROLE_DESCRIPTION[inviteRole]} />
      </form>
    </Dialog>
  );
}

function TransferDialog({ open, onClose, businessId, businessName, candidates }: {
  open: boolean; onClose: () => void; businessId: string; businessName: string; candidates: Member[];
}) {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [transfer, { isLoading, error, reset }] = useTransferOwnershipMutation();
  const chosen = candidates.find(c => c.userId === target);

  const close = () => { setTarget(''); setConfirmText(''); reset(); onClose(); };

  const submit = async () => {
    if (!chosen || confirmText !== businessName || isLoading) return;
    const result = await transfer({ businessId, userId: chosen.userId });
    if ('data' in result) {
      dispatch(addToast({ type: 'success', title: 'Ownership transferred', message: `${chosen.fullName ?? chosen.email} now owns ${businessName}. You are an Admin.` }));
      close();
    }
  };

  return (
    <Dialog open={open} onClose={close} dismissible={!isLoading} title="Transfer ownership"
      description="The new owner gets full control, including billing and deleting the business. You become an Admin."
      footer={(
        <>
          <Button variant="ghost" onClick={close} disabled={isLoading}>Cancel</Button>
          <Button variant="danger" onClick={() => void submit()} disabled={!chosen || confirmText !== businessName}
            loading={isLoading} loadingText="Transferring…">Transfer ownership</Button>
        </>
      )}>
      <div className="space-y-5">
        {error && <Notice tone="error">{errorMessage(error)}</Notice>}
        {candidates.length === 0 ? (
          <Notice tone="info">Invite someone first. Ownership can only go to an existing member.</Notice>
        ) : (
          <>
            <SelectField label="New owner" value={target} onChange={e => setTarget(e.target.value)}
              options={[{ value: '', label: 'Choose a member' }, ...candidates.map(c => ({ value: c.userId, label: `${c.fullName ?? c.email} (${ROLE_LABEL[c.role]})` }))]} />
            <TextField label={`Type “${businessName}” to confirm`} value={confirmText} autoComplete="off"
              onChange={e => setConfirmText(e.target.value)} />
          </>
        )}
      </div>
    </Dialog>
  );
}
