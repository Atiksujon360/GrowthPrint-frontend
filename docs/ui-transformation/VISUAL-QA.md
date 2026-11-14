# Visual QA log

## Prototype review (2026-11-09)
Rendered from `prototypes/*.html` with Playwright (Chromium) to `prototypes/screenshots/`.

| Prototype | Reference | Size | Findings |
|---|---|---|---|
| `dashboard.png` | A (COMPREO) | 1536×1024, full page | Matches the composition: white sidebar with icon tiles and solid teal active item, minimal top bar, 26px greeting with period filter, six KPI cards with icon tile, label, value and delta, 3×2 analytics (area, donut with centre total, horizontal bars, donut, grouped bars, combo), operational tables. Interim widgets are labelled (milestones, target month, collected vs invoiced) |
| `dashboard-mobile.png` | A | 390×844 | **Not responsive.** The prototype is desktop-only; the mobile layout comes with the real implementation (spec §4) |
| `automation-studio.png` | B (Synthex) | 1440×900 | Three panels, stepper toolbar, save state, dotted canvas with controls, nodes with draft tags and run chips, labelled edges, bottom dock, inspector sections, sticky primary action. The dock uses glyph placeholders, to be replaced by Lucide icons when implemented |
| `login.png` | A tone | 1440×900 | Teal-tinted brand panel with true statements, form card with label, required marker, error state, password "Show", primary button `#117F76` |
| `home.png` | C (Aurevo) | 1440×900 | Centred hero, pill, two-tone headline (solid, no gradient text), two CTAs, three true trust ticks, showcase of services and delivery steps (not the internal dashboard), technology strip |

## Implementation screenshots
To be recorded per phase: `docs/design/screenshots/after/` (studio, portal and workspace captures; desktop, tablet and mobile).
