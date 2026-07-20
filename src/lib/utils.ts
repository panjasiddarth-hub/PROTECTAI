import type { Severity, IncidentStatus, WorkerStatus, ZoneRiskLevel } from './types';

// ─── Time / date helpers ────────────────────────────────────────────────────

export function formatRelative(iso?: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const future = diff < 0;
  const fmt = (n: number, unit: string) =>
    future ? `in ${n} ${unit}${n === 1 ? '' : 's'}` : `${n} ${unit}${n === 1 ? '' : 's'} ago`;

  if (abs < minute) return future ? 'in moments' : 'just now';
  if (abs < hour) return fmt(Math.round(abs / minute), 'minute');
  if (abs < day) return fmt(Math.round(abs / hour), 'hour');
  return fmt(Math.round(abs / day), 'day');
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// ─── Style helpers ──────────────────────────────────────────────────────────

export function severityClasses(sev: Severity | string | undefined): string {
  switch ((sev || '').toLowerCase()) {
    case 'critical':
      return 'bg-red-500/10 text-red-300 border-red-500/30';
    case 'high':
      return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
    case 'medium':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30';
  }
}

export function statusClasses(status: string | undefined): string {
  switch ((status || '').toLowerCase()) {
    case 'online':
    case 'operational':
    case 'on_duty':
    case 'active':
    case 'resolved':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'investigating':
    case 'monitoring':
    case 'on_break':
    case 'maintenance':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'open':
    case 'fault':
    case 'emergency':
    case 'evacuated':
      return 'bg-red-500/10 text-red-300 border-red-500/30';
    case 'restricted':
    case 'offline':
    case 'off_site':
      return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30';
    default:
      return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30';
  }
}

export function severityText(sev: string): string {
  return sev ? sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase() : '—';
}

export function statusText(status: string): string {
  if (!status) return '—';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function riskBarClasses(level: ZoneRiskLevel | string): string {
  switch ((level || '').toLowerCase()) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-amber-400';
    case 'low':
      return 'bg-emerald-500';
    default:
      return 'bg-zinc-500';
  }
}

export function riskBarWidth(level: ZoneRiskLevel | string): number {
  switch ((level || '').toLowerCase()) {
    case 'critical':
      return 100;
    case 'high':
      return 72;
    case 'medium':
      return 45;
    case 'low':
      return 22;
    default:
      return 50;
  }
}

// ─── Numeric helpers ────────────────────────────────────────────────────────

export function formatNumber(n: number | null | undefined, opts?: Intl.NumberFormatOptions): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString(undefined, opts);
}

export function pct(value: number): string {
  return `${Math.round(value)}%`;
}