import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-500">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        {description && <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}