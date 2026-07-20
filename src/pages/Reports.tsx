import { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Shield,
  Activity,
  Flame,
  Wind,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { api } from '../lib/api';
import type { ReportItem } from '../lib/types';
import { formatRelative, formatDate } from '../lib/utils';

const templates = [
  {
    title: 'Daily Operations Brief',
    description: 'Shift handover summary with KPIs, incidents and outstanding actions.',
    icon: Activity,
    tone: 'cyan',
  },
  {
    title: 'Weekly Safety Performance',
    description: 'Composite safety score, incident breakdown and compliance trend.',
    icon: Shield,
    tone: 'emerald',
  },
  {
    title: 'Process Safety Audit',
    description: 'PSM compliance checklist, sensor calibrations and risk register.',
    icon: Flame,
    tone: 'red',
  },
  {
    title: 'Environmental Compliance',
    description: 'Emissions, effluent and waste-handling records against permit limits.',
    icon: Wind,
    tone: 'sky',
  },
  {
    title: 'Maintenance Performance',
    description: 'Equipment uptime, MTTR, MTBF and overdue work orders.',
    icon: TrendingUp,
    tone: 'amber',
  },
  {
    title: 'Incident Investigation',
    description: 'Root-cause analysis, 5-Whys, contributing factors and corrective actions.',
    icon: FileText,
    tone: 'violet',
  },
];

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<ReportItem[]>('/reports').then(setReports).catch(() => {});
  }, []);

  if (!reports) return <LoadingState label="Loading reports" rows={6} />;

  const filtered = reports.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate, schedule and distribute safety, compliance and operational reports."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            {reports.length} reports · {reports.filter((r) => r.status === 'ready').length} ready
          </span>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Calendar className="h-3.5 w-3.5" />
              Schedule
            </button>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500">
              <Plus className="h-3.5 w-3.5" />
              New report
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        {/* Reports list */}
        <section>
          <div className="surface-glass rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <FileText className="h-4 w-4 text-cyan-400" />
                Generated reports
              </h2>
              <div className="relative w-72 max-w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={FileText} title="No reports found" description="Try a different search term or generate a new report." />
            ) : (
              <ul className="space-y-2">
                {filtered.map((r) => (
                  <li
                    key={r.id}
                    className="group flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-100">{r.title}</p>
                        <StatusBadge
                          variant="outline"
                          className={
                            r.status === 'ready'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          }
                        >
                          {r.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400">{r.summary}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                        <span className="font-mono uppercase tracking-[0.18em]">{r.type}</span>
                        <span>·</span>
                        <span>{r.period}</span>
                        <span>·</span>
                        <span>by {r.generated_by}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(r.generated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* AI draft + templates */}
        <aside className="space-y-4">
          <div className="surface-glass relative overflow-hidden rounded-xl p-4">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15 text-violet-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">AI Report Drafter</p>
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">Coming soon</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Generate executive-ready narratives from raw incident, sensor and shift data. The
                draft engine will plug into the Protect AI knowledge base in a future release.
              </p>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/15">
                Join the waitlist
              </button>
            </div>
          </div>

          <div className="surface-glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-100">Templates</h3>
            <p className="mt-1 text-xs text-zinc-500">Quick-start reports for common audits.</p>
            <ul className="mt-3 space-y-2">
              {templates.map((t) => (
                <li
                  key={t.title}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${templateIconClass(t.tone)}`}>
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-100">{t.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500">{t.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-glass rounded-xl p-4 text-xs text-zinc-400">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Last generated
            </p>
            <p className="mt-1 text-zinc-100">{reports[0] ? formatRelative(reports[0].generated_at) : '—'}</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Reports are auto-distributed to subscribers every Monday at 06:00.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function templateIconClass(tone: string): string {
  switch (tone) {
    case 'cyan':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
    case 'emerald':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'red':
      return 'border-red-500/30 bg-red-500/10 text-red-300';
    case 'sky':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
    case 'amber':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    case 'violet':
      return 'border-violet-500/30 bg-violet-500/10 text-violet-300';
    default:
      return 'border-zinc-700 bg-zinc-800/40 text-zinc-300';
  }
}