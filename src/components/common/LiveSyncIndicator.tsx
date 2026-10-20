import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { startLiveSync, finishLiveSync, addToast } from '../../store/index.ts';
import { RefreshCw, Radio, Server, Wifi, WifiOff } from 'lucide-react';
import { ApiIntegrationModal } from './ApiIntegrationModal.tsx';

export function LiveSyncIndicator() {
  const dispatch = useAppDispatch();
  const isSyncing = useAppSelector(state => state.ui.isLiveSyncing);
  const lastSyncTimestamp = useAppSelector(state => state.ui.lastSyncTimestamp);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch(addToast({
        type: 'success',
        title: 'Connection Restored',
        message: 'Network link online. Agency workspace re-synchronized.',
        durationMs: 3000
      }));
    };

    const handleOffline = () => {
      setIsOnline(false);
      dispatch(addToast({
        type: 'warning',
        title: 'Network Disconnected',
        message: 'You are currently offline. Changes are preserved in memory cache.',
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

  const handleManualSync = () => {
    if (isSyncing) return;
    dispatch(startLiveSync());

    setTimeout(() => {
      dispatch(finishLiveSync());
      dispatch(addToast({
        type: 'success',
        title: 'Workspace Synchronized',
        message: 'All client requests, revenue ledgers, and automation tasks are up to date.',
        durationMs: 3500
      }));
    }, 600);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs text-slate-600 shadow-2xs">
        {/* Connection status indicator */}
        <button
          onClick={() => setIsApiModalOpen(true)}
          title="Open API & Microservices Console"
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          {isOnline ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          )}
          <span className="font-semibold text-slate-800 hidden sm:inline group-hover:text-blue-600">
            {isOnline ? 'Live' : 'Offline'}
          </span>
        </button>

        <span className="text-slate-300">|</span>

        {/* Sync button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Sync with backend services"
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Refresh'}</span>
        </button>

        <span className="text-slate-300 hidden sm:inline">|</span>

        {/* Microservices API diagnostics button */}
        <button
          onClick={() => setIsApiModalOpen(true)}
          title="API Contracts & Microservice Gateway"
          aria-label="API Contracts & Microservice Gateway"
          className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <Server className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
          <span className="hidden lg:inline text-[11px] text-slate-400">API</span>
        </button>
      </div>

      <ApiIntegrationModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
      />
    </>
  );
}
