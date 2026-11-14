# Design tokens (COMPREO direction; proposal)

These start from the master prompt's palette, refined against the COMPREO screenshot and **WCAG 2.2 AA contrast**.
Several proposed colours are too light for small text on white, so each has an *on-white* text variant.
Contrast ratios are computed from relative luminance against `#FFFFFF`.

## Colour
| Token | Value | Contrast on white | Use |
|---|---|---|---|
| `primary` | `#159F91` | 3.3:1 | Fills where text is large, icons, chart primary series, focus ring |
| `primary-strong` | `#117F76` | **4.9:1** | Primary button background (white text), active nav background, links, selected text |
| `primary-hover` | `#0E6C64` | 6.3:1 | Hover and pressed |
| `primary-soft` | `#E9F6F4` | — | Icon tiles, selected rows, soft badges |
| `canvas` | `#FAFBFC` | — | Page background |
| `surface` | `#FFFFFF` | — | Sidebar, top bar, cards, tables |
| `text` | `#17212B` | 16:1 | Primary text |
| `text-secondary` | `#66717D` | 4.9:1 | Secondary text, table headers |
| `text-muted` | `#8A949E` | 3.1:1 | Placeholders and disabled only (never body text) |
| `border` | `#E8ECEF` | — | 1px borders |
| `divider` | `#F0F2F4` | — | Row dividers |
| `success` / text / soft | `#269B55` / `#1E7D45` (4.9:1) / `#E9F6EE` | | Paid, completed, positive delta |
| `warning` / text / soft | `#E5A12B` / `#8F5B0A` (5.6:1) / `#FDF4E3` | | Pending, awaiting approval |
| `danger` / text / soft | `#D94B52` / `#C23B42` (5.3:1) / `#FCECED` | | Overdue, failed, destructive, negative delta |
| `info` / text / soft | `#2F6FB5` / `#2A62A0` (6.3:1) / `#EAF1F9` | | Neutral information |
| `sidebar-icon-tile` | `primary-soft` background with `primary-strong` icon | | COMPREO nav icon tiles |

**Chart palette** (categorical, at most five, in this order):
1. `#159F91` teal
2. `#2F6FB5` blue
3. `#E58A2B` orange
4. `#6B5FB5` muted violet (only as the fourth category)
5. `#98A2AD` grey

Single-series charts use teal only. "Previous period" is grey dashed.

## Typography
Inter (self-hosted with `next/font`; already wired as `--font-inter`). Tabular numerals for money, counts, dates and IDs.

| Role | Size / line / weight |
|---|---|
| Display (public hero) | clamp(40px, 6vw, 64px) / 1.05 / 700 |
| Page heading ("Welcome back, …") | 26px / 1.25 / 700 |
| Section heading | 18px / 1.4 / 600 |
| Card / panel heading | 15px / 1.4 / 600 |
| Body | 14px / 1.55 / 400 |
| Secondary | 13px / 1.5 / 400 |
| Label | 13px / 1.4 / 500 |
| Table text / header | 13px / 1.45 / 400; header 12.5px / 500 secondary |
| KPI value | 24px / 1.2 / 700 tabular |
| KPI delta | 12.5px / 500 |
| Nav item | 14px / 500 |

## Layout
| Token | Value |
|---|---|
| Sidebar | 240px (≥1280); 72px icon rail (768–1279); drawer (<768) |
| Top bar | 72px (COMPREO has a tall, airy bar) |
| Content max width | 1600px |
| Content padding | 32px desktop, 24px tablet, 16px mobile |
| Grid | 12 columns, 20px gap; KPI row 6 / 3 / 2 / 1 across; analytics rows 3 / 2 / 1 |
| Spacing scale | 4, 8, 12, 16, 20, 24, 32, 40, 48 |
| Radius | card 10px; control 8px; nav item 8px; icon tile 8px; badge 6px; avatar full |
| Shadow | card `0 1px 2px rgba(23,33,43,.04), 0 1px 3px rgba(23,33,43,.04)`; popover `0 12px 32px -12px rgba(23,33,43,.20)` |
| Table density | rows 48px; header 40px |
| Breakpoints | sm 640, md 768, lg 1024, xl 1280, 2xl 1536 |
| Motion | 150ms hover/press; 200ms drawers; reduced motion disables |

## Implementation mapping
The existing `.gp-app` scope in `app/globals.css` re-points the `brand`, `ink` and legacy scales. Switching from the
navy/blue kit to these values is a token edit plus the sidebar and top-bar component changes (see COMPONENT-INVENTORY.md).
