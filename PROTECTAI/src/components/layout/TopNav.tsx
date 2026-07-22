import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  User,
  KeyRound,
  CircleHelp,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import StatusBadge from '../ui/StatusBadge';
import { useSimulation } from '../../hooks/useSimulation';

const titleMap: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p.startsWith('/dashboard'), title: 'Operations Dashboard' },
  { match: (p) => p.startsWith('/risk-intelligence'), title: 'Risk Intelligence' },
  { match: (p) => p.startsWith('/permit-risk'), title: 'Permit Risk Center' },
  { match: (p) => p.startsWith('/compliance'), title: 'Compliance Audit' },
  { match: (p) => p.startsWith('/monitoring'), title: 'Live Monitoring' },
  { match: (p) => p.startsWith('/factory-map'), title: 'Factory Map' },
  { match: (p) => p.startsWith('/incidents'), title: 'Incidents' },
  { match: (p) => p.startsWith('/reports'), title: 'Reports' },
  { match: (p) => p.startsWith('/analytics'), title: 'Analytics' },
  { match: (p) => p.startsWith('/copilot'), title: 'AI Copilot' },
  { match: (p) => p.startsWith('/settings'), title: 'Settings' },
];

function deriveTitle(pathname: string): string {
  const match = titleMap.find((m) => m.match(pathname));
  return match?.title || 'Protect AI';
}

export default function TopNav({ onOpenMobileSidebar }: { onOpenMobileSidebar?: () => void }) {
  const { user, signOut } = useAuth();
  const { stage } = useSimulation();
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const initials = (user?.name || 'OP')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-800/70 bg-zinc-950/70 px-4 backdrop-blur md:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h2 className="hidden truncate text-sm font-medium text-zinc-300 md:block">
          {deriveTitle(location.pathname)}
        </h2>

        <div className="hidden flex-1 items-center md:flex md:max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search incidents, zones, sensors…"
              className="h-9 w-full rounded-lg border border-zinc-800/70 bg-zinc-900/40 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge
          variant="dot"
          pulse={stage !== 'baseline'}
          className={`hidden lg:inline-flex ${
            stage === 'critical' || stage === 'response'
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : stage === 'rising'
              ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
              : stage === 'permit'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {stage === 'baseline' ? 'All systems nominal' : stage === 'response' ? 'Response active' : 'Simulation event active'}
        </StatusBadge>

        <div className="hidden items-center gap-1.5 rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-400 lg:flex">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-mono">{now.toLocaleString(undefined, { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800/70 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
              3
            </span>
          </button>
          {notifOpen && (
            <div
              className="surface-glass-strong absolute right-0 top-11 z-40 w-80 rounded-xl p-2 shadow-2xl shadow-black/40"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <p className="px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Notifications
              </p>
              <ul className="space-y-1 text-sm">
                <li className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-red-300">Critical · H2S-RX-01</p>
                    <span className="font-mono text-[10px] text-zinc-500">2m</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-300">
                    Hydrogen sulphide approaching upper threshold in Reactor Bay A.
                  </p>
                </li>
                <li className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-300">High · Restricted zone</p>
                    <span className="font-mono text-[10px] text-zinc-500">21m</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-300">
                    Personnel detected inside Storage Tank Farm without permit.
                  </p>
                </li>
                <li className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-300">Medium · Camera</p>
                    <span className="font-mono text-[10px] text-zinc-500">2h</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-300">
                    CAM-LD-02 has been offline for 6 hours.
                  </p>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/40 pl-1.5 pr-2 text-zinc-200 hover:bg-zinc-900"
            aria-label="User menu"
          >
            <Avatar initials={initials} size="xs" status="online" />
            <span className="hidden text-xs font-medium md:inline">{user?.name?.split(' ')[0] || 'Operator'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </button>
          {menuOpen && (
            <div
              className="surface-glass-strong absolute right-0 top-11 z-40 w-56 rounded-xl p-1.5 shadow-2xl shadow-black/40"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="border-b border-zinc-800/70 px-3 py-2">
                <p className="truncate text-xs font-medium text-zinc-100">{user?.name}</p>
                <p className="truncate text-[10.5px] text-zinc-500">{user?.email}</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/70"
              >
                <User className="h-3.5 w-3.5 text-zinc-500" />
                Profile
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/70"
              >
                <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                Security
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/70">
                <CircleHelp className="h-3.5 w-3.5 text-zinc-500" />
                Documentation
              </button>
              <div className="my-1 border-t border-zinc-800/70" />
              <button
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}