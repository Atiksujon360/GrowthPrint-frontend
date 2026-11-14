# Production release checklist (deployment requires owner approval)

## Environment
- [ ] `JWT_SECRET` set (32+ random characters), unique to production.
- [ ] AI credentials encryption key set, unique to production.
- [ ] `CORS_ALLOWED_ORIGINS` contains only the production frontend origin.
- [ ] `SPRINGDOC_ENABLED=false`.
- [ ] `NEXT_PUBLIC_USE_MOCK_API` is **not** `true`; `NEXT_PUBLIC_API_BASE_URL` points to the production API.
- [ ] Workspace preview flag off (S5).
- [ ] `app.admin-endpoints.enabled=false`; `app.businesses.self-service-creation-enabled=false`.
- [ ] Security headers present on the frontend (S3).

## Database
- [ ] Backup taken and identifier recorded.
- [ ] Migrations rehearsed on a restored copy.
- [ ] Restore drill done within the last 30 days.

## Security sign-off
- [ ] Critical and high findings in SECURITY-AUDIT.md resolved or accepted in writing.

## Deployment
1. Deploy the backend to staging, then run the smoke tests.
2. Deploy the frontend to staging, then run the smoke tests.
3. Approve.
4. Deploy the backend to production (Render). Flyway runs at start-up.
5. Deploy the frontend to production (Vercel).

## Smoke tests (read-only)
- [ ] `/actuator/health` is UP.
- [ ] Home page loads.
- [ ] Studio login works for a test admin.
- [ ] Client hub login works for a test client, who sees only their own data.
- [ ] Dashboard loads with no 5xx.
- [ ] Invoice PDF download works.

## Rollback
- **Frontend:** Vercel "promote previous deployment".
- **Backend:** Render "rollback to previous deploy". This is safe only for additive migrations; otherwise restore the backup taken in the Database section.

## Monitoring verification
- [ ] Uptime checks green.
- [ ] Logs flowing.
- [ ] No new error spike for 30 minutes.
