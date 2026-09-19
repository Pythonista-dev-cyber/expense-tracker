import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cell, Pie, PieChart } from 'recharts';
import type { Category } from '@shared/constants';
import type { CategoryTotal } from '../lib/stats';
import { CATEGORY_META } from '../lib/categories';
import { compactMoney, formatMoney } from '../lib/format';
import { Card } from './Card';
import '../styles/donut.css';

interface Props {
  byCategory: CategoryTotal[];
  total: number;
  currency: string;
  /** Changes when the month changes, to replay the entry animation. */
  animationKey: string;
}

const SIZE = 210;
const TRACK = [{ value: 1 }];

export function CategoryDonut({ byCategory, total, currency, animationKey }: Props) {
  const [hovered, setHovered] = useState<Category | null>(null);
  const focus = hovered ? byCategory.find((c) => c.category === hovered) : undefined;
  const top = byCategory[0]?.amount ?? 1;

  return (
    <Card className="donut-card" index={1}>
      <p className="label">Where it went</p>
      <div className="donut-wrap">
        <PieChart width={SIZE} height={SIZE} key={animationKey}>
          <Pie
            data={TRACK}
            dataKey="value"
            innerRadius={70}
            outerRadius={90}
            fill="rgba(255,255,255,.06)"
            stroke="none"
            isAnimationActive={false}
          />
          {byCategory.length > 0 && (
            <Pie
              data={byCategory}
              dataKey="amount"
              nameKey="category"
              innerRadius={70}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              paddingAngle={byCategory.length > 1 ? 3 : 0}
              cornerRadius={5}
              stroke="none"
              animationDuration={900}
              onMouseEnter={(_, index) => setHovered(byCategory[index]?.category ?? null)}
              onMouseLeave={() => setHovered(null)}
            >
              {byCategory.map(({ category }) => {
                const { color } = CATEGORY_META[category];
                return (
                  <Cell
                    key={category}
                    fill={color}
                    style={{
                      filter: `drop-shadow(0 0 8px ${color}99)`,
                      opacity: hovered && hovered !== category ? 0.3 : 1,
                      transition: 'opacity .25s',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Pie>
          )}
        </PieChart>
        <div className="donut-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={focus?.category ?? 'total'}
              className="donut-center-inner"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
            >
              <span className="donut-label">
                {focus ? `${CATEGORY_META[focus.category].emoji} ${focus.category}` : 'Total spent'}
              </span>
              <span className="donut-val">{formatMoney(focus ? focus.amount : total, currency)}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ul className="legend" key={animationKey}>
        {byCategory.length === 0 && <li className="none">Nothing spent yet this month</li>}
        {byCategory.map(({ category, amount, share }, i) => {
          const meta = CATEGORY_META[category];
          return (
            <li
              key={category}
              className={hovered === category ? 'on' : undefined}
              onMouseEnter={() => setHovered(category)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="em">{meta.emoji}</span>
              <span>{category}</span>
              <span className="pct">{(share * 100).toFixed(0)}%</span>
              <span className="amt">{compactMoney(amount, currency)}</span>
              <span className="bar">
                <motion.i
                  style={{ background: meta.color, width: `${(amount / top) * 100}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.05 * i, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
