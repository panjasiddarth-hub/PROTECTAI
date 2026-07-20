interface LoadingStateProps {
  label?: string;
  rows?: number;
}

export default function LoadingState({ label = 'Loading', rows = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        {label}…
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-md border border-zinc-800/60 bg-zinc-900/40"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}