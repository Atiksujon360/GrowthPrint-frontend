'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getDefaultRouteForRole, ROUTES } from '../../../lib/routes.ts';
import { EMAIL_PATTERN } from '../../../lib/passwordRules.ts';
import { useAppDispatch } from '../../../store/hooks.ts';
import { login } from '../authSlice.ts';
import { Button, Notice, PasswordField, TextField } from '../../../components/ui/forms.tsx';
import { AuthShell } from './AuthShell.tsx';

type WorkspaceLoginRole = 'ADMIN' | 'CLIENT';

interface WorkspaceLoginScreenProps {
  role: WorkspaceLoginRole;
  /** Optional hooks kept for compatibility with existing callers. */
  onSignIn?: () => void;
  onBackToPublic?: () => void;
}

const COPY: Record<WorkspaceLoginRole, { eyebrow: string; subtitle: string; aside: { heading: string; points: string[] } }> = {
  ADMIN: {
    eyebrow: 'GrowthPrint studio',
    subtitle: 'Sign in to the internal workspace for delivery, clients and operations.',
    aside: {
      heading: 'The internal studio for GrowthPrint delivery and operations',
      points: [
        'Team members only see the modules they have been granted',
        'Finance, AI settings and user management stay with the administrator',
        'Account and permission changes take effect immediately',
      ],
    },
  },
  CLIENT: {
    eyebrow: 'Client hub',
    subtitle: 'Sign in to follow your projects, approve estimates, raise requests and see invoices.',
    aside: {
      heading: 'Your projects, requests and invoices in one private place',
      points: [
        'See progress and milestones without chasing updates',
        'Raise support requests and approve estimates online',
        'Your company sees only its own information',
      ],
    },
  },
};

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export function WorkspaceLoginScreen({ role, onSignIn }: WorkspaceLoginScreenProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const copy = COPY[role];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Guards against double submission even before React re-renders the disabled button.
  const inFlight = useRef(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
    if (!password) errors.password = 'Enter your password.';
    return errors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(null);
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      // Redirect by the role the backend returned, not by which login page was used.
      router.push(getDefaultRouteForRole(result.user.role));
      onSignIn?.();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Sign-in failed. Please try again.');
      setPassword('');
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title="Welcome back"
      subtitle={copy.subtitle}
      aside={copy.aside}
      footer={role === 'CLIENT'
        ? <>New to the client hub? Your invitation email contains a link to set up your account.</>
        : <>Access to the studio is by invitation from the administrator.</>}
    >
      {error && <Notice tone="error" className="mb-5">{error}</Notice>}
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(f => ({ ...f, email: undefined })); }}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />
        <div className="space-y-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(f => ({ ...f, password: undefined })); }}
            error={fieldErrors.password}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Link
              href={ROUTES.public.forgotPassword}
              className="rounded text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingText="Signing in…">
          <span className="inline-flex items-center gap-2">Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Button>
      </form>
    </AuthShell>
  );
}
