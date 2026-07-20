import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(
        data || {
          organization: 'Protect AI Demo Plant',
          timezone: 'UTC',
          notifications_email: true,
          notifications_sms: false,
          notifications_push: true,
          two_factor_enabled: true,
          session_timeout_minutes: 30,
          theme: 'dark',
        }
      );
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const { data: existing } = await supabase.from('settings').select('id').limit(1).maybeSingle();
      let result;
      if (existing?.id) {
        const { data, error } = await supabase
          .from('settings')
          .update(body)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('settings').insert(body).select().single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('settings api error:', err);
    return res.status(500).json({ error: err.message });
  }
}