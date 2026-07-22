import RiskMeter from '../ui/RiskMeter';

interface Props {
  riskIndex: number;
  compliance: number;
}

export default function RiskPanel({ riskIndex, compliance }: Props) {
  return (
    <div className="surface-glass relative overflow-hidden rounded-xl p-5">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Plant Risk Posture
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        Real-time aggregate of incidents, sensors and PPE compliance.
      </p>

      <div className="mt-3 flex justify-center">
        <RiskMeter value={riskIndex} caption={`Composite of ${compliance}% compliance baseline`} />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-zinc-800/70 pt-3">
        <Pill label="Low" value="46%" tone="emerald" />
        <Pill label="Medium" value="34%" tone="amber" />
        <Pill label="High" value="20%" tone="red" />
      </div>
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' | 'red' }) {
  const map = {
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    red: 'text-red-300',
  };
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm ${map[tone]}`}>{value}</p>
    </div>
  );
}