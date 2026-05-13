import { chromium } from '@playwright/test';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

if (!existsSync('scripts/auth/auth-state.json')) {
  console.error('❌ No scripts/auth/auth-state.json found. Run open-login.mjs first.');
  process.exit(1);
}

const URLS = {
  home:    'https://telustvplus.com/#/PAGE/1690',
  guide:   'https://telustvplus.com/#/guide',
  search:  'https://telustvplus.com/#/search',
  settings:'https://telustvplus.com/#/settings',
};

mkdirSync('explore-screenshots', { recursive: true });

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await context.newPage();

const report = {};

for (const [name, url] of Object.entries(URLS)) {
  console.log(`\n📍 Exploring: ${name} → ${url}`);
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Screenshot
  await page.screenshot({ path: `explore-screenshots/${name}.png`, fullPage: false });

  // Collect interactive elements
  const elements = await page.evaluate(() => {
    const selectors = [
      'button', 'a[href]', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[role="menuitem"]',
      '[role="tab"]', '[role="option"]', '[tabindex]',
      'video', '[role="grid"]', '[role="row"]', '[role="gridcell"]',
    ];
    return selectors.flatMap(sel =>
      [...document.querySelectorAll(sel)].slice(0, 5).map(el => ({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        id: el.id || null,
        class: el.className?.toString().slice(0, 60) || null,
        text: el.innerText?.trim().slice(0, 40) || null,
        ariaLabel: el.getAttribute('aria-label'),
        tabindex: el.getAttribute('tabindex'),
        selector: sel,
      }))
    ).filter((el, i, arr) =>
      arr.findIndex(e => e.tag === el.tag && e.class === el.class) === i
    ).slice(0, 30);
  });

  // Current URL (may have changed due to redirects)
  const finalUrl = page.url();

  report[name] = { url, finalUrl, elements };
  console.log(`  ✅ ${elements.length} interactive elements found`);
  console.log(`  📸 Screenshot saved: explore-screenshots/${name}.png`);
}

// Also explore content detail page
console.log('\n📍 Exploring: detail page');
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/e35a0ca8-180f-49a6-88c4-dc2ccb52ed65');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'explore-screenshots/detail.png', fullPage: false });
const detailUrl = page.url();
const detailElements = await page.evaluate(() => {
  return [...document.querySelectorAll('button, [role="button"], a[href], video')].slice(0, 20).map(el => ({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role'),
    id: el.id || null,
    class: el.className?.toString().slice(0, 60) || null,
    text: el.innerText?.trim().slice(0, 40) || null,
    ariaLabel: el.getAttribute('aria-label'),
  }));
});
report['detail'] = { url: detailUrl, elements: detailElements };
console.log(`  ✅ ${detailElements.length} interactive elements on detail page`);

// Save report
writeFileSync('explore-report.json', JSON.stringify(report, null, 2));
console.log('\n✅ Report saved to explore-report.json');
console.log('📸 Screenshots saved to explore-screenshots/');

await browser.close();
