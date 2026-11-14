# Architecture and dependency inventory (2026-11-10)

## System
```
Browser ──HTTPS──▶ Next.js frontend (Vercel) ──HTTPS, Bearer JWT──▶ Spring Boot API (Render, Docker) ──▶ PostgreSQL 16 (Render)
```

## Frontend (`GrowthPrint-frontend`)
| Item | Version / state |
|---|---|
| Next.js | 16.4.2, App Router, `proxy.ts` (Next 16 middleware) |
| React | 19.0.1 |
| TypeScript | 7 (`lint` = `tsc --noEmit`; no ESLint) |
| State | Redux Toolkit 2.13 (`auth`, `agency`, `ui`, RTK Query `workspaceApi`) |
| Other libraries | Tailwind 4.3, recharts 3.10 (lazy-loaded), motion 12, lucide-react, react-hook-form, zod, date-fns |
| API client | `lib/api/client.ts`: base URL from `NEXT_PUBLIC_API_BASE_URL`; 401 handler clears the session; retries idempotent requests only |
| Auth state | JWT in `sessionStorage`, validated by `GET /auth/me` on load; `WorkspaceGuard` protects route groups |
| Routes | Public site, auth pages, `/studio/ops` (12 tabs), `/client-hub` (7 tabs), `/workspace/**` (MVP2, mock data) |
| Error handling | `app/error.tsx`, route `error.tsx`, `ErrorState`/`Notice` components, toast notifications |
| Tests | node:test unit tests 143/143; Playwright e2e (19 pass without backend, 3 need one) |
| CI | `.github/workflows/playwright.yml`: Playwright only, on `main`/`master` |
| Config | No `next.config` file (no security headers). `.env.example` tracked |

## Backend (`growthprint-backend`)
| Item | Version / state |
|---|---|
| Runtime | Java 21, Spring Boot 4.1.1 (web, data-jpa, validation, security, actuator, flyway) |
| Libraries | jjwt, springdoc-openapi, openpdf, springboot4-dotenv, Testcontainers |
| Layers | controller → service → repository per module; DTO records; Bean Validation; `GlobalExceptionHandler` (ProblemDetail) |
| Modules | auth, account, useradmin, business (MVP2), client, crm.lead, lead (inquiries), project (milestones), proposal, invoice (payment reports, PDF), outreach, support (AI triage), ai (encrypted provider keys), seed |
| Database | PostgreSQL 16; Flyway V2–V23 (V18 intentionally skipped); `ddl-auto: validate`; `open-in-view: false`; 75 indexes |
| Security | See SECURITY-AUDIT.md |
| Observability | Actuator `health`/`info`; correlation id header; `SecurityAudit` log events; plain-text logs |
| Container | Multi-stage Dockerfile (Maven build, Temurin 21 JRE), non-root user, `HEALTHCHECK` on `/actuator/health`, port 10000 |
| CI | `.github/workflows/ci.yml`: JDK 21, `mvnw verify` with a PostgreSQL 16 service container. It guards against silently skipped database tests and refuses Render hosts |
| Tests | 58 test classes; results in TESTING-STRATEGY.md |

## Data volumes and patterns
- All list endpoints return full arrays (no pagination); the frontend paginates in the browser.
- Dashboard figures are computed in the browser from list calls.
- Fine at MVP scale; see the backend proposal B1/B8 in `docs/ui-transformation/BACKEND-CHANGE-PROPOSAL.md`.

## Missing capabilities relevant to production
- staging environment (documented, not verified);
- restore-tested backups;
- error tracking;
- alerting;
- structured logs;
- frontend CI quality gates;
- security headers;
- persistent audit trail.

Product capabilities that do not exist yet (not production defects):
- tasks;
- expenses;
- workflow engine (Automation Studio);
- activity log API.
