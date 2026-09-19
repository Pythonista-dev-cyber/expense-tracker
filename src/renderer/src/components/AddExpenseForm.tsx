import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { motion, useAnimate } from 'motion/react';
import { CATEGORIES, MAX_NOTE_LENGTH, type Category } from '@shared/constants';
import type { NewExpense } from '../hooks/useExpenses';
import { CATEGORY_META } from '../lib/categories';
import { toYmd } from '../lib/dates';
import { Card } from './Card';
import '../styles/form.css';

interface Props {
  currency: string;
  onAdd: (expense: NewExpense) => void;
}

export function AddExpenseForm({ currency, onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(() => toYmd(new Date()));
  const [note, setNote] = useState('');
  const amountRef = useRef<HTMLInputElement>(null);
  const [fieldScope, animateField] = useAnimate<HTMLDivElement>();

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number.parseFloat(amount);
    if (!(value > 0) || !Number.isFinite(value)) {
      void animateField(fieldScope.current, { x: [0, -6, 6, -6, 6, 0] }, { duration: 0.4 });
      amountRef.current?.focus();
      return;
    }
    onAdd({ amount: value, category, date: date || toYmd(new Date()), note: note.trim() });
    setAmount('');
    setNote('');
    amountRef.current?.focus();
  }

  return (
    <Card className="add" index={2}>
      <p className="label">New expense</p>
      <form onSubmit={submit} autoComplete="off" noValidate>
        <div className="amount-field" ref={fieldScope}>
          <span>{currency}</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            aria-label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="chips" role="group" aria-label="Category">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const on = c === category;
            return (
              <motion.button
                type="button"
                key={c}
                className={`chip${on ? ' on' : ''}`}
                style={{ '--c': meta.color } as CSSProperties}
                aria-pressed={on}
                onClick={() => setCategory(c)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {on && (
                  <motion.span
                    layoutId="chip-highlight"
                    className="chip-highlight"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="em">{meta.emoji}</span>
                <span className="chip-name">{c}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="row">
          <input
            type="date"
            className="field"
            aria-label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="text"
            className="field"
            maxLength={MAX_NOTE_LENGTH}
            placeholder="What was it for?"
            aria-label="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <motion.button
          type="submit"
          className="primary"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98, y: 1 }}
        >
          Add expense <kbd>Enter</kbd>
        </motion.button>
      </form>
    </Card>
  );
}
