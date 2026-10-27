# Testing with DOM

**When to use:** When testing React components with testing-library, Playwright, StoryBook, or similar frameworks.

---

## Section F - Testing with DOM

F.1. Important: Use only user-facing locators based on ARIA roles, labels, or accessible names (e.g., getByRole, getByLabel). Avoid using test-id (e.g., .getByTestId), CSS selectors, or any non-ARIA-based locators

F.3. Do not assume or rely on the page structure or layout. Avoid using positional selectors like nth(i), first(), last() and similar

F.5. Use the framework mechanism for asserting safely on elements: If the framework can tell deterministically when the re-render ended (e.g., testing-library), just include standard non-awaitable assertions. In framework like Playwright that don't interact directly with the Renderer, use auto-retriable assertions (a.k.a web-first assertions) with await: `await expect(locator).toContainText('some string');`

F.9. Avoid waiting for some internal element appearance (e.g., Playwright waitForSelector) as it couple the test to the implementation. The auto-retriable assertion will do the wait in a reliable way

F.14. Avoid approaching and asserting on external systems. Alternatively, assert that the navigation happened and if needed simulate a stubbed response

F.15. Register route mocks before navigation. Always call `page.route()` before `page.goto()` — a mock registered after navigation creates a race where the real request can fire before the mock intercepts it

F.16. Wait for loading states to settle before asserting. After navigation or an action that triggers data fetching, wait for loading indicators to disappear (e.g., `await expect(spinner).toBeHidden()`) before asserting on content

F.17. Disable CSS animations in tests. Use `page.emulateMedia({ reducedMotion: 'reduce' })` to prevent assertions from hitting intermediate animation states

F.18. Assert visibility before interacting with elements that appear after an action. When a click or input reveals a new element, add `await expect(locator).toBeVisible()` before interacting with it — Playwright auto-waits for actionability on single actions, but chained sequences can race if the next target hasn't rendered yet

F.19. When an element lacks an accessible name needed for a `getByRole` locator, add an `aria-label` to the production component rather than resorting to positional selectors or raw CSS locators. Register new 'aria-label' string in `libraries/shared/translations/src/ariaLabels.en.ts` and referenced in tests via `i18n.t('ariaLabels.<key>')`.
