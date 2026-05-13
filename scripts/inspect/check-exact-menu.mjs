import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Snapshot element count before
const beforeCount = await page.evaluate(() => document.querySelectorAll('*').length);
const beforeClasses = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('*')].map(el => el.className?.toString()).filter(Boolean))]
);

// Right-click on the first card div.menu-trigger
const card = page.locator('div.menu-trigger').first();
await card.click({ button: 'right' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'exact-rightclick.png' });

// Find new classes
const afterClasses = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('*')].map(el => el.className?.toString()).filter(Boolean))]
);

const newClasses = afterClasses.filter(c => !beforeClasses.includes(c));
console.log('New CSS classes after right-click:', newClasses);

// Also dump all small/narrow positioned elements (typical menu size)
const menuCandidates = await page.evaluate(() =>
  [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.width < 350 && r.height > 20 && r.height < 400 &&
      r.top > 50 && r.top < 700;
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 100),
    text: el.textContent?.trim().substring(0, 60),
    x: Math.round(el.getBoundingClientRect().x),
    y: Math.round(el.getBoundingClientRect().y),
    w: Math.round(el.getBoundingClientRect().width),
    h: Math.round(el.getBoundingClientRect().height),
  }))
);
console.log('\nSmall positioned elements (possible menu):');
menuCandidates.slice(0, 20).forEach((e, i) => console.log(`${i}: <${e.tag}> @(${e.x},${e.y}) ${e.w}x${e.h} "${e.text}" | ${e.cls}`));

await browser.close();
