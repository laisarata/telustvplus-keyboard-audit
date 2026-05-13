import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Take screenshot to see what's loaded
await page.screenshot({ path: 'page-1765.png' });

// Check all visible links and clickable items
const items = await page.evaluate(() => {
  const all = [...document.querySelectorAll('a, [class*="card"], [class*="item"], [class*="thumbnail"], [class*="tile"]')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 50 && r.height > 50;
    });
  return all.slice(0, 10).map(el => ({
    tag: el.tagName,
    href: el.getAttribute('href')?.substring(0, 60),
    cls: el.className?.toString().substring(0, 80),
    text: el.textContent?.trim().substring(0, 40),
  }));
});
console.log('Visible items on page:');
items.forEach((it, i) => console.log(`${i}: <${it.tag}> "${it.text}" | ${it.cls} | href: ${it.href}`));

await browser.close();
