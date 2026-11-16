# GrowthPrint brand guidelines

## Logo
The GrowthPrint logo is the **mark** with the **wordmark**. It is the only official logo. Never redraw, recolour, retype or replace it.

- **Mark:** a 28-unit square with corner radius 7, filled with a diagonal gradient from Brand Purple `#7426C9` (top left) to Deep Purple `#3826B7` (bottom right). It carries a white rising line (`M6 20.5 11.5 15l3.5 3.5L22 9.5`, stroke 2.4, round caps and joins) and a white dot at (22, 9.5), radius 2.
- **Wordmark:** "GrowthPrint" in Poppins SemiBold Italic, letter-spacing −1 %, set to the right of the mark.

All files are generated from that specification by `node scripts/brand/build-brand-assets.mjs`. Edit the script, never the files.

| File (public/brand/logos/) | Use |
|---|---|
| `growthprint-logo-horizontal-dark-bg.svg/.png` | Default lock-up on dark backgrounds (site header, video, social). |
| `growthprint-logo-horizontal-light-bg.svg/.png` | Lock-up on light backgrounds (documents, light theme, invoices). |
| `growthprint-logo-stacked-dark-bg` / `-light-bg` | Square spaces: profile covers, slides, merchandise. |
| `growthprint-logo-horizontal-mono-white` / `-mono-ink` | One-colour printing, or a photo or busy background where the gradient fails. |
| `growthprint-mark.svg/.png` | App icon, favicon, avatar, small spaces. |
| `growthprint-mark-mono-white` / `-mono-ink` | One-colour mark. |

| Icon (public/brand/icons/ and app/) | Use |
|---|---|
| `app/icon.svg` | Browser tab icon (Next.js serves it automatically). |
| `app/apple-icon.png` (180 px) | iOS home screen. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Web app manifest (`app/manifest.ts`). |
| `favicon-32.png` | Legacy favicon contexts. |
| `social-avatar-400.png` | Profile pictures on social and collaboration tools. |

The SVG lock-ups embed the Poppins SemiBold Italic Latin subset (SIL Open Font License), so they render identically in any browser. **Known limit:** a few design tools ignore embedded web fonts. For those, use the PNG files. Converting the lettering to outlines needs a font tool that is not installed, which is a dependency decision.

### Clear space and minimum size
- **Clear space:** keep at least the height of the dot ring (a quarter of the mark's height) empty on every side of the logo.
- **Minimum sizes:**
  - horizontal lock-up: 120 px wide (24 mm in print);
  - mark alone: 16 px (favicon) or 24 px in interfaces.
  - Below 120 px, use the mark alone.

### Backgrounds
- **Gradient mark:** works on near-black (`#080710`), white and light lilac (`#F8F7FC`).
- **Wordmark colour:** white `#FFFFFF` on dark backgrounds, ink `#191329` on light ones.
- **Photos and busy art:** use the one-colour version, or place the logo on a solid panel.

### Misuse (never)
- Recolour the tile, swap the gradient direction or add effects (glow, shadow, outline, bevel).
- Rotate, stretch or change the proportions between mark and wordmark.
- Retype the wordmark in another font or weight.
- Use the sculpture, or any other image, in place of the logo.
- Place the gradient mark on a mid-purple background, where it loses its edge.

## Supporting visual: the sculpture
The metallic purple-blue intertwined sculpture (`public/brand/visuals/growthprint-sculpture.webp`) is an original render made by `scripts/marketing-media/`. It is a **supporting visual**, never a logo.
- **Use it on:** the homepage hero, the Meet GrowthPrint section, the explainer video, marketing graphics, and selected empty states or cover images.
- **Leave it out of:** dense application screens.

## Colour
| Name | Hex | Role |
|---|---|---|
| Brand Purple | `#7426C9` | Primary actions, links and active states (7.3:1 on white). |
| Deep Purple | `#3826B7` | Gradient partner; secondary emphasis. |
| Violet Accent | `#9B6BFF` | Charts, icons and highlights on dark. Not for text on light (3.5:1). |
| Soft Violet | `#C5A6FF` | Large display accents on dark only. |

Theme neutrals and semantic colours are listed in `design-system.md`.

## Typography
- **One typeface: Inter** for headlines and text, on the website and in the app (decided 16 Nov 2026, "Refined Technology Editorial"). Headlines are SemiBold with tight tracking (−0.025 to −0.04 em); body text is Regular (never Light). Emphasis comes from size and weight, never from italic phrases.
- **Interface text:** Inter, in the Studio, portal and sign-in screens.
- **Wordmark:** always Poppins SemiBold Italic. Use the `.gp-wordmark` class next to the mark; never set "GrowthPrint" upright as a logo.
- No other typefaces are loaded.
- No decorative fonts in dashboards.

## Motifs
- **Rising line:** taken from the mark; reused in charts and small illustrations.
- **Converging light lines:** violet and cyan, in the closing call to action.
- **Translucent columns behind hero art:** decoration only.
- **No stock photos, robots or invented client logos.**
