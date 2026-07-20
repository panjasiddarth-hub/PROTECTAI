import { useId } from 'react';

interface RiskMeterProps {
  value: number; // 0..100
  size?: number;
  label?: string;
  caption?: string;
  tone?: 'cyan' | 'amber' | 'red' | 'emerald';
}

const toneStops: Record<NonNullable<RiskMeterProps['tone']>, [string, string, string]> = {
  emerald: ['#10b981', '#34d399', '#064e3b'],
  cyan: ['#22d3ee', '#67e8f9', '#083344'],
  amber: ['#f59e0b', '#fbbf24', '#451a03'],
  red: ['#ef4444', '#f87171', '#450a0a'],
};

export default function RiskMeter({
  value,
  size = 160,
  label = 'Plant Risk Index',
  caption,
  tone,
}: RiskMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const t = tone ?? (clamped >= 70 ? 'red' : clamped >= 40 ? 'amber' : clamped >= 20 ? 'cyan' : 'emerald');
  const [stroke, glow, dark] = toneStops[t];
  const id = useId().replace(/:/g, '');

  // Half-circle gauge: 180deg arc, starting at 180deg (left), ending at 360deg (right)
  const radius = 70;
  const strokeWidth = 12;
  const center = 80;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size / 2 + 24}
        viewBox="0 0 160 100"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`risk-grad-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={glow} />
            <stop offset="100%" stopColor={stroke} />
          </linearGradient>
          <filter id={`risk-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* track */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          stroke={dark}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* filled arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          stroke={`url(#risk-grad-${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          filter={`url(#risk-glow-${id})`}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)' }}
        />

        {/* tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = Math.PI - (i / 10) * Math.PI;
          const x1 = center + Math.cos(angle) * (radius - 18);
          const y1 = center - Math.sin(angle) * (radius - 18);
          const x2 = center + Math.cos(angle) * (radius - 24);
          const y2 = center - Math.sin(angle) * (radius - 24);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3f3f46"
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="-mt-3 flex flex-col items-center">
        <div className="font-mono text-3xl font-semibold text-zinc-50">{Math.round(clamped)}</div>
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
        {caption && <div className="mt-1 text-xs text-zinc-400">{caption}</div>}
      </div>
    </div>
  );
}