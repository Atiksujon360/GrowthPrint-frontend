import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks.ts';
import { addNotification, addToast } from '../store/index.ts';
import type { AppNotification, ToastMessage } from '../types/ui.ts';

type ToastInput = Omit<ToastMessage, 'id' | 'createdAt'> & { id?: string };
type NotificationInput = Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>;

export function useNotifications() {
  const dispatch = useAppDispatch();

  const notify = useCallback((toast: ToastInput) => dispatch(addToast(toast)), [dispatch]);
  const notifySuccess = useCallback((title: string, message: string) => notify({ type: 'success', title, message }), [notify]);
  const notifyError = useCallback((title: string, message: string) => notify({ type: 'error', title, message }), [notify]);
  const notifyWarning = useCallback((title: string, message: string) => notify({ type: 'warning', title, message }), [notify]);
  const notifyInfo = useCallback((title: string, message: string) => notify({ type: 'info', title, message }), [notify]);
  const createNotification = useCallback((notification: NotificationInput) => dispatch(addNotification(notification)), [dispatch]);

  return { notify, notifySuccess, notifyError, notifyWarning, notifyInfo, createNotification };
}
