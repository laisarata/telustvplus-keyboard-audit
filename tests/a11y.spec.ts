import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const EMAIL = process.env.TELUS_EMAIL ?? '';
const PASSWORD = process.env.TELUS_PASSWORD ?? '';

// Pages to audit after login
const PAGES_TO_AUDIT = [
  { name: 'Home', path: '/' },
  { name: 'Browse', path: '/browse' },
];

test.describe('TELUS TV+ Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.getByRole('link', { name: /sign in|log in|login/i })
      .or(page.getByRole('button', { name: /sign in|log in|login/i }))
      .first();

    await signInButton.click();
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email|username/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForLoadState('networkidle');
  });

  for (const { name, path } of PAGES_TO_AUDIT) {
    test(`${name} page has no critical a11y violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log a summary to the console
      if (results.violations.length > 0) {
        console.log(`\n=== ${name} — ${results.violations.length} violation(s) ===`);
        for (const v of results.violations) {
          console.log(`[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
          console.log(`  Help: ${v.helpUrl}`);
          console.log(`  Nodes affected: ${v.nodes.length}`);
          for (const node of v.nodes) {
            console.log(`    - ${node.target}`);
          }
        }
      }

      // Fail only on critical and serious violations
      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(blocking, `Critical/serious a11y violations on ${name}`).toEqual([]);
    });
  }
});
