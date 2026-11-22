'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { CashFlowPoint } from '../../../lib/dashboardMetrics.ts';

/**
 * Cash collected vs invoiced, by month. Loaded with next/dynamic from the dashboard so Recharts is not in the
 * initial bundle. Brand palette: coral for collected, soft neutral for invoiced; axes/grid/tooltip pick up
 * gp tokens via the .gp-app .recharts-* bridge in globals.css.
 */
const AXIS = { fontSize: 12, fill: '#8A7F88' };
const TOOLTIP = {
  backgroundColor: 'var(--gp-surface)', color: 'var(--gp-text)',
  borderRadius: '10px', border: '1px solid var(--gp-border)', fontSize: '13px',
  boxShadow: '0 12px 32px -12px rgb(0 0 0 / 0.35)',
};

export default function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="#e8e0da" vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip cursor={{ fill: 'rgba(128, 116, 110, 0.08)' }}
          formatter={(val: unknown, name: unknown) => [`$${Number(val).toLocaleString()}`, String(name)]}
          contentStyle={TOOLTIP} />
        <Bar dataKey="collected" name="Collected" fill="#FF572E" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="invoiced" name="Invoiced" fill="#D8CFC9" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
