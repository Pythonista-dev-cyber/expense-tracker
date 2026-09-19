import { useLayoutEffect, useRef } from 'react';
import { animate } from 'motion/react';

interface Props {
  value: number;
  format: (n: number) => string;
  className?: string;
  id?: string;
}

/** Counts from the previously shown value to `value`, writing straight to the DOM (no re-renders). */
export function AnimatedNumber({ value, format, className, id }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = format(shown.current);
    const controls = animate(shown.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = format(v);
      },
      onComplete: () => {
        shown.current = value;
        el.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [value, format]);

  return <span ref={ref} className={className} id={id} />;
}
