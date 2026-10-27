# GrowthPrint Frontend - AI Agent Guidelines

Shared rules for Devin Desktop, Codex, and other AI coding agents working on this Next.js frontend.

## 🚨 GLOBAL RULE - READ FIRST BEFORE ANY ACTION

**CRITICAL:** Before implementing, changing, or doing ANYTHING in this project, Devin MUST read the following governance files in this order to understand context:

1. **AGENTS.md** (this file) - AI coding rules, safe editing, tool handoffs
2. **PROJECT.md** - Project purpose, features, users, scope, requirements
3. **PROJECT_STATUS.md** - Current progress, blockers, uncommitted changes, next tasks
4. **ARCHITECTURE.md** - System architecture, modules, boundaries, data flow
5. **SECURITY.md** - Security policies, authentication, authorization, secrets
6. **QUALITY_GATES.md** - Required tests, builds, security scans, release criteria
7. **DEVELOPMENT.md** - Setup instructions, verified commands, troubleshooting
8. **DECISIONS.md** - Technical decisions and rationale

**Why this is required:**
- Prevents unintended breaking changes
- Ensures alignment with project goals and architecture
- Avoids duplicating work or reversing decisions
- Identifies current blockers and uncommitted changes
- Respects established security and quality standards
- Provides context for informed decision-making

**Exception:** If you are only reading or inspecting files (not making changes), you may skip this rule. But before ANY edit, creation, deletion, or code change, you MUST read these files first.

## 🧪 Frontend Testing - Automatic Activation

**CRITICAL:** The `frontend-testing` skill (`.devin/skills/frontend-testing/SKILL.md`) activates automatically for these tasks:

- Frontend feature development
- React/Next.js component work
- UI bug fixes
- Frontend refactoring
- Test writing or review
- Testing workflow planning

**When activated, the skill enforces:**
- The Double Gate workflow: test planning (first task) → implementation → test verification (last task)
- 55+ testing rules from the practica.js Frontend Testing Skill
- Mandatory test quality checks before task completion
- Proper test structure, assertions, and mocking patterns

**See also:** `.devin/rules/frontend-testing.md` for always-on testing rules.

## Repository Context

**Technology Stack:**
- Next.js 16.4.2 with App Router
- React 19.0.1
- TypeScript 7.0.2
- Redux Toolkit 2.13.0 for state management
- Tailwind CSS 4.3.3 for styling
- React Hook Form 7.90.0 with Zod 4.6.7 for forms
- Recharts 3.10.1 for charts
- Motion 12.23.24 for animations

**Project State:**
- Three route groups: `(public)`, `(admin)`, `(portal)`
- Mock mode enabled by default (`NEXT_PUBLIC_USE_MOCK_API=true`)
- Comprehensive admin interface (dashboard, leads, clients, projects, support, invoices, outreach, automation)
- Client portal interface (dashboard, projects, proposals, invoices, requests, messages)
- Public landing page with inquiry form
- Multiple uncommitted changes pending
- No GitHub Actions CI configured

## Safe Editing Rules

### Before Making Changes

1. **Read existing files first** - Always read files before editing to understand context and patterns
2. **Check Git status** - Run `git status` to see uncommitted changes; preserve user work
3. **Verify dependencies** - Check `package.json` before adding new dependencies; prefer existing libraries
4. **Review existing components** - Understand component patterns before writing new components
5. **Check API contracts** - Review `lib/api/client.ts` before adding new API calls

### Code Changes

1. **Follow feature-based architecture** - Use the feature-arch skill: `.agents/skills/feature-arch/SKILL.md`
2. **Use TypeScript strictly** - Enable strict mode, avoid `any`, use proper types
3. **Colocate tests with code** - Place test files next to implementation files
4. **Use path aliases** - Import with `@/*` instead of relative paths
5. **Server components by default** - Use Server Components for data fetching, Client Components for interactivity
6. **Avoid prop drilling** - Use context or Redux for shared state
7. **Handle loading and error states** - Show loading indicators and error messages
8. **Add accessibility** - Use semantic HTML, ARIA labels, keyboard navigation

### Redux Changes

1. **Follow Redux Toolkit patterns** - Use `createSlice`, `createAsyncThunk`
2. **Colocate state with features** - Keep slices in feature directories
3. **Use typed hooks** - Use `useAppDispatch` and `useAppSelector` with proper typing
4. **Minimize local Redux actions** - Prefer API calls over local state mutations
5. **Reset state on logout** - Clear Redux state when user logs out
6. **Test slices** - Write unit tests for reducers and async thunks

### Form Changes

1. **Use React Hook Form** - For all form handling with Zod validation
2. **Validate on client and server** - Client validation for UX, server validation for security
3. **Show clear error messages** - Display validation errors inline
4. **Handle submit state** - Disable submit button during submission
5. **Test form behavior** - Write tests for form validation and submission

### API Changes

1. **Follow existing API client pattern** - Add adapters to `lib/api/client.ts`
2. **Type API responses** - Use TypeScript interfaces for API contracts
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Use mock mode carefully** - Default to mock mode; test with real API before production
5. **Add request/response types** - Define types in `types/` directory

### Styling Changes

1. **Use Tailwind CSS** - Follow Tailwind v4 patterns
2. **Use UI components** - Leverage shadcn/ui components from `components/ui/`
3. **Responsive design** - Mobile-first approach with Tailwind breakpoints
4. **Dark mode support** - Ensure components work in light and dark modes
5. **Accessibility** - Ensure sufficient color contrast, focus indicators, semantic HTML

## Tool Handoffs

### Devin Desktop → Codex (Review/Alternative Implementation)

**Handoff Context to Include:**
- Current task and specific file paths being modified
- Existing test coverage and test results
- Redux state structure and slice being modified
- API client contracts and mock data usage
- Component props and data flow
- Uncommitted Git changes and rationale

**When to Use Codex:**
- Alternative implementation review for complex components
- Second opinion on Redux state structure
- Code review for performance optimizations
- Refactoring suggestions for component organization
- Accessibility audit of UI components

### Devin Desktop → IntelliJ IDEA (Testing/Debugging)

**When to Use IntelliJ:**
- Running Next.js dev server with debugger
- Testing components in browser with React DevTools
- Inspecting Redux state with Redux DevTools
- Step-through debugging of complex component logic
- Running specific tests with IDE test runner

**Handoff Context:**
- Dev server: `npm run dev` (runs on http://localhost:3000)
- Build: `npm run build`
- Lint: `npm run lint` (TypeScript compiler with --noEmit)
- Test: `npm test` (Node.js native test runner)
- Environment variables in `.env`: NEXT_PUBLIC_USE_MOCK_API, NEXT_PUBLIC_API_URL

## Testing Requirements

### Unit Tests

1. **Component tests** - Test component rendering, user interactions, props
2. **Redux slice tests** - Test reducers, async thunks, state updates
3. **API client tests** - Test API call formatting and error handling
4. **Utility function tests** - Test pure functions with edge cases
5. **Run before committing** - `npm test` must pass

### Integration Tests

1. **Form tests** - Test form validation and submission flow
2. **Redux integration tests** - Test thunk dispatch and state updates
3. **API integration tests** - Test actual API calls (when mock mode disabled)
4. **Navigation tests** - Test routing and navigation flows

### Test Pattern

```typescript
import { describe, it, expect } from 'node:test';
import { render } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ComponentName />);
    expect(getByText('Expected Text')).toBeDefined();
  });
});
```

## Scope Control

### In Scope

- New components following existing patterns
- New pages in route groups
- Redux slices for state management
- API client adapters for backend endpoints
- Form components with validation
- UI components with shadcn/ui
- Styling with Tailwind CSS
- Unit and integration tests
- Type definitions in `types/`

### Out of Scope (Requires Authorization)

- Removing or bypassing authentication
- Disabling security features
- Exposing admin features without auth
- Hardcoding API credentials or tokens
- Modifying production data directly
- Changes to deployment infrastructure (Vercel, CI/CD)

### Definition of Done

A task is complete when:
1. Code compiles without errors: `npm run lint`
2. All tests pass: `npm test`
3. New code has test coverage (components, slices, utilities)
4. TypeScript types are defined and strict
5. Component is accessible (keyboard navigation, ARIA labels, color contrast)
6. Redux state updates correctly
7. API calls work with both mock and real API
8. No new security vulnerabilities introduced
9. Code follows existing patterns (feature-based architecture, colocation)
10. Git changes are minimal and focused on the task

## Stop Conditions

**Stop and Ask User:**
- Removing authentication checks or protected routes
- Disabling mock mode without verifying real API works
- Hardcoding API credentials or tokens
- Modifying Redux store structure globally
- Changing route group structure (e.g., moving page from admin to portal)
- Adding new external dependencies not in package.json
- Modifying production environment variables
- Removing or disabling tests without replacement
- Breaking existing API contracts

## Project-Specific Guidelines

### Feature-Based Architecture

Use the feature-arch skill for reference: `.agents/skills/feature-arch/SKILL.md`

Key patterns:
- Feature folders contain components, hooks, slices, types
- Public API at feature root, internal implementation hidden
- Unidirectional data flow (props down, events up)
- Minimal shared state between features
- Tests colocated with implementation

### Redux Toolkit

- Slices in `features/` directories
- Use `createAsyncThunk` for API calls
- Use `createSlice` for state management
- Type state and actions with TypeScript
- Use `useAppDispatch` and `useAppSelector` typed hooks
- Reset state on logout in auth slice

### Next.js App Router

- Route groups: `(public)`, `(admin)`, `(portal)`
- Server components by default for data fetching
- Client components for interactivity (marked with "use client")
- Layouts for shared UI (headers, footers)
- Error pages for error boundaries
- Loading pages for loading states

### API Client

- API client in `lib/api/client.ts`
- Adapters for each module (leads, clients, projects, support, invoices, outreach)
- Type definitions in `types/agency.ts`
- Mock mode controlled by `NEXT_PUBLIC_USE_MOCK_API`
- Default: mock mode enabled
- Real API mode: set `NEXT_PUBLIC_USE_MOCK_API=false`

### Mock Data

- Mock data in `store/initialData.ts`
- Used when mock mode enabled
- Structure mirrors backend API responses
- Update mock data when backend schema changes
- Test with real API before disabling mock mode

### TypeScript

- Strict mode enabled in tsconfig.json
- Path alias: `@/*` maps to project root
- Avoid `any`; use proper types
- Use `unknown` for untyped data
- Enable `noUncheckedIndexedAccess` for array safety
- Use `eslint` for additional type checking

### Testing

- Test runner: Node.js native with `--experimental-strip-types`
- Test command: `npm test`
- Lint command: `npm run lint` (TypeScript compiler)
- Build command: `npm run build`
- Dev server: `npm run dev`
- Tests for: components, slices, utilities, API client
- **Testing Skill**: `.devin/skills/frontend-testing/SKILL.md` - Comprehensive testing guidance (55+ rules, workflow, best practices)
- **Testing Rules**: `.devin/rules/frontend-testing.md` - Always-on testing rules

## Documentation to Reference

- `API_COVERAGE_MATRIX.md` - API contract between frontend and backend
- `docs/audits/portal-admin-api-integration-audit.md` - Integration audit findings
- `AGENTS.md` - This file (shared rules)
- `.devin/skills/frontend-testing/SKILL.md` - Frontend testing skill (55+ rules, workflow, best practices)
- `.devin/rules/frontend-testing.md` - Always-on testing rules
- `.agents/skills/feature-arch/SKILL.md` - Feature-based architecture
- `.agents/skills/react/SKILL.md` - React 19 patterns
- `.agents/skills/typescript/SKILL.md` - TypeScript 7 patterns
- `.agents/skills/tailwind/SKILL.md` - Tailwind CSS v4 patterns
- `.agents/skills/react-hook-form/SKILL.md` - React Hook Form patterns
- `.agents/skills/vitest/SKILL.md` - Testing patterns
- Package configuration: `package.json`
- TypeScript configuration: `tsconfig.json`

## Completion Verification

Before marking a task complete:

1. **Verify compilation**: `npm run lint` - TypeScript compiler passes
2. **Run tests**: `npm test` - All tests pass
3. **Check Git status**: `git status` - Verify only intended files changed
4. **Review changes**: `git diff` - Ensure no secrets, no breaking changes
5. **Test locally**: Start dev server and verify component works
6. **Check accessibility**: Test keyboard navigation, screen reader, color contrast
7. **Verify API**: If API call added, test with both mock and real API
8. **Update types**: If data structure changed, update TypeScript types
9. **Update docs**: If API contract changed, update API_COVERAGE_MATRIX.md

## Emergency Procedures

If a test fails:
1. Read the test failure message carefully
2. Check if it's a type error or logic error
3. If type error, fix TypeScript types
4. If logic error, debug component or slice
5. Never commit with failing tests

If build fails:
1. Check TypeScript errors in build output
2. Fix type errors or missing imports
3. Verify all dependencies installed
4. Clear cache: `rm -rf .next`
5. Rebuild: `npm run build`

If mock mode breaks:
1. Check mock data structure in `store/initialData.ts`
2. Verify Redux slice initial state
3. Test with real API to identify issue
4. Fix mock data to match real API
5. Never disable mock mode without verification

If API call fails:
1. Check backend endpoint exists (API_COVERAGE_MATRIX.md)
2. Verify request/response types match
3. Check network tab in browser for error details
4. Test with Swagger UI if backend endpoint exists
5. Add error handling for API failures
