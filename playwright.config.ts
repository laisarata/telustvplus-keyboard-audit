import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalTeardown: './scripts/utils/global-teardown.mjs',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://telustvplus.com',
    headless: false,
    channel: 'chrome',
    storageState: 'scripts/auth/auth-state.json',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },
  projects: [{ name: 'chrome', use: {} }],
});
