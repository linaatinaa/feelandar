const { TelegramBot } = require('node-telegram-bot-api');
const { getOrCreateUser } = require('./db');

let bot = null;

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Lazily builds a node-telegram-bot-api instance with polling disabled —
 * on Vercel we never poll; instead Telegram POSTs updates to
 * /api/bot-webhook and we feed them into the bot via processUpdate().
 */
function getBot() {
  if (bot) return bot;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable');

  bot = new TelegramBot(token, { polling: false, webHook: false });

  bot.onText(/^\/start\b/, (msg) => {
    // Best-effort: make sure this Telegram user already has a `users` row
    // the moment they say /start, not only once they open the mini app.
    // Fire-and-forget on purpose — the greeting below must still be sent
    // even if this fails (e.g. Supabase env vars not configured yet).
    if (msg.from) {
      getOrCreateUser(msg.from).catch((err) => {
        console.error('Failed to upsert user on /start', err);
      });
    }

    const firstName = msg.from?.first_name ? escapeHtml(msg.from.first_name) : 'teman';
    const webAppUrl = process.env.WEBAPP_URL;
    const text = [
      `Halo, <b>${firstName}</b>! 👋🌈🌙✨`,
      '',
      'Selamat datang di <b>Feelandar</b> — teman kecil buat nyatetin mood harianmu.',
      '',
      'Pilih emoji, tulis cerita singkat, kumpulin <i>streak</i> dan badge, terus lihat progress kamu dalam kalender warna-warni.',
      '',
      'Gimana perasaanmu hari ini? 💭 Yuk cerita lewat tombol di bawah 👇',
    ].join('\n');

    const options = { parse_mode: 'HTML' };
    if (webAppUrl) {
      options.reply_markup = {
        inline_keyboard: [[{ text: '🌈 Catat Mood Sekarang', web_app: { url: webAppUrl } }]],
      };
    }

    bot.sendMessage(msg.chat.id, text, options).catch((err) => {
      console.error('Failed to send /start reply', err);
    });
  });

  bot.on('polling_error', (err) => console.error('polling_error (unexpected, polling is disabled)', err));

  return bot;
}

/**
 * Express handler for POST /api/bot-webhook.
 * Verifies Telegram's secret token header (if configured), then hands the
 * update off to node-telegram-bot-api's internal event system.
 */
async function handleBotWebhook(req, res) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const receivedSecret = req.header('X-Telegram-Bot-Api-Secret-Token');
    if (receivedSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
  }

  try {
    getBot().processUpdate(req.body);
  } catch (err) {
    console.error('Failed to process Telegram update', err);
    // Still respond 200 so Telegram doesn't retry-storm us for a bad update.
  }

  res.status(200).json({ ok: true });
}

module.exports = { getBot, handleBotWebhook };
