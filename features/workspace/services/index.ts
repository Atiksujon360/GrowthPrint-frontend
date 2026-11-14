/**
 * Selects the workspace service implementation. Phase 1: the in-memory mock (state kept in sessionStorage so a
 * page reload keeps your changes). Phase 3 replaces this with the HTTP implementation; nothing else changes.
 */
import { MockWorkspaceService, type MockState, type StateStore } from './mockWorkspaceService.ts';
import type { WorkspaceService } from './workspaceService.ts';

const STORAGE_KEY = 'gp_workspace_mock_v1';

const sessionStore: StateStore = {
  load(): MockState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as MockState) : null;
    } catch {
      return null;
    }
  },
  save(state: MockState): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: the demo keeps working in memory
    }
  },
};

export const mockWorkspaceService = new MockWorkspaceService(sessionStore, () => new Date(), 180);

/** The implementation every screen uses. Swap to the HTTP service in Phase 3. */
export const workspaceService: WorkspaceService = mockWorkspaceService;

/** True while Phase 1 mock data is in use (shown as a small banner in the workspace). */
export const USING_MOCK_WORKSPACE_DATA = true;

export function resetWorkspaceDemoData(): void {
  mockWorkspaceService.reset();
}
