import type {
  AlertItem,
  AnalyticsResponse,
  Camera,
  DashboardKpis,
  Incident,
  Machine,
  ReportItem,
  Sensor,
  Shift,
  Worker,
  Zone,
} from './types';
import { searchEvidence } from './evidence';

/**
 * Simulation-first data for the MVP. The same shapes are used by the API
 * routes, so this can later be replaced by Supabase, MQTT or SCADA adapters
 * without changing the UI contracts.
 */

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

export const demoZones: Zone[] = [
  {
    id: 1,
    code: 'Z-01',
    name: 'Reactor Bay A',
    area: 'Process unit · 4,200 m²',
    risk_level: 'high',
    status: 'operational',
    workers_count: 8,
    sensors_count: 6,
    machines_count: 5,
    last_inspection: iso(180),
    description: 'Primary reaction vessels, transfer pumps and catalyst handling.',
  },
  {
    id: 2,
    code: 'Z-02',
    name: 'Distillation Unit',
    area: 'Process unit · 3,100 m²',
    risk_level: 'medium',
    status: 'operational',
    workers_count: 5,
    sensors_count: 5,
    machines_count: 4,
    last_inspection: iso(420),
    description: 'Distillation columns, reboilers and product separation equipment.',
  },
  {
    id: 3,
    code: 'Z-03',
    name: 'Cooling Tower',
    area: 'Utilities · 1,800 m²',
    risk_level: 'low',
    status: 'operational',
    workers_count: 2,
    sensors_count: 3,
    machines_count: 3,
    last_inspection: iso(680),
    description: 'Cooling water circulation and heat-exchange systems.',
  },
  {
    id: 4,
    code: 'Z-04',
    name: 'Storage Tank Farm',
    area: 'Storage · 7,600 m²',
    risk_level: 'high',
    status: 'restricted',
    workers_count: 3,
    sensors_count: 7,
    machines_count: 6,
    last_inspection: iso(95),
    description: 'Bulk storage tanks, transfer lines and loading manifolds.',
  },
  {
    id: 5,
    code: 'Z-05',
    name: 'Loading Dock',
    area: 'Logistics · 2,200 m²',
    risk_level: 'medium',
    status: 'operational',
    workers_count: 4,
    sensors_count: 4,
    machines_count: 3,
    last_inspection: iso(240),
    description: 'Vehicle loading, unloading and material dispatch operations.',
  },
  {
    id: 6,
    code: 'Z-06',
    name: 'Control Room',
    area: 'Operations · 600 m²',
    risk_level: 'low',
    status: 'operational',
    workers_count: 4,
    sensors_count: 2,
    machines_count: 2,
    last_inspection: iso(310),
    description: 'Central control, alarm management and shift coordination.',
  },
  {
    id: 7,
    code: 'Z-07',
    name: 'Workshop',
    area: 'Maintenance · 2,900 m²',
    risk_level: 'medium',
    status: 'operational',
    workers_count: 6,
    sensors_count: 4,
    machines_count: 5,
    last_inspection: iso(510),
    description: 'Mechanical maintenance, fabrication and hot-work preparation.',
  },
  {
    id: 8,
    code: 'Z-08',
    name: 'Admin Block',
    area: 'Support · 1,100 m²',
    risk_level: 'low',
    status: 'operational',
    workers_count: 7,
    sensors_count: 1,
    machines_count: 1,
    last_inspection: iso(840),
    description: 'Administration, training and contractor induction rooms.',
  },
];

export const demoSensors: Sensor[] = [
  { id: 1, name: 'GAS-ZB-01', type: 'gas', zone: 'Reactor Bay A', value: 8, unit: 'ppm', status: 'online', threshold_min: 0, threshold_max: 25, last_reading_at: iso(1) },
  { id: 2, name: 'GAS-ZB-02', type: 'gas', zone: 'Reactor Bay A', value: 6, unit: 'ppm', status: 'online', threshold_min: 0, threshold_max: 25, last_reading_at: iso(1) },
  { id: 3, name: 'TEMP-RX-01', type: 'temperature', zone: 'Reactor Bay A', value: 42, unit: '°C', status: 'online', threshold_min: 5, threshold_max: 85, last_reading_at: iso(1) },
  { id: 4, name: 'VIB-RX-01', type: 'vibration', zone: 'Reactor Bay A', value: 2.4, unit: 'mm/s', status: 'online', threshold_min: 0, threshold_max: 7, last_reading_at: iso(1) },
  { id: 5, name: 'GAS-DU-01', type: 'gas', zone: 'Distillation Unit', value: 11, unit: 'ppm', status: 'online', threshold_min: 0, threshold_max: 25, last_reading_at: iso(1) },
  { id: 6, name: 'TEMP-DU-01', type: 'temperature', zone: 'Distillation Unit', value: 58, unit: '°C', status: 'online', threshold_min: 5, threshold_max: 90, last_reading_at: iso(1) },
  { id: 7, name: 'PRESS-DU-01', type: 'pressure', zone: 'Distillation Unit', value: 3.2, unit: 'bar', status: 'online', threshold_min: 0, threshold_max: 7, last_reading_at: iso(1) },
  { id: 8, name: 'GAS-TF-01', type: 'gas', zone: 'Storage Tank Farm', value: 19, unit: 'ppm', status: 'online', threshold_min: 0, threshold_max: 25, last_reading_at: iso(1) },
  { id: 9, name: 'SMOKE-TF-01', type: 'smoke', zone: 'Storage Tank Farm', value: 0, unit: '%', status: 'online', threshold_min: 0, threshold_max: 20, last_reading_at: iso(1) },
  { id: 10, name: 'TEMP-CT-01', type: 'temperature', zone: 'Cooling Tower', value: 31, unit: '°C', status: 'online', threshold_min: 5, threshold_max: 70, last_reading_at: iso(1) },
  { id: 11, name: 'VIB-WS-01', type: 'vibration', zone: 'Workshop', value: 3.1, unit: 'mm/s', status: 'online', threshold_min: 0, threshold_max: 7, last_reading_at: iso(1) },
  { id: 12, name: 'NOISE-LD-01', type: 'noise', zone: 'Loading Dock', value: 68, unit: 'dB', status: 'online', threshold_min: 0, threshold_max: 85, last_reading_at: iso(1) },
];

export const demoWorkers: Worker[] = [
  { id: 1, badge_id: 'PX-1024', name: 'Arjun Rao', role: 'Shift Supervisor', zone: 'Control Room', shift: 'A Shift', status: 'on_duty', avatar: '', heart_rate: 76, last_seen: iso(2) },
  { id: 2, badge_id: 'PX-1041', name: 'Priya Menon', role: 'Process Engineer', zone: 'Reactor Bay A', shift: 'A Shift', status: 'on_duty', avatar: '', heart_rate: 81, last_seen: iso(1) },
  { id: 3, badge_id: 'PX-1088', name: 'Ravi Kumar', role: 'Maintenance Lead', zone: 'Workshop', shift: 'A Shift', status: 'on_duty', avatar: '', heart_rate: 79, last_seen: iso(3) },
  { id: 4, badge_id: 'PX-1112', name: 'Nisha Shah', role: 'Safety Officer', zone: 'Reactor Bay A', shift: 'A Shift', status: 'on_duty', avatar: '', heart_rate: 73, last_seen: iso(4) },
  { id: 5, badge_id: 'PX-1140', name: 'Kabir Singh', role: 'Technician', zone: 'Distillation Unit', shift: 'A Shift', status: 'on_duty', avatar: '', heart_rate: 84, last_seen: iso(2) },
  { id: 6, badge_id: 'PX-1151', name: 'Meera Iyer', role: 'Contractor', zone: 'Storage Tank Farm', shift: 'A Shift', status: 'on_break', avatar: '', heart_rate: 71, last_seen: iso(11) },
];

export const demoCameras: Camera[] = [
  { id: 1, name: 'CAM-RX-01', location: 'North process aisle', zone: 'Reactor Bay A', status: 'online', resolution: '1080p', stream_url: '', lat: 17.424, lng: 78.457, last_active: iso(1) },
  { id: 2, name: 'CAM-RX-02', location: 'South maintenance access', zone: 'Reactor Bay A', status: 'online', resolution: '1080p', stream_url: '', lat: 17.425, lng: 78.458, last_active: iso(1) },
  { id: 3, name: 'CAM-TF-01', location: 'Tank Farm manifold', zone: 'Storage Tank Farm', status: 'online', resolution: '4K', stream_url: '', lat: 17.429, lng: 78.462, last_active: iso(1) },
  { id: 4, name: 'CAM-DU-01', location: 'Column platform', zone: 'Distillation Unit', status: 'online', resolution: '1080p', stream_url: '', lat: 17.423, lng: 78.459, last_active: iso(1) },
  { id: 5, name: 'CAM-LD-02', location: 'Vehicle gate', zone: 'Loading Dock', status: 'offline', resolution: '1080p', stream_url: '', lat: 17.431, lng: 78.465, last_active: iso(360) },
];

export const demoMachines: Machine[] = [
  { id: 1, name: 'RX-PUMP-01', type: 'Transfer pump', zone: 'Reactor Bay A', status: 'online', temperature: 54, vibration: 2.4, uptime_hours: 1880, efficiency: 94, last_maintenance: iso(2400) },
  { id: 2, name: 'RX-PUMP-02', type: 'Transfer pump', zone: 'Reactor Bay A', status: 'online', temperature: 51, vibration: 2.1, uptime_hours: 1320, efficiency: 97, last_maintenance: iso(1760) },
  { id: 3, name: 'DU-COL-01', type: 'Distillation column', zone: 'Distillation Unit', status: 'online', temperature: 72, vibration: 1.8, uptime_hours: 2740, efficiency: 91, last_maintenance: iso(3600) },
  { id: 4, name: 'DU-REB-01', type: 'Reboiler', zone: 'Distillation Unit', status: 'maintenance', temperature: 36, vibration: 0.4, uptime_hours: 920, efficiency: 0, last_maintenance: iso(10) },
  { id: 5, name: 'CT-FAN-01', type: 'Cooling fan', zone: 'Cooling Tower', status: 'online', temperature: 40, vibration: 3.0, uptime_hours: 2100, efficiency: 88, last_maintenance: iso(2920) },
  { id: 6, name: 'TF-PUMP-01', type: 'Loading pump', zone: 'Storage Tank Farm', status: 'online', temperature: 49, vibration: 2.8, uptime_hours: 1550, efficiency: 90, last_maintenance: iso(2100) },
  { id: 7, name: 'WS-WELD-01', type: 'Welding station', zone: 'Workshop', status: 'online', temperature: 39, vibration: 0.8, uptime_hours: 620, efficiency: 86, last_maintenance: iso(4800) },
  { id: 8, name: 'LD-CONV-01', type: 'Conveyor', zone: 'Loading Dock', status: 'online', temperature: 44, vibration: 3.6, uptime_hours: 1980, efficiency: 89, last_maintenance: iso(2480) },
];

export const demoIncidents: Incident[] = [
  { id: 1, incident_code: 'INC-2026-014', title: 'Gas alarm during maintenance preparation', type: 'gas_leak', severity: 'high', zone: 'Reactor Bay A', status: 'investigating', description: 'Gas reading rose during preparation for hot work; permit was paused before ignition.', reported_by: 'Nisha Shah', assigned_to: 'Safety Response Team', occurred_at: iso(95), resolved_at: null },
  { id: 2, incident_code: 'NM-2026-011', title: 'Near-miss: incomplete gas test before welding', type: 'permit_violation', severity: 'high', zone: 'Reactor Bay A', status: 'resolved', description: 'A second gas test was required after a permit boundary changed.', reported_by: 'Arjun Rao', assigned_to: 'Maintenance Lead', occurred_at: iso(24 * 60 * 3), resolved_at: iso(24 * 60 * 2) },
  { id: 3, incident_code: 'NM-2026-009', title: 'Hydrocarbon odour near transfer line', type: 'gas_leak', severity: 'medium', zone: 'Reactor Bay A', status: 'resolved', description: 'Odour was detected during line isolation; no ignition source was present.', reported_by: 'Priya Menon', assigned_to: 'Process Engineering', occurred_at: iso(24 * 60 * 7), resolved_at: iso(24 * 60 * 6) },
  { id: 4, incident_code: 'INC-2026-008', title: 'Elevated temperature at reboiler platform', type: 'equipment', severity: 'medium', zone: 'Distillation Unit', status: 'monitoring', description: 'Temperature exceeded the operating band and required a maintenance inspection.', reported_by: 'Kabir Singh', assigned_to: 'Reliability Team', occurred_at: iso(24 * 60 * 5), resolved_at: null },
  { id: 5, incident_code: 'NM-2026-006', title: 'Unapproved entry into tank farm', type: 'access_control', severity: 'high', zone: 'Storage Tank Farm', status: 'resolved', description: 'Contractor badge detected in a restricted area without a matching permit.', reported_by: 'Arjun Rao', assigned_to: 'Security Control', occurred_at: iso(24 * 60 * 9), resolved_at: iso(24 * 60 * 9 - 40) },
  { id: 6, incident_code: 'INC-2026-004', title: 'Camera loss during loading operation', type: 'security', severity: 'low', zone: 'Loading Dock', status: 'monitoring', description: 'Video coverage was unavailable for part of a vehicle-loading window.', reported_by: 'Control Room', assigned_to: 'Instrumentation Team', occurred_at: iso(24 * 60 * 11), resolved_at: null },
];

export const demoAlerts: AlertItem[] = [
  { id: 1, type: 'compound_risk', severity: 'high', message: 'Permit HW-104 is within 35m of a rising gas reading.', source: 'Risk Engine', zone: 'Reactor Bay A', acknowledged: false, created_at: iso(7) },
  { id: 2, type: 'sensor', severity: 'high', message: 'GAS-TF-01 is above the advisory threshold.', source: 'GAS-TF-01', zone: 'Storage Tank Farm', acknowledged: false, created_at: iso(18) },
  { id: 3, type: 'permit', severity: 'medium', message: 'Required second gas test is missing from permit HW-104.', source: 'Permit Intelligence', zone: 'Reactor Bay A', acknowledged: false, created_at: iso(27) },
  { id: 4, type: 'camera', severity: 'medium', message: 'CAM-LD-02 has been offline for more than six hours.', source: 'CAM-LD-02', zone: 'Loading Dock', acknowledged: true, created_at: iso(360) },
];

export const demoShifts: Shift[] = [
  { id: 1, name: 'A Shift', start_time: '06:00', end_time: '14:00', supervisor: 'Arjun Rao', workers_count: 24, is_active: true },
  { id: 2, name: 'B Shift', start_time: '14:00', end_time: '22:00', supervisor: 'Sonal Patel', workers_count: 19, is_active: false },
  { id: 3, name: 'C Shift', start_time: '22:00', end_time: '06:00', supervisor: 'Mohan Das', workers_count: 17, is_active: false },
];

export const demoReports: ReportItem[] = [
  { id: 1, title: 'Compound Risk Demonstration Report', type: 'risk_intelligence', period: 'Current simulation', generated_by: 'Protect AI Simulator', status: 'ready', summary: 'Evidence-backed assessment of permit HW-104 and the rising gas scenario.', generated_at: iso(32) },
  { id: 2, title: 'Daily Operations Brief', type: 'operations', period: '20 Jul 2026', generated_by: 'Protect AI Copilot', status: 'ready', summary: 'Shift handover summary with plant KPIs, incidents and outstanding actions.', generated_at: iso(120) },
  { id: 3, title: 'Process Safety Audit', type: 'compliance', period: 'Q3 2026', generated_by: 'Safety Operations', status: 'draft', summary: 'Permit-to-work controls, inspection evidence and open corrective actions.', generated_at: iso(24 * 60 * 2) },
];

const byDay = Array.from({ length: 14 }, (_, index) => {
  const d = new Date(now - (13 - index) * 24 * 60 * 60_000);
  return { date: d.toISOString().slice(0, 10), count: [1, 0, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 2][index] };
});

export const demoAnalytics: AnalyticsResponse = {
  by_day: byDay,
  by_severity: [
    { severity: 'critical', count: 1 },
    { severity: 'high', count: 5 },
    { severity: 'medium', count: 7 },
    { severity: 'low', count: 3 },
  ],
  by_zone: [
    { zone: 'Reactor Bay A', count: 7 },
    { zone: 'Storage Tank Farm', count: 5 },
    { zone: 'Distillation Unit', count: 4 },
    { zone: 'Loading Dock', count: 3 },
    { zone: 'Workshop', count: 2 },
    { zone: 'Cooling Tower', count: 1 },
  ],
  by_type: [
    { type: 'gas_leak', count: 5 },
    { type: 'permit_violation', count: 4 },
    { type: 'equipment', count: 4 },
    { type: 'access_control', count: 2 },
    { type: 'security', count: 1 },
  ],
  total_incidents: 16,
  generated_at: iso(1),
};

export const demoDashboard: DashboardKpis = {
  generated_at: iso(1),
  workers_online: 24,
  critical_alerts: 1,
  safety_score: 87,
  safety_score_delta: 2.3,
  todays_incidents: 2,
  gas_level: 8,
  gas_unit: 'ppm',
  temperature: 42,
  temperature_unit: '°C',
  current_shift: demoShifts[0],
  machines_online: 7,
  total_machines: 8,
  risk_index: 34,
  compliance_score: 86,
};

export const demoSettings = {
  organization: 'Protect AI Demo Refinery',
  timezone: 'Asia/Kolkata',
  notifications_email: true,
  notifications_sms: false,
  notifications_push: true,
  two_factor_enabled: true,
  session_timeout_minutes: 30,
  theme: 'dark',
};

export function getDemoResponse<T>(path: string): T | undefined {
  const url = new URL(path, 'http://protectai.local');
  const limit = Number(url.searchParams.get('limit') || 0);
  const take = <R,>(rows: R[]) => (limit > 0 ? rows.slice(0, limit) : rows);

  switch (url.pathname) {
    case '/dashboard': return demoDashboard as T;
    case '/analytics': return demoAnalytics as T;
    case '/alerts': return take(demoAlerts) as T;
    case '/incidents': return take(demoIncidents) as T;
    case '/zones': return demoZones as T;
    case '/workers': return demoWorkers as T;
    case '/sensors': return demoSensors as T;
    case '/cameras': return demoCameras as T;
    case '/machines': return demoMachines as T;
    case '/shifts': return demoShifts as T;
    case '/reports': return demoReports as T;
    case '/settings': return demoSettings as T;
    case '/copilot': return [
      { id: 1, prompt: 'Why is Reactor Bay A elevated risk?', category: 'risk' },
      { id: 2, prompt: 'Show similar incidents to permit HW-104', category: 'incidents' },
      { id: 3, prompt: 'What compliance evidence is missing?', category: 'compliance' },
    ] as T;
    default: return undefined;
  }
}

export function getDemoMutation<T>(path: string, body: unknown): T | undefined {
  const url = new URL(path, 'http://protectai.local');
  if (url.pathname === '/copilot') {
    const message = typeof body === 'object' && body !== null && 'message' in body ? String((body as { message?: unknown }).message || '') : '';
    const matchedEvidence = searchEvidence(message || 'hot work gas permit', 4);
    return {
      reply: `Simulation evidence reviewed. ${message ? `For “${message}”, ` : ''}Reactor Bay A is currently the priority because permit HW-104 is close to a rising gas trend and three similar near-misses are recorded in the same zone. Pause hot work, repeat the gas test and notify the shift supervisor before resuming.`,
      message,
      sources: matchedEvidence.map((item) => item.id),
      status: 'simulation_response',
    } as T;
  }
  if (url.pathname === '/reports') {
    return { id: 99, title: 'Simulation report', status: 'ready', generated_at: new Date().toISOString(), ...(body as object) } as T;
  }
  return (body || { ok: true }) as T;
}
