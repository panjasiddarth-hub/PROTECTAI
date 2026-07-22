import { useId } from 'react';

interface SeriesPoint {
  x: string | number;
  y: number;
}

interface TrendChartProps {
  data: SeriesPoint[];
  height?: number;
  stroke?: string;
  fill?: string;
  showAxes?: boolean;
  yAxisFormatter?: (v: number) => string;
  xAxisFormatter?: (v: string | number) => string;
  yTicks?: number;
}

// Lightweight area/line chart built with SVG. Avoids the overhead of a chart
// library while delivering the same enterprise look-and-feel.
export default function TrendChart({
  data,
  height = 200,
  stroke = '#22d3ee',
  fill = 'rgba(34,211,238,0.12)',
  showAxes = true,
  yAxisFormatter = (v) => String(Math.round(v)),
  xAxisFormatter = (v) => String(v),
  yTicks = 4,
}: TrendChartProps) {
  const id = useId().replace(/:/g, '');
  const padding = { top: 12, right: 12, bottom: 24, left: 36 };
  const width = 720;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  if (!data.length) return null;

  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const stepX = innerW / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + innerH - ((d.y - min) / range) * innerH;
    return { x, y, raw: d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    `M ${padding.left} ${padding.top + innerH} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${padding.left + (data.length - 1) * stepX} ${padding.top + innerH} Z`;

  const yValues = Array.from({ length: yTicks + 1 }).map((_, i) => max - (range * i) / yTicks);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`tc-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <pattern id={`tc-grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(63,63,70,0.25)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* background grid */}
      <rect
        x={padding.left}
        y={padding.top}
        width={innerW}
        height={innerH}
        fill={`url(#tc-grid-${id})`}
        opacity="0.5"
      />

      {/* Y axis */}
      {showAxes &&
        yValues.map((v, i) => {
          const y = padding.top + (innerH * i) / yTicks;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={y}
                y2={y}
                stroke="rgba(63,63,70,0.35)"
                strokeDasharray="2 3"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fontSize="9"
                fill="#52525b"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {yAxisFormatter(v)}
              </text>
            </g>
          );
        })}

      {/* X axis labels */}
      {showAxes &&
        points.map((p, i) => {
          // show every Nth label
          const stride = Math.ceil(points.length / 6);
          if (i % stride !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={padding.top + innerH + 14}
              fontSize="9"
              fill="#52525b"
              textAnchor="middle"
              fontFamily="JetBrains Mono"
            >
              {xAxisFormatter(p.raw.x)}
            </text>
          );
        })}

      {/* Area + line */}
      <path d={areaPath} fill={`url(#tc-grad-${id})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />

      {/* Highlight last point */}
      {points.length > 0 && (
        <g>
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={stroke} />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="9" fill={stroke} opacity="0.18" />
        </g>
      )}
    </svg>
  );
}