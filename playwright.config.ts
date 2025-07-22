import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: 'tests',
  outputDir: 'artifacts',

  use: {
    baseURL: 'http://localhost:3000',
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    trace: 'on',
    viewport: { width: 1280, height: 720 },
  },

  // Inject the cursor helper into every new page
  webServer: {
    command: 'npx http-server . -p 3000',
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  },

  // Playwright v1.40+ supports "contextOptions" → "addInitScript" at config level
  projects: [{
    name: 'chromium',
    use: {
      contextOptions: {
        recordVideo: { dir: 'artifacts' },
        // this script runs before any page code
        // path must be absolute
      }
    }
  }]
});
