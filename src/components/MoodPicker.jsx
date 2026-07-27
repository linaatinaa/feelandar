import { useState } from 'react';
import { MOODS } from '../lib/moods';

const MAX_NOTE_LENGTH = 200;

export default function MoodPicker({ todayEntry, onSubmit, submitting }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const alreadySubmitted = Boolean(todayEntry);

  const displayEmoji = alreadySubmitted ? todayEntry.mood_emoji : selected;
  const displayNote = alreadySubmitted ? todayEntry.note || '' : note;

  function handleSubmit() {
    if (!selected || alreadySubmitted) return;
    onSubmit({ mood_emoji: selected, note: note.trim() || null });
  }

  return (
    <section
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--tg-secondary-bg-color)' }}
    >
      <h2 className="text-sm font-medium mb-3 opacity-70">Bagaimana perasaanmu hari ini?</h2>

      <div className="flex justify-between mb-4">
        {MOODS.map((m) => {
          const isSelected = displayEmoji === m.emoji;
          return (
            <button
              key={m.value}
              type="button"
              disabled={alreadySubmitted}
              onClick={() => setSelected(m.emoji)}
              aria-label={m.label}
              className={`text-3xl w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'scale-110' : 'opacity-60'
              } ${alreadySubmitted ? 'cursor-default' : 'active:scale-95'}`}
              style={{ background: isSelected ? m.color : 'transparent' }}
            >
              {m.emoji}
            </button>
          );
        })}
      </div>

      <textarea
        maxLength={MAX_NOTE_LENGTH}
        disabled={alreadySubmitted}
        value={displayNote}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan singkat (opsional)"
        rows={2}
        className="w-full rounded-xl p-3 text-sm resize-none outline-none disabled:opacity-70 placeholder:opacity-50"
        style={{ background: 'var(--tg-bg-color)', color: 'var(--tg-text-color)' }}
      />
      {!alreadySubmitted && (
        <div className="text-right text-xs opacity-40 mt-1 mb-2">
          {note.length}/{MAX_NOTE_LENGTH}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={alreadySubmitted || !selected || submitting}
        className="w-full mt-2 rounded-xl py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--tg-button-color)', color: 'var(--tg-button-text-color)' }}
      >
        {alreadySubmitted ? 'Sudah diisi hari ini ✓' : submitting ? 'Menyimpan…' : 'Simpan Mood'}
      </button>
    </section>
  );
}
