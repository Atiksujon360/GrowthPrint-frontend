# Landing page redesign: audit, art direction and plan

Date: 16 November 2026. Status: **for review. No code has changed for this redesign yet.**
Scope: the public homepage (`app/(public)/page.tsx` and `components/marketing/*`). The inquiry form's logic, API calls, validation, routes and auth are out of scope and stay as they are.

---

## Phase 1: Visual audit of the current page

Measured on the running site (dark theme, 1440 px and 390 px), with the browser's computed styles.

| Measure | 1440 px | 390 px |
|---|---|---|
| Page height | 11,227 px | 17,200 px |
| Sections | 12 | 12 |
| Elements with a gradient background | 28 | 28 |
| Elements with a corner radius of 16 px or more | 83 | 83 |
| Elements with blur or backdrop blur | 15 | 15 |
| H2 sizes | 54–64 px (all 11 headings) | 32–34 px |
| Body text | Poppins **300 (light)**, 16–18 px | same |
| Smallest list text | 13 px (29 items) | 13 px |
| Services section height | 1,525 px | **3,137 px** |

### What makes it read as a template
1. **One skeleton, eleven times.** Every section uses the same frame: a 1440 px container, `py-24 lg:py-32`, a top hairline, a title column on the left and content on the right (`grid-cols-[0.7fr_1.3fr]` and close variants). The eye never gets a change of pace.
2. **The same heading device everywhere.** Eight headings end in a light italic phrase ("*works.*", "*move forward.*", "*end to end.*", "*comes together.*", "*together.*", "*answered.*", "*project.*", "*better technology.*"). Once it is a pattern it stops being emphasis, and it is the most recognisable "AI landing page" signature on the page.
3. **No typographic hierarchy.** Every H2 is 54–64 px at the same weight, so the page's key message ("Technology should make business easier") shouts no louder than "Questions, answered."
4. **Light body text on near-black.** Poppins Light at 16 px on `#080710` is thin and shimmering. It reads as decorative and tires the eye in long paragraphs.
5. **Purple is decoration, not signal.** Glow behind the hero, the video frame, the service cards, the final CTA rays and the buttons. When everything is purple, the call to action is not special.
6. **Card grid as the default answer.** The five services are five rounded, gradient-tinted cards with chips and mini-illustrations. They look alike, so nothing reads as the lead offer, and on mobile they become a 3,137 px stack.
7. **The sculpture appears twice in the first two screens** (hero and video poster), large and glowing both times. It carries the hero but says nothing about what GrowthPrint does.
8. **Thin business story.** The page describes services ("Business websites", "n8n integrations") but never names the visitor's problem: manual work, disconnected systems, ageing software. Nothing connects a problem to an outcome.
9. **Two near-duplicate lists.** "Why businesses work with GrowthPrint" (six principles) and "Ways to work together" (six models) are both six-row tables in the same frame.
10. **Mobile is a compressed desktop.** The same sections stack at full length; the page is 53% taller than desktop, mostly from cards and two-column frames collapsing to one column.

### What is worth keeping
- The official mark, the wordmark, and the sculpture as a brand asset.
- Honest content: no invented clients, numbers or testimonials.
- The real product proof (Studio screenshot, labelled as demo data).
- The FAQ's native `<details>` accordion (accessible, no JavaScript).
- The inquiry form and its validation, which work and are tested.
- Dark and light themes with the pre-paint script and switcher.

---

## Phase 2: Art direction, "Refined Technology Editorial"

**Philosophy.** Calm, exact, confident. Typography and space do the work; purple marks the one thing to act on. Some sections are loud, most are quiet, and every one has a reason to exist. If a choice cannot be explained, it is removed.

### Colour tokens
These replace the current `mk-*` values. The names stay the same, so components change little.

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `mk-bg` | `#09090F` | `#FAFAFC` | Page |
| `mk-surface` | `#11111A` | `#F1F1F5` | Alternate sections |
| `mk-elevated` | `#171722` | `#FFFFFF` | Final CTA band, form fields, menus |
| `mk-text` | `#F6F5FA` | `#111118` | Primary text |
| `mk-muted` | `#A3A3B3` | `#5E5E6E` | Secondary text |
| `mk-dim` | `#9898A8` | `#6B6B7B` | Captions and labels only (≥ 14 px) |
| `mk-line` | `rgb(255 255 255 / 0.08)` | `rgb(17 17 24 / 0.10)` | Hairlines |
| `mk-accent` | `#9B6BFF` | `#7426C9` | Text links, index numbers, active state |
| `mk-action` | `#7426C9` | `#7426C9` | Primary button fill (white text, 7.3:1) |

- Neutrals are true neutrals (no purple tint), so the purple accent stands out.
- **Rules:** no gradients except inside the sculpture image; no glow or blur; one accent element per viewport where possible; `#9898A8` is never used for body copy.
- The brief lists `#9898A8` as muted text. On `#09090F` it measures about 6.9:1, so it passes; on `#11111A` it is a little lower but still above 4.5:1. Body copy uses the slightly brighter `#A3A3B3`.

### Typography
- **Recommendation: Inter for everything** (already loaded through `next/font`, so no new download), set like a display face for headlines: weight 600, tracking −0.035 em, tight leading. Poppins stays **only** for the wordmark. This gives Swiss-style discipline and removes the second font from most of the page.
- **Alternative:** Instrument Sans for headlines with Inter for text. It has more character, but adds about 40 KB of fonts and a third family. Your decision; see below.
- **Scale (desktop → mobile):**

| Role | Size and leading | Weight | Use |
|---|---|---|---|
| Display | 96/0.95 → 44/1.0 | 600 | Hero only |
| Statement | 56/1.05 → 32/1.1 | 500 | Positioning, final CTA, at most three per page |
| H2 | 40/1.1 → 28/1.15 | 600 | Section titles |
| H3 | 22/1.3 → 20/1.3 | 600 | Items |
| Lead | 20/1.55 → 18/1.55 | 400 | Section introductions |
| Body | 17/1.65 → 16/1.6 | 400 | Never 300 |
| Small | 14/1.5 | 400 | Captions, meta |
| Index | 14, tabular numbers | 500 | "01", "02"… in accent colour |

- Measure: body text 60–68 characters; headlines 12–18 characters per line, set with `text-wrap: balance`.
- **No italic accent phrases.** Emphasis comes from size and weight. Uppercase labels are limited to two places (the hero index and the footer).

### Layout grid and spacing
- A 12-column grid with a 1280 px content width, 32 px gutters and 64 px outer margins. Tablet uses 8 columns and 40 px margins; mobile uses 4 columns and 20 px margins.
- **Widths vary on purpose:** full-bleed hero; a narrow statement (columns 2–9); a wide capability list (columns 1–12); a ledger at columns 1–10; a centred FAQ at columns 3–10.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144. Section padding alternates between **144 px for quiet sections** and **96 px for dense ones** (mobile: 72 and 56 px).
- **Rhythm of section backgrounds (dark theme):**
  bg → bg → surface → **inverted light band** → bg → surface → bg → bg → elevated → **inverted light band** (form).
  Two inverted "paper" bands break the dark page the way a printed spread would. In the light theme the bands invert to dark.

### Components
- **Buttons:** 6 px radius, 44 px tall, no pills. The primary is an `mk-action` fill. The secondary is a plain text link with an arrow, not an outlined box.
- **Cards:** used only where items are genuinely objects (form, media). Otherwise text sits on the grid with hairline dividers.
- **Radius:** 6 px for controls, 12 px for media and the form, 0 for sections.
- **Diagrams:** inline SVG, 1 px strokes in `mk-line`, a single accent path, with labels as real text (accessible and translatable).

### Visual assets
- **Sculpture:** used once, in the hero. It is cropped to bleed off the right edge, about 40% smaller, with no glow behind it and a static render. The video poster switches to a calm frame from the film rather than repeating the sculpture.
- **Product proof:** the real Studio screenshot, framed simply and labelled "demo data".
- **Diagrams** (new, drawn in code): an automation flow, a system-integration map, and the delivery timeline.
- No stock photos, robots, fake logos or icon sets used as the visual identity.

### Motion
- Hover: 150–200 ms colour and underline transitions.
- Reveal: each section fades in once, rising 8 px over 400 ms, triggered by IntersectionObserver.
- The delivery timeline highlights the selected step.
- No looping animation, parallax, or floating sculpture. Everything is off under `prefers-reduced-motion`.
- No new animation library. The existing `motion` package is not needed for any of this.

---

## Phase 3: Implementation plan (for approval)

| # | Section | New composition | Notes |
|---|---|---|---|
| 1 | Navigation | Wordmark left; links "Capabilities, Approach, Engineering, Insights"; one "Discuss Your Project" button. Solid `mk-bg` at 80% opacity after scroll, transparent at top. Mobile: full-screen sheet with large links. | The theme switcher moves to the footer and the mobile sheet. Tests updated to match. |
| 2 | Hero | Asymmetric layout: headline over columns 1–7, sculpture bleeding off the right in columns 8–12. Below the CTAs, a hairline "capability index" of five anchor links. | "Build Smarter. Scale With Confidence." with no italics; CTAs "Discuss Your Project" and "Explore Our Capabilities". |
| 3 | Positioning | One statement line at 56 px over columns 2–9, supporting copy offset to columns 6–11. No card, no image. | Quiet section, 144 px padding. |
| 4 | Capabilities | Item 01 as a lead feature: large title and problem / what we do / why it matters, beside an automation-flow diagram. Items 02–05 as an editorial numbered list: one hairline row each with number, title, problem solved and outcome. | Replaces five identical cards. Mobile becomes a compact list, about 60% shorter. |
| 5 | Business problems | **Inverted light band.** A two-column ledger: "If this sounds familiar" → "What we do about it", six rows. | New section. Concise and specific. |
| 6 | Why GrowthPrint | A 3 × 2 text grid with no boxes: index number, title, one sentence. The six points from the brief. | Replaces the six-row table. |
| 7 + 9 | Approach and delivery (**merged**) | Statement "We choose technology based on business outcomes, not trends." above one horizontal six-step timeline. Steps are accessible tabs, and the selected step shows its detail. Mobile: a vertical list. | The brief's two processes are almost identical; one section avoids showing the same six steps twice. |
| 8 | Engineering capabilities | A spec-sheet layout: Frontend, Backend, Integration as plain lists in three columns. Beside it, "We run our own business on what we build" with the real Studio screenshot. | Merges "Our Work" into this section as proof. The list is limited to what you confirm. |
| — | Video | A compact row: a 16:9 player over 5 columns plus a short text, placed after the positioning statement. | Not in the brief; recommended to keep (see decisions). |
| 10 | FAQ | Single column, centred over 8 columns, hairline `<details>`, 18 px questions, answers at 65 characters. | Keeps the native accordion. |
| 11 | Final CTA | `mk-elevated` band, left-aligned 56 px headline, one "Start a Conversation" button. No rays or glow. | |
| 12 | Contact | **Inverted light band.** The same `ProjectInquiryForm` restyled through tokens only: 14 px labels, 48 px fields, 24 px gaps, two columns on desktop and one on mobile. | No change to fields, validation, API or analytics. |
| — | Footer | Quiet: wordmark, one line of positioning, links, theme switcher, legal. | |

**Files:**
- Rewritten: `components/marketing/{navbar,hero,brand-intro,services,why-growthprint,process,case-studies,faq,final-cta,contact,footer}/*`, `components/marketing/content.ts`, the marketing token and type blocks in `app/globals.css`, and the section order in `app/(public)/page.tsx`.
- New: `components/marketing/problems/Problems.tsx`, `components/marketing/diagrams/*`.
- Unchanged: `features/inquiries/*` logic, `lib/inquiryForm.ts`, API clients, routes and auth.

**Order of work:** tokens and type scale, then navigation, hero, positioning, capabilities, problems, why, approach, engineering, FAQ, CTA, contact, footer. `npm run lint` and `npm test` run after each step.

**Tests:**
- Update `tests/marketing-home.spec.ts` for the new headings and CTA names.
- Add tests for: the capability index anchors; the timeline as keyboard-operable tabs; no horizontal overflow at 1920, 1440, 1366, 1024, 768, 390 and 360 px; no transitions under reduced motion; no glow or gradient on sections (a style assertion).

**Visual review:** screenshots at all seven widths in both themes, compared side by side with the current page, with a refinement pass afterwards.

---

## Decisions (answered 16 November 2026)
| # | Question | Decision |
|---|---|---|
| 1 | Positioning | **"Your AI-Native Technology Partner", everywhere.** Site, manifest, footer, metadata and social image are updated in this redesign. The video's scene 2 and narration follow with the Azure voice re-render. |
| 2 | Services | **The brief's five as written:** AI & Business Automation, Software Engineering (now including websites and web applications), Integration & Modernization, Managed Technology Services, AI Products & Innovation. They also become the inquiry form's choices; each maps to an existing API category, so the API contract is unchanged. |
| 3 | Engineering list | **Approved as built (16 Nov 2026):** the current list without micro-frontends. |
| 4 | Video, Our Work, engagement models | **Keep, compact.** The video becomes a small row after the positioning statement, the Studio screenshot becomes proof inside Engineering, and the engagement models move into the FAQ. |
| 5 | Typeface | **Inter only.** Poppins remains only for the wordmark. |

Questions as originally asked:

1. **Positioning line.** The brief says "Your AI-Native Technology Partner". The site, manifest, social image, footer and video currently say "Your complete technology partner", which was approved in the previous pass. Changing it means updating all of those; the video's scene 2 and the narration would need a re-render.
2. **Services.** The brief's five capabilities drop "Website & Digital Experiences" as a named service and add "AI Products & Innovation". Are websites still offered? Is there a real AI product offer to describe? The inquiry form's service choices come from the same list, so this also changes what visitors can pick (the API values stay valid).
3. **Engineering list.** The brief lists Node.js and micro-frontend systems. The current list has PostgreSQL, Docker and n8n. Please confirm only what you can genuinely deliver today.
4. **Sections the brief leaves out.** The explainer video, "Our Work" (the Studio as proof) and "Ways to work together" (the six engagement models from the last brief). Recommendation: keep the video as a compact row, merge Our Work into Engineering, and move the engagement models into the FAQ.
5. **Typeface.** Inter only (recommended, no new download) or Instrument Sans headlines with Inter text.

## Downstream follow-ups (not part of this redesign)
- The brand guidelines currently say "Poppins headlines". They will be updated to match whichever typeface you choose.
- The social share image and the explainer film use the old glowing purple look. Once the page is approved, they should be re-art-directed to match.

---

## Build results (16 November 2026)

**Status: implemented and verified locally. Not committed or deployed.**

What changed:
- **Tokens and type:** neutral `mk-*` palette (dark default, designed light theme, `.mk-invert` paper bands), an Inter type scale (`.mk-display`, `.mk-statement`, `.mk-h2`…), a 12-column grid (`.mk-container`, `.mk-grid`), two button styles, and CSS-only section reveals that switch off under reduced motion. The component classes sit in Tailwind's `components` layer so utilities can override them.
- **Sections, in order:** navigation → hero (with a capability index) → positioning → compact video row → capabilities (one lead feature with an automation diagram, then a numbered list) → business problems (paper band) → why GrowthPrint → approach and delivery (one timeline, keyboard tabs) → engineering (spec sheet plus Studio proof) → FAQ (engagement models folded in) → final CTA → contact (paper band) → footer (theme switcher moved here).
- **Removed:** `components/marketing/process/Process.tsx` and `case-studies/OurWork.tsx`, merged into Approach and Engineering.
- **Positioning** is now "Your AI-native technology partner" in metadata, the manifest, the footer, the share image (new script `scripts/brand/build-og-image.mjs`) and the film source. The film itself is re-rendered with the Azure voice.
- **Inquiry form:** class changes only. The logic, validation and API call are untouched (diffed). Its service choices are the five new capabilities, mapped to valid API categories; AI Products uses `AI_INTEGRATION`.
- **Video poster:** re-rendered from the "Connect your technology" frame, so the sculpture appears once in the first view.

Measured against the original:

| Measure | Before | After |
|---|---|---|
| Elements with a gradient in `<main>` | 28 | 0 (tested) |
| Elements with blur | 15 | 0 (tested) |
| Italic phrases in headings | 8 | 0 (tested) |
| H2 sizes | all 54–64 px | 40 px section titles, 56 px statements (three) |
| Body weight | 300 | 400 |
| Mobile page height (390 px) | 17,200 px | about 15,600 px |
| Horizontal overflow, seven widths (1920 to 360 px) | not tested | 0 px (tested) |

Checks (all run):
- `npm run lint`: exit 0.
- `npm test`: 179 pass, 0 fail.
- `npm run build`: exit 0, both with the test configuration and as a production build.
- Playwright without `@backend`: 44 passed, 16 skipped. The 12 new tests cover the capability index, the timeline as keyboard tabs, the absence of gradients, blur and italics, reduced motion, and seven widths.

Not done or not verified:
- Real Safari and Firefox.
- Lighthouse.
- The `@backend` specs against a live API.
- Founder approved the engineering list and the AI wording ("AI Products & Innovation" and "How do you use AI, and is our data safe?") on 16 Nov 2026.
- The Studio screenshot (`public/images/work/growthprint-studio-dashboard.webp`) was re-captured on 16 Nov 2026 from a local demo-mode build: purple theme, demo data only, demo bar hidden. The capture exposed a truncated sidebar lock-up ("GrowthPrint Stu..."), which is now fixed in `components/shell/AppShell.tsx` (smaller product name, no truncation). The local build was then rebuilt with mock mode off, and the compiled switch was checked: `"true"==="false"`.
