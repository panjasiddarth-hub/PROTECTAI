interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}

// Tiny inline sparkline — pure SVG, no chart library. Useful for KPI cards.
export default function Sparkline({
  data,
  height = 32,
  width = 120,
  stroke = '#22d3ee',
  fill = 'rgba(34,211,238,0.15)',
  className = '',
}: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const area = `${0},${height} ${points} ${(data.length - 1) * step},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <polyline points={area} fill={fill} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}