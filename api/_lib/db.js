const { getSupabase } = require('./supabase');

/**
 * Finds the app user matching a validated Telegram user, creating one on
 * first visit. `telegramUser` comes from validateInitData() and is trusted
 * at this point (hash already verified).
 *
 * Uses a single atomic upsert (rather than select-then-insert) because the
 * frontend fires several /api requests in parallel on first load — a
 * select-then-insert here would race: two concurrent requests can both see
 * "no existing user" and then both try to insert, and the loser hits the
 * telegram_id unique constraint (23505). Upserting on that same constraint
 * makes the loser update the just-inserted row instead of erroring.
 */
async function getOrCreateUser(telegramUser) {
  const supabase = getSupabase();
  const username = telegramUser.username || telegramUser.first_name || null;

  const { data, error } = await supabase
    .from('users')
    .upsert({ telegram_id: telegramUser.id, username }, { onConflict: 'telegram_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

const MOOD_ENTRY_COLUMNS = 'id, date, mood_emojis, doing, story, created_at';

async function getEntriesForMonth(userId, monthKey) {
  // monthKey: 'YYYY-MM'
  const start = `${monthKey}-01`;
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const end = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select(MOOD_ENTRY_COLUMNS)
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function getEntryForDate(userId, date) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select(MOOD_ENTRY_COLUMNS)
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

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
    .select(MOOD_ENTRY_COLUMNS)
    .eq('user_id', userId)
    .gte('date', sinceKey)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

/** Full entry history for a user, oldest first — used to derive XP/level,
 * current & longest streak, and badge unlock state (see _lib/gamification.js).
 * A personal mood diary stays small (at most one row/day), so fetching the
 * whole history is cheap and keeps that derived state simple and always
 * consistent with the raw entries, no separate progress columns to drift. */
async function getAllEntries(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select('date, mood_emojis, created_at')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function upsertMoodEntry(userId, { date, mood_emojis, doing, story }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .upsert(
      { user_id: userId, date, mood_emojis, doing: doing || null, story: story || null },
      { onConflict: 'user_id,date' }
    )
    .select(MOOD_ENTRY_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Habits
// ============================================================

async function getHabits(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('habits')
    .select('id, name, emoji, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function createHabit(userId, { name, emoji }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, name, emoji })
    .select('id, name, emoji, created_at')
    .single();

  if (error) throw error;
  return data;
}

async function deleteHabit(userId, habitId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('habits').delete().eq('user_id', userId).eq('id', habitId);
  if (error) throw error;
}

/** Habit completion log for a date range, oldest first. */
async function getHabitLogs(userId, sinceDate) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, date')
    .eq('user_id', userId)
    .gte('date', sinceDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function getHabitLogsForDate(userId, date) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('date', date);

  if (error) throw error;
  return data.map((row) => row.habit_id);
}

async function markHabitDone(userId, habitId, date) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('habit_logs')
    .upsert({ user_id: userId, habit_id: habitId, date }, { onConflict: 'habit_id,date' });
  if (error) throw error;
}

async function markHabitUndone(userId, habitId, date) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('date', date);
  if (error) throw error;
}

// ============================================================
// Expenses
// ============================================================

async function getExpensesForDate(userId, date) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .select('id, label, amount, created_at')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function addExpense(userId, { date, label, amount }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .insert({ user_id: userId, date, label, amount })
    .select('id, label, amount, created_at')
    .single();

  if (error) throw error;
  return data;
}

async function deleteExpense(userId, expenseId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('expenses').delete().eq('user_id', userId).eq('id', expenseId);
  if (error) throw error;
}

module.exports = {
  getOrCreateUser,
  getEntriesForMonth,
  getEntryForDate,
  getRecentEntries,
  getAllEntries,
  upsertMoodEntry,
  getHabits,
  createHabit,
  deleteHabit,
  getHabitLogs,
  getHabitLogsForDate,
  markHabitDone,
  markHabitUndone,
  getExpensesForDate,
  addExpense,
  deleteExpense,
};
