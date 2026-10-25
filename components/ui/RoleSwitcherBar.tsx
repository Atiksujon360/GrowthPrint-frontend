'use client';

import { useAppSelector } from '../../store/hooks.ts';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, UserCheck, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { ROUTES, isProtectedRoute } from '../../lib/routes';

export function RoleSwitcherBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAppSelector(state => state.auth);
  const requests = useAppSelector(state => state.agency.requests);
  const outreach = useAppSelector(state => state.agency.outreachDrafts);
  const leads = useAppSelector(state => state.agency.leads);

  const pendingEstimates = requests.filter(r => r.status === 'AWAITING_CLIENT_APPROVAL').length;
  const pendingApprovals = outreach.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL').length;

  const isActiveRoute = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  const handleNavToPortal = () => {
    if (isAuthenticated) {
      router.push(ROUTES.portal.home);
    } else {
      router.push(ROUTES.portal.login);
    }
  };

  const handleNavToAdmin = () => {
    if (isAuthenticated) {
      router.push(ROUTES.admin.home);
    } else {
      router.push(ROUTES.admin.login);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role identity and quick explanation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-white">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold tracking-tight">GrowthPrint workspace:</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Viewing as:</span>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 overflow-x-auto max-w-full">
            <button
              onClick={() => router.push(ROUTES.public.home)}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 shrink-0 ${
                isActiveRoute('/')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </button>

            <button
              onClick={handleNavToPortal}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 shrink-0 relative ${
                isActiveRoute('/portal')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Portal</span>
              {pendingEstimates > 0 && (
                <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1 rounded-full leading-none py-0.5">
                  {pendingEstimates}
                </span>
              )}
            </button>

            <button
              onClick={handleNavToAdmin}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 shrink-0 relative ${
                isActiveRoute('/admin')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Admin</span>
              {pendingApprovals > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1 rounded-full leading-none py-0.5">
                  {pendingApprovals}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Active user & quick status */}
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Active as <strong className="text-white font-medium">{currentUser.name}</strong>
              {currentUser.role === 'CLIENT' && ` (${currentUser.clientName})`}
              {currentUser.role === 'ADMIN' && ' (team)'}
            </span>
          </div>

          {isActiveRoute('/') && (
            <button
              onClick={handleNavToPortal}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 ml-2 transition-colors"
            >
              Go to Portal <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
