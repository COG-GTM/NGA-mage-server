import { test, expect } from '@playwright/test';
import { signIn, shot } from './helpers';

test.describe('home, profile, about', () => {
  test.beforeEach(async ({ page }, info) => signIn(page, info));

  test('home shows map and observation feed', async ({ page }, info) => {
    await expect(page.getByText('arrow_drop_down').first()).toBeVisible();
    await expect(page.getByText('Observations').first()).toBeVisible();
    await expect(page.getByText('Leaflet')).toBeVisible();
    await shot(page, info, '10-home');
  });

  test('profile shows account info and password form', async ({ page }, info) => {
    await page.goto('/#/profile');
    await expect(page.getByText('General Information')).toBeVisible();
    await expect(page.getByText('Reset Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await shot(page, info, '11-profile');
  });

  test('about page', async ({ page }, info) => {
    await page.goto('/#/about');
    await expect(page.getByText('About Mage')).toBeVisible();
    await expect(page.getByText('What is Mage?')).toBeVisible();
    await shot(page, info, '12-about');
  });
});
