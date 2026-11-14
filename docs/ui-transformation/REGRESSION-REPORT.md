# Regression report

Statuses:
- **PASS:** run and observed.
- **FAIL:** run and failed.
- **NOT RUN:** not executed.
- **PRE-EXISTING:** failed before any UI work.

## 2026-11-10: after Phase 5 and the dashboard
| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| `npm test` | PASS: 143/143 |
| `npm run build` (real env and demo env) | PASS |
| Playwright full suite | 19 PASS, 17 SKIPPED (capture specs and the opt-in database-writing test). 3 NOT TESTED: `admin-login`, `client-login` and `admin-create-project` timed out because the backend on :8090 was not running |
| Capture spec (demo build) | PASS (16) |

## Earlier results (working tree, navy-kit phase paused, 2026-11-09)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm test` | PASS: 138/138 (includes new `labels` and `pageWindow` tests) |
| `npm run build` (demo env) | PASS |
| Playwright capture spec (16 screens) | PASS |
| Playwright `auth-and-routes` (12), `mvp2-workspace` (7) | PASS in the previous step; **NOT RUN** after the AppShell refactor |
| Playwright `admin-login` (backend) | PASS (with the owner's backend on :8090, before the AppShell refactor) |
| Playwright `client-login`, `admin-create-project` | Previously PRE-EXISTING failures (assertions for UI that never existed); assertions corrected (D5); **NOT RUN** since |
| Playwright inquiry submit | Now opt-in (`GP_E2E_BACKEND_WRITES=1`) because it writes to the database |

**Data note:** one earlier run of the inquiry-submit test created at least one test inquiry in the database used by
the owner's local backend. The owner should remove it if that backend points at a shared database.

The full suite is re-run at the start of Phase 5 and after every phase; results are recorded here.
