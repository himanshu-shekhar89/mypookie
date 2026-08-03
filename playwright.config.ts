import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "mvn -q spring-boot:run",
      cwd: "backend",
      url: "http://127.0.0.1:8080/api/health",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: { FIREBASE_ENABLED: "false", RAZORPAY_KEY_ID: "", RAZORPAY_KEY_SECRET: "" },
    },
    {
      command: "npm run dev -- --port 3100",
      url: "http://localhost:3100",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:8080", NEXT_PUBLIC_E2E_MODE: "true" },
    },
  ],
});
