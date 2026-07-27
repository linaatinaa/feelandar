const crypto = require('crypto');

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60; // 24h — reject stale/replayed initData

/**
 * Validates Telegram WebApp `initData` per the algorithm described at
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData raw initData string from window.Telegram.WebApp.initData
 * @param {string} botToken the bot's token from @BotFather
 * @returns {{ valid: boolean, user: object|null, reason?: string }}
 */
function validateInitData(initData, botToken) {
  if (!initData || typeof initData !== 'string') {
    return { valid: false, user: null, reason: 'missing initData' };
  }
  if (!botToken) {
    return { valid: false, user: null, reason: 'server misconfigured: missing TELEGRAM_BOT_TOKEN' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { valid: false, user: null, reason: 'missing hash' };
  }
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const hashBuffer = Buffer.from(hash, 'hex');
  const computedBuffer = Buffer.from(computedHash, 'hex');
  const hashesMatch =
    hashBuffer.length === computedBuffer.length && crypto.timingSafeEqual(hashBuffer, computedBuffer);

  if (!hashesMatch) {
    return { valid: false, user: null, reason: 'hash mismatch' };
  }

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS) {
    return { valid: false, user: null, reason: 'stale initData' };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { valid: false, user: null, reason: 'missing user field' };
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return { valid: false, user: null, reason: 'invalid user JSON' };
  }

  if (!user || typeof user.id !== 'number') {
    return { valid: false, user: null, reason: 'invalid user payload' };
  }

  return { valid: true, user };
}

module.exports = { validateInitData };
