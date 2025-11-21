/**
 * Cost Breakdown Chart
 * Bar chart showing cost components
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
    { name: 'Tuition & Fees', value: data.tuition, fill: '#3b82f6' }, // blue-500
    { name: 'Housing', value: data.housing, fill: '#8b5cf6' }, // violet-500
    { name: 'Other Expenses', value: data.other, fill: '#06b6d4' }, // cyan-500
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} stroke="#64748b" />
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="value" name="Cost" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

