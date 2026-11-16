# UI consistency report

Date: 16 November 2026. Scope: public website, Admin Studio, Client Portal, sign-in screens. It follows the design audit in `growthprint-design-audit.md`.

## Summary
| Area | Before | Now | Status |
|---|---|---|---|
| Logo | Two marks. The public site used the purple BrandMark; Studio and portal used a teal `GrowthPrintMark`. | One mark everywhere. `GrowthPrintMark` now renders the official `BrandMark`. Generated logo files are in `public/brand/logos/`. | Implemented, visually reviewed |
| Favicon and app icons | None | `app/icon.svg`, `app/apple-icon.png`, `app/manifest.ts`, and icons at 32, 192, 512 and maskable 512 px | Implemented, tested (build) |
| Palette | Teal app palette next to the purple marketing palette | App tokens (`--color-gp-*` and the brand and ink scales) are recoloured to the brand purple. Legacy blue, indigo, sky, mint, purple and violet classes map to the brand scale. Charts and engaging components use purple. | Implemented, visually reviewed |
| Marketing colour | Hard-coded `text-white` and `white/x` | Semantic `mk-*` tokens with light-theme overrides | Implemented, visually reviewed |
| Theme | Dark only | Dark (default), light and system on the public site. Set before first paint, saved in `gp-theme`, keyboard operable. | Implemented, tested (Playwright) |
| Typography | Four typefaces: Poppins (site), Inter (app), Hanken and Schibsted Grotesk (sign-in, error pages, older components) | One typeface, Inter, for headlines and text everywhere; Poppins only in the wordmark. Hanken and Schibsted are no longer loaded. | Implemented, visually reviewed |
| Wordmark | Italic on the site; upright bold or Schibsted in the Studio, portal and sign-in | One `.gp-wordmark` style (Poppins SemiBold Italic) in the nav, footer, sign-in, sidebar and mobile drawer. "GrowthPrint Studio" shows the wordmark followed by the product name. | Implemented, visually reviewed (sign-in) |
| Page titles | Root and public layouts still said "Practical software for growing teams" | "GrowthPrint \| Your complete technology partner", with a `%s \| GrowthPrint` template for other pages | Implemented |
| Demo bar | The fixed marketing header covered the demo role switcher | The header sits below the demo bar (`gp-demo-bar`) | Implemented, tested |
| Client portal figures | Hard-coded "6.5 hrs", "8.5 of 15", "On-track for milestone targets" | Counts derived from real projects and invoices (`lib/portalSummary.ts`) with honest empty states | Implemented, tested (unit and Playwright) |

## Screens reviewed
Each was captured at the stated width; horizontal overflow and console errors were measured on the page.

| Screen | Widths | Themes | Overflow | Console errors |
|---|---|---|---|---|
| Home | 1440, 390 | dark, light | 0 px | 0 |
| Home, services and inquiry form | 1440 | light | 0 px | 0 |
| Studio dashboard | 1440 | app (light) | 0 px | 0 |
| Client portal dashboard | 1440 | app (light) | 0 px | 0 |
| Studio sign-in | 1440 | app | 0 px | 0 |

## Known inconsistencies (not fixed in this pass)
1. **App dark mode is not available.** The Studio and portal still contain about 1,600 hard-coded colour classes across 70 files. Recolouring the tokens fixed the brand colour, but a dark app theme needs those classes moved to tokens first. The public-site switcher therefore does not change the app. This is documented in `theme-guidelines.md`.
2. **Dead components.** Several components are reachable only through the unused `ApplicationShell`. They carry the old styling and should be deleted in a separate change.
3. **Portal Messages** has no backend; the screen should say so or be hidden until it does.
4. **Charts** use the brand purple, but series colours beyond the first two are not yet checked for contrast in every chart.

## Contrast checks used
| Pair | Ratio | Use |
|---|---|---|
| `#7426C9` on white | 7.3:1 | Text and buttons, light theme |
| `#9B6BFF` on white | 3.5:1 | Fills and large graphics only, never body text |
| `#686276` on `#F8F7FC` / white | 5.6 to 5.8:1 | Secondary text |
| `#736D82` on white | about 4.7 to 4.9:1 | Muted text (passes AA for normal text) |
