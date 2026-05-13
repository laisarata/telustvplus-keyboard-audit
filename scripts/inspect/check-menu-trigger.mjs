import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();

await page.goto('https://telustvplus.com/#/PAGE/1765');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

// Hover over the first menu-trigger div to reveal any hidden controls
const firstTrigger = page.locator('div.menu-trigger').first();
await firstTrigger.hover();
await page.waitForTimeout(800);
await page.screenshot({ path: 'hover-card.png' });
console.log('Hover screenshot saved');

// Check what appeared on hover
const hoverEls = await page.evaluate(() => {
  return [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    const cls = el.className?.toString() ?? '';
    return r.width > 0 && r.height > 0 && 
      (cls.includes('contextmenu') || cls.includes('context-menu') || 
       cls.includes('options') || cls.includes('more') || cls.includes('dots') ||
       cls.includes('kebab') || cls.includes('ellipsis') || cls.includes('action'));
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 100),
    text: el.textContent?.trim().substring(0, 60),
  }));
});
console.log('Elements visible on hover:');
hoverEls.forEach((e, i) => console.log(`${i}: <${e.tag}> "${e.text}" | ${e.cls}`));

// Now right-click on the menu-trigger div itself
await firstTrigger.click({ button: 'right' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'rightclick-trigger.png' });
console.log('Right-click screenshot saved');

const afterRightClick = await page.evaluate(() => {
  return [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    const cls = el.className?.toString() ?? '';
    return r.width > 20 && r.height > 0 && r.width < 500 &&
      (cls.includes('contextmenu') || cls.includes('context-menu') || 
       cls.includes('popup') || cls.includes('dropdown') || 
       el.getAttribute('role') === 'menu' || el.getAttribute('role') === 'menuitem');
  }).map(el => ({
    tag: el.tagName,
    cls: el.className?.toString().substring(0, 100),
    text: el.textContent?.trim().substring(0, 80),
    role: el.getAttribute('role'),
  }));
});
console.log('\nMenu elements after right-click on trigger:');
afterRightClick.forEach((e, i) => console.log(`${i}: <${e.tag}> role=${e.role} "${e.text}" | ${e.cls}`));

await browser.close();
