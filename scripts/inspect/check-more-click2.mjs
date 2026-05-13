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

// Find button with text "More"
const allBtns = await page.evaluate(() => {
  return [...document.querySelectorAll('button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }).map((el, i) => ({
    index: i,
    text: el.textContent?.trim(),
    cls: el.className?.toString(),
  }));
});
console.log('All visible buttons:');
allBtns.forEach(b => console.log(`${b.index}: "${b.text}" | ${b.cls}`));

// Click the More button by finding it with text
const moreBtn = page.locator('button', { hasText: /^More$/ });
const count = await moreBtn.count();
console.log(`\n"More" buttons found: ${count}`);

if (count > 0) {
  await moreBtn.first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'more-button-open.png' });
  console.log('Screenshot saved');
  
  // Scan for new overlay elements
  const overlayEls = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 100 && r.height > 100;
    }).filter(el => {
      const cls = el.className?.toString() ?? '';
      const role = el.getAttribute('role') ?? '';
      return cls.includes('popup') || cls.includes('dropdown') || cls.includes('menu') || 
        cls.includes('modal') || cls.includes('overlay') || cls.includes('panel') ||
        cls.includes('tooltip') || cls.includes('context') || cls.includes('flyout') ||
        cls.includes('detail') || cls.includes('info') ||
        role === 'dialog' || role === 'menu' || role === 'listbox';
    }).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString().substring(0, 100),
      role: el.getAttribute('role'),
    }));
  });
  console.log('\nOverlay-like elements after click:');
  overlayEls.forEach((e, i) => console.log(`${i}: <${e.tag}> role=${e.role} | ${e.cls}`));
}

await browser.close();
