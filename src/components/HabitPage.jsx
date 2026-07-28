import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { toDateKey, WEEKDAYS_ID } from '../lib/date';

const EMOJI_CHOICES = ['💧', '🏃', '📖', '😴', '🧘', '🥗', '🎧', '🧹'];
const MAX_NAME_LENGTH = 60;

const todayKey = toDateKey(new Date());

export default function HabitPage() {
  const [habits, setHabits] = useState([]);
  const [doneToday, setDoneToday] = useState([]);
  const [weekLogs, setWeekLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  const load = useCallback(async () => {
    const [habitsRes, doneRes, logsRes] = await Promise.all([
      api.getHabits(),
      api.getHabitLogsForDate(todayKey),
      api.getHabitLogsForDays(7),
    ]);
    setHabits(habitsRes);
    setDoneToday(doneRes);
    setWeekLogs(logsRes);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function toggleHabit(habitId) {
    const isDone = doneToday.includes(habitId);
    setDoneToday((prev) => (isDone ? prev.filter((id) => id !== habitId) : [...prev, habitId]));
    setError(null);
    try {
      if (isDone) await api.markHabitUndone(habitId, todayKey);
      else await api.markHabitDone(habitId, todayKey);
      setWeekLogs(await api.getHabitLogsForDays(7));
    } catch (e) {
      setError(e.message);
      setDoneToday((prev) => (isDone ? [...prev, habitId] : prev.filter((id) => id !== habitId)));
    }
  }

  async function handleAddHabit() {
    if (!name.trim()) return;
    setError(null);
    try {
      const habit = await api.addHabit({ name: name.trim(), emoji });
      setHabits((prev) => [...prev, habit]);
      setName('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRemoveHabit(id) {
    setError(null);
    try {
      await api.removeHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setDoneToday((prev) => prev.filter((hid) => hid !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-bounce-dot"
            style={{ background: 'var(--color-primary)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }

  const pct = habits.length ? Math.round((doneToday.length / habits.length) * 100) : 0;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const countsByDate = {};
  weekLogs.forEach((log) => {
    countsByDate[log.date] = (countsByDate[log.date] || 0) + 1;
  });

  return (
    <div>
      <h1 className="font-heading text-lg text-ink mb-1">Habit Tracker</h1>
      <p className="text-sm text-muted mb-4">Kebiasaan kecil, hasil besar 🌱</p>

      {error && (
        <div className="text-xs rounded-2xl p-3 mb-4 border border-border bg-surface text-ink">⚠️ {error}</div>
      )}

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-heading font-semibold text-ink">Progres hari ini</p>
          <p className="text-sm font-heading font-semibold" style={{ color: 'var(--color-primary)' }}>
            {pct}%
          </p>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-surface-alt">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          />
        </div>
      </section>

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">Checklist</h2>
        {habits.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Belum ada habit. Tambah di bawah yuk!</p>
        ) : (
          <motion.ul className="flex flex-col gap-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
            {habits.map((h) => {
              const checked = doneToday.includes(h.id);
              return (
                <motion.li
                  key={h.id}
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                >
                  <motion.button
                    type="button"
                    onClick={() => toggleHabit(h.id)}
                    whileTap={{ scale: 0.97 }}
                    aria-pressed={checked}
                    className="flex flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold border-2"
                    style={{
                      borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                      background: checked ? 'var(--color-surface-alt)' : 'transparent',
                      color: checked ? 'var(--color-primary)' : 'var(--color-ink)',
                    }}
                  >
                    <span className="text-lg">{h.emoji}</span>
                    <span className="flex-1 text-left">{h.name}</span>
                    <span>{checked ? '✓' : '○'}</span>
                  </motion.button>
                  <button
                    type="button"
                    aria-label={`Hapus ${h.name}`}
                    onClick={() => handleRemoveHabit(h.id)}
                    className="px-1 text-muted active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </section>

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">Tambah habit</h2>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className="rounded-xl border-2 px-2 py-1 text-lg active:scale-90 transition-transform"
              style={{
                borderColor: emoji === e ? 'var(--color-primary)' : 'var(--color-border)',
                background: emoji === e ? 'var(--color-surface-alt)' : 'transparent',
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Nama habit baru"
            aria-label="Nama habit baru"
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm outline-none text-ink placeholder:opacity-50"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleAddHabit}
            disabled={!name.trim()}
            className="rounded-xl px-4 text-sm font-heading font-semibold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            Tambah
          </motion.button>
        </div>
      </section>

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">7 hari terakhir</h2>
        <div className="flex justify-between gap-1">
          {week.map((d) => {
            const key = toDateKey(d);
            const count = countsByDate[key] || 0;
            const ratio = habits.length ? count / habits.length : 0;
            return (
              <div key={key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end rounded-lg overflow-hidden bg-surface-alt">
                  <motion.div
                    className="w-full rounded-lg"
                    style={{ background: 'var(--color-primary)' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(ratio * 100, count > 0 ? 8 : 0)}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted">{WEEKDAYS_ID[d.getDay()].slice(0, 1)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
