import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
// Use a FRESH context (no auth state) to ensure tooltip appears
const context = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await context.newPage();

console.log('\n=== Guide Tooltip — Keyboard Accessibility Test ===');
await page.goto('https://telustvplus.com/#/guide');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

// 1. Check if tooltip is visible
const tooltipInfo = await page.evaluate(() => {
  // Find tooltip container
  const overlays = [...document.querySelectorAll('[class*="tooltip"], [class*="Tooltip"], [class*="tutorial"], [class*="Tutorial"], [class*="onboard"], [class*="coach"]')]
    .filter(el => el.offsetParent !== null)
    .map(el => ({ tag: el.tagName, class: el.className?.toString().slice(0, 80), text: el.textContent?.trim().slice(0, 80) }));

  // Check the buttons visible
  const visibleBtns = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null)
    .map(b => ({ text: b.textContent?.trim().slice(0, 30), class: b.className?.toString().slice(0, 60) }));

  // Check aria-modal or role=dialog
  const dialogs = [...document.querySelectorAll('[role="dialog"], [aria-modal="true"]')]
    .map(el => ({ tag: el.tagName, role: el.getAttribute('role'), ariaModal: el.getAttribute('aria-modal'), text: el.textContent?.trim().slice(0, 80) }));

  return { overlays, visibleBtns, dialogs, bodyText: document.body.innerText?.slice(0, 300) };
});

console.log('\nBody text (first 300 chars):\n', tooltipInfo.bodyText);
console.log('\nDialogs/modals:', JSON.stringify(tooltipInfo.dialogs, null, 2));
console.log('\nTooltip-like elements:', JSON.stringify(tooltipInfo.overlays, null, 2));
console.log('\nAll visible buttons:', JSON.stringify(tooltipInfo.visibleBtns, null, 2));

// 2. Check if tooltip is present and try keyboard navigation
const hasNextBtn = await page.locator('button:has-text("Next")').isVisible().catch(() => false);
const hasDoneBtn = await page.locator('button:has-text("Done")').isVisible().catch(() => false);
const hasBackBtn = await page.locator('button:has-text("Back")').isVisible().catch(() => false);
console.log(`\nTooltip buttons visible: Next=${hasNextBtn}, Done=${hasDoneBtn}, Back=${hasBackBtn}`);

if (hasNextBtn || hasDoneBtn) {
  console.log('\n--- Testing keyboard access to tooltip ---');

  // Start from page body, Tab through and see what gets focused
  await page.keyboard.press('Escape'); // try Escape first
  await page.waitForTimeout(400);
  const afterEsc = await page.locator('button:has-text("Next")').isVisible().catch(() => false);
  console.log(`After pressing Escape: tooltip still visible = ${afterEsc}`);

  // Tab through elements to see if we can reach the tooltip buttons
  const focusTrail = [];
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(150);
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName, text: el?.textContent?.trim().slice(0, 30), class: el?.className?.toString().slice(0, 50) };
    });
    focusTrail.push(`${i+1}: ${focused.tag} "${focused.text}" [${focused.class}]`);

    // Stop if we reached a Next/Done/Back button
    if (focused.text?.toLowerCase().includes('next') || focused.text?.toLowerCase().includes('done') || focused.text?.toLowerCase().includes('back')) {
      console.log(`✅ Tooltip button reachable via Tab after ${i+1} presses!`);

      // Try pressing Enter on it
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      const afterEnter = await page.locator('button:has-text("Next")').isVisible().catch(() => false);
      console.log(`After pressing Enter on "${focused.text}": tooltip changed = ${!afterEnter || focused.text !== 'Next'}`);
      break;
    }
  }
  console.log('\nFocus trail:');
  focusTrail.forEach(f => console.log(' ', f));
} else {
  console.log('\nNo tooltip visible on this page load (may have been already dismissed in session).');
}

await browser.close();
console.log('\n✅ Done');
