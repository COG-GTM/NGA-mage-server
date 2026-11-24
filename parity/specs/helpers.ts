import { expect, Page, TestInfo } from '@playwright/test';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Per-project admin credentials, generated on first run of a fresh server and kept out of git.
const authDir = path.join(__dirname, '..', '.auth');
export const ACCESS_CODE = process.env.PARITY_ACCESS_CODE || 'parity-web';

export interface Creds { username: string; password: string }

export function credsFor(info: TestInfo): Creds {
  const file = path.join(authDir, `${info.project.name}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const creds = { username: 'admin', password: `P!${crypto.randomBytes(12).toString('base64url')}9a` };
  fs.mkdirSync(authDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify(creds), { mode: 0o600 });
  return creds;
}

export const stamp = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export async function isInitial(page: Page): Promise<boolean> {
  const res = await page.request.get('/api');
  return (await res.json()).initial === true;
}

export async function ensureAdmin(page: Page, info: TestInfo): Promise<Creds> {
  const creds = credsFor(info);
  if (await isInitial(page)) {
    await page.goto('/#/landing');
    await page.getByLabel('Username').fill(creds.username);
    await page.getByLabel('Password', { exact: true }).fill(creds.password);
    await page.getByLabel('Confirm Password').fill(creds.password);
    await page.getByLabel('Access Code').fill(ACCESS_CODE);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/#\/home/);
  }
  return creds;
}

export async function signIn(page: Page, info: TestInfo): Promise<void> {
  const creds = await ensureAdmin(page, info);
  await page.goto('/#/landing');
  if (/#\/home/.test(page.url())) return;
  await page.getByLabel('Username').fill(creds.username);
  await page.getByLabel('Password', { exact: true }).fill(creds.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Access Code').fill(ACCESS_CODE);
  await page.getByRole('button', { name: 'Continue to Mage' }).click();
  await expect(page).toHaveURL(/#\/home/);
}

// Hides values that legitimately differ between the two servers (timestamps, user agents, generated names).
const MASK_CSS = `
  .mat-mdc-paginator-range-label, time, [class*="date"], [class*="time"] { visibility: hidden !important; }
  *, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }
`;

export async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.addStyleTag({ content: MASK_CSS }).catch(() => undefined);
  await page.waitForTimeout(500);
  const dir = path.join(__dirname, '..', 'report', 'shots', info.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

export async function adminPage(page: Page, route: string, heading: string): Promise<void> {
  await page.goto(`/#/admin/${route}`);
  await expect(page.getByText(heading, { exact: true }).last()).toBeVisible();
}
