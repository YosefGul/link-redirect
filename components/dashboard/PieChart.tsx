'use client';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  maxItems?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
];

export function PieChart({ data, title, maxItems = 10 }: PieChartProps) {
  const displayData = data.slice(0, maxItems);
  const total = displayData.reduce((sum, item) => sum + item.value, 0);

  if (displayData.length === 0 || total === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
        <p className="text-slate-500 text-sm">No data available</p>
      </div>
    );
  }

  // Calculate angles for pie chart
  let currentAngle = -90; // Start from top
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const segments = displayData.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path for pie slice
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    return {
      ...item,
      pathData,
      percentage,
      color,
    };
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Pie Chart SVG */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {segment.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {segment.value.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


