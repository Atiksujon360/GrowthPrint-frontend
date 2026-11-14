# GrowthPrint frontend: functional baseline

Captured **2026-11-09** on branch `feature/growthprint-complete-design-transformation`, created from
`feature/mvp2-frontend` at commit `b16f8ce`. The working tree was clean when the branch was created, so no
existing work was affected.

## Stack (verified in package.json)
- Next.js 16.4.2 (App Router, `proxy.ts`), React 19.0.1, TypeScript 7, Tailwind CSS 4.3.3.
- Redux Toolkit 2.13 (slices `auth`, `agency`, `ui`, RTK Query `workspaceApi`).
- Libraries: react-hook-form, zod, recharts, motion, lucide-react.
- Demo mode: `NEXT_PUBLIC_USE_MOCK_API=true` serves seeded data from `features/agency/initialData.ts`. Real mode calls `NEXT_PUBLIC_API_BASE_URL`.

## Routes
| Route | Screen | Guard |
|---|---|---|
| `/` | Public home: header, hero, services, work, process, why, FAQ, footer, quote inquiry modal | Public |
| `/forgot-password`, `/reset-password#token`, `/accept-invite#token` | Account recovery and invitation (AuthShell) | Public, noindex |
| `/join-business#token` | MVP2 business invitation | Public; acting on it requires sign-in |
| `/studio/ops/login`, `/client-hub/login` | Sign in (AuthShell) | Public |
| `/studio/ops`, `/studio/ops/settings` | Studio. One client-side workspace with tabs: Dashboard, Leads, Outreach, Requests, Projects, Clients, Invoices, Automation, Activity, AI settings, Team, Settings | `WorkspaceGuard admin` plus `canUseStudioTab` per module |
| `/client-hub`, `/client-hub/settings` | Client portal: dashboard, projects, requests, proposals, invoices, messages, payment reports | `WorkspaceGuard portal` |
| `/workspace/**` | MVP2 business workspace: list, onboarding, command centre, clients, leads, team, activity, settings | `WorkspaceGuard admin` plus business membership |

## Behaviour that must not change
- **Auth.** The token is kept in sessionStorage (`gp_auth_token`) and checked with `GET /auth/me` on load. Login redirects by role. Any 401 clears the session. Roles are ADMIN, TEAM_MEMBER (module permissions), CLIENT and GUEST.
- **Public inquiry.** `QuoteInquiryModal` validates input and submits through the `submitPublicInquiry` thunk. Service buttons preselect the category. Header, hero, trust and footer buttons all open the modal.
- **Client Portal buttons.** In demo mode they switch the role to CLIENT. Otherwise they go to `/client-hub/login`. The studio is never linked from the public site except the demo-only shortcut in the footer.
- **Section navigation.** `scrollToSection` respects reduced motion and keeps the URL free of hashes.
- **Workspace.** Every RTK Query hook, cache tag, role check (`can`) and mock-service rule documented in `docs/architecture/MVP2-FRONTEND-COMPLETION-REPORT.md`.

## Baseline test results
| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm test` (node:test) | PASS, 133/133 |
| `npm run build` (demo env) | PASS |
| Playwright `auth-and-routes`, `mvp2-workspace` | PASS (from the Phase 1 run: 19 passed) |
| Playwright `admin-login`, `client-login`, `admin-create-project`, `public-inquiry` (submit) | PRE-EXISTING ISSUE / NOT TESTED: they need a live backend on :8090 with seeded accounts |

## Baseline screenshots
`docs/design/screenshots/before/`: 24 images covering the public home, studio and client logins, forgot password,
studio dashboard, client hub, workspace list and Command Centre, each at desktop 1440, tablet 768 and mobile 390.
Captured with `GP_CAPTURE=before npx playwright test -c playwright.capture.config.ts` against a demo-mode production
build on port 3100.

## Defects found during the audit (pre-existing)
1. The header links "Case Studies" (`#case-studies`) and "Why GrowthPrint" (`#why-growthprint`) pointed at ids that did not exist (the sections were `#work` and `#trust`), so clicking them did nothing. **Fixed** in the redesign.
2. The footer's "Privacy Policy", "Terms of Service" and "Security Standards" were styled as links but had no destination. **Removed** until real pages exist. They are listed as outstanding content.
3. Hero and case-study images were stock photos with people, which the brief rules out. **Replaced** with SVG diagrams.
4. In development only, Strict Mode's double session check could redirect to login on refresh. This was fixed in Phase 1 (`authSlice.ts`).
