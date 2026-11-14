# MVP2 — Phase 1 Frontend Completion Report

**Branch:** `feature/mvp2-frontend` (frontend repo) · **Date:** 2026-11-08 · **Status:** Phase 1 complete, awaiting review.
Nothing has been committed, pushed, merged or deployed. The backend repo was not touched in Phase 1.

---

## 1. What was built

All MVP2 screens run on **sample data from an isolated mock service**. A banner on every workspace page says so
("Preview data … Reset sample data").

| Area | Route | What it does |
|---|---|---|
| Business list | `/workspace` | Lists your businesses with role, empty state, "Create a business" |
| Onboarding | `/workspace/new` | 3 steps (Business → How you work → Review); validation per step; opens the new business |
| Business switcher | sidebar | Disclosure list of businesses with your role in each; per-business cache so data never bleeds across |
| Command Centre | `/workspace/{id}` | KPIs (active clients, open leads + pipeline value, win rate, team), "Needs your attention" priorities, pipeline by stage group (links to filtered leads), recent activity, role-aware quick actions |
| Clients | `/workspace/{id}/clients` | Search (debounced), status filter, pagination (10/page), empty and filtered-empty states, create dialog |
| Client detail | `/clients/{clientId}` | Details, history (links back to the source lead if converted), edit dialog, 404 state |
| Leads & pipeline | `/workspace/{id}/leads` | Search, stage-group filter (New / Qualified / In conversation / Closed, also from `?stage=`), pagination, create dialog |
| Lead detail | `/leads/{leadId}` | Details, edit, stage change, delete (Admin+, with confirmation), **Convert to client** with confirmation |
| Team | `/workspace/{id}/team` | Members table, role change with confirmation, remove / leave with confirmation, pending invitations with revoke, invite dialog with one-time copyable link, ownership transfer (type the business name to confirm) |
| Activity | `/workspace/{id}/activity` | Full activity feed, linked to the affected record |
| Settings | `/workspace/{id}/settings` | Business profile (edit for Admin+, read-only otherwise), your role, role-permission matrix |
| Join a business | `/join-business#token=…` | Reads the token from the fragment and scrubs it from the URL; preview → accept or decline; sign-in prompt when signed out; clear errors for wrong email / expired / revoked |
| Studio link | studio sidebar | "MVP2 preview → Business workspaces" |

### Lead-to-client conversion rules (enforced in UI **and** in the mock service)
- Only Manager+ sees the button; it is disabled with the reason shown when blocked:
  already converted, Lost, Do-not-contact, or no contact email.
- Confirmation dialog states it can only be done once; legal name and billing currency can be set.
- Double-click guard in the UI; the service returns **409** on a second conversion.
- After conversion: lead is **Won**, linked to the client, stage is **locked**, delete is **blocked** (409), and the
  client shows "Converted from a lead".

### Role model (mirrors backend `BusinessRole` ranks OWNER > ADMIN > MANAGER > MEMBER)
| Action | Minimum role |
|---|---|
| View clients, view/add leads, view team | Member |
| Create/edit clients, edit leads, change stage, convert | Manager |
| Delete leads, edit business profile, invite, change roles/remove lower ranks | Admin |
| Transfer ownership, manage other owners | Owner |

Non-members get **404** (not 403) for a business and all its records, matching the backend's `BusinessAccessService`.
The last owner cannot leave or be removed (409); invitations are email-bound, single-use, and stop working if the
inviter loses the authority to send them.

## 2. Architecture

```
screens ──► RTK Query hooks (features/workspace/api/workspaceApi.ts)
                 │  fakeBaseQuery + queryFn, cache tags scoped "{businessId}:{id}"
                 ▼
          workspaceService  (features/workspace/services/index.ts — the ONE switch point for Phase 3)
                 │
                 ├── MockWorkspaceService   ← Phase 1 (sessionStorage key gp_workspace_mock_v1, 180 ms latency)
                 └── HttpWorkspaceService   ← Phase 3 (not written yet)
```

- **Mocks are isolated:** nothing outside `features/workspace/services/` knows about mock data. The existing MVP1
  `lib/api` client and its mock mode are untouched.
- **Interface:** `WorkspaceService` (`services/workspaceService.ts`) is the contract the Phase 3 HTTP client must
  implement; every method takes the actor first so tenant checks are explicit.
- **Types:** `model/types.ts` mirrors the backend DTOs; fields that do not exist in the backend yet are marked
  "Phase 2".
- **Design:** reuses the MVP1 token system (`brand-*`, `ink-*`) and `components/ui/forms.tsx`; new shared pieces are in
  `components/ui/workspace-kit.tsx` (accessible `Dialog` with focus trap / Escape / focus restore, `PageHeader`,
  `FilterTabs` with `aria-pressed`, labelled `Pagination`, `StatusPill`, `StatCard`, `TableShell` with caption).

## 3. Files

**New**
- `features/workspace/model/` — `types.ts`, `permissions.ts`, `format.ts` (+ `permissions.test.ts`, `format.test.ts`)
- `features/workspace/services/` — `workspaceService.ts`, `mockWorkspaceService.ts`, `index.ts` (+ `mockWorkspaceService.test.ts`)
- `features/workspace/api/workspaceApi.ts`
- `features/workspace/components/` — `WorkspaceShell`, `BusinessScope`, `ActivityList`, `ClientFormDialog`, `LeadFormDialog`, `useDebounced`
- `features/workspace/screens/` — Businesses, Onboarding, CommandCentre, Clients, ClientDetail, Leads, LeadDetail, Team, Settings, Activity, JoinBusiness
- `components/ui/workspace-kit.tsx`
- `app/(workspace)/layout.tsx` + 10 pages/layouts under `app/(workspace)/workspace/`; `app/(public)/join-business/page.tsx` (noindex, no-referrer)
- `tests/mvp2-workspace.spec.ts`; `docs/architecture/screenshots/mvp2-frontend/*.png`; this report

**Changed (additive)**
| File | Change |
|---|---|
| `store/index.ts` | registers `workspaceApi` reducer + middleware |
| `store/store-contract.test.ts` | expects the extra `workspaceApi` key |
| `lib/routes.ts` | `/workspace` routes, `/join-business`; workspace routes are protected and noindex |
| `proxy.ts` | matcher includes `/workspace/*` and `/join-business` (noindex + no-store headers) |
| `features/admin/components/AdminLayout.tsx` | one sidebar link to Business workspaces |
| `package.json` | `npm test` also runs `features/workspace/**/*.test.ts` |
| `features/auth/authSlice.ts` + test | **bug fix (MVP1, dev-only)** — see §6 |
| `next-env.d.ts` | regenerated by `next build` (Next toggles this file between dev and build; not a code change) |

## 4. Test evidence (run on 2026-11-08)

| Check | Command | Result |
|---|---|---|
| TypeScript / lint | `npm run lint` (`tsc --noEmit`) | **Pass**, 0 errors |
| Unit tests | `npm test` | **133 / 133 pass** (was 111 before Phase 1; +21 workspace tests, +1 auth regression test) |
| Production build | `npm run build` | **Pass**; all 10 workspace routes + `/join-business` built |
| Playwright — MVP2 | `npx playwright test tests/mvp2-workspace.spec.ts` | **7 / 7 pass** |
| Playwright — full suite | `npx playwright test` | 19 pass, **4 fail — pre-existing, need a live backend** (see below) |

**Playwright MVP2 scenarios:** business list + switcher + Command Centre + Activity + Settings + Leads; onboarding with
validation; client search / filtered-empty / create with validation; **Manager converts a lead once**, then sees it
locked and cannot delete, invite or edit the profile; **Owner invites** (one-time link shown) and **changes a role**,
last owner cannot leave; non-member business id → no-access page; join link without token → clear message.
Only `GET /auth/me` is stubbed (with CORS headers); no backend or database is used.

**Unit tests cover:** role ladder, assignable/invitable roles, removal rules, conversion blockers; money/date/relative
formatting; mock service: cross-business 404, record isolation across businesses, Manager 403s, convert-once + locked
stage + blocked delete, no-email conversion, last-owner protection and ownership transfer, invitation email binding
and single use, invitation invalidated when inviter is demoted, field-level validation errors, search and pagination,
per-business dashboard, page clamping.

**Not executed (pre-existing tests that need the real backend on `localhost:8090` with seeded accounts):**
`admin-login`, `client-login`, `admin-create-project`, `public-inquiry … (requires backend)`. The backend was not
running and, per the rules, I did not connect to the shared Render database. No PostgreSQL tests were run in Phase 1.

## 5. Screenshots

`docs/architecture/screenshots/mvp2-frontend/` (captured by the Playwright spec, 1280-wide desktop):
`01-businesses` · `02-command-centre` · `03-onboarding` · `04-clients` · `05-lead-detail` · `06-convert-dialog` ·
`07-team` · `08-invitation-link` · `09-settings` · `10-leads`.

## 6. Issues found and outstanding work

1. **Fixed — MVP1 session restore in development.** React Strict Mode runs `SessionBootstrap` twice; the second
   `validateSession` was rejected as "already in progress" but still cleared `isSessionValidating`, so protected pages
   redirected to login before `/auth/me` answered (refresh in `npm run dev` logged you out). Production was not affected.
   Fix: a duplicate rejection no longer changes state. Regression test added. No security behaviour changed.
2. **Mock persistence is per browser tab** (sessionStorage). Invite-then-accept as a second user can't be shown across
   two browsers in Phase 1; it is covered by unit tests and becomes real in Phase 3.
3. **No email is sent for invitations** — the link is shown once to the inviter (same as the backend today).
4. **Not built (out of Phase 1 scope or needs backend):** projects/tasks overview in the Command Centre (MVP1 projects
   are not business-scoped yet), notifications inbox (activity feed covers it for now), drag-and-drop pipeline board,
   mobile screenshots (layouts are responsive; only desktop shots captured).
5. Activity seed entries created before this change keep their old text until "Reset sample data" is used.

## 7. Backend contract gaps for Phase 2

| Needed by the frontend | Backend today |
|---|---|
| Business profile fields: `industry`, `teamSize`, `description`, `website`, `timezone`, `currency`; `PATCH /businesses/{id}` | Only `name`, `slug`, `status` |
| Business self-service creation | Exists but gated off (`app.businesses.self-service-creation-enabled=false`) |
| `GET /businesses/{id}/clients` and `/leads` **scoped by business** with `search`, `status`/stage group, `page`, `pageSize` → `{ items, page, pageSize, total }` | Clients/leads are global (studio-wide), not business-scoped |
| Lead `estimatedValue`; lead stage-change endpoint; delete blocked when converted | Partly exists; `estimatedValue` missing |
| `POST …/leads/{id}/convert-to-client` accepting `legalName`, `billingCurrency`, `contractStartDate`, `accountManager` | Exists (V23) — confirm accepted fields |
| `GET /invitations/preview?token=` (business name, role, invited email, expiry) | Missing |
| `POST /invitations/decline` | Missing |
| `GET /businesses/{id}/dashboard` (counts, win rate, pipeline value, stage groups, priorities) | Missing |
| `GET /businesses/{id}/activity` (business-scoped audit feed) | Missing |
| Member list with `fullName`, `joinedAt` | Confirm fields |
| Error body with `fieldErrors` for validation (ProblemDetail extension) | Confirm shape |

## 8. Decisions needing your approval

1. **Business-scope the existing clients and leads** (add `business_id`, backfill MVP1 data into one default business).
   This is a schema change with a data migration — needs your sign-off before Phase 2.
2. **Conversion eligibility:** frontend blocks only Lost / Do-not-contact / no email. Should Discovered/Researching
   leads also be blocked from conversion?
3. **Who can create businesses:** keep self-service creation off in production (studio staff only) or enable it?
4. **Invitation delivery:** keep "copy the link" only, or add email sending in Phase 2 (may need a paid email service —
   I will not add one without approval).
5. **Admins removing other Admins:** currently only Owners can. Keep?

### Resolved 2026-11-08
Phase 1 approved. The CEO gave no preference on the open decisions, so the recommended defaults apply:
1. Existing clients and leads move into a default business through a forward-only migration with a backfill (no deletes).
2. Conversion is also blocked for early stages (Discovered, Researching, Needs review). The frontend's `conversionBlocker` must be updated to match in Phase 3.
3. Business creation stays staff-only (`self-service-creation-enabled=false` in production).
4. Invitations stay copy-link only. No email service and no new cost.
5. Only Owners can remove Admins (unchanged).

## 9. Next step

Phase 1 is approved and Phase 2 (backend) has started.
