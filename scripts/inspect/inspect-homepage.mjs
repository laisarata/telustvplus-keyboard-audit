import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

const browser = await chromium.launch({ headless: false, slowMo: 500 });
const page = await browser.newPage();

await page.goto('https://www.telustvplus.com');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(3000);

// Print all links and buttons on the page
const links = await page.getByRole('link').allTextContents();
const buttons = await page.getByRole('button').allTextContents();

console.log('Links found:', links);
console.log('Buttons found:', buttons);

execSync(`osascript -e 'tell application "Google Chrome for Testing" to activate'`);
await new Promise(() => {});
