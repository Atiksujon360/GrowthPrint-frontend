# Route inventory (verified in the repository, 2026-11-09)

| Route | Area | Shell | Current state | Redesign target |
|---|---|---|---|---|
| `/` | Public website | Public | Blueprint redesign (uncommitted) | Aurevo-inspired agency homepage (reference C), agency positioning |
| `/studio/ops/login` | Auth (staff) | AuthShell | Navy split layout | COMPREO-style auth |
| `/client-hub/login` | Auth (clients) | AuthShell | Same | Same |
| `/forgot-password`, `/reset-password#token` | Auth | AuthShell | Same | Same |
| `/accept-invite#token` | Auth: invitation and account activation (sets password) | AuthShell | Same | Same |
| `/join-business#token` | MVP2 business invitation | AuthShell | Same | Same |
| *(no route)* | **Signup** | — | Does not exist: studio accounts are invite-only; client accounts are created by admins and activated by invitation | Not created unless approved (it would be a new feature with a backend) |
| *(no route)* | **Email verification** | — | Does not exist; invitation acceptance covers activation | — |
| `/studio/ops` (tab Dashboard) | Dashboard | AppShell | KPI row and charts (navy kit, in progress) | COMPREO composition |
| `/studio/ops` (tab Leads & CRM) | Business development | AppShell | Table and inspector | Prospect workspace and details drawer |
| `/studio/ops` (tab Outreach approvals) | Outreach | AppShell | Draft queue and editor | Queue, research context, editor and approval (draft-only) |
| `/studio/ops` (tab Clients) | Clients | AppShell | Table / cards | Directory and client details drawer |
| `/studio/ops` (tab Projects) | Projects | AppShell | Table and detail | Overview, list and details (milestones) |
| `/studio/ops` (tab Support queue) | Support | AppShell | Table and triage inspector | Same pattern, restyled |
| `/studio/ops` (tab Invoices & revenue) | Finance | AppShell | Ledger and payment reports | Financial summary, table and document preview |
| `/studio/ops` (tab Automation) | Automation | AppShell | "Not connected" (real mode) / demo list | Automation Studio shell needs backend B7 |
| `/studio/ops` (tab Activity log) | Activity | AppShell | Demo only | Timeline (needs B6 for real data) |
| `/studio/ops` (tabs AI providers, Users & team) | Administration | AppShell | Forms and table | Grouped settings |
| `/studio/ops/settings` | Account | AppShell | Account settings | Grouped settings |
| `/client-hub` (7 tabs) | Client Portal | AppShell | Overview, projects, requests, proposals, billing, messages, settings | Same language, client-scoped |
| `/workspace`, `/workspace/new`, `/workspace/[id]/…` (8 pages) | MVP2 business workspace (mock data until backend Phase 2) | AppShell | Command Centre, clients, leads, team, activity, settings | Same language |

**Not present (not invented):**
- standalone Tasks module (needs B2);
- admin Proposals list (proposals are portal-facing; an admin list would reuse `GET /api/v1/proposals`, which exists);
- Analytics pages (can be built on existing data);
- Integrations page (AI providers is the only integration settings page);
- Calendar.

Studio tabs are client-side state on one route (`/studio/ops`). Giving modules their own URLs (deep links) is
proposed as an optional step in IMPLEMENTATION-PROGRESS.md.
