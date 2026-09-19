import type { Category, Currency } from './constants';

export interface Expense {
  id: number;
  amount: number;
  category: Category;
  /** Local calendar date, YYYY-MM-DD */
  date: string;
  note: string;
}

export interface AppData {
  currency: Currency;
  expenses: Expense[];
}

/** The API the preload script exposes to the renderer as `window.api`. */
export interface ExpenseApi {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  exportCsv(csv: string): Promise<boolean>;
}
