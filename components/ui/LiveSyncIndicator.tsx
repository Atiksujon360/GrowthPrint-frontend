import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import {
  startLiveSync,
  finishLiveSync,
  addToast,
  fetchClients,
  fetchCrmLeads,
  fetchProjects,
  fetchSupportRequests,
  fetchInvoices,
  fetchOutreachDrafts,
  fetchMyProjects,
  fetchMySupportRequests,
  fetchMyInvoices,
  fetchMyProposals
} from '../../store/index.ts';
import { RefreshCw, Server } from 'lucide-react';
import { ApiIntegrationModal } from './ApiIntegrationModal.tsx';
import { isMockModeEnv } from '../../lib/api/client.ts';

/** The API console is a development tool (it can switch the app to mock data); it is not shipped in real mode. */
const SHOW_DEV_TOOLS = isMockModeEnv();

export function LiveSyncIndicator() {
  const dispatch = useAppDispatch();
  const isSyncing = useAppSelector(state => state.ui.isLiveSyncing);
  const role = useAppSelector(state => state.auth.currentUser.role);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch(addToast({
        type: 'success',
        title: 'Back online',
        message: 'Your connection is restored. Use Refresh to load the latest data.',
        durationMs: 3000
      }));
    };

    const handleOffline = () => {
      setIsOnline(false);
      dispatch(addToast({
        type: 'warning',
        title: 'You are offline',
        message: 'Changes cannot be saved until your connection is back.',
        durationMs: 4500
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  /** Re-fetches the signed-in user's own data; reports success only if every request succeeded. */
  const handleManualSync = async () => {
    if (isSyncing) return;
    dispatch(startLiveSync());

    const requests = role === 'ADMIN'
      ? [fetchClients(), fetchCrmLeads(), fetchProjects(), fetchSupportRequests(), fetchInvoices(), fetchOutreachDrafts()]
      : [fetchMyProjects(), fetchMySupportRequests(), fetchMyInvoices(), fetchMyProposals()];

    const results = await Promise.all(requests.map(request => dispatch(request as never) as unknown as Promise<{ meta?: { requestStatus?: string } }>));
    const failed = results.filter(result => result?.meta?.requestStatus === 'rejected').length;

    dispatch(finishLiveSync());
    dispatch(addToast(failed === 0
      ? { type: 'success', title: 'Data refreshed', message: 'You are looking at the latest data.', durationMs: 3000 }
      : { type: 'error', title: 'Refresh incomplete', message: `${failed} of ${results.length} sections could not be loaded. Please try again.` }));
  };

  return (
    <>
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs text-slate-600 shadow-2xs">
        {/* Connection status (browser network state) */}
        <span className="flex items-center gap-1.5" role="status" aria-live="polite">
          {isOnline ? (
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
          )}
          <span className="font-semibold text-slate-800 hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <span className="sr-only sm:hidden">{isOnline ? 'Online' : 'Offline'}</span>
        </span>

        <span className="text-slate-300" aria-hidden="true">|</span>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          title="Reload the latest data"
          aria-label={isSyncing ? 'Refreshing data' : 'Refresh data'}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} aria-hidden="true" />
          <span className="hidden md:inline">{isSyncing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {SHOW_DEV_TOOLS && (
          <>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              title="API console (mock mode only)"
              aria-label="Open API console (mock mode only)"
              className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="hidden lg:inline text-[11px] text-slate-400">API</span>
            </button>
          </>
        )}
      </div>

      {SHOW_DEV_TOOLS && (
        <ApiIntegrationModal
          isOpen={isApiModalOpen}
          onClose={() => setIsApiModalOpen(false)}
        />
      )}
    </>
  );
}
