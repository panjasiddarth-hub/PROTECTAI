import { X, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/monitoring', label: 'Live Monitoring' },
  { to: '/factory-map', label: 'Factory Map' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/reports', label: 'Reports' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/copilot', label: 'AI Copilot' },
  { to: '/settings', label: 'Settings' },
];

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const initials = (user?.name || 'OP')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 border-r border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 ring-1 ring-cyan-500/40">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
            </div>
            <p className="text-sm font-semibold text-zinc-100">Protect AI</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'text-zinc-300 hover:bg-zinc-900'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-4">
          <Avatar initials={initials} size="sm" />
          <div>
            <p className="text-xs font-medium text-zinc-100">{user?.name}</p>
            <p className="text-[10.5px] text-zinc-500">{user?.role}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}