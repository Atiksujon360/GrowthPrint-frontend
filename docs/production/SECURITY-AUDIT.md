# Security audit (read-only, 2026-11-10)

**Scope:** frontend `GrowthPrint-frontend` (branch `feature/growthprint-complete-design-transformation`) and backend
`growthprint-backend` (branch `feature/mvp2-m1-security-hardening`).

**Method:** code and configuration review against the OWASP ASVS 4 areas and OWASP Top 10 (2021), plus `npm audit` and a
backend test run. No penetration test was performed, no production system was contacted, and no secrets were read
or printed. Configuration values were redacted when inspected.

## Controls verified as present
| Area | Evidence |
|---|---|
| Authentication | JWT HS-signed. The secret is required from `JWT_SECRET`; startup is refused if it is missing or under 32 characters. Token version claim revokes sessions on password change, suspension or role change. Authorities are reloaded from the database per request |
| Authorization | URL rules in `SecurityConfig` plus `@PreAuthorize` per module. Roles ADMIN, TEAM_MEMBER (module permissions), CLIENT. Portal endpoints are scoped to the caller's client. MVP2 `BusinessAccessService` returns 404 for non-members |
| Sessions and CSRF | `SessionCreationPolicy.STATELESS`; the bearer token travels in the `Authorization` header, not a cookie, so disabling CSRF is correct |
| CORS | Explicit origin list from `CORS_ALLOWED_ORIGINS`, not a wildcard |
| Brute force | `LoginThrottle`, login, account-recovery and general `RateLimitFilter` |
| Passwords | Policy of 12–128 characters, letter and digit, not a common password; bcrypt hashing; single-use, hashed, 30-minute reset tokens; tokens kept in URL fragments |
| Errors | `include-stacktrace: never`, `include-message: never`; ProblemDetail responses |
| Injection | Spring Data JPA with parameter binding; no string-built SQL found in the review |
| XSS (frontend) | React escaping; no `dangerouslySetInnerHTML` in application code |
| File upload | **None exist** (no `MultipartFile` endpoints), so the risk class is absent |
| Secrets in git | `.env`, `.env.*` and `.dev-credentials` are git-ignored; no secret files tracked in either repository (checked with `git ls-files`) |
| Dependencies (frontend) | `npm audit --omit=dev`: **0 vulnerabilities** |
| Actuator | Only `health` and `info` exposed; `show-details: never` |

## Findings
| ID | Severity | Finding | Evidence | Remediation |
|---|---|---|---|---|
| S1 | **Critical (until verified)** | Production database backup and restore is unverified | DEPLOYMENT.md describes backups but no restore test is recorded. Render's free PostgreSQL tier has no backups (plan unknown from the repository) | Confirm the Render plan includes point-in-time recovery. Run and record one restore into an isolated database |
| S2 | **High** | The development guide allows the shared Render database for development | DEPLOYMENT.md "Development: Render PostgreSQL (external connection)". A local backend run during e2e tests may write test data into it | Separate development, staging and production databases; development uses local PostgreSQL only (CI already does) |
| S3 | **High** | The frontend sends no security headers: no CSP, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` or `X-Content-Type-Options` | No `next.config` exists; `proxy.ts` only sets `X-Robots-Tag` | Add headers in `next.config.ts` (or `proxy.ts`): a strict CSP allowing only the API origin, `frame-ancestors 'none'`, `nosniff`, referrer policy. Test with the browser and Playwright |
| S4 | **High** | The JWT is stored in `sessionStorage`, readable by any script if an XSS ever lands | `features/auth/authSlice.ts` (`gp_auth_token`) | Short term: S3's CSP. Long term (needs a backend change and approval): HttpOnly, Secure, SameSite cookie, with CSRF protection re-enabled for cookie auth |
| S5 | **High** | The MVP2 business workspace runs on **sample data in the browser** and is linked from the production studio sidebar ("Preview → Business workspaces") | `features/workspace/services/index.ts` (`USING_MOCK_WORKSPACE_DATA = true`) | Hide behind a feature flag (`NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW`, default off) until backend Phase 2 integration |
| S6 | Medium | API docs (Swagger UI) are on by default | `SPRINGDOC_ENABLED` defaults to `true` | Set it to `false` in staging and production; flip the default to `false` |
| S7 | Medium | Rate limits are held in memory, per instance | `InMemoryRateLimiter` | Acceptable for one instance. Before scaling out, move to a shared store (Redis) or the edge |
| S8 | Medium | Security and business audit events are only written to logs | `SecurityAudit` | Persistent `audit_events` table (backend proposal B6), at least for financial and permission changes |
| S9 | Medium | Demo mode must never reach production | `NEXT_PUBLIC_USE_MOCK_API=true` switches to demo data, including the demo role-switcher | A build-time guard in CI that fails a production build if it is `true`; production checklist item |
| S10 | Low | Backend dependencies are not scanned automatically | No OWASP dependency-check, Dependabot or Renovate | Enable Dependabot for Maven and npm (free) |
| S11 | Low (**fixed 2026-11-10**) | An unused `GEMINI_API_KEY` entry exists in the frontend `.env`/`.env.example` (AI keys live encrypted in the backend) | `grep`: no code uses it | Remove the entry so no one puts a live key in a frontend env file |
| S12 | Low | Wide CORS allowed headers (`*`) with credentials | `SecurityConfig` | Restrict to `Authorization`, `Content-Type`, `X-Correlation-ID` |
