import { getInitData } from './telegram';

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getMonthEntries: (monthKey) => request(`/mood?month=${monthKey}`).then((r) => r.entries),
  getRecentEntries: (days = 7) => request(`/mood?days=${days}`).then((r) => r.entries),
  submitMood: (payload) =>
    request('/mood', { method: 'POST', body: JSON.stringify(payload) }).then((r) => r.entry),
  getStats: (monthKey, todayKey) => request(`/stats?month=${monthKey}&today=${todayKey}`),
};
