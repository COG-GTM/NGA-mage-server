import { test, expect } from '@playwright/test';
import { signIn, shot, adminPage } from './helpers';

const pages: [string, string, RegExp][] = [
  ['users', 'Users', /New User/],
  ['teams', 'Teams', /New Team/],
  ['devices', 'Devices', /New Device/],
  ['events', 'Events', /New Event/],
  ['layers', 'Layers', /Open Street Map/],
  ['feeds', 'Feeds', /New Feed/],
  ['security', 'Authentication', /Username\/Password/],
  ['banner', 'Banner', /Show Header/],
];

test.describe('admin', () => {
  test.beforeEach(async ({ page }, info) => signIn(page, info));

  test('dashboard and navigation', async ({ page }, info) => {
    await page.goto('/#/admin');
    await expect(page).toHaveURL(/#\/admin\/dashboard/);
    for (const label of ['Inactive Users', 'Unregistered Devices', 'Logins', 'SFTP', 'ArcGIS']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await shot(page, info, '20-admin-dashboard');
  });

  for (const [route, heading, marker] of pages) {
    test(`admin ${route} page`, async ({ page }, info) => {
      await adminPage(page, route, heading);
      await expect(page.getByText(marker).first()).toBeVisible();
      await shot(page, info, `21-admin-${route}`);
    });
  }

  test('plugin pages (SFTP, ArcGIS) load from the plugin bundles', async ({ page }, info) => {
    await page.goto('/#/admin/dashboard');
    const marker: Record<string, string> = { SFTP: 'SFTP Plugin Configuration', ArcGIS: 'Push observations from Mage' };
    for (const plugin of ['SFTP', 'ArcGIS']) {
      await page.getByText(plugin, { exact: true }).first().click();
      await expect(page).toHaveURL(/#\/admin\/plugins/);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(marker[plugin]).first()).toBeVisible();
      const text = await page.locator('body').innerText();
      expect(text.length).toBeGreaterThan(200);
      await shot(page, info, `22-plugin-${plugin.toLowerCase()}`);
    }
  });
});
