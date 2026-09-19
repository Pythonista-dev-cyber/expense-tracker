import { AnimatePresence, motion } from 'motion/react';
import type { Toast } from '../hooks/useToasts';
import '../styles/toasts.css';

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const ICON = { success: '✓', info: 'ℹ', error: '⚠' } as const;

export function Toasts({ toasts, onDismiss }: Props) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={`toast ${t.tone}`}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {!t.action && <span className="toast-icon">{ICON[t.tone]}</span>}
            <span>{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  onDismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
