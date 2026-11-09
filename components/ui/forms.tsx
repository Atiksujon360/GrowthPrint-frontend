'use client';

/**
 * Shared form primitives. One implementation of labels, required markers, help/error text, focus rings and
 * disabled/loading states so every form behaves the same way (WCAG 2.2 AA: visible focus, programmatic labels,
 * errors announced and linked with aria-describedby, 44px touch targets).
 */
import {
  forwardRef,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, Loader2, XCircle } from 'lucide-react';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, loadingText, icon, fullWidth, className, children,
    disabled, type = 'button', ...rest },
  ref,
) {
  const sizes = { sm: 'min-h-9 px-3 text-xs', md: 'min-h-10 px-4 text-sm', lg: 'min-h-11 px-5 text-sm' };
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200',
        'disabled:cursor-not-allowed disabled:opacity-55',
        sizes[size], BUTTON_VARIANTS[variant], fullWidth && 'w-full', className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
});

// ---------------------------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------------------------

export interface FieldProps {
  label: string;
  required?: boolean;
  help?: ReactNode;
  error?: string;
  className?: string;
  /** Rendered input; receives the ids it must use. */
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

export function Field({ label, required, help, error, className, children }: FieldProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helpId = help ? `${baseId}-help` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-ink-400">(optional)</span>
        )}
      </label>
      {children({ inputId, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-red-700">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {help && <div id={helpId} className="text-xs leading-5 text-ink-500">{help}</div>}
    </div>
  );
}

export const inputClass = (invalid: boolean, extra?: string) => cx(
  'block w-full rounded-xl border bg-white px-3 py-2 text-sm text-ink-900 transition',
  'placeholder:text-ink-400 focus:outline-none focus:ring-4',
  'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
  invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-200 focus:border-brand-500 focus:ring-brand-100',
  extra,
);

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  help?: ReactNode;
  error?: string;
}

export function TextField({ label, help, error, required, className, ...input }: TextFieldProps) {
  return (
    <Field label={label} help={help} error={error} required={required} className={className}>
      {({ inputId, describedBy, invalid }) => (
        <input
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
          className={inputClass(invalid)}
          {...input}
        />
      )}
    </Field>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  help?: ReactNode;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export function SelectField({ label, help, error, required, options, className, ...select }: SelectFieldProps) {
  return (
    <Field label={label} help={help} error={error} required={required} className={className}>
      {({ inputId, describedBy, invalid }) => (
        <select
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
          className={inputClass(invalid, 'pr-8')}
          {...select}
        >
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )}
    </Field>
  );
}

/**
 * Password input with an accessible show/hide toggle. Toggling only switches the input type, so the typed
 * value and cursor are kept; the button is a real <button> with aria-pressed and a descriptive label.
 */
export function PasswordField({ label, help, error, required, className, ...input }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} help={help} error={error} required={required} className={className}>
      {({ inputId, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={inputId}
            type={visible ? 'text' : 'password'}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            required={required}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass(invalid, 'pr-12')}
            {...input}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            aria-controls={inputId}
            disabled={input.disabled}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-50"
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      )}
    </Field>
  );
}

/** Live checklist of password requirements (announced politely as they change). */
export function PasswordRequirements({ rules }: { rules: ReadonlyArray<{ id: string; label: string; met: boolean }> }) {
  return (
    <ul className="grid gap-1 sm:grid-cols-2" aria-live="polite">
      {rules.map(rule => (
        <li key={rule.id} className={cx('flex items-center gap-1.5 text-xs', rule.met ? 'text-emerald-700' : 'text-ink-500')}>
          {rule.met
            ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            : <span className="h-3.5 w-3.5 rounded-full border border-ink-300" aria-hidden="true" />}
          <span>{rule.label}<span className="sr-only">{rule.met ? ' (met)' : ' (not met yet)'}</span></span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------------------------

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: 'border-brand-200 bg-brand-50 text-brand-900', icon: Info },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: CheckCircle2 },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: AlertCircle },
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: XCircle },
};

export function Notice({ tone = 'info', title, children, className }: {
  tone?: Tone; title?: string; children?: ReactNode; className?: string;
}) {
  const { box, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-xl border px-4 py-3 text-sm', box, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-6">{children}</div>}
      </div>
    </div>
  );
}

export function Card({ title, description, actions, children, className }: {
  title?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cx('rounded-2xl border border-ink-200 bg-white shadow-xs', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="text-base font-semibold text-ink-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-lg bg-ink-100', className)} aria-hidden="true" />;
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink-400" aria-hidden="true">{icon}</div>}
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Notice tone="error" title="Something went wrong">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 text-sm font-semibold underline underline-offset-2">
          Try again
        </button>
      )}
    </Notice>
  );
}

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full bg-ink-900 font-semibold text-white', sizes[size])}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
