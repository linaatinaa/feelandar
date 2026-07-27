import { useCallback, useEffect, useMemo, useState } from 'react';
import MoodPicker from './components/MoodPicker';
import Calendar from './components/Calendar';
import DayModal from './components/DayModal';
import StatsCard from './components/StatsCard';
import MoodChart from './components/MoodChart';
import { initTelegram, applyTelegramTheme, getWebApp } from './lib/telegram';
import { api } from './lib/api';
import { toDateKey, toMonthKey } from './lib/date';

const today = new Date();
const todayKey = toDateKey(today);

export default function App() {
  const [inTelegram, setInTelegram] = useState(true);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [monthEntries, setMonthEntries] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = useMemo(() => toMonthKey(viewDate), [viewDate]);

  useEffect(() => {
    const tg = initTelegram();
    applyTelegramTheme();
    setInTelegram(Boolean(tg?.initData));
  }, []);

  const loadMonth = useCallback(async () => {
    const [entries, statsResult] = await Promise.all([
      api.getMonthEntries(monthKey),
      api.getStats(monthKey, todayKey),
    ]);
    setMonthEntries(entries);
    setStats(statsResult);
  }, [monthKey]);

  const loadRecent = useCallback(async () => {
    const entries = await api.getRecentEntries(7);
    setRecentEntries(entries);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([loadMonth(), loadRecent()])
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadMonth, loadRecent]);

  const entriesByDate = useMemo(
    () => Object.fromEntries(monthEntries.map((e) => [e.date, e])),
    [monthEntries]
  );

  const todayEntry = useMemo(
    () => recentEntries.find((e) => e.date === todayKey) || entriesByDate[todayKey] || null,
    [recentEntries, entriesByDate]
  );

  async function handleSubmitMood({ mood_emoji, note }) {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitMood({ date: todayKey, mood_emoji, note });
      getWebApp()?.HapticFeedback?.notificationOccurred?.('success');
      await Promise.all([loadMonth(), loadRecent()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function goToPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  if (!inTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-4xl mb-3">📔</div>
          <h1 className="text-lg font-semibold mb-2">MoodDiary</h1>
          <p className="text-sm opacity-60 max-w-xs">
            Buka aplikasi ini dari tombol di bot Telegram MoodDiary, bukan langsung di browser, agar
            data mood-mu bisa tersimpan dengan aman.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pt-5 pb-10">
      <h1 className="text-lg font-semibold mb-4">MoodDiary</h1>

      {error && (
        <div className="text-xs rounded-xl p-3 mb-4 bg-red-100 text-red-700">{error}</div>
      )}

      <MoodPicker todayEntry={todayEntry} onSubmit={handleSubmitMood} submitting={submitting} />

      {loading ? (
        <div className="text-center text-sm opacity-50 py-10">Memuat…</div>
      ) : (
        <>
          <StatsCard stats={stats} />
          <Calendar
            year={year}
            month={month}
            entriesByDate={entriesByDate}
            todayKey={todayKey}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onSelectEntry={setSelectedEntry}
          />
          <MoodChart entries={recentEntries} />
        </>
      )}

      <DayModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
