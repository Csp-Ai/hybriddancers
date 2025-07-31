async function logToSupabase(action, details) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key || typeof fetch === 'undefined') return;
  try {
    await fetch(`${url}/rest/v1/agent_logs`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ action, details })
    });
  } catch (err) {
    console.error('Supabase log failed:', err.message);
  }
}

module.exports = { logToSupabase };
