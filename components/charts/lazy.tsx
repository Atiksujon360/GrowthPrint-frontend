'use client';

/**
 * Lazily loaded chart presets: Recharts stays out of the initial bundle (React best practice
 * bundle-dynamic-imports). The placeholder matches the chart box so the layout does not shift.
 */
import dynamic from 'next/dynamic';

const Placeholder = () => <div className="h-full w-full animate-pulse rounded-gp-control bg-gp-canvas" aria-hidden="true" />;

export const AreaTrend = dynamic(() => import('./GpCharts.tsx').then(m => m.AreaTrend), { ssr: false, loading: Placeholder });
export const DonutBreakdown = dynamic(() => import('./GpCharts.tsx').then(m => m.DonutBreakdown), { ssr: false, loading: Placeholder });
export const HorizontalBars = dynamic(() => import('./GpCharts.tsx').then(m => m.HorizontalBars), { ssr: false, loading: Placeholder });
export const GroupedBars = dynamic(() => import('./GpCharts.tsx').then(m => m.GroupedBars), { ssr: false, loading: Placeholder });
export const ComboBarLine = dynamic(() => import('./GpCharts.tsx').then(m => m.ComboBarLine), { ssr: false, loading: Placeholder });
