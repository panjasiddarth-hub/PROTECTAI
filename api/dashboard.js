import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // KPI aggregates — placeholder business logic per architecture spec
    const [
      { count: workersOnline },
      { count: criticalAlerts },
      { count: todaysIncidents },
      { data: sensors },
      { data: machines },
      { data: activeShift },
    ] = await Promise.all([
      supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'on_duty'),
      supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical').eq('acknowledged', false),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('occurred_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      supabase.from('sensors').select('value, type, status').eq('status', 'online'),
      supabase.from('machines').select('status').eq('status', 'online'),
      supabase.from('shifts').select('*').eq('is_active', true).limit(1),
    ]);

    const gasSensor = sensors?.find((s) => s.type === 'gas');
    const tempSensor = sensors?.find((s) => s.type === 'temperature');

    const payload = {
      generated_at: new Date().toISOString(),
      workers_online: workersOnline ?? 0,
      critical_alerts: criticalAlerts ?? 0,
      safety_score: 87,
      safety_score_delta: 2.3,
      todays_incidents: todaysIncidents ?? 0,
      gas_level: gasSensor?.value ?? 0,
      gas_unit: 'ppm',
      temperature: tempSensor?.value ?? 0,
      temperature_unit: '°C',
      current_shift: activeShift?.[0] ?? null,
      machines_online: machines?.length ?? 0,
      total_machines: 24,
      risk_index: 38,
      compliance_score: 94,
    };

    return res.status(200).json(payload);
  } catch (err) {
    console.error('dashboard api error:', err);
    return res.status(500).json({ error: err.message });
  }
}