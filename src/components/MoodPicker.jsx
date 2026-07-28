import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import MoodMascot from './mascots/MoodMascot';
import { MOODS, findMood } from '../lib/moods';

const MAX_DOING_LENGTH = 80;
const MAX_STORY_LENGTH = 500;

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

function getComputedMoodColor(value) {
  if (typeof window === 'undefined') return '#ffd98e';
  return getComputedStyle(document.documentElement).getPropertyValue(`--mood-${value}`).trim() || '#ffd98e';
}

export default function MoodPicker({ todayEntry, onSubmit, submitting, onMoodPreview }) {
  const [selected, setSelected] = useState([]);
  const [doing, setDoing] = useState('');
  const [story, setStory] = useState('');
  const alreadySubmitted = Boolean(todayEntry);

  function toggleMood(value) {
    const isCurrentlySelected = selected.includes(value);
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    if (!isCurrentlySelected) onMoodPreview?.(value);
  }

  function handleSubmit() {
    if (selected.length === 0 || alreadySubmitted) return;
    const emojis = selected.map((v) => MOODS.find((m) => m.value === v).emoji);
    onSubmit({ mood_emojis: emojis, doing: doing.trim() || null, story: story.trim() || null });
    fireConfetti(getComputedMoodColor(selected[selected.length - 1]));
  }

  if (alreadySubmitted) {
    const moods = (todayEntry.mood_emojis || []).map(findMood).filter(Boolean);
    return (
      <section className="rounded-3xl p-6 mb-4 text-center shadow-soft bg-surface border border-border">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="flex justify-center gap-1"
        >
          {moods.map((mood) => (
            <MoodMascot key={mood.value} mood={mood.value} size={moods.length > 3 ? 56 : 76} className="drop-shadow" />
          ))}
        </motion.div>
        <p className="font-heading text-base mt-3 text-ink">Mood hari ini sudah tercatat ✓</p>
        {todayEntry.doing && (
          <p className="text-sm text-ink mt-2">
            <span className="text-muted">Lagi: </span>
            {todayEntry.doing}
          </p>
        )}
        {todayEntry.story && (
          <p className="text-sm text-ink mt-2 rounded-2xl p-3 bg-surface-alt text-left whitespace-pre-wrap break-words">
            {todayEntry.story}
          </p>
        )}
        <p className="text-sm text-muted mt-2">Sampai jumpa besok untuk catatan berikutnya!</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl p-5 mb-4 shadow-soft bg-surface border border-border">
      <h2 className="font-heading text-base text-ink mb-1">Bagaimana perasaanmu hari ini?</h2>
      <p className="text-xs text-muted mb-3">Geser untuk lihat, ketuk buat pilih (boleh lebih dari satu)</p>

      <div className="flex gap-3 overflow-x-auto no-scrollbar px-2 py-2 snap-x snap-mandatory">
        {MOODS.map((m) => {
          const isSelected = selected.includes(m.value);
          return (
            <motion.button
              key={m.value}
              type="button"
              onClick={() => toggleMood(m.value)}
              whileTap={{ scale: 0.92 }}
              className="relative snap-center shrink-0 flex flex-col items-center gap-1.5 rounded-2xl px-2.5 py-3 transition-colors"
              style={{
                background: isSelected ? 'var(--color-surface-alt)' : 'transparent',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
              }}
            >
              {isSelected && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  ✓
                </span>
              )}
              <motion.div
                key={`${m.value}-${isSelected}`}
                animate={isSelected ? { rotate: [0, -8, 8, -5, 5, 0], scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MoodMascot mood={m.value} size={60} />
              </motion.div>
              <span
                className="text-[11px] font-medium whitespace-nowrap"
                style={{ color: isSelected ? 'var(--color-ink)' : 'var(--color-muted)' }}
              >
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label className="block text-xs text-muted mt-3 mb-1" htmlFor="doing-input">
              Recently doing
            </label>
            <input
              id="doing-input"
              value={doing}
              onChange={(e) => setDoing(e.target.value)}
              maxLength={MAX_DOING_LENGTH}
              placeholder="Lagi ngapain nih? ☕"
              className="w-full rounded-2xl p-3 text-sm outline-none placeholder:opacity-50 bg-surface-alt text-ink border border-border"
            />

            <label className="block text-xs text-muted mt-3 mb-1" htmlFor="story-input">
              Cerita hari ini
            </label>
            <textarea
              id="story-input"
              maxLength={MAX_STORY_LENGTH}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tulis apa pun yang kamu rasakan hari ini... (opsional)"
              rows={3}
              className="w-full rounded-2xl p-3 text-sm resize-none outline-none placeholder:opacity-50 bg-surface-alt text-ink border border-border"
            />
            <div className="text-right text-xs text-muted mt-1">
              {story.length}/{MAX_STORY_LENGTH}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={selected.length === 0 || submitting}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-3 rounded-2xl py-3 text-sm font-heading font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
      >
        {submitting ? 'Menyimpan…' : 'Simpan Mood'}
      </motion.button>
    </section>
  );
}
