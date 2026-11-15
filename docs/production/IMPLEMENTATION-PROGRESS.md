# Production hardening: progress and remediation plan

**Status 2026-11-10:** read-only audit complete. **No source code or infrastructure changed** for this phase. The
homepage polish done in the same session is UI work requested separately.

**Note on scope:** the brief says the UI redesign is complete. It is not fully complete. The dashboard, shells, summary
strips and homepage are done; detail drawers and the finance, outreach, portal and workspace screens remain on
`docs/ui-transformation/IMPLEMENTATION-PROGRESS.md`. Nothing is committed on either repository's working branch.

## Prioritized remediation plan (approved 2026-11-10)
| # | Priority | Item | Repository | Approval notes |
|---|---|---|---|---|
| R1 | Critical | Verify database backups and run one restore drill into an isolated database (S1) | Ops | May need a paid Render plan |
| R2 | High | Separate dev, staging and production databases; development off the shared database (S2) | Ops and docs | Staging may cost money |
| R3 | High | Frontend security headers and CSP (S3) | Frontend | Code change, testable locally |
| R4 | High | Feature-flag the MVP2 workspace preview off by default (S5) | Frontend | Code change |
| R5 | High | Frontend CI: tsc, unit, build, Playwright without backend specs, mock-mode guard | Frontend | Free |
| R6 | High | Default API docs off in production (S6/BH2) | Backend | One-line config |
| R7 | High | Server-side pagination (BH1) | Both | Larger; compatibility flag |
| R8 | Medium | Structured logs plus readiness checks (BH4, BH6); uptime monitoring | Backend and ops | Monitoring service choice |
| R9 | Medium | Persistent audit events (BH3/B6) | Backend | Migration |
| R10 | Medium | Full-stack e2e workflow suite in CI (TESTING-STRATEGY.md) | Both | Free |
| R11 | Medium | Error tracking (Sentry or similar) | Both | Third-party service |
| R12 | Low | CORS headers tightening, Dependabot, remove the unused `GEMINI_API_KEY` entry, HikariCP limits | Both | — |
| R13 | Later (needs backend) | HttpOnly cookie sessions (S4) | Both | Auth change; explicit approval |

Each item lists why, files, side effects, tests and rollback in BACKEND-HARDENING.md, SECURITY-AUDIT.md and
CI-CD-STRATEGY.md.

## Status (2026-11-15)
| # | Status | What changed | Verified by |
|---|---|---|---|
| R3 | Done | `next.config.ts`: CSP, nosniff, frame DENY, referrer and permissions policies, HSTS in production, no `X-Powered-By` | Production build served locally: headers present; homepage and login hydrate with no CSP console errors |
| R4 | Done | `NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW` (default off) gates `/workspace/**`, `/join-business` and the studio links | Production build: those routes return 404; with the flag on, the MVP2 workspace e2e suite passes |
| R5 | Done | Frontend CI: type check, unit tests, `scripts/check-prod-env.mjs`, production build, Playwright without `@backend`; frontend Dependabot. `PW_PORT` lets Playwright use its own server | Locally: tsc PASS, unit 147/147 PASS, build PASS, Playwright 19 passed / 16 skipped. GitHub Actions: NOT TESTED (not pushed by me) |
| R6 | Done | Backend `SPRINGDOC_ENABLED` now defaults to false; the `dev` and `prod` profiles set it explicitly | Backend suite PASS |
| R8 | Code done, ops pending | Liveness `/actuator/health/liveness` and readiness `/actuator/health/readiness` (includes the database), both public with no details; `application-prod.yml` adds ECS JSON console logs | Backend suite PASS. **Owner action:** set `SPRING_PROFILES_ACTIVE=prod` on Render and point the health check at `/actuator/health/readiness`; choose an uptime monitor |
| R12 | Done | CORS allowed headers restricted to Authorization, Content-Type, Accept, X-Requested-With and X-Correlation-ID (2 new tests); HikariCP pool explicit (`DB_POOL_MAX_SIZE` default 10, `DB_POOL_MIN_IDLE` default 2); backend Dependabot (maven, actions, docker); unused AI Studio entries removed from `.env.example` | Backend `mvnw clean test`: 884 tests, 0 failures, 0 errors, 46 skipped |
| R1, R2 | Owner action | Backup restore drill and environment separation need Render dashboard access | NOT TESTED |
| R7, R9, R10, R11, R13 | Not started | Need the decisions listed in the plan | — |

Side effect to know: with `SPRINGDOC_ENABLED` unset, Swagger UI is off unless the `dev` profile is active. Run locally with `SPRING_PROFILES_ACTIVE=dev` (or set `SPRINGDOC_ENABLED=true`) to keep it.
Rollback for any item: revert its files; none of these changes touch the database or migrations.

## Data reset, first admin and AI providers (2026-11-15)
Approved decisions: reset on the **local database only** (nothing was run on Render); first admin from environment variables; AI security,
reliability and set-up fixes with tests.

| Area | Change | Verified by |
|---|---|---|
| Reset | `scripts/reset-dev-data.sql` and `.ps1` (backend repo): local hosts only, typed database name, backup first, one transaction, keeps schema, default business, real admins and the AI settings row. `verify-reset-local.ps1` runs the whole thing on a throwaway database | Parse-checked only. **NOT TESTED against a live database**: it needs the local postgres password, so you run `verify-reset-local.ps1` |
| First admin | `AdminBootstrapService` creates the first admin from `BOOTSTRAP_ADMIN_EMAIL` / `_PASSWORD` when none is active, restores the default-business owner, never changes an existing account or logs the password | 8 unit tests PASS |
| Seed | `SeedDataCommand` no longer contains or logs fixed passwords (random, written to the git-ignored `.dev-credentials`; path overridable). Playwright `@backend` specs read credentials from `GP_E2E_*` variables | Backend suite PASS; `@backend` specs NOT TESTED (no live backend) |
| AI: key | Startup check (fail fast in `prod`), malformed vs missing vs unreadable key told apart, new `KEY_UNREADABLE` status | 4 + 5 unit tests PASS |
| AI: SSRF | `AiEndpointGuard`: custom endpoint must be public https, checked on save and before every call; connect timeout added | 8 unit tests PASS. DNS rebinding between check and connect is reduced, not eliminated (documented) |
| AI: keys and tests | Changing provider or custom endpoint needs explicit confirmation before the key is discarded; AI can only be turned on after a passing test, and a connection change clears the test | 5 unit tests PASS |
| AI: reliability | Provider calls no longer hold a database transaction; the daily limit is atomic per user and config failures do not use up quota; unexpected errors are recorded | 4 tests PASS incl. 12-thread race (limit 3, exactly 3 allowed) |
| AI screen | Three-step flow (set up, test, turn on), one-step save of provider, model and key, confirmation dialog, clearer messages | 8 unit tests and 3 Playwright tests PASS against a stubbed API. **Real provider calls NOT TESTED** |

Totals: backend `mvnw clean test` 913 tests, 0 failures, 0 errors, 46 skipped. Frontend: tsc PASS, unit 160/160, production build PASS,
Playwright (no `@backend`) 22 passed, 16 skipped.

Side effects to know: the AI settings API now answers 409 `KEY_RESET_NOT_CONFIRMED` and `CONNECTION_NOT_TESTED`; any other client of
`PUT /admin/ai/settings` must send `confirmKeyReset` and test first. With `AI_ALLOW_LOCAL_ENDPOINTS` off (the default), local model servers
are refused outside the `dev` profile. Rollback: revert the files; no migration was added.

Still open: R1 and R2 (owner, Render), R7 pagination, R9 audit events, R10 full-stack e2e, R11 error tracking, R13 cookie sessions.
