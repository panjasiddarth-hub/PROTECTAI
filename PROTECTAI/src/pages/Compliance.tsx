import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileCheck2,
  FileWarning,
  Gavel,
  ListChecks,
  MapPin,
  Plus,
  ShieldAlert,
  Sparkles,
  UserRound,
  Clock3,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import KpiCard from '../components/ui/KpiCard';

type FindingStatus = 'open' | 'in_progress' | 'verified';
type FindingSeverity = 'critical' | 'high' | 'medium';

type Finding = {
  id: string;
  title: string;
  source: string;
  area: string;
  severity: FindingSeverity;
  status: FindingStatus;
  owner: string;
  due: string;
  evidence: string;
  recommendation: string;
};

const initialFindings: Finding[] = [
  { id: 'CF-014', title: 'Second gas test missing after conditions changed', source: 'Permit-to-work guidance', area: 'Reactor Bay A', severity: 'critical', status: 'open', owner: 'Process Safety', due: 'Today · 13:00', evidence: 'HW-104 · GAS-ZB-01', recommendation: 'Repeat gas test and attach the reading before hot work resumes.' },
  { id: 'CF-012', title: 'Inspection record approaching renewal date', source: 'OISD process-safety checklist', area: 'Storage Tank Farm', severity: 'high', status: 'in_progress', owner: 'Reliability Team', due: '22 Jul 2026', evidence: 'Tank inspection register', recommendation: 'Schedule inspection and link the signed record to the asset.' },
  { id: 'CF-009', title: 'Contractor induction evidence incomplete', source: 'Factory safety procedure', area: 'Loading Dock', severity: 'high', status: 'open', owner: 'Contractor Control', due: '23 Jul 2026', evidence: 'Badge PX-1151', recommendation: 'Complete induction and block restricted-area access until verified.' },
  { id: 'CF-006', title: 'Emergency contact roster verified', source: 'Emergency response procedure', area: 'Control Room', severity: 'medium', status: 'verified', owner: 'Safety Operations', due: 'Verified today', evidence: 'A Shift roster v3.2', recommendation: 'No action required. Recheck on shift handover.' },
  { id: 'CF-003', title: 'Camera coverage gap at loading gate', source: 'Site security control', area: 'Loading Dock', severity: 'medium', status: 'in_progress', owner: 'Instrumentation Team', due: '25 Jul 2026', evidence: 'CAM-LD-02 offline', recommendation: 'Restore camera coverage or log a compensating control.' },
];

const coverage = [
  { name: 'Permit controls', source: 'OISD / internal PTW', coverage: 88, tone: 'cyan' },
  { name: 'Emergency response', source: 'Factory procedure', coverage: 94, tone: 'emerald' },
  { name: 'Worker & contractor safety', source: 'Factory Act guidance', coverage: 76, tone: 'amber' },
  { name: 'Equipment inspection', source: 'DGMS-aligned checklist', coverage: 82, tone: 'violet' },
];

export default function Compliance() {
  const [findings, setFindings] = useState(initialFindings);
  const [filter, setFilter] = useState<'all' | FindingStatus>('all');
  const [selectedId, setSelectedId] = useState('CF-014');

  const visible = useMemo(() => filter === 'all' ? findings : findings.filter((finding) => finding.status === filter), [filter, findings]);
  const selected = findings.find((finding) => finding.id === selectedId) || findings[0];
  const openCount = findings.filter((finding) => finding.status === 'open').length;
  const verifiedCount = findings.filter((finding) => finding.status === 'verified').length;

  const advanceFinding = (id: string) => {
    setFindings((current) => current.map((finding) => {
      if (finding.id !== id) return finding;
      const next: FindingStatus = finding.status === 'open' ? 'in_progress' : finding.status === 'in_progress' ? 'verified' : 'verified';
      return { ...finding, status: next };
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Audit"
        subtitle="Continuously compare permit, inspection and response evidence against the demo safety guidance corpus."
        meta={<div className="flex flex-wrap items-center gap-2"><StatusBadge variant="dot" pulse className="border-amber-500/30 bg-amber-500/10 text-amber-300">Simulation mode</StatusBadge><span className="font-mono text-[11px] text-zinc-500">Evidence review · current shift</span></div>}
        actions={<button className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500"><Plus className="h-3.5 w-3.5" />New finding</button>}
      />

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/80"><div className="flex items-start gap-3"><FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p><span className="font-semibold text-amber-200">Guidance notice:</span> references shown here are prototype evidence links for the demo. Final regulatory interpretations must be verified by a qualified safety professional.</p></div></div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open findings" value={openCount} icon={ShieldAlert} tone="red" footnote="Require action" />
        <KpiCard label="In progress" value={findings.filter((finding) => finding.status === 'in_progress').length} icon={ListChecks} tone="amber" footnote="Owners assigned" />
        <KpiCard label="Verified" value={verifiedCount} icon={ClipboardCheck} tone="emerald" footnote="Evidence accepted" />
        <KpiCard label="Coverage score" value="86" unit="%" icon={Gavel} tone="violet" footnote="Across four control domains" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-glass rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Findings register</p><h2 className="mt-1 text-sm font-semibold text-zinc-100">Evidence gaps and corrective actions</h2></div><div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-950/40 p-0.5">{(['all', 'open', 'in_progress', 'verified'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-2 py-1.5 text-[10px] capitalize ${filter === item ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'}`}>{item === 'in_progress' ? 'in progress' : item}</button>)}</div></div>
          <div className="mt-4 space-y-2">
            {visible.map((finding) => <button key={finding.id} onClick={() => setSelectedId(finding.id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedId === finding.id ? 'border-cyan-500/35 bg-cyan-500/[0.05]' : 'border-zinc-800/70 bg-zinc-900/30 hover:border-zinc-700'}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${finding.severity === 'critical' ? 'border-red-500/30 bg-red-500/10 text-red-300' : finding.severity === 'high' ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}><FileCheck2 className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-cyan-300">{finding.id}</span><span className={`rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${statusClasses(finding.status)}`}>{finding.status.replace('_', ' ')}</span></div><p className="mt-1 text-xs font-medium leading-relaxed text-zinc-200">{finding.title}</p><p className="mt-1 text-[11px] text-zinc-500">{finding.area} · {finding.source}</p></div><span className={`shrink-0 font-mono text-[10px] uppercase ${severityText(finding.severity)}`}>{finding.severity}</span></div></button>)}
          </div>
        </section>

        <section className="surface-glass rounded-xl p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Finding detail</p><h2 className="mt-1 text-sm font-semibold text-zinc-100">{selected.id} · corrective action</h2></div><StatusBadge variant="outline" className={statusClasses(selected.status)}>{selected.status.replace('_', ' ')}</StatusBadge></div>
          <h3 className="mt-5 text-base font-semibold leading-relaxed text-zinc-100">{selected.title}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2"><Info label="Source" value={selected.source} icon={Gavel} /><Info label="Area" value={selected.area} icon={MapPin} /><Info label="Owner" value={selected.owner} icon={UserRound} /><Info label="Due" value={selected.due} icon={Clock3} /></div>
          <div className="mt-4 rounded-lg border border-zinc-800/70 bg-zinc-950/35 p-4"><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Evidence captured</p><p className="mt-2 text-xs text-zinc-300">{selected.evidence}</p><div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300"><Check className="h-3.5 w-3.5" />Linked to the simulation evidence graph</div></div>
          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.05] p-4"><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-cyan-300">Recommended action</p><p className="mt-2 text-xs leading-relaxed text-zinc-300">{selected.recommendation}</p></div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800/60 pt-4"><button onClick={() => advanceFinding(selected.id)} disabled={selected.status === 'verified'} className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">{selected.status === 'open' ? 'Assign action' : selected.status === 'in_progress' ? 'Mark verified' : 'Verified'} <ArrowRight className="h-3.5 w-3.5" /></button><button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900"><Sparkles className="h-3.5 w-3.5" />Draft response</button></div>
        </section>
      </div>

      <section className="surface-glass rounded-xl p-5"><div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-violet-300" /><div><p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">Coverage map</p><h2 className="mt-1 text-sm font-semibold text-zinc-100">Regulatory and procedural evidence coverage</h2></div></div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{coverage.map((item) => <div key={item.name} className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-zinc-200">{item.name}</p><span className={`font-mono text-xs ${coverageText(item.tone)}`}>{item.coverage}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className={`h-full rounded-full ${coverageBar(item.tone)}`} style={{ width: `${item.coverage}%` }} /></div><p className="mt-2 text-[11px] text-zinc-500">{item.source}</p></div>)}</div></section>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Gavel }) { return <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3"><Icon className="h-3.5 w-3.5 text-zinc-500" /><p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-1 truncate text-xs text-zinc-200">{value}</p></div>; }
function statusClasses(status: FindingStatus) { return status === 'verified' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : status === 'in_progress' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-red-500/30 bg-red-500/10 text-red-300'; }
function severityText(severity: FindingSeverity) { return severity === 'critical' ? 'text-red-300' : severity === 'high' ? 'text-orange-300' : 'text-amber-300'; }
function coverageText(tone: string) { return tone === 'emerald' ? 'text-emerald-300' : tone === 'amber' ? 'text-amber-300' : tone === 'violet' ? 'text-violet-300' : 'text-cyan-300'; }
function coverageBar(tone: string) { return tone === 'emerald' ? 'bg-emerald-400' : tone === 'amber' ? 'bg-amber-400' : tone === 'violet' ? 'bg-violet-400' : 'bg-cyan-400'; }
