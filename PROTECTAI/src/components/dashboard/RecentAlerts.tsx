import { useEffect, useState } from 'react';
import { Bell, ChevronRight, AlertOctagon } from 'lucide-react';
import { api } from '../../lib/api';
import type { AlertItem } from '../../lib/types';
import { formatRelative, severityClasses, statusText } from '../../lib/utils';
import LoadingState from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AlertItem[]>('/alerts?limit=6')
      .then(setAlerts)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <EmptyState icon={AlertOctagon} title="Unable to load alerts" description={error} />;
  }
  if (!alerts) return <LoadingState label="Loading alerts" rows={4} />;
  if (!alerts.length) return <EmptyState icon={Bell} title="No active alerts" description="All zones are within nominal thresholds." />;

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="group flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
        >
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            a.severity === 'critical' ? 'bg-red-400' :
            a.severity === 'high' ? 'bg-orange-400' :
            a.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
          } ${a.acknowledged ? 'opacity-40' : 'live-dot'}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${severityClasses(a.severity)}`}>
                {a.severity}
              </span>
              <span className="font-mono text-[10.5px] text-zinc-500">{formatRelative(a.created_at)}</span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-zinc-100">{a.message}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
              <span>{a.source}</span>
              <span>·</span>
              <span>{a.zone}</span>
              {a.acknowledged && (
                <>
                  <span>·</span>
                  <span className="text-zinc-600">{statusText('acknowledged')}</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
        </div>
      ))}
    </div>
  );
}