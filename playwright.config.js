// @ts-check
const { devices } = require('@playwright/test');

/**
 * Playwright configuration for Auto AGI Builder
 * End-to-end testing configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = {
  testDir: './e2e-tests',
  timeout: 30 * 1000, // Maximum time one test can run for
  expect: {
    timeout: 5 * 1000, // Maximum time expect() should wait for condition
  },
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video of tests
    video: 'retain-on-failure',
    
    // Take screenshot of failures
    screenshot: 'only-on-failure',
  },
  
  // Configure projects for different environments
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
  
  // Run local dev server before starting the tests
  webServer: {
    command: 'cd frontend && npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
};
