import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();

// First visit — capture localStorage before and after guide loads
await page.goto('https://telustvplus.com/#/guide');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(4000);

const storage = await page.evaluate(() => {
  const items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    items[key] = localStorage.getItem(key)?.slice(0, 80);
  }
  return items;
});
console.log('localStorage keys after guide load:');
Object.entries(storage).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// Check if tooltip is visible
const tooltipVisible = await page.locator('button:has-text("Next"), button:has-text("Done")').first().isVisible().catch(() => false);
console.log('\nTooltip visible:', tooltipVisible);

await browser.close();
