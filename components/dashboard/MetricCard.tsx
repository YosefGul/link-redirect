'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className = '' }: MetricCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className={`bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{formattedValue}</p>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}


