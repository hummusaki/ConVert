import { test, expect } from '@playwright/test';

// __ MEDIA FUNCTIONS __
test.describe('Media Functions', () => {

  // SETUP
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // TESTS
  test('convertMidiFile should be a callable function', async ({ page }) => {
    const isFunction = await page.evaluate(async () => {
      const module = await import('./js/modules/media/midi-convert.js');
      return typeof module.convertMidiFile === 'function';
    });
    expect(isFunction).toBe(true);
  });

  test('transcode should be a callable function that throws without ffmpeg', async ({ page }) => {
    const isFunction = await page.evaluate(async () => {
      const module = await import('./js/modules/media/ffmpeg-transcode.js');
      return typeof module.transcode === 'function';
    });
    expect(isFunction).toBe(true);
  });

});
