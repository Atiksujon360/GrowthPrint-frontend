import { defineConfig, devices } from '@playwright/test';

/**
 * Screenshot capture for the design transformation (tests/visual-capture.spec.ts).
 * Serves a production build in the app's built-in demo mode on port 3100, so no backend or database is used and the
 * developer's own server on port 3000 is left alone.
 *   NEXT_PUBLIC_USE_MOCK_API=true npm run build && GP_CAPTURE=before npx playwright test -c playwright.capture.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /visual-capture\.spec\.ts/,
  workers: 2,
  reporter: 'line',
  use: { baseURL: 'http://localhost:3100', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npx next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
