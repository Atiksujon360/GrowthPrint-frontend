/**
 * Client-side mirror of the backend PasswordPolicy (com.growthprint.backend.auth.service.PasswordPolicy).
 * Only for instant feedback while typing: the backend re-validates every new password and is the authority.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export interface PasswordRuleResult {
  id: 'length' | 'letter' | 'number' | 'email';
  label: string;
  met: boolean;
}

export function checkPasswordRules(password: string, email?: string): PasswordRuleResult[] {
  const localPart = (email ?? '').toLowerCase().split('@')[0] ?? '';
  return [
    {
      id: 'length',
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    },
    { id: 'letter', label: 'At least one letter', met: /\p{L}/u.test(password) },
    { id: 'number', label: 'At least one number', met: /\p{Nd}/u.test(password) },
    {
      id: 'email',
      label: 'Does not contain your email name',
      met: localPart.length < 3 || !password.toLowerCase().includes(localPart),
    },
  ];
}

export function isPasswordAcceptable(password: string, email?: string): boolean {
  return checkPasswordRules(password, email).every(rule => rule.met);
}

/** Validation for a "new password + confirm" pair. Returns field errors (empty object = valid). */
export function validateNewPassword(
  password: string,
  confirm: string,
  email?: string,
): Partial<Record<'password' | 'confirm', string>> {
  const errors: Partial<Record<'password' | 'confirm', string>> = {};
  if (!password) {
    errors.password = 'Enter a new password.';
  } else if (!isPasswordAcceptable(password, email)) {
    errors.password = 'The password does not meet all requirements yet.';
  }
  if (!confirm) {
    errors.confirm = 'Confirm your new password.';
  } else if (password && confirm !== password) {
    errors.confirm = 'The passwords do not match.';
  }
  return errors;
}

/** Reads `token` from a URL fragment such as `#token=abc` (reset and invitation links). */
export function readTokenFromHash(hash: string): string | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const value = new URLSearchParams(raw).get('token');
  return value && /^[A-Za-z0-9_-]{16,128}$/.test(value) ? value : null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
