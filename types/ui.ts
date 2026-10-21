export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClickTab?: string;
  payload?: unknown;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
  action?: ToastAction;
  createdAt: string;
}

export type NotificationCategory = 'ACTION_REQUIRED' | 'OUTREACH' | 'FINANCIAL' | 'SYSTEM';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetTab?: string;
  entityId?: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  actionTab?: string;
}

export interface UiState {
  toasts: ToastMessage[];
  notifications: AppNotification[];
  systemAlert: SystemAlert | null;
  isSystemAlertDismissed: boolean;
  isLiveSyncing: boolean;
  lastSyncTimestamp: string;
  isShortcutsModalOpen: boolean;
}
