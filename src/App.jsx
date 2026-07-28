import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodayPage from './components/TodayPage';
import CalendarPage from './components/CalendarPage';
import HabitPage from './components/HabitPage';
import ExpensePage from './components/ExpensePage';
import ThemePicker from './components/ThemePicker';
import ProfilePage from './components/ProfilePage';
import GamesPage from './components/games/GamesPage';
import BottomNav from './components/BottomNav';
import { initTelegram, applyTelegramTheme, getWebApp } from './lib/telegram';
import { api } from './lib/api';
import { toDateKey, toMonthKey } from './lib/date';
import { useSkin } from './lib/theme';

const today = new Date();
const todayKey = toDateKey(today);
const fadeTransition = { duration: 0.3 };

export default function App() {
  const [skin, setSkin] = useSkin();
  const [inTelegram, setInTelegram] = useState(true);
  const [page, setPage] = useState('today');
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [monthEntries, setMonthEntries] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewMood, setPreviewMood] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = useMemo(() => toMonthKey(viewDate), [viewDate]);

  useEffect(() => {
    const tg = initTelegram();
    applyTelegramTheme();
    // The gate below only matters for production: it nudges people who open
    // the raw URL outside Telegram (the API itself is the real security
    // boundary). In dev we always render so the UI can be iterated on in a
    // plain browser.
    setInTelegram(Boolean(tg?.initData) || import.meta.env.DEV);
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

  async function handleSubmitMood({ mood_emojis, doing, story }) {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitMood({ date: todayKey, mood_emojis, doing, story });
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

  function changePage(nextPage) {
    setPreviewMood(null); // don't leave a mood-tinted background bleeding into the other page
    setPage(nextPage);
  }

  return (
    <AnimatePresence mode="wait">
      {!skin ? (
        <motion.div key="theme-picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeTransition}>
          <ThemePicker onSelect={setSkin} />
        </motion.div>
      ) : !inTelegram ? (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          className="min-h-screen flex items-center justify-center p-6 text-center"
          style={{ background: 'var(--gradient-app)' }}
        >
          <div>
            <div className="text-4xl mb-3">🌈</div>
            <h1 className="font-heading text-lg text-ink mb-2">Feelandar</h1>
            <p className="text-sm text-muted max-w-xs">
              Buka aplikasi ini dari tombol di bot Telegram Feelandar, bukan langsung di browser, agar
              data mood-mu bisa tersimpan dengan aman.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          className="min-h-screen relative overflow-hidden"
          style={{ background: 'var(--gradient-app)' }}
        >
          <AnimatePresence>
            {previewMood && (
              <motion.div
                key={previewMood}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none fixed inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 15%, var(--mood-${previewMood}), transparent 65%)`,
                }}
              />
            )}
          </AnimatePresence>

          <div className="relative max-w-md mx-auto px-4 pt-5 pb-28">
            <h1 className="font-heading text-lg text-ink mb-4">Feelandar</h1>

            {error && (
              <div className="text-xs rounded-2xl p-3 mb-4 border border-border bg-surface text-ink">
                ⚠️ {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-10 gap-1.5"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full animate-bounce-dot"
                      style={{
                        background: 'var(--color-primary)',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {page === 'today' && (
                    <TodayPage
                      todayEntry={todayEntry}
                      onSubmit={handleSubmitMood}
                      submitting={submitting}
                      onMoodPreview={setPreviewMood}
                      stats={stats}
                    />
                  )}
                  {page === 'calendar' && (
                    <CalendarPage
                      year={year}
                      month={month}
                      entriesByDate={entriesByDate}
                      todayKey={todayKey}
                      streak={stats?.streak ?? 0}
                      onPrevMonth={goToPrevMonth}
                      onNextMonth={goToNextMonth}
                      recentEntries={recentEntries}
                    />
                  )}
                  {page === 'habit' && <HabitPage />}
                  {page === 'expense' && <ExpensePage />}
                  {page === 'games' && <GamesPage />}
                  {page === 'profile' && <ProfilePage stats={stats} skin={skin} onChangeSkin={setSkin} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <BottomNav active={page} onChange={changePage} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
