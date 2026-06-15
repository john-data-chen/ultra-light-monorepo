import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  // Snapshot the audit_logs high-water mark, then purge only this run's e2e
  // audit residue after all projects finish (see e2e/global-teardown.ts).
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:5173"
    // headless: false
  },
  // Headroom for the first-hit Vite dev compilation of a route (cold `goto`/redirect can
  // exceed the 5s default before the URL settles).
  expect: { timeout: 15_000 },
  // Cross-browser happy-path coverage. `edge` uses the installed Microsoft Edge app
  // (channel "msedge") and therefore runs locally only — e2e is intentionally kept out of CI.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    },
    // this mac doesn't have Edge browser
    // { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] }
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 14"] }
    }
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PLAYWRIGHT_TEST: "true"
    }
  }
});
