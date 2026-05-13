import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Scroll down to load more cards
await page.keyboard.press('End');
await page.waitForTimeout(2000);
await page.keyboard.press('End');
await page.waitForTimeout(2000);

// Find all visible clickable cards (any link or anchor)
const cards = await page.evaluate(() => {
  return [...document.querySelectorAll('a')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.height > 50;
  }).map(el => ({
    href: el.getAttribute('href')?.substring(0, 80),
    cls: el.className?.toString().substring(0, 60),
    text: el.textContent?.trim().substring(0, 40),
    w: Math.round(el.getBoundingClientRect().width),
    h: Math.round(el.getBoundingClientRect().height),
  }));
});
console.log(`Found ${cards.length} visible links:`);
cards.forEach((c, i) => console.log(`${i}: "${c.text}" | ${c.cls} | ${c.href} (${c.w}x${c.h})`));

// Right-click the first content card (not nav)
const contentCards = cards.filter(c => c.href && !c.href.startsWith('#/PAGE') && !c.href.startsWith('#/guide') && !c.href.startsWith('#/'));
console.log(`\nContent cards (non-nav): ${contentCards.length}`);

if (contentCards.length > 0) {
  const firstContentCard = page.locator(`a[href="${contentCards[0].href}"]`).first();
  await firstContentCard.click({ button: 'right' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'page-1765-rightclick.png' });
  
  const menuItems = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      const cls = el.className?.toString() ?? '';
      return r.width > 0 && r.height > 0 && (cls.includes('context') || cls.includes('menu') || cls.includes('popup') || cls.includes('dropdown'));
    }).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString().substring(0, 80),
      text: el.textContent?.trim().substring(0, 60),
    }));
  });
  console.log(`\nMenu-like elements after right-click:`);
  menuItems.forEach((m, i) => console.log(`${i}: <${m.tag}> "${m.text}" | ${m.cls}`));
} else {
  // Try right-clicking any visible card
  const anyCard = page.locator('a').filter({ hasNot: page.locator('[class*="hub"], [class*="nav"]') }).nth(3);
  await anyCard.click({ button: 'right' }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'page-1765-rightclick.png' });
  console.log('Tried right-clicking 4th link, screenshot saved');
}

await browser.close();
