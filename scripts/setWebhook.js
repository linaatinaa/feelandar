/**
 * Registers (or updates) the Telegram webhook to point at this project's
 * deployed /api/bot-webhook endpoint.
 *
 * Usage:
 *   npm run set-webhook
 *
 * Requires TELEGRAM_BOT_TOKEN and API_URL to be set in .env (or the
 * environment). Run again any time API_URL changes, e.g. after a new
 * Vercel deployment domain.
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = process.env.API_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in environment/.env');
  process.exit(1);
}
if (!apiUrl) {
  console.error('Missing API_URL in environment/.env (e.g. https://your-app.vercel.app)');
  process.exit(1);
}

const webhookUrl = `${apiUrl.replace(/\/$/, '')}/api/bot-webhook`;

async function main() {
  const params = new URLSearchParams({ url: webhookUrl });
  if (secret) params.set('secret_token', secret);

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  if (!data.ok) {
    console.error('Failed to set webhook:', data);
    process.exit(1);
  }

  console.log(`Webhook registered: ${webhookUrl}`);
  console.log(data);
}

main();
