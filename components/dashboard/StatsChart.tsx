'use client';

interface StatsChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  maxItems?: number;
}

export function StatsChart({ data, title, maxItems = 10 }: StatsChartProps) {
  const displayData = data.slice(0, maxItems);
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {displayData.length === 0 ? (
          <p className="text-slate-500 text-sm">No data available</p>
        ) : (
          displayData.map((item, index) => (
            <div key={index} className="space-y-2" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium truncate">{item.label || 'Unknown'}</span>
                <span className="text-slate-900 font-bold">{item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(item.value / maxValue) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

