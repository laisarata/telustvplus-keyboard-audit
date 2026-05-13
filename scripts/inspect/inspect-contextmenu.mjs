import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

// Right-click the second card (SC card) to open context menu
const cards = page.locator('div.menu-trigger');
await cards.nth(1).click({ button: 'right' });
await page.waitForTimeout(800);

// Dump ALL visible elements to find exact class names
const allVisible = await page.evaluate(() =>
  [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 20 && r.height > 10 && r.width < 500 && r.height < 600;
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString(),
    text: el.textContent?.trim().substring(0, 60),
    role: el.getAttribute('role'),
    x: Math.round(el.getBoundingClientRect().x),
    y: Math.round(el.getBoundingClientRect().y),
    w: Math.round(el.getBoundingClientRect().width),
    h: Math.round(el.getBoundingClientRect().height),
  })).filter(e => e.x > 200 && e.x < 600 && e.y > 300 && e.y < 600)
);

console.log('Elements in context menu area:');
allVisible.forEach((e, i) => console.log(`${i}: <${e.tag}> @(${e.x},${e.y}) ${e.w}x${e.h} role=${e.role} "${e.text}" | ${e.cls}`));

await browser.close();
