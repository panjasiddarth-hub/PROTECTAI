import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Triangle,
  PieChart as PieIcon,
  Sparkles,
  Download,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import SectionTitle from '../components/ui/SectionTitle';
import TrendChart from '../components/ui/TrendChart';
import BarList from '../components/ui/BarList';
import type { AnalyticsResponse, Incident } from '../lib/types';
import { api } from '../lib/api';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<AnalyticsResponse>('/analytics'),
      api.get<Incident[]>('/incidents'),
    ]).then(([a, i]) => {
      setData(a);
      setIncidents(i);
    });
  }, []);

  if (!data || !incidents) return <LoadingState label="Loading analytics" rows={8} />;

  const maxByDay = Math.max(1, ...data.by_day.map((d) => d.count));
  const maxByZone = Math.max(1, ...data.by_zone.map((d) => d.count));
  const maxByType = Math.max(1, ...data.by_type.map((d) => d.count));

  // Heatmap matrix: zones × last 14 days
  const days = data.by_day.slice(-14);
  const zoneNames = Array.from(new Set(data.by_zone.map((d) => d.zone)));
  const heatmap = zoneNames.map((zone) => ({
    zone,
    counts: days.map(
      (day) => incidents.filter((i) => i.zone === zone && i.occurred_at?.slice(0, 10) === day.date).length
    ),
  }));
  const heatMax = Math.max(1, ...heatmap.flatMap((h) => h.counts));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep insights into incident trends, zone exposure and operational risk posture."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            {data.total_incidents} incidents analysed · last 14 days
          </span>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiPanel icon={Activity} label="Total incidents" value={data.total_incidents} sub="14 days" />
        <KpiPanel icon={TrendingUp} label="Peak day" value={Math.max(...data.by_day.map((d) => d.count))} sub={`Avg ${(data.total_incidents / 14).toFixed(1)} / day`} />
        <KpiPanel
          icon={Triangle}
          label="Critical share"
          value={`${Math.round(((data.by_severity.find((s) => s.severity === 'critical')?.count ?? 0) / Math.max(1, data.total_incidents)) * 100)}%`}
          sub={`${data.by_severity.find((s) => s.severity === 'critical')?.count ?? 0} of ${data.total_incidents}`}
        />
        <KpiPanel icon={BarChart3} label="Most exposed zone" value={data.by_zone.sort((a, b) => b.count - a.count)[0]?.zone || '—'} sub={`${data.by_zone.sort((a, b) => b.count - a.count)[0]?.count ?? 0} incidents`} />
      </div>

      {/* Trend + severity breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-glass rounded-xl p-5 lg:col-span-2">
          <SectionTitle
            eyebrow="Time series"
            title="Incident frequency"
            description="Daily count across the plant for the last 14 days."
          />
          <TrendChart
            data={data.by_day.map((d) => ({ x: d.date.slice(5), y: d.count }))}
            height={220}
            stroke="#22d3ee"
          />
        </div>

        <div className="surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Composition"
            title="By severity"
            description="Distribution across criticality tiers."
          />
          <div className="mt-2 space-y-3">
            {data.by_severity.map((s) => {
              const tone =
                s.severity === 'critical' ? 'red' :
                s.severity === 'high' ? 'orange' :
                s.severity === 'medium' ? 'amber' :
                'emerald';
              return (
                <div key={s.severity}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="capitalize text-zinc-300">{s.severity}</span>
                    <span className="font-mono text-zinc-100">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/70">
                    <div
                      className={`h-full rounded-full ${
                        tone === 'red' ? 'bg-red-500' :
                        tone === 'orange' ? 'bg-orange-500' :
                        tone === 'amber' ? 'bg-amber-400' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (s.count / Math.max(1, data.total_incidents)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Donut-ish severity chart */}
          <div className="mt-5 flex items-center justify-center">
            <SeverityDonut data={data.by_severity} />
          </div>
        </div>
      </div>

      {/* By zone + by type */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Exposure"
            title="Incidents by zone"
            description="Top zones for the period."
          />
          <BarList
            max={maxByZone}
            rows={data.by_zone
              .sort((a, b) => b.count - a.count)
              .map((z) => ({
                label: z.zone,
                value: z.count,
                tone: z.zone === 'Reactor Bay A' || z.zone === 'Storage Tank Farm' ? 'red' : z.zone === 'Distillation Unit' ? 'amber' : 'cyan',
              }))}
          />
        </div>
        <div className="surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Classification"
            title="Incidents by type"
            description="Top categories for the period."
          />
          <BarList
            max={maxByType}
            rows={data.by_type
              .sort((a, b) => b.count - a.count)
              .map((t) => ({
                label: t.type.replace(/_/g, ' '),
                value: t.count,
                tone: 'indigo',
              }))}
          />
        </div>
      </div>

      {/* Heatmap */}
      <div className="surface-glass rounded-xl p-5">
        <SectionTitle
          eyebrow="Heatmap"
          title="Incidents by zone × day"
          description="Daily exposure across operational zones."
          actions={
            <span className="font-mono text-[10.5px] text-zinc-500">14 days · {zoneNames.length} zones</span>
          }
        />
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(0, 1fr))` }}>
              <div></div>
              {days.map((d) => (
                <div key={d.date} className="px-1 text-center font-mono text-[10px] text-zinc-500">
                  {d.date.slice(8)}
                </div>
              ))}
              {heatmap.map((row) => (
                <div key={row.zone} className="contents">
                  <div className="truncate py-1.5 pr-2 text-xs text-zinc-400">{row.zone}</div>
                  {row.counts.map((count, i) => {
                    const intensity = count / heatMax;
                    const bg =
                      count === 0
                        ? 'rgba(63,63,70,0.18)'
                        : intensity > 0.66
                        ? 'rgba(239,68,68,0.75)'
                        : intensity > 0.33
                        ? 'rgba(245,158,11,0.65)'
                        : 'rgba(34,211,238,0.55)';
                    return (
                      <div
                        key={i}
                        className="m-0.5 flex h-7 items-center justify-center rounded font-mono text-[10px] text-zinc-100"
                        style={{ background: bg, opacity: count === 0 ? 0.4 : 1 }}
                        title={`${row.zone} · ${days[i].date} · ${count} incident(s)`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: 'rgba(63,63,70,0.18)' }} />
            None
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: 'rgba(34,211,238,0.55)' }} />
            Low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: 'rgba(245,158,11,0.65)' }} />
            Medium
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: 'rgba(239,68,68,0.75)' }} />
            High
          </span>
        </div>
      </div>

      {/* Predictive placeholder */}
      <div className="surface-glass relative overflow-hidden rounded-xl p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Predictive insights</p>
              <p className="text-xs text-zinc-400">
                ML-based risk forecasting will appear here once the Protect AI prediction service
                is connected to your telemetry stream.
              </p>
            </div>
          </div>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15">
            <PieIcon className="h-3.5 w-3.5" />
            Configure model
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiPanel({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="surface-glass relative overflow-hidden rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <Icon className="h-3.5 w-3.5 text-cyan-400" />
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-zinc-50">{value}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>
    </div>
  );
}

function SeverityDonut({ data }: { data: { severity: string; count: number }[] }) {
  const total = Math.max(1, data.reduce((acc, d) => acc + d.count, 0));
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#10b981',
  };
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 100 100" width="140" height="140">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="14" />
      {data.map((d, i) => {
        const len = (d.count / total) * circumference;
        const dasharray = `${len} ${circumference - len}`;
        const dashoffset = -offset;
        offset += len;
        return (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colors[d.severity] || '#52525b'}
            strokeWidth="14"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
            strokeLinecap="butt"
          />
        );
      })}
      <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#a1a1aa" fontFamily="JetBrains Mono">
        TOTAL
      </text>
      <text x="50" y="60" textAnchor="middle" fontSize="14" fill="#e4e4e7" fontFamily="JetBrains Mono" fontWeight="600">
        {total}
      </text>
    </svg>
  );
}