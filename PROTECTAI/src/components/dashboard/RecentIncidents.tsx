import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { Incident } from '../../lib/types';
import { formatRelative, severityClasses, statusText } from '../../lib/utils';
import LoadingState from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';

export default function RecentIncidents() {
  const [rows, setRows] = useState<Incident[] | null>(null);

  useEffect(() => {
    api.get<Incident[]>('/incidents?limit=6').then(setRows).catch(() => {});
  }, []);

  if (!rows) return <LoadingState label="Loading incidents" rows={4} />;
  if (!rows.length) return <EmptyState icon={AlertTriangle} title="No incidents to show" />;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/70">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/60">
          <tr className="text-left text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
            <th className="px-4 py-2.5 font-medium">Code</th>
            <th className="px-4 py-2.5 font-medium">Incident</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Zone</th>
            <th className="px-4 py-2.5 font-medium">Severity</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Status</th>
            <th className="px-4 py-2.5 text-right font-medium">When</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {rows.map((r) => (
            <tr key={r.id} className="group bg-zinc-950/40 transition-colors hover:bg-zinc-900/60">
              <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{r.incident_code}</td>
              <td className="max-w-[260px] truncate px-4 py-3 text-zinc-100">{r.title}</td>
              <td className="hidden px-4 py-3 text-zinc-400 md:table-cell">{r.zone}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${severityClasses(r.severity)}`}>
                  {r.severity}
                </span>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="text-xs text-zinc-300">{statusText(r.status)}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-500">{formatRelative(r.occurred_at)}</td>
              <td className="pr-4">
                <ChevronRight className="h-4 w-4 text-zinc-700 transition-colors group-hover:text-zinc-300" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}