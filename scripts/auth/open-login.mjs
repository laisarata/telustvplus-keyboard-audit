import { chromium } from '@playwright/test';
import { readFileSync, existsSync, writeFileSync } from 'fs';

// Load .env if present
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

const EMAIL = process.env.TELUS_EMAIL ?? '';
const PASSWORD = process.env.TELUS_PASSWORD ?? '';

import { execSync } from 'child_process';

const browser = await chromium.launch({
  headless: false,
  slowMo: 500,
  channel: 'chrome',
  args: ['--remote-debugging-port=9222'],
});
const page = await browser.newPage();

const LOGIN_URL = 'https://www.telus.com/ttv-login-v2/login?service_type=opus_tv_telus_html&acr=ci-loa3&goto=https%3A%2F%2Fauth-gateway.telus.com%2Fas%2Fauthorization.oauth2%3Fresponse_type%3Dcode%26scope%3Dprofile%2520openid%26client_id%3Da90fd945-358e-42a7-98b1-1e6b09a9669d%26state%3D341a571a-35c4-46db-a64c-34442e2d3193%26redirect_uri%3Dhttps%253A%252F%252Ftelustvplus.com%26service_type%3Dopus_tv_telus_html%26env%3Dit02%26lng%3Den-CA%26switch_login%3Dtrue%26from%3Dlogin';

await page.goto(LOGIN_URL);

console.log('Please complete the Cloudflare verification in the browser...');
try {
  await page.waitForSelector('#IDToken1', { timeout: 60000 });

  if (EMAIL) {
    await page.locator('#IDToken1').click();
    await page.locator('#IDToken1').type(EMAIL, { delay: 50 });
  }
  if (PASSWORD) {
    await page.locator('#IDToken2').click();
    await page.locator('#IDToken2').type(PASSWORD, { delay: 50 });
  }

  if (EMAIL && PASSWORD) {
    console.log('Credentials typed. Pressing Enter to sign in...');
    await page.locator('#IDToken2').press('Enter');
  } else {
    console.log('Please enter your credentials manually and sign in.');
  }

  // Wait for profile selection page and click Test
  console.log('Waiting for profile selection...');
  try {
    await page.waitForFunction(() => document.body && document.body.innerText.toLowerCase().includes('watching'), { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log('Profile page reached.');
    await page.getByText('Test', { exact: true }).first().click();
    console.log('Selected Test profile.');
  } catch {
    console.log('Profile page not detected — may have been skipped or auto-selected.');
  }

  // Wait for home page to load, then save session
  await page.waitForURL('**/telustvplus.com/**', { timeout: 30000 });
  await page.waitForTimeout(3000);
  const state = await page.context().storageState();
  writeFileSync('scripts/auth/auth-state.json', JSON.stringify(state, null, 2));
  console.log('✅ Session saved to scripts/auth/auth-state.json');
} catch (e) {
  console.log('Error during login flow:', e.message);
  console.log('Current URL:', page.url());
}

execSync(`osascript -e 'tell application "Google Chrome for Testing" to activate'`);

console.log('Browser is open. Interact freely. Press Ctrl+C here when done.');
await new Promise(() => {});
