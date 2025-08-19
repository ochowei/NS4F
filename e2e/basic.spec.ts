import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // This is a placeholder test.
  // In a real scenario, we would navigate to a page and test the extension's functionality.
  await page.goto('https://www.facebook.com/');
  const title = await page.title();
  expect(title).toContain('Facebook');
});
