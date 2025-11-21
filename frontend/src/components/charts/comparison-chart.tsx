/**
 * Comparison Chart
 * Grouped bar chart for comparing scenarios
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { ScenarioComparison } from '@/types/api';

interface ComparisonChartProps {
  comparisons: ScenarioComparison[];
  metric: 'cost' | 'debt' | 'earnings';
}

export function ComparisonChart({ comparisons, metric }: ComparisonChartProps) {
  const chartData = comparisons.map((comp, idx) => {
    let value = 0;
    
    if (comp.kpis) {
      if (metric === 'cost') {
        value = comp.kpis.true_yearly_cost;
      } else if (metric === 'debt') {
        value = comp.kpis.expected_debt_at_grad;
      } else if (metric === 'earnings') {
        value = comp.kpis.earnings_year_1 || 0;
      }
    }

    return {
      name: `Scenario ${idx + 1}`,
      institution: comp.institution_name.substring(0, 20),
      value,
    };
  });

  const metricLabels = {
    cost: 'Yearly Cost',
    debt: 'Expected Debt',
    earnings: 'Year 1 Earnings',
  };

  const getBarColor = () => {
    switch (metric) {
      case 'cost':
        return '#3b82f6'; // blue-500
      case 'debt':
        return '#ef4444'; // red-500
      case 'earnings':
        return '#10b981'; // green-500
      default:
        return '#6366f1'; // indigo-500
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} stroke="#64748b" />
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)}
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
        <Bar dataKey="value" fill={getBarColor()} name={metricLabels[metric]} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

