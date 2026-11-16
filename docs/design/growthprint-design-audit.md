# GrowthPrint design audit

Date: 16 November 2026. Scope: public website, Admin Studio, Client Portal, sign-in screens, shared components, tokens, theme and brand assets.
How it was inspected: the code itself, plus browser captures at 1440, 1280, 1024, 768, 390 and 375 px taken during the homepage work on 15 November.

## 1. Brand inconsistencies (high)
| Finding | Evidence | Effect |
|---|---|---|
| Two different logos are in use | The official mark (purple gradient tile, `components/marketing/BrandMark.tsx`) is used only on the public site. The old teal-on-navy mark (`features/public/components/GrowthPrintMark.tsx`) is used by `components/shell/AppShell.tsx` (Studio, Client Hub, workspace) and `features/auth/components/AuthShell.tsx` (sign-in pages). | A visitor who signs in moves to what looks like a different company. |
| Two palettes | The public site uses dark violet (`--color-mk-*`). The Studio and portal use teal on white (`.gp-app`, primary `#117F76`). | Same as above, plus two token systems to maintain. |
| Three typefaces | The public site uses Poppins, the apps use Inter, and the old public components use Hanken and Schibsted Grotesk. | No single typographic voice. |
| No logo files | There is no wordmark asset, favicon, app icon, web manifest or social avatar. Browsers show a blank tab icon. | Unfinished in browser tabs, bookmarks, home screens and link previews. |

## 2. Theme gaps (high)
- There is no theme switching anywhere. The public site is dark only and the apps are light only.
- **1,615 hard-coded colour classes** (slate, blue, white, rose, emerald, amber, gray, indigo) appear across **70 app files** in `features/` and `components/`. Only 339 places use the theme tokens.
- A dark app theme set through tokens alone would leave white cards and dark-grey text on a dark background. These classes must be migrated to semantic tokens screen by screen.
- Inline colours also appear in charts (Recharts series colours) and in some status badges.

## 3. Duplicate and dead code (medium)
- **Unused homepage components:** `HeroSection`, `ServicesSection`, `CaseStudiesSection`, `HowWeWorkSection`, `TrustSection`, `FAQSection`, `PublicHeader`, `PublicFooter`, `QuoteInquiryModal` and `BlueprintDrawing` in `features/public/components/`. Since the 15 November homepage they are reachable only from `components/shell/ApplicationShell.tsx`, which nothing imports.
- **Two brand-mark components:** `GrowthPrintMark` and `BrandMark`.
- **Two inquiry forms:** `QuoteInquiryModal` (old) and `features/inquiries/ProjectInquiryForm.tsx` (current).

## 4. Usability: Admin Studio
- **Good:** the shared `AppShell`; consistent KPI cards, panels, summary strips and data table; details drawers on Clients, Projects and Leads; real "needs attention" notifications; keyboard-operable rows.
- **Gaps:**
  - The Automation and Activity log tabs have no backend; they show demo data only and say so.
  - Lists load in full, with no server pagination.
  - Several older views (Invoices, Support queue, Outreach) still use the pre-token blue and slate styling.
  - There are no breadcrumbs. Tabs share one URL, so deep links are not possible.

## 5. Usability: Client Portal
- Projects, proposals (accept or decline), invoices (PDF, report a payment) and support requests (create, approve an estimate) all run on real endpoints.
- "Messages" has no backend and is disabled behind a flag; it should be hidden or labelled clearly.
- The dashboard does not yet lead with "what needs you": pending approvals, unpaid invoices and open requests.

## 6. Accessibility
- Fixed recently:
  - focus traps in the drawers;
  - keyboard rows in the data table;
  - captions on the video;
  - reduced motion respected on the public site;
  - skip link on the homepage.
- Open:
  - The app screens have no skip link.
  - Contrast of the teal secondary text should be re-checked after the palette change.
  - Some icon-only buttons in older views lack accessible names (to verify per screen during migration).

## 7. Content gaps
- **Positioning:** the new direction is "complete technology partner", including ongoing IT support. The homepage currently says "Scale Without Limits" and lists five services without "Ongoing IT Support" as its own group.
- **Process:** the brief asks for six steps (Discover, Plan, Design, Build, Launch, Improve); the page has five.
- **Engagement models:** monthly support and custom development are missing.
- **Contact details:** the email address and legal name still need owner confirmation.

## 8. Technical risks
- The explainer video is WebM (VP8) only, with no MP4 (H.264), so older iOS Safari won't play it, and it has no narration. The tools needed are ffmpeg and a neural TTS or recorded voice, and neither is installed. See `docs/video/`.
- Context7 (required by AGENTS.md before using library APIs) is not authorised in this environment. Library usage was verified by running the code and tests instead.
- Mock mode is blocked in production by `scripts/check-prod-env.mjs`, but only where the build pipeline runs it. Vercel's build command must include it.

## 9. Proposed phases
1. **Brand files:** logo variants, icons, manifest, guidelines. *(done in this pass)*
2. **One token layer and theme switching** (dark default, light designed) for the public site. Swap the official mark into the Studio, portal and sign-in screens. *(done in this pass)*
3. **App screens:** migrate the 70 files from hard-coded colours to semantic tokens, then enable dark mode in the apps one screen at a time with screenshots. *(next; large)*
4. **Homepage copy:** the new positioning, six-step process and six engagement models. *(done in this pass)*
5. **Portal dashboard:** reorder it around "what needs you".
6. **Video:** an MP4 master and narration, once ffmpeg and a voice source are approved.
7. **Clean-up:** delete the dead components listed in section 3.
