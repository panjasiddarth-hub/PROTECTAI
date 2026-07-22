import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  as: Tag = 'div',
}: GlassCardProps) {
  const surface = variant === 'strong' ? 'surface-glass-strong' : 'surface-glass';
  return (
    <Tag className={`${surface} rounded-xl ${paddingMap[padding]} ${className}`}>
      {children}
    </Tag>
  );
}