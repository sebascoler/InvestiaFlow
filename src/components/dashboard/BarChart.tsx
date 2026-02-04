import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
  showValues?: boolean;
  height?: number;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  showValues = true,
  height = 200,
  className = '',
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className={`${className}`}>
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          const barHeight = (percentage / 100) * height;
          
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end"
              style={{ height: '100%' }}
            >
              {showValues && (
                <span className="text-xs font-medium text-gray-700 mb-1">
                  {item.value}
                </span>
              )}
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  item.color || 'bg-primary-500'
                } hover:opacity-80`}
                style={{ height: `${barHeight}px`, minHeight: item.value > 0 ? '4px' : '0' }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-gray-600 mt-2 text-center leading-tight">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
