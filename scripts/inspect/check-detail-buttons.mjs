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
const buttons = await page.evaluate(() => {
  return [...document.querySelectorAll('button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }).map(el => ({
    text: el.textContent?.trim().substring(0, 60),
    cls: el.className?.toString().substring(0, 100),
  }));
});
console.log('Visible buttons:');
buttons.forEach((b, i) => console.log(`${i}: "${b.text}" | ${b.cls}`));
await browser.close();
