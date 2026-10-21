import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setActiveView, switchRole } from '../features/auth/authSlice.ts';
import agencyReducer, {
  attachEstimate,
  approveOutreachDraft,
  classifyRequest,
  clientApproveEstimate,
  createSupportRequest,
  payInvoice,
  sendApprovedOutreach,
  submitPublicInquiry,
  toggleTaskStatus,
  triggerWorkflowRun,
  updateLeadStage,
  updateRequestStatus
} from '../features/agency/agencySlice.ts';
import uiReducer, {
  addNotification,
  addToast,
  clearAllToasts,
  clearNotification,
  dismissSystemAlert,
  finishLiveSync,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeToast,
  setShortcutsModalOpen,
  setSystemAlert,
  startLiveSync,
  type AppNotification,
  type SystemAlert,
  type ToastMessage,
  type ToastType
} from '../features/ui/uiSlice.ts';

export {
  switchRole,
  setActiveView,
  submitPublicInquiry,
  createSupportRequest,
  classifyRequest,
  attachEstimate,
  clientApproveEstimate,
  updateRequestStatus,
  approveOutreachDraft,
  sendApprovedOutreach,
  updateLeadStage,
  triggerWorkflowRun,
  payInvoice,
  toggleTaskStatus,
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
  setShortcutsModalOpen,
  type ToastMessage,
  type ToastType,
  type AppNotification,
  type SystemAlert
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agency: agencyReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
