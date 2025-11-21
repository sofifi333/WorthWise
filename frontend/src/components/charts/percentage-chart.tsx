/**
 * Percentage Comparison Chart
 * Bar chart for percentage-based metrics (rates, ratios, etc.)
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatPercent } from '@/lib/utils';
import type { ScenarioComparison } from '@/types/api';

interface PercentageChartProps {
  comparisons: ScenarioComparison[];
  metricKey: keyof NonNullable<ScenarioComparison['kpis']>;
  metricLabel: string;
  colors?: string[];
  height?: number;
}

export function PercentageChart({ 
  comparisons, 
  metricKey, 
  metricLabel,
  colors = ['#3b82f6', '#10b981', '#a855f7', '#f97316'],
  height = 300 
}: PercentageChartProps) {
  const chartData = comparisons.map((comp, idx) => {
    let value = 0;
    
    if (comp.kpis && comp.kpis[metricKey] !== null && comp.kpis[metricKey] !== undefined) {
      value = comp.kpis[metricKey] as number;
    }

    return {
      name: `Scenario ${idx + 1}`,
      institution: comp.institution_name.substring(0, 20),
      value: value * 100, // Convert to percentage
      color: colors[idx % colors.length],
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          tickFormatter={(value) => `${value.toFixed(0)}%`} 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          formatter={(value) => `${(value as number).toFixed(1)}%`}
          labelFormatter={(label) => {
            const item = chartData.find(d => d.name === label);
            return item ? `${label}: ${item.institution}` : label;
          }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="value" name={metricLabel} radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

