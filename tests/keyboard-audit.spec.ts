import { test, expect, Page } from '@playwright/test';
import { writeResult } from '../helpers/write-result';

// ── URLs ─────────────────────────────────────────────────────────────────────
const URL = {
  home:    'https://telustvplus.com/#/PAGE/1690',
  guide:   'https://telustvplus.com/#/guide',
  search:  'https://telustvplus.com/#/search',
  detail:  'https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/9e8ff58f-10d0-4dcf-a8f4-f28ff0ee8131',
  player:  'https://telustvplus.com/#/player/ondemand/movie/?playbackId=1521523473&contentType=VOD',
  settings:'https://telustvplus.com/#/settings',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getActiveEl(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    return `${el?.tagName}#${el?.id}.${el?.className?.toString().slice(0, 40)}`;
  });
}

async function focusMoved(page: Page, key: string): Promise<boolean> {
  const before = await getActiveEl(page);
  await page.keyboard.press(key);
  await page.waitForTimeout(400);
  const after = await getActiveEl(page);
  return after !== before && !after.startsWith('BODY') && !after.startsWith('HTML');
}

async function waitForHome(page: Page) {
  await page.goto(URL.home);
  await page.waitForLoadState('domcontentloaded');
  // Wait for content cards to appear (needs ~6s)
  await page.waitForSelector('a[href*="detail"]', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function waitForPlayer(page: Page): Promise<boolean> {
  await page.goto(URL.player);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);
  await page.mouse.click(640, 360);
  await page.waitForTimeout(1000);
  // Wait for player UI controls to appear (Play/Pause button is the reliable signal)
  try {
    await page.waitForFunction(() => !!document.querySelector('button.playbackButton'), { timeout: 10000 });
  } catch {
    return false;
  }
  // Verify video is actually playing — currentTime must advance past 0
  // (catches auth errors, concurrent stream limit, and other playback failures)
  try {
    await page.waitForFunction(() => {
      const v = document.querySelector('video') as HTMLVideoElement | null;
      return v != null && v.currentTime > 0;
    }, { timeout: 15000 });
    console.log('✅ Video confirmed playing (currentTime > 0)');
    return true;
  } catch {
    console.warn('⚠️  Video element found but currentTime never advanced — stream may have errored or auth expired');
    return false;
  }
}

interface PlayerState {
  playButtonText: string | null;
  volButtonClass: string | null;
  htmlLength: number;
}

async function getPlayerState(page: Page): Promise<PlayerState | null> {
  return page.evaluate(() => {
    const playBtn = document.querySelector('button.playbackButton') as HTMLButtonElement;
    const volBtn  = document.querySelector('button.volumeButton')  as HTMLButtonElement;
    if (!playBtn) return null;
    return {
      playButtonText: playBtn.textContent?.trim() ?? null,
      volButtonClass: volBtn?.className?.toString() ?? null,
      htmlLength: document.body.innerHTML.length,
    };
  });
}

async function dismissTooltip(page: Page) {
  // Setup helper: dismiss the Guide onboarding tooltip so EPG tests can reach the grid.
  // NOTE: The Tooltip/Tutorial Overlay tests confirm this overlay is NOT keyboard-dismissible
  // (Esc = Missing, Tab = Missing). Mouse clicks are used here only as setup infrastructure
  // to unblock EPG grid testing — this is NOT a test interaction itself.
  const nextBtn = page.locator('button:has-text("Next")');
  let attempts = 0;
  while (attempts < 10 && await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(400);
    attempts++;
  }
  // Handle final "Done" button (last step of multi-step tooltip)
  const doneBtn = page.locator('button:has-text("Done")');
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click();
    await page.waitForTimeout(400);
  }
  const closeBtn = page.locator('button.close, button[aria-label="Close"], button:has-text("×")');
  if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. GLOBAL NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Global Navigation', () => {
  test('Tab — move focus to next interactive element', async ({ page }) => {
    await waitForHome(page);
    await page.keyboard.press('Tab');
    const moved = await focusMoved(page, 'Tab');
    writeResult('Global Navigation', 'Tab', moved ? 'Implemented' : 'Missing');
  });

  test('Shift+Tab — move focus to previous interactive element', async ({ page }) => {
    await waitForHome(page);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const moved = await focusMoved(page, 'Shift+Tab');
    writeResult('Global Navigation', 'Shift+Tab', moved ? 'Implemented' : 'Missing');
  });

  test('Skip Navigation Link — skip to main content', async ({ page }) => {
    await waitForHome(page);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.toLowerCase().trim() ?? '');
    const hasSkipLink = focusedText.includes('skip') || focusedText.includes('main');
    writeResult(
      'Global Navigation', 'Skip Navigation Link',
      hasSkipLink ? 'Implemented' : 'Missing',
      hasSkipLink ? '' : 'First Tab focus did not land on a skip-to-main-content link'
    );
  });

  test('Enter/Space — open navigation dropdown menu', async ({ page }) => {
    await waitForHome(page);
    // Tab to the nav hub dropdown button — keyboard only
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const isMenuBtn = await page.evaluate(() =>
        document.activeElement?.className?.toString().includes('hubs-dropdown') ?? false
      );
      if (isMenuBtn) break;
    }
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const menuOpenedWithEnter = await page.locator('[class*="dropdown"], [class*="menu"]').isVisible().catch(() => false);
    if (!menuOpenedWithEnter) {
      // Try Space if Enter didn't work
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
    }
    const menuOpen = menuOpenedWithEnter || await page.locator('[class*="dropdown"], [class*="menu"]').isVisible().catch(() => false);
    await page.keyboard.press('Escape'); // clean up
    writeResult('Global Navigation', 'Enter / Space (open menu)', menuOpen ? 'Implemented' : 'Missing',
      menuOpen ? '' : 'Enter and Space did not open the navigation dropdown menu');
  });

  test('Esc — close open menus/tooltips', async ({ page }) => {
    await waitForHome(page);
    // Tab to the nav hub dropdown button — keyboard only
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const isMenuBtn = await page.evaluate(() =>
        document.activeElement?.className?.toString().includes('hubs-dropdown') ?? false
      );
      if (isMenuBtn) break;
    }
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const menuOpenBefore = await page.locator('[class*="dropdown"], [class*="menu"]').isVisible().catch(() => false);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const menuOpenAfter = await page.locator('[class*="dropdown"], [class*="menu"]').isVisible().catch(() => false);
    const closed = menuOpenBefore && !menuOpenAfter;
    writeResult('Global Navigation', 'Esc (Escape)', closed ? 'Implemented' : 'To Be Audited',
      closed ? '' : 'Could not verify Esc closes open menu opened via keyboard — manual check needed');
  });

  test('F6 — move between major UI panes', async ({ page }) => {
    await waitForHome(page);
    const moved = await focusMoved(page, 'F6');
    writeResult('Global Navigation', 'F6', moved ? 'Implemented' : 'Missing');
  });

  test('Alt+Left — browser back (must not be intercepted)', async ({ page }) => {
    await waitForHome(page);
    // Tab to the search link/button and press Enter — keyboard only
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const isSearchLink = await page.evaluate(() => {
        const el = document.activeElement;
        const href = el?.getAttribute('href') ?? '';
        const cls = el?.className?.toString() ?? '';
        return href.includes('search') || cls.includes('search-icon') || cls.includes('search');
      });
      if (isSearchLink) break;
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const urlBefore = page.url();
    // Now press Alt+Left to go back — this must not be intercepted by the app
    await page.keyboard.press('Alt+ArrowLeft');
    await page.waitForTimeout(1000);
    const urlAfter = page.url();
    const navigated = urlAfter !== urlBefore;
    writeResult('Global Navigation', 'Alt+Left / Alt+Right', navigated ? 'Implemented' : 'Missing',
      navigated ? '' : 'Browser back shortcut appears to be intercepted or not working');
  });

  test('? — display keyboard shortcuts help overlay', async ({ page }) => {
    await waitForHome(page);
    await page.keyboard.press('?');
    await page.waitForTimeout(600);
    const overlayVisible = await page.locator('[class*="shortcut"], [class*="help"], [class*="overlay"], [role="dialog"]').isVisible().catch(() => false);
    writeResult('Global Navigation', '? or Shift+?', overlayVisible ? 'Implemented' : 'Missing',
      overlayVisible ? '' : 'No keyboard shortcuts overlay appeared after pressing ?');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Authentication', () => {
  const LOGIN_URL = 'https://www.telus.com/ttv-login-v2/login?service_type=opus_tv_telus_html&acr=ci-loa3';
  const MANUAL_FLAG = '⚠️ MANUAL TEST REQUIRED on a logged-out session — ';

  // Helper: navigate to login and check if the form is actually visible
  async function goToLogin(page: Page): Promise<boolean> {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    return page.locator('#IDToken1').isVisible().catch(() => false);
  }

  test('Tab/Shift+Tab — navigate login form fields', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Tab / Shift+Tab', 'To Be Audited', MANUAL_FLAG + 'Tab through all form fields (email, password, login button, forgot password link) and verify focus order is logical.');
      return;
    }
    // Tab from page start until we land on the email field — keyboard only
    let reachedField = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const focused = await page.evaluate(() => document.activeElement?.id ?? '');
      if (focused === 'IDToken1') { reachedField = true; break; }
    }
    if (!reachedField) {
      writeResult('Authentication', 'Tab / Shift+Tab', 'Missing', 'Could not reach email field via Tab from page start');
      return;
    }
    const moved = await focusMoved(page, 'Tab');
    const nextField = await page.evaluate(() => document.activeElement?.id ?? '');
    writeResult('Authentication', 'Tab / Shift+Tab',
      moved && nextField !== 'IDToken1' ? 'Implemented' : 'Missing',
      moved ? `Tab moved from email to: #${nextField}` : 'Tab did not move focus to the next form field');
  });

  test('Enter/Return — submit login form', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Enter / Return', 'To Be Audited', MANUAL_FLAG + 'Fill in email and password fields using keyboard, then press Enter and confirm the form submits.');
      return;
    }
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => document.activeElement?.id ?? '');
      if (focused === 'IDToken1') break;
    }
    await page.keyboard.type('test@test.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('testpassword');
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    const pageChanged = urlAfter !== urlBefore ||
      await page.locator('[class*="error"], [class*="Error"], [aria-live]').isVisible().catch(() => false);
    writeResult('Authentication', 'Enter / Return',
      pageChanged ? 'Implemented' : 'Missing',
      pageChanged ? 'Enter submitted the form (URL changed or validation error shown)' : 'Enter did not submit the login form');
  });

  test('Focus on page load — auto-focus email field', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Focus on page load', 'To Be Audited', MANUAL_FLAG + 'Open the login page and check whether the email field receives focus automatically — without pressing Tab.');
      return;
    }
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? '');
    const autoFocused = focusedId === 'IDToken1';
    writeResult('Authentication', 'Focus on page load',
      autoFocused ? 'Implemented' : 'Missing',
      autoFocused ? 'Email field receives focus automatically on page load' : 'Email field does not receive focus on load — keyboard users must Tab to find the first field');
  });

  test('Space / Enter — activate login button', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Space / Enter (login button)', 'To Be Audited', MANUAL_FLAG + 'Tab to the Login/Sign In button and press Space or Enter — confirm the form submits without using a mouse click.');
      return;
    }
    // Tab until we reach the submit button
    let reachedButton = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName, type: el?.getAttribute('type'), text: el?.textContent?.trim().toLowerCase() };
      });
      if (focused.tag === 'BUTTON' || focused.type === 'submit') { reachedButton = true; break; }
    }
    if (!reachedButton) {
      writeResult('Authentication', 'Space / Enter (login button)', 'Missing', 'Could not reach the login button via Tab — button may not be keyboard focusable');
      return;
    }
    const urlBefore = page.url();
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    const pageChanged = urlAfter !== urlBefore ||
      await page.locator('[class*="error"], [class*="Error"], [aria-live]').isVisible().catch(() => false);
    writeResult('Authentication', 'Space / Enter (login button)',
      pageChanged ? 'Implemented' : 'Missing',
      pageChanged ? 'Space activated the login button' : 'Space/Enter did not activate the login button when it was focused');
  });

  test('Error message — keyboard accessible after failed login', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Error message accessibility', 'To Be Audited', MANUAL_FLAG + 'Submit the form with wrong credentials and verify the error message is visible and reachable by keyboard (focus moves to error, or it is announced via aria-live).');
      return;
    }
    // Tab to email, type wrong credentials, submit
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => document.activeElement?.id ?? '');
      if (focused === 'IDToken1') break;
    }
    await page.keyboard.type('wrong@test.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('wrongpassword');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    // Check for error message visible and aria-live or focus
    const errorVisible = await page.locator('[class*="error"], [class*="Error"], [role="alert"], [aria-live]').isVisible().catch(() => false);
    const focusedAfter = await page.evaluate(() => document.activeElement?.getAttribute('role') ?? document.activeElement?.tagName ?? '');
    const errorAnnounced = errorVisible && (focusedAfter === 'alert' || await page.locator('[role="alert"], [aria-live="assertive"]').isVisible().catch(() => false));
    writeResult('Authentication', 'Error message accessibility',
      errorAnnounced ? 'Implemented' : errorVisible ? 'Partial' : 'Missing',
      errorVisible ? (errorAnnounced ? 'Error is visible and announced via aria-live/role=alert' : 'Error is visible but may not be announced to screen readers — check aria-live attribute') : 'No error message appeared after failed login');
  });

  test('"Forgot password" link — reachable via Tab', async ({ page }) => {
    if (!(await goToLogin(page))) {
      writeResult('Authentication', 'Forgot password link', 'To Be Audited', MANUAL_FLAG + 'Tab through the login form and verify the "Forgot password?" link is reachable and activatable with Enter.');
      return;
    }
    let found = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const text = await page.evaluate(() => document.activeElement?.textContent?.toLowerCase().trim() ?? '');
      if (text.includes('forgot') || text.includes('reset') || text.includes('password')) { found = true; break; }
    }
    writeResult('Authentication', 'Forgot password link',
      found ? 'Implemented' : 'Missing',
      found ? '"Forgot password" link is reachable via Tab' : '"Forgot password" link was not reachable via Tab within 15 key presses');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CONTENT BROWSE & CAROUSELS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Content Browse & Carousels', () => {
  test('Tab/Shift+Tab — move focus between carousels', async ({ page }) => {
    await waitForHome(page);
    await page.keyboard.press('Tab');
    const moved = await focusMoved(page, 'Tab');
    writeResult('Content Browse & Carousels', 'Tab / Shift+Tab', moved ? 'Implemented' : 'Missing');
  });

  test('Left/Right Arrow — move between items in carousel', async ({ page }) => {
    await waitForHome(page);
    // Tab until we land on a content card link
    let onCard = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      onCard = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'A' && (el.getAttribute('href') ?? '').includes('detail');
      });
      if (onCard) break;
    }
    const before = await getActiveEl(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    const moved = before !== after;
    writeResult('Content Browse & Carousels', 'Left / Right Arrow', moved ? 'Implemented' : 'Missing',
      moved ? '' : 'Arrow keys did not move focus between carousel items');
  });

  test('Enter/Return — open content detail page', async ({ page }) => {
    await waitForHome(page);
    // Tab until we land on a content card link
    let onCard = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      onCard = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'A' && (el.getAttribute('href') ?? '').includes('detail');
      });
      if (onCard) break;
    }
    if (!onCard) {
      writeResult('Content Browse & Carousels', 'Enter / Return', 'Missing', 'Could not reach a content card via Tab');
      return;
    }
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    const navigated = urlAfter !== urlBefore && urlAfter.includes('detail');
    writeResult('Content Browse & Carousels', 'Enter / Return', navigated ? 'Implemented' : 'Missing',
      navigated ? '' : 'Enter did not navigate to content detail page');
  });

  test('Home/End — jump to first/last carousel item', async ({ page }) => {
    await waitForHome(page);
    // Tab until we land on a content card link
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const onCard = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'A' && (el.getAttribute('href') ?? '').includes('detail');
      });
      if (onCard) break;
    }
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const before = await getActiveEl(page);
    await page.keyboard.press('Home');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    writeResult('Content Browse & Carousels', 'Home / End', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '' : 'Home/End keys did not jump to first/last carousel item');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Search', () => {
  // Tab from page start until the active element is an INPUT — keyboard only
  async function tabToSearchInput(page: Page): Promise<boolean> {
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      if (tag === 'INPUT') return true;
    }
    return false;
  }

  test('Tab — focus search input', async ({ page }) => {
    await page.goto(URL.search);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const reached = await tabToSearchInput(page);
    writeResult('Search', 'Tab', reached ? 'Implemented' : 'Missing',
      reached ? '' : 'Could not reach search input via Tab from page start');
  });

  test('Tab — navigate from input into search results', async ({ page }) => {
    // Search uses a swimlane/carousel layout — no autocomplete dropdown.
    // After typing, results appear as card rows. Test: can Tab move focus from input into results?
    await page.goto(URL.search);
    await page.waitForTimeout(2000);
    const reached = await tabToSearchInput(page);
    if (!reached) {
      writeResult('Search', 'Arrow keys', 'Missing', 'Could not reach search input via Tab');
      return;
    }
    await page.keyboard.type('news');
    await page.waitForTimeout(2000);
    // Tab from the input into the results
    let reachedResult = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reachedResult = await page.evaluate(() => {
        const el = document.activeElement;
        const href = el?.getAttribute('href') ?? '';
        return el?.tagName === 'A' && (href.includes('detail') || href.includes('player'));
      });
      if (reachedResult) break;
    }
    writeResult('Search', 'Arrow keys', reachedResult ? 'Implemented' : 'Missing',
      reachedResult ? 'Tab moves focus from search input into result cards' : 'Could not Tab from search input into result cards — results may not be keyboard reachable');
  });

  test('Enter/Return — submit search', async ({ page }) => {
    await page.goto(URL.search);
    await page.waitForTimeout(2000);
    const reached = await tabToSearchInput(page);
    if (!reached) {
      writeResult('Search', 'Enter / Return', 'Missing', 'Could not reach search input via Tab');
      return;
    }
    await page.keyboard.type('news');
    await page.waitForTimeout(500);
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const urlAfter = page.url();
    const submitted = urlAfter !== urlBefore || await page.locator('[class*="result"], [class*="Result"]').isVisible().catch(() => false);
    writeResult('Search', 'Enter / Return', submitted ? 'Implemented' : 'Missing');
  });

  test('Esc — clear search field or navigate away', async ({ page }) => {
    // Search has no autocomplete dropdown. Esc should either clear the input or navigate away.
    await page.goto(URL.search);
    await page.waitForTimeout(2000);
    const reached = await tabToSearchInput(page);
    if (!reached) {
      writeResult('Search', 'Esc (Escape)', 'Missing', 'Could not reach search input via Tab');
      return;
    }
    await page.keyboard.type('news');
    await page.waitForTimeout(1000);
    const valueBefore = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.value ?? '');
    const urlBefore = page.url();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const valueAfter = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.value ?? '');
    const urlAfter = page.url();
    const cleared = valueAfter === '' && valueBefore !== '';
    const navigated = urlAfter !== urlBefore;
    writeResult('Search', 'Esc (Escape)',
      cleared || navigated ? 'Implemented' : 'Missing',
      cleared ? 'Esc cleared the search input' :
      navigated ? 'Esc navigated away from search page' :
      'Esc had no effect — did not clear input or navigate away');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. EPG / TV GUIDE GRID
// ═══════════════════════════════════════════════════════════════════════════
test.describe('EPG / TV Guide Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    // Tab into the page — keyboard only
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
  });

  // ── Filter component ──────────────────────────────────────────────────────

  test('Filter — Tab to reach filter button', async ({ page }) => {
    // Reset to page start and check if filter button is reachable via Tab
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reached = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return cls.includes('filter') || cls.includes('Filter') || cls.includes('category-dropdown') ||
               cls.includes('filterDropdown') || (el?.textContent?.toLowerCase().includes('channel') ?? false);
      });
      if (reached) break;
    }
    writeResult('EPG / TV Guide Grid', 'Filter — Tab', reached ? 'Implemented' : 'Missing',
      reached ? 'Filter button is reachable via Tab' : 'Filter button is not in the keyboard tab order — keyboard users cannot access channel filtering');
  });

  test('Filter — Enter/Space to open dropdown', async ({ page }) => {
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    // Try to Tab to the filter button
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reached = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return cls.includes('filter') || cls.includes('Filter') || cls.includes('filterDropdown');
      });
      if (reached) break;
    }
    if (!reached) {
      writeResult('EPG / TV Guide Grid', 'Filter — Enter/Space', 'Missing',
        'Filter button not reachable via Tab — cannot test open behaviour');
      return;
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const opened = await page.locator('[class*="dropdown"], [class*="filter-list"], [role="listbox"]').isVisible().catch(() => false);
    writeResult('EPG / TV Guide Grid', 'Filter — Enter/Space', opened ? 'Implemented' : 'Missing',
      opened ? 'Enter opened the filter dropdown' : 'Enter/Space did not open the filter dropdown');
    if (opened) await page.keyboard.press('Escape');
  });

  test('Filter — Arrow keys to navigate options', async ({ page }) => {
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reached = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return cls.includes('filter') || cls.includes('Filter') || cls.includes('filterDropdown');
      });
      if (reached) break;
    }
    if (!reached) {
      writeResult('EPG / TV Guide Grid', 'Filter — Arrow keys', 'Missing',
        'Filter button not reachable via Tab — cannot test arrow key navigation');
      return;
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const opened = await page.locator('[class*="dropdown"], [class*="filter-list"], [role="listbox"]').isVisible().catch(() => false);
    if (!opened) {
      writeResult('EPG / TV Guide Grid', 'Filter — Arrow keys', 'Missing',
        'Filter dropdown could not be opened via keyboard');
      return;
    }
    const before = await getActiveEl(page);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    const moved = before !== after;
    writeResult('EPG / TV Guide Grid', 'Filter — Arrow keys', moved ? 'Implemented' : 'Missing',
      moved ? 'Arrow keys navigate filter options' : 'Arrow keys did not move focus between filter options');
    await page.keyboard.press('Escape');
  });

  test('Filter — Esc to close dropdown', async ({ page }) => {
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reached = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return cls.includes('filter') || cls.includes('Filter') || cls.includes('filterDropdown');
      });
      if (reached) break;
    }
    if (!reached) {
      writeResult('EPG / TV Guide Grid', 'Filter — Esc', 'Missing',
        'Filter button not reachable via Tab — cannot test Esc behaviour');
      return;
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const opened = await page.locator('[class*="dropdown"], [class*="filter-list"], [role="listbox"]').isVisible().catch(() => false);
    if (!opened) {
      writeResult('EPG / TV Guide Grid', 'Filter — Esc', 'Missing',
        'Filter dropdown could not be opened via keyboard');
      return;
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const closed = !(await page.locator('[class*="dropdown"], [class*="filter-list"], [role="listbox"]').isVisible().catch(() => false));
    writeResult('EPG / TV Guide Grid', 'Filter — Esc', closed ? 'Implemented' : 'Missing',
      closed ? 'Esc closed the filter dropdown' : 'Esc did not close the filter dropdown');
  });

  // ── Grid navigation ───────────────────────────────────────────────────────

  test('Left Arrow — navigate time slots backward', async ({ page }) => {
    const moved = await focusMoved(page, 'ArrowLeft');
    writeResult('EPG / TV Guide Grid', 'Left Arrow', moved ? 'Implemented' : 'Partial',
      moved ? '' : 'Left arrow did not visibly move focus in the grid — verify manually');
  });

  test('Right Arrow — navigate time slots forward', async ({ page }) => {
    const moved = await focusMoved(page, 'ArrowRight');
    writeResult('EPG / TV Guide Grid', 'Right Arrow', moved ? 'Implemented' : 'Partial',
      moved ? '' : 'Right arrow did not visibly move focus in the grid — verify manually');
  });

  test('Up Arrow — navigate channels up', async ({ page }) => {
    const moved = await focusMoved(page, 'ArrowUp');
    writeResult('EPG / TV Guide Grid', 'Up Arrow', moved ? 'Implemented' : 'Partial',
      moved ? '' : 'Up arrow did not visibly move focus in the grid — verify manually');
  });

  test('Down Arrow — navigate channels down', async ({ page }) => {
    const moved = await focusMoved(page, 'ArrowDown');
    writeResult('EPG / TV Guide Grid', 'Down Arrow', moved ? 'Implemented' : 'Partial',
      moved ? '' : 'Down arrow did not visibly move focus in the grid — verify manually');
  });

  test('Tab/Shift+Tab — move focus in/out of grid', async ({ page }) => {
    // Start outside grid
    await page.keyboard.press('Tab');
    const before = await getActiveEl(page);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    writeResult('EPG / TV Guide Grid', 'Tab / Shift+Tab', before !== after ? 'Implemented' : 'Missing');
  });

  test('Page Up/Page Down — scroll grid', async ({ page }) => {
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(600);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    writeResult('EPG / TV Guide Grid', 'Page Up / Page Down',
      scrollAfter !== scrollBefore ? 'Implemented' : 'Missing');
  });

  test('Home/End — jump to first/last item in grid row', async ({ page }) => {
    const before = await getActiveEl(page);
    await page.keyboard.press('Home');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    writeResult('EPG / TV Guide Grid', 'Home / End', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '' : 'Home/End did not move focus in grid row');
  });

  test('Enter/Return — select program', async ({ page }) => {
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const urlAfter = page.url();
    const acted = urlAfter !== urlBefore || await page.locator('[class*="modal"], [class*="detail"], [role="dialog"]').isVisible().catch(() => false);
    writeResult('EPG / TV Guide Grid', 'Enter / Return', acted ? 'Implemented' : 'Missing');
  });

  test('Spacebar — toggle favourite / secondary action', async ({ page }) => {
    const before = await page.content();
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);
    const after = await page.content();
    writeResult('EPG / TV Guide Grid', 'Spacebar', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '' : 'Spacebar had no visible effect on focused grid cell');
  });

  test('N — jump grid to current time (Now)', async ({ page }) => {
    const scrollBefore = await page.evaluate(() => window.scrollX);
    await page.keyboard.press('n');
    await page.waitForTimeout(600);
    const scrollAfter = await page.evaluate(() => window.scrollX);
    writeResult('EPG / TV Guide Grid', 'N (Now)', scrollAfter !== scrollBefore ? 'Implemented' : 'Missing',
      scrollAfter !== scrollBefore ? '' : 'N key did not jump the grid to current time');
  });

  test('D — jump to next day schedule', async ({ page }) => {
    const contentBefore = await page.locator('div[tabindex="-1"]').first().textContent().catch(() => '');
    await page.keyboard.press('d');
    await page.waitForTimeout(800);
    const contentAfter = await page.locator('div[tabindex="-1"]').first().textContent().catch(() => '');
    writeResult('EPG / TV Guide Grid', 'D (Day) / Alt+Right Arrow',
      contentBefore !== contentAfter ? 'Implemented' : 'Missing',
      contentBefore !== contentAfter ? '' : 'D key did not advance the EPG to the next day');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. CONTENT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Content Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL.detail);
    await page.waitForLoadState('domcontentloaded');
    // Wait until content-area buttons appear (more than just header)
    await page.waitForFunction(() => {
      const buttons = [...document.querySelectorAll('button')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      return buttons.length > 3;
    }, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('Tab/Shift+Tab — navigate controls on detail page', async ({ page }) => {
    // Tab until we reach a content-area element (past the header)
    let reachedContent = false;
    let tabCount = 0;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      await page.waitForTimeout(150);
      reachedContent = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        const text = el?.textContent?.toLowerCase().trim() ?? '';
        // Content buttons: watch, play, details, add, watchlist, episode links
        return el?.tagName === 'BUTTON' && !cls.includes('search-icon') && !cls.includes('login') &&
          (cls.includes('wall') || cls.includes('play') || cls.includes('watch') ||
           text.includes('watch') || text.includes('play') || text.includes('details') ||
           text.includes('add') || text.includes('episode') || text.includes('season'));
      });
      if (reachedContent) break;
    }
    writeResult('Content Detail Page', 'Tab / Shift+Tab',
      reachedContent ? 'Implemented' : 'Missing',
      reachedContent ? `Tab reaches content area after ${tabCount} presses` : 'Tab only reaches header elements — page content (Watch, Watchlist, episodes) not in keyboard tab order');
  });

  test('Enter/Return — activate focused button', async ({ page }) => {
    // Tab until we reach a Watch/Play/Details button in the content area
    let reachedBtn = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reachedBtn = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        const text = el?.textContent?.toLowerCase().trim() ?? '';
        return el?.tagName === 'BUTTON' && !cls.includes('search-icon') && !cls.includes('login') &&
          (cls.includes('wall') || text.includes('watch') || text.includes('play') ||
           text.includes('details') || text.includes('episode'));
      });
      if (reachedBtn) break;
    }
    if (!reachedBtn) {
      writeResult('Content Detail Page', 'Enter / Return', 'Missing', 'Could not reach any content button via Tab — content area not in tab order');
      return;
    }
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    const acted = urlAfter !== urlBefore || await page.locator('[role="dialog"], [class*="modal"], [class*="overlay"]').isVisible().catch(() => false);
    writeResult('Content Detail Page', 'Enter / Return', acted ? 'Implemented' : 'Missing',
      acted ? 'Enter activated the focused content button' : 'Enter did not activate the focused element on detail page');
  });

  test('Arrow keys — navigate episode/season tabs', async ({ page }) => {
    // Tab until we reach a tab element
    let onTab = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      onTab = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('role') === 'tab' || el?.className?.toString().includes('tab');
      });
      if (onTab) break;
    }
    const before = await getActiveEl(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const after = await getActiveEl(page);
    writeResult('Content Detail Page', 'Arrow keys', before !== after ? 'Implemented' : 'Missing',
      before !== after ? 'Arrow keys navigate between episode/season tabs' : 'Arrow keys did not navigate between tabs on detail page');
  });

  test('Spacebar — toggle Watchlist button', async ({ page }) => {
    // Tab to the Watchlist/Add button and press Space
    let reachedWatchlist = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reachedWatchlist = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        const text = el?.textContent?.toLowerCase().trim() ?? '';
        // Must be a content button — not search icon or login button
        return el?.tagName === 'BUTTON' &&
          !cls.includes('search-icon') && !cls.includes('login-button') &&
          (cls.includes('wall-content-icon') || text.includes('watchlist') ||
           text.includes('add') || text.includes('save') || text.includes('my list'));
      });
      if (reachedWatchlist) break;
    }
    if (!reachedWatchlist) {
      writeResult('Content Detail Page', 'Spacebar', 'To Be Audited', 'Could not reach a Watchlist/Add button via Tab — button may not be in keyboard tab order');
      return;
    }
    const before = await page.content();
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);
    const after = await page.content();
    writeResult('Content Detail Page', 'Spacebar', before !== after ? 'Implemented' : 'Missing',
      before !== after ? 'Spacebar toggled the Watchlist button' : 'Spacebar had no effect on the Watchlist button');
  });

  test('Esc — dismiss overlay opened via "More" button', async ({ page }) => {
    // Tab to the "More" button (confirmed reachable via keyboard on this page)
    let reachedMoreBtn = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reachedMoreBtn = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        const text = el?.textContent?.trim() ?? '';
        return el?.tagName === 'BUTTON' && !cls.includes('search-icon') && !cls.includes('login') &&
          text === 'More';
      });
      if (reachedMoreBtn) break;
    }
    if (!reachedMoreBtn) {
      writeResult('Content Detail Page', 'Esc (Escape)', 'To Be Audited', 'Could not reach the "More" button via Tab');
      return;
    }

    // Press Enter — check if it activates the button (opens overlay)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    // The "More" popup uses class "popUpContainer"
    const overlayOpen = await page.evaluate(() => {
      const el = document.querySelector('.popUpContainer');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 100 && r.height > 100;
    });

    if (!overlayOpen) {
      // Enter didn't activate the button — this is a WCAG SC 2.1.1 violation
      writeResult('Content Detail Page', 'Esc (Escape)', 'Missing',
        'WCAG SC 2.1.1 VIOLATION: The "More" button is keyboard-focusable (Tab reaches it) but Enter key does NOT activate it — only mouse click works. The popup opened by "More" can be closed with Esc when opened via mouse, but keyboard users cannot open it at all.');
      return;
    }

    // Overlay opened — try Esc
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    const overlayClosed = await page.evaluate(() => {
      const el = document.querySelector('.popUpContainer');
      if (!el) return true;
      const r = el.getBoundingClientRect();
      return r.width === 0 || r.height === 0;
    });

    writeResult('Content Detail Page', 'Esc (Escape)',
      overlayClosed ? 'Implemented' : 'Missing',
      overlayClosed
        ? 'Esc successfully dismissed the "More" info popup'
        : 'Esc did NOT dismiss the "More" popup — keyboard users are trapped inside (must use mouse to close)');
  });

  test('Focus on page load — meaningful focus target', async ({ page }) => {
    const focusedEl = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName, cls: el?.className?.toString().slice(0, 50) };
    });
    const meaningful = focusedEl.tag !== 'BODY' && focusedEl.tag !== 'HTML';
    writeResult('Content Detail Page', 'Focus on page load', meaningful ? 'Implemented' : 'Missing',
      meaningful ? `Page load focuses: ${focusedEl.tag}.${focusedEl.cls}` : 'Focus lands on BODY on page load — screen reader users get no context about the page content');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. MEDIA PLAYER — single session (one stream, all shortcuts tested together)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Media Player', () => {
  test.describe.configure({ mode: 'serial' });

  let playerPage: Page;
  let playerReady = false;

  test.beforeAll(async () => {
    // Connect to the real Chrome (launched via open-login.mjs with --remote-debugging-port=9222)
    // so we get full Widevine DRM support for streaming. Playwright's bundled Chromium lacks CDM.
    const { chromium } = await import('@playwright/test');
    let cdpBrowser;
    try {
      cdpBrowser = await chromium.connectOverCDP('http://localhost:9222');
    } catch {
      console.warn('CDP connection failed — is open-login.mjs running with --remote-debugging-port=9222?');
    }
    if (cdpBrowser) {
      const contexts = cdpBrowser.contexts();
      const ctx = contexts[0] ?? await cdpBrowser.newContext();
      playerPage = await ctx.newPage();
    } else {
      // Fallback: headless context (DRM won't work but UI-only tests still run)
      const { chromium } = await import('@playwright/test');
      const fallbackBrowser = await chromium.launch({ headless: true });
      const ctx = await fallbackBrowser.newContext({ storageState: 'scripts/auth/auth-state.json' });
      playerPage = await ctx.newPage();
    }
    playerReady = await waitForPlayer(playerPage);
    if (!playerReady) console.warn('Player not ready — all player tests will show To Be Audited');
  });

  // Helper: skip test with "To Be Audited" when video isn't confirmed playing
  function requirePlayer(feature: string): boolean {
    if (!playerReady) {
      writeResult('Media Player', feature, 'To Be Audited', 'Video not playing — auth may have expired or concurrent stream limit reached');
      return false;
    }
    return true;
  }

  test.afterAll(async () => {
    // Navigate away to properly close the stream session server-side
    await playerPage.goto('about:blank').catch(() => {});
    await playerPage.close().catch(() => {});
  });

  // Helper to reveal player controls and ensure focus is on the video (not a button)
  async function revealControls() {
    // Click the video element directly — avoids accidentally focusing a control button
    const videoClicked = await playerPage.evaluate(() => {
      const video = document.querySelector('video');
      if (video) { video.focus(); return true; }
      return false;
    });
    if (!videoClicked) await playerPage.mouse.click(640, 360);
    await playerPage.waitForTimeout(600);
    // Move mouse to reveal controls without clicking (avoids toggling play/pause)
    await playerPage.mouse.move(640, 500);
    await playerPage.waitForTimeout(400);
  }

  test('Spacebar — play/pause', async () => {
    if (!requirePlayer('Spacebar')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'Spacebar', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('Space');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    if (!after) { writeResult('Media Player', 'Spacebar', 'To Be Audited', 'Player controls disappeared'); return; }
    const toggled = before.playButtonText !== after.playButtonText;
    writeResult('Media Player', 'Spacebar', toggled ? 'Implemented' : 'Missing',
      toggled ? 'Spacebar toggled play/pause' : `Play button text unchanged: "${before.playButtonText}"`);
    // Resume playing for next tests
    if (toggled) await playerPage.keyboard.press('Space');
  });

  test('K — play/pause (YouTube-style)', async () => {
    if (!requirePlayer('K')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'K', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('k');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    const toggled = before.playButtonText !== after?.playButtonText;
    writeResult('Media Player', 'K', toggled ? 'Implemented' : 'Missing',
      toggled ? 'K toggled play/pause' : 'K key did not toggle play/pause');
    if (toggled) await playerPage.keyboard.press('k');
  });

  test('Left/Right Arrow — seek', async () => {
    if (!requirePlayer('Left / Right Arrow')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'Left / Right Arrow', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('ArrowRight');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    const changed = before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'Left / Right Arrow', changed ? 'Implemented' : 'Missing',
      changed ? 'Arrow Right seeked forward' : 'Arrow Right did not seek');
  });

  test('J — rewind 10s', async () => {
    if (!requirePlayer('J')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'J', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('j');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    const changed = before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'J', changed ? 'Implemented' : 'Missing',
      changed ? 'J rewound 10s' : 'J key had no effect');
  });

  test('L — fast-forward 10s', async () => {
    if (!requirePlayer('L')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'L', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('l');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    const changed = before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'L', changed ? 'Implemented' : 'Missing',
      changed ? 'L fast-forwarded 10s' : 'L key had no effect');
  });

  test('Up/Down Arrow — volume', async () => {
    if (!requirePlayer('Up / Down Arrow')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'Up / Down Arrow', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('ArrowUp');
    await playerPage.waitForTimeout(600);
    const after = await getPlayerState(playerPage);
    const changed = before.volButtonClass !== after?.volButtonClass || before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'Up / Down Arrow', changed ? 'Implemented' : 'Missing',
      changed ? 'Arrow Up changed volume' : 'Arrow Up did not change volume');
  });

  test('M — mute/unmute', async () => {
    if (!requirePlayer('M (Mute)')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'M (Mute)', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('m');
    await playerPage.waitForTimeout(600);
    const after = await getPlayerState(playerPage);
    const toggled = before.volButtonClass !== after?.volButtonClass || before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'M (Mute)', toggled ? 'Implemented' : 'Missing',
      toggled ? 'M toggled mute' : 'M key did not change mute state');
    if (toggled) await playerPage.keyboard.press('m');
  });

  test('F — fullscreen', async () => {
    if (!requirePlayer('F (Full Screen)')) return;
    await revealControls();
    await playerPage.keyboard.press('f');
    await playerPage.waitForTimeout(800);
    const isFullscreen = await playerPage.evaluate(() => !!document.fullscreenElement);
    writeResult('Media Player', 'F (Full Screen)', isFullscreen ? 'Implemented' : 'Missing',
      isFullscreen ? 'F entered fullscreen' : 'F key did not enter fullscreen');
    if (isFullscreen) await playerPage.keyboard.press('Escape');
    await playerPage.waitForTimeout(400);
  });

  test('T — theater mode', async () => {
    if (!requirePlayer('T (Theater mode)')) return;
    await revealControls();
    const before = await playerPage.content();
    await playerPage.keyboard.press('t');
    await playerPage.waitForTimeout(600);
    const after = await playerPage.content();
    writeResult('Media Player', 'T (Theater mode)', before !== after ? 'Implemented' : 'Missing',
      before !== after ? 'T changed player layout' : 'T key had no visible effect');
  });

  test('C — captions', async () => {
    if (!requirePlayer('C (Captions)')) return;
    await revealControls();
    const before = await playerPage.content();
    await playerPage.keyboard.press('c');
    await playerPage.waitForTimeout(800);
    const after = await playerPage.content();
    writeResult('Media Player', 'C (Captions)', before !== after ? 'Implemented' : 'Missing',
      before !== after ? 'C toggled captions' : 'C key had no visible effect on captions');
  });

  test('+/- — caption size', async () => {
    if (!requirePlayer('+ / - (Caption size)')) return;
    await revealControls();
    const before = await playerPage.content();
    await playerPage.keyboard.press('+');
    await playerPage.waitForTimeout(500);
    const after = await playerPage.content();
    writeResult('Media Player', '+ / - (Caption size)', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '+ changed caption size' : '+/- had no effect on caption size');
  });

  test('V — described video', async () => {
    if (!requirePlayer('V or D (Described Video)')) return;
    await revealControls();
    const before = await playerPage.content();
    await playerPage.keyboard.press('v');
    await playerPage.waitForTimeout(600);
    const after = await playerPage.content();
    writeResult('Media Player', 'V or D (Described Video)', before !== after ? 'Implemented' : 'Missing',
      before !== after ? 'V toggled described video' : 'V key had no visible effect');
  });

  test('0–9 — jump to position', async () => {
    if (!requirePlayer('0–9 (Number keys)')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', '0–9 (Number keys)', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('5');
    await playerPage.waitForTimeout(800);
    const after = await getPlayerState(playerPage);
    const changed = before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', '0–9 (Number keys)', changed ? 'Implemented' : 'Missing',
      changed ? 'Key 5 jumped to 50% position' : 'Number key 5 had no effect');
  });

  test('Shift+. — playback speed', async () => {
    if (!requirePlayer('Shift+, / Shift+.')) return;
    await revealControls();
    const before = await getPlayerState(playerPage);
    if (!before) { writeResult('Media Player', 'Shift+, / Shift+.', 'To Be Audited', 'Player controls not found'); return; }
    await playerPage.keyboard.press('Shift+Period');
    await playerPage.waitForTimeout(600);
    const after = await getPlayerState(playerPage);
    const changed = before.htmlLength !== after?.htmlLength;
    writeResult('Media Player', 'Shift+, / Shift+.', changed ? 'Implemented' : 'Missing',
      changed ? 'Shift+. changed playback speed' : 'Shift+. had no effect on playback speed');
  });

  test('Shift+N — next video', async () => {
    if (!requirePlayer('Shift+N / Shift+P')) return;
    const urlBefore = playerPage.url();
    await playerPage.keyboard.press('Shift+n');
    await playerPage.waitForTimeout(2000);
    const urlAfter = playerPage.url();
    writeResult('Media Player', 'Shift+N / Shift+P', urlAfter !== urlBefore ? 'Implemented' : 'Missing',
      urlAfter !== urlBefore ? 'Shift+N advanced to next video' : 'Shift+N did not advance to next video');
    // Navigate back to player if we left
    if (urlAfter !== urlBefore) {
      await playerPage.goto(URL.player);
      await waitForPlayer(playerPage);
    }
  });

  test('Esc — exit fullscreen / close overlay', async () => {
    if (!requirePlayer('Esc (Escape)')) return;
    await revealControls();
    await playerPage.keyboard.press('Escape');
    await playerPage.waitForTimeout(600);
    const urlAfter = playerPage.url();
    const noFullscreen = await playerPage.evaluate(() => !document.fullscreenElement);
    writeResult('Media Player', 'Esc (Escape)', noFullscreen ? 'Implemented' : 'Missing',
      noFullscreen ? 'Esc exited fullscreen / closed overlay' : 'Esc had no effect');
  });

  test('Tab — focus player controls', async () => {
    if (!requirePlayer('Tab (player controls)')) return;
    await revealControls();
    const before = await playerPage.evaluate(() => `${document.activeElement?.tagName}#${document.activeElement?.id}.${document.activeElement?.className?.toString().slice(0, 40)}`);
    await playerPage.keyboard.press('Tab');
    await playerPage.waitForTimeout(400);
    const after = await playerPage.evaluate(() => `${document.activeElement?.tagName}#${document.activeElement?.id}.${document.activeElement?.className?.toString().slice(0, 40)}`);
    const moved = after !== before && !after.startsWith('BODY') && !after.startsWith('HTML');
    writeResult('Media Player', 'Tab (player controls)', moved ? 'Implemented' : 'Missing',
      moved ? `Tab moved focus to: ${after}` : 'Tab did not move focus to player controls');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CONTEXTUAL MENU
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Contextual Menu', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    // Use Live TV page which has cards with right-click context menus (Record / Record series / Details)
    await page.goto('https://telustvplus.com/#/PAGE/1765');
    await page.waitForLoadState('domcontentloaded');
    // Wait for channel cards to load
    await page.waitForSelector('div.menu-trigger', { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // Tab to the first interactive element (cards are NOT in Tab order — this is itself a finding)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const focused = await page.evaluate(() => document.activeElement?.tagName ?? '');
      if (focused === 'A' || focused === 'BUTTON') break;
    }
    await page.waitForTimeout(300);
  });

  // Helper: check if contextual menu is open
  // Menu items use class "contextmenu__item"; the container may vary
  async function isContextMenuOpen(page: Page): Promise<boolean> {
    // Check for known menu item texts: Record, Record series, Details
    const hasItems = await page.evaluate(() => {
      const all = [...document.querySelectorAll('*')];
      return all.some(el => {
        const r = el.getBoundingClientRect();
        const text = el.textContent?.trim() ?? '';
        return r.width > 0 && r.height > 0 && (text === 'Record' || text === 'Details' || text === 'Record series');
      });
    });
    if (hasItems) return true;
    return page.locator('div.contextmenu__item').first().isVisible().catch(() => false);
  }

  test('Context Menu key / Shift+F10 — open contextual menu', async ({ page }) => {
    // Try to Tab to a channel card (menu-trigger). Cards are likely NOT in Tab order.
    let reachedCard = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      reachedCard = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return cls.includes('menu-trigger') || cls.includes('item-container');
      });
      if (reachedCard) break;
    }

    // Try Context Menu key on whatever is focused
    await page.keyboard.press('ContextMenu').catch(() => {});
    await page.waitForTimeout(800);
    let menuOpen = await isContextMenuOpen(page);

    if (!menuOpen) {
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(200);
      // Try Shift+F10
      await page.keyboard.press('Shift+F10').catch(() => {});
      await page.waitForTimeout(800);
      menuOpen = await isContextMenuOpen(page);
    }

    const note = menuOpen
      ? 'Context Menu key / Shift+F10 opened the contextual menu'
      : reachedCard
        ? 'Card was focused via Tab but Context Menu key and Shift+F10 did not open the menu'
        : 'Cards (div.menu-trigger) are not in the Tab order — keyboard focus cannot reach them. Context Menu key and Shift+F10 also had no effect.';

    writeResult('Contextual Menu', 'Context Menu key or Shift+F10',
      menuOpen ? 'Implemented' : 'Missing', note);
    if (menuOpen) await page.keyboard.press('Escape').catch(() => {});
  });

  // Helper: tab to a card and open context menu via keyboard
  async function openContextMenu(page: Page): Promise<boolean> {
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    await page.keyboard.press('ContextMenu').catch(() => {});
    await page.waitForTimeout(800);
    return isContextMenuOpen(page);
  }

  test('Up/Down Arrow — navigate menu items', async ({ page }) => {
    test.setTimeout(60000);
    const menuOpen = await openContextMenu(page);
    if (!menuOpen) { writeResult('Contextual Menu', 'Up / Down Arrow', 'To Be Audited', 'Contextual menu could not be opened via keyboard'); return; }
    const before = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    const moved = before !== after;
    writeResult('Contextual Menu', 'Up / Down Arrow', moved ? 'Implemented' : 'Missing',
      moved ? `Arrow Down moved focus from "${before}" to "${after}"` : 'Arrow Down did not move focus between menu items');
    await page.keyboard.press('Escape').catch(() => {});
  });

  test('Enter/Return — activate menu item', async ({ page }) => {
    test.setTimeout(60000);
    const menuOpen = await openContextMenu(page);
    if (!menuOpen) { writeResult('Contextual Menu', 'Enter / Return', 'To Be Audited', 'Contextual menu could not be opened via keyboard'); return; }
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    const urlAfter = page.url();
    const menuGone = !(await isContextMenuOpen(page));
    writeResult('Contextual Menu', 'Enter / Return',
      menuGone || urlAfter !== urlBefore ? 'Implemented' : 'Missing',
      menuGone || urlAfter !== urlBefore ? 'Enter activated the focused menu item' : 'Enter did not activate the menu item or close the menu');
  });

  test('Esc — close contextual menu', async ({ page }) => {
    test.setTimeout(60000);
    const menuOpen = await openContextMenu(page);
    if (!menuOpen) { writeResult('Contextual Menu', 'Esc (Escape)', 'To Be Audited', 'Contextual menu could not be opened via keyboard'); return; }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const menuGone = !(await isContextMenuOpen(page));
    writeResult('Contextual Menu', 'Esc (Escape)', menuGone ? 'Implemented' : 'Missing',
      menuGone ? 'Esc successfully closed the contextual menu' : 'Esc did not close the contextual menu');
  });

  test('Tab inside menu — should close menu (not move between items)', async ({ page }) => {
    test.setTimeout(60000);
    const menuOpen = await openContextMenu(page);
    if (!menuOpen) { writeResult('Contextual Menu', 'Tab (inside menu)', 'To Be Audited', 'Contextual menu could not be opened via keyboard'); return; }
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const menuStillOpen = await isContextMenuOpen(page);
    writeResult('Contextual Menu', 'Tab (inside menu)', !menuStillOpen ? 'Implemented' : 'Missing',
      !menuStillOpen ? 'Tab closed the menu (correct ARIA pattern)' : 'Tab kept focus inside the menu instead of closing it');
    if (menuStillOpen) await page.keyboard.press('Escape').catch(() => {});
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8b. CONTEXTUAL MENU — EPG / GUIDE
// ═══════════════════════════════════════════════════════════════════════════
// ── Contextual Menu (Guide) ──────────────────────────────────────────────────
// The Guide page explicitly states "Right click on programs for actions" —
// the contextual menu is mouse-only by design. All keyboard shortcuts are Missing.
test.describe('Contextual Menu (Guide)', () => {
  const NOTE = 'Guide contextual menu is mouse-only (right-click). Keyboard ContextMenu key not supported.';

  test('Context Menu key / Shift+F10 — open contextual menu', async () => {
    writeResult('Contextual Menu (Guide)', 'Context Menu key or Shift+F10', 'Missing', NOTE);
  });

  test('Up/Down Arrow — navigate menu items', async () => {
    writeResult('Contextual Menu (Guide)', 'Up / Down Arrow', 'Missing', NOTE);
  });

  test('Enter/Return — activate menu item', async () => {
    writeResult('Contextual Menu (Guide)', 'Enter / Return', 'Missing', NOTE);
  });

  test('Esc — close contextual menu', async () => {
    writeResult('Contextual Menu (Guide)', 'Esc (Escape)', 'Missing', NOTE);
  });

  test('Tab inside menu — should close menu (not move between items)', async () => {
    writeResult('Contextual Menu (Guide)', 'Tab (inside menu)', 'Missing', NOTE);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. MODALS & OVERLAYS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Modals & Overlays', () => {
  // Tab to the watchlist (+) button and open the modal via Enter — keyboard only
  async function openModalViaKeyboard(page: Page): Promise<boolean> {
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const isWatchlistBtn = await page.evaluate(() => {
        const el = document.activeElement;
        const cls = el?.className?.toString() ?? '';
        return el?.tagName === 'BUTTON' && (cls.includes('imageButton') || cls.includes('wall-content-icon'));
      });
      if (isWatchlistBtn) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(600);
        return page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false);
      }
    }
    return false;
  }

  test('Esc — close modal and return focus to trigger', async ({ page }) => {
    await page.goto(URL.detail);
    await page.waitForTimeout(3000);
    const modalOpen = await openModalViaKeyboard(page);
    if (modalOpen) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const modalClosed = !(await page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false));
      writeResult('Modals & Overlays', 'Esc (Escape)', modalClosed ? 'Implemented' : 'Missing');
    } else {
      writeResult('Modals & Overlays', 'Esc (Escape)', 'To Be Audited', 'Could not open a modal via keyboard to test Esc — manual verification needed');
    }
  });

  test('Tab/Shift+Tab — focus trap inside modal', async ({ page }) => {
    await page.goto(URL.detail);
    await page.waitForTimeout(3000);
    const modalOpen = await openModalViaKeyboard(page);
    if (modalOpen) {
      // Tab multiple times and check focus stays inside modal
      const focusPositions: string[] = [];
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        focusPositions.push(await getActiveEl(page));
      }
      const focusEscaped = focusPositions.some(f => f.startsWith('BODY') || f.startsWith('HTML'));
      writeResult('Modals & Overlays', 'Tab / Shift+Tab (focus trap)',
        !focusEscaped ? 'Implemented' : 'Missing',
        !focusEscaped ? '' : 'Focus escaped the modal while it was open');
      await page.keyboard.press('Escape');
    } else {
      writeResult('Modals & Overlays', 'Tab / Shift+Tab (focus trap)', 'To Be Audited', 'Could not open a modal via keyboard to test focus trap');
    }
  });

  test('Enter/Return — activate modal button', async ({ page }) => {
    await page.goto(URL.detail);
    await page.waitForTimeout(3000);
    const modalOpen = await openModalViaKeyboard(page);
    if (modalOpen) {
      await page.keyboard.press('Tab');
      const contentBefore = await page.content();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
      const contentAfter = await page.content();
      writeResult('Modals & Overlays', 'Enter / Return', contentBefore !== contentAfter ? 'Implemented' : 'Missing');
    } else {
      writeResult('Modals & Overlays', 'Enter / Return', 'To Be Audited', 'Could not open a modal via keyboard to test Enter');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. ACCOUNT & SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Account & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL.settings);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('Tab/Shift+Tab — navigate settings controls', async ({ page }) => {
    await page.keyboard.press('Tab');
    const moved = await focusMoved(page, 'Tab');
    writeResult('Account & Settings', 'Tab / Shift+Tab', moved ? 'Implemented' : 'Missing');
  });

  test('Enter/Return — activate settings buttons', async ({ page }) => {
    // Tab to the Parental PIN or similar link
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    const before = await page.content();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    const after = await page.content();
    writeResult('Account & Settings', 'Enter / Return', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '' : 'Enter did not activate focused settings control');
  });

  test('Arrow keys — navigate radio buttons (Language)', async ({ page }) => {
    // Tab through settings to find a radio button or role="radio" element — keyboard only
    let reachedRadio = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const isRadio = await page.evaluate(() => {
        const el = document.activeElement;
        return (el?.tagName === 'INPUT' && (el as HTMLInputElement).type === 'radio') ||
               el?.getAttribute('role') === 'radio';
      });
      if (isRadio) { reachedRadio = true; break; }
    }
    if (!reachedRadio) {
      writeResult('Account & Settings', 'Arrow keys', 'Missing',
        'Could not reach any radio button via Tab — radio inputs not in keyboard tab order (likely visually hidden via Styled Components)');
      return;
    }
    const before = await page.evaluate(() => {
      const radios = [...document.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
      return radios.find(r => r.checked)?.value ?? '';
    });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const radios = [...document.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
      return radios.find(r => r.checked)?.value ?? '';
    });
    writeResult('Account & Settings', 'Arrow keys', before !== after ? 'Implemented' : 'Missing',
      before !== after ? '' : 'Arrow keys did not change selected radio button');
  });

  test('Spacebar — toggle checkboxes (CC, Described Video)', async ({ page }) => {
    // Tab through settings to find a checkbox or role="checkbox" element — keyboard only
    let reachedCheckbox = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const isCheckbox = await page.evaluate(() => {
        const el = document.activeElement;
        return (el?.tagName === 'INPUT' && (el as HTMLInputElement).type === 'checkbox') ||
               el?.getAttribute('role') === 'checkbox';
      });
      if (isCheckbox) { reachedCheckbox = true; break; }
    }
    if (!reachedCheckbox) {
      writeResult('Account & Settings', 'Spacebar', 'Missing',
        'Could not reach any checkbox via Tab — checkbox inputs not in keyboard tab order (likely visually hidden via Styled Components)');
      return;
    }
    const before = await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement;
      return el?.getAttribute('aria-checked') ?? String(el?.checked ?? false);
    });
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement;
      return el?.getAttribute('aria-checked') ?? String(el?.checked ?? false);
    });
    const toggled = before !== after;
    writeResult('Account & Settings', 'Spacebar', toggled ? 'Implemented' : 'Missing',
      toggled ? '' : 'Spacebar did not toggle the checkbox');
    // Restore original state if changed
    if (toggled) await page.keyboard.press('Space');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. TOOLTIP / TUTORIAL OVERLAY
// Tests whether tutorial overlays (e.g. Guide onboarding) can be fully
// dismissed and navigated using the keyboard alone.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Tooltip / Tutorial Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL.guide);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
  });

  test('Esc — dismiss tooltip/overlay', async ({ page }) => {
    const tooltipVisible = await page.locator('button:has-text("Next"), button:has-text("Done"), button:has-text("Got it")').first().isVisible().catch(() => false);
    if (!tooltipVisible) {
      writeResult('Tooltip / Tutorial Overlay', 'Esc (Escape)', 'To Be Audited', 'No tooltip visible on Guide — may have been already dismissed in this session');
      return;
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const stillVisible = await page.locator('button:has-text("Next"), button:has-text("Done"), button:has-text("Got it")').first().isVisible().catch(() => false);
    writeResult('Tooltip / Tutorial Overlay', 'Esc (Escape)',
      !stillVisible ? 'Implemented' : 'Missing',
      !stillVisible ? '' : 'Esc did not dismiss the tooltip — keyboard users cannot close it this way');
  });

  test('Tab — reach tooltip buttons (Next / Done)', async ({ page }) => {
    const tooltipVisible = await page.locator('button:has-text("Next"), button:has-text("Done"), button:has-text("Got it")').first().isVisible().catch(() => false);
    if (!tooltipVisible) {
      writeResult('Tooltip / Tutorial Overlay', 'Tab (reach buttons)', 'To Be Audited', 'No tooltip visible on Guide — may have been already dismissed in this session');
      return;
    }
    // Tab up to 20 times and check if a tooltip button receives focus
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim().toLowerCase() ?? '');
      if (focused.includes('next') || focused.includes('done') || focused.includes('back') || focused.includes('got it')) {
        reached = true;
        break;
      }
    }
    writeResult('Tooltip / Tutorial Overlay', 'Tab (reach buttons)',
      reached ? 'Implemented' : 'Missing',
      reached ? '' : 'Tab could not reach Next/Done buttons inside the tooltip — keyboard users cannot proceed through the tutorial');
  });

  test('Enter — activate Next/Done button in tooltip', async ({ page }) => {
    const tooltipVisible = await page.locator('button:has-text("Next"), button:has-text("Done"), button:has-text("Got it")').first().isVisible().catch(() => false);
    if (!tooltipVisible) {
      writeResult('Tooltip / Tutorial Overlay', 'Enter (activate button)', 'To Be Audited', 'No tooltip visible on Guide — may have been already dismissed in this session');
      return;
    }
    // Tab to find the Next/Done button then activate with Enter
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim().toLowerCase() ?? '');
      if (focused.includes('next') || focused.includes('done') || focused.includes('got it')) {
        const htmlBefore = await page.evaluate(() => document.body.innerHTML.length);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        const htmlAfter = await page.evaluate(() => document.body.innerHTML.length);
        const activated = htmlBefore !== htmlAfter;
        writeResult('Tooltip / Tutorial Overlay', 'Enter (activate button)',
          activated ? 'Implemented' : 'Missing',
          activated ? '' : 'Enter on focused tooltip button had no effect');
        return;
      }
    }
    writeResult('Tooltip / Tutorial Overlay', 'Enter (activate button)', 'Missing',
      'Could not Tab to any tooltip button — Enter cannot be tested');
  });
});
