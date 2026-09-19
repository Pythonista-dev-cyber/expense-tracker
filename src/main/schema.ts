import { z } from 'zod';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY, MAX_NOTE_LENGTH } from '@shared/constants';
import type { AppData, Expense } from '@shared/types';

export const expenseSchema = z.object({
  id: z.number().int().nonnegative(),
  amount: z.number().positive().max(1e12),
  category: z.enum(CATEGORIES).catch('Other'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z
    .string()
    .catch('')
    .transform((s) => s.slice(0, MAX_NOTE_LENGTH)),
});

const currencySchema = z.enum(CURRENCIES).catch(DEFAULT_CURRENCY);

/**
 * Turns anything read from disk (or sent by the renderer) into valid AppData.
 * Invalid expenses are dropped individually so one bad row can't lose the rest.
 */
export function sanitize(raw: unknown): AppData {
  const obj = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const list = Array.isArray(obj.expenses) ? obj.expenses : [];
  const expenses: Expense[] = list.flatMap((item) => {
    const parsed = expenseSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  return { currency: currencySchema.parse(obj.currency), expenses };
}
