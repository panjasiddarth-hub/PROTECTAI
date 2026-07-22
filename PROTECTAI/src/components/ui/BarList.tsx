interface BarListRow {
  label: string;
  value: number;
  tone?: 'cyan' | 'amber' | 'red' | 'emerald' | 'violet' | 'sky' | 'indigo';
}

interface BarListProps {
  rows: BarListRow[];
  max?: number;
}

const toneColor: Record<NonNullable<BarListRow['tone']>, string> = {
  cyan: 'bg-cyan-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
  indigo: 'bg-indigo-500',
};

export default function BarList({ rows, max }: BarListProps) {
  const ceiling = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => {
        const pct = Math.min(100, Math.round((r.value / ceiling) * 100));
        return (
          <li key={`${r.label}-${i}`}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate text-zinc-300">{r.label}</span>
              <span className="font-mono text-zinc-100">{r.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/70">
              <div
                className={`h-full rounded-full ${toneColor[r.tone || 'cyan']}`}
                style={{ width: `${pct}%`, transition: 'width 600ms ease' }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}