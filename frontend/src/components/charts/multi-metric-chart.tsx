/**
 * Multi-Metric Comparison Chart
 * Shows multiple metrics for each scenario in a grouped bar chart
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { ScenarioComparison } from '@/types/api';

interface MultiMetricChartProps {
  comparisons: ScenarioComparison[];
  metrics: Array<{
    key: keyof NonNullable<ScenarioComparison['kpis']>;
    label: string;
    color: string;
    formatter?: (value: number) => string;
  }>;
  height?: number;
}

export function MultiMetricChart({ comparisons, metrics, height = 350 }: MultiMetricChartProps) {
  const chartData = comparisons.map((comp, idx) => {
    const dataPoint: any = {
      name: `S${idx + 1}`,
      fullName: `Scenario ${idx + 1}`,
      institution: comp.institution_name.substring(0, 25),
    };

    metrics.forEach(metric => {
      if (comp.kpis && comp.kpis[metric.key] !== null && comp.kpis[metric.key] !== undefined) {
        dataPoint[metric.key] = comp.kpis[metric.key];
      } else {
        dataPoint[metric.key] = 0;
      }
    });

    return dataPoint;
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
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: any, name: string) => {
            const metric = metrics.find(m => m.key === name);
            if (metric && metric.formatter) {
              return [metric.formatter(value as number), metric.label];
            }
            return [value, name];
          }}
          labelFormatter={(label) => {
            const item = chartData.find(d => d.name === label);
            return item ? `${item.fullName}: ${item.institution}` : label;
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => {
            const metric = metrics.find(m => m.key === value);
            return metric ? metric.label : value;
          }}
        />
        {metrics.map((metric, idx) => (
          <Bar
            key={metric.key}
            dataKey={metric.key}
            fill={metric.color}
            radius={idx === metrics.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
            name={metric.label}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

