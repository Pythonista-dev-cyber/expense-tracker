import { useCallback } from 'react';
import type { ChartPoint, Delta, MonthSummary } from '../lib/stats';
import { formatMoney } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';
import { Card } from './Card';
import { SpendingChart } from './SpendingChart';
import '../styles/summary.css';

interface Props {
  summary: MonthSummary;
  points: ChartPoint[];
  currency: string;
  monthShort: string;
}

function DeltaPill({ delta, hasSpending }: { delta: Delta; hasSpending: boolean }) {
  switch (delta.kind) {
    case 'none':
      return (
        <p className="delta flat">
          {hasSpending ? 'Nothing to compare with last month' : 'A fresh start ✨'}
        </p>
      );
    case 'same':
      return <p className="delta flat">Same as last month</p>;
    case 'up':
      return <p className="delta up">▲ {delta.pct.toFixed(0)}% more than last month</p>;
    case 'down':
      return <p className="delta down">▼ {delta.pct.toFixed(0)}% less than last month</p>;
  }
}

export function SummaryCard({ summary, points, currency, monthShort }: Props) {
  const money = useCallback((n: number) => formatMoney(n, currency), [currency]);
  const count = useCallback((n: number) => String(Math.round(n)), []);
  const biggest = useCallback((n: number) => (summary.biggest ? money(n) : '—'), [summary.biggest, money]);

  return (
    <Card className="hero" index={0}>
      <div className="hero-top">
        <div>
          <p className="label">Spent this month</p>
          <p className="big">
            <AnimatedNumber value={summary.total} format={money} id="total-month" />
          </p>
          <DeltaPill delta={summary.delta} hasSpending={summary.total > 0} />
        </div>
        <div className="stats">
          <div className="stat">
            <span className="label">Daily avg</span>
            <AnimatedNumber className="stat-val" value={summary.dailyAvg} format={money} />
          </div>
          <div className="stat">
            <span className="label">Transactions</span>
            <AnimatedNumber className="stat-val" value={summary.count} format={count} />
          </div>
          <div className="stat">
            <span className="label">Biggest</span>
            <AnimatedNumber className="stat-val" value={summary.biggest} format={biggest} />
          </div>
        </div>
      </div>
      <SpendingChart points={points} currency={currency} monthShort={monthShort} />
      <div className="chart-key">
        <span>
          <i className="k k-now" />
          This month
        </span>
        <span>
          <i className="k k-prev" />
          Last month
        </span>
      </div>
    </Card>
  );
}
