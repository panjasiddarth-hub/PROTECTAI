import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  Flame,
  Gauge,
  MapPin,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Waves,
  X,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import KpiCard from '../components/ui/KpiCard';
import type { LucideIcon } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { simulationStages, type SimulationStage } from '../lib/simulation';

type Factor = {
  label: string;
  detail: string;
  points: number;
  tone: 'cyan' | 'amber' | 'orange' | 'red' | 'violet';
  icon: LucideIcon;
};

const stageMeta: Record<SimulationStage, { label: string; description: string; score: number; gas: number; leadTime: string; severity: string }> = {
  baseline: {
    label: 'Normal baseline',
    description: 'Plant is operating within expected conditions. No permit conflict is active.',
    score: 18,
    gas: 8,
    leadTime: '—',
    severity: 'low',
  },
  permit: {
    label: 'Permit activated',
    description: 'Hot-work permit HW-104 is active in Reactor Bay A. Contextual risk is now being evaluated.',
    score: 46,
    gas: 8,
    leadTime: '32 min',
    severity: 'medium',
  },
  rising: {
    label: 'Compound risk forming',
    description: 'Gas readings are trending upward within 35 metres of the active permit.',
    score: 78,
    gas: 32,
    leadTime: '12 min',
    severity: 'high',
  },
  critical: {
    label: 'Critical intervention required',
    description: 'Multiple independent signals agree that the hot-work activity should be paused immediately.',
    score: 92,
    gas: 48,
    leadTime: '8 min',
    severity: 'critical',
  },
  response: {
    label: 'Response workflow active',
    description: 'The event has been confirmed in simulation mode and response actions are being tracked.',
    score: 96,
    gas: 48,
    leadTime: '6 min',
    severity: 'critical',
  },
};

const stageFactors: Record<SimulationStage, Factor[]> = {
  baseline: [
    { label: 'Sensor state', detail: 'GAS-ZB-01 is stable at 8 ppm', points: 8, tone: 'cyan', icon: Radio },
    { label: 'Plant context', detail: 'No active hot-work permit in the zone', points: 5, tone: 'cyan', icon: ShieldCheck },
    { label: 'Historical exposure', detail: 'Zone has a monitored gas-event history', points: 5, tone: 'amber', icon: TrendingUp },
  ],
  permit: [
    { label: 'Active work permit', detail: 'HW-104 · welding · Reactor Bay A', points: 18, tone: 'amber', icon: Flame },
    { label: 'Permit proximity', detail: 'Permit location is mapped to the process aisle', points: 10, tone: 'violet', icon: MapPin },
    { label: 'Historical exposure', detail: 'Three related near-misses found in this zone', points: 18, tone: 'orange', icon: TrendingUp },
  ],
  rising: [
    { label: 'Gas trend', detail: 'GAS-ZB-01 rising from 8 ppm to 32 ppm', points: 24, tone: 'orange', icon: Waves },
    { label: 'Spatial proximity', detail: '35 m from active hot-work permit HW-104', points: 18, tone: 'violet', icon: MapPin },
    { label: 'Historical pattern', detail: 'Similar gas events occurred during maintenance', points: 16, tone: 'amber', icon: TrendingUp },
    { label: 'Evidence gap', detail: 'Second gas test has not been uploaded', points: 20, tone: 'red', icon: FileCheck2 },
  ],
  critical: [
    { label: 'Gas threshold', detail: '48 ppm is above the 25 ppm advisory threshold', points: 30, tone: 'red', icon: Waves },
    { label: 'Active ignition source', detail: 'Hot work is active inside the risk radius', points: 25, tone: 'red', icon: Flame },
    { label: 'Spatial proximity', detail: '35 m from GAS-ZB-01; zone boundary is exposed', points: 18, tone: 'violet', icon: MapPin },
    { label: 'Recurring pattern', detail: '3 similar near-misses in the last 90 days', points: 10, tone: 'amber', icon: TrendingUp },
    { label: 'Compliance gap', detail: 'Second gas test evidence is missing', points: 9, tone: 'orange', icon: FileCheck2 },
  ],
  response: [
    { label: 'Confirmed event', detail: 'Operator confirmed the simulation trigger', points: 30, tone: 'red', icon: Siren },
    { label: 'Affected zone', detail: 'Reactor Bay A response boundary is active', points: 25, tone: 'red', icon: MapPin },
    { label: 'Evidence preserved', detail: 'Sensor, permit and incident context captured', points: 18, tone: 'cyan', icon: BadgeCheck },
    { label: 'Response in progress', detail: 'Actions are assigned to the response team', points: 23, tone: 'violet', icon: ShieldAlert },
  ],
};

const similarIncidents = [
  { code: 'NM-2026-011', title: 'Incomplete gas test before welding', when: '3 days ago', match: '91%', finding: 'Same zone · same activity' },
  { code: 'NM-2026-009', title: 'Hydrocarbon odour near transfer line', when: '7 days ago', match: '78%', finding: 'Same gas sensor family' },
  { code: 'INC-2025-118', title: 'Permit boundary changed during maintenance', when: '62 days ago', match: '72%', finding: 'Same permit control gap' },
];

const complianceFindings = [
  { label: 'Hot-work permit approval', status: 'verified', reference: 'Permit-to-work control · HW-104' },
  { label: 'Initial gas test', status: 'verified', reference: 'GAS-ZB-01 · 8 ppm at 09:14' },
  { label: 'Second gas test after conditions changed', status: 'missing', reference: 'Required before resuming work' },
  { label: 'Emergency contact and response team', status: 'verified', reference: 'A Shift · Safety Response Team' },
];

const responseActions = [
  { id: 'pause', label: 'Pause hot-work permit HW-104', owner: 'Permit Controller', urgency: 'Immediate' },
  { id: 'notify', label: 'Notify shift supervisor and control room', owner: 'Response Coordinator', urgency: 'Immediate' },
  { id: 'headcount', label: 'Verify worker headcount in Reactor Bay A', owner: 'Safety Officer', urgency: 'Within 2 min' },
  { id: 'test', label: 'Repeat gas test and confirm safe boundary', owner: 'Process Safety', urgency: 'Within 5 min' },
];

export default function RiskIntelligence() {
  const { stage, stageIndex, advance, reset, setStage, events, clearEvents } = useSimulation();
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const meta = stageMeta[stage];
  const factors = stageFactors[stage];
  const isResponse = stage === 'response';

  const sensorOnlyScore = useMemo(() => {
    if (stage === 'baseline' || stage === 'permit') return 18;
    if (stage === 'rising') return 54;
    return 72;
  }, [stage]);

  const handleReset = () => {
    reset();
    setCompletedActions([]);
  };

  const toggleAction = (id: string) => {
    setCompletedActions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Intelligence"
        subtitle="Simulation-first compound-risk detection for permits, sensors, incidents and compliance evidence."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant="dot" pulse className="border-amber-500/30 bg-amber-500/10 text-amber-300">
              Simulation mode
            </StatusBadge>
            <span className="font-mono text-[11px] text-zinc-500">Digital plant twin · Reactor Bay A</span>
          </div>
        }
        actions={
          <>
            <button
              onClick={handleReset}
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset scenario
            </button>
            <button
              onClick={advance}
              disabled={isResponse}
              className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {stage === 'baseline' ? 'Activate permit' : stage === 'permit' ? 'Raise sensor signal' : stage === 'rising' ? 'Trigger critical event' : 'Start response'}
            </button>
          </>
        }
      />

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/80">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            <span className="font-semibold text-amber-200">Prototype safety notice:</span> sensor telemetry, permit events and response actions on this page are simulated. This MVP is for decision-support demonstration only and is not connected to plant control systems.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Compound risk" value={meta.score} unit="/ 100" icon={Gauge} tone={meta.score >= 90 ? 'red' : meta.score >= 70 ? 'amber' : 'cyan'} footnote={`${meta.severity} assessment`} />
        <KpiCard label="Gas reading" value={meta.gas} unit="ppm" icon={Waves} tone={meta.gas >= 40 ? 'red' : meta.gas >= 25 ? 'amber' : 'cyan'} footnote="GAS-ZB-01 · simulated" />
        <KpiCard label="Predicted lead time" value={meta.leadTime} icon={Clock3} tone={meta.leadTime === '—' ? 'cyan' : meta.score >= 90 ? 'red' : 'amber'} footnote="Before escalation window" />
        <KpiCard label="Evidence sources" value={factors.length + 4} icon={BrainCircuit} tone="violet" footnote="Sensors · permit · history · guidance" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="surface-glass overflow-hidden rounded-xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/70 p-5">
            <div>
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${riskIconClasses(meta.severity)}`}>
                  {meta.score >= 90 ? <AlertOctagon className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{meta.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Permit HW-104 · welding · Reactor Bay A</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300">{meta.description}</p>
            </div>
            <StatusBadge variant="dot" pulse={meta.score >= 70} className={riskBadgeClasses(meta.severity)}>
              {meta.severity} risk
            </StatusBadge>
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Compound assessment</p>
                <p className="mt-1 font-mono text-4xl font-semibold text-zinc-50">{meta.score}<span className="ml-1 text-lg text-zinc-500">/100</span></p>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <p>Sensor-only baseline</p>
                <p className="mt-1 font-mono text-zinc-200">{sensorOnlyScore}/100</p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800/80">
              <div className={`h-full rounded-full transition-all duration-500 ${riskBarClasses(meta.severity)}`} style={{ width: `${meta.score}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-600">
              <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2">
              {factors.map((factor) => (
                <FactorRow key={factor.label} factor={factor} />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-glass rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Scenario timeline</p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-100">From signal to action</h2>
            </div>
            <span className="font-mono text-[10.5px] text-cyan-300">{stageIndex + 1}/5</span>
          </div>
          <div className="mt-5 space-y-1">
            {simulationStages.map((item, index) => {
              const active = index === stageIndex;
              const complete = index < stageIndex;
              return (
                <div key={item} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${complete ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : active ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600'}`}>
                      {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    {index < simulationStages.length - 1 && <div className={`my-1 h-7 w-px ${complete ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} />}
                  </div>
                  <div className={`pb-3 ${active ? 'text-zinc-100' : complete ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <p className="text-xs font-medium">{stageMeta[item].label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{timelineText(item)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-xs text-cyan-100/80">
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
              <p><span className="font-semibold text-cyan-200">Why this matters:</span> the simulator proves that combining context can surface risk before a single threshold alarm becomes critical.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="surface-glass rounded-xl p-5">
          <SectionHeading icon={TrendingUp} eyebrow="Pattern intelligence" title="Similar incidents" action="3 matches" />
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">The RAG-ready evidence layer found recurring relationships between hot work, gas testing and Reactor Bay A.</p>
          <div className="mt-4 space-y-2">
            {similarIncidents.map((incident) => (
              <div key={incident.code} className="rounded-lg border border-zinc-800/70 bg-zinc-900/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-cyan-300">{incident.code}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-500">{incident.when}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-zinc-200">{incident.title}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">{incident.finding}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-300">{incident.match} match</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-zinc-800/60 pt-3 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Pattern confidence <span className="font-mono text-emerald-300">0.91</span> · evidence-backed
          </div>
        </section>

        <section className="surface-glass rounded-xl p-5">
          <SectionHeading icon={FileCheck2} eyebrow="Quality & compliance" title="Permit evidence check" action="HW-104" />
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">Controls are checked continuously against the permit context and the demo safety guidance corpus.</p>
          <div className="mt-4 space-y-2">
            {complianceFindings.map((finding) => (
              <div key={finding.label} className="flex items-start gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/35 p-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${finding.status === 'verified' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                  {finding.status === 'verified' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium text-zinc-200">{finding.label}</p>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${finding.status === 'verified' ? 'text-emerald-300' : 'text-red-300'}`}>{finding.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">{finding.reference}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200">
            Open compliance audit <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      <section className="surface-glass rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-400" /><div><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Persistent event stream</p><h2 className="mt-1 text-sm font-semibold text-zinc-100">Simulation audit trail</h2></div></div>
          <div className="flex items-center gap-3"><span className="font-mono text-[10.5px] text-zinc-500">{events.length} events saved locally</span><button onClick={clearEvents} className="text-[11px] text-zinc-500 hover:text-zinc-200">Clear</button></div>
        </div>
        {events.length ? <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">{events.slice().reverse().slice(0, 6).map((event) => <div key={event.id} className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.severity === 'critical' ? 'bg-red-400' : event.severity === 'high' ? 'bg-orange-400' : event.severity === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'}`} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-zinc-200">{event.title}</p><span className="font-mono text-[10px] text-zinc-600">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{event.detail}</p></div></div>)}</div> : <p className="mt-4 text-xs text-zinc-500">No events yet. Advance the simulation to create an auditable event trail.</p>}
      </section>

      <section className={`surface-glass overflow-hidden rounded-xl ${isResponse ? 'ring-1 ring-red-500/30' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/70 p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${isResponse ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'}`}>
              <Siren className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Emergency response orchestrator</p>
              <p className="text-xs text-zinc-500">Human-approved action plan for the first critical 10 minutes</p>
            </div>
          </div>
          {isResponse ? (
            <StatusBadge variant="dot" pulse className="border-red-500/30 bg-red-500/10 text-red-300">Response active</StatusBadge>
          ) : (
            <span className="font-mono text-[10.5px] text-zinc-600">Awaiting confirmed trigger</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-2">
            {responseActions.map((action) => {
              const done = completedActions.includes(action.id);
              return (
                <button key={action.id} onClick={() => toggleAction(action.id)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${done ? 'border-emerald-500/25 bg-emerald-500/[0.06]' : 'border-zinc-800/70 bg-zinc-900/35 hover:border-zinc-700'}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${done ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-zinc-700 text-zinc-600'}`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-zinc-700" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs font-medium ${done ? 'text-emerald-200 line-through decoration-emerald-500/40' : 'text-zinc-200'}`}>{action.label}</span>
                    <span className="mt-1 block text-[11px] text-zinc-500">{action.owner} · {action.urgency}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-700" />
                </button>
              );
            })}
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/35 p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Response summary</p>
            <div className="mt-4 space-y-3 text-xs">
              <SummaryRow label="Affected zone" value="Reactor Bay A" />
              <SummaryRow label="People to verify" value="8 workers" />
              <SummaryRow label="Permit status" value={isResponse ? 'Paused' : 'Active'} tone={isResponse ? 'red' : 'amber'} />
              <SummaryRow label="Actions complete" value={`${completedActions.length}/${responseActions.length}`} />
            </div>
            {!isResponse && <button onClick={() => setStage('response')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"><Siren className="h-3.5 w-3.5" /> Confirm simulated emergency</button>}
            {isResponse && <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-[11px] leading-relaxed text-emerald-100/80"><BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />Evidence snapshot captured. A preliminary incident report can now be generated from this response state.</div>}
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 text-xs text-zinc-500">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
        <p><span className="font-medium text-zinc-300">MVP architecture note:</span> this screen is already wired for a future sensor adapter. The simulator can later be replaced by MQTT, OPC-UA, Modbus or a SCADA gateway while preserving the same risk-assessment contract.</p>
      </div>
    </div>
  );
}

function FactorRow({ factor }: { factor: Factor }) {
  const Icon = factor.icon;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/35 p-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${toneClasses[factor.tone]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-zinc-200">{factor.label}</p>
          <span className="font-mono text-[10px] text-zinc-400">+{factor.points}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{factor.detail}</p>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title, action }: { icon: LucideIcon; eyebrow: string; title: string; action: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-cyan-400" />
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
          <h2 className="mt-1 text-sm font-semibold text-zinc-100">{title}</h2>
        </div>
      </div>
      <span className="font-mono text-[10px] text-zinc-600">{action}</span>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'amber' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-mono text-[11px] ${tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : 'text-zinc-200'}`}>{value}</span>
    </div>
  );
}

function timelineText(stage: SimulationStage) {
  switch (stage) {
    case 'baseline': return 'Synthetic telemetry is stable and ready for the scenario.';
    case 'permit': return 'Work context changes the risk posture even though the sensor is normal.';
    case 'rising': return 'Multiple signals now agree; the system predicts an escalation window.';
    case 'critical': return 'The recommended intervention is pause, test and notify.';
    case 'response': return 'Actions, evidence and a preliminary report are being coordinated.';
  }
}

const toneClasses: Record<Factor['tone'], string> = {
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
};

function riskIconClasses(severity: string) {
  return severity === 'critical'
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : severity === 'high'
    ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
    : severity === 'medium'
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
}

function riskBadgeClasses(severity: string) {
  return severity === 'critical'
    ? 'border-red-500/40 bg-red-500/10 text-red-300'
    : severity === 'high'
    ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
    : severity === 'medium'
    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
}

function riskBarClasses(severity: string) {
  return severity === 'critical'
    ? 'bg-gradient-to-r from-orange-500 to-red-500'
    : severity === 'high'
    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
    : severity === 'medium'
    ? 'bg-gradient-to-r from-cyan-400 to-amber-400'
    : 'bg-gradient-to-r from-cyan-400 to-emerald-400';
}
