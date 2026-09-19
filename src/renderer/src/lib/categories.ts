import type { Category } from '@shared/constants';

export const CATEGORY_META: Record<Category, { color: string; emoji: string }> = {
  Food: { color: '#fb923c', emoji: '🍜' },
  Transport: { color: '#60a5fa', emoji: '🚕' },
  Shopping: { color: '#e879f9', emoji: '🛍️' },
  Bills: { color: '#f87171', emoji: '🧾' },
  Entertainment: { color: '#4ade80', emoji: '🎬' },
  Health: { color: '#2dd4bf', emoji: '💊' },
  Education: { color: '#facc15', emoji: '📚' },
  Other: { color: '#a1a1aa', emoji: '✨' },
};
