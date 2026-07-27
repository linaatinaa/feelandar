export function getWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
}

export function initTelegram() {
  const tg = getWebApp();
  if (!tg) return null;
  tg.ready();
  tg.expand();
  return tg;
}

export function getInitData() {
  return getWebApp()?.initData || '';
}

export function getTelegramUser() {
  return getWebApp()?.initDataUnsafe?.user || null;
}

const THEME_VAR_MAP = {
  bg_color: '--tg-bg-color',
  text_color: '--tg-text-color',
  hint_color: '--tg-hint-color',
  link_color: '--tg-link-color',
  button_color: '--tg-button-color',
  button_text_color: '--tg-button-text-color',
  secondary_bg_color: '--tg-secondary-bg-color',
};

/** Maps Telegram.WebApp.themeParams onto CSS custom properties and marks
 * the current color scheme on <html data-theme="..."> for Tailwind's
 * dark-mode selector. */
export function applyTelegramTheme() {
  const tg = getWebApp();
  const root = document.documentElement;

  if (!tg) {
    root.setAttribute('data-theme', 'light');
    return;
  }

  const params = tg.themeParams || {};
  for (const [key, cssVar] of Object.entries(THEME_VAR_MAP)) {
    if (params[key]) root.style.setProperty(cssVar, params[key]);
  }
  root.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');

  tg.onEvent?.('themeChanged', () => applyTelegramTheme());
}
