# Theme guidelines

## How it works
- **One implementation for every route group:**
  - `lib/theme.ts` holds the rules (tested in `lib/theme.test.ts`).
  - `THEME_INIT_SCRIPT` is inlined in `app/layout.tsx`. It sets `html[data-theme]` before the first paint, so there is no flash.
  - `components/ui/ThemeSwitcher.tsx` lets the visitor choose.
- **Choices:** Dark (default), Light, or System. System follows the operating-system setting, including changes while the page is open.
- **Storage:** localStorage key `gp-theme`. If storage is blocked (private modes), the default applies.
- **Tokens:** `html[data-theme="light"]` redefines the `--color-mk-*` tokens. Components use only semantic classes (`bg-mk-bg`, `text-mk-text`, `border-mk-line` and so on), never hard-coded colours. The exceptions are white text on the purple gradient buttons, the dark code-editor illustration and the video overlay, which is always dark.
- **Keyboard:** Tab reaches the switcher, and arrow keys change the theme. Each option has an accessible name.
- **Motion:** none in the switch itself. Reduced-motion users also get no decorative animation (`.mk-float` and `.mk-rise` are disabled).

## Status by area
| Area | Dark | Light | Notes |
|---|---|---|---|
| Public website (`/`, `/insights`) | Implemented, tested | Implemented, tested | Switcher in the header (desktop) and menu (mobile). |
| Studio, Client Hub, workspace, sign-in | Not yet | Implemented (official palette) | Blocked by about 1,600 hard-coded colour classes in 70 files (see `growthprint-design-audit.md`). Plan: migrate each screen to `gp-*` tokens, add `html[data-theme="dark"] .gp-app { … }` values, then show the switcher in the app user menu. Until then the app always renders light, so no screen shows half-converted colours. |

## Rules for new UI
1. Use semantic tokens only. If a role is missing, add a token in both themes; never a one-off hex value.
2. Check contrast in both themes: 4.5:1 for text, 3:1 for large text and UI boundaries.
3. Don't invert: the light theme uses the designed light values above, not computed opposites.
4. Images with transparency (the sculpture) must read on both `#080710` and `#F8F7FC`.
