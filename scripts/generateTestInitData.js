/**
 * Generates a validly-signed Telegram WebApp `initData` string for a fake
 * user, so you can test /api/mood and /api/stats with curl before ever
 * touching a real Telegram client.
 *
 * Usage:
 *   npm run gen-test-initdata
 *
 * Requires TELEGRAM_BOT_TOKEN in .env. Prints an initData string — pass it
 * as the X-Telegram-Init-Data header, e.g.:
 *
 *   curl http://localhost:3001/api/mood?month=2026-07 \
 *     -H "X-Telegram-Init-Data: <printed value>"
 */

const crypto = require('crypto');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in environment/.env');
  process.exit(1);
}

const fakeUser = {
  id: 999999999,
  first_name: 'Test',
  username: 'test_user',
  language_code: 'id',
};

const params = new URLSearchParams();
params.set('user', JSON.stringify(fakeUser));
params.set('auth_date', String(Math.floor(Date.now() / 1000)));
params.set('query_id', 'AAtest_query_id');

const dataCheckString = [...params.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
params.set('hash', hash);

console.log(params.toString());
