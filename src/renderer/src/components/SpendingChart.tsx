import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../lib/stats';
import { compactMoney, formatMoney } from '../lib/format';

interface Props {
  points: ChartPoint[];
  currency: string;
  monthShort: string;
}

const AXIS_TICK = { fill: '#5e6480', fontSize: 11, fontWeight: 600 };

function PulseDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return <g />;
  return (
    <g>
      <circle className="pulse" cx={cx} cy={cy} r={6} fill="#22d3ee" />
      <circle cx={cx} cy={cy} r={5.5} fill="#fff" stroke="#22d3ee" strokeWidth={3} />
    </g>
  );
}

export function SpendingChart({ points, currency, monthShort }: Props) {
  const dim = points.length;
  const hasData = points.some((p) => (p.cur ?? 0) > 0 || p.prev > 0);
  const last = points.filter((p) => p.cur !== null).at(-1);

  return (
    <div className="chart" data-testid="spending-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="et-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8b5cf6" stopOpacity={0.5} />
              <stop offset="0.6" stopColor="#6366f1" stopOpacity={0.12} />
              <stop offset="1" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            {/* userSpaceOnUse keeps the gradient visible even when the line is perfectly flat */}
            <linearGradient id="et-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0" stopColor="#c4b5fd" />
              <stop offset="0.5" stopColor="#818cf8" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {hasData && <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" strokeDasharray="2 6" />}
          <XAxis
            dataKey="day"
            type="number"
            domain={[1, dim]}
            ticks={[1, 8, 15, 22, dim]}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            tickMargin={8}
          />
          <YAxis
            orientation="right"
            hide={!hasData}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            width={56}
            tickCount={5}
            domain={[0, (max: number) => Math.max(1, max * 1.12)]}
            tickFormatter={(v: number) => compactMoney(v, currency)}
          />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'rgba(255,255,255,.3)', strokeDasharray: '3 4' }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as ChartPoint | undefined;
              if (!active || !p) return null;
              return (
                <div className="tip">
                  <b>
                    {monthShort} {p.day}
                  </b>
                  {p.cur !== null ? (
                    <>
                      <span className="v">{formatMoney(p.cur, currency)}</span>
                      <span className="m">{formatMoney(p.daily, currency)} spent that day</span>
                      <span className="m">Last month: {formatMoney(p.prev, currency)}</span>
                    </>
                  ) : (
                    <span className="m">Last month by now: {formatMoney(p.prev, currency)}</span>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="prev"
            stroke="rgba(255,255,255,.25)"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            fill="none"
            dot={false}
            activeDot={{ r: 4, fill: 'rgba(255,255,255,.5)', stroke: 'none' }}
            isAnimationActive={false}
          />
          <Area
            className="cur-series"
            type="monotone"
            dataKey="cur"
            stroke="url(#et-line)"
            strokeWidth={3.2}
            fill="url(#et-area)"
            dot={false}
            activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          {last && last.cur !== null && (
            <ReferenceDot x={last.day} y={last.cur} ifOverflow="visible" shape={PulseDot} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
