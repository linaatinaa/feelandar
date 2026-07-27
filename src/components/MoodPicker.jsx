import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import MoodMascot from './mascots/MoodMascot';
import { MOODS, findMood } from '../lib/moods';

const MAX_NOTE_LENGTH = 200;

function fireConfetti(moodColor) {
  confetti({
    particleCount: 60,
    spread: 65,
    startVelocity: 32,
    gravity: 1.1,
    scalar: 0.85,
    origin: { y: 0.55 },
    colors: [moodColor, '#ffffff', '#ffd98e'],
  });
}

export default function MoodPicker({ todayEntry, onSubmit, submitting, onMoodPreview }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const alreadySubmitted = Boolean(todayEntry);

  function handlePick(value) {
    setSelected(value);
    onMoodPreview?.(value);
  }

  function handleSubmit() {
    if (!selected || alreadySubmitted) return;
    const mood = MOODS.find((m) => m.value === selected);
    onSubmit({ mood_emoji: mood.emoji, note: note.trim() || null });
    fireConfetti(getComputedMoodColor(selected));
  }

  if (alreadySubmitted) {
    const mood = findMood(todayEntry.mood_emoji);
    return (
      <section className="rounded-3xl p-6 mb-4 text-center shadow-soft bg-surface border border-border">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <MoodMascot mood={mood?.value} size={84} className="mx-auto drop-shadow" />
        </motion.div>
        <p className="font-heading text-base mt-3 text-ink">Mood hari ini sudah tercatat ✓</p>
        <p className="text-sm text-muted mt-1">Sampai jumpa besok untuk catatan berikutnya!</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl p-5 mb-4 shadow-soft bg-surface border border-border">
      <h2 className="font-heading text-base text-ink mb-1">Bagaimana perasaanmu hari ini?</h2>
      <p className="text-xs text-muted mb-3">Geser untuk lihat, ketuk untuk pilih</p>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 py-2 snap-x snap-mandatory">
        {MOODS.map((m) => {
          const isSelected = selected === m.value;
          return (
            <motion.button
              key={m.value}
              type="button"
              onClick={() => handlePick(m.value)}
              whileTap={{ scale: 0.92 }}
              className="snap-center shrink-0 flex flex-col items-center gap-2 rounded-2xl px-3 py-3 transition-colors"
              style={{
                background: isSelected ? 'var(--color-surface-alt)' : 'transparent',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <motion.div
                key={`${m.value}-${isSelected}`}
                animate={isSelected ? { rotate: [0, -8, 8, -5, 5, 0], scale: 1.12 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MoodMascot mood={m.value} size={72} />
              </motion.div>
              <span
                className="text-xs font-medium"
                style={{ color: isSelected ? 'var(--color-ink)' : 'var(--color-muted)' }}
              >
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <textarea
              maxLength={MAX_NOTE_LENGTH}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan singkat (opsional)"
              rows={2}
              className="w-full rounded-2xl p-3 mt-3 text-sm resize-none outline-none placeholder:opacity-50 bg-surface-alt text-ink border border-border"
            />
            <div className="text-right text-xs text-muted mt-1">
              {note.length}/{MAX_NOTE_LENGTH}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || submitting}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-3 rounded-2xl py-3 text-sm font-heading font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
      >
        {submitting ? 'Menyimpan…' : 'Simpan Mood'}
      </motion.button>
    </section>
  );
}

function getComputedMoodColor(value) {
  if (typeof window === 'undefined') return '#ffd98e';
  return getComputedStyle(document.documentElement).getPropertyValue(`--mood-${value}`).trim() || '#ffd98e';
}
