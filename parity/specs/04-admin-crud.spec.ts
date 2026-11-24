import { test, expect, Page } from '@playwright/test';
import { signIn, shot, stamp, adminPage } from './helpers';

async function search(page: Page, label: string, term: string) {
  await page.getByLabel(label).fill(term);
  await page.waitForTimeout(800);
}

test.describe('admin create/edit/delete', () => {
  test.beforeEach(async ({ page }, info) => signIn(page, info));

  test('users: validate, create, search, delete', async ({ page }, info) => {
    const name = `parity_user_${stamp()}`;
    const pw = `Pw!${stamp()}${stamp()}Aa1`;
    await adminPage(page, 'users', 'Users');
    await page.getByRole('button', { name: /New User/ }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg.getByText('Create New User')).toBeVisible();
    await dlg.getByLabel('Username').click();
    await dlg.getByLabel('Display Name').click();
    await dlg.getByLabel('Email').click();
    await expect(dlg.getByText('Username is required')).toBeVisible();
    await expect(dlg.getByText('Display name is required')).toBeVisible();
    await shot(page, info, '30-user-create-validation');
    await dlg.getByLabel('Username').fill(name);
    await dlg.getByLabel('Display Name').fill(`Parity ${name}`);
    await dlg.getByLabel('Email').fill(`${name}@example.com`);
    await dlg.getByLabel('Password', { exact: true }).fill(pw);
    await dlg.getByLabel('Confirm Password').fill(pw);
    await dlg.getByLabel('Role').click();
    await page.getByRole('option').first().click();
    await dlg.getByRole('button', { name: /Create|Save/ }).last().click();
    await expect(dlg).toBeHidden();
    await adminPage(page, 'users', 'Users');
    await search(page, 'Search users', name);
    await expect(page.getByText(name).first()).toBeVisible();
    await page.getByText(name).first().click();
    await expect(page.getByText(`Parity ${name}`).first()).toBeVisible();
    await page.getByRole('button', { name: /Delete/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: /Delete/ }).last().click();
    await adminPage(page, 'users', 'Users');
    await search(page, 'Search users', name);
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test('teams: validate, create, edit, delete', async ({ page }, info) => {
    const name = `Parity Team ${stamp()}`;
    await adminPage(page, 'teams', 'Teams');
    await page.getByRole('button', { name: /New Team/ }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg.getByText('Create New Team')).toBeVisible();
    await dlg.getByLabel('Team Name').click();
    await dlg.getByLabel('Description').click();
    await expect(dlg.getByText('Team name is required')).toBeVisible();
    await dlg.getByLabel('Team Name').fill(name);
    await dlg.getByLabel('Description').fill('created by parity suite');
    await dlg.getByRole('button', { name: /Create|Save/ }).last().click();
    await expect(dlg).toBeHidden();
    await expect(page.getByText(name).first()).toBeVisible();
    await shot(page, info, '31-team-details');
    await adminPage(page, 'teams', 'Teams');
    await search(page, 'Search teams', name);
    await expect(page.getByText(name).first()).toBeVisible();
    await page.getByText(name).first().click();
    await page.getByRole('button', { name: /Delete/ }).first().click();
    await expect(page.getByRole('dialog').getByText(`Delete "${name}"?`)).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: /Delete/ }).last().click();
    await adminPage(page, 'teams', 'Teams');
    await search(page, 'Search teams', name);
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test('events: validate, create, filter, delete', async ({ page }, info) => {
    const name = `Parity Event ${stamp()}`;
    await adminPage(page, 'events', 'Events');
    await page.getByRole('button', { name: /New Event/ }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg.getByText('Create a New Event')).toBeVisible();
    await dlg.getByLabel('Event Name').click();
    await dlg.getByLabel('Description').click();
    await expect(dlg.getByText('Name is required')).toBeVisible();
    await dlg.getByLabel('Event Name').fill(name);
    await dlg.getByLabel('Description').fill('created by parity suite');
    await dlg.getByRole('button', { name: /Create|Save/ }).last().click();
    await expect(dlg).toBeHidden();
    await expect(page.getByText(name).first()).toBeVisible();
    await shot(page, info, '32-event-details');
    await adminPage(page, 'events', 'Events');
    await search(page, 'Search events', name);
    await expect(page.getByText(name).first()).toBeVisible();
    await page.getByText('Complete', { exact: true }).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText(name)).toHaveCount(0);
    await page.getByText('All', { exact: true }).first().click();
    await page.waitForTimeout(800);
    await page.getByText(name).first().click();
    await page.getByRole('button', { name: /Delete/ }).first().click();
    const del = page.getByRole('dialog');
    await expect(del.getByRole('button', { name: /Delete Event/ })).toBeDisabled();
    await del.getByLabel(`Type "${name}" to confirm`).fill(name);
    await del.getByRole('button', { name: /Delete Event/ }).click();
    await adminPage(page, 'events', 'Events');
    await search(page, 'Search events', name);
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
