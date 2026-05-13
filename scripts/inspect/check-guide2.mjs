import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/guide');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(4000);

const nextBtn = page.locator('button:has-text("Next")');
for (let i = 0; i < 10; i++) {
  if (!(await nextBtn.isVisible().catch(() => false))) break;
  await nextBtn.click();
  await page.waitForTimeout(400);
}
const doneBtn = page.locator('button:has-text("Done")');
if (await doneBtn.isVisible().catch(() => false)) { await doneBtn.click(); await page.waitForTimeout(400); }

// Get detailed info on the filter button
const filterDetail = await page.evaluate(() => {
  const filterBtn = document.querySelector('.guide-filter-button, .filterDropdownButton, .category-dropdown');
  if (!filterBtn) return 'not found';
  return {
    tag: filterBtn.tagName,
    role: filterBtn.getAttribute('role'),
    tabindex: filterBtn.getAttribute('tabindex'),
    ariaExpanded: filterBtn.getAttribute('aria-expanded'),
    cls: filterBtn.className.toString(),
    children: [...filterBtn.querySelectorAll('button, [role], [tabindex]')].map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      tabindex: el.getAttribute('tabindex'),
      text: el.textContent?.trim().slice(0, 30),
    })),
  };
});
console.log('FILTER DETAIL:', JSON.stringify(filterDetail, null, 2));

// Tab through the page and see what gets focused
const focusOrder = [];
for (let i = 0; i < 20; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const el = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, cls: el?.className?.toString().slice(0, 50), text: el?.textContent?.trim().slice(0, 30), tabindex: el?.getAttribute('tabindex') };
  });
  focusOrder.push(el);
  if (el.tag === 'BODY') break;
}
console.log('\nTAB ORDER (first 20):');
focusOrder.forEach((el, i) => console.log(`${i + 1}. ${el.tag} "${el.text}" [tabindex=${el.tabindex}] cls=${el.cls}`));

await browser.close();
