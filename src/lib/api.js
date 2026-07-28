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

  getHabits: () => request('/habits').then((r) => r.habits),
  addHabit: (payload) =>
    request('/habits', { method: 'POST', body: JSON.stringify(payload) }).then((r) => r.habit),
  removeHabit: (id) => request(`/habits?id=${id}`, { method: 'DELETE' }),
  getHabitLogsForDate: (date) => request(`/habits/logs?date=${date}`).then((r) => r.doneHabitIds),
  getHabitLogsForDays: (days = 7) => request(`/habits/logs?days=${days}`).then((r) => r.logs),
  markHabitDone: (habitId, date) =>
    request('/habits/logs', { method: 'POST', body: JSON.stringify({ habitId, date }) }),
  markHabitUndone: (habitId, date) => request(`/habits/logs?habitId=${habitId}&date=${date}`, { method: 'DELETE' }),

  getExpensesForDate: (date) => request(`/expenses?date=${date}`).then((r) => r.expenses),
  addExpense: (payload) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(payload) }).then((r) => r.expense),
  removeExpense: (id) => request(`/expenses?id=${id}`, { method: 'DELETE' }),
};
