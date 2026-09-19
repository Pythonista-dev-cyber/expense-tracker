import { describe, expect, it } from 'vitest';
import { toCsv } from '../../src/renderer/src/lib/csv';

describe('toCsv', () => {
  it('writes a header and rows sorted by date', () => {
    const csv = toCsv([
      { id: 2, date: '2026-09-02', category: 'Food', note: 'Lunch', amount: 120 },
      { id: 1, date: '2026-09-01', category: 'Bills', note: 'Wifi', amount: 999.5 },
    ]);
    expect(csv.split('\r\n')).toEqual([
      '"Date","Category","Note","Amount"',
      '"2026-09-01","Bills","Wifi","999.50"',
      '"2026-09-02","Food","Lunch","120.00"',
    ]);
  });

  it('escapes quotes and commas', () => {
    const csv = toCsv([{ id: 1, date: '2026-09-01', category: 'Other', note: 'Say "hi", ok', amount: 1 }]);
    expect(csv).toContain('"Say ""hi"", ok"');
  });

  it('neutralises spreadsheet formulas', () => {
    const csv = toCsv([{ id: 1, date: '2026-09-01', category: 'Other', note: '=HYPERLINK("x")', amount: 1 }]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
});
