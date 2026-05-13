import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

// Hover over the first card to reveal the options button
const card = page.locator('div.item-container').first();
await card.scrollIntoViewIfNeeded();
await card.hover();
await page.waitForTimeout(800);
await page.screenshot({ path: 'card-hovered.png' });
console.log('Screenshot saved');
await browser.close();
