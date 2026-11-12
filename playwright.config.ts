import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const IS_CI = Boolean(process.env.CI);
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`;
const DESKTOP_ONLY = /@desktop/;
const MOBILE_ONLY = /@mobile/;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  ...(IS_CI && { workers: 2 }),
  timeout: 30_000,
  expect: { timeout: 7_500 },
  reporter: IS_CI ? [["github"], ["blob"]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    colorScheme: "light",
  },
  projects: [
    { name: "http", testDir: "./e2e/http" },
    {
      name: "document",
      testDir: "./e2e/document",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
    },
    {
      name: "chromium",
      testDir: "./e2e/ui",
      grepInvert: MOBILE_ONLY,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testDir: "./e2e/ui",
      grepInvert: MOBILE_ONLY,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testDir: "./e2e/ui",
      grepInvert: MOBILE_ONLY,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      testDir: "./e2e/ui",
      grepInvert: DESKTOP_ONLY,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      testDir: "./e2e/ui",
      grepInvert: DESKTOP_ONLY,
      use: { ...devices["iPhone 15"] },
    },
  ],
  ...(!EXTERNAL_BASE_URL && {
    webServer: {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: !IS_CI,
      timeout: 240_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  }),
});
