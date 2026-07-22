import { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Plug,
  KeyRound,
  ScrollText,
  Building2,
  Globe,
  Check,
  Save,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

type Tab = 'profile' | 'organization' | 'notifications' | 'security' | 'integrations' | 'api-keys' | 'audit';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
];

interface SettingsRow {
  id?: number;
  organization: string;
  timezone: string;
  notifications_email: boolean;
  notifications_sms: boolean;
  notifications_push: boolean;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  theme: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<SettingsRow>('/settings').then(setSettings).catch(() => {});
  }, []);

  const update = (patch: Partial<SettingsRow>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const result = await api.put<SettingsRow>('/settings', settings);
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <LoadingState label="Loading settings" rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, organization, security policies and integrations."
        actions={
          <>
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider text-emerald-300">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 px-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-sky-500 disabled:opacity-60"
            >
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="surface-glass h-fit rounded-xl p-2">
          <ul className="space-y-1">
            {tabs.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    tab === t.id
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
                  }`}
                >
                  <t.icon
                    className={`h-4 w-4 ${tab === t.id ? 'text-cyan-300' : 'text-zinc-500'}`}
                    strokeWidth={1.8}
                  />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <section className="surface-glass rounded-xl p-6">
          {tab === 'profile' && (
            <div className="space-y-6">
              <SectionHeader title="Profile" description="How your name appears across Protect AI." />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full name">
                  <input
                    defaultValue={user?.name}
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
                <Field label="Work email">
                  <input
                    defaultValue={user?.email}
                    type="email"
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
                <Field label="Role">
                  <input
                    defaultValue={user?.role}
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    placeholder="+44 20 7946 0000"
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === 'organization' && (
            <div className="space-y-6">
              <SectionHeader title="Organization" description="Plant identity, timezone and operational defaults." />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Organization name">
                  <input
                    value={settings.organization}
                    onChange={(e) => update({ organization: e.target.value })}
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
                <Field label="Timezone">
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <select
                      value={settings.timezone}
                      onChange={(e) => update({ timezone: e.target.value })}
                      className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/40 pl-9 pr-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    >
                      <option>UTC</option>
                      <option>Europe/London (UTC+0)</option>
                      <option>America/New_York (UTC−5)</option>
                      <option>Asia/Singapore (UTC+8)</option>
                      <option>Asia/Dubai (UTC+4)</option>
                    </select>
                  </div>
                </Field>
                <Field label="Theme">
                  <select
                    value={settings.theme}
                    onChange={(e) => update({ theme: e.target.value })}
                    className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  >
                    <option value="dark">Dark — Industrial</option>
                    <option value="dim">Dim</option>
                    <option value="high-contrast">High contrast</option>
                  </select>
                </Field>
                <Field label="Session timeout (minutes)">
                  <input
                    type="number"
                    value={settings.session_timeout_minutes}
                    onChange={(e) => update({ session_timeout_minutes: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-6">
              <SectionHeader
                title="Notifications"
                description="Choose which channels deliver critical alerts and shift updates."
              />
              <div className="space-y-3">
                <Toggle
                  label="Email"
                  description="Daily digest + critical alerts in real time"
                  checked={settings.notifications_email}
                  onChange={(v) => update({ notifications_email: v })}
                />
                <Toggle
                  label="SMS"
                  description="Only used for severity = critical events"
                  checked={settings.notifications_sms}
                  onChange={(v) => update({ notifications_sms: v })}
                />
                <Toggle
                  label="Push"
                  description="Browser push on this device"
                  checked={settings.notifications_push}
                  onChange={(v) => update({ notifications_push: v })}
                />
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <SectionHeader title="Security" description="Authentication, MFA and session policies." />
              <div className="space-y-3">
                <Toggle
                  label="Two-factor authentication"
                  description="Require a second factor on every sign-in."
                  checked={settings.two_factor_enabled}
                  onChange={(v) => update({ two_factor_enabled: v })}
                />
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-sm font-medium text-zinc-100">SSO enforcement</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Members of the <span className="font-mono text-zinc-300">safety-leads</span> group must
                    sign in via Microsoft Entra ID.
                  </p>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15">
                    Configure SSO
                  </button>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200">
                  <p className="font-medium">Recent suspicious activity</p>
                  <p className="mt-1 text-amber-300/80">
                    No unusual sign-ins detected in the last 7 days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="space-y-6">
              <SectionHeader
                title="Integrations"
                description="Connect Protect AI to your DCS, historian, CMMS and identity providers."
              />
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { name: 'Honeywell Experion', desc: 'DCS historian', status: 'connected' },
                  { name: 'Siemens PCS 7', desc: 'Process control', status: 'connected' },
                  { name: 'AVEVA PI', desc: 'Time-series data', status: 'available' },
                  { name: 'SAP PM', desc: 'Maintenance orders', status: 'available' },
                  { name: 'Microsoft Entra ID', desc: 'Identity', status: 'connected' },
                  { name: 'PagerDuty', desc: 'On-call routing', status: 'available' },
                ].map((it) => (
                  <li key={it.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{it.name}</p>
                      <p className="text-[11px] text-zinc-500">{it.desc}</p>
                    </div>
                    {it.status === 'connected' ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-emerald-300">
                        Connected
                      </span>
                    ) : (
                      <button className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/15">
                        Connect
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'api-keys' && (
            <div className="space-y-6">
              <SectionHeader title="API Keys" description="Manage programmatic access to Protect AI." />
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/60">
                    <tr className="text-left text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Prefix</th>
                      <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Scope</th>
                      <th className="hidden px-4 py-2.5 font-medium md:table-cell">Last used</th>
                      <th className="px-4 py-2.5 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {[
                      { name: 'Plant telemetry ingest', prefix: 'pk_live_4f1a…', scope: 'read · write', last: '2m ago' },
                      { name: 'Reporting service', prefix: 'pk_live_91b0…', scope: 'read', last: '12m ago' },
                      { name: 'Mobile operator app', prefix: 'pk_live_a27e…', scope: 'read', last: '4h ago' },
                    ].map((k) => (
                      <tr key={k.name} className="bg-zinc-950/40">
                        <td className="px-4 py-3 text-zinc-100">{k.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{k.prefix}</td>
                        <td className="hidden px-4 py-3 font-mono text-[11px] text-zinc-400 sm:table-cell">{k.scope}</td>
                        <td className="hidden px-4 py-3 font-mono text-[11px] text-zinc-500 md:table-cell">{k.last}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[11px] text-red-400 hover:text-red-300">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15">
                Generate new key
              </button>
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-6">
              <SectionHeader title="Audit log" description="Recent account and configuration activity." />
              <ul className="space-y-2">
                {[
                  { actor: 'Marcus Chen', action: 'Acknowledged alert H2S-RX-01', ts: '2 minutes ago' },
                  { actor: 'Priya Sharma', action: 'Approved hot-work permit #1148', ts: '14 minutes ago' },
                  { actor: 'James Okafor', action: 'Closed incident INC-2025-0108-009', ts: '32 minutes ago' },
                  { actor: 'Anika Patel', action: 'Updated zone Z-03 risk level', ts: '1 hour ago' },
                  { actor: 'System', action: 'API key "Plant telemetry ingest" rotated', ts: '3 hours ago' },
                ].map((entry, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3"
                  >
                    <div>
                      <p className="text-xs text-zinc-100">
                        <span className="font-medium">{entry.actor}</span>{' '}
                        <span className="text-zinc-400">{entry.action}</span>
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">{entry.ts}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div>
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-cyan-500' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}