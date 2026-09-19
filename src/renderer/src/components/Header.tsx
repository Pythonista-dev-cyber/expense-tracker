import { AnimatePresence, motion } from 'motion/react';
import { CURRENCIES, type Currency } from '@shared/constants';
import { monthTitle } from '../lib/dates';

interface Props {
  month: string;
  direction: number;
  onShiftMonth: (delta: number) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onExport: () => void;
}

function greeting(hour: number): string {
  if (hour < 5) return 'Up late? 🌙';
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 🌆';
}

export function Header({ month, direction, onShiftMonth, currency, onCurrencyChange, onExport }: Props) {
  return (
    <motion.header
      className="top"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div>
        <p className="eyebrow">{greeting(new Date().getHours())}</p>
        <h1>
          Your money, <span className="grad">at a glance.</span>
        </h1>
      </div>

      <div className="controls">
        <div className="month-switch glass">
          <button
            className="icon-btn"
            onClick={() => onShiftMonth(-1)}
            title="Previous month (Alt+←)"
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="month-label">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.span
                key={month}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -24 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                data-testid="month-label"
              >
                {monthTitle(month)}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            className="icon-btn"
            onClick={() => onShiftMonth(1)}
            title="Next month (Alt+→)"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <select
          className="glass"
          aria-label="Currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <motion.button className="ghost glass" onClick={onExport} whileTap={{ scale: 0.96 }}>
          Export CSV
        </motion.button>
      </div>
    </motion.header>
  );
}
