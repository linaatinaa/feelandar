const { getSupabase } = require('./supabase');

/**
 * Finds the app user matching a validated Telegram user, creating one on
 * first visit. `telegramUser` comes from validateInitData() and is trusted
 * at this point (hash already verified).
 */
async function getOrCreateUser(telegramUser) {
  const supabase = getSupabase();
  const username = telegramUser.username || telegramUser.first_name || null;

  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramUser.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({ telegram_id: telegramUser.id, username })
    .select('*')
    .single();

  if (insertError) throw insertError;
  return created;
}

async function getEntriesForMonth(userId, monthKey) {
  // monthKey: 'YYYY-MM'
  const start = `${monthKey}-01`;
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const end = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select('id, date, mood_emoji, note, created_at')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function getRecentEntries(userId, days) {
  const supabase = getSupabase();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceKey = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('mood_entries')
    .select('id, date, mood_emoji, note, created_at')
    .eq('user_id', userId)
    .gte('date', sinceKey)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function getAllEntryDatesDesc(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data.map((row) => row.date);
}

async function upsertMoodEntry(userId, { date, mood_emoji, note }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .upsert(
      { user_id: userId, date, mood_emoji, note: note || null },
      { onConflict: 'user_id,date' }
    )
    .select('id, date, mood_emoji, note, created_at')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getOrCreateUser,
  getEntriesForMonth,
  getRecentEntries,
  getAllEntryDatesDesc,
  upsertMoodEntry,
};
