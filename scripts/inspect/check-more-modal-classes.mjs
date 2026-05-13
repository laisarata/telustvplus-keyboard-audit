import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const storageState = JSON.parse(readFileSync('scripts/auth/auth-state.json', 'utf-8'));
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/9e8ff58f-10d0-4dcf-a8f4-f28ff0ee8131');
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => {
  const btns = [...document.querySelectorAll('button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return btns.length > 3;
}, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);

// Snapshot DOM before click
const beforeCount = await page.evaluate(() => document.querySelectorAll('*').length);

// Click More button
await page.locator('button', { hasText: /^More$/ }).first().click();
await page.waitForTimeout(1500);

// Get all elements added after click
const afterInfo = await page.evaluate(() => {
  // Find all elements with more than 50px width/height
  return [...document.querySelectorAll('*')].map(el => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: el.className?.toString(),
      role: el.getAttribute('role'),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  }).filter(e => e.w > 100 && e.h > 50 && (
    e.cls.includes('info') || e.cls.includes('modal') || e.cls.includes('popup') ||
    e.cls.includes('detail') || e.cls.includes('card') || e.cls.includes('sheet') ||
    e.cls.includes('sc-') || e.cls.includes('overlay') || e.cls.includes('dialog') ||
    e.role === 'dialog' || e.role === 'alertdialog'
  ));
});
console.log('Potential modal elements:');
afterInfo.forEach(e => console.log(`<${e.tag}> ${e.w}x${e.h} role=${e.role} | ${e.cls.substring(0, 120)}`));

// Now try Esc
console.log('\nPressing Escape...');
await page.keyboard.press('Escape');
await page.waitForTimeout(800);

// Check if modal is gone
const afterEsc = await page.evaluate(() => {
  return [...document.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    const cls = el.className?.toString() ?? '';
    return r.width > 100 && r.height > 50 && (
      cls.includes('info') || cls.includes('modal') || cls.includes('popup') ||
      cls.includes('sheet') || cls.includes('overlay') || cls.includes('dialog') ||
      el.getAttribute('role') === 'dialog'
    );
  }).map(el => el.className?.toString().substring(0, 80));
});
console.log('Elements after Esc:', afterEsc.length === 0 ? '(none — modal closed!)' : afterEsc);

await page.screenshot({ path: 'after-esc.png' });
await browser.close();
