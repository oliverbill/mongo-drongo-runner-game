const { defineConfig } = require("@playwright/test");

// Locally we point Playwright at the browser already present in this
// environment (PW_CHROMIUM_PATH). On CI we let `playwright install`
// provide the browser, so the override is omitted.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    viewport: { width: 390, height: 844 },
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
