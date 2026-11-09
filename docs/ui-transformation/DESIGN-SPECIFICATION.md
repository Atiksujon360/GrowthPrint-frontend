# GrowthPrint enterprise UI: design specification (proposal, awaiting approval)

Source of direction: the GrowthPrint Enterprise UI Implementation Kit (owner-supplied). Reference files stay outside
the repository (`Downloads/GrowthPrint-Enterprise-UI-Implementation-Kit/.../references/`) because they show
third-party designs. They are used for analysis only.

## 1. Reference analysis

### A. Enterprise ERP dashboard: the internal application
| Element | Observed | GrowthPrint adaptation |
|---|---|---|
| Sidebar | ~215px deep navy; white 14px labels with outline icons; active item a lighter navy block (8px radius); a second "Quick links" group under a hairline | 240px navy `#10264A`; groups (Overview, Growth, Delivery, System, Account); active `#244675`; a quick-actions group only where real actions exist (New record, Submit request) |
| Top bar | ~64px white; hamburger, page title "Dashboard" plus muted "Welcome back, name"; context selector (company); search, bell with count, help, settings icons; avatar with chevron | Same anatomy: title and greeting; **business switcher** in the workspace; search (command palette); notifications; shortcuts (help); settings; avatar menu with sign-out |
| Primary action | A single "New" button with a menu, in the page area at the top right | One primary "New record" / "Submit request" / "New lead" per page, in the page header. The reference's orange is not adopted (decision D1) |
| KPI cards | Six across; label with a small trend arrow; value about 24px; soft-tinted circular icon at the top right; "+12.5% vs last month" in green or red | Four to six per page, **only with real values**. The delta appears only when a real previous period exists; otherwise a plain context line |
| Charts | Line with soft area fill and a dashed "last year" comparison; donut with a legend list; period dropdown at the top right of each panel | Recharts: one brand series plus a neutral comparison; a period selector only where data supports it; a legend list instead of rainbow colours |
| Lists | "Recent activities" with coloured icon dots, title, metadata, relative time, and "View all" | Activity feed component, one neutral style plus semantic dot colours |
| Tables | Titled panel with an icon; compact rows (~40px); muted header; blue links for IDs; soft status chips (Paid green, Pending amber, Overdue red); "Showing 1 to 5 of 25 entries"; numbered pagination | DataTable restyle exactly along these lines |
| Surfaces | Page `#F5F7FA`-ish; white cards with 1px border, about 8px radius, near-invisible shadow | Tokens below |

### B. Workflow automation studio: a node editor only
| Element | Observed |
|---|---|
| Shell | Inset panels on a light grey frame: light left nav with collapsible groups, editor toolbar with a stepper (Build, Add Sender Profiles, Add Contacts, Launch), Back / Next step, save state ("Last save 2 mins ago"), Publish |
| Canvas | Dotted grid; zoom, undo/redo and fit controls at the top left; a floating tool palette at the bottom (select, pan, settings, connect, layout) |
| Nodes | White cards, 1px border, icon tile, title and subtitle, "Draft" tag, metric chips; labelled, colour-coded connectors |
| Inspector | Right panel with sections (metrics with sparklines, model status, environment select, error details, read-only output, temperature slider, dependency tree) and a primary action at the bottom |

**Applicability:** GrowthPrint has **no workflow editor and no automation backend in MVP1** (see the audit). This layout is
specified here so it can be built when the backend provides workflow graphs (decision D4). It is not applied to CRUD
pages.

## 2. Design principles
1. **Information first.** Hierarchy comes from type weight, alignment and spacing, not colour or decoration.
2. **Colour means something.** Blue (or brand teal, see D1) for actions and selection; green success; amber warning; red danger; everything else neutral.
3. **Dense but calm.** 8px rhythm, compact tables, no oversized empty cards.
4. **One way to do each thing.** One button, badge, table, card and dialog style across studio, portal and workspace.
5. **Truthful data.** No fabricated KPIs, deltas or progress. Unsupported widgets are omitted, not mocked.
6. **Behaviour preserved.** Presentation changes only; props, callbacks, API calls and permissions are untouched.

## 3. Tokens
The kit's tokens are adopted with one open decision (D1). They are scoped to the application only, so the public site
keeps its own palette.

| Token | Value | Use |
|---|---|---|
| `gp-canvas` | `#F5F7FA` (kit `#F7F8FA`; slightly cooler to match reference A) | Page background |
| `gp-surface` | `#FFFFFF` | Cards, tables, top bar |
| `gp-sidebar` / `-hover` / `-active` | `#10264A` / `#19365F` / `#244675` | Navigation rail |
| `gp-primary` / `-hover` / `-soft` | **D1-a** `#3569C8` / `#2858AE` / `#EDF3FC`, or **D1-b** `#0C826C` / `#0B6858` / `#ECFBF6` | Primary actions, links, selected states, focus ring |
| `gp-text` / `-secondary` / `-muted` | `#172033` / `#667085` / `#98A2B3` (muted used only at 14px or larger, or for disabled text) | Text |
| `gp-border` / `gp-divider` | `#E5E9F0` / `#EEF1F5` | 1px borders and row dividers |
| success | `#16845B` on `#EAF6F0` | Paid, completed, active |
| warning | `#A86B13` on `#FFF5E5` | Pending, awaiting approval |
| danger | `#C24145` on `#FDEEEF` | Overdue, failed, destructive |
| info | primary on primary-soft | Neutral informational |
| radius | card 10px; control 7px; badge 6px; avatar full | Replaces the current 16px/12px |
| shadow | `0 1px 2px rgb(16 24 40 / .04)` for cards; `0 12px 32px -12px rgb(16 24 40 / .18)` for popovers and dialogs only | |

**Implementation technique:** Tailwind v4 utilities read CSS variables. An app-scope class (`.gp-app`) on the three
app shells re-points the existing `brand-*`, `blue-*` and `ink-*` scales to these tokens. Every existing view then
adopts the new palette without editing hundreds of class names, and the public site is unaffected.

## 4. Typography
| Role | Size / weight | Notes |
|---|---|---|
| Page title (top bar) | 20px / 600 | Reference style: title plus muted greeting on one line |
| Page heading in content (optional) | 24px / 600 | Dashboard greeting only |
| Section / panel title | 15px / 600 | |
| Card title / label | 13px / 500–600 | |
| Body | 14px / 400 | |
| Table body | 13px; header 12px / 500, `gp-text-secondary` | Sentence case, no uppercase tracking |
| Metadata | 12px | |
| KPI value | 26px / 600, `tabular-nums` | |
| Navigation | 13.5px / 500 | |

Family:
- **D2:** Inter for the whole application, self-hosted with `next/font` and scoped to the app shells.
- The public site keeps its display face unless the owner prefers Inter everywhere.
- `tabular-nums` applies to money, counts, dates and IDs.

## 5. Spacing and density
- 8px rhythm with 4px steps.
- Content padding: 24–32px on desktop, 16–20px on tablet, 16px on mobile.
- Card padding: 20px.
- Table rows: about 44px (13px text, 12px vertical padding).
- Grid gap: 16px between cards and 24px between sections.
- Maximum content width: 1600px.

## 6. Shell
- **Sidebar:**
  - 240px navy rail: 64px brand row (mark plus "GrowthPrint"), nav groups with 12px muted group labels, 40px items with an 18px icon.
  - Active item: `gp-sidebar-active` background and white text. Hover: `gp-sidebar-hover`.
  - Count badges: small white-on-blue or amber pills.
  - Footer: user card and sign-out.
  - Workspace adds the business switcher at the top. Portal adds the client organisation card and a "Submit request" button.
  - **Tablet (768–1279px):** collapses to a 72px icon rail with tooltips.
  - **Mobile:** off-canvas drawer, as now.
- **Top bar:**
  - 64px white with a bottom border.
  - Left: menu button (mobile/tablet), page title, muted subtitle or greeting.
  - Right: context selector (business switcher in the workspace), search (opens the command palette), notifications, shortcuts/help, settings, avatar menu.
- **Page header** (inside content): optional breadcrumb; actions right-aligned (primary button plus secondary).

## 7. Components
- **Card / panel:** white, 1px border, 10px radius, 20px padding. The header row holds title, description and an action or period select, separated by a divider.
- **KPI card:**
  - label at the top left, soft-tinted 36px circular icon at the top right, 26px value;
  - delta row ("▲ 12.5% vs last month") only when a real comparison exists;
  - the whole card is a button when it navigates.
- **Data table:**
  - panel title row with icon, title, count, "Export CSV" and "View all";
  - search and filters toolbar;
  - header row on `gp-canvas`, 12px secondary text, sort icons on hover;
  - 44px rows with a divider;
  - ID and link cells in primary colour; money right-aligned and tabular;
  - status chips: soft fill, 6px radius, sentence case;
  - footer "Showing 1 to 10 of 25 entries" with numbered pagination (prev, 1, 2, 3, …, next).
- **Status badge:** semantic tone map (success, warning, danger, info, neutral). No raw codes; `humanizeCode` is already in place.
- **Buttons:**
  - primary: filled, 7px radius, 36px height (40px on touch);
  - secondary: white with a border;
  - ghost, danger;
  - icon button: 36px square.
  - No pill buttons in the app.
- **Inputs and selects:** 36px height, 7px radius, 1px border, primary focus ring (2px, offset 1px). Errors use danger text and border.
- **Dialogs:** 12px radius, popover shadow, header, body and footer with right-aligned actions. Focus trap and Escape (already in the workspace kit).
- **Drawers:** right side, 480px, for record detail where a view already uses an inspector.
- **Tabs:** underline style with the primary indicator.
- **Toasts:** bottom right, neutral with a semantic icon.
- **Empty, loading and error states:**
  - empty: one line of explanation and one action;
  - loading: skeleton rows matching the final layout;
  - error: a Notice with a retry button.

## 8. Charts
- Primary series: `gp-primary` solid line with a 12% area fill.
- Comparison: `#98A2B3` dashed.
- Bars: primary plus `#CBD5E1`.
- Donut: at most five semantic or primary tints plus a legend list with values.
- Axes: 12px secondary text, no axis lines, horizontal gridlines `gp-divider`.
- Tooltips: white with border.
- No rainbow palettes.

## 9. Responsive behaviour
| Width | Layout |
|---|---|
| ≥1280 | Full sidebar; KPI rows of 4–6; two- or three-column panels; inspector side-by-side |
| 768–1279 | Icon rail; KPI 2×2 or 3×2; panels stack to a single column at 1024 and below; inspector becomes a right drawer |
| <768 | Drawer navigation; single column; tables scroll horizontally inside their panel; no page-level horizontal overflow; 44px touch targets |

## 10. Iconography
- Lucide only, at 18px in navigation and 16px inline, stroke width 1.75.
- Icons in coloured circles appear only on KPI cards and in activity feeds (as in reference A).

## 11. Accessibility (WCAG 2.2 AA)
- Body text contrast at least 4.5:1. `#98A2B3` on white fails for small text, so it is limited to 14px+ or disabled text.
- Visible focus on every control.
- Landmarks: nav, header, main.
- One `h1` per page (the top bar title).
- Dialogs: role, label, focus trap and Escape.
- Menus: arrow-key support.
- Tables: captions and `scope`.
- Status is never conveyed by colour alone (text label always present).
- Reduced motion respected.

## 12. Module patterns
| Module | Pattern |
|---|---|
| Studio dashboard | KPI row (cash collected, open pipeline, active clients, active projects, receivables, overdue), cash chart and pipeline breakdown, recent activity (demo-only until the API exists), "Needs your attention" table, support/projects summary |
| Leads & CRM | Table with stage, score, service, contact and next action; inspector as a right panel or drawer with evidence (research notes) clearly separated from scores |
| Outreach approvals | Draft queue table, then a preview/editor pane with an explicit approval state. Never auto-send |
| Clients | Table, then a client profile drawer (contacts, retainer, related projects/invoices where loaded) |
| Projects | Table with progress (real values only), client, status and dates; detail with milestones and deliverables |
| Support queue | Ticket table, then a triage inspector (existing estimate flow) |
| Invoices & revenue | Financial table (right-aligned tabular money), status chips, existing PDF/CSV/JSON actions, payment reports panel |
| Activity log | Timeline list with filters (demo-only data) |
| AI providers, Team, Settings | Grouped settings forms in panels |
| Automation | Current list view restyled. Studio canvas deferred (D4) |
| Client portal | Same shell and components; client-scoped navigation and data only |
| Workspace (MVP2) | Same shell plus business switcher in the top bar |
| Public website | Out of the kit's scope (decision D3) |
