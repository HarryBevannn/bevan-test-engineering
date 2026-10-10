import { defineConfig, devices } from '@playwright/test';

// By default the tests run against a local preview of the built site (run `npm run build` first).
// Set BASE_URL to test a deployed site instead, e.g. the live Netlify URL.
const liveUrl = process.env.BASE_URL;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: liveUrl ?? 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Locally on Windows, use the installed Microsoft Edge so no browser download is needed.
    channel: isCI ? undefined : 'msedge',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: isCI ? undefined : 'msedge' } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: isCI ? undefined : 'msedge' } },
  ],
  // Serves dist/ locally while the tests run (skipped when BASE_URL is set). See tests/global-setup.ts.
  globalSetup: './tests/global-setup.ts',
});
