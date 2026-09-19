import { describe, expect, it } from 'vitest';
import type { Category } from '@shared/constants';
import type { Expense } from '@shared/types';
import { buildChartSeries, daysElapsed, groupByDay, summarizeMonth } from '../../src/renderer/src/lib/stats';

let nextId = 1;
const exp = (date: string, amount: number, category: Category = 'Food', note = ''): Expense => ({
  id: nextId++,
  date,
  amount,
  category,
  note,
});

const NOW = new Date(2026, 8, 18, 15, 0); // 18 Sep 2026, local time

describe('daysElapsed', () => {
  it('counts days so far in the current month', () => expect(daysElapsed('2026-09', NOW)).toBe(18));
  it('uses the full length for past months', () => expect(daysElapsed('2026-08', NOW)).toBe(31));
  it('is zero for future months', () => expect(daysElapsed('2026-10', NOW)).toBe(0));
});

describe('summarizeMonth', () => {
  it('only counts the selected month', () => {
    const s = summarizeMonth(
      [exp('2026-09-01', 100), exp('2026-09-18', 80), exp('2026-08-30', 999)],
      '2026-09',
      NOW,
    );
    expect(s.total).toBe(180);
    expect(s.count).toBe(2);
    expect(s.biggest).toBe(100);
    expect(s.dailyAvg).toBe(10);
  });

  it('ranks categories by amount with their share', () => {
    const s = summarizeMonth(
      [exp('2026-09-02', 30, 'Bills'), exp('2026-09-03', 60, 'Food'), exp('2026-09-04', 10, 'Bills')],
      '2026-09',
      NOW,
    );
    expect(s.byCategory).toEqual([
      { category: 'Food', amount: 60, share: 0.6 },
      { category: 'Bills', amount: 40, share: 0.4 },
    ]);
  });

  it('compares with last month up to the same day', () => {
    const s = summarizeMonth(
      [exp('2026-09-05', 150), exp('2026-08-10', 100), exp('2026-08-25', 5000)], // Aug 25 is after the 18th
      '2026-09',
      NOW,
    );
    expect(s.delta).toEqual({ kind: 'up', pct: 50 });
  });

  it('reports spending less than last month', () => {
    const s = summarizeMonth([exp('2026-09-05', 50), exp('2026-08-05', 100)], '2026-09', NOW);
    expect(s.delta).toEqual({ kind: 'down', pct: 50 });
  });

  it('has no comparison when last month is empty', () => {
    expect(summarizeMonth([exp('2026-09-05', 50)], '2026-09', NOW).delta).toEqual({ kind: 'none' });
  });

  it('handles an empty month', () => {
    const s = summarizeMonth([], '2026-09', NOW);
    expect(s).toMatchObject({ total: 0, dailyAvg: 0, count: 0, biggest: 0, byCategory: [] });
  });
});

describe('buildChartSeries', () => {
  it('builds running totals and stops this month at today', () => {
    const points = buildChartSeries([exp('2026-09-01', 10), exp('2026-09-03', 5)], '2026-09', NOW);
    expect(points).toHaveLength(30);
    expect(points.slice(0, 3).map((p) => p.cur)).toEqual([10, 10, 15]);
    expect(points[17].cur).toBe(15);
    expect(points[18].cur).toBeNull();
    expect(points[2].daily).toBe(5);
  });

  it("folds last month's extra days into this month's last day", () => {
    const points = buildChartSeries([exp('2026-08-31', 40)], '2026-09', NOW);
    expect(points[29].prev).toBe(40);
    expect(points[28].prev).toBe(0);
  });
});

describe('groupByDay', () => {
  it('groups newest day first with totals', () => {
    const a = exp('2026-09-01', 5);
    const b = exp('2026-09-02', 7);
    const c = exp('2026-09-02', 3);
    const groups = groupByDay([a, b, c]);
    expect(groups.map((g) => [g.date, g.total])).toEqual([
      ['2026-09-02', 10],
      ['2026-09-01', 5],
    ]);
    expect(groups[0].items).toEqual([c, b]);
  });
});
