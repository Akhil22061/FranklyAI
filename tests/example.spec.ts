import { test, expect } from '@playwright/test';

test('credit-card happy path', async ({ page }) => {
  await page.goto('/index.html');

  /* ── Welcome ── */
  await page.locator('#welcome-next-btn').click();

  /* ── Consent ── */
  await page.check('#consent-checkbox');
  await expect(page.locator('#consent-next-btn')).toBeEnabled();
  await page.locator('#consent-next-btn').click();

  /* ── Product select ── */
// 1.  Wait until the JS has injected at least one card tile
await page.waitForSelector('#product-list div', { state: 'attached' });

// 2A. Click the first card in the list
await page.locator('#product-list div').first().click();

// ── or ──
// 2B. Click the Basic Card explicitly (robust against order changes)
// await page.getByText('Basic Card', { exact: true }).click();

// 3.  Guard-rail: ensure the button is now enabled
const continueBtn = page.locator('#product-select-next-btn');
await expect(continueBtn).toBeEnabled();

// 4.  Proceed
await continueBtn.click();


  /* ── Product detail ── */
  await page.locator('#product-detail-next-btn').click();

  /* ── Qualification ── */
  await page.fill('#income-input', '150000');                       // > any threshold
  await page.locator('#qualification-next-btn').click();

  /* ── Debt ── */
  await page.fill('#debt-input', '5000');                           // < 10 000
  await page.locator('#debt-next-btn').click();

  /* ── KYC ── */
  await page.fill('#first-name', 'Jane');
  await page.fill('#last-name',  'Doe');
  await page.fill('#dob',        '1990-01-01');
  await page.fill('#address',    '1 Main St, Melbourne');
  await expect(page.locator('#kyc-next-btn')).toBeEnabled();
  await page.locator('#kyc-next-btn').click();

  /* ── KYC success ── */
  await page.locator('#kyc-success-next-btn').click();

  /* ── Document upload ── */
  await page.setInputFiles('#drivers-licence',  'tests/fixtures/licence.jpg');
  await page.setInputFiles('#bank-statement',   'tests/fixtures/statement.pdf');
  await expect(page.locator('#doc-upload-next-btn')).toBeEnabled();
  await page.locator('#doc-upload-next-btn').click();

  /* ── Finish ── */
  await expect(page.locator('#finish-screen')).toBeVisible();
});
