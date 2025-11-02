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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)}
          labelFormatter={(label) => {
            const item = chartData.find(d => d.name === label);
            return item ? `${label}: ${item.institution}` : label;
          }}
        />
        <Legend />
        <Bar dataKey="value" fill="#18181b" name={metricLabels[metric]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

