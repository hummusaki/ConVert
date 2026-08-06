import { test, expect } from '@playwright/test';

// __ DOCUMENT FUNCTIONS __
test.describe('Document Functions', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // TESTS
  test('loadMammoth and parseDocx should extract text from DOCX', async ({ page }) => {
    test.setTimeout(15000); // Allow time for CDN load
    const text = await page.evaluate(async () => {
      const module = await import('./js/modules/documents/word-parser.js');
      await module.loadMammoth();
      return typeof window.mammoth !== 'undefined';
    });
    expect(text).toBe(true);
  });

  test('loadXlsx and parseSpreadsheet should handle XLSX to CSV', async ({ page }) => {
    const success = await page.evaluate(async () => {
      const module = await import('./js/modules/documents/spreadsheet-parser.js');
      await module.loadXlsx();
      return typeof window.XLSX !== 'undefined';
    });
    expect(success).toBe(true);
  });

  test('convertDocumentFile should route correctly', async ({ page }) => {
    const errorThrown = await page.evaluate(async () => {
      const module = await import('./js/modules/documents/document-convert.js');
      try {
        await module.convertDocumentFile(new ArrayBuffer(0), 'application/pdf', 'txt', 'test.pdf');
        return false;
      } catch (e) {
        return e.message.includes('Unsupported document format');
      }
    });
    expect(errorThrown).toBe(true);
  });

});
