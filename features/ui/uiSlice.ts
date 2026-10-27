import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification, SystemAlert, ToastMessage, UiState } from '../../types/ui.ts';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'ACTION_REQUIRED',
    title: 'Estimate Approved by Client',
    message: 'Sarah Chen authorized the $810 estimate for emergency checkout latency tuning. Ready for implementation.',
    timestamp: '2026-10-19T08:35:00Z',
    isRead: false,
    priority: 'HIGH',
    targetTab: 'REQUESTS',
    entityId: 'req-001'
  },
  {
    id: 'notif-2',
    category: 'OUTREACH',
    title: 'Personalized Outreach Draft Ready',
    message: 'Researched draft for David Sterling at Vanguard Freight Network is ready for your review.',
    timestamp: '2026-10-19T08:00:00Z',
    isRead: false,
    priority: 'HIGH',
    targetTab: 'OUTREACH',
    entityId: 'draft-vanguard-01'
  },
  {
    id: 'notif-3',
    category: 'FINANCIAL',
    title: 'Invoice Reconciled',
    message: 'Nexus Logistics ACH payment of $6,000 for EDI Sprint 1 has cleared and been reconciled.',
    timestamp: '2026-10-18T10:15:00Z',
    isRead: true,
    priority: 'MEDIUM',
    targetTab: 'INVOICES',
    entityId: 'inv-103'
  },
  {
    id: 'notif-4',
    category: 'SYSTEM',
    title: 'Milestone Watchdog Completed',
    message: 'All 3 active projects scanned. Meridian sprint milestone is due in 15 days.',
    timestamp: '2026-10-19T08:00:00Z',
    isRead: true,
    priority: 'LOW',
    targetTab: 'PROJECTS'
  }
];

const initialUiState: UiState = {
  toasts: [],
  notifications: INITIAL_NOTIFICATIONS,
  systemAlert: {
    id: 'alert-retainer-status',
    type: 'info',
    title: 'October Retainer Notice',
    message: 'Meridian Retail Group has utilized 8.5 of 15 retainer hours (57%). 11 days remaining in current billing cycle.',
    actionLabel: 'View Retainers',
    actionTab: 'CLIENTS'
  },
  isSystemAlertDismissed: false,
  isLiveSyncing: false,
  lastSyncTimestamp: null,
  isShortcutsModalOpen: false
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    // Toasts
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id' | 'createdAt'> & { id?: string }>) => {
      const id = action.payload.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      state.toasts.push({
        ...action.payload,
        id,
        createdAt: new Date().toISOString(),
        durationMs: action.payload.durationMs ?? 4000
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false
      });
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.isRead = true;
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
    },
    clearNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    // System Alert
    dismissSystemAlert: (state) => {
      state.isSystemAlertDismissed = true;
    },
    setSystemAlert: (state, action: PayloadAction<SystemAlert>) => {
      state.systemAlert = action.payload;
      state.isSystemAlertDismissed = false;
    },

    // Live Sync
    startLiveSync: (state) => {
      state.isLiveSyncing = true;
    },
    finishLiveSync: (state) => {
      state.isLiveSyncing = false;
      state.lastSyncTimestamp = new Date().toISOString();
    },

    // Keyboard Shortcuts Modal
    setShortcutsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isShortcutsModalOpen = action.payload;
    }
  }
});

export const {
  addToast,
  removeToast,
  clearAllToasts,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
  dismissSystemAlert,
  setSystemAlert,
  startLiveSync,
  finishLiveSync,
  setShortcutsModalOpen
} = uiSlice.actions;

export default uiSlice.reducer;
