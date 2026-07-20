import { useEffect, useState } from 'react';
import { Factory, Users, Cpu, Radio } from 'lucide-react';
import { api } from '../../lib/api';
import type { Zone } from '../../lib/types';
import LoadingState from '../ui/LoadingState';
import { riskBarClasses, riskBarWidth } from '../../lib/utils';

export default function FactoryOverview() {
  const [zones, setZones] = useState<Zone[] | null>(null);

  useEffect(() => {
    api.get<Zone[]>('/zones').then(setZones).catch(() => {});
  }, []);

  if (!zones) return <LoadingState label="Loading zones" rows={4} />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {zones.map((z) => (
        <div
          key={z.id}
          className="group relative overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                {z.code}
              </p>
              <p className="text-sm font-semibold text-zinc-100">{z.name}</p>
              <p className="text-[11px] text-zinc-500">{z.area}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 text-zinc-400 group-hover:text-zinc-200">
              <Factory className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
              <span>Risk</span>
              <span className={`font-mono ${
                z.risk_level === 'critical' ? 'text-red-300' :
                z.risk_level === 'high' ? 'text-orange-300' :
                z.risk_level === 'medium' ? 'text-amber-300' :
                'text-emerald-300'
              }`}>{z.risk_level}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
              <div
                className={`h-full rounded-full ${riskBarClasses(z.risk_level)}`}
                style={{ width: `${riskBarWidth(z.risk_level)}%`, transition: 'width 600ms ease' }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-3 text-[11px] text-zinc-400">
            <Stat icon={Users} value={z.workers_count} label="Workers" />
            <Stat icon={Radio} value={z.sensors_count} label="Sensors" />
            <Stat icon={Cpu} value={z.machines_count} label="Machines" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Factory; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-zinc-600" />
      <span className="font-mono text-zinc-200">{value}</span>
      <span className="text-zinc-500">{label}</span>
    </div>
  );
}