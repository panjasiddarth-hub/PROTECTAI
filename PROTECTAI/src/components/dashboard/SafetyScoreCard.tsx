import { useMemo } from 'react';
import { ShieldCheck, Award, BadgeCheck } from 'lucide-react';
import Sparkline from '../ui/Sparkline';

interface Props {
  score: number;
  delta: number;
  compliance: number;
}

// Safety score card — combines gauge, sparkline, compliance pillar
export default function SafetyScoreCard({ score, delta, compliance }: Props) {
  const sparkData = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 24; i++) {
      const v = score + Math.sin(i / 2.5) * 4 + Math.sin(i * 1.7) * 2;
      out.push(Number(v.toFixed(1)));
    }
    return out;
  }, [score]);

  return (
    <div className="surface-glass relative overflow-hidden rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Composite Safety Score
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Weighted across incidents, sensors, workers and compliance.
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 flex items-end gap-5">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-5xl font-semibold text-zinc-50">{score}</span>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
          <div
            className={`mt-1 font-mono text-[11px] ${
              delta >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs 7-day baseline
          </div>
        </div>
        <div className="ml-auto">
          <Sparkline
            data={sparkData}
            width={180}
            height={50}
            stroke="#10b981"
            fill="rgba(16,185,129,0.15)"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-800/70 pt-4">
        <SubMetric icon={Award} label="Incidents" value="A+" />
        <SubMetric icon={BadgeCheck} label="Compliance" value={`${compliance}%`} />
        <SubMetric icon={ShieldCheck} label="Audits" value="Pass" />
      </div>
    </div>
  );
}

function SubMetric({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10.5px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-1 font-mono text-base font-medium text-zinc-100">{value}</p>
    </div>
  );
}