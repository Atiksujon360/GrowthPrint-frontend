# Database audit

| Item | State |
|---|---|
| Engine | PostgreSQL 16 (Render); CI and tests use `postgres:16-alpine` |
| Migrations | Flyway V2–V23, forward-only; `ddl-auto: validate` stops the app if entities and schema diverge; V18 intentionally unused |
| Constraints | CHECK constraints for enums, NOT NULL, FKs, partial unique indexes (pending invitation per email, converted client) |
| Indexes | 75 across the migrations (FKs and status/date filters). To verify with `pg_stat_user_indexes` on staging after load |
| Transactions | Service-level `@Transactional`; row locks for conversions and owner changes; `open-in-view: false` |
| Pending schema work | Backend Phase 2 V24 (business scoping with backfill) and UI-driven V25+ (B1–B8). Not applied |
| Backups | **Not verified** (SECURITY-AUDIT S1) |

## Migration checklist (for any future release)
1. Rehearse on a restored copy of production in an isolated database (never the shared database).
2. Take a backup immediately before applying, and record its identifier.
3. Apply through application start-up (Flyway) during a low-traffic window.
4. Verify `flyway_schema_history`, row counts and smoke tests.
5. **Rollback:** application rollback is safe for additive migrations. Destructive or backfill migrations need a restore from step 2. Migrations must stay additive (expand/contract).

## Recommendations
- Verify the Render plan has point-in-time recovery, and perform one documented restore test (MONITORING-AND-RECOVERY.md).
- Separate databases for development (local), staging and production.
- Enable `pg_stat_statements` on staging to find slow queries before BH1.
