import { test, expect } from '@playwright/test';

const EMAIL = process.env.TELUS_EMAIL ?? '';
const PASSWORD = process.env.TELUS_PASSWORD ?? '';

test('login to TELUS TV+', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Take a screenshot to see the initial state
  await page.screenshot({ path: 'screenshots/home.png', fullPage: true });

  // Look for a sign-in / login button and click it
  const signInButton = page.getByRole('link', { name: /sign in|log in|login/i })
    .or(page.getByRole('button', { name: /sign in|log in|login/i }))
    .first();

  await signInButton.click();
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });

  // Fill in credentials from environment variables
  await page.getByLabel(/email|username/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);

  await page.screenshot({ path: 'screenshots/credentials-filled.png', fullPage: true });

  await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'screenshots/after-login.png', fullPage: true });

  // Verify we're logged in (URL or element change)
  console.log('Current URL after login:', page.url());
});
