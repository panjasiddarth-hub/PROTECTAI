import { useEffect, useState, useMemo } from 'react';
import {
  Camera,
  Radio,
  Thermometer,
  Wind,
  Activity,
  Maximize2,
  Volume2,
  CircleDot,
  Filter,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import { api } from '../lib/api';
import type { Camera as CameraType, Sensor, AlertItem } from '../lib/types';
import { formatRelative, statusClasses, statusText, severityClasses } from '../lib/utils';

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState<CameraType[] | null>(null);
  const [sensors, setSensors] = useState<Sensor[] | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      api.get<CameraType[]>('/cameras'),
      api.get<Sensor[]>('/sensors'),
      api.get<AlertItem[]>('/alerts?limit=10'),
    ]).then(([c, s, a]) => {
      setCameras(c);
      setSensors(s);
      setAlerts(a);
    });
  }, []);

  const zones = useMemo(() => {
    const set = new Set<string>();
    cameras?.forEach((c) => set.add(c.zone));
    return ['all', ...Array.from(set)];
  }, [cameras]);

  const visibleCameras = cameras?.filter((c) => zoneFilter === 'all' || c.zone === zoneFilter) || [];

  if (!cameras || !sensors) return <LoadingState label="Loading live telemetry" rows={8} />;

  const gasSensors = sensors.filter((s) => s.type === 'gas');
  const tempSensors = sensors.filter((s) => s.type === 'temperature');
  const pressureSensors = sensors.filter((s) => s.type === 'pressure');
  const vibrationSensors = sensors.filter((s) => s.type === 'vibration');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        subtitle="Real-time video, gas, temperature, pressure and vibration telemetry across every zone."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            Streaming · {visibleCameras.length} cameras · {sensors.length} sensors
          </span>
        }
        actions={
          <>
            <div className="flex h-9 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-1 text-xs">
              <Filter className="ml-1 h-3.5 w-3.5 text-zinc-500" />
              {zones.slice(0, 5).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoneFilter(z)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    zoneFilter === z
                      ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  {z === 'all' ? 'All zones' : z}
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Cameras grid */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Camera className="h-4 w-4 text-cyan-400" />
          Camera grid
          <span className="font-mono text-[10.5px] text-zinc-500">
            ({visibleCameras.length} streams)
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleCameras.map((cam) => (
            <CameraTile key={cam.id} camera={cam} />
          ))}
        </div>
      </section>

      {/* Sensor telemetry */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Radio className="h-4 w-4 text-cyan-400" />
          Sensor telemetry
          <span className="font-mono text-[10.5px] text-zinc-500">({sensors.length} channels)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SensorGroup icon={Wind} title="Gas detection" sensors={gasSensors} unitHint="ppm / %LEL" />
          <SensorGroup icon={Thermometer} title="Temperature" sensors={tempSensors} unitHint="°C" />
          <SensorGroup icon={Activity} title="Pressure" sensors={pressureSensors} unitHint="bar" />
          <SensorGroup icon={CircleDot} title="Vibration" sensors={vibrationSensors} unitHint="mm/s" />
        </div>
      </section>

      {/* Live alerts feed */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Radio className="h-4 w-4 text-cyan-400" />
          Live alert feed
        </h2>
        <div className="surface-glass space-y-2 rounded-xl p-4">
          {(alerts || []).slice(0, 8).map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                a.severity === 'critical' ? 'bg-red-400' :
                a.severity === 'high' ? 'bg-orange-400' :
                a.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
              } ${a.acknowledged ? 'opacity-40' : 'live-dot'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${severityClasses(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className="font-mono text-[10.5px] text-zinc-500">{formatRelative(a.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-100">{a.message}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {a.source} · {a.zone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CameraTile({ camera }: { camera: CameraType }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const online = camera.status === 'online';

  return (
    <div className="surface-glass relative overflow-hidden rounded-xl">
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 scanlines" />
        {online ? (
          <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id={`t-glow-${camera.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g stroke="#27272a" strokeWidth="1" fill="none">
              <path d="M0 130 L320 130" />
              <path d="M0 100 L320 100" />
              <path d="M60 0 L60 180" />
              <path d="M180 0 L180 180" />
            </g>
            <g fill="#1f2937" stroke="#3f3f46" strokeWidth="0.6">
              <rect x="20" y="80" width="40" height="60" rx="2" />
              <rect x="100" y="70" width="50" height="70" rx="2" />
              <rect x="220" y="60" width="60" height="80" rx="2" />
            </g>
            <circle cx={(80 + tick * 0.5) % 280} cy="120" r="30" fill={`url(#t-glow-${camera.id})`}>
              <animate attributeName="cx" values="80;260;80" dur="10s" repeatCount="indefinite" />
            </circle>
            <g transform={`translate(${(90 + tick * 0.3) % 240} 105)`}>
              <circle cx="0" cy="0" r="3" fill="#22d3ee" opacity="0.9" />
              <rect x="-3" y="2" width="6" height="14" rx="2" fill="#22d3ee" opacity="0.6" />
            </g>
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">
            {statusText(camera.status)} · no signal
          </div>
        )}

        <div className="absolute left-2 top-2">
          <StatusBadge
            variant="dot"
            pulse={online}
            className={
              online
                ? 'border-red-500/40 bg-red-500/15 text-red-200'
                : 'border-zinc-700 bg-zinc-900/70 text-zinc-400'
            }
          >
            {online ? 'LIVE' : statusText(camera.status)}
          </StatusBadge>
        </div>

        <div className="absolute right-2 top-2 flex gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700/60 bg-zinc-900/70 text-zinc-300 backdrop-blur hover:bg-zinc-900">
            <Volume2 className="h-3 w-3" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700/60 bg-zinc-900/70 text-zinc-300 backdrop-blur hover:bg-zinc-900">
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">{camera.zone}</p>
            <p className="truncate text-xs font-medium text-zinc-100">{camera.location}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/60 px-3 py-2">
        <span className="font-mono text-[10.5px] text-zinc-400">{camera.name}</span>
        <span className="font-mono text-[10.5px] text-zinc-500">{camera.resolution}</span>
      </div>
    </div>
  );
}

function SensorGroup({
  icon: Icon,
  title,
  sensors,
  unitHint,
}: {
  icon: typeof Wind;
  title: string;
  sensors: Sensor[];
  unitHint: string;
}) {
  return (
    <div className="surface-glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">{title}</p>
            <p className="font-mono text-[10.5px] text-zinc-500">{sensors.length} channels · {unitHint}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {sensors.map((s) => {
          const ratio = Math.max(
            0,
            Math.min(1, (s.value - s.threshold_min) / Math.max(1, s.threshold_max - s.threshold_min))
          );
          const tone = ratio > 0.85 ? 'red' : ratio > 0.7 ? 'amber' : 'cyan';
          return (
            <div key={s.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-100">{s.name}</p>
                  <p className="text-[11px] text-zinc-500">{s.zone}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-lg font-semibold ${
                    tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : 'text-zinc-100'
                  }`}>
                    {Number.isInteger(s.value) ? s.value : s.value.toFixed(1)}
                    <span className="ml-0.5 text-[11px] text-zinc-500">{s.unit}</span>
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {s.threshold_min}–{s.threshold_max} {s.unit}
                  </p>
                </div>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800/70">
                <div
                  className={`h-full rounded-full ${
                    tone === 'red' ? 'bg-red-500' : tone === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}