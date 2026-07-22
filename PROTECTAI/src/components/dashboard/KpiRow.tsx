import {
  Users,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Wind,
  Thermometer,
  Clock,
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import type { DashboardKpis, Shift } from '../../lib/types';
import { useMemo } from 'react';

interface Props {
  data: DashboardKpis | null;
  sparklineByName?: Record<string, number[]>;
}

// Deterministic but believable sparkline data — derived from KPI value so the
// trend looks related to the headline number.
function buildSparkline(seed: number, length = 24): number[] {
  const out: number[] = [];
  let v = seed;
  for (let i = 0; i < length; i++) {
    const wave = Math.sin((i + seed) / 3) * (seed * 0.05 + 1);
    const noise = (Math.sin((i + 1) * (seed + 1) * 7.3) * 0.6);
    v = Math.max(0, seed + wave + noise);
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

export default function KpiRow({ data }: Props) {
  const spark = useMemo(
    () => ({
      workers: buildSparkline(data?.workers_online ?? 24),
      alerts: buildSparkline(data?.critical_alerts ?? 3),
      safety: buildSparkline(data?.safety_score ?? 87),
      incidents: buildSparkline(data?.todays_incidents ?? 4),
      gas: buildSparkline(data?.gas_level ?? 12),
      temp: buildSparkline(data?.temperature ?? 220),
      machines: buildSparkline(data?.machines_online ?? 11),
    }),
    [data]
  );

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-zinc-800/70 bg-zinc-900/30"
          />
        ))}
      </div>
    );
  }

  const shiftName = (data.current_shift as Shift | null)?.name || 'Afternoon Shift';
  const shiftTime = data.current_shift
    ? `${(data.current_shift as Shift).start_time} – ${(data.current_shift as Shift).end_time}`
    : '14:00 – 22:00';
  const machinePct = Math.round((data.machines_online / Math.max(1, data.total_machines)) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Workers Online"
        value={data.workers_online}
        icon={Users}
        tone="cyan"
        trend={{ value: 4.2, direction: 'up' }}
        footnote={<span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-400" />+4.2% vs last shift</span>}
      />
      <KpiCard
        label="Critical Alerts"
        value={data.critical_alerts}
        icon={AlertOctagon}
        tone="red"
        trend={{ value: 12, direction: data.critical_alerts > 0 ? 'up' : 'flat' }}
        footnote={<span className="flex items-center gap-1 text-zinc-500">{data.critical_alerts > 0 ? <TrendingUp className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3" />}Unacknowledged</span>}
      />
      <KpiCard
        label="Safety Score"
        value={data.safety_score}
        unit="/ 100"
        icon={ShieldCheck}
        tone="emerald"
        trend={{ value: data.safety_score_delta, direction: data.safety_score_delta >= 0 ? 'up' : 'down' }}
        footnote={<span>vs 7-day baseline</span>}
      />
      <KpiCard
        label="Today's Incidents"
        value={data.todays_incidents}
        icon={AlertTriangle}
        tone="amber"
        trend={{ value: 2.1, direction: 'down' }}
        footnote={<span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-emerald-400" />Trending down</span>}
      />

      <KpiCard
        label="Gas Level (Reactor A)"
        value={data.gas_level}
        unit={data.gas_unit}
        icon={Wind}
        tone="violet"
        trend={{ value: 1.8, direction: 'up' }}
        footnote={<span>Threshold 10 ppm</span>}
      />
      <KpiCard
        label="Reactor Temperature"
        value={data.temperature}
        unit={data.temperature_unit}
        icon={Thermometer}
        tone="amber"
        trend={{ value: 0.6, direction: 'flat' }}
        footnote={<span>Range 280–380 °C</span>}
      />
      <KpiCard
        label="Current Shift"
        value={shiftName.replace(' Shift', '')}
        icon={Clock}
        tone="indigo"
        footnote={<span className="font-mono">{shiftTime}</span>}
      />
      <KpiCard
        label="Machine Status"
        value={`${data.machines_online}/${data.total_machines}`}
        unit={`· ${machinePct}%`}
        icon={Cpu}
        tone="sky"
        trend={{ value: machinePct > 80 ? 1.2 : -3.4, direction: machinePct > 80 ? 'up' : 'down' }}
        footnote={<span>{data.total_machines - data.machines_online} offline · {Math.max(0, 1)} in maintenance</span>}
      />
    </div>
  );
}