import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env["CI"],
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4200",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "npm run build:tokens && npx ng serve docs --host 127.0.0.1 --port 4200",
    wait: { stdout: /Compiled successfully/ },
    timeout: 180_000,
  },
});
