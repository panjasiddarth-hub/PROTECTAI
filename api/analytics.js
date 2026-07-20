import supabase from './db-client.js';

// Placeholder analytics endpoints — returns aggregated JSON only.
// Business logic intentionally omitted per architecture spec.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .order('occurred_at', { ascending: true });
    if (error) throw error;

    // Incidents by day (last 14 days)
    const byDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      const count = (incidents || []).filter(
        (it) => it.occurred_at && it.occurred_at.slice(0, 10) === key
      ).length;
      byDay.push({ date: key, count });
    }

    // Incidents by severity
    const bySeverity = ['critical', 'high', 'medium', 'low'].map((sev) => ({
      severity: sev,
      count: (incidents || []).filter((it) => it.severity === sev).length,
    }));

    // Incidents by zone
    const zoneMap = new Map();
    (incidents || []).forEach((it) => {
      const k = it.zone || 'unknown';
      zoneMap.set(k, (zoneMap.get(k) || 0) + 1);
    });
    const byZone = Array.from(zoneMap.entries()).map(([zone, count]) => ({ zone, count }));

    // Incidents by type
    const typeMap = new Map();
    (incidents || []).forEach((it) => {
      const k = it.type || 'other';
      typeMap.set(k, (typeMap.get(k) || 0) + 1);
    });
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

    return res.status(200).json({
      by_day: byDay,
      by_severity: bySeverity,
      by_zone: byZone,
      by_type: byType,
      total_incidents: (incidents || []).length,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('analytics api error:', err);
    return res.status(500).json({ error: err.message });
  }
}