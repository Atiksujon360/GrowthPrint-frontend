'use client';

/**
 * GrowthPrint chart presets (COMPREO language): one palette, quiet axes, no decorative colour.
 * Recharts is heavy, so screens import these through next/dynamic (see components/charts/index.ts).
 * Every chart receives already-computed real data; nothing here invents values.
 */
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';

// Brand palette that reads on both light and dark surfaces (Recharts SVG attrs can't use var()).
// Axis/grid/label colours are bridged to gp tokens via CSS in globals.css (.gp-app .recharts-*).
export const CHART_COLORS = ['#FF572E', '#FF8050', '#A85B32', '#6E4B5E', '#988B97'] as const;
const AXIS = { fontSize: 12, fill: '#8A7F88' };
const GRID = '#e8e0da';
const TOOLTIP = {
  backgroundColor: 'var(--gp-surface)', color: 'var(--gp-text)',
  borderRadius: '10px', border: '1px solid var(--gp-border)', fontSize: '13px',
  boxShadow: '0 12px 32px -12px rgb(0 0 0 / 0.35)',
};
const CURSOR = { fill: 'rgba(128, 116, 110, 0.08)' };

export interface Point { label: string; value: number }

export function AreaTrend({ data, valueLabel }: { data: Point[]; valueLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF572E" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#FF572E" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: unknown) => [String(v), valueLabel]} />
        <Area type="linear" dataKey="value" stroke="#FF572E" strokeWidth={2.4} fill="url(#gp-area)"
          dot={{ r: 4, fill: 'var(--gp-surface)', stroke: '#FF572E', strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Donut with the total in the centre and an accessible legend list (label, share, value). */
export function DonutBreakdown({ data, centerLabel, format = String }: {
  data: Point[]; centerLabel: string; format?: (n: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[160px_1fr] xl:grid-cols-1 2xl:grid-cols-[160px_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={76} paddingAngle={1.5} stroke="none" isAnimationActive={false}>
              {data.map((d, i) => <Cell key={d.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP} formatter={(v: unknown, n: unknown) => [format(Number(v)), String(n)]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.7rem] text-gp-text-secondary">{centerLabel}</span>
          <span className="text-base font-bold tabular-nums text-gp-text">{format(total)}</span>
        </div>
      </div>
      <ul className="space-y-2.5 text-[0.8125rem]">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-gp-text">{d.label}</span>
            <span className="font-semibold tabular-nums text-gp-text">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HorizontalBars({ data, valueLabel }: { data: Point[]; valueLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={118} tick={{ ...AXIS }} axisLine={false} tickLine={false} />
        <Tooltip cursor={CURSOR} contentStyle={TOOLTIP} formatter={(v: unknown) => [String(v), valueLabel]} />
        <Bar dataKey="value" fill="#FF572E" radius={[3, 3, 3, 3]} maxBarSize={20}
          label={{ position: 'right', fill: '#B83A0C', fontSize: 12, fontWeight: 600 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GroupedBars({ data, aLabel, bLabel }: { data: Array<{ label: string; a: number; b: number }>; aLabel: string; bLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={3}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip cursor={CURSOR} contentStyle={TOOLTIP} />
        <Bar dataKey="a" name={aLabel} fill="#FF572E" radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar dataKey="b" name={bLabel} fill="#C9B8AE" radius={[3, 3, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Bars for one series with a line for another (e.g. invoiced vs collected), money axis. */
export function ComboBarLine({ data, barLabel, lineLabel }: {
  data: Array<{ label: string; bar: number; line: number }>; barLabel: string; lineLabel: string;
}) {
  const money = (v: number) => `$${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={money} />
        <Tooltip cursor={CURSOR} contentStyle={TOOLTIP}
          formatter={(v: unknown, n: unknown) => [`$${Number(v).toLocaleString()}`, String(n)]} />
        <Bar dataKey="bar" name={barLabel} fill="rgba(255, 87, 46, 0.16)" stroke="#FF572E" strokeWidth={1.5} radius={[3, 3, 0, 0]} maxBarSize={34} />
        <Line dataKey="line" name={lineLabel} stroke="#FF572E" strokeWidth={2.6} dot={{ r: 3.5, fill: 'var(--gp-surface)', stroke: '#FF572E', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
