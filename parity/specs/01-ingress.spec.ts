import { test, expect } from '@playwright/test';
import { ensureAdmin, shot, ACCESS_CODE } from './helpers';

test.describe('ingress', () => {
  test('sign-in page renders and rejects a bad password', async ({ page }, info) => {
    await ensureAdmin(page, info);
    await page.context().clearCookies();
    await page.goto('/#/landing');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText('Sign Up Now')).toBeVisible();
    await shot(page, info, '01-sign-in');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password', { exact: true }).fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-form__error-message')).toBeVisible();
    await expect(page).toHaveURL(/#\/landing/);
  });

  test('sign-up form validates required fields', async ({ page }, info) => {
    await ensureAdmin(page, info);
    await page.goto('/#/landing');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('Sign Up Now').click();
    await expect(page.getByLabel('Display Name')).toBeVisible();
    await shot(page, info, '02-sign-up');
    await page.getByLabel('Username').fill('x');
    await page.getByLabel('Username').fill('');
    await page.getByLabel('Display Name').click();
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByLabel('Display Name').click();
    await expect(page.locator('mat-error').first()).toBeVisible();
  });

  test('sign-in + access code lands on home, sign-out returns to landing', async ({ page }, info) => {
    const creds = await ensureAdmin(page, info);
    await page.goto('/#/landing');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Username').fill(creds.username);
    await page.getByLabel('Password', { exact: true }).fill(creds.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: 'Continue to Mage' })).toBeVisible();
    await shot(page, info, '03-access-code');
    await page.getByLabel('Access Code').fill(ACCESS_CODE);
    await page.getByRole('button', { name: 'Continue to Mage' }).click();
    await expect(page).toHaveURL(/#\/home/);
    await expect(page.getByText('Observations').first()).toBeVisible();
    await page.getByText('logout').first().click();
    await expect(page).toHaveURL(/#\/landing/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
