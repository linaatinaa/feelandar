const express = require('express');
const { validateInitData } = require('./_lib/telegramAuth');
const { ALLOWED_MOODS } = require('./_lib/moods');
const {
  getOrCreateUser,
  getEntriesForMonth,
  getRecentEntries,
  getAllEntries,
  upsertMoodEntry,
} = require('./_lib/db');
const { computeStreak, computeLongestStreak, computeMostFrequent } = require('./_lib/stats');
const { computeGamification } = require('./_lib/gamification');
const { handleBotWebhook } = require('./_lib/bot');

const app = express();
app.use(express.json());

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// --------------------------------------------------------------------
// Auth: every /api/mood* and /api/stats* request must carry a valid
// Telegram WebApp initData string, proving the request really comes
// from this bot's mini app and not from an arbitrary client.
// See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
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

// POST /api/mood { date, mood_emoji, note } -> upsert today's (or given date's) entry
app.post('/api/mood', requireTelegramAuth, async (req, res) => {
  try {
    const { date, mood_emoji, note } = req.body || {};

    if (!date || !DATE_RE.test(date)) {
      return res.status(400).json({ error: 'Invalid date, expected YYYY-MM-DD' });
    }
    if (!ALLOWED_MOODS.includes(mood_emoji)) {
      return res.status(400).json({ error: `mood_emoji must be one of ${ALLOWED_MOODS.join(' ')}` });
    }
    if (note != null && (typeof note !== 'string' || note.length > 200)) {
      return res.status(400).json({ error: 'note must be a string of at most 200 characters' });
    }

    const entry = await upsertMoodEntry(req.dbUser.id, { date, mood_emoji, note });
    res.status(201).json({ entry });
  } catch (err) {
    console.error('POST /api/mood failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
app.get('/api/bot-webhook', (_req, res) => res.json({ ok: true, info: 'MoodDiary bot webhook is alive' }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;

// Allow running this Express app standalone for local development/testing:
//   npm run dev:api
// On Vercel this file is instead loaded as a serverless function and never
// hits this branch.
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`MoodDiary API listening on http://localhost:${port}`);
  });
}
