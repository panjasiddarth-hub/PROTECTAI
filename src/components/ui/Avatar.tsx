interface AvatarProps {
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'sky' | 'indigo';
  status?: 'online' | 'break' | 'offline' | 'emergency';
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const toneBg: Record<NonNullable<AvatarProps['tone']>, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
  violet: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
};

const statusColor: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-emerald-400',
  break: 'bg-amber-400',
  offline: 'bg-zinc-500',
  emergency: 'bg-red-500',
};

function pickTone(initials: string): NonNullable<AvatarProps['tone']> {
  const tones: NonNullable<AvatarProps['tone']>[] = [
    'cyan',
    'violet',
    'amber',
    'emerald',
    'rose',
    'sky',
    'indigo',
  ];
  let sum = 0;
  for (const ch of initials) sum += ch.charCodeAt(0);
  return tones[sum % tones.length];
}

export default function Avatar({
  initials,
  size = 'sm',
  tone,
  status,
}: AvatarProps) {
  const t = tone ?? pickTone(initials);
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold ring-1 ${sizeMap[size]} ${toneBg[t]}`}
      >
        {initials}
      </span>
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950 ${statusColor[status]}`}
        />
      )}
    </span>
  );
}