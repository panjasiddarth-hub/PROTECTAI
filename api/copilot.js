import supabase from './db-client.js';

// AI Copilot placeholder — UI-only. Returns a stubbed JSON response so the
// frontend can render a believable conversation without invoking any model.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('copilot_suggestions')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { message } = req.body || {};
      return res.status(200).json({
        reply:
          'The AI Copilot is being prepared. Once connected to your safety knowledge base it will summarise incidents, draft reports and answer operational questions in real time.',
        message,
        sources: [],
        status: 'pending_integration',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('copilot api error:', err);
    return res.status(500).json({ error: err.message });
  }
}