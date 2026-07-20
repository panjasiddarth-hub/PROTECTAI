// Domain types shared across the frontend. Backed by the placeholder JSON
// responses from /api/* — keep these aligned with the API contract.

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'monitoring' | 'resolved';
export type WorkerStatus = 'on_duty' | 'on_break' | 'off_site' | 'emergency';
export type ZoneRiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type MachineStatus = 'online' | 'maintenance' | 'offline' | 'fault';
export type CameraStatus = 'online' | 'offline' | 'maintenance';

export interface Zone {
  id: number;
  code: string;
  name: string;
  area: string;
  risk_level: ZoneRiskLevel;
  status: 'operational' | 'restricted' | 'evacuated' | string;
  workers_count: number;
  sensors_count: number;
  machines_count: number;
  last_inspection: string;
  description: string;
}

export interface Worker {
  id: number;
  badge_id: string;
  name: string;
  role: string;
  zone: string;
  shift: string;
  status: WorkerStatus;
  avatar: string;
  heart_rate: number;
  last_seen: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  type: string;
  severity: Severity;
  zone: string;
  status: IncidentStatus;
  description: string;
  reported_by: string;
  assigned_to: string;
  occurred_at: string;
  resolved_at: string | null;
}

export interface Sensor {
  id: number;
  name: string;
  type: 'gas' | 'temperature' | 'pressure' | 'vibration' | 'noise' | 'smoke' | string;
  zone: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | string;
  threshold_min: number;
  threshold_max: number;
  last_reading_at: string;
}

export interface Camera {
  id: number;
  name: string;
  location: string;
  zone: string;
  status: CameraStatus;
  resolution: string;
  stream_url: string;
  lat: number;
  lng: number;
  last_active: string;
}

export interface AlertItem {
  id: number;
  type: string;
  severity: Severity;
  message: string;
  source: string;
  zone: string;
  acknowledged: boolean;
  created_at: string;
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  zone: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  uptime_hours: number;
  efficiency: number;
  last_maintenance: string;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  supervisor: string;
  workers_count: number;
  is_active: boolean;
}

export interface ReportItem {
  id: number;
  title: string;
  type: string;
  period: string;
  generated_by: string;
  status: 'ready' | 'draft' | 'archived' | string;
  summary: string;
  generated_at: string;
}

export interface DashboardKpis {
  generated_at: string;
  workers_online: number;
  critical_alerts: number;
  safety_score: number;
  safety_score_delta: number;
  todays_incidents: number;
  gas_level: number;
  gas_unit: string;
  temperature: number;
  temperature_unit: string;
  current_shift: Shift | null;
  machines_online: number;
  total_machines: number;
  risk_index: number;
  compliance_score: number;
}

export interface AnalyticsResponse {
  by_day: { date: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_zone: { zone: string; count: number }[];
  by_type: { type: string; count: number }[];
  total_incidents: number;
  generated_at: string;
}