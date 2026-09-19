// Captures Microsoft Store screenshots into store/screenshots/ using sample data in a temp folder.
// Run with: npm run store:screenshots  (builds first)
import { _electron as electron } from '@playwright/test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = 'store/screenshots';
mkdirSync(outDir, { recursive: true });

// Realistic, deterministic sample data for this month and last month.
const notes = {
  Food: ['Lunch with team', 'Groceries', 'Coffee', 'Pizza night', 'Farmers market'],
  Transport: ['Uber', 'Metro card', 'Fuel'],
  Shopping: ['Running shoes', 'Headphones', 'Desk lamp'],
  Bills: ['Electricity', 'Internet', 'Phone plan'],
  Entertainment: ['Movie tickets', 'Concert', 'Streaming'],
  Health: ['Pharmacy', 'Gym membership'],
  Education: ['Online course', 'Books'],
  Other: ['Gift for mom'],
};
const cats = Object.keys(notes);
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const expenses = [];
let id = 1;
for (const back of [1, 0]) {
  const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
  const days = back ? new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate() : now.getDate();
  for (let d = 1; d <= days; d++) {
    const n = rnd() < 0.3 ? 0 : rnd() < 0.7 ? 1 : 2;
    for (let k = 0; k < n; k++) {
      const c = cats[Math.floor(rnd() ** 1.4 * cats.length)];
      const base = { Bills: 60, Shopping: 45, Education: 30, Entertainment: 18, Health: 20 }[c] ?? 9;
      expenses.push({
        id: id++,
        amount: Math.round((base + rnd() * base * 1.6) * 100) / 100,
        category: c,
        date: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(d)}`,
        note: notes[c][Math.floor(rnd() * notes[c].length)],
      });
    }
  }
}

const dir = mkdtempSync(join(tmpdir(), 'et-store-'));
writeFileSync(join(dir, 'expenses.json'), JSON.stringify({ currency: '$', expenses }));
const app = await electron.launch({ args: ['.'], env: { ...process.env, EXPENSE_TRACKER_DATA_DIR: dir } });
try {
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.setContentSize(1600, 900);
    w.center();
  });
  await page.waitForTimeout(2500);

  // 1. Dashboard with chart tooltip
  const chart = await page.getByTestId('spending-chart').boundingBox();
  await page.mouse.move(chart.x + chart.width * 0.42, chart.y + chart.height * 0.6);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/1-dashboard.png` });

  // 2. Category donut focus
  await page.locator('.legend li').first().hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/2-categories.png` });

  // 3. Add an expense (form + list + toast)
  await page.mouse.move(5, 5);
  await page.locator('.app').evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.getByRole('button', { name: /Entertainment/ }).click();
  await page.getByLabel('Amount').fill('24.50');
  await page.getByLabel('Note').fill('Bowling night');
  await page.getByRole('button', { name: /Add expense/ }).click();
  await page.getByTestId('transaction').filter({ hasText: 'Bowling night' }).waitFor();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outDir}/3-add-expense.png` });

  // 4. Search transactions
  await page.getByLabel('Search transactions').fill('coffee');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}/4-search.png` });
} finally {
  await app.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(`Saved 4 screenshots to ${outDir}/`);
