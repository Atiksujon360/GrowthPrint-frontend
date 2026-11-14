# Testing strategy

## Current results (executed 2026-11-10)
| Suite | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| Frontend unit tests (`npm test`) | PASS: 143/143 |
| Frontend builds (real and demo env) | PASS |
| Frontend Playwright (no backend running) | 19 PASS, 17 SKIPPED (screenshot capture specs; opt-in database-writing test). 3 NOT TESTED (`admin-login`, `client-login`, `admin-create-project`) because the backend was not running |
| Backend `mvnw clean test` | See the "Backend run" section below (recorded from the actual run) |

## Gaps
- No component tests (React Testing Library is not installed).
- No end-to-end run against a real backend in CI. The frontend CI runs Playwright on `main` with no backend, so the backend-dependent specs fail there.
- Backend PostgreSQL integration tests run in backend CI (service container) but are skipped locally unless `GP_IT_DATABASE_URL` is set.
- **Full workflow Lead → Client → Project → Proposal → Invoice → Payment:**
  - lead conversion and portal onboarding are covered by backend tests;
  - no single end-to-end browser test covers the chain;
  - **Tasks do not exist** (backend proposal B2).
- Automation Studio has no backend (B7); nothing to test beyond the "not connected" state.

## Target strategy
| Layer | Tooling | Scope |
|---|---|---|
| Unit (frontend) | node:test (existing) | Pure logic: metrics, labels, permissions, mock-service rules, slices |
| Component | Optional, needs a new dev dependency: React Testing Library plus jsdom | Shell, forms, dialogs. **Needs approval** |
| Unit (backend) | JUnit 5 and Mockito (existing) | Services, validators, security rules |
| Integration (backend) | Spring Boot tests with real PostgreSQL in CI (existing) | Repositories, migrations, role matrix, tenant isolation, workflows |
| Contract | Generate the OpenAPI document in backend CI and diff it on pull requests | Detect breaking API changes |
| E2E | Playwright against a **staging or ephemeral stack** (backend container plus PostgreSQL service in CI, seeded with the seed command) | Login and logout per role; route guards; Lead → convert → client → project → proposal decision → invoice → client payment report → admin verify; outreach approve (draft only); client portal isolation (client A cannot see client B); negative paths: 401, 403, validation errors |
| Smoke | Read-only Playwright subset after deploy | Health, login page, public inquiry form renders (no submission in production) |

Database-writing e2e tests run only against isolated databases (`GP_E2E_BACKEND_WRITES=1`).

## Backend run
`./mvnw -B clean test` (JDK 21, 2026-11-10, backend branch `feature/mvp2-m1-security-hardening` including the owner's
staged review fixes): **882 tests, 0 failures, 0 errors, 46 skipped**. The skips are the PostgreSQL-tagged integration
tests (no `GP_IT_DATABASE_URL` locally) plus the opt-in seed tests. Those database tests run in backend CI with a
PostgreSQL service container.
