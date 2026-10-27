# Frontend Testing Rules

Always-on testing rules for the GrowthPrint frontend project. These rules apply to all frontend development work.

## Core Principles

1. **Tests define "done"** - No feature is complete without passing tests
2. **Context before code** - Understand existing tests and patterns before writing new ones
3. **Verification is mandatory** - Always run tests and quality checks before marking a task complete
4. **Testing is integrated** - Test planning, implementation, and verification are part of development, not separate phases

## Mandatory Workflow

For any frontend feature development, React/Next.js component work, UI bug fix, or frontend refactoring:

### Before Writing Code

1. **Read existing tests** - Examine test files in the feature/component area to understand patterns
2. **Check AGENTS.md** - Review the Testing Requirements section for project-specific guidelines
3. **Plan test scenarios** - Define what to test, edge cases, and expected outcomes
4. **Analyze the component/page** - Understand UI structure, API calls, and user interactions

### After Writing Code

1. **Run tests** - Execute `npm test` and verify all tests pass
2. **Run quality checks** - Execute `npm run lint` (TypeScript compiler)
3. **Fix failures** - Address any test failures or type errors
4. **Verify locally** - Start dev server and test the component in browser
5. **Check accessibility** - Test keyboard navigation, ARIA labels, color contrast

## Critical Testing Rules

### Test Structure

- **No more than 10 statements per test** - Keep tests focused and readable
- **Totally flat structure** - No if/else, loops, try-catch, console.log in tests
- **Self-contained tests** - Never rely on other tests' state
- **AAA pattern** - Arrange-Act-Assert with clear phase separation

### Test Titles

- Use format: `When {scenario}, then {expectation}`
- Examples: "When user submits valid form, then success message appears"
- Be specific about the scenario and expected outcome

### Assertions

- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Avoid vague assertions like `toBeTruthy()`
- Verify actual user-visible outcomes
- Include error messages in assertions for clarity

### Mocking

- Mock only external systems (APIs, databases, browser APIs)
- Never mock internal functions or component methods
- Use project's mock mode (`NEXT_PUBLIC_USE_MOCK_API`) for API testing
- Ensure mock data structure matches real API responses

### What to Test

**Test external outcomes:**
- UI changes users notice
- API mutations
- Storage changes
- Navigation events

**Never test implementation details:**
- Internal function calls
- Component internal state
- CSS classes
- Implementation-specific logic

## Test Location

- Place test files next to implementation files (colocation)
- Name test files: `*.test.ts` or `*.test.tsx`
- Follow existing patterns in the codebase

## Project-Specific Requirements

### Test Runner
- Use Node.js native test runner with `--experimental-strip-types`
- Test command: `npm test`
- Lint command: `npm run lint` (TypeScript compiler)

### Test Types

**Unit Tests (Required):**
- Component tests - rendering, user interactions, props
- Redux slice tests - reducers, async thunks, state updates
- API client tests - API call formatting and error handling
- Utility function tests - pure functions with edge cases

**Integration Tests (When Applicable):**
- Form tests - validation and submission flow
- Redux integration tests - thunk dispatch and state updates
- API integration tests - actual API calls (when mock mode disabled)
- Navigation tests - routing and navigation flows

### Definition of Done

A task is complete when:
1. Code compiles without errors: `npm run lint`
2. All tests pass: `npm test`
3. New code has test coverage
4. TypeScript types are defined and strict
5. Component is accessible (keyboard navigation, ARIA labels, color contrast)
6. Redux state updates correctly
7. API calls work with both mock and real API

## Violation Handling

**STOP and report** if:
- Attempting to write tests without understanding existing patterns
- Skipping test execution after code changes
- Committing code with failing tests
- Testing implementation details instead of user-visible outcomes
- Mocking internal components or functions

## Skill Reference

For detailed testing guidance, invoke the `frontend-testing` skill:
- Full 55+ testing rules
- Detailed patterns and practices
- Test anatomy and structure guidelines
- Assertion and mocking patterns
- DOM testing best practices
