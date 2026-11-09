# GrowthPrint complete redesign: report

**Status (2026-11-09):**
- Public website: done.
- App shells (studio, client hub, workspace) and the studio dashboard: done.
- Every other app screen: restyled through shared components and a class-only consistency pass, but **not individually re-composed** (see section 19).
- Nexora screenshot: never received. On the CEO's instruction ("Go without it"), the app follows the **written** Nexora description in the brief: persistent left sidebar, white and cool-grey surfaces, compact header with title and subtitle, search, notifications and profile, a four-KPI row with trend charts, a main chart with a breakdown panel, recent activity, and a task overview.

Branch: `feature/growthprint-complete-design-transformation`, created from `b16f8ce` with a clean tree. Nothing has
been committed, pushed or deployed. The backend repository was not touched.

## 1. Executive summary
- **Public website:** a "blueprint" identity:
  - framed page grid with guide lines;
  - Stripe-style two-tone headlines in Schibsted Grotesk;
  - one self-drawing system diagram as the hero moment;
  - a services explorer;
  - illustrative work shown as diagrams instead of stock photos;
  - a six-step process on navy;
  - stated commitments and an accessible FAQ.
- **Sign-in, recovery and invitation pages:** one new AuthShell.
- **App:** one Nexora-style shell language across all three areas:
  - light sidebar with grouped navigation, count badges, and user card with sign-out;
  - sticky header with page title and subtitle, search and command palette, sync status, notifications, shortcuts and "New record";
  - slide-in drawer on mobile.
- **Studio dashboard rebuilt:**
  - four KPI cards (with a real month-over-month change and sparkline for cash);
  - a secondary metrics strip;
  - main cash chart plus pipeline breakdown;
  - a task table built from live data;
  - recent activity.
- **Removed fake numbers:**
  - "Automations: 5 Active" (hard-coded) is gone.
  - "Average conversion … 33%" (hard-coded) is now calculated from the funnel.
- **Behaviour is unchanged:** no edits to `store/`, `lib/api/`, slices, thunks, services, routes or guards.

## 2. Skills and tools
| Item | Status | Use |
|---|---|---|
| `ui-ux-pro-max` | Already installed (`~/.claude/skills/ui-ux-pro-max`); `npx skills add` not re-run | Typography and UX rules |
| `frontend-design` | Available; instructions read | Design plan, anti-template review, "one bold element", motion restraint |
| Playwright | Available | Before/after capture, reference capture, smoke checks, all e2e runs |
| Context7 MCP (required by AGENTS.md) | **Not available** | Relied on installed versions and type definitions |
| Emil Kowalski animation skill, visual-regression service | **Not available** | Manual before/after comparison |
| Nexora screenshot | **Not received** | Written description used, as the CEO approved |

## 3. References
`GROWTHPRINT-DESIGN-REFERENCE-LIBRARY.md`:
- Captured: Stripe, Linear, Vercel, Attio, Raycast and three Dribbble searches.
- Not reviewed: Awwwards, Framer and Notion.

## 4–5. Creative direction and design system
See `GROWTHPRINT-DESIGN-SYSTEM.md`. New app-side component: `components/ui/app-kit.tsx` (`Panel`, `KpiCard`,
`Sparkline`, `MiniStat`, `percentChange`).

## 6. Public routes
| Route | Status |
|---|---|
| `/` (header, hero, technology strip, services, work, process, why, FAQ, footer) | Done |
| Quote inquiry modal (class-only changes) | Done |
| `/studio/ops/login`, `/client-hub/login`, `/forgot-password`, `/reset-password`, `/accept-invite`, `/join-business` | Done (AuthShell) |

## 7. Application routes
| Area | Status |
|---|---|
| Studio shell (`AdminLayout`) | **Done**: rebuilt presentation; same props, tabs, permission filter, palette, quick create, notifications, shortcuts, sign-out |
| Studio dashboard | **Done**: Nexora layout from real data |
| Studio tabs: Leads, Outreach, Clients, Projects, Support, Invoices, Automation, Activity, AI providers, Team, Settings | **Partial**: new shell; shared `StatCard` and `DataTable` restyled; class-only pass (no tiny text, no all-caps labels, display headings, no card shadows). Inner layouts are the original ones |
| Client hub shell (`PortalLayout`) | **Done**: now has a mobile drawer (it used to stack the whole sidebar above the content) |
| Client hub screens | **Partial**: same as the studio tabs |
| Workspace shell (`WorkspaceShell`) | **Done**: light sidebar, matching the other two |
| Workspace screens (Command Centre, clients, leads, team, activity, settings, onboarding) | **Done** through the kit: display titles, KPI cards, filters |

## 8. Components
- **New:** `GrowthPrintMark`, `BlueprintDrawing`, `components/ui/app-kit.tsx`, `playwright.capture.config.ts`, `tests/visual-capture.spec.ts` (opt-in with `GP_CAPTURE`).
- **Rewritten (same exports and props):** `PublicHeader`, `HeroSection`, `ServicesSection`, `CaseStudiesSection`, `HowWeWorkSection`, `TrustSection`, `FAQSection`, `PublicFooter`, `AuthShell`, `AdminLayout`, `AdminDashboard`, `PortalLayout`.
- **Edited:**
  - `WorkspaceShell` (classes)
  - `workspace-kit.tsx` (PageHeader, StatCard, filters)
  - `Badges.tsx` StatCard (same API)
  - `DataTable.tsx` (toolbar stacks until 2xl; search label)
  - `CommandPalette.tsx` and `QuickCreateModal.tsx` (dialog role; Escape closes Quick create)
  - `globals.css` (tokens, `.gp-frame`, flat `.glass-card`)
  - `app/layout.tsx` (fonts)
  - class-only pass over 30 view files in `features/admin`, `features/portal`, `features/settings` and `components/ui`

## 9. Motion
- **Public:** the hero blueprint draws in once; the services tab indicator slides; the FAQ expands.
- **App:**
  - the drawer slides in (220ms, standard easing);
  - the funnel bars transition their width;
  - the old spring and hover-scale effects were removed from the shells and shared cards.
- Reduced motion is respected through the global rule and specific overrides.

## 10. Screenshots
- `docs/design/screenshots/before/` (24 images) and `after/` (35 images).
- `after/` includes every studio tab at desktop width plus the client hub.
- Reference captures are in `docs/design/references/`.

## 11–13. Functional preservation evidence
| Check | Result |
|---|---|
| Public inquiry: header button opens the dialog, form fills, Cancel closes (`public-inquiry.spec` #1) | PASS |
| Auth and routes (`auth-and-routes.spec`, 12 tests) | PASS |
| Workspace workflows (`mvp2-workspace.spec`, 7 tests) | PASS |
| All 11 studio tabs open from the new sidebar (capture spec clicks each) | PASS |
| Command palette opens, Escape closes | PASS |
| Quick create opens, Escape closes | PASS |
| Keyboard shortcuts dialog, notifications | PASS |
| Sidebar tab changes the header title and subtitle | PASS |
| Mobile drawer: opens, focus moves inside, closes after navigation and on Escape | PASS |
| No horizontal overflow at 390px (studio) and 390/1440px (public) | PASS |
| Browser console: page errors during smoke runs | None |
| API calls, Redux slices and thunks | Unchanged (not edited) |

## 14. Responsive and accessibility
- Layouts were checked at 1440, 768 and 390.
- Improvements made:
  - dialog roles for the command palette and Quick create;
  - Escape closes Quick create;
  - the data-table search has a label;
  - nav badges read as "3 new" to screen readers;
  - minimum text size raised to 12px across app views;
  - services tabs follow the WAI-ARIA pattern;
  - the FAQ has `aria-controls`.
- The mobile dashboard task table now shows each action under its task.

## 15. Performance
- Fonts are self-hosted with `next/font`.
- The hero is inline SVG with CSS animation.
- Stock JPEGs were removed from the home page.
- Motion effects were removed from shells and cards (less JavaScript animation work per render).
- No new dependencies.

## 16. Automated tests
| Check | Baseline | Final |
|---|---|---|
| `tsc --noEmit` | PASS | PASS |
| `npm test` | 133/133 | 133/133 |
| `npm run build` (real env) | PASS | PASS |
| `npm run build` (demo env) | PASS | PASS |
| Playwright full suite | backend-dependent tests failing | **19 passed, 4 failed**: the same 4 tests that need a live backend (`admin-login`, `client-login`, `admin-create-project`, inquiry submit). PRE-EXISTING ISSUE / NOT TESTED |

## 17. Pre-existing issues fixed or found
- **Header links:** two pointed nowhere. Fixed.
- **Footer "links":** three had no destination. Removed.
- **Stock photos with people:** replaced.
- **Hard-coded dashboard figures:** two of them. Removed or computed.
- **Accessibility:** the command palette and Quick create had no dialog semantics, and Quick create had no Escape. Fixed.
- **Client hub on mobile:** stacked the entire sidebar above the content. Fixed.
- **Client hub dashboard:** slow, staggered entrance animations. Not changed; noted.

## 18. New issues
None found.

## 19. Unfinished work (continuation checklist)
- [ ] Re-compose the inner layout of each studio tab (Leads inspector split, Outreach, Clients, Projects, Support queue, Invoices, Automation, Activity, AI providers, Users & team, Settings) to the dashboard's Panel and table grammar. They currently use the new shell, cards and type, but their original structure.
- [ ] The same for the client hub screens, including removing their staggered entrance animations.
- [ ] Compare against the actual Nexora screenshot if it is supplied, and adjust.
- [ ] Tablet (768) and 1280 screenshots for every studio tab; a second refinement pass per tab.
- [ ] Privacy, terms and security pages (content needed from GrowthPrint).
- [ ] Run the 4 backend-dependent e2e tests against an isolated backend (never the Render database).
