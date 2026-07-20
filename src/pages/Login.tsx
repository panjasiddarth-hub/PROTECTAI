import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Factory,
  Flame,
  Droplets,
  Wind,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo@protectai.io');
  const [password, setPassword] = useState('protectai-demo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-app-canvas grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-zinc-800/70 lg:block">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.07] via-transparent to-violet-500/[0.05]" />

        {/* Schematic illustration */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.18]"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Industrial schematic outline */}
            <g fill="none" stroke="url(#lg)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M120 540 L120 360 L200 280 L300 280 L300 540" />
              <path d="M340 540 L340 320 L420 240 L520 240 L520 540" />
              <path d="M560 540 L560 380 L640 300 L720 300 L720 540" />
              <line x1="60" y1="540" x2="780" y2="540" />
              <line x1="60" y1="600" x2="780" y2="600" />
              <circle cx="200" cy="280" r="10" />
              <circle cx="420" cy="240" r="10" />
              <circle cx="640" cy="300" r="10" />
              <path d="M180 540 L180 460 L240 460 L240 540" />
              <path d="M400 540 L400 480 L460 480 L460 540" />
              <path d="M620 540 L620 440 L680 440 L680 540" />
              {/* connection lines */}
              <path d="M210 280 L410 240" strokeDasharray="4 4" opacity="0.6" />
              <path d="M430 240 L630 300" strokeDasharray="4 4" opacity="0.6" />
            </g>
            {/* moving data points */}
            <g>
              <circle r="3" fill="#22d3ee">
                <animateMotion dur="6s" repeatCount="indefinite" path="M210 280 L410 240 L630 300" />
              </circle>
              <circle r="3" fill="#10b981">
                <animateMotion dur="8s" repeatCount="indefinite" path="M120 540 L300 540 L520 540 L720 540" />
              </circle>
              <circle r="3" fill="#f59e0b">
                <animateMotion dur="10s" repeatCount="indefinite" path="M60 600 L780 600" />
              </circle>
            </g>
          </svg>
        </div>

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-sky-600/30 ring-1 ring-cyan-500/40">
              <ShieldCheck className="h-5 w-5 text-cyan-300" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold text-zinc-50">Protect AI</p>
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
                Industrial Safety Intelligence
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
              Continuous safety intelligence for the world&rsquo;s most demanding
              <span className="text-gradient-cyan"> industrial operations.</span>
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Unify gas, fire, vibration, video and worker telemetry into a single
              operational picture. Detect hazards earlier, respond faster, and
              prove compliance across every shift.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <CapabilityChip icon={Factory} label="Refineries & petrochemicals" />
              <CapabilityChip icon={Flame} label="Power & energy plants" />
              <CapabilityChip icon={Droplets} label="Chemical manufacturing" />
              <CapabilityChip icon={Wind} label="Oil & gas upstream" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/70 pt-6">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-emerald-400">99.99%</span> uptime SLA
              </span>
              <span>·</span>
              <span>ISO 27001 / SOC 2 Type II</span>
            </div>
            <span className="font-mono text-[10.5px] text-zinc-600">v3.2.0 · build 8421</span>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-cyan-400">
              Sign in to your workspace
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Welcome back</h2>
            <p className="text-sm text-zinc-400">
              Authenticate to access the Protect AI operations console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Work email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Password
                </label>
                <a href="#" className="text-[11px] text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/30"
                />
                Keep me signed in
              </label>
              <span className="font-mono text-[10.5px] text-zinc-500">SSO available</span>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-950" />
                  Authenticating…
                </>
              ) : (
                <>
                  Sign in securely
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-zinc-950 px-3 text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
              >
                <span className="font-semibold text-zinc-100">Microsoft Entra</span>
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
              >
                <span className="font-semibold text-zinc-100">Okta SSO</span>
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-zinc-300">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-cyan-300">
              Demo environment
            </p>
            <p className="mt-1 leading-relaxed text-zinc-400">
              Use any non-empty email and password. The session is held locally so
              you can explore every screen end-to-end.
            </p>
          </div>

          <p className="text-center text-[11px] text-zinc-600">
            Protected by Protect AI ·{' '}
            <a href="#" className="hover:text-zinc-300">Terms</a>{' · '}
            <a href="#" className="hover:text-zinc-300">Privacy</a>
          </p>
        </div>
      </section>
    </div>
  );
}

function CapabilityChip({ icon: Icon, label }: { icon: typeof Factory; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
      <Icon className="h-3.5 w-3.5 text-cyan-400" />
      <span>{label}</span>
      <ChevronRight className="ml-auto h-3 w-3 text-zinc-600" />
    </div>
  );
}