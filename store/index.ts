import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setActiveView, switchRole, validateSession } from '../features/auth/authSlice.ts';
import agencyReducer, {
  attachEstimate,
  approveOutreachDraft,
  classifyRequest,
  clientApproveEstimate,
  createSupportRequest,
  createMySupportRequest,
  payInvoice,
  sendApprovedOutreach,
  submitPublicInquiry,
  toggleTaskStatus,
  triggerWorkflowRun,
  updateOutreachDraft,
  updateLeadStage,
  fetchClients,
  updateClient,
  fetchCrmLeads,
  createCrmLead,
  updateCrmLeadPipelineStage,
  deleteCrmLead,
  fetchProjects,
  fetchMyProjects,
  createProject,
  updateProjectStatus,
  fetchSupportRequests,
  fetchMySupportRequests,
  approveEstimate,
  updateRequestStatus,
  fetchInvoices,
  fetchMyInvoices,
  markInvoicePaid,
  fetchMyProposals,
  recordProposalDecision
} from '../features/agency/agencySlice.ts';

// Import fetchOutreachDrafts separately to avoid naming conflict
import { fetchOutreachDrafts } from '../features/agency/agencySlice.ts';
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
  startLiveSync
} from '../features/ui/uiSlice.ts';
import type { AppNotification, SystemAlert, ToastMessage, ToastType } from '../types/ui.ts';

export {
  switchRole,
  setActiveView,
  validateSession,
  submitPublicInquiry,
  createSupportRequest,
  createMySupportRequest,
  classifyRequest,
  attachEstimate,
  clientApproveEstimate,
  approveOutreachDraft,
  sendApprovedOutreach,
  updateOutreachDraft,
  updateLeadStage,
  triggerWorkflowRun,
  payInvoice,
  toggleTaskStatus,
  fetchClients,
  updateClient,
  fetchCrmLeads,
  createCrmLead,
  updateCrmLeadPipelineStage,
  deleteCrmLead,
  fetchProjects,
  fetchMyProjects,
  createProject,
  updateProjectStatus,
  fetchSupportRequests,
  fetchMySupportRequests,
  approveEstimate,
  updateRequestStatus,
  fetchInvoices,
  fetchMyInvoices,
  markInvoicePaid,
  fetchMyProposals,
  recordProposalDecision,
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

export { fetchOutreachDrafts };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agency: agencyReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
