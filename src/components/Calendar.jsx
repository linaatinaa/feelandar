import { getCalendarCells, toDateKey, WEEKDAYS_ID, MONTH_NAMES_ID } from '../lib/date';
import { findMood } from '../lib/moods';

export default function Calendar({ year, month, entriesByDate, todayKey, onPrevMonth, onNextMonth, onSelectEntry }) {
  const cells = getCalendarCells(year, month);

  return (
    <section
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--tg-secondary-bg-color)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Bulan sebelumnya"
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg opacity-70 active:scale-95"
        >
          ‹
        </button>
        <span className="font-medium text-sm">
          {MONTH_NAMES_ID[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Bulan berikutnya"
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg opacity-70 active:scale-95"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_ID.map((d) => (
          <div key={d} className="text-center text-[10px] opacity-50">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const key = toDateKey(date);
          const entry = entriesByDate[key];
          const mood = entry ? findMood(entry.mood_emoji) : null;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              disabled={!entry}
              onClick={() => entry && onSelectEntry(entry)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                isToday ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{
                background: entry ? mood?.color : 'var(--tg-bg-color)',
                opacity: entry ? 1 : 0.35,
                '--tw-ring-color': 'var(--tg-link-color)',
                '--tw-ring-offset-color': 'var(--tg-secondary-bg-color)',
              }}
            >
              {entry ? <span className="text-base leading-none">{entry.mood_emoji}</span> : date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
