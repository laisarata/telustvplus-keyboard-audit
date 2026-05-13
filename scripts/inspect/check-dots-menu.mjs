import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Hover to reveal dots button, then click it
const firstTrigger = page.locator('div.menu-trigger').first();
await firstTrigger.hover();
await page.waitForTimeout(600);

const dotsBtn = page.locator('.dotsContainer').first();
const dotsVisible = await dotsBtn.isVisible().catch(() => false);
console.log('Dots button visible on hover:', dotsVisible);

if (dotsVisible) {
  await dotsBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dots-menu-open.png' });

  const menuItems = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 50 && r.height > 10 && r.width < 400;
    }).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString().substring(0, 100),
      text: el.textContent?.trim().substring(0, 80),
      role: el.getAttribute('role'),
    })).filter(e => e.cls.includes('context') || e.cls.includes('menu') || e.cls.includes('item') || e.role === 'menu' || e.role === 'menuitem');
  });
  console.log('Menu items after clicking dots:');
  menuItems.forEach((m, i) => console.log(`${i}: <${m.tag}> role=${m.role} "${m.text}" | ${m.cls}`));
}

await browser.close();
