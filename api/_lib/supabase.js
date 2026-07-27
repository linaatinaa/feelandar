const { createClient } = require('@supabase/supabase-js');

let client = null;

/**
 * Lazily-created Supabase client using the service role key. This must only
 * ever run server-side (inside /api) — the service role key bypasses Row
 * Level Security, so it must never be shipped to the frontend.
 */
function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return client;
}

module.exports = { getSupabase };
