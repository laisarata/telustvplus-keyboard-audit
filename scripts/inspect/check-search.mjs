import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/search');
await page.waitForTimeout(3000);

for (let i = 0; i < 15; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
  if (tag === 'INPUT') break;
}

await page.keyboard.type('news');
await page.waitForTimeout(2000);

// Get a broader picture of all visible non-trivial elements
const allVisible = await page.evaluate(() => {
  return [...document.querySelectorAll('*')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 50 && r.height > 20 && r.top > 50;
    })
    .slice(0, 20)
    .map(el => ({ tag: el.tagName, cls: el.className?.toString().slice(0, 50), text: el.textContent?.trim().slice(0, 40) }));
});
console.log(JSON.stringify(allVisible, null, 2));

await browser.close();
