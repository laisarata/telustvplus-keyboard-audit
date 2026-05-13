import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('div.menu-trigger', { timeout: 12000 }).catch(() => {});
await page.waitForTimeout(3000);

// Tab 20 times to land on a card area
for (let i = 0; i < 20; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
}

const focused = await page.evaluate(() => ({
  tag: document.activeElement?.tagName,
  cls: document.activeElement?.className?.toString(),
  text: document.activeElement?.textContent?.trim().substring(0, 50),
}));
console.log('Currently focused element:', focused);
console.log('Window ready — you can now press Fn+Shift+F10 or Ctrl+Click to test the context menu');

// Keep open for 10 minutes
await page.waitForTimeout(600000);
await browser.close();
