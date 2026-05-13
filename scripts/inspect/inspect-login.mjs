import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

const LOGIN_URL = 'https://www.telus.com/ttv-login-v2/login?service_type=opus_tv_telus_html&acr=ci-loa3&goto=https%3A%2F%2Fauth-gateway.telus.com%2Fas%2Fauthorization.oauth2%3Fresponse_type%3Dcode%26scope%3Dprofile%2520openid%26client_id%3Da90fd945-358e-42a7-98b1-1e6b09a9669d%26state%3D341a571a-35c4-46db-a64c-34442e2d3193%26redirect_uri%3Dhttps%253A%252F%252Ftelustvplus.com%26service_type%3Dopus_tv_telus_html%26env%3Dit02%26lng%3Den-CA%26switch_login%3Dtrue%26from%3Dlogin';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const page = await browser.newPage();
await page.goto(LOGIN_URL);
await page.waitForLoadState('domcontentloaded');

execSync(`osascript -e 'tell application "Google Chrome" to activate'`);
console.log('Please complete Cloudflare verification, then wait...');

// Wait for any visible input to appear after navigation settles
console.log('Please complete Cloudflare verification, then wait...');
await page.waitForSelector('input:not([type="hidden"])', { timeout: 60000 });
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(1000);

const inputs = await page.evaluate(() =>
  [...document.querySelectorAll('input:not([type="hidden"])')].map(el => ({
    id: el.id,
    name: el.name,
    type: el.type,
    placeholder: el.placeholder,
    ariaLabel: el.getAttribute('aria-label'),
    autocomplete: el.autocomplete,
  }))
);
console.log('Visible inputs found:', JSON.stringify(inputs, null, 2));

await new Promise(() => {});
