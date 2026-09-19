export const formatMoney = (n: number, currency: string, locale?: string): string =>
  currency + n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const compactMoney = (n: number, currency: string, locale?: string): string =>
  currency + new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
