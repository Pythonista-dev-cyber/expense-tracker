import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Expense } from '@shared/types';
import { AddExpenseForm } from './components/AddExpenseForm';
import { Background } from './components/Background';
import { CategoryDonut } from './components/CategoryDonut';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { TitleBar } from './components/TitleBar';
import { Toasts } from './components/Toasts';
import { TransactionList } from './components/TransactionList';
import { useExpenses, type NewExpense } from './hooks/useExpenses';
import { useToasts } from './hooks/useToasts';
import { CATEGORY_META } from './lib/categories';
import { toCsv } from './lib/csv';
import { monthOf, monthTitle, shiftMonth } from './lib/dates';
import { formatMoney } from './lib/format';
import { buildChartSeries, expensesInMonth, summarizeMonth } from './lib/stats';

export default function App() {
  const { toasts, push, dismiss } = useToasts();
  const onSaveError = useCallback((message: string) => push({ message, tone: 'error' }), [push]);
  const { data, loadError, add, remove, restore, setCurrency } = useExpenses(onSaveError);

  const [month, setMonth] = useState(() => monthOf(new Date()));
  const [direction, setDirection] = useState(1);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const expenses = data?.expenses;
  const currency = data?.currency ?? '₹';

  const view = useMemo(() => {
    if (!expenses) return null;
    const now = new Date();
    return {
      summary: summarizeMonth(expenses, month, now),
      points: buildChartSeries(expenses, month, now),
      items: expensesInMonth(expenses, month),
    };
  }, [expenses, month]);

  const shiftBy = useCallback((delta: number) => {
    setDirection(delta);
    setMonth((m) => shiftMonth(m, delta));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowLeft') shiftBy(-1);
      if (e.key === 'ArrowRight') shiftBy(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shiftBy]);

  const handleAdd = (input: NewExpense) => {
    const expense = add(input);
    setHighlightId(expense.id);
    const target = monthOf(expense.date);
    if (target !== month) {
      setDirection(target > month ? 1 : -1);
      setMonth(target);
    }
    const { emoji } = CATEGORY_META[expense.category];
    push({
      message: `Added ${formatMoney(expense.amount, currency)} · ${emoji} ${expense.category}`,
      tone: 'success',
    });
  };

  const handleDelete = (expense: Expense) => {
    remove(expense.id);
    push({
      message: `Deleted “${expense.note || expense.category}”`,
      tone: 'info',
      action: {
        label: 'Undo',
        onClick: () => {
          restore(expense);
          setHighlightId(expense.id);
        },
      },
    });
  };

  const handleExport = async () => {
    if (!expenses) return;
    try {
      if (await window.api.exportCsv(toCsv(expenses))) push({ message: 'Exported to CSV', tone: 'success' });
    } catch {
      push({ message: 'Export failed', tone: 'error' });
    }
  };

  return (
    <>
      <Background />
      <TitleBar />
      <div className="app">
        {loadError ? (
          <div className="fatal">
            <div className="empty-orb">😵</div>
            <h2>Couldn’t load your expenses</h2>
            <pre>{loadError}</pre>
          </div>
        ) : data && view ? (
          <>
            <Header
              month={month}
              direction={direction}
              onShiftMonth={shiftBy}
              currency={data.currency}
              onCurrencyChange={setCurrency}
              onExport={handleExport}
            />
            <section className="bento">
              <SummaryCard
                summary={view.summary}
                points={view.points}
                currency={currency}
                monthShort={monthTitle(month, 'short')}
              />
              <CategoryDonut
                byCategory={view.summary.byCategory}
                total={view.summary.total}
                currency={currency}
                animationKey={month}
              />
              <AddExpenseForm currency={currency} onAdd={handleAdd} />
              <TransactionList
                items={view.items}
                currency={currency}
                highlightId={highlightId}
                onDelete={handleDelete}
              />
            </section>
          </>
        ) : null}
      </div>
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
