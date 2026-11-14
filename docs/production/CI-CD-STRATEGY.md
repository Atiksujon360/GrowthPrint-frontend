# CI/CD strategy

## Today
- **Backend:** `ci.yml` builds and runs every test with a PostgreSQL 16 service on pushes to `main`, `feature/**` and `fix/**`. Good.
- **Frontend:** `playwright.yml` runs Playwright only, on `main`/`master`. It has no type-check, unit or build step, and backend-dependent specs fail without a backend.
- **Deployment:** Render (backend) and Vercel (frontend) from GitHub. There is no documented approval gate or staging promotion.

## Proposed (free GitHub Actions tier)
| Pipeline | Steps |
|---|---|
| Frontend PR | `npm ci` → `tsc --noEmit` → `npm test` → `npm run build` (real env) → Playwright **without** backend-dependent specs → guard that `NEXT_PUBLIC_USE_MOCK_API` is not `true` for production builds |
| Full-stack e2e (nightly and PRs to `main`) | Start PostgreSQL service → backend container from the Dockerfile → seed → frontend build → Playwright workflow suite |
| Backend PR | Existing `ci.yml`, plus OpenAPI diff, plus Dependabot |
| Release | Merge to `main` deploys to **staging** automatically. Production is promoted manually (approval) after staging smoke tests pass |

Branch protection on `main`: required checks plus review. Secrets live only in GitHub, Render and Vercel settings.
