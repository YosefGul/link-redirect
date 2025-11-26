'use client';

interface TimeSeriesData {
  label: string | number;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  maxItems?: number;
}

export function TimeSeriesChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  maxItems = 50,
}: TimeSeriesChartProps) {
  const displayData = data.slice(0, maxItems);
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);
  const minValue = Math.min(...displayData.map((d) => d.value), 0);

  // Calculate chart dimensions
  const chartHeight = 200;
  const chartWidth = 100;
  const barWidth = Math.max(2, chartWidth / displayData.length - 1);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {xAxisLabel && (
        <p className="text-sm text-slate-500 mb-4">{xAxisLabel}</p>
      )}
      
      {displayData.length === 0 ? (
        <p className="text-slate-500 text-sm">No data available</p>
      ) : (
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            <svg
              width="100%"
              height={chartHeight}
              className="overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Data line */}
              <polyline
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                points={displayData
                  .map(
                    (item, index) =>
                      `${(index / (displayData.length - 1 || 1)) * chartWidth},${
                        chartHeight -
                        ((item.value - minValue) / (maxValue - minValue || 1)) *
                          chartHeight
                      }`
                  )
                  .join(' ')}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            {displayData.length > 0 && (
              <>
                <span>{displayData[0].label}</span>
                {displayData.length > 1 && (
                  <span>{displayData[displayData.length - 1].label}</span>
                )}
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">Min</p>
              <p className="text-sm font-semibold text-slate-900">{minValue}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Max</p>
              <p className="text-sm font-semibold text-slate-900">{maxValue}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-sm font-semibold text-slate-900">
                {displayData.reduce((sum, d) => sum + d.value, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


