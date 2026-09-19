import { useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Expense } from '@shared/types';
import { CATEGORY_META } from '../lib/categories';
import { dayLabel } from '../lib/dates';
import { formatMoney } from '../lib/format';
import { groupByDay } from '../lib/stats';
import { Card } from './Card';
import '../styles/transactions.css';

interface Props {
  items: Expense[];
  currency: string;
  highlightId: number | null;
  onDelete: (expense: Expense) => void;
}

type Row =
  | { kind: 'day'; key: string; label: string; total: number }
  | { kind: 'item'; key: string; expense: Expense };

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function TransactionList({ items, currency, highlightId, onDelete }: Props) {
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? items.filter((e) => `${e.note} ${e.category}`.toLowerCase().includes(q)) : items;
    const today = new Date();
    return groupByDay(filtered).flatMap((g) => [
      { kind: 'day' as const, key: `d-${g.date}`, label: dayLabel(g.date, today), total: g.total },
      ...g.items.map((e) => ({ kind: 'item' as const, key: `e-${e.id}`, expense: e })),
    ]);
  }, [items, query]);

  const searching = query.trim() !== '';

  return (
    <Card className="tx" index={3}>
      <div className="tx-head">
        <p className="label">Transactions</p>
        <input
          type="search"
          className="field search"
          placeholder="Search…"
          aria-label="Search transactions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="list">
        <AnimatePresence initial={true} mode="popLayout">
          {rows.map((row, i) =>
            row.kind === 'day' ? (
              <motion.div
                key={row.key}
                layout="position"
                className="group-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span>{row.label}</span>
                <span>{formatMoney(row.total, currency)}</span>
              </motion.div>
            ) : (
              <TransactionRow
                key={row.key}
                expense={row.expense}
                currency={currency}
                delay={Math.min(i * 0.035, 0.45)}
                isNew={row.expense.id === highlightId}
                onDelete={onDelete}
              />
            ),
          )}
        </AnimatePresence>

        {rows.length === 0 && (
          <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-orb">🪙</div>
            <p>{searching ? 'No matches' : 'No expenses this month yet'}</p>
            <span>{searching ? 'Try a different search.' : 'Add your first one on the left.'}</span>
          </motion.div>
        )}
      </div>
    </Card>
  );
}

interface RowProps {
  expense: Expense;
  currency: string;
  delay: number;
  isNew: boolean;
  onDelete: (expense: Expense) => void;
}

function TransactionRow({ expense, currency, delay, isNew, onDelete }: RowProps) {
  const meta = CATEGORY_META[expense.category];
  return (
    <motion.div
      layout="position"
      className={`item${isNew ? ' new' : ''}`}
      style={{ '--c': meta.color } as CSSProperties}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5, delay: isNew ? 0 : delay, ease: EASE } }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.25 } }}
      data-testid="transaction"
    >
      <div className="bubble">{meta.emoji}</div>
      <div className="meta">
        <div className="title">{expense.note || expense.category}</div>
        <div className="sub">{expense.category}</div>
      </div>
      <div className="amt">{formatMoney(expense.amount, currency)}</div>
      <button className="del" title="Delete" aria-label="Delete" onClick={() => onDelete(expense)}>
        ✕
      </button>
    </motion.div>
  );
}
