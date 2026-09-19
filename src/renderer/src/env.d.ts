import type { ExpenseApi } from '@shared/types';

declare global {
  interface Window {
    api: ExpenseApi;
  }
}
