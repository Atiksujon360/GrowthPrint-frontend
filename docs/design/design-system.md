# GrowthPrint design system

There is one token layer, in `app/globals.css` (Tailwind v4 `@theme`), with two scopes:
- `.gp-marketing`: the public site. Tokens are `--color-mk-*`; dark by default, with a designed light theme.
- `.gp-app`: the Studio, Client Hub, workspace and sign-in screens. Tokens are `--color-gp-*`, with brand and neutral scales. The light theme is complete; dark is planned (see `theme-guidelines.md`).

Both scopes use the same brand palette, the same logo (`BrandMark`) and the same semantic roles.

## Semantic tokens
| Role | Marketing dark | Marketing light | App (light) | Notes |
|---|---|---|---|---|
| Background | `#080710` | `#F8F7FC` | `#F8F7FC` (`gp-canvas`) | |
| Secondary surface | `#100D1B` | `#FFFFFF` | `#FFFFFF` (`gp-surface`) | |
| Surface | `#171323` | `#F1EEF8` | `#F1EEF8` (`gp-divider` / `ink-100`) | |
| Elevated | `#201A30` | `#FFFFFF` | `#FFFFFF` | |
| Text | `#F7F5FC` (18:1) | `#191329` (16:1) | `#191329` | |
| Muted text | `#B5AEC4` (9.6:1) | `#686276` (5.6:1) | `#686276` (5.8:1) | |
| Dim text | `#8F87A0` (5.7:1) | `#736D82` (4.7:1) | `#736D82` (4.9:1) | Small captions only |
| Border | white 12 % | `#E7E2EF` | `#E7E2EF` | |
| Primary | `#7426C9` | `#7426C9` | `#7426C9` | White text on it: 7.3:1 |
| Accent text | `#9B6BFF` | `#7426C9` | `#7426C9` | |
| Success | | | `#1E7D45` | |
| Warning | | | `#8F5B0A` | |
| Danger | `#FF9DB3` | `#B42335` | `#C23B42` | |
| Info | | | `#2A62A0` | |
| Focus ring | `#9B6BFF`, 2 px, offset 3 | `#7426C9` | `#7426C9` | |

Contrast ratios are against the background of the same theme. They were calculated with the WCAG 2.2 relative-luminance formula; the method is noted in `ui-consistency-report.md`.

## Legacy class mapping
Inside `.gp-app`, the old utility scales (`blue`, `indigo`, `sky`, `mint`, `purple`, `violet`) all point at the brand scale, and `slate` points at the violet-tinted neutrals. Existing screens therefore pick up the official palette without code changes. New code should use `gp-*` tokens.

## Shared components
| Component | Path | Notes |
|---|---|---|
| BrandMark | `components/marketing/BrandMark.tsx` | The official mark. `GrowthPrintMark` now renders it, for older imports. |
| ThemeSwitcher | `components/ui/ThemeSwitcher.tsx` | Dark, light and system as a radio group (arrow keys); persists choice. |
| AppShell | `components/shell/AppShell.tsx` | Studio, portal and workspace frame: sidebar, top bar, user menu. |
| KpiCard, Panel, SummaryStrip, MiniStat, Sparkline | `components/ui/app-kit.tsx` | Dashboards. |
| DataTable | `components/ui/DataTable.tsx` | Search, filters, sort, pagination, CSV export, keyboard rows. |
| DetailDrawer, DrawerSection, FactList | `components/ui/DetailDrawer.tsx` | Accessible side sheet. |
| ConfirmDialog | `components/ui/ConfirmDialog.tsx` | Alert dialog for destructive or irreversible actions. |
| Charts | `components/charts/GpCharts.tsx`, `lazy.tsx` | Recharts presets, lazy loaded. |
| Toasts | `components/ui/ToastContainer.tsx` | Mounted in the Studio and portal layouts. |
| Marketing sections | `components/marketing/*` | Homepage only. |

There are no shadcn/ui components in this repository, so none were added: adding the library would be a new dependency. The existing kit covers the roles listed in the brief. Missing, and planned: Breadcrumb, DatePicker, a dedicated Pagination component (pagination currently lives inside DataTable) and Tabs.
