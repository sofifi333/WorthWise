/**
 * Cost Breakdown Chart
 * Bar chart showing cost components
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CostBreakdownChartProps {
  data: {
    tuition: number;
    housing: number;
    other: number;
  };
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const chartData = [
    { name: 'Tuition & Fees', value: data.tuition },
    { name: 'Housing', value: data.housing },
    { name: 'Other Expenses', value: data.other },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Legend />
        <Bar dataKey="value" fill="#18181b" name="Cost" />
      </BarChart>
    </ResponsiveContainer>
  );
}

