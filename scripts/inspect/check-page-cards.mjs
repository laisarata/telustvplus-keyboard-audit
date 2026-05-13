import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');

// Wait for content cards to fully load
await page.waitForSelector('a[href*="detail"]', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(4000);

// Check all links/cards and look for right-click context menu
const cards = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[href*="detail"]')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return links.slice(0, 5).map(el => ({
    href: el.getAttribute('href'),
    cls: el.className?.toString().substring(0, 80),
    text: el.textContent?.trim().substring(0, 40),
  }));
});
console.log(`Found ${cards.length} visible content cards:`);
cards.forEach((c, i) => console.log(`${i}: "${c.text}" | ${c.cls} | ${c.href}`));

// Try right-clicking the first card to see if context menu appears
if (cards.length > 0) {
  const firstCard = page.locator('a[href*="detail"]').first();
  await firstCard.click({ button: 'right' });
  await page.waitForTimeout(800);
  
  const menuItems = await page.evaluate(() => {
    return [...document.querySelectorAll('[class*="contextmenu"], [class*="context-menu"], [role="menu"], [role="menuitem"]')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map(el => ({
        tag: el.tagName,
        cls: el.className?.toString().substring(0, 80),
        text: el.textContent?.trim().substring(0, 60),
      }));
  });
  console.log(`\nContext menu items after right-click: ${menuItems.length}`);
  menuItems.forEach((m, i) => console.log(`${i}: "${m.text}" | ${m.cls}`));
  
  await page.screenshot({ path: 'page-1765-context.png' });
  console.log('Screenshot saved');
}

await browser.close();
