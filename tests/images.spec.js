import { test, expect } from '@playwright/test';

// __ IMAGE & PDF FUNCTIONS __
test.describe('Image and PDF Functions', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // TESTS
  test('textToImage should generate an image blob from text', async ({ page }) => {
    const isBlob = await page.evaluate(async () => {
      const module = await import('./js/modules/images/canvas-convert.js');
      const blob = await module.textToImage('Hello World', 'image/png');
      return blob instanceof Blob && blob.type === 'image/png';
    });
    expect(isBlob).toBe(true);
  });

  test('textToPdf should generate a PDF blob from text', async ({ page }) => {
    const isBlob = await page.evaluate(async () => {
      const module = await import('./js/modules/images/pdf-embed.js');
      const blob = await module.textToPdf('Hello World');
      return blob instanceof Uint8Array;
    });
    expect(isBlob).toBe(true);
  });

  test('convertMagickFile should load ImageMagick and throw on invalid input', async ({ page }) => {
    test.setTimeout(20000); // ImageMagick takes time to load
    const threwCorrectError = await page.evaluate(async () => {
      const module = await import('./js/modules/images/magick-convert.js');
      try {
        await module.convertMagickFile(new Uint8Array(10), 'image/jpeg', 'png');
        return false;
      } catch (e) {
        return e.toString().includes('ImageMagick') || e.toString().includes('Error'); // Will throw error since array is invalid image
      }
    });
    expect(threwCorrectError).toBe(true);
  });

});
