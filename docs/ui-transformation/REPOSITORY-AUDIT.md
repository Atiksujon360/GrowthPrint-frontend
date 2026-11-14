# GrowthPrint UI transformation: repository audit (Phase 0, read-only)

Date: 2026-11-09. Repository: `GrowthPrint-frontend`, branch `feature/growthprint-complete-design-transformation`
(from `b16f8ce`). No source files were changed for this audit.

> **Working-tree state.** This branch already contains *uncommitted* redesign work from earlier in this session:
> - the "blueprint" public site;
> - Nexora-style light app shells;
> - an emerald/teal palette;
> - new fonts (Hanken Grotesk and Schibsted Grotesk).
>
> The Enterprise UI Kit replaces that direction for the internal app. Nothing is committed, so the owner decides
> what to keep (see IMPLEMENTATION-PLAN.md, "Decisions").

## 1. Stack (verified in package.json)
| Area | Installed |
|---|---|
| Framework | Next.js 16.4.2 (App Router, `proxy.ts`), React 19.0.1, TypeScript 7 |
| Styling | Tailwind CSS 4.3.3 (`@theme` tokens in `app/globals.css`), no component library |
| State | Redux Toolkit 2.13 (`auth`, `agency`, `ui` slices, plus RTK Query `workspaceApi`), react-redux 9 |
| Forms | react-hook-form 7.90 and zod 4.6 (plus several hand-rolled forms) |
| Charts | recharts 3.10.1 (AdminDashboard only) |
| Motion | motion 12.23 |
| Icons | lucide-react 0.546 (the only icon set) |
| Dates | date-fns 4.4; no date-picker component (native inputs) |
| Tables | Custom `components/ui/DataTable.tsx` (sorting, search, status filter, pagination, CSV export); no TanStack |
| Graph or workflow editor | **None installed** |
| Tests | node:test unit tests; Playwright 1.64 e2e |

## 2. Routes
| Route | Shell | Purpose |
|---|---|---|
| `/` | Public | Marketing site and quote inquiry modal |
| `/forgot-password`, `/reset-password`, `/accept-invite`, `/join-business` | AuthShell | Recovery and invitations |
| `/studio/ops/login`, `/client-hub/login` | AuthShell | Sign-in |
| `/studio/ops`, `/studio/ops/settings` | `AdminLayout` | One client-side workspace with 12 tabs (below) |
| `/client-hub`, `/client-hub/settings` | `PortalLayout` | Client portal with 7 tabs |
| `/workspace`, `/workspace/new`, `/workspace/[id]/…` (8 pages) | `WorkspaceShell` | MVP2 business workspace (mock data until backend Phase 2) |

**Studio tabs:**
- Dashboard
- Leads & CRM
- Outreach approvals
- Clients
- Projects
- Support queue (requests)
- Invoices & revenue (with payment reports)
- Automation
- Activity log
- AI providers
- Users & team
- Settings

**Portal tabs:** Overview, Projects (milestones and tasks), Requests, Proposals, Billing (invoices and payment reports), Messages, Account settings.

**Workspace (MVP2):** business list, onboarding, Command Centre, clients and client detail, leads and lead detail, team, activity, settings.

### Kit domains not present in the product
These are not invented by the redesign:
- **Not present as modules:** Calendar, standalone Tasks module, Analytics module, Integrations page, admin Proposals list.
- **Tasks** exist only inside portal projects.
- **Proposals** exist in the portal and as estimates in the support queue.
- **Automation:** no backend in MVP1. Real mode shows "Workflow automation is not connected yet"; demo mode lists sample workflows. There is no graph schema and no editor.

## 3. Existing UI components
| Component | File | Notes |
|---|---|---|
| Button, TextField, SelectField, PasswordField, Notice, Card, Skeleton, EmptyState, ErrorState, Avatar | `components/ui/forms.tsx` | Main form kit; accessible labels and errors; radius `rounded-xl` |
| Dialog, PageHeader, Toolbar, SearchInput, FilterTabs, Pagination, StatusPill, StatCard, DefinitionList, TableShell | `components/ui/workspace-kit.tsx` | Used by workspace screens |
| Panel, KpiCard, Sparkline, MiniStat | `components/ui/app-kit.tsx` | Added in this session (uncommitted) |
| StatusBadge, PriorityBadge, StatCard | `components/ui/Badges.tsx` | Used by studio and portal views |
| DataTable | `components/ui/DataTable.tsx` | Studio list views |
| CommandPalette, KeyboardShortcutsModal, NotificationDropdown, ToastContainer, ConfirmDialog, Tooltip, CopyButton, LoadingSpinner, AsyncState, LiveSyncIndicator, SystemAlertBanner, AlertBanner, RoleSwitcherBar, ApiIntegrationModal, EngagingComponents | `components/ui/*` | Mixed styling; some predate the token system |
| AdminLayout / PortalLayout / WorkspaceShell / AuthShell | features | Three app shells; not yet one shared shell component |

**Patterns observed:**
- Most studio and portal views use legacy `slate-*`/`blue-*` utilities. `globals.css` re-points them to brand colours.
- Radii are 16px for cards and 12px for controls, larger than the kit's 8–12px and 6–8px.
- Several views are long (`AdminRequestsQueue` 528 lines, `AdminLeadsView` 393 lines) and mix layout with logic, so restyling has to be careful and incremental.

## 4. Functionality risks to watch during restyling
1. **Studio tabs are client state, not routes.** `onTabChange` must keep working, and permission filtering (`canUseStudioTab`) must stay.
2. **Demo vs real mode** (`isMockModeEnv`) branches exist in views: Automation, Activity, Client Portal buttons. Both branches must be kept.
3. **Session restore.** `WorkspaceGuard` and `SessionBootstrap` must not be wrapped in anything that delays them.
4. **DataTable is shared by many views.** Restyle once and verify every consumer.
5. **Recharts** is client-only and heavy. Keep it, and consider `next/dynamic` (React best-practices rule `bundle-dynamic-imports`).
6. **`features/admin/index.ts` is a barrel file.** React best-practices rule `bundle-barrel-imports`: avoid adding more barrels.
7. **Client portal data isolation** is filtered by `currentUser.clientId` in views and enforced by the backend. Do not move or alter those filters.

## 5. Baseline checks
| Check | Result (2026-11-09) |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm test` (node:test) | PASS: 133/133 at `b16f8ce`; 135/135 in the working tree |
| `npm run build` (real env and demo env) | PASS |
| Playwright `auth-and-routes` (12) and `mvp2-workspace` (7) | PASS |
| Playwright `public-inquiry` "open and fill" | PASS |
| Playwright `admin-login` (needs backend) | PASS with the owner's backend running on :8090 |
| Playwright `client-login` (needs backend) | **PRE-EXISTING FAIL**: sign-in works, but the test expects a "dashboard" heading the portal never had |
| Playwright `admin-create-project` (needs backend) | **PRE-EXISTING FAIL**: expects Ctrl+K to open a project form with tabs, budget and category fields that do not exist (Quick create is a lead/ticket form) |
| Playwright `public-inquiry` submit (needs backend) | **PRE-EXISTING FAIL**: the API returned 201, but the test expects the dialog to close; the modal shows a "Thanks — we got it" confirmation instead. **This test writes a real inquiry to the backend's database.** |

Lint: the `lint` script is `tsc --noEmit` (no ESLint configured).

## 6. Reuse vs redesign
- **Reuse and restyle:**
  - `forms.tsx` primitives;
  - `workspace-kit.tsx` (Dialog with focus trap, Pagination, FilterTabs);
  - `DataTable` (logic intact);
  - `StatusBadge`/`PriorityBadge` (now use `humanizeCode`);
  - CommandPalette, NotificationDropdown, Toasts.
- **Redesign:**
  - the three app shells, unified into one shared `AppShell` presentation;
  - KPI and metric cards;
  - chart panels;
  - table density and header styling;
  - pagination (numbered pages, as in the reference);
  - page headers;
  - empty and loading states.
- **Special layouts:**
  - Automation Studio: reference B, blocked on backend; see the implementation plan.
  - Split inspector views: Leads, Support queue, Outreach.
  - Document views: invoices, proposals.
