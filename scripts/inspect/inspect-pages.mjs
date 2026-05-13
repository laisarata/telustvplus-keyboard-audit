import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await context.newPage();

// ── 1. MEDIA PLAYER ──────────────────────────────────────────────────────────
console.log('\n=== MEDIA PLAYER ===');
await page.goto('https://telustvplus.com/#/player/ondemand/episode/?playbackId=978638336&contentType=VOD');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);
await page.mouse.click(640, 360);
await page.waitForTimeout(1000);

const playerInfo = await page.evaluate(() => {
  const video = document.querySelector('video');
  const allVideos = [...document.querySelectorAll('video')];
  const iframes = [...document.querySelectorAll('iframe')];
  const playerContainers = [...document.querySelectorAll('[class*="player"], [class*="Player"], [id*="player"], [id*="Player"]')]
    .slice(0, 5).map(el => ({ tag: el.tagName, id: el.id, class: el.className?.toString().slice(0, 60) }));

  return {
    videoFound: !!video,
    videoCount: allVideos.length,
    videoInfo: video ? { paused: video.paused, src: video.src?.slice(0, 60), readyState: video.readyState } : null,
    iframeCount: iframes.length,
    iframeSrcs: iframes.map(i => i.src?.slice(0, 80)),
    playerContainers,
    bodyClasses: document.body.className?.toString().slice(0, 100),
    currentUrl: window.location.href,
  };
});
console.log(JSON.stringify(playerInfo, null, 2));

// ── 2. SETTINGS PAGE ─────────────────────────────────────────────────────────
console.log('\n=== SETTINGS PAGE ===');
await page.goto('https://telustvplus.com/#/settings');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(3000);

const settingsInfo = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll('input')].map(el => ({
    type: el.type,
    id: el.id,
    class: el.className?.toString().slice(0, 60),
    name: el.name,
    checked: el.checked,
    value: el.value?.slice(0, 20),
    ariaLabel: el.getAttribute('aria-label'),
    parentText: el.parentElement?.textContent?.trim().slice(0, 40),
  }));

  // Also look for custom checkbox/radio components
  const customChecks = [...document.querySelectorAll('[role="checkbox"], [role="radio"], [role="switch"]')]
    .map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      class: el.className?.toString().slice(0, 60),
      ariaChecked: el.getAttribute('aria-checked'),
      text: el.textContent?.trim().slice(0, 40),
    }));

  return { inputs, customChecks };
});
console.log('Inputs:', JSON.stringify(settingsInfo.inputs, null, 2));
console.log('Custom check components:', JSON.stringify(settingsInfo.customChecks, null, 2));

// ── 3. HOME PAGE — wait longer and inspect ────────────────────────────────────
console.log('\n=== HOME PAGE (with longer wait) ===');
await page.goto('https://telustvplus.com/#/PAGE/1690');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(6000);

const homeInfo = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('a[href*="detail"], [class*="card"], [class*="Card"], [class*="tile"], [class*="Tile"]')]
    .slice(0, 5).map(el => ({
      tag: el.tagName,
      class: el.className?.toString().slice(0, 60),
      href: el.getAttribute('href')?.slice(0, 60),
      text: el.textContent?.trim().slice(0, 40),
    }));
  const focusable = [...document.querySelectorAll('a[href], button')].slice(0, 10).map(el => ({
    tag: el.tagName,
    class: el.className?.toString().slice(0, 50),
    text: el.textContent?.trim().slice(0, 30),
  }));
  return { cardCount: cards.length, cards, focusableCount: focusable.length, focusable };
});
console.log(JSON.stringify(homeInfo, null, 2));

await browser.close();
console.log('\n✅ Inspection complete');
