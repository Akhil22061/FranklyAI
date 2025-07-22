// tests/credit-card.e2e.ts
import { test, expect, Page } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/* ── helper paths ────────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const overlayPath = resolve(__dirname, '../cursorOverlay.js');

/* ── inject overlay before each test ─────────────────────────── */
test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: overlayPath });
});

/* ── utility: snapshot every screen ──────────────────────────── */
async function snap(page: Page, slug: string) {
  await page.screenshot({ path: `artifacts/snaps/${slug}.png`, fullPage: true });
}

/* ── happy-path flow ─────────────────────────────────────────── */
test('credit-card happy path', async ({ page }) => {
  await page.goto('/index.html');

  /* Welcome */
  await page.locator('#welcome-next-btn').click();
  await snap(page, '01-welcome');

  /* Consent */
  await page.check('#consent-checkbox');
  await expect(page.locator('#consent-next-btn')).toBeEnabled();
  await page.locator('#consent-next-btn').click();
  await snap(page, '02-consent');

  /* Product select */
  await page.waitForSelector('#product-list div', { state: 'attached' });
  await page.getByText('Basic', { exact: false }).click();          // pick “Basic” card
  const continueBtn = page.locator('#product-select-next-btn');
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();
  await snap(page, '03-product-select');

  /* Product detail */
  await page.locator('#product-detail-next-btn').click();
  await snap(page, '04-product-detail');

  /* Qualification */
  await page.fill('#income-input', '150000');                       // above threshold
  await page.locator('#qualification-next-btn').click();
  await snap(page, '05-qualification');

  /* Debt */
  await page.fill('#debt-input', '5000');                           // below 10 000
  await page.locator('#debt-next-btn').click();
  await snap(page, '06-debt');

  /* KYC */
  await page.fill('#first-name', 'Jane');
  await page.fill('#last-name',  'Doe');
  await page.fill('#dob',        '1990-01-01');
  await page.fill('#address',    '1 Main St, Melbourne');
  await expect(page.locator('#kyc-next-btn')).toBeEnabled();
  await page.locator('#kyc-next-btn').click();
  await snap(page, '07-kyc');

  /* KYC success */
  await page.locator('#kyc-success-next-btn').click();
  await snap(page, '08-kyc-success');

  /* Document upload */
  await page.setInputFiles('#drivers-licence',  'tests/fixtures/licence.jpg');
  await page.setInputFiles('#bank-statement',   'tests/fixtures/statement.pdf');
  await expect(page.locator('#doc-upload-next-btn')).toBeEnabled();
  await page.locator('#doc-upload-next-btn').click();
  await snap(page, '09-upload');

  /* Finish */
  await expect(page.locator('#finish-screen')).toBeVisible();
  await snap(page, '10-finish');
});
