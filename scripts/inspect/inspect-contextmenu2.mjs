import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

// Right-click the second card (SC) 
await page.locator('div.menu-trigger').nth(1).click({ button: 'right' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'menu-open2.png' });

// Dump EVERYTHING visible - no coordinate filter
const all = await page.evaluate(() =>
  [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 80),
    text: el.textContent?.trim().substring(0, 50),
    role: el.getAttribute('role'),
  })).filter(e =>
    e.text.includes('Record') || e.text.includes('Details') ||
    e.cls.includes('context') || e.cls.includes('item') && !e.cls.includes('hubs') && !e.cls.includes('menu-trigger') && !e.cls.includes('item-container')
  )
);
console.log('Menu-related elements:');
all.forEach((e, i) => console.log(`${i}: <${e.tag}> role=${e.role} "${e.text}" | ${e.cls}`));

await browser.close();
