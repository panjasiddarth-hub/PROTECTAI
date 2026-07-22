import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Radar,
  Map,
  AlertTriangle,
  FileText,
  FileCheck2,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/risk-intelligence', label: 'Risk Intelligence', icon: Radar },
  { to: '/permit-risk', label: 'Permit Risk Center', icon: FileCheck2 },
  { to: '/compliance', label: 'Compliance Audit', icon: ClipboardCheck },
  { to: '/monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/factory-map', label: 'Factory Map', icon: Map },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/copilot', label: 'AI Copilot', icon: Sparkles },
];

const footerItems = [{ to: '/settings', label: 'Settings', icon: Settings }];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const initials = (user?.name || 'OP')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800/70 bg-zinc-950/80 backdrop-blur md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800/70 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 to-sky-600/30 ring-1 ring-cyan-500/40">
          <ShieldCheck className="h-4 w-4 text-cyan-300" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-zinc-50">Protect AI</p>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">Safety Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                      strokeWidth={1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-2 pb-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          Account
        </p>
        <ul className="space-y-1">
          {footerItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                    strokeWidth={1.8}
                  />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800/70 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5">
          <Avatar initials={initials} size="sm" status="online" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium text-zinc-100">{user?.name || 'Operator'}</p>
            <p className="truncate text-[10.5px] text-zinc-500">{user?.role || 'Safety Lead'}</p>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">● Live</span>
        </div>
      </div>
    </aside>
  );
}