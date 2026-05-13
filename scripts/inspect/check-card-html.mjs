import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Get full HTML of first card
const cardHtml = await page.evaluate(() => {
  const card = document.querySelector('div.item-container');
  return card?.innerHTML?.substring(0, 2000);
});
console.log('First card HTML:');
console.log(cardHtml);

// Hover over it and check what buttons appear
const card = page.locator('div.item-container').first();
await card.hover();
await page.waitForTimeout(600);

const btnsOnHover = await page.evaluate(() => {
  return [...document.querySelectorAll('button, [class*="dot"], [class*="icon"], [class*="more"], [class*="options"]')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString().substring(0, 80),
      text: el.textContent?.trim().substring(0, 40),
      x: Math.round(el.getBoundingClientRect().x),
      y: Math.round(el.getBoundingClientRect().y),
    }));
});
console.log('\nButtons/icons visible on hover:');
btnsOnHover.forEach((b, i) => console.log(`${i}: <${b.tag}> @(${b.x},${b.y}) "${b.text}" | ${b.cls}`));

await page.screenshot({ path: 'card-hover-detail.png' });
await browser.close();
