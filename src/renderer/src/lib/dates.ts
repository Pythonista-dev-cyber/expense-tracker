const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (never UTC, so late-night entries land on the right day). */
export const toYmd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseYmd = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** YYYY-MM for a YYYY-MM-DD string or a Date. */
export const monthOf = (value: string | Date): string =>
  (typeof value === 'string' ? value : toYmd(value)).slice(0, 7);

export const dayOf = (ymd: string): number => Number(ymd.slice(8, 10));

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function monthTitle(month: string, style: 'long' | 'short' = 'long'): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return style === 'long'
    ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : date.toLocaleDateString(undefined, { month: 'short' });
}

export function dayLabel(ymd: string, today: Date): string {
  const diff = Math.round((parseYmd(toYmd(today)).getTime() - parseYmd(ymd).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return parseYmd(ymd).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}
