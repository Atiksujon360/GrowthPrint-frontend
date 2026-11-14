# Monitoring and recovery

| Capability | Current | Plan |
|---|---|---|
| Health | `/actuator/health` (no details), Docker HEALTHCHECK | Readiness and liveness groups including the database (BH6); external uptime check on frontend and API (free tier of an uptime monitor) |
| Logs | Plain text, platform log viewer | JSON logs with correlation id; mask tokens, passwords and emails; keep the existing `SecurityAudit` events |
| Errors | None | Error tracking for frontend and backend (for example Sentry free tier). **Needs approval** (third-party data processing) |
| Performance | None | Platform metrics; `pg_stat_statements` on staging |
| Alerting | None | Uptime down, 5xx rate, failed deploy, database storage over 80% |
| Backups | Unverified | Verified point-in-time recovery plus a monthly restore drill |

## Restore drill
Do this on an isolated database, never production:
1. Create a restore from the latest backup into a new database.
2. Run the backend locally against it with `ddl-auto: validate`.
3. Check that Flyway is at the expected version.
4. Run read-only smoke queries for row counts on users, clients, invoices and projects.
5. Record the date, duration and result here.

**Sensitive data rule:** logs and error reports must never contain JWTs, passwords, reset or invitation tokens, AI keys, or
full request bodies of auth endpoints.
