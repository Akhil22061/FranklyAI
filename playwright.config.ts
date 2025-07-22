// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  outputDir: 'artifacts',     // screenshots, videos, traces land here
  timeout: 90_000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/pw.json' }]
  ],
  use: {
    trace: 'on',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
