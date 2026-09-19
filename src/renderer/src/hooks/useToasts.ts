import { useCallback, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
  action?: { label: string; onClick: () => void };
}

let nextId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = ++nextId;
      setToasts((list) => [...list, { ...toast, id }].slice(-3));
      setTimeout(() => dismiss(id), toast.action ? 6000 : 2600);
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
