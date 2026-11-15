# Implementation progress and plan (COMPREO direction)

## Where things stand (2026-11-09)
Branch: `feature/growthprint-complete-design-transformation`. **Nothing committed.**

| Work | State |
|---|---|
| Earlier "blueprint" public site and sign-in pages | Implemented, uncommitted. To be replaced by the reference C homepage on approval |
| Navy/blue enterprise-kit phase (approved earlier as D1–D6) | **Paused when the COMPREO direction arrived.** Done so far: `.gp-app` token scope, Inter, shared `AppShell` (navy), numbered pagination, unified KPI cards, dynamic-import chart, `humanizeCode`, accessibility fixes, three stale e2e tests corrected. Last checks: tsc PASS, unit 138/138, demo build PASS, 16 capture specs PASS. The full e2e suite was not re-run after the last step |
| COMPREO proposal (this folder) | Ready for review: tokens, specification, component inventory, data matrix, backend proposal, four rendered prototypes |

Reusable from the paused phase: the token-scope technique, AppShell structure (switches to a white sidebar), pagination,
KPI unification, chart lazy-loading, label humanizing and the accessibility fixes. **No source code changes until approval.**

## 2026-11-10: E1–E8 approved; Phase 5 and the dashboard implemented
**Phase 5 (foundation)**
- COMPREO tokens in `.gp-app`:
  - teal primary `#117F76` for fills and text, `#159F91` for charts and icons;
  - cool neutrals;
  - on-white semantic colours;
  - 10px card and 8px control radii.
- `AppShell`:
  - white sidebar with teal icon tiles, a solid teal active item, and red badges for items needing action;
  - top bar with search, notifications, help, settings, New record and the account menu;
  - page title rendered in the content.
- `KpiCard` uses the COMPREO layout.
- Chart presets `components/charts/GpCharts.tsx` are loaded lazily through `components/charts/lazy.tsx`.

**Dashboard (Phase 6, part)**
- Six KPIs: active projects, total leads, active clients, open milestones, open proposals, outstanding invoices.
- 3×2 analytics: projects by target month, revenue by service, lead sources, project status, milestone performance, collected vs invoiced.
- Tables: active projects, recent leads with the original pipeline progress, needs your attention, recent activity.
- Only real data or labelled interims are shown.

**Supporting changes**
- Read-only thunk `fetchAllProposals` (existing `GET /proposals`), added beside the existing thunks.
- Pure metric helpers in `lib/dashboardMetrics.ts`, with 5 new tests.

**Next**
- Leads, Clients and Projects module compositions (summary strip, filter bar, details drawer).
- Finance, Outreach and Analytics.
- Portal and workspace screens.
- Homepage on reference C.

## 2026-11-15: details drawer (Phase 6, part)
- `components/ui/DetailDrawer.tsx`: right-hand sheet with `DrawerSection` and `FactList`. It is a modal dialog: focus moves in, Tab is trapped, Escape and the backdrop close it, and focus returns to the opener. Full width on phones; the slide-in only runs when motion is allowed.
- Clients: a table row (or the name in card view) opens `ClientDetailDrawer`, which shows:
  - retainer hours left this month as a meter (red when over the allowance);
  - contact details and contract facts;
  - the client's own projects and invoices, with the outstanding total per currency.
  Projects and invoices load only when the account may open those modules.
- `DataTable`: clickable rows are now focusable and open with Enter or Space.
- `lib/clientSummary.ts`, with 3 tests.
- Checked in the browser at 1440 and 375 wide, by mouse and keyboard.
- **Next:** drawers for Projects (milestones) and Leads (evidence); then Phase 7 (Finance, Outreach, Analytics).

## Decisions (approved 2026-11-10 as recommended)
| # | Decision | Recommendation |
|---|---|---|
| **E1** | Adopt the COMPREO tokens with the contrast-safe variants (`primary-strong #117F76` for buttons, active nav and links; `#159F91` for charts and icons) | Approve. The proposed `#159F91` fails AA for normal text (3.3:1) |
| **E2** | Dashboard widgets the backend cannot serve yet (tasks, project trend, expenses): show **labelled real interims** (open milestones, projects by target month, collected vs invoiced), or hold them back | Labelled interims (DATA-REQUIREMENTS.md) |
| **E3** | Backend items **B1** (summary endpoint), **B3** (`completed_at`), **B4** (invoice→project) and **B8** (pagination) | Approve as a backend mini-phase after backend Phase 2 (V24), as V25+ |
| **E4** | Product features **B2** Tasks, **B5** Expenses, **B6** Activity log, **B7** Workflows | Decide separately; each is a new feature |
| **E5** | Signup and email verification do not exist (studio is invite-only; clients are activated by invitation) | Do not add signup; redesign the existing invitation and activation pages |
| **E6** | Public website: rebuild the homepage on reference C (agency positioning), replacing the blueprint version | Approve |
| **E7** | Optional: give studio modules their own URLs (`/studio/ops/leads` …) for deep links; today they are tabs on one URL | Later phase; behaviour change, low risk |
| **E8** | Context7 is installed but needs authorising with `/mcp` | Owner action, optional |

## Phases after approval (each ends with checks, browser screenshots against the reference, and a progress update here)
| Phase | Scope |
|---|---|
| 5 Foundation | COMPREO tokens in `.gp-app`; AppShell (white sidebar, icon tiles, solid teal active, collapsible groups, top bar without title, avatar menu); PageHeader with period filter; KpiCard (COMPREO layout); chart presets (`AreaTrend`, `DonutBreakdown`, `HorizontalBars`, `ComboBarLine`, `GroupedBars`); FilterBar; Drawer; Tabs; ProgressBar; Switch; badge on-white colours |
| 6 Core modules | Dashboard (prototype composition with real data and interims); Leads (summary, filters, table, evidence drawer); Clients (directory and details drawer); Projects (summary, table, detail with milestones). Tasks only after B2 |
| 7 Business modules | Proposals and invoices (summary, financial tables, preview drawer, existing PDF/CSV/JSON actions); Outreach (queue, context, editor, approval); Analytics pages from existing endpoints |
| 8 Advanced | Client portal and workspace on the same shell; auth pages (prototype); Automation Studio only if B7 is approved; integrations (AI providers) as grouped settings |
| 9 Final | Public homepage (reference C); responsive passes at 1536, 1280, 768 and 390; accessibility audit; Playwright regression and visual snapshots; reports |
