import { test, expect } from '@playwright/test';

// __ CORE FUNCTIONS __
test.describe('Core Functions', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    // Go to the local server
    await page.goto('http://localhost:3000');
  });

  // TESTS
  test('toggleContrast should add/remove dark-mode class', async ({ page }) => {
    const isLight = await page.evaluate(async () => {
      const module = await import('./js/modules/core/utils.js');
      module.toggleContrast();
      return document.documentElement.classList.contains('light-mode');
    });

    const isLightAgain = await page.evaluate(async () => {
      const module = await import('./js/modules/core/utils.js');
      module.toggleContrast();
      return document.documentElement.classList.contains('light-mode');
    });
    expect(isLight).not.toBe(isLightAgain);
  });

  test('setInitialContrast should apply saved preference', async ({ page }) => {
    const isLight = await page.evaluate(async () => {
      localStorage.setItem('contrastToggle', 'true');
      const module = await import('./js/modules/core/utils.js');
      module.setInitialContrast();
      return document.documentElement.classList.contains('light-mode');
    });
    expect(isLight).toBe(true);
  });

  test('triggerDownload should create an object URL and click a link', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.evaluate(async () => {
      const module = await import('./js/modules/core/utils.js');
      const blob = new Blob(['hello world'], { type: 'text/plain' });
      module.triggerDownload(blob, 'test.txt');
    });

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test.txt');
  });

  test('loadScript should append script to head', async ({ page }) => {
    const hasScript = await page.evaluate(async () => {
      const module = await import('./js/modules/core/utils.js');
      await module.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.js');
      return !!document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.js"]');
    });
    expect(hasScript).toBe(true);
  });

  test('loadFFmpeg should initialize ffmpeg instance', async ({ page }) => {
    test.setTimeout(30000); // FFmpeg can take time to load
    const isLoaded = await page.evaluate(async () => {
      const module = await import('./js/modules/core/client.js');
      const dummyStatus = document.createElement('div');
      const ffmpeg = await module.loadFFmpeg(dummyStatus);
      return ffmpeg && typeof ffmpeg.exec === 'function';
    });
    expect(isLoaded).toBe(true);
  });

});
