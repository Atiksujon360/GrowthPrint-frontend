# GrowthPrint enterprise UI: design specification (COMPREO direction; proposal)

Supersedes the earlier navy/blue kit specification. Final visual authority for the internal app: **Reference A
(COMPREO)**. Automation editor: **Reference B (Synthex)**. Public website: **Reference C (Aurevo)**, adapted to agency
positioning. Reference screenshots are owner-supplied third-party designs and stay outside the repository.

## 1. Reference analysis

### A. COMPREO: internal application
| Area | Observed | GrowthPrint adaptation |
|---|---|---|
| Sidebar | White, about 235px, logo block at the top; nav rows with a small **light-teal icon tile** and a 14px label; grouped modules with chevrons; **active item a solid teal block** with white icon and text; red count badge ("Approvals 8") | 240px white sidebar. Groups: Overview, Growth, Clients & delivery, Finance, System, Account. Active `primary-strong` block. Count badges: `danger` for overdue/attention, `primary` otherwise. Expandable groups only where a module has sub-pages |
| Top bar | White, minimal: hamburger, wide grey search field, bell, help, settings, teal avatar with chevron. No page title in the bar | Same anatomy. **The page title moves into the content** ("Welcome back, …", or the module name), as in COMPREO. Search opens the existing command palette |
| Page header | 26px bold greeting, muted subline, date filter ("This Month") at the top right | `PageHeader`: title, description, right-aligned period filter or actions |
| KPIs | Six equal white cards; icon tile at the left beside the label; large bold value; ▲/▼ delta "vs last month" in green or red | `KpiCard` with this exact composition; deltas only where real history exists (DATA-REQUIREMENTS.md) |
| Analytics | Two rows of three equal panels: area line with markers, donut with centre total and legend percentages, horizontal bars with values, combo bar plus line with two axes | `ChartPanel` (title, optional unit, optional filter) with Recharts presets: `AreaTrend`, `DonutBreakdown` (centre total and legend list), `HorizontalBars`, `ComboBarLine` |
| Surfaces | Canvas `#FAFBFC`; white panels; 1px `#E8ECEF` border; very soft shadow; about 10px radius | Tokens in DESIGN-TOKENS.md |

### B. Synthex: Automation Studio
- **Shell:** dedicated three-panel editor (inset rounded panels on a grey frame).
- **Left panel:** brand, primary "Create workflow", collapsible menu groups (Main menu, Manage, App, Setting), user.
- **Top toolbar:**
  - stepper (Build, Add sender profiles, Add contacts, Launch);
  - Back and Next step;
  - save status ("Last save 2 mins ago"), refresh, Publish, avatar.
- **Canvas:**
  - dotted grid;
  - undo/redo, zoom (100%), fit and fullscreen at the top left;
  - "View logs" at the top right;
  - floating tool palette at the bottom (select, pan, configure, connect, layout).
- **Nodes:** white cards with icon tile, title and subtitle, a "Draft" tag, a kebab menu, and a metric chip row.
- **Edges:** right-angle connectors with **labelled pills** ("Initialize data", "Execute triggered").
- **Inspector (right):**
  - collapsible sections: real-time metrics with sparklines, model status, environment select, error details, read-only output with copy, a slider, a dependency tree;
  - sticky primary action at the bottom.
- **Adaptation:**
  - Use the GrowthPrint primary instead of indigo.
  - Implementation requires backend B7 (no workflow backend exists).
  - Until then, the Automation tab keeps its honest "not connected" state.
  - The studio is documented and prototyped only.

### C. Aurevo: public website (secondary)
- **Adopt the composition:**
  - centered hero with a small announcement pill;
  - 64px two-line headline;
  - one-line supporting copy;
  - primary and secondary CTA;
  - three trust ticks;
  - a framed showcase panel below the fold line.
- **Change for GrowthPrint:**
  - no purple/pink gradient text or glowing blobs;
  - the headline is solid `text`, with an optional second line in `primary-strong`;
  - the showcase shows **services and delivery evidence**, not the internal dashboard;
  - trust ticks are true statements (written scope before work starts, 30-day defect warranty, reply within one business day).

## 2. Principles
1. COMPREO proportions first: six KPIs, 3×2 analytics, white chrome, teal for action and selection only.
2. Truthful data. Unsupported widgets show labelled real interims or "not connected", never invented numbers.
3. One component per job (COMPONENT-INVENTORY.md).
4. Accessibility: AA contrast (darker on-white variants), keyboard paths, one `h1` per page, focus visible.
5. Behaviour untouched: presentation-only changes to existing modules; new capabilities only after the backend is approved.

## 3. Page compositions
| Page | Composition |
|---|---|
| **Dashboard** | PageHeader (greeting, date filter). KPI row ×6: active projects, total leads, active clients, open milestones *(tasks after B2)*, open proposals, outstanding invoices. Row 1: project trend *(interim: projects by target month)*, revenue by service (accepted proposal value), lead sources. Row 2: project status distribution, milestone performance *(tasks after B2)*, collected vs invoiced *(revenue and expenses after B5)*. Tables: active projects, recent leads, upcoming milestones |
| **Leads (business development)** | Summary strip (total, qualified, ready for outreach, new this month). Toolbar (search, stage, source, score filters). Prospect table (company, source, score, service fit, contact availability, stage, next action). Details **drawer** with a research evidence section separated from scoring |
| **Clients** | Summary strip. Directory table. Details drawer or page: profile, contacts, related projects, invoices and proposals (joined by `clientId`), activity *(after B6)* |
| **Projects** | Summary strip by status. Table (project, client, status, progress, target date, lead). Detail with milestones timeline, budget used/total, deliverables |
| **Tasks** | Not present; requires B2. Then list and kanban |
| **Proposals & invoices** | Summary metrics (outstanding, overdue, paid this month, open proposals). Financial tables (right-aligned tabular money). Document preview drawer. Existing PDF/CSV/JSON actions kept |
| **Outreach** | Three-column: queue, research context, draft editor and preview with an explicit approval state. Never sends without the existing human approval |
| **Automation Studio** | Reference B, after B7 |
| **Analytics** | Filter bar (period, service, client) and chart grid built from existing endpoints; data tables under each chart |
| **Settings & admin** | Left settings sub-navigation and grouped form panels |
| **Client portal** | Same shell (white sidebar), client-only navigation, same components |
| **Auth** | Two columns: brand panel (teal-tinted, plain statements) and a form card. Labels, password visibility, validation, loading and error states (existing logic) |

## 4. Responsive behaviour
| Width | Layout |
|---|---|
| ≥1536 | 6 KPIs in a row; 3-column analytics |
| 1280–1535 | 6 KPIs (compact) or 3×2; 3-column analytics |
| 768–1279 | Icon rail; KPIs 3×2; analytics 2 columns then 1; drawers full height |
| <768 | Drawer navigation; KPIs 2 columns; single column; tables scroll inside panels; no page overflow |
