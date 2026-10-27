import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addNotification,
  addToast,
  clearAllToasts,
  clearNotification,
  createSupportRequest,
  dismissSystemAlert,
  finishLiveSync,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  payInvoice,
  removeToast,
  setActiveView,
  setShortcutsModalOpen,
  setSystemAlert,
  startLiveSync,
  submitPublicInquiry,
  switchRole,
  toggleTaskStatus,
  triggerWorkflowRun,
  updateOutreachDraft,
  updateLeadStage,
  fetchInvoices,
  markInvoicePaid,
  approveOutreachDraft,
  sendApprovedOutreach,
  store
} from './index.ts';

test('Redux state keys and action type strings remain stable', () => {
  assert.deepEqual(Object.keys(store.getState()), ['auth', 'agency', 'ui']);
  assert.deepEqual(
    [
      switchRole,
      setActiveView,
      updateLeadStage,
      triggerWorkflowRun,
      payInvoice,
      toggleTaskStatus,
      updateOutreachDraft,
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
    ].map(actionCreator => actionCreator.type),
    [
      'auth/switchRole',
      'auth/setActiveView',
      'agency/updateLeadStage',
      'agency/triggerWorkflowRun',
      'agency/payInvoice',
      'agency/toggleTaskStatus',
      'agency/updateOutreachDraft',
      'ui/addToast',
      'ui/removeToast',
      'ui/clearAllToasts',
      'ui/addNotification',
      'ui/markNotificationAsRead',
      'ui/markAllNotificationsAsRead',
      'ui/clearNotification',
      'ui/dismissSystemAlert',
      'ui/setSystemAlert',
      'ui/startLiveSync',
      'ui/finishLiveSync',
      'ui/setShortcutsModalOpen'
    ]
  );

  // Verify async thunks are exported (async thunks don't have .type property)
  assert.strictEqual(typeof fetchInvoices, 'function');
  assert.strictEqual(typeof markInvoicePaid, 'function');
  assert.strictEqual(typeof approveOutreachDraft, 'function');
  assert.strictEqual(typeof sendApprovedOutreach, 'function');
  assert.strictEqual(typeof createSupportRequest, 'function');
  assert.strictEqual(typeof submitPublicInquiry, 'function');
});
