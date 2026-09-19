import type { Expense } from '@shared/types';

/** Quote every cell, and neutralise values Excel would treat as formulas (CSV injection). */
function cell(value: string | number): string {
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(expenses: readonly Expense[]): string {
  const rows = [...expenses]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .map((e) => [e.date, e.category, e.note, e.amount.toFixed(2)]);
  return [['Date', 'Category', 'Note', 'Amount'], ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}
