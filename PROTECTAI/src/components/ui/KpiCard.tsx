import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' | 'flat' };
  tone?: 'default' | 'cyan' | 'emerald' | 'amber' | 'red' | 'violet' | 'sky' | 'indigo';
  footnote?: ReactNode;
  className?: string;
}

const toneRing: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'from-zinc-500/0 via-zinc-500/10 to-zinc-500/0 text-zinc-300',
  cyan: 'from-cyan-500/0 via-cyan-500/15 to-cyan-500/0 text-cyan-300',
  emerald: 'from-emerald-500/0 via-emerald-500/15 to-emerald-500/0 text-emerald-300',
  amber: 'from-amber-500/0 via-amber-500/15 to-amber-500/0 text-amber-300',
  red: 'from-red-500/0 via-red-500/15 to-red-500/0 text-red-300',
  violet: 'from-violet-500/0 via-violet-500/15 to-violet-500/0 text-violet-300',
  sky: 'from-sky-500/0 via-sky-500/15 to-sky-500/0 text-sky-300',
  indigo: 'from-indigo-500/0 via-indigo-500/15 to-indigo-500/0 text-indigo-300',
};

const toneIconBg: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-300',
  cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  red: 'bg-red-500/10 border-red-500/30 text-red-300',
  violet: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
  sky: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
  indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
};

export default function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  tone = 'cyan',
  footnote,
  className = '',
}: KpiCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 p-5 backdrop-blur ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneRing[tone]} opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${toneIconBg[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>

      <div className="relative mt-5 flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tracking-tight text-zinc-50">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-zinc-500">{unit}</span>}
      </div>

      <div className="relative mt-3 flex items-center justify-between gap-2 text-xs">
        <div className="text-zinc-500">{footnote}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 font-mono text-[11px] font-medium ${
              trend.direction === 'up'
                ? 'text-emerald-400'
                : trend.direction === 'down'
                ? 'text-red-400'
                : 'text-zinc-400'
            }`}
          >
            <span>
              {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '◆'}{' '}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}