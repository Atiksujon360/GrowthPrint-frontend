import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDefaultRouteForRole } from '../../../lib/routes';
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { login } from '../authSlice.ts';

type WorkspaceLoginRole = 'ADMIN' | 'CLIENT';

interface WorkspaceLoginScreenProps {
  role: WorkspaceLoginRole;
  onSignIn: () => void;
  onBackToPublic: () => void;
}

const LOGIN_CONTENT: Record<WorkspaceLoginRole, {
  eyebrow: string;
  title: string;
  description: string;
  workspace: string;
  user: string;
  email: string;
  avatarUrl: string;
  accent: string;
  bullets: string[];
}> = {
  ADMIN: {
    eyebrow: 'Private founder workspace',
    title: 'Run the work behind the work.',
    description: 'Your operating system for delivery, growth, automation, and the decisions that keep every client moving forward.',
    workspace: 'GrowthPrint Admin',
    user: 'Alex Vance',
    email: 'alex@growthprint.agency',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    accent: 'from-blue-600 via-indigo-600 to-slate-950',
    bullets: ['Executive visibility across every account', 'Human approval gates for every automation', 'A clear audit trail for every decision']
  },
  CLIENT: {
    eyebrow: 'Secure client portal',
    title: 'Everything your team needs, in one place.',
    description: 'Review progress, approve estimates, submit requests, and stay close to the work without chasing updates.',
    workspace: 'GrowthPrint Client Portal',
    user: 'Sarah Chen',
    email: 'sarah.chen@meridianretail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    accent: 'from-cyan-600 via-blue-600 to-slate-950',
    bullets: ['One shared view of projects and milestones', 'Fast approvals with a complete context trail', 'Direct, transparent communication with GrowthPrint']
  }
};

export function WorkspaceLoginScreen({ role, onSignIn, onBackToPublic }: WorkspaceLoginScreenProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const content = LOGIN_CONTENT[role];
  const isAdmin = role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(content.email);
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions

    setIsLoading(true);
    setError(null);

    try {
      await dispatch(login({ email, password })).unwrap();
      // Redirect based on role using central route module
      const targetRoute = getDefaultRouteForRole(isAdmin ? 'ADMIN' : 'CLIENT');
      router.push(targetRoute);
      onSignIn();
    } catch (err) {
      setError(err as string || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-2px)] bg-[#F8FAFD] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[min(760px,calc(100vh-5rem))] max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className={`relative hidden overflow-hidden bg-gradient-to-br ${content.accent} p-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-12`}>
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10 bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20">GP</span>
              <div>
                <div className="text-sm font-bold tracking-tight">GrowthPrint</div>
                <div className="text-[11px] text-blue-100/75">Technology that moves business forward.</div>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                {content.eyebrow}
              </div>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight xl:text-5xl">{content.title}</h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-blue-50/75">{content.description}</p>
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="space-y-3">
              {content.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-3 text-sm text-blue-50/85">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Check className="h-3 w-3" />
                  </span>
                  {bullet}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 border-t border-white/15 pt-5 text-xs text-blue-100/65">
              <ShieldCheck className="h-4 w-4" />
              Protected workspace access · Built for focused delivery
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">GP</span>
                <span className="text-sm font-bold tracking-tight text-slate-900">GrowthPrint</span>
              </div>
              <button
                type="button"
                onClick={onBackToPublic}
                className="ml-auto text-xs font-semibold text-slate-500 transition-colors hover:text-blue-600"
              >
                Back to agency site
              </button>
            </div>

            <div className="mt-16 max-w-sm lg:mt-24">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}
                {content.workspace}
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your workspace.</p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <form
                className="mt-7 space-y-4"
                onSubmit={handleSubmit}
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Work email</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Password</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </span>
                </label>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Keep me signed in
                  </label>
                  <span className="text-xs text-slate-400">Need help? Contact your account owner.</span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to workspace
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-12 flex items-center gap-2 text-[11px] leading-5 text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" />
            Your workspace is private to your organization.
          </p>
        </section>
      </div>
    </main>
  );
}
