import { motion } from 'framer-motion';
import { getCalendarCells, toDateKey, WEEKDAYS_ID, MONTH_NAMES_ID } from '../lib/date';
import { findMood } from '../lib/moods';

const GLOW_STREAK_THRESHOLD = 3;
const PULSE_STREAK_THRESHOLD = 7;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 22 } },
};

export default function Calendar({
  year,
  month,
  entriesByDate,
  todayKey,
  streak = 0,
  onPrevMonth,
  onNextMonth,
  onSelectEntry,
}) {
  const cells = getCalendarCells(year, month);
  const monthKey = `${year}-${month}`;
  const isGlowing = streak >= GLOW_STREAK_THRESHOLD;
  const isPulsing = streak >= PULSE_STREAK_THRESHOLD;

  return (
    <section
      className={`rounded-3xl p-4 mb-4 shadow-soft bg-surface border transition-shadow ${
        isPulsing ? 'animate-pulse-glow border-transparent' : ''
      }`}
      style={{
        borderColor: isGlowing ? 'var(--color-accent)' : 'var(--color-border)',
        boxShadow: isGlowing ? 'var(--shadow-glow)' : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <motion.button
          type="button"
          onClick={onPrevMonth}
          aria-label="Bulan sebelumnya"
          whileTap={{ scale: 0.85 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-ink opacity-70"
        >
          ‹
        </motion.button>
        <span className="font-heading text-sm text-ink flex items-center gap-1.5">
          {MONTH_NAMES_ID[month]} {year}
          {isGlowing && <span title={`Streak ${streak} hari`}>🔥</span>}
        </span>
        <motion.button
          type="button"
          onClick={onNextMonth}
          aria-label="Bulan berikutnya"
          whileTap={{ scale: 0.85 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-ink opacity-70"
        >
          ›
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_ID.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted">
            {d}
          </div>
        ))}
      </div>

      <motion.div
        key={monthKey}
        className="grid grid-cols-7 gap-1"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const key = toDateKey(date);
          const entry = entriesByDate[key];
          const mood = entry ? findMood(entry.mood_emoji) : null;
          const isToday = key === todayKey;

          return (
            <motion.button
              key={key}
              type="button"
              variants={entry ? cellVariants : undefined}
              disabled={!entry}
              onClick={() => entry && onSelectEntry(entry)}
              whileHover={entry ? { scale: 1.12 } : undefined}
              whileTap={entry ? { scale: 0.9 } : undefined}
              className={`aspect-square rounded-xl flex items-center justify-center text-xs text-ink ${
                isToday ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{
                background: entry ? `var(--mood-${mood.value})` : 'var(--color-surface-alt)',
                opacity: entry ? 1 : 0.45,
                '--tw-ring-color': 'var(--color-primary)',
                '--tw-ring-offset-color': 'var(--color-surface)',
              }}
            >
              {entry ? <span className="text-base leading-none">{entry.mood_emoji}</span> : date.getDate()}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
