import type { Category } from '@shared/constants';
import type { Expense } from '@shared/types';
import { dayOf, daysInMonth, monthOf, shiftMonth } from './dates';

export const sumAmounts = (list: readonly Expense[]): number => list.reduce((s, e) => s + e.amount, 0);

export const expensesInMonth = (expenses: readonly Expense[], month: string): Expense[] =>
  expenses.filter((e) => e.date.startsWith(month));

/** How many days of `month` have happened as of `now` (0 for future months). */
export function daysElapsed(month: string, now: Date): number {
  const current = monthOf(now);
  if (month > current) return 0;
  if (month === current) return now.getDate();
  return daysInMonth(month);
}

export type Delta = { kind: 'none' } | { kind: 'same' } | { kind: 'up' | 'down'; pct: number };

export interface CategoryTotal {
  category: Category;
  amount: number;
  share: number;
}

export interface MonthSummary {
  total: number;
  dailyAvg: number;
  count: number;
  biggest: number;
  byCategory: CategoryTotal[];
  delta: Delta;
}

export function summarizeMonth(expenses: readonly Expense[], month: string, now: Date): MonthSummary {
  const items = expensesInMonth(expenses, month);
  const total = sumAmounts(items);
  const elapsed = daysElapsed(month, now);

  const totals = new Map<Category, number>();
  for (const e of items) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  const byCategory = [...totals]
    .map(([category, amount]) => ({ category, amount, share: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Compare with last month up to the same day, so mid-month numbers are fair.
  const cutoff = month === monthOf(now) ? now.getDate() : 31;
  const prevSame = sumAmounts(
    expensesInMonth(expenses, shiftMonth(month, -1)).filter((e) => dayOf(e.date) <= cutoff),
  );
  let delta: Delta;
  if (!prevSame) delta = { kind: 'none' };
  else {
    const pct = ((total - prevSame) / prevSame) * 100;
    delta = Math.abs(pct) < 0.5 ? { kind: 'same' } : { kind: pct > 0 ? 'up' : 'down', pct: Math.abs(pct) };
  }

  return {
    total,
    dailyAvg: elapsed ? total / elapsed : 0,
    count: items.length,
    biggest: items.reduce((max, e) => Math.max(max, e.amount), 0),
    byCategory,
    delta,
  };
}

export interface ChartPoint {
  day: number;
  /** Running total this month; null for days that haven't happened yet. */
  cur: number | null;
  /** Running total last month (later days clamped into this month's length). */
  prev: number;
  /** Spent on this day alone. */
  daily: number;
}

export function buildChartSeries(expenses: readonly Expense[], month: string, now: Date): ChartPoint[] {
  const dim = daysInMonth(month);
  const elapsed = daysElapsed(month, now);
  const daily = new Array<number>(dim).fill(0);
  const prevDaily = new Array<number>(dim).fill(0);
  for (const e of expensesInMonth(expenses, month)) daily[dayOf(e.date) - 1] += e.amount;
  for (const e of expensesInMonth(expenses, shiftMonth(month, -1))) {
    prevDaily[Math.min(dayOf(e.date), dim) - 1] += e.amount;
  }

  let cur = 0;
  let prev = 0;
  return daily.map((amount, i) => {
    cur += amount;
    prev += prevDaily[i];
    return { day: i + 1, cur: i < elapsed ? cur : null, prev, daily: amount };
  });
}

export interface DayGroup {
  date: string;
  total: number;
  items: Expense[];
}

/** Newest day first; newest entry first within a day. */
export function groupByDay(items: readonly Expense[]): DayGroup[] {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const groups: DayGroup[] = [];
  for (const e of sorted) {
    const last = groups[groups.length - 1];
    if (last?.date === e.date) {
      last.items.push(e);
      last.total += e.amount;
    } else groups.push({ date: e.date, total: e.amount, items: [e] });
  }
  return groups;
}
