# Research and tooling (Phase 1)

## Sources actually reviewed in this session
| Source | How | What was learned |
|---|---|---|
| Kit reference A: enterprise ERP dashboard (owner screenshot) | Visual analysis (DESIGN-SPECIFICATION.md §1) | Navy rail, white workspace, KPI row, line/donut charts, activity list, dense tables with soft status chips, numbered pagination |
| Kit reference B: workflow automation studio (owner screenshot) | Visual analysis | Editor shell, dotted canvas, node cards, labelled connectors, right inspector, floating tool palette |
| stripe.com, linear.app, vercel.com, attio.com, raycast.com | Playwright screenshots (`docs/design/references/`) | Earlier public-site research |
| Dribbble searches: SaaS CRM dashboard, business dashboard, agency website | Playwright screenshots | KPI and table density patterns |
| Vercel React Best Practices skill (`~/.agents/skills/vercel-react-best-practices`) | Read | Relevant rules: `bundle-barrel-imports`, `bundle-dynamic-imports`, `rerender-*` |
| Anthropic Frontend Design skill | Read | Design-plan discipline; avoid templated defaults; one bold element; restrained motion |

**Not accessed** (stated honestly):
- Mobbin, SaaSFrame and Figma Community need accounts or paid tiers for full browsing; nothing was signed into or downloaded.
- The two Dribbble shots named in the master prompt were not opened in this pass.
- Untitled UI, Tailwind Plus and shadcn/ui pages: licence and pricing below are from general knowledge and **must be re-checked before any purchase or adoption**.
- **Web Design Guidelines skill:** not installed in this environment, so the final audit will use the kit's QA checklist plus WCAG 2.2 AA checks instead.
- **Context7:** not connected, so library APIs will be checked against the installed packages' own type definitions.

## Candidate comparison
| Candidate | Purpose | Repo equivalent today | Licence | Cost | Recommendation |
|---|---|---|---|---|---|
| **Lucide React** | Icons | Installed (0.546), the only icon set | ISC | Free | **Reuse.** Keep one icon family |
| **Recharts** | Charts | Installed (3.10.1), used on the dashboard | MIT | Free | **Reuse.** Restyle to the restrained palette; load with `next/dynamic` |
| **Inter** (via `next/font/google`) | Interface typeface the kit recommends | Not used (Hanken and Schibsted Grotesk added this session) | SIL OFL 1.1 | Free | **Adopt for the app** (decision D2) |
| **Playwright** | e2e and visual snapshots | Installed (1.64) plus capture spec | Apache-2.0 | Free | **Reuse.** Add `toHaveScreenshot` baselines for representative routes |
| **TanStack Table** | Headless table logic | Custom `DataTable` covers sort, search, filter, paginate, export | MIT | Free | **Reject for now.** The existing table works; restyle it instead |
| **Radix UI primitives** | Accessible dropdown, popover, tabs, tooltip | Hand-rolled (some lack full keyboard support, e.g. the user and notification menus) | MIT | Free | **Adopt selectively, only with approval:** `@radix-ui/react-dropdown-menu` and `@radix-ui/react-popover` for the user menu and notifications if the hand-rolled versions can't meet keyboard requirements. Otherwise reject |
| **shadcn/ui** | Source-owned components (copied in, built on Radix) | Own kit (`forms.tsx`, `workspace-kit.tsx`, `app-kit.tsx`) | MIT | Free | **Reject as a package.** It would duplicate the existing kit. Patterns may be borrowed by hand |
| **Untitled UI React** (free tier) | Component library on React Aria + Tailwind v4 | Own kit | Free tier is open source; PRO is paid (verify) | Free / paid | **Reject.** Second design system, large dependency surface |
| **Tailwind Plus application UI** | Paid UI blocks | — | Commercial | Paid (verify current price) | **Reject unless the owner approves a purchase.** Not needed |
| **React Flow (`@xyflow/react`)** | Node-based automation canvas | None. **No automation backend or graph schema exists in MVP1** | MIT (Pro subscription optional) | Free core | **Defer.** Adopt only when the backend defines a workflow graph; then use it for reference B |
| **Mobbin / SaaSFrame / Figma Community** | Pattern research | — | Proprietary / per-file | Freemium | Research only; no assets reused |

**Net new dependencies proposed now: none required.** Optional:
- Inter, a font that costs nothing extra to ship through `next/font`;
- up to two Radix packages, only with approval.
