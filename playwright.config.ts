import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.e2e.spec.ts',
  outputDir: 'artifacts',

  /* ── reporters ───────────────────────────────────────────── */
  reporter: [
    ['json', { outputFile: 'artifacts/pw-run.json' }],
    ['html', { open: 'never' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    trace: 'on',
    viewport: { width: 1280, height: 720 }
  },

  webServer: {
    command: 'npx http-server . -p 3000',
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  },

  projects: [
    {
      name: 'chromium',
      use: {
        contextOptions: {
          recordVideo: { dir: 'artifacts' }
        }
      }
    }
  ]
});
