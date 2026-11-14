# GrowthPrint design reference library

Screenshots were captured on 2026-11-09 with Playwright at 1440×900 and are stored in `docs/design/references/`.
They are **for internal reference only**: they belong to their owners and must not be published or reused as
assets. GrowthPrint borrows principles from them, never layouts, artwork or copy.

| Reference | URL | Evidence | What makes it effective | What GrowthPrint takes |
|---|---|---|---|---|
| Stripe (primary public reference, set by the CEO) | https://stripe.com/ | `references/stripe.png` | Page framed by thin vertical guide lines; a long headline where a strong statement continues in a quieter tone; one bold artwork carries the whole hero; restrained navigation; a trust strip directly under the hero | The **blueprint frame** (`.gp-frame` guide lines), **two-tone headlines** (`.gp-headline-muted`), a single signature hero visual, and a strip under the hero. GrowthPrint's strip lists technologies, because it has no customer logos to show and will not invent any. |
| Linear | https://linear.app/ | `references/linear.png` | Precise type, dark product surfaces, very little decoration | A dark navy band for the Process section; quiet borders instead of shadows |
| Vercel | https://vercel.com/ | `references/vercel.png` | Grid geometry used as brand language | The grid pattern on the blueprint drawing and the sign-in panel |
| Attio | https://attio.com/ | `references/attio.png` | A real product frame shown on the homepage; neutral palette with one accent | Showing the system (a diagram of what we build) instead of stock photography |
| Raycast | https://www.raycast.com/ | `references/raycast.png` | Keyboard-first product with a command palette | Keep and restyle the existing app command palette (Phase 2 of the redesign) |
| Dribbble: SaaS CRM dashboard | https://dribbble.com/search/saas-crm-dashboard | `references/dribbble-saas-crm-dashboard.png` | Light surfaces, a top row of KPIs with small trend charts, a large main chart plus a breakdown panel, tables with status pills | The app's dashboard grammar, to be matched to the Nexora screenshot once it is supplied |
| Dribbble: software agency website | https://dribbble.com/search/software-agency-website | `references/dribbble-agency-website.png` | Editorial agency pages, large type, case-study splits | The case-study split (diagram beside the story) |
| Dribbble: business dashboard | https://dribbble.com/search/business-dashboard | `references/dribbble-business-dashboard.png` | Compact data density, consistent cards | Density targets for the app redesign |

**Not reviewed:** Awwwards, Framer and Notion were listed in the brief but not captured in this pass. **Nexora
dashboard:** the CEO's brief names this screenshot as the source of truth for the app, but it was not attached to the
request. The app redesign waits for it (see the redesign report).

## Takeaways recorded before designing
1. One memorable element per page. On the public site that is the self-drawing system blueprint; everything around it is quiet.
2. Typography over decoration. Large display headlines, no all-caps eyebrows, no icon-in-a-box rows.
3. Structure means something. Numbers appear only on the Process steps, because they really are a sequence. Guide lines frame the content and do not decorate it.
4. Credibility comes from honesty. Examples are labelled illustrative, and there are no fake logos, testimonials or numbers.
