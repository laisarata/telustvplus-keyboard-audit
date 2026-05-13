import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await context.newPage();

const VOD_URL = 'https://telustvplus.com/#/player/ondemand/episode/?playbackId=978638336&contentType=VOD';

console.log('\n=== VOD PLAYER INSPECTION ===');
await page.goto(VOD_URL);
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(7000);
await page.mouse.click(640, 360);
await page.waitForTimeout(2000);

const snapshot = await page.evaluate(() => {
  const v = document.querySelector('video');
  const buttons = [...document.querySelectorAll('button')].map(b => ({
    text: b.textContent?.trim().slice(0, 40),
    ariaLabel: b.getAttribute('aria-label'),
    class: b.className?.toString().slice(0, 80),
    ariaPressed: b.getAttribute('aria-pressed'),
  }));
  const progressBars = [...document.querySelectorAll('[role="progressbar"], [role="slider"], input[type="range"]')]
    .map(el => ({ tag: el.tagName, role: el.getAttribute('role'), ariaValue: el.getAttribute('aria-valuenow'), class: el.className?.toString().slice(0, 60) }));
  const playerEls = [...document.querySelectorAll('[class*="control"], [class*="Control"], [class*="player"], [class*="Player"]')]
    .slice(0, 8).map(el => ({ tag: el.tagName, class: el.className?.toString().slice(0, 60) }));
  return {
    url: window.location.href,
    video: v ? { readyState: v.readyState, src: v.src?.slice(0, 80), paused: v.paused, currentTime: v.currentTime } : null,
    buttons,
    progressBars,
    playerEls,
  };
});

console.log('URL:', snapshot.url);
console.log('Video:', JSON.stringify(snapshot.video));
console.log('\nButtons:', JSON.stringify(snapshot.buttons, null, 2));
console.log('\nProgress/Sliders:', JSON.stringify(snapshot.progressBars, null, 2));
console.log('\nPlayer elements (sample):', JSON.stringify(snapshot.playerEls, null, 2));

// Now try pressing Space and see if UI changes
console.log('\n--- Pressing Space ---');
await page.mouse.click(640, 360); // re-focus player
await page.waitForTimeout(500);
const beforeSpace = await page.evaluate(() => ({
  buttons: [...document.querySelectorAll('button')].map(b => ({ text: b.textContent?.trim().slice(0, 30), class: b.className?.toString().slice(0, 60) })),
  bodyHtml: document.body.innerHTML.length,
}));
await page.keyboard.press('Space');
await page.waitForTimeout(800);
const afterSpace = await page.evaluate(() => ({
  buttons: [...document.querySelectorAll('button')].map(b => ({ text: b.textContent?.trim().slice(0, 30), class: b.className?.toString().slice(0, 60) })),
  bodyHtml: document.body.innerHTML.length,
}));
console.log('HTML length before Space:', beforeSpace.bodyHtml, '→ after:', afterSpace.bodyHtml, '| Changed:', beforeSpace.bodyHtml !== afterSpace.bodyHtml);
console.log('Button count before:', beforeSpace.buttons.length, '→ after:', afterSpace.buttons.length);

await browser.close();
console.log('\n✅ Done');
