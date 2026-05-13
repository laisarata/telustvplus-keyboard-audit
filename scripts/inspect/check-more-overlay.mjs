import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/9e8ff58f-10d0-4dcf-a8f4-f28ff0ee8131');
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => {
  const btns = [...document.querySelectorAll('button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return btns.length > 3;
}, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);

// Tab until we reach the More button
for (let i = 0; i < 30; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  const found = await page.evaluate(() => {
    const el = document.activeElement;
    const text = el?.textContent?.trim().toLowerCase() ?? '';
    return text === 'more' || text.includes('more');
  });
  if (found) {
    const info = await page.evaluate(() => ({ 
      text: document.activeElement?.textContent?.trim(),
      cls: document.activeElement?.className?.toString()
    }));
    console.log('Found button:', info);
    break;
  }
}

// Press Enter and wait
console.log('Pressing Enter...');
await page.keyboard.press('Enter');
await page.waitForTimeout(2000);

// Check all visible elements that may have appeared
const newElements = await page.evaluate(() => {
  const all = [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 100 && r.height > 100;
  });
  return all.slice(0, 30).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 100),
    role: el.getAttribute('role'),
    visible: true
  }));
});
console.log('Elements after Enter:');
newElements.forEach((e, i) => console.log(`${i}: <${e.tag}> role=${e.role} | ${e.cls}`));

await browser.close();
