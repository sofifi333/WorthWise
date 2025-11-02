/**
 * Earnings Chart
 * Line chart showing earnings progression
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface EarningsChartProps {
  data: {
    year1: number | null;
    year3: number | null;
    year5: number | null;
  };
}

export function EarningsChart({ data }: EarningsChartProps) {
  const chartData = [
    { year: 'Year 1', earnings: data.year1 || 0 },
    { year: 'Year 3', earnings: data.year3 || 0 },
    { year: 'Year 5', earnings: data.year5 || 0 },
  ].filter(d => d.earnings > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-500">
        No earnings data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Legend />
        <Line type="monotone" dataKey="earnings" stroke="#18181b" strokeWidth={2} name="Earnings" />
      </LineChart>
    </ResponsiveContainer>
  );
}

