import {
  _electron as electron,
  expect,
  test,
  type ElectronApplication,
  type Locator,
  type Page,
} from '@playwright/test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let app: ElectronApplication;
let page: Page;
let dataDir: string;
const pageErrors: string[] = [];

async function launch(seed?: object) {
  dataDir = mkdtempSync(join(tmpdir(), 'expense-tracker-e2e-'));
  if (seed) writeFileSync(join(dataDir, 'expenses.json'), JSON.stringify(seed));
  app = await electron.launch({ args: ['.'], env: { ...process.env, EXPENSE_TRACKER_DATA_DIR: dataDir } });
  page = await app.firstWindow();
  page.on('pageerror', (err) => pageErrors.push(err.message));
}

const readSaved = () => JSON.parse(readFileSync(join(dataDir, 'expenses.json'), 'utf8'));

test.afterEach(async () => {
  await app?.close();
  rmSync(dataDir, { recursive: true, force: true });
  expect(pageErrors).toEqual([]);
  pageErrors.length = 0;
});

test('adds, deletes and restores an expense', async () => {
  await launch();
  await expect(page.getByText('No expenses this month yet')).toBeVisible();

  await page.getByRole('button', { name: /Shopping/ }).click();
  await page.getByLabel('Amount').fill('499');
  await page.getByLabel('Note').fill('Headphones');
  await page.getByRole('button', { name: /Add expense/ }).click();

  const row = page.getByTestId('transaction').filter({ hasText: 'Headphones' });
  await expect(row).toBeVisible();
  await expect(page.locator('#total-month')).toHaveText('₹499.00');
  await expect.poll(() => readSaved().expenses).toHaveLength(1);
  expect(readSaved().expenses[0]).toMatchObject({ amount: 499, category: 'Shopping', note: 'Headphones' });

  await row.hover();
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
  await expect.poll(() => readSaved().expenses).toHaveLength(0);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByTestId('transaction').filter({ hasText: 'Headphones' })).toBeVisible();
  await expect.poll(() => readSaved().expenses).toHaveLength(1);
});

test('keeps a new expense visible at the top of a long list', async () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await launch({
    currency: '$',
    expenses: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      amount: 10 + i,
      category: 'Food',
      date: yesterday,
      note: `Older ${i}`,
    })),
  });
  // Same size as a CI runner's screen, so the layout is identical on every machine.
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1000, 700));
  // The user has scrolled the list a little before adding.
  await page.locator('.list').evaluate((el) => (el.scrollTop = 120));
  await page.getByLabel('Amount').fill('5');
  await page.getByLabel('Note').fill('Brand new');
  await page.getByRole('button', { name: /Add expense/ }).click();
  // Visible inside the list's own scroll area. (On small screens the list itself can sit below the
  // window's fold, so "in the window viewport" would depend on the machine's resolution.)
  const shownInList = (locator: Locator) =>
    locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const l = el.closest('.list')!.getBoundingClientRect();
      return r.top >= l.top - 1 && r.bottom <= l.bottom + 1;
    });
  const row = page.getByTestId('transaction').filter({ hasText: 'Brand new' });
  await expect.poll(() => shownInList(row)).toBe(true);
  await expect.poll(() => shownInList(page.locator('.group-title').filter({ hasText: 'Today' }))).toBe(true);
  await expect.poll(() => page.locator('.list').evaluate((el) => el.scrollTop)).toBe(0);
});

test('rejects an empty amount', async () => {
  await launch();
  await page.getByRole('button', { name: /Add expense/ }).click();
  await expect(page.getByTestId('transaction')).toHaveCount(0);
});

test('loads existing data and switches months', async () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  await launch({
    currency: '$',
    expenses: [{ id: 1, amount: 42, category: 'Food', date: ymd, note: 'Seeded lunch' }],
  });
  await expect(page.getByText('Seeded lunch')).toBeVisible();
  await expect(page.locator('#total-month')).toHaveText('$42.00');

  const label = page.getByTestId('month-label');
  const before = await label.textContent();
  await page.getByRole('button', { name: 'Previous month' }).click();
  await expect(label).toHaveCount(1); // old label has finished sliding out
  await expect(label).not.toHaveText(before ?? '');
  await expect(page.getByText('No expenses this month yet')).toBeVisible();
});
