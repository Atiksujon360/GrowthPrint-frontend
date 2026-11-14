# Production hardening: progress and remediation plan

**Status 2026-11-10:** read-only audit complete. **No source code or infrastructure changed** for this phase. The
homepage polish done in the same session is UI work requested separately.

**Note on scope:** the brief says the UI redesign is complete. It is not fully complete. The dashboard, shells, summary
strips and homepage are done; detail drawers and the finance, outreach, portal and workspace screens remain on
`docs/ui-transformation/IMPLEMENTATION-PROGRESS.md`. Nothing is committed on either repository's working branch.

## Prioritized remediation plan (awaiting approval)
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
