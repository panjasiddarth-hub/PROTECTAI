import { useNavigate } from 'react-router-dom';
import { Activity, AlertOctagon, ArrowRight, Radar, ShieldCheck } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { useSimulation } from '../../hooks/useSimulation';

const stageDetails = {
  baseline: { label: 'Baseline stable', detail: 'No compound-risk scenario is active.', score: 18, tone: 'cyan' },
  permit: { label: 'Permit context active', detail: 'HW-104 is active and being checked against plant conditions.', score: 46, tone: 'amber' },
  rising: { label: 'Compound risk forming', detail: 'Gas trend is rising within the active permit radius.', score: 78, tone: 'orange' },
  critical: { label: 'Critical intervention required', detail: 'Pause hot work and notify the control room.', score: 92, tone: 'red' },
  response: { label: 'Response workflow active', detail: 'Emergency actions and evidence preservation are in progress.', score: 96, tone: 'red' },
} as const;

export default function SimulationRiskBanner() {
  const navigate = useNavigate();
  const { stage, events } = useSimulation();
  const detail = stageDetails[stage];
  const critical = stage === 'critical' || stage === 'response';
  const latest = events[events.length - 1];

  return (
    <section className={`relative overflow-hidden rounded-xl border p-4 ${critical ? 'border-red-500/30 bg-red-500/[0.06]' : stage === 'rising' ? 'border-orange-500/30 bg-orange-500/[0.05]' : 'border-cyan-500/20 bg-cyan-500/[0.04]'}`}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${critical ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'}`}>
            {critical ? <AlertOctagon className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-zinc-100">{detail.label}</p>
              <StatusBadge variant="dot" pulse={stage !== 'baseline'} className={critical ? 'border-red-500/30 bg-red-500/10 text-red-300' : stage === 'rising' ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'}>
                Simulation
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{detail.detail}</p>
            {latest && <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-zinc-600"><Activity className="h-3 w-3" />Latest event: {latest.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 lg:justify-end">
          <div className="text-right"><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Compound score</p><p className={`mt-1 font-mono text-xl font-semibold ${critical ? 'text-red-200' : detail.tone === 'orange' ? 'text-orange-200' : 'text-cyan-200'}`}>{detail.score}<span className="ml-1 text-xs text-zinc-500">/100</span></p></div>
          <button onClick={() => navigate('/risk-intelligence')} className="flex items-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-950/35 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-900"><ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />Review evidence<ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </section>
  );
}
