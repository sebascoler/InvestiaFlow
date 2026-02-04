import React from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  maxValue?: number;
  showValues?: boolean;
  height?: number;
  className?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  maxValue,
  showValues = false,
  height = 200,
  className = '',
  color = '#3b82f6',
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  const width = 100; // porcentaje
  const step = width / (data.length - 1 || 1);
  
  // Generar puntos para el path SVG
  const points = data.map((item, index) => {
    const x = index * step;
    const y = height - (item.value / max) * height;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  
  // Área debajo de la línea
  const areaPath = `M 0,${height} L ${pathData.substring(2)} L ${width * (data.length - 1)},${height} Z`;
  
  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Área sombreada */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity="0.1"
        />
        {/* Línea */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Puntos */}
        {data.map((item, index) => {
          const x = index * step;
          const y = height - (item.value / max) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="hover:r-4 transition-all"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {showValues && (
              <span className="text-xs font-medium text-gray-700">{item.value}</span>
            )}
            <span className="text-xs text-gray-500 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
