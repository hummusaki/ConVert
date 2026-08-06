import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ConVert E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Go to the local server
    await page.goto('http://localhost:3000');
  });

  test('should convert a TXT file to PDF', async ({ page }) => {
    // Wait for the app to initialize
    await page.waitForSelector('#file-input', { state: 'attached' });

    // Upload sample.txt
    const fileInput = page.locator('#file-input');
    const filePath = path.join(__dirname, 'fixtures', 'sample.txt');
    await fileInput.setInputFiles(filePath);

    // Verify UI updates
    await expect(page.locator('#file-info-text')).toContainText('sample.txt');

    // Select format
    const formatSelect = page.locator('#format-select');
    await formatSelect.selectOption('pdf');

    // Click Convert
    const convertBtn = page.locator('#run-convert-btn');
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    // Wait for "Done!" status
    const statusText = page.locator('#status-text');
    await expect(statusText).toHaveText('Done!', { timeout: 10000 });

    // Verify Download button is active
    const downloadBtn = page.locator('#download-btn');
    await expect(downloadBtn).not.toHaveClass(/disabled/);
    
    // Set up download interception
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('sample.pdf');
  });

});
