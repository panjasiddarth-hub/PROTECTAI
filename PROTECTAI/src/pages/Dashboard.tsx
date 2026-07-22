import { useEffect, useState } from 'react';
import { Download, RefreshCw, Filter, Activity, AlertOctagon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import KpiRow from '../components/dashboard/KpiRow';
import LiveCameraCard from '../components/dashboard/LiveCameraCard';
import SafetyScoreCard from '../components/dashboard/SafetyScoreCard';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import RecentIncidents from '../components/dashboard/RecentIncidents';
import FactoryOverview from '../components/dashboard/FactoryOverview';
import RiskPanel from '../components/dashboard/RiskPanel';
import SimulationRiskBanner from '../components/dashboard/SimulationRiskBanner';
import TrendChart from '../components/ui/TrendChart';
import BarList from '../components/ui/BarList';
import SectionTitle from '../components/ui/SectionTitle';
import LoadingState from '../components/ui/LoadingState';
import { api } from '../lib/api';
import type { DashboardKpis, AnalyticsResponse } from '../lib/types';
import { formatRelative } from '../lib/utils';

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const [k, a] = await Promise.all([api.get<DashboardKpis>('/dashboard'), api.get<AnalyticsResponse>('/analytics')]);
      setKpis(k);
      setAnalytics(a);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!kpis) return <LoadingState label="Loading operations dashboard" rows={6} />;

  const incidentsByDay = analytics?.by_day || [];
  const topZones = [...(analytics?.by_zone || [])].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Unified view of plant safety, sensor health and worker activity for the current shift."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            Last refreshed {formatRelative(kpis.generated_at)} · auto-refresh 60s
          </span>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Filter className="h-3.5 w-3.5" />
              Last 24h
            </button>
            <button
              onClick={load}
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </>
        }
      />

      {/* KPI Row */}
      <KpiRow data={kpis} />
      <SimulationRiskBanner />

      {/* Primary live + risk row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle
            eyebrow="Live Operations"
            title="Primary live feed"
            description="AI-enhanced stream from CAM-RX-01 — PPE detection active."
          />
          <LiveCameraCard />
        </div>
        <div className="space-y-4">
          <RiskPanel riskIndex={kpis.risk_index} compliance={kpis.compliance_score} />
          <SafetyScoreCard
            score={kpis.safety_score}
            delta={kpis.safety_score_delta}
            compliance={kpis.compliance_score}
          />
        </div>
      </div>

      {/* Incidents trend + alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Trend"
            title="Incidents — last 14 days"
            description="Daily count of logged incidents across the plant."
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-cyan-300">
                <Activity className="h-3 w-3" />
                Live
              </span>
            }
          />
          <TrendChart
            data={incidentsByDay.map((d) => ({
              x: d.date.slice(5),
              y: d.count,
            }))}
            height={220}
            stroke="#22d3ee"
            fill="rgba(34,211,238,0.18)"
            yAxisFormatter={(v) => Math.round(v).toString()}
            xAxisFormatter={(v) => String(v)}
          />
        </div>

        <div className="surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Operational"
            title="Recent alerts"
            description="Highest-priority alerts across the plant."
            actions={
              <button className="text-[11px] text-cyan-400 hover:text-cyan-300">View all</button>
            }
          />
          <RecentAlerts />
        </div>
      </div>

      {/* Incidents table + by zone */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle
            eyebrow="Activity"
            title="Recent incidents"
            description="Newest safety, environmental and operational events."
            actions={
              <button className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-2.5 text-[11px] text-zinc-300 hover:bg-zinc-900">
                <AlertOctagon className="h-3 w-3" />
                All incidents
              </button>
            }
          />
          <RecentIncidents />
        </div>

        <div className="surface-glass rounded-xl p-5">
          <SectionTitle
            eyebrow="Heatmap"
            title="By zone"
            description="Top zones by incident count (14 days)."
          />
          <BarList
            rows={topZones.map((z) => ({
              label: z.zone,
              value: z.count,
              tone:
                z.zone === 'Reactor Bay A' || z.zone === 'Storage Tank Farm'
                  ? 'red'
                  : z.zone === 'Distillation Unit'
                  ? 'amber'
                  : 'cyan',
            }))}
          />
        </div>
      </div>

      {/* Factory overview */}
      <div>
        <SectionTitle
          eyebrow="Plant Map"
          title="Factory overview"
          description="Risk-weighted zone summary across the facility."
          actions={
            <span className="font-mono text-[11px] text-zinc-500">8 zones · 24 workers on duty</span>
          }
        />
        <FactoryOverview />
      </div>
    </div>
  );
}