import { type ReactNode } from 'react';

interface StatusBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dot' | 'outline';
  pulse?: boolean;
}

export default function StatusBadge({
  children,
  className = '',
  variant = 'outline',
  pulse = false,
}: StatusBadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider';
  const style = variant === 'outline' ? base : `${base} bg-transparent border-current`;
  return (
    <span className={`${style} ${className}`}>
      {variant === 'dot' && (
        <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'live-dot' : ''}`} />
      )}
      {children}
    </span>
  );
}