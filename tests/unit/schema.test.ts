import { describe, expect, it } from 'vitest';
import { sanitize } from '../../src/main/schema';

describe('sanitize', () => {
  it('returns empty data for garbage input', () => {
    expect(sanitize(null)).toEqual({ currency: '₹', expenses: [] });
    expect(sanitize('nope')).toEqual({ currency: '₹', expenses: [] });
  });

  it('keeps valid rows and drops invalid ones individually', () => {
    const data = sanitize({
      currency: '$',
      expenses: [
        { id: 1, amount: 10, category: 'Food', date: '2026-09-01', note: 'ok' },
        { id: 2, amount: -5, category: 'Food', date: '2026-09-01', note: 'negative' },
        { id: 3, amount: 5, category: 'Food', date: 'yesterday', note: 'bad date' },
        { id: 4, amount: 7, category: 'Crypto', date: '2026-09-02' },
      ],
    });
    expect(data.currency).toBe('$');
    expect(data.expenses).toEqual([
      { id: 1, amount: 10, category: 'Food', date: '2026-09-01', note: 'ok' },
      { id: 4, amount: 7, category: 'Other', date: '2026-09-02', note: '' },
    ]);
  });

  it('falls back to the default currency', () => {
    expect(sanitize({ currency: 'BTC', expenses: [] }).currency).toBe('₹');
  });

  it('truncates overly long notes', () => {
    const [e] = sanitize({
      expenses: [{ id: 1, amount: 1, category: 'Food', date: '2026-09-01', note: 'x'.repeat(500) }],
    }).expenses;
    expect(e.note).toHaveLength(80);
  });
});
