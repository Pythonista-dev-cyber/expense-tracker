import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface Props {
  className: string;
  index: number;
  children: ReactNode;
}

export function Card({ className, index, children }: Props) {
  return (
    <motion.article
      className={`card ${className}`}
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.08 * index, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.article>
  );
}
