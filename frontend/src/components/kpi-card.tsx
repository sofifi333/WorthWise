/**
 * KPI Card Component
 * Display key performance indicators with formatted values
 */

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function KPICard({ title, value, description, trend, className }: KPICardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn('text-2xl font-bold', {
            'text-green-600': trend === 'positive',
            'text-red-600': trend === 'negative',
            'text-zinc-900': trend === 'neutral' || !trend,
          })}
        >
          {value}
        </div>
        {description && (
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

