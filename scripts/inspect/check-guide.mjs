import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/guide');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(4000);

// Dismiss tooltip by clicking Next/Done
const nextBtn = page.locator('button:has-text("Next")');
for (let i = 0; i < 10; i++) {
  if (!(await nextBtn.isVisible().catch(() => false))) break;
  await nextBtn.click();
  await page.waitForTimeout(400);
}
const doneBtn = page.locator('button:has-text("Done")');
if (await doneBtn.isVisible().catch(() => false)) { await doneBtn.click(); await page.waitForTimeout(400); }

// Find filter-related elements
const filters = await page.evaluate(() => {
  const els = [...document.querySelectorAll('*')].filter(el => {
    const cls = el.className?.toString() ?? '';
    const role = el.getAttribute('role') ?? '';
    const text = el.textContent?.trim() ?? '';
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < 300 &&
      (cls.includes('filter') || cls.includes('Filter') || role === 'combobox' ||
       role === 'listbox' || role === 'tab' || cls.includes('tab') || cls.includes('Tab') ||
       text.includes('All') || text.includes('Sports') || text.includes('Movies'));
  });
  return els.slice(0, 15).map(el => ({
    tag: el.tagName,
    role: el.getAttribute('role'),
    cls: el.className?.toString().slice(0, 60),
    text: el.textContent?.trim().slice(0, 40),
    tabindex: el.getAttribute('tabindex'),
  }));
});
console.log('FILTER AREA ELEMENTS:');
console.log(JSON.stringify(filters, null, 2));

await browser.close();
