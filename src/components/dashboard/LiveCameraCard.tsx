import { useEffect, useState } from 'react';
import { Camera, Maximize2, Volume2, MoreHorizontal, Circle, Eye } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatRelative } from '../../lib/utils';
import type { Camera as CameraType } from '../../lib/types';
import { api } from '../../lib/api';

interface Props {
  initialCamera?: CameraType;
}

export default function LiveCameraCard({ initialCamera }: Props) {
  const [camera, setCamera] = useState<CameraType | null>(initialCamera || null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (initialCamera) return;
    api
      .get<CameraType[]>('/cameras')
      .then((rows) => {
        const online = rows.find((c) => c.status === 'online') || rows[0];
        setCamera(online || null);
      })
      .catch(() => {});
  }, [initialCamera]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!camera) {
    return (
      <div className="surface-glass flex aspect-video items-center justify-center rounded-xl">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Establishing live feed…
        </div>
      </div>
    );
  }

  return (
    <div className="surface-glass relative overflow-hidden rounded-xl">
      {/* Video placeholder */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-violet-500/[0.05]" />
        <div className="absolute inset-0 scanlines" />

        {/* "Live" video mock — animated point + worker silhouette */}
        <svg
          viewBox="0 0 640 360"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id="lc-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lc-person" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* scene lines */}
          <g stroke="#27272a" strokeWidth="1" fill="none">
            <path d="M0 280 L640 280" />
            <path d="M0 220 L640 220" />
            <path d="M120 0 L120 360" />
            <path d="M320 0 L320 360" />
            <path d="M520 0 L520 360" />
          </g>
          {/* equipment silhouettes */}
          <g fill="#1f2937" stroke="#3f3f46" strokeWidth="0.8">
            <rect x="40" y="200" width="60" height="100" rx="3" />
            <rect x="160" y="170" width="50" height="120" rx="3" />
            <rect x="380" y="180" width="80" height="110" rx="3" />
            <rect x="520" y="160" width="70" height="140" rx="3" />
          </g>
          {/* glowing monitoring spot */}
          <circle cx={(200 + tick * 0.6) % 640} cy="240" r="50" fill="url(#lc-glow)">
            <animate attributeName="cx" values="200;520;200" dur="14s" repeatCount="indefinite" />
          </circle>
          {/* worker silhouette */}
          <g transform={`translate(${(220 + tick * 0.4) % 520} 215)`}>
            <circle cx="0" cy="0" r="6" fill="url(#lc-person)" />
            <rect x="-5" y="4" width="10" height="22" rx="3" fill="url(#lc-person)" />
          </g>
          {/* bounding box that follows the worker */}
          <g stroke="#22d3ee" strokeWidth="1.2" fill="none" opacity="0.8">
            <rect
              x={((220 + tick * 0.4) % 520) - 14}
              y={205}
              width="28"
              height="44"
              strokeDasharray="3 2"
            />
            <text
              x={((220 + tick * 0.4) % 520) - 12}
              y={200}
              fontFamily="JetBrains Mono"
              fontSize="9"
              fill="#22d3ee"
            >
              PPE OK · 98%
            </text>
          </g>
        </svg>

        {/* HUD overlays */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge variant="dot" pulse className="border-red-500/40 bg-red-500/15 text-red-200">
            LIVE
          </StatusBadge>
          <StatusBadge variant="outline" className="border-zinc-700/60 bg-zinc-900/60 text-zinc-200">
            {camera.resolution}
          </StatusBadge>
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/60 bg-zinc-900/70 text-zinc-300 backdrop-blur hover:bg-zinc-900"
            aria-label="Toggle audio"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/60 bg-zinc-900/70 text-zinc-300 backdrop-blur hover:bg-zinc-900"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/60 bg-zinc-900/70 text-zinc-300 backdrop-blur hover:bg-zinc-900"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-zinc-400">
              {camera.zone}
            </p>
            <p className="text-sm font-semibold text-zinc-100">{camera.location}</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10.5px] text-zinc-400">
            <Eye className="h-3 w-3 text-cyan-400" />
            <span>AI-VISION · 24 FPS</span>
            <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
            <span>REC</span>
          </div>
        </div>
      </div>

      {/* Footer strip with metadata */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Camera className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono">{camera.name}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <span className="font-mono">Last frame {formatRelative(camera.last_active)}</span>
          <span>·</span>
          <button className="text-cyan-400 hover:text-cyan-300">Switch camera →</button>
        </div>
      </div>
    </div>
  );
}