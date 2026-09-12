import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: { timeout: 15000 },
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, timeout: 20000 },
    baseURL: process.env.CHATNOW_WEB_URL || 'http://127.0.0.1:5173', screenshot: 'only-on-failure',
  },
});
