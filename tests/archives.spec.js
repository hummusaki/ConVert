import { test, expect } from '@playwright/test';

// __ ARCHIVE FUNCTIONS __
test.describe('Archive Functions', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // TESTS
  test('convertArchiveFile should be a callable function', async ({ page }) => {
    const isFunction = await page.evaluate(async () => {
      const module = await import('./js/modules/archives/archive-convert.js');
      return typeof module.convertArchiveFile === 'function';
    });
    expect(isFunction).toBe(true);
  });

});
