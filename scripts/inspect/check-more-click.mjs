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

// Click the More button with mouse
const moreBtn = await page.$('button.imageButton');
if (moreBtn) {
  const text = await moreBtn.textContent();
  console.log('Clicking button:', text?.trim());
  await moreBtn.click();
  await page.waitForTimeout(2000);
  
  // Check what appeared
  const newEls = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      const cls = el.className?.toString() ?? '';
      return r.width > 50 && r.height > 50 && 
        (cls.includes('popup') || cls.includes('dropdown') || cls.includes('menu') || 
         cls.includes('modal') || cls.includes('overlay') || cls.includes('panel') ||
         cls.includes('tooltip') || cls.includes('context') || cls.includes('flyout') ||
         el.getAttribute('role') === 'dialog' || el.getAttribute('role') === 'menu' ||
         el.getAttribute('role') === 'listbox');
    }).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString().substring(0, 100),
      role: el.getAttribute('role'),
    }));
  });
  console.log('Overlay-like elements after click:');
  newEls.forEach((e, i) => console.log(`${i}: <${e.tag}> role=${e.role} | ${e.cls}`));

  // Also grab screenshot
  await page.screenshot({ path: 'more-button-click.png' });
  console.log('Screenshot saved to more-button-click.png');
}

await browser.close();
