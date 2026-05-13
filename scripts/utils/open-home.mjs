import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/PAGE/1690');
await page.waitForLoadState('domcontentloaded');
console.log('Home page open — browse freely!');
// Keep open for 10 minutes
await page.waitForTimeout(600000);
await browser.close();
