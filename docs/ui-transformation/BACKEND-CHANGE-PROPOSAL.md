# Backend change proposal (for approval; nothing implemented)

These changes would let the redesigned UI show the metrics in the master prompt without fabricated data. Each is
independent and can be approved separately.

Constraints that apply to all of them:
- Forward-only Flyway migrations.
- No destructive changes.
- No use of the shared Render database for development or tests.
- Authorization mirrors the existing module permissions (`ROLE_ADMIN` or the relevant `PERM_*`).

> **Migration numbering:** the approved backend Phase 2 plan already reserves **V24** for business scoping. These
> proposals would use V25 and later, in the order approved.

| # | Change | Why (UI need) | Shape | Risk / effort |
|---|---|---|---|---|
| **B1** | `GET /api/v1/admin/dashboard/summary?period=month` | One request instead of six list calls; real period-over-period deltas for flow metrics | Read-only aggregation service: counts and sums per KPI for the current and previous period, lead source counts, project status counts, accepted-proposal value by category, paid and invoiced by month (12 months). Admin-only DTO. Index check on `created_at`/`paid_at`/`status` | Low; read-only |
| **B2** | **Task** entity: `id, project_id (FK), title, status (TODO, IN_PROGRESS, DONE, BLOCKED), priority, assignee_user_id, due_date, created_at, updated_at` plus CRUD under `/api/v1/projects/{id}/tasks` and `GET /api/v1/tasks?assignee&status&due` | Pending tasks KPI, task performance chart, upcoming tasks table, Task module, portal tasks backed by real data | New table and indexes `(project_id)`, `(assignee_user_id, status)`, `(due_date)`. Clients see tasks only for their own projects (server-side) | Medium; new module |
| **B3** | `projects.completed_at` (set when status becomes `COMPLETED`), backfilled from `updated_at` for already-completed projects (documented as approximate) | Project performance trend | Additive column plus service hook | Low |
| **B4** | `invoices.project_id` (nullable FK) or `service_category` | Invoiced revenue by service category | Additive nullable column; the existing invoice form gets an optional project select | Low |
| **B5** | **Expense** entity: `id, date, amount, currency, category, project_id?, vendor, note` plus admin CRUD | "Revenue and expenses" chart, finance analytics | New table; admin-only | Medium; new feature, needs a product decision |
| **B6** | **Activity log**: append-only `activity_events (id, actor_user_id, entity_type, entity_id, action, summary, created_at)` written by services; `GET /api/v1/admin/activity` paginated | Recent activity panels, Activity log module (today demo only) | Insert in existing service methods (same transaction) | Medium |
| **B7** | **Workflow automation**: `workflows`, `workflow_versions (graph JSON: nodes and edges)`, `workflow_runs`, `workflow_run_logs`; endpoints to list, get, save draft, publish, run and fetch run logs | Automation Studio (reference B) can only show real state with this | Large. Needs a separate design: an execution engine (n8n-style or in-house), security of triggers, idempotency | Large; separate project |
| **B8** | Pagination (`page`, `size`, `sort`, search) on list endpoints: clients, crm-leads, projects, invoices, proposals, support-requests | Tables at scale (today the browser receives every row) | Spring `Pageable`, keeping the old unpaginated response for compatibility during migration | Low–medium |

**Recommendation:**
- Approve **B1, B3, B4 and B8** first: low risk, and they make the dashboard and analytics truthful.
- Decide **B2 (Tasks)** and **B6 (Activity)** as product features.
- **B5 (Expenses)** and **B7 (Workflows)** are larger features that need their own scoping.
- Until approved, the UI uses only ✅ data and the labelled interims in DATA-REQUIREMENTS.md.
