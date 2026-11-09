# GrowthPrint design system

One brand with two personalities:
- **Public website:** editorial, Stripe-inspired enterprise trust, storytelling and conversion.
- **Application:** operational clarity and density. It follows the Nexora reference once that screenshot is supplied.

Tokens live in `app/globals.css` (`@theme`) and fonts in `app/layout.tsx`.

## Concept: the blueprint
GrowthPrint = growth + print (blueprint). That idea drives three things:
- the framed page grid with hairline guides;
- the navy grid surfaces;
- a rising line used as the brand mark and in the hero drawing.

## Colour
| Token | Hex | Use |
|---|---|---|
| `navy-950` | #061427 | Dark public bands (Process, footer), primary dark buttons, blueprint surfaces |
| `navy-900` / `800` / `700` | #0a1d33 / #0f2740 / #163250 | Raised areas on navy |
| `brand-600` (emerald-teal) | #0c826c | Primary action on light backgrounds, links, focus ring (AA on white) |
| `brand-500` / `400` | #16a083 / #37bb9a | Accents and lines on navy; primary button on navy |
| `brand-900` / `950` (deep teal) | #0c453d / #032824 | Deep teal surfaces, strong text on mint |
| `mint-300` / `100` | #84d8c5 / #d9f5ee | Lines and the second headline tone on navy; tags |
| `ink-50 … ink-950` (cool grey to navy) | #f6f8fa … #0a1628 | Text, borders and neutral surfaces |
| white | #ffffff | Primary surface |

Rules:
- Green is an accent, not a fill. Most surfaces are white, ink-50 or navy.
- There are no purple or blue gradients. The legacy `blue`/`purple`/`indigo`/`sky` utilities are re-pointed at brand and mint so old screens stay on-brand.
- `emerald-*` keeps Tailwind's own values and means "success".

## Typography
| Role | Family | Notes |
|---|---|---|
| Display: headlines, page titles, card titles on the public site | **Schibsted Grotesk** (`--font-display`, class `.gp-display`) | Weight 600, tracking −0.025em. Public H1 uses `clamp(2.4rem,5.2vw,4.1rem)` at 1.03 leading; section H2 uses `clamp(2rem,4vw,3rem)` at 1.08 |
| Interface and body | **Hanken Grotesk** (`--font-sans`) | Body 1–1.3rem at 1.6 leading on the public site, 0.875–1rem in the app; numbers use `tabular-nums` |

Both fonts are self-hosted by `next/font` at build time: no runtime request to Google and no layout shift.

Rules:
- Lines are at most about 70 characters (`max-w-xl` to `max-w-3xl`).
- Use sentence case. No all-caps eyebrows.
- **Two-tone headlines** are one sentence: a strong clause followed by a `.gp-headline-muted` continuation. Never highlight a single word.

## Layout
- `.gp-frame`: max width 76rem, side padding 20px on mobile and 40px from 768px. From 768px it shows 1px guide lines on both sides (`--gp-guide`; transparent in the header, `white/8%` on navy via `.gp-on-dark`).
- 12-column grids on large screens. Sections are separated by hairline borders, not by gaps and shadows.
- Section rhythm: `py-20` mobile, `py-28` from md.
- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Verified at 390, 768 and 1440 with no horizontal overflow.

## Shape and depth
- Radius: public panels `rounded-2xl`; pills and buttons `rounded-full` on the public site; app controls `rounded-xl` (existing `forms.tsx`); small tags `rounded-md`.
- Depth comes from borders and rings (`ring-1 ring-ink-200`). Shadows are reserved for floating layers (dialogs, menus).

## Components
| Component | Location | Notes |
|---|---|---|
| Brand mark | `features/public/components/GrowthPrintMark.tsx` | Rising line on a blueprint tile, dark or light |
| Blueprint drawing | `features/public/components/BlueprintDrawing.tsx` | SVG with a title and description for screen readers; draws in once |
| Public buttons | Primary: `bg-brand-600` pill (hero). Dark: `bg-navy-950` pill. Secondary: outlined pill | Minimum height 44–48px |
| Services tabs | `ServicesSection.tsx` | WAI-ARIA tabs with arrow-key navigation on desktop, stacked articles on mobile |
| Accordion | `FAQSection.tsx` | `aria-expanded`, `aria-controls`, region; animated with `grid-template-rows` |
| App kit | `components/ui/forms.tsx`, `components/ui/workspace-kit.tsx` | Button, fields, Notice, Card, Dialog (focus trap), Pagination, StatusPill, StatCard, TableShell |
| Auth frame | `features/auth/components/AuthShell.tsx` | Navy blueprint panel beside a focused form column |

## Motion
- Tokens: `--duration-fast` 120ms, `--duration-base` 200ms, `--duration-slow` 320ms, `--ease-standard`, `--ease-out-soft`.
- **One orchestrated moment** on the public site: the hero blueprint draws in (`.gp-draw`, `.gp-fade-late`), finishing in about 2.2s.
- Everything else responds to the user: the tab indicator slides, the accordion expands, the menu opens. There are no scroll-triggered entrances on every section.
- `prefers-reduced-motion` shows the finished drawing and turns transitions off, using the existing global rule plus specific overrides.

## Accessibility
- Visible focus ring on everything (2px `brand-600`, 2px offset).
- Landmarks: header, main and footer; navigations labelled "Main", "Services" and "Company".
- Each section is labelled by its heading. SVG artwork has a title and description; purely decorative grids are `aria-hidden`.
- Touch targets are at least 44px.
- Contrast: body text uses `ink-600` or darker on white, and `white/70` or brighter on navy.
