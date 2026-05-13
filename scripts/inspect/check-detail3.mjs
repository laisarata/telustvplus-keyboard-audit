import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/e35a0ca8-180f-49a6-88c4-dc2ccb52ed65');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(5000);

// Get full list
const interactive = await page.evaluate(() => {
  return [...document.querySelectorAll('button, a[href], [role="tab"], [role="button"]')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 50), cls: el.className?.toString().slice(0, 60) }));
});
console.log('ALL INTERACTIVE:');
interactive.forEach((el, i) => console.log(`${i+1}. ${el.tag} "${el.text}" cls=${el.cls}`));

await browser.close();
