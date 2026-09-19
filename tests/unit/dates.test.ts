import { describe, expect, it } from 'vitest';
import { dayLabel, daysInMonth, monthOf, shiftMonth, toYmd } from '../../src/renderer/src/lib/dates';

describe('dates', () => {
  it('formats local dates without shifting to UTC', () => {
    expect(toYmd(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    expect(toYmd(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('knows month lengths including leap years', () => {
    expect(daysInMonth('2028-02')).toBe(29);
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2026-09')).toBe(30);
  });

  it('extracts the month', () => {
    expect(monthOf('2026-09-18')).toBe('2026-09');
    expect(monthOf(new Date(2026, 8, 18))).toBe('2026-09');
  });

  it('labels today and yesterday', () => {
    const today = new Date(2026, 8, 18, 21, 0);
    expect(dayLabel('2026-09-18', today)).toBe('Today');
    expect(dayLabel('2026-09-17', today)).toBe('Yesterday');
    expect(dayLabel('2026-09-10', today)).not.toMatch(/Today|Yesterday/);
  });
});
