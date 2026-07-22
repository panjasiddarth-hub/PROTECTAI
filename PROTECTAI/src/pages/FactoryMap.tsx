import { useEffect, useMemo, useState } from 'react';
import { Map as MapIcon, Maximize2, Layers, ChevronRight, Users, Radio, Cpu } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import { api } from '../lib/api';
import type { Zone, Worker, Sensor, Camera as CameraType } from '../lib/types';
import { riskBarClasses, riskBarWidth, statusText } from '../lib/utils';

interface ZoneLayout {
  code: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

const layout: ZoneLayout[] = [
  { code: 'Z-01', label: 'Reactor Bay A', x: 80, y: 80, w: 240, h: 140 },
  { code: 'Z-02', label: 'Distillation', x: 340, y: 80, w: 200, h: 140 },
  { code: 'Z-03', label: 'Cooling Tower', x: 560, y: 80, w: 160, h: 140 },
  { code: 'Z-04', label: 'Tank Farm', x: 740, y: 80, w: 180, h: 200 },
  { code: 'Z-05', label: 'Loading Dock', x: 740, y: 300, w: 180, h: 140 },
  { code: 'Z-06', label: 'Control Room', x: 380, y: 280, w: 160, h: 100 },
  { code: 'Z-07', label: 'Workshop', x: 80, y: 280, w: 280, h: 140 },
  { code: 'Z-08', label: 'Admin Block', x: 380, y: 400, w: 340, h: 100 },
];

export default function FactoryMap() {
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [workers, setWorkers] = useState<Worker[] | null>(null);
  const [sensors, setSensors] = useState<Sensor[] | null>(null);
  const [cameras, setCameras] = useState<CameraType[] | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>('Reactor Bay A');

  useEffect(() => {
    Promise.all([
      api.get<Zone[]>('/zones'),
      api.get<Worker[]>('/workers'),
      api.get<Sensor[]>('/sensors'),
      api.get<CameraType[]>('/cameras'),
    ]).then(([z, w, s, c]) => {
      setZones(z);
      setWorkers(w);
      setSensors(s);
      setCameras(c);
    });
  }, []);

  const zoneMap = useMemo(() => {
    const m = new Map<string, Zone>();
    zones?.forEach((z) => m.set(z.name, z));
    return m;
  }, [zones]);

  const selectedZoneData = selectedZone ? zoneMap.get(selectedZone) : null;
  const selectedWorkers = workers?.filter((w) => w.zone === selectedZone) || [];
  const selectedSensors = sensors?.filter((s) => s.zone === selectedZone) || [];
  const selectedCameras = cameras?.filter((c) => c.zone === selectedZone) || [];

  if (!zones) return <LoadingState label="Loading facility map" rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Map"
        subtitle="Interactive plant schematic with live zone status, worker locations and equipment."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            8 zones · {zones.reduce((acc, z) => acc + z.workers_count, 0)} workers ·
            {' '}
            {zones.reduce((acc, z) => acc + z.sensors_count, 0)} sensors
          </span>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Layers className="h-3.5 w-3.5" />
              Layers
            </button>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <Maximize2 className="h-3.5 w-3.5" />
              Fullscreen
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* Schematic */}
        <div className="surface-glass relative overflow-hidden rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <MapIcon className="h-4 w-4 text-cyan-400" />
              Plant schematic
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <Legend color="bg-emerald-400" label="Low" />
              <Legend color="bg-amber-400" label="Medium" />
              <Legend color="bg-orange-400" label="High" />
              <Legend color="bg-red-500" label="Critical" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-zinc-800/70 bg-gradient-to-br from-zinc-950 to-zinc-900">
            <svg viewBox="0 0 1000 540" className="w-full" style={{ aspectRatio: '1000 / 540' }}>
              <defs>
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(63,63,70,0.35)" strokeWidth="1" />
                </pattern>
                <linearGradient id="map-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a0e14" />
                  <stop offset="100%" stopColor="#06090f" />
                </linearGradient>
              </defs>
              <rect width="1000" height="540" fill="url(#map-bg)" />
              <rect width="1000" height="540" fill="url(#map-grid)" opacity="0.6" />

              {/* Roads / outer boundary */}
              <path d="M 40 40 L 960 40 L 960 500 L 40 500 Z" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 60 460 L 940 460" stroke="#3f3f46" strokeWidth="6" opacity="0.5" />

              {/* Zones */}
              {layout.map((l) => {
                const zone = zoneMap.get(l.label);
                const risk = zone?.risk_level || 'low';
                const fill =
                  risk === 'critical' ? 'rgba(239,68,68,0.10)' :
                  risk === 'high' ? 'rgba(249,115,22,0.10)' :
                  risk === 'medium' ? 'rgba(245,158,11,0.08)' :
                  'rgba(16,185,129,0.08)';
                const stroke =
                  risk === 'critical' ? 'rgba(239,68,68,0.6)' :
                  risk === 'high' ? 'rgba(249,115,22,0.6)' :
                  risk === 'medium' ? 'rgba(245,158,11,0.55)' :
                  'rgba(16,185,129,0.55)';
                const isSelected = selectedZone === l.label;
                const status = zone?.status || 'operational';
                const restricted = status === 'restricted' || status === 'evacuated';
                return (
                  <g
                    key={l.code}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedZone(l.label)}
                  >
                    <rect
                      x={l.x}
                      y={l.y}
                      width={l.w}
                      height={l.h}
                      rx="6"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    {isSelected && (
                      <rect
                        x={l.x - 4}
                        y={l.y - 4}
                        width={l.w + 8}
                        height={l.h + 8}
                        rx="8"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                    )}
                    {/* Code badge */}
                    <rect x={l.x + 8} y={l.y + 8} width="42" height="18" rx="3" fill="#0a0e14" stroke="#3f3f46" />
                    <text x={l.x + 12} y={l.y + 21} fontSize="10" fontFamily="JetBrains Mono" fill="#a1a1aa">
                      {l.code}
                    </text>

                    <text x={l.x + 8} y={l.y + l.h - 14} fontSize="14" fontWeight="600" fill="#e4e4e7">
                      {l.label}
                    </text>
                    <text x={l.x + 8} y={l.y + l.h - 30} fontSize="10" fill="#71717a" fontFamily="JetBrains Mono">
                      {zone?.workers_count ?? 0}W · {zone?.sensors_count ?? 0}S · {zone?.machines_count ?? 0}M
                    </text>

                    {restricted && (
                      <>
                        <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.7">
                          <line x1={l.x + 12} y1={l.y + 38} x2={l.x + 36} y2={l.y + 62} />
                          <line x1={l.x + 36} y1={l.y + 38} x2={l.x + 12} y2={l.y + 62} />
                        </g>
                        <text x={l.x + 44} y={l.y + 56} fontSize="9" fill="#fca5a5" fontFamily="JetBrains Mono">
                          {statusText(status).toUpperCase()}
                        </text>
                      </>
                    )}

                    {/* risk dot */}
                    <circle
                      cx={l.x + l.w - 14}
                      cy={l.y + 14}
                      r="5"
                      fill={
                        risk === 'critical' ? '#ef4444' :
                        risk === 'high' ? '#f97316' :
                        risk === 'medium' ? '#f59e0b' :
                        '#10b981'
                      }
                    />
                    <circle
                      cx={l.x + l.w - 14}
                      cy={l.y + 14}
                      r="9"
                      fill="none"
                      stroke={
                        risk === 'critical' ? '#ef4444' :
                        risk === 'high' ? '#f97316' :
                        risk === 'medium' ? '#f59e0b' :
                        '#10b981'
                      }
                      opacity="0.4"
                    >
                      <animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}

              {/* Worker dots scattered */}
              {workers?.slice(0, 14).map((w, i) => {
                const zl = layout.find((l) => l.label === w.zone);
                if (!zl) return null;
                const seed = (w.badge_id.charCodeAt(0) + i) % 100;
                const cx = zl.x + 30 + ((seed * 13) % (zl.w - 50));
                const cy = zl.y + 50 + ((seed * 7) % (zl.h - 80));
                return (
                  <g key={w.id}>
                    <circle cx={cx} cy={cy} r="3.5" fill="#22d3ee" />
                    <circle cx={cx} cy={cy} r="6" fill="rgba(34,211,238,0.18)" />
                  </g>
                );
              })}

              {/* Compass / legend */}
              <g transform="translate(900 480)">
                <circle cx="0" cy="0" r="20" fill="#0a0e14" stroke="#3f3f46" />
                <text x="0" y="-4" textAnchor="middle" fontSize="9" fill="#a1a1aa" fontFamily="JetBrains Mono">N</text>
                <path d="M 0 -14 L -3 -6 L 3 -6 Z" fill="#22d3ee" />
              </g>
            </svg>
          </div>
        </div>

        {/* Detail panel */}
        <aside className="surface-glass rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Zone detail
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">
                {selectedZone || 'Select a zone'}
              </p>
            </div>
            {selectedZoneData && (
              <StatusBadge
                variant="dot"
                className={
                  selectedZoneData.risk_level === 'critical'
                    ? 'border-red-500/40 bg-red-500/10 text-red-300'
                    : selectedZoneData.risk_level === 'high'
                    ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                    : selectedZoneData.risk_level === 'medium'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                }
              >
                {selectedZoneData.risk_level}
              </StatusBadge>
            )}
          </div>

          {selectedZoneData ? (
            <div className="mt-3 space-y-4">
              <p className="text-xs leading-relaxed text-zinc-400">{selectedZoneData.description}</p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                  <span>Risk</span>
                  <span className={`font-mono ${
                    selectedZoneData.risk_level === 'critical' ? 'text-red-300' :
                    selectedZoneData.risk_level === 'high' ? 'text-orange-300' :
                    selectedZoneData.risk_level === 'medium' ? 'text-amber-300' :
                    'text-emerald-300'
                  }`}>{selectedZoneData.risk_level}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                  <div
                    className={`h-full rounded-full ${riskBarClasses(selectedZoneData.risk_level)}`}
                    style={{ width: `${riskBarWidth(selectedZoneData.risk_level)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-3">
                <Tile icon={Users} label="Workers" value={selectedZoneData.workers_count} />
                <Tile icon={Radio} label="Sensors" value={selectedZoneData.sensors_count} />
                <Tile icon={Cpu} label="Machines" value={selectedZoneData.machines_count} />
              </div>

              <Section icon={Users} title="Workers on duty">
                <ul className="space-y-1.5">
                  {selectedWorkers.slice(0, 5).map((w) => (
                    <li key={w.id} className="flex items-center justify-between rounded-md border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs">
                      <div className="min-w-0">
                        <p className="truncate text-zinc-100">{w.name}</p>
                        <p className="truncate text-[10.5px] text-zinc-500">{w.role}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        w.status === 'on_duty' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                        w.status === 'on_break' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' :
                        'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
                      }`}>
                        {w.status === 'on_duty' ? 'On duty' : statusText(w.status)}
                      </span>
                    </li>
                  ))}
                  {selectedWorkers.length === 0 && (
                    <li className="text-[11px] text-zinc-500">No workers currently in this zone.</li>
                  )}
                </ul>
              </Section>

              <Section icon={Radio} title="Live sensors">
                <ul className="space-y-1.5">
                  {selectedSensors.slice(0, 5).map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-md border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs">
                      <div className="min-w-0">
                        <p className="truncate text-zinc-100">{s.name}</p>
                        <p className="text-[10.5px] capitalize text-zinc-500">{s.type}</p>
                      </div>
                      <p className="font-mono text-zinc-200">
                        {Number.isInteger(s.value) ? s.value : s.value.toFixed(1)}
                        <span className="ml-0.5 text-[10px] text-zinc-500">{s.unit}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon={Cpu} title="Cameras">
                <ul className="space-y-1.5">
                  {selectedCameras.map((c) => (
                    <li key={c.id} className="flex items-center justify-between rounded-md border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs">
                      <div className="min-w-0">
                        <p className="truncate text-zinc-100">{c.name}</p>
                        <p className="truncate text-[10.5px] text-zinc-500">{c.location}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        c.status === 'online' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                        c.status === 'maintenance' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' :
                        'border-red-500/30 bg-red-500/10 text-red-300'
                      }`}>{c.status}</span>
                    </li>
                  ))}
                  {selectedCameras.length === 0 && (
                    <li className="text-[11px] text-zinc-500">No cameras in this zone.</li>
                  )}
                </ul>
              </Section>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15">
                Open zone dossier
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <p className="mt-6 text-center text-xs text-zinc-500">
              Click any zone in the schematic to inspect its telemetry.
            </p>
          )}
        </aside>
      </div>

      {/* Zone strip */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
          All zones
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.name)}
              className={`group flex flex-col rounded-lg border p-3 text-left transition-colors ${
                selectedZone === z.name
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{z.code}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${riskBarClasses(z.risk_level)}`} />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-zinc-100">{z.name}</p>
              <p className="text-[10.5px] text-zinc-500">{z.area}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-400">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Tile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-zinc-500" />
      <p className="mt-1 font-mono text-sm font-semibold text-zinc-100">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        <Icon className="h-3 w-3" />
        {title}
      </h3>
      {children}
    </div>
  );
}