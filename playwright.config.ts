import { defineConfig, devices } from '@playwright/test';

// PW_PORT lets a run use its own server when something else (e.g. your own `npm run dev`) already holds port 3000.
const PORT = process.env.PW_PORT ?? '3000';
const BASE_URL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev servers before starting the tests */
  webServer: {
    command: PORT === '3000' ? 'npm run dev' : `npx next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_USE_MOCK_API: 'false',
      // The MVP2 workspace e2e suite needs the preview routes (off by default everywhere else).
      NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW: 'true',
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8090/api/v1',
    },
  },
});
