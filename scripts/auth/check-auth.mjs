import { chromium } from '../../node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ storageState: 'scripts/auth/auth-state.json' });
const page = await ctx.newPage();
await page.goto('https://telustvplus.com/#/detail/series/PAGE/DETAILS/TVSHOW/e35a0ca8-180f-49a6-88c4-dc2ccb52ed65');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

const status = await page.evaluate(() => ({
  loggedIn: localStorage.getItem('userLoggedIn'),
  loginBtnVisible: !!document.querySelector('button.login-button'),
  loginBtnText: document.querySelector('button.login-button')?.textContent?.trim(),
  buttons: [...document.querySelectorAll('button')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map(el => el.textContent?.trim().slice(0, 30)),
}));

console.log('Logged in (localStorage):', status.loggedIn);
console.log('Login button text:', status.loginBtnText);
console.log('All visible buttons:', status.buttons);

await browser.close();
