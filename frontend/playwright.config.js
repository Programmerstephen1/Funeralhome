import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: [
    {
      command: "python backend/run.py",
      cwd: "..",
      url: "http://127.0.0.1:5000/api/health/live",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        APP_ENV: "test",
        SECRET_KEY: "local-playwright-secret-key-only",
        JWT_SECRET_KEY: "local-playwright-jwt-secret-key-only",
        FLASK_DEBUG: "False",
        MAIL_SUPPRESS_SEND: "True",
        FRONTEND_URL: "http://127.0.0.1:4173",
        CORS_ALLOWED_ORIGINS: "http://127.0.0.1:4173",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173",
      cwd: ".",
      url: "http://127.0.0.1:4173",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: "http://127.0.0.1:5000",
        VITE_SITE_URL: "http://127.0.0.1:4173",
      },
    },
  ],
});
