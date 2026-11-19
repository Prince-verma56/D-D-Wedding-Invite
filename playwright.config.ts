import { defineConfig, devices } from "@playwright/test";

const existingServer = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/music",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: existingServer || "http://127.0.0.1:3100",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
  },
  webServer: existingServer ? undefined : {
    command: process.env.MUSIC_TEST_DEV
      ? "npm run dev -- --hostname 127.0.0.1 --port 3100"
      : "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
