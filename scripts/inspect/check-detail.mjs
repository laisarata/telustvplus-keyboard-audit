import { chromium } from './node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/e35a0ca8-180f-49a6-88c4-dc2ccb52ed65');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(4000);

// Get all interactive elements on the page
const interactive = await page.evaluate(() => {
  return [...document.querySelectorAll('button, a, [role="tab"], [role="button"], input, select')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      text: el.textContent?.trim().slice(0, 40),
      cls: el.className?.toString().slice(0, 50),
      tabindex: el.getAttribute('tabindex'),
    }))
    .slice(0, 30);
});
console.log('INTERACTIVE ELEMENTS:');
interactive.forEach((el, i) => console.log(`${i+1}. ${el.tag}[role=${el.role}] tabindex=${el.tabindex} "${el.text}" cls=${el.cls}`));

// Check focus on page load
const focusOnLoad = await page.evaluate(() => {
  const el = document.activeElement;
  return { tag: el?.tagName, cls: el?.className?.toString().slice(0, 50), text: el?.textContent?.trim().slice(0, 30) };
});
console.log('\nFOCUS ON PAGE LOAD:', JSON.stringify(focusOnLoad));

// Tab order
console.log('\nTAB ORDER:');
for (let i = 0; i < 15; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const el = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, role: el?.getAttribute('role'), text: el?.textContent?.trim().slice(0, 30), cls: el?.className?.toString().slice(0, 40) };
  });
  console.log(`${i+1}. ${el.tag}[role=${el.role}] "${el.text}" cls=${el.cls}`);
  if (el.tag === 'BODY') break;
}

await browser.close();
