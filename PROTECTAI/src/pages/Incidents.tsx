import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  ChevronDown,
  MapPin,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import { api } from '../lib/api';
import type { Incident, Severity, IncidentStatus } from '../lib/types';
import { formatRelative, formatDateTime, severityClasses, statusClasses, statusText } from '../lib/utils';

const SEVERITIES: (Severity | 'all')[] = ['all', 'critical', 'high', 'medium', 'low'];
const STATUSES: (IncidentStatus | 'all')[] = ['all', 'open', 'investigating', 'monitoring', 'resolved'];

export default function Incidents() {
  const [rows, setRows] = useState<Incident[] | null>(null);
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<IncidentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    api.get<Incident[]>('/incidents').then(setRows).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (severity !== 'all' && r.severity !== severity) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(s) ||
          r.incident_code.toLowerCase().includes(s) ||
          r.zone.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [rows, severity, status, search]);

  const stats = useMemo(() => {
    const s = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    rows?.forEach((r) => {
      s[r.severity as keyof typeof s] = (s[r.severity as keyof typeof s] || 0) + 1;
      s.total += 1;
    });
    return s;
  }, [rows]);

  if (!rows) return <LoadingState label="Loading incidents" rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        subtitle="Track, triage and resolve safety, environmental and operational events across the plant."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            {rows.length} total · {filtered.length} shown
          </span>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500">
              <Plus className="h-3.5 w-3.5" />
              New incident
            </button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total" value={stats.total} tone="cyan" />
        <StatCard label="Critical" value={stats.critical} tone="red" />
        <StatCard label="High" value={stats.high} tone="orange" />
        <StatCard label="Medium" value={stats.medium} tone="amber" />
        <StatCard label="Low" value={stats.low} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        {/* Table */}
        <section>
          <div className="surface-glass rounded-xl p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code, title, zone or description…"
                  className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <FilterGroup label="Severity" value={severity} options={SEVERITIES} onChange={(v) => setSeverity(v as Severity | 'all')} />
              <FilterGroup label="Status" value={status} options={STATUSES} onChange={(v) => setStatus(v as IncidentStatus | 'all')} />
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="No incidents match these filters" />
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-800/70">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/60">
                    <tr className="text-left text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                      <th className="px-4 py-2.5 font-medium">Code</th>
                      <th className="px-4 py-2.5 font-medium">Incident</th>
                      <th className="hidden px-4 py-2.5 font-medium md:table-cell">Zone</th>
                      <th className="px-4 py-2.5 font-medium">Severity</th>
                      <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Status</th>
                      <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Reported by</th>
                      <th className="px-4 py-2.5 text-right font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className={`group cursor-pointer bg-zinc-950/40 transition-colors hover:bg-zinc-900/60 ${
                          selected?.id === r.id ? 'bg-cyan-500/5 ring-1 ring-inset ring-cyan-500/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{r.incident_code}</td>
                        <td className="max-w-[280px] truncate px-4 py-3 text-zinc-100">{r.title}</td>
                        <td className="hidden px-4 py-3 text-zinc-400 md:table-cell">{r.zone}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${severityClasses(r.severity)}`}>
                            {r.severity}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClasses(r.status)}`}>
                            {statusText(r.status)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-zinc-400 lg:table-cell">{r.reported_by}</td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-500">
                          {formatRelative(r.occurred_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Detail panel */}
        <aside className="surface-glass rounded-xl p-4">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800/70 pb-3">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                    {selected.incident_code}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-100">{selected.title}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${severityClasses(selected.severity)}`}>
                  {selected.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Meta icon={MapPin} label="Zone" value={selected.zone} />
                <Meta icon={Calendar} label="Occurred" value={formatDateTime(selected.occurred_at)} />
                <Meta icon={UserIcon} label="Reported by" value={selected.reported_by} />
                <Meta icon={UserIcon} label="Assigned to" value={selected.assigned_to} />
              </div>

              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Description</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">{selected.description}</p>
              </div>

              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Status</p>
                <div className="mt-2 flex items-center gap-2">
                  {(['open', 'investigating', 'monitoring', 'resolved'] as IncidentStatus[]).map((s) => (
                    <button
                      key={s}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                        selected.status === s
                          ? statusClasses(s) + ' ring-1 ring-cyan-500/30'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      {statusText(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/70 pt-3">
                <button className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900">
                  Assign owner
                </button>
                <button className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15">
                  Mark resolved
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <AlertTriangle className="h-6 w-6 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-300">Select an incident</p>
              <p className="mt-1 max-w-[260px] text-xs text-zinc-500">
                Click any row to view the full timeline, attachments and recommended actions.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'cyan' | 'red' | 'orange' | 'amber' | 'emerald';
}) {
  const toneClasses = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    red: 'border-red-500/30 bg-red-500/10 text-red-300',
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  };
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-zinc-800 bg-zinc-900/40 pl-3 pr-8 text-xs text-zinc-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
      >
        <option value="all">{label}: all</option>
        {options
          .filter((o) => o !== 'all')
          .map((o) => (
            <option key={o} value={o}>
              {label}: {o}
            </option>
          ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-100">{value}</p>
      </div>
    </div>
  );
}