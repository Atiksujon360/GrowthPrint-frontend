# Dashboard and module data requirements

Every number on a GrowthPrint screen must come from real backend data. This matrix checks each widget in the
COMPREO-based dashboard spec against what the backend can serve today (audited 2026-11-09, backend branch
`feature/mvp2-m1-security-hardening`).

Legend:
- ✅ available now (computed in the browser from existing list endpoints);
- 🟡 possible with a small backend addition;
- ❌ needs a new entity or feature.

## Dashboard KPIs
| Metric | Current API | Database source | Missing capability | Proposed solution |
|---|---|---|---|---|
| Active projects | `GET /api/v1/projects` | `projects.status` | — | ✅ Count `IN_PROGRESS`, `WAITING_FOR_CLIENT`, `IN_REVIEW` |
| Total leads | `GET /api/v1/crm-leads` (+ inbound `GET /api/v1/leads`) | `crm_leads`, `leads` | — | ✅ Count; "new this month" from `created_at` |
| Active clients | `GET /api/v1/clients` | `clients.status` | No `created_at` on clients in MVP1 (added in planned V24) | ✅ Count `ACTIVE`; month change after V24 |
| Pending tasks | none | **no task entity** | Tasks do not exist in the backend (portal "tasks" are demo data) | ❌ B2 (Task entity). **Interim:** "Open milestones" from project milestones (✅ real) |
| Open proposals | `GET /api/v1/proposals` | `proposals.status`, `total_price` | — | ✅ Count `DRAFT` + `SENT_FOR_REVIEW`; value sum |
| Outstanding invoices | `GET /api/v1/invoices` | `invoices.status`, `total_amount` | — | ✅ Count and sum `ISSUED` + `OVERDUE` |
| "vs last month" deltas | none | `created_at` / `paid_at` | Snapshot metrics (active projects or clients) have no history | ✅ only for flow metrics (new leads, paid revenue, proposals sent). 🟡 B1 summary endpoint. Snapshots show no delta |

## Dashboard charts
| Chart | Current API | Source | Missing | Proposal |
|---|---|---|---|---|
| Project performance trend | `projects` | `progress_percent`, `status`, `updated_at` | No progress history, no `completed_at` | 🟡 B3: add `projects.completed_at`, then "projects completed per month". **Interim:** "Projects by target month" (`target_completion_date`) ✅ |
| Revenue by service category | `proposals` | `service_category`, `total_price`, `status = ACCEPTED` | Invoices have no category or project link | ✅ Booked revenue from accepted proposals by category (labelled "Accepted proposal value"). 🟡 B4 `invoices.project_id` for invoiced revenue by category |
| Lead acquisition sources | `crm-leads` | `crm_leads.source` (INBOUND_INQUIRY, PUBLIC_DIRECTORY, TECH_AUDIT_DISCOVERY, REFERRAL) | — | ✅ Donut |
| Project status distribution | `projects` | `status` (7 values) | — | ✅ Donut or bar |
| Task performance | none | — | No tasks | ❌ B2. **Interim:** milestone status (done / in progress / pending) ✅ |
| Revenue and expenses | `invoices` | `paid_at`, `total_amount` | **No expense entity** | ✅ Revenue (paid by month) and invoiced. ❌ Expenses need B5; until then the chart is "Collected vs invoiced" (existing) |

## Dashboard tables
| Table | Source | Status |
|---|---|---|
| Active projects (name, client, status, progress, target date, lead) | `projects` + `clients` | ✅ |
| Recent leads (company, source, score, stage, next action) | `crm-leads` | ✅ |
| Upcoming tasks | — | ❌ B2. **Interim:** upcoming milestones by due date ✅ |

## Other modules
| Need (from the master prompt) | Status |
|---|---|
| Lead technology needs, estimated opportunity, priority | ✅ `targetService`, `qualificationScore`, `nextAction`. ❌ No `estimated_value` on CRM leads (planned backend Phase 2) |
| Client financials and related projects | ✅ Join projects, invoices and proposals by `clientId` in the browser |
| Communication history | 🟡 Portal messages exist in demo data only. No messages API |
| Project team, tasks and activity | `assignedLead` ✅; team members, tasks and activity ❌ |
| Proposal document preview, invoice PDF | ✅ Invoice PDF endpoint exists; proposal detail ✅ |
| Analytics pages (revenue, leads, projects, clients, services, delivery, finance) | ✅ Browser aggregation is fine for MVP volumes. 🟡 B1 for scale |
| Activity log | ❌ No API (demo only); B6 |
| Automation Studio (graph, runs, logs) | ❌ **No workflow backend at all**; B7 |

**Rule for implementation:** widgets marked ❌ are not drawn with placeholder numbers. They are either replaced by the
labelled real interim shown above, or shown as an explicit "not connected yet" state.
