export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CURRENCIES = ['₹', '$', '€', '£', '¥'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = '₹';
export const MAX_NOTE_LENGTH = 80;
