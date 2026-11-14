# GrowthPrint UI transformation

Current direction (2026-11-09):
- **Reference A (COMPREO)** for the internal app;
- **Reference B (Synthex)** for the Automation Studio;
- **Reference C (Aurevo)** for the public website, adapted to agency positioning.

| Document | Purpose |
|---|---|
| [ROUTE-INVENTORY.md](ROUTE-INVENTORY.md) | Every route, its shell and its redesign target; features not present |
| [DESIGN-SPECIFICATION.md](DESIGN-SPECIFICATION.md) | Reference analysis and page compositions |
| [DESIGN-TOKENS.md](DESIGN-TOKENS.md) | Colours (contrast-checked), type, layout, radii, shadows, chart palette |
| [COMPONENT-INVENTORY.md](COMPONENT-INVENTORY.md) | One component per job; reuse / restyle / new / deferred |
| [DATA-REQUIREMENTS.md](DATA-REQUIREMENTS.md) | Each metric against the real backend: available, interim or missing |
| [BACKEND-CHANGE-PROPOSAL.md](BACKEND-CHANGE-PROPOSAL.md) | B1–B8 for approval (summary endpoint, tasks, completion dates, expenses, activity, workflows, pagination) |
| [IMPLEMENTATION-PROGRESS.md](IMPLEMENTATION-PROGRESS.md) | Current state, decisions E1–E8, phases |
| [VISUAL-QA.md](VISUAL-QA.md) | Prototype and implementation screenshot review |
| [REGRESSION-REPORT.md](REGRESSION-REPORT.md) | Test results with honest statuses |
| [prototypes/](prototypes/) | Static HTML prototypes plus `screenshots/` (dashboard, login, homepage, Automation Studio) |

Still valid: [REPOSITORY-AUDIT.md](REPOSITORY-AUDIT.md) (stack, risks, baseline) and
[RESEARCH-AND-TOOLING.md](RESEARCH-AND-TOOLING.md) (library comparison).

**Superseded:** [COMPONENT-PLAN.md](COMPONENT-PLAN.md) and [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) describe the
earlier navy/blue kit direction and are kept for history only.

## Skills and tools used for this proposal
| Requested | Status |
|---|---|
| Anthropic Frontend Design, UI UX Pro Max | Available; used |
| Vercel React Best Practices | Available (`~/.agents/skills`); rules applied (dynamic imports, no new barrels) |
| Impeccable, Vercel Composition Patterns, Vercel Next.js Best Practices, Web Design Guidelines | **Not installed.** Equivalent checks done by hand (contrast, hierarchy, composition) |
| Context7 | Installed; **needs `/mcp` authorisation** before use |
| Playwright | Installed (1.64); used to render prototypes |
| Accessibility auditor | Accessibility checks applied manually (AA contrast maths, focus, landmarks, headings) |
