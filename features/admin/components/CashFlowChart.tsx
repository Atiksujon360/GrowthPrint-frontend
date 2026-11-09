'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { CashFlowPoint } from '../../../lib/dashboardMetrics.ts';

/**
 * Cash collected vs invoiced, by month. Loaded with next/dynamic from the dashboard so Recharts is not in the
 * initial bundle. Restrained palette: primary blue for collected, neutral grey for invoiced.
 */
export default function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="#eef1f5" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#667085' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip cursor={{ fill: '#f5f7fa' }}
          formatter={(val: unknown, name: unknown) => [`$${Number(val).toLocaleString()}`, String(name)]}
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e9f0', fontSize: '13px' }} />
        <Bar dataKey="collected" name="Collected" fill="#3569c8" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="invoiced" name="Invoiced" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
