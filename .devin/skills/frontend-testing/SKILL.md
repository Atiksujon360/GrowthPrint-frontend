---
name: frontend-testing
description: Comprehensive frontend testing skill based on the practica.js Frontend Testing Skill. Provides 55+ testing rules, workflow guidance, and best practices for React/Next.js applications. Use for frontend feature development, React/Next.js components, UI bug fixes, frontend refactoring, and testing tasks.
metadata:
  version: "1.5.0"
  upstream: "https://github.com/practicajs/the-frontend-testing-skill"
  upstream_version: "1.5.0"
---

# 🧪 Frontend Testing Skill

This skill provides comprehensive testing guidance for frontend development, based on the practica.js Frontend Testing Skill (v1.5.0). It enforces 55+ testing rules, provides workflow guidance, and ensures test quality across your React/Next.js codebase.

## When to Use This Skill

Activate this skill when:
- Developing new frontend features or pages
- Writing React/Next.js components
- Fixing UI bugs
- Refactoring frontend code
- Writing or reviewing tests
- Planning test scenarios
- Verifying test quality

## Core Workflow: The Double Gate 🌉 Principle

**Testing is integrated, not separate.** Every coding session follows this workflow:

1. **Gate 1: Test Planning** - First task in any phase
2. **Implement** - Write code and tests
3. **Gate 2: Test Verification** - Last task/gate - verify tests pass and quality is high

### Required Steps

Before writing ANY code or tests:

1. **Inspect existing tests** - Read project's existing test files to understand patterns
2. **Check project conventions** - Review AGENTS.md Testing Requirements section
3. **Plan test scenarios** - Define what to test, edge cases, expected outcomes
4. **Analyze the page/component** - Understand UI structure, API calls, user interactions

After writing tests:

1. **Run tests** - Execute test suite and verify all pass
2. **Run quality checks** - Lint, typecheck, build
3. **Fix failures** - Address any test failures or quality issues
4. **Verify stability** - Ensure tests are not flaky
5. **Report results** - Communicate test status and coverage

## Project-Specific Configuration

Your project uses:
- **Test Runner**: Node.js native with `--experimental-strip-types`
- **Test Command**: `npm test`
- **Test Location**: Colocated with implementation files (e.g., `*.test.ts` next to implementation)
- **Current Framework**: None (using Node.js native runner - consider adding Playwright or Vitest for integration tests)

## Critical Testing Rules (Top 6)

From the Test Anatomy rules:

1. **No more than 10 statements per test** - Keep tests focused and readable
2. **Include only details that affect test results** - No unnecessary setup data
3. **Totally flat structure** - No if/else, loops, try-catch, console.log in tests
4. **Never mock internal parts** - Only mock external systems (APIs, databases, time)
5. **Smoking Gun Principle** - Every assertion value must appear first in arrange phase
6. **Tests are self-contained** - Never rely on other tests' state

## Test Structure Pattern

Follow this AAA (Arrange-Act-Assert) pattern:

```typescript
describe('ComponentName', () => {
  it('When {scenario}, then {expectation}', () => {
    // Arrange: Set up test data and conditions
    const testData = { value: 'expected' };

    // Act: Execute the code being tested
    const result = functionUnderTest(testData);

    // Assert: Verify the outcome
    expect(result).toBe('expected');
  });
});
```

## Test Title Pattern

Use this format: `When {scenario}, then {expectation}`

Examples:
- `When user submits valid form, then success message appears`
- `When API returns error, then error message is displayed`
- `When component mounts with props, then it renders correctly`

## What to Test (Priority Order)

1. **Page Testing** (Primary) - Single page scope, one meaningful user action per test
2. **Component Testing** - Reusable components and design system libraries
3. **Unit Testing** - Only for heavy logic with high combinatorial inputs

**Test only external outcomes:**
- UI changes users notice
- API mutations
- Storage changes
- Navigation events

**Never test implementation details:**
- Internal function calls
- Component internal state
- CSS classes
- Implementation-specific logic

## File Structure

- Place test files next to implementation files (colocation)
- Name test files: `*.test.ts` or `*.test.tsx`
- Use descriptive test file names matching the component/page being tested

## Assertions

- Use specific matchers (e.g., `toBe`, `toEqual`, `toContain`)
- Avoid vague assertions like `toBeTruthy()`
- Verify actual user-visible outcomes
- Include error messages in assertions for clarity

## Mocking

- Mock only external systems (APIs, databases, browser APIs)
- Never mock internal functions or component methods
- Use your project's mock mode (`NEXT_PUBLIC_USE_MOCK_API`) for API testing
- Ensure mock data structure matches real API responses

## Testing with DOM

- Use semantic HTML selectors when possible
- Prefer ARIA attributes over CSS classes for selectors
- Test user interactions (clicks, form submissions, navigation)
- Verify accessibility attributes are present

## Project-Specific Guidelines

Your AGENTS.md defines these requirements:

### Unit Tests
1. Component tests - rendering, user interactions, props
2. Redux slice tests - reducers, async thunks, state updates
3. API client tests - API call formatting and error handling
4. Utility function tests - pure functions with edge cases
5. **Run before committing** - `npm test` must pass

### Integration Tests
1. Form tests - validation and submission flow
2. Redux integration tests - thunk dispatch and state updates
3. API integration tests - actual API calls (when mock mode disabled)
4. Navigation tests - routing and navigation flows

### Definition of Done
A task is complete when:
1. Code compiles without errors: `npm run lint`
2. All tests pass: `npm test`
3. New code has test coverage
4. TypeScript types are defined and strict
5. Component is accessible
6. Redux state updates correctly
7. API calls work with both mock and real API

## Missing Capabilities (Claude Code → Devin Adaptation)

The original skill includes these Claude Code-specific features that are NOT available in Devin:
- MCP tools (Playwright MCP, Test Coverage MCP)
- Slash commands (`/testskill.write-test`, `/testskill.plan`, etc.)
- Specialized agents (testskill.planner, testskill.page-analyzer, testskill.verifier)
- Trace-based failure fixing
- Automated mutation testing
- HTML/Markdown test reports

**Adaptation for Devin:**
- Use Devin's built-in tools (grep, read, exec) instead of MCP tools
- Manual test planning instead of automated planner agent
- Manual page analysis instead of page-analyzer agent
- Use standard test runners (npm test) instead of custom commands
- Manual verification instead of verifier agent

## Recommended Testing Framework

Your project currently uses Node.js native test runner. For more comprehensive frontend testing, consider adding:

**Playwright** (Recommended for integration/e2e tests):
- Full browser automation
- Page-level testing
- Network interception and mocking
- Visual regression testing

**Vitest Browser Mode** (Alternative):
- Fast browser testing
- Component testing
- Playwright-compatible API

To add Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

## References

All upstream skill documentation is preserved in:
- `.devin/skills/frontend-testing/references/` - Full skill documentation
- `.devin/skills/frontend-testing/references/rules/` - Testing rules
- `.devin/skills/frontend-testing/references/test-workflow.md` - Workflow guide

Key documents to read:
- `references/rules/the-test-anatomy.md` - Core testing rules
- `references/rules/assertions.md` - Assertion patterns
- `references/rules/mocking.md` - Mocking guidelines
- `references/rules/testing-with-dom.md` - DOM testing patterns
- `references/test-workflow.md` - Complete workflow

## Enforcement

This skill will:
- Warn if you attempt to write tests without a plan
- Warn if you skip test verification
- Reference testing rules when patterns deviate
- Suggest improvements based on the 55+ rules
- Ensure tests follow project conventions
