import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category, Currency } from '@shared/constants';
import type { AppData, Expense } from '@shared/types';

export interface NewExpense {
  amount: number;
  category: Category;
  date: string;
  note: string;
}

/** Loads data once, keeps it in state and persists every change after the initial load. */
export function useExpenses(onSaveError: (message: string) => void) {
  const [data, setData] = useState<AppData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastId = useRef(0);
  const loaded = useRef(false);
  const onSaveErrorRef = useRef(onSaveError);

  useEffect(() => {
    onSaveErrorRef.current = onSaveError;
  }, [onSaveError]);

  useEffect(() => {
    window.api
      .load()
      .then((d) => {
        lastId.current = d.expenses.reduce((max, e) => Math.max(max, e.id), 0);
        setData(d);
      })
      .catch((err: unknown) => setLoadError(String(err)));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    window.api.save(data).catch(() => onSaveErrorRef.current('Could not save your changes'));
  }, [data]);

  const add = useCallback((input: NewExpense): Expense => {
    // Timestamp-based ids, bumped if two land in the same millisecond.
    const id = Math.max(Date.now(), lastId.current + 1);
    lastId.current = id;
    const expense: Expense = { id, ...input, amount: Math.round(input.amount * 100) / 100 };
    setData((d) => (d ? { ...d, expenses: [...d.expenses, expense] } : d));
    return expense;
  }, []);

  const remove = useCallback((id: number) => {
    setData((d) => (d ? { ...d, expenses: d.expenses.filter((e) => e.id !== id) } : d));
  }, []);

  const restore = useCallback((expense: Expense) => {
    setData((d) =>
      d && !d.expenses.some((e) => e.id === expense.id) ? { ...d, expenses: [...d.expenses, expense] } : d,
    );
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setData((d) => (d ? { ...d, currency } : d));
  }, []);

  return { data, loadError, add, remove, restore, setCurrency };
}
