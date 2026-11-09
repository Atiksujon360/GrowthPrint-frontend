# Implementation plan (proposal; nothing implemented until approved)

## Decisions needed from the owner
| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D1** | Primary action colour in the app | **a)** Kit blue `#3569C8`, with brand teal kept for the logo and public site. **b)** Brand teal `#0C826C` with the kit's navy and neutrals | **a) Kit blue.** Teal primary would sit too close to success green, and the kit asks for blue = action, green = success |
| **D2** | App typeface | **a)** Inter (kit). **b)** Keep Hanken Grotesk (added this session) | **a) Inter**, self-hosted with `next/font` |
| **D3** | Public website | **a)** Keep the current blueprint redesign (uncommitted), aligned only in colour. **b)** Revert the public site to `b16f8ce`. **c)** Restyle it in the kit's quieter enterprise style | **a)** The kit targets the internal app and says marketing may differ |
| **D4** | Automation Studio (reference B) | **a)** Defer until the backend has workflow graphs. **b)** Build a read-only canvas from demo workflows now (would add `@xyflow/react` and show sample data) | **a) Defer.** b) would be a new feature on sample data |
| **D5** | Three pre-existing stale e2e tests (`client-login`, `admin-create-project`, inquiry submit) | **a)** Update their assertions to the real, unchanged UI behaviour. **b)** Leave them as known failures | **a)**, and run the backend-writing test only against an isolated database |
| **D6** | Earlier uncommitted app-shell work (light Nexora shells, `app-kit`, `humanizeCode`, badge and accessibility fixes) | Build on it (the shells get re-skinned to navy) or revert first | **Build on it.** The accessibility and label fixes stay; only visuals change |

## Phases (each ends with type check, unit tests, build, Playwright and screenshots, then a report)
1. **Tokens and theme scope.**
   - Add the `gp-*` tokens and an `.gp-app` scope that re-points `brand`/`blue`/`ink`.
   - Inter via `next/font`.
   - Radius and shadow tokens.
   - Files: `app/globals.css`, `app/layout.tsx`.
   - Risk: low, visual only.
2. **AppShell.**
   - One presentational shell (navy sidebar, top bar, icon rail, drawer, user menu) used by `AdminLayout`, `PortalLayout` and `WorkspaceShell`.
   - Their props, permission filters, badges, palette, quick create, notifications, shortcuts and sign-out stay as is.
3. **Shared components:**
   - Button and fields (36px, 7px);
   - KpiCard and StatCards (unified markup);
   - ChartPanel with `next/dynamic` Recharts;
   - DataTable density with numbered pagination;
   - StatusBadge and StatusPill chips;
   - Dialog and Drawer, Tabs, ActivityFeed, ProgressBar, Switch, EmptyState and Skeleton;
   - Toasts.
4. **Studio modules, one at a time,** each verified before the next:
   1. Dashboard
   2. Leads
   3. Outreach
   4. Clients
   5. Projects
   6. Support queue
   7. Invoices and payment reports
   8. Automation (list)
   9. Activity
   10. AI providers
   11. Team
   12. Settings

   Presentation only: no changes to thunks, selectors, API calls or permission checks.
5. **Client portal:** Overview, Projects, Requests, Proposals, Billing, Messages, Settings.
6. **Workspace (MVP2):** list, onboarding, Command Centre, clients, leads, team, activity, settings.
7. **Auth screens** (AuthShell in the kit palette) and **public site** per D3.
8. **QA:**
   - Playwright `toHaveScreenshot` baselines for about 15 representative routes at 1440, 768 and 390;
   - smoke tests for the shell controls;
   - full suite;
   - WCAG checks (focus, contrast, landmarks, dialogs);
   - the kit's QA checklist marked item by item with actual results.

## Guardrails
- Not touched:
  - `store/` business logic;
  - `lib/api/`;
  - auth and guards;
  - routes;
  - backend.
- No paid tools.
- No commits or pushes without approval.
- Backend-writing e2e tests run only when the owner confirms an isolated database.
- Every phase report lists files changed, components reused or created, tests run and their actual results.
