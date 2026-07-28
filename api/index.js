const express = require('express');
const { validateInitData } = require('./_lib/telegramAuth');
const { ALLOWED_MOODS } = require('./_lib/moods');
const {
  getOrCreateUser,
  getEntriesForMonth,
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
} = require('./_lib/db');
const { computeStreak, computeLongestStreak, computeMostFrequent } = require('./_lib/stats');
const { computeGamification } = require('./_lib/gamification');
const { handleBotWebhook } = require('./_lib/bot');

const app = express();
app.use(express.json());

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --------------------------------------------------------------------
// Auth: every /api/mood*, /api/stats*, /api/habits*, /api/expenses*
// request must carry a valid Telegram WebApp initData string, proving the
// request really comes from this bot's mini app and not from an arbitrary
// client. See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// --------------------------------------------------------------------
async function requireTelegramAuth(req, res, next) {
  const initData = req.header('X-Telegram-Init-Data');
  const result = validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);

  if (!result.valid) {
    return res.status(401).json({ error: `Unauthorized: ${result.reason}` });
  }

  try {
    req.dbUser = await getOrCreateUser(result.user);
    next();
  } catch (err) {
    console.error('Failed to resolve user', err);
    res.status(500).json({ error: 'Failed to resolve user' });
  }
}

// No auth on purpose — only reports whether each env var is *present*,
// never its value, so it's safe to hit from a plain browser to sanity-check
// a deployment (e.g. https://your-app.vercel.app/api/health).
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    env: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      WEBAPP_URL: Boolean(process.env.WEBAPP_URL),
    },
  })
);

// ============================================================
// Mood entries
// ============================================================

// GET /api/mood?month=YYYY-MM        -> entries for that month
// GET /api/mood?days=7               -> entries from the last N days
app.get('/api/mood', requireTelegramAuth, async (req, res) => {
  try {
    const { month, days } = req.query;

    if (month) {
      if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'Invalid month, expected YYYY-MM' });
      const entries = await getEntriesForMonth(req.dbUser.id, month);
      return res.json({ entries });
    }

    if (days) {
      const n = Number(days);
      if (!Number.isInteger(n) || n <= 0 || n > 90) {
        return res.status(400).json({ error: 'Invalid days, expected an integer between 1 and 90' });
      }
      const entries = await getRecentEntries(req.dbUser.id, n);
      return res.json({ entries });
    }

    return res.status(400).json({ error: 'Provide either ?month=YYYY-MM or ?days=N' });
  } catch (err) {
    console.error('GET /api/mood failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mood { date, mood_emojis, doing, story } -> upsert a date's entry
app.post('/api/mood', requireTelegramAuth, async (req, res) => {
  try {
    const { date, mood_emojis, doing, story } = req.body || {};

    if (!date || !DATE_RE.test(date)) {
      return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    }
    if (!Array.isArray(mood_emojis) || mood_emojis.length === 0) {
      return res.status(400).json({ error: 'mood_emojis must be a non-empty array' });
    }
    if (mood_emojis.some((e) => !ALLOWED_MOODS.includes(e))) {
      return res.status(400).json({ error: `mood_emojis must only contain: ${ALLOWED_MOODS.join(' ')}` });
    }
    if (doing != null && (typeof doing !== 'string' || doing.length > 80)) {
      return res.status(400).json({ error: 'doing must be a string of at most 80 characters' });
    }
    if (story != null && (typeof story !== 'string' || story.length > 500)) {
      return res.status(400).json({ error: 'story must be a string of at most 500 characters' });
    }

    const entry = await upsertMoodEntry(req.dbUser.id, {
      date,
      mood_emojis: [...new Set(mood_emojis)],
      doing,
      story,
    });
    res.status(201).json({ entry });
  } catch (err) {
    console.error('POST /api/mood failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Habits
// ============================================================

// GET /api/habits -> list of habits (not date-scoped)
app.get('/api/habits', requireTelegramAuth, async (req, res) => {
  try {
    const habits = await getHabits(req.dbUser.id);
    res.json({ habits });
  } catch (err) {
    console.error('GET /api/habits failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/habits { name, emoji } -> create a habit
app.post('/api/habits', requireTelegramAuth, async (req, res) => {
  try {
    const { name, emoji } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim() || name.length > 60) {
      return res.status(400).json({ error: 'name must be a non-empty string of at most 60 characters' });
    }
    if (!emoji || typeof emoji !== 'string' || emoji.length > 8) {
      return res.status(400).json({ error: 'emoji must be a short string' });
    }
    const habit = await createHabit(req.dbUser.id, { name: name.trim(), emoji });
    res.status(201).json({ habit });
  } catch (err) {
    console.error('POST /api/habits failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/habits?id=<uuid>
app.delete('/api/habits', requireTelegramAuth, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || !UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid or missing id' });
    await deleteHabit(req.dbUser.id, id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/habits failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/habits/logs?date=YYYY-MM-DD  -> { doneHabitIds: [...] } for that date
// GET /api/habits/logs?days=7           -> { logs: [{ habit_id, date }, ...] } for the last N days
app.get('/api/habits/logs', requireTelegramAuth, async (req, res) => {
  try {
    const { date, days } = req.query;

    if (date) {
      if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
      const doneHabitIds = await getHabitLogsForDate(req.dbUser.id, date);
      return res.json({ doneHabitIds });
    }

    if (days) {
      const n = Number(days);
      if (!Number.isInteger(n) || n <= 0 || n > 90) {
        return res.status(400).json({ error: 'Invalid days, expected an integer between 1 and 90' });
      }
      const since = new Date();
      since.setDate(since.getDate() - (n - 1));
      const logs = await getHabitLogs(req.dbUser.id, since.toISOString().slice(0, 10));
      return res.json({ logs });
    }

    return res.status(400).json({ error: 'Provide either ?date=YYYY-MM-DD or ?days=N' });
  } catch (err) {
    console.error('GET /api/habits/logs failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/habits/logs { habitId, date } -> mark a habit done for that date
app.post('/api/habits/logs', requireTelegramAuth, async (req, res) => {
  try {
    const { habitId, date } = req.body || {};
    if (!habitId || !UUID_RE.test(habitId)) return res.status(400).json({ error: 'Invalid or missing habitId' });
    if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    await markHabitDone(req.dbUser.id, habitId, date);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/habits/logs failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/habits/logs?habitId=<uuid>&date=YYYY-MM-DD -> mark a habit undone
app.delete('/api/habits/logs', requireTelegramAuth, async (req, res) => {
  try {
    const { habitId, date } = req.query;
    if (!habitId || !UUID_RE.test(habitId)) return res.status(400).json({ error: 'Invalid or missing habitId' });
    if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    await markHabitUndone(req.dbUser.id, habitId, date);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/habits/logs failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Expenses
// ============================================================

// GET /api/expenses?date=YYYY-MM-DD -> expenses for that date
app.get('/api/expenses', requireTelegramAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    const expenses = await getExpensesForDate(req.dbUser.id, date);
    res.json({ expenses });
  } catch (err) {
    console.error('GET /api/expenses failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/expenses { date, label, amount } -> add an expense
app.post('/api/expenses', requireTelegramAuth, async (req, res) => {
  try {
    const { date, label, amount } = req.body || {};
    if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    if (!label || typeof label !== 'string' || !label.trim() || label.length > 80) {
      return res.status(400).json({ error: 'label must be a non-empty string of at most 80 characters' });
    }
    const amountNum = Number(amount);
    if (!Number.isInteger(amountNum) || amountNum <= 0 || amountNum > 999999999) {
      return res.status(400).json({ error: 'amount must be a positive integer' });
    }
    const expense = await addExpense(req.dbUser.id, { date, label: label.trim(), amount: amountNum });
    res.status(201).json({ expense });
  } catch (err) {
    console.error('POST /api/expenses failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses?id=<uuid>
app.delete('/api/expenses', requireTelegramAuth, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || !UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid or missing id' });
    await deleteExpense(req.dbUser.id, id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/expenses failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Stats / gamification
// ============================================================

// GET /api/stats?month=YYYY-MM&today=YYYY-MM-DD
app.get('/api/stats', requireTelegramAuth, async (req, res) => {
  try {
    const { month, today } = req.query;
    if (!month || !MONTH_RE.test(month)) {
      return res.status(400).json({ error: 'Invalid month, expected YYYY-MM' });
    }
    const todayKey = today && DATE_RE.test(today) ? today : new Date().toISOString().slice(0, 10);

    const [monthEntries, allEntries] = await Promise.all([
      getEntriesForMonth(req.dbUser.id, month),
      getAllEntries(req.dbUser.id),
    ]);

    const allDates = allEntries.map((e) => e.date);
    const streak = computeStreak(allDates, todayKey);
    const longestStreak = computeLongestStreak(allDates);

    res.json({
      mostFrequent: computeMostFrequent(monthEntries),
      streak,
      totalEntriesThisMonth: monthEntries.length,
      ...computeGamification(allEntries, streak, longestStreak),
    });
  } catch (err) {
    console.error('GET /api/stats failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Telegram calls this webhook for every update (message, callback, etc.)
app.post('/api/bot-webhook', handleBotWebhook);
app.get('/api/bot-webhook', (_req, res) => res.json({ ok: true, info: 'Feelandar bot webhook is alive' }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;

// Allow running this Express app standalone for local development/testing:
//   npm run dev:api
// On Vercel this file is instead loaded as a serverless function and never
// hits this branch.
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Feelandar API listening on http://localhost:${port}`);
  });
}
