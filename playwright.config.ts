import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite for EcoVolunteer.
 *
 * - Runs against a local `next dev` server that Playwright starts itself.
 * - Uses the installed Google Chrome (channel: "chrome") so no browser download is needed.
 * - Tests that need a real Supabase account are gated behind E2E_EMAIL / E2E_PASSWORD
 *   and are skipped (not failed) when those are absent, so the suite stays green in CI
 *   without secrets.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "ru-RU",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
