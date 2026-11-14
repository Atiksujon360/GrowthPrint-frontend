# Infrastructure plan

| Concern | Current | Plan |
|---|---|---|
| Hosting | Vercel (frontend), Render web service (backend Docker), Render PostgreSQL | Keep |
| Environments | Production; staging documented but unverified; development may point at Render | **dev:** local PostgreSQL (Docker), `.env` per developer. **staging:** separate Render service plus database, `staging` branch or manual deploy. **prod:** current. Never share databases across environments |
| HTTPS / TLS | Provided by Vercel and Render; backend honours forwarded headers (`forward-headers-strategy: native`) | Verify HSTS on both domains (securityheaders.com check after S3) |
| Reverse proxy | Platform load balancers | No extra proxy needed |
| Secrets | Platform environment settings; `JWT_SECRET` required; AI key encryption key | Rotate `JWT_SECRET` and the AI encryption key per environment; document an owner and a rotation date. Never reuse across environments |
| Database backups | Unverified | Render plan with point-in-time recovery, plus a scheduled `pg_dump` to separate storage if the plan lacks it (cost needs approval) |
| Docker | Backend multi-stage, non-root, healthcheck | Add `docker-compose.dev.yml` (PostgreSQL plus backend) for local and CI e2e |
| Rollback | Platform "redeploy previous" | Documented in PRODUCTION-CHECKLIST.md; database rollback by restore only |

**Cost note:** a staging service and database on Render, and a paid database plan with point-in-time recovery, may add monthly
cost. **Both need owner approval.**
