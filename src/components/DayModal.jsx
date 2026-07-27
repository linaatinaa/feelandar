import { findMood } from '../lib/moods';

export default function DayModal({ entry, onClose }) {
  if (!entry) return null;
  const mood = findMood(entry.mood_emoji);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-80 rounded-t-2xl sm:rounded-2xl p-5 pb-6"
        style={{ background: 'var(--tg-bg-color)', color: 'var(--tg-text-color)' }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{entry.mood_emoji}</div>
          <div className="text-sm opacity-70">{mood?.label}</div>
          <div className="text-xs opacity-40 mt-1">{entry.date}</div>
        </div>

        {entry.note ? (
          <p
            className="text-sm rounded-xl p-3 whitespace-pre-wrap break-words"
            style={{ background: 'var(--tg-secondary-bg-color)' }}
          >
            {entry.note}
          </p>
        ) : (
          <p className="text-sm text-center opacity-40">Tidak ada catatan</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 rounded-xl py-2.5 text-sm font-medium"
          style={{ background: 'var(--tg-button-color)', color: 'var(--tg-button-text-color)' }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
