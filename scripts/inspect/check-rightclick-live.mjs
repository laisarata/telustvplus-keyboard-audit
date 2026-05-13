import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Right-click the first live TV card (NFL Live)
const firstCard = page.locator('a[href*="player/live"]').first();
await firstCard.click({ button: 'right' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'live-rightclick.png' });

// Check for any menu that appeared
const menu = await page.evaluate(() => {
  return [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    const cls = el.className?.toString() ?? '';
    return r.width > 50 && r.height > 20 && r.width < 400 &&
      (cls.includes('context') || cls.includes('contextmenu') || cls.includes('menu') ||
       cls.includes('popup') || cls.includes('dropdown') || cls.includes('tooltip'));
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 100),
    text: el.textContent?.trim().substring(0, 80),
    visible: el.getBoundingClientRect().width > 0,
  }));
});
console.log('Menu-like elements after right-click:');
menu.forEach((m, i) => console.log(`${i}: <${m.tag}> "${m.text}" | ${m.cls}`));

await browser.close();
