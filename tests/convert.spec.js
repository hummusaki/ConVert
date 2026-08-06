import { test, expect } from '@playwright/test';
import path from 'path';

// __ END-TO-END CONVERSION TESTS __
test.describe('ConVert E2E Tests', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    // Go to the local server
    await page.goto('http://localhost:3000');
  });

  // TESTS
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

  test('should convert a CSV file to PDF (SheetJS)', async ({ page }) => {
    await page.waitForSelector('#file-input', { state: 'attached' });
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.csv'));
    await expect(page.locator('#file-info-text')).toContainText('sample.csv');
    
    const formatSelect = page.locator('#format-select');
    await formatSelect.selectOption('pdf');
    
    const convertBtn = page.locator('#run-convert-btn');
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();
    
    const statusText = page.locator('#status-text');
    await expect(statusText).toHaveText('Done!', { timeout: 15000 });
    
    const downloadBtn = page.locator('#download-btn');
    await expect(downloadBtn).not.toHaveClass(/disabled/);
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('sample.pdf');
  });

});
