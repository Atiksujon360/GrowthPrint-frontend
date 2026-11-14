# Backend hardening review

## Already in place
- Layered modules.
- DTO records with Bean Validation.
- ProblemDetail errors without stack traces.
- `@Transactional` services, with row locks on the sensitive paths:
  - lead conversion, which also has a unique index `uk_crm_leads_converted_client`;
  - last-owner protection;
  - single-use password reset and invitation tokens.
- Financial operations:
  - payment reports go through admin verify or reject;
  - invoice PDFs are generated server-side;
  - invoices are never deleted through the API.

## Recommendations
| ID | Priority | Change | Why | Files | Side effects | Test | Rollback |
|---|---|---|---|---|---|---|---|
| BH1 | High | Server-side pagination (`page`, `size`, `sort`, `q`) on clients, crm-leads, projects, invoices, proposals and support-requests, keeping the old array response under a compatibility flag | Unbounded payloads as data grows | Controllers and repositories of those modules; frontend `DataTable` already supports server mode | Response shape for paged calls | Controller tests, PostgreSQL integration tests, frontend e2e | Feature flag; old endpoint kept |
| BH2 | High | Default `SPRINGDOC_ENABLED` to `false` | No public API map in production | `application.yml` | Developers set `true` locally | Config test | Revert one line |
| BH3 | Medium | Persistent `audit_events` for financial and permission changes (proposal B6) | Accountability; today these are log-only | New migration plus services | One insert per write, in the same transaction | Unit and PostgreSQL tests | Forward-only migration; feature can be disabled |
| BH4 | Medium | Structured JSON logs (Logback encoder, `spring.profiles=prod`), including the correlation id, with tokens, passwords and emails masked | Searchable logs, alerting | `logback-spring.xml` | Log format change | Log assertion test | Remove profile |
| BH5 | Medium | Tighten CORS allowed headers (S12) | Least privilege | `SecurityConfig` | A client sending unexpected headers fails the preflight | CORS integration test | Revert |
| BH6 | Medium | Readiness and liveness health groups with a database check (`management.endpoint.health.group.*`) | Better orchestration and monitoring | `application.yml` | None | Actuator test | Revert |
| BH7 | Low | HikariCP limits set explicitly (`maximum-pool-size` within the Render database connection limit; `connection-timeout`) | Avoid exhausting database connections | `application.yml` | None | Load smoke test | Revert |
| BH8 | Low | Dependabot for Maven | Vulnerability updates | `.github/dependabot.yml` | Pull request noise | — | Delete file |

N+1 review: list DTOs map from single entities. Project milestones are loaded per project in project lists; check with
SQL logging during BH1 and fix with `@EntityGraph` if confirmed.
