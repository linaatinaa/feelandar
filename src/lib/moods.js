// Keep in sync with api/_lib/moods.js and supabase/schema.sql's check constraint.
export const MOODS = [
  { emoji: '😄', label: 'Bahagia', value: 'happy' },
  { emoji: '🥰', label: 'Disayang', value: 'loved' },
  { emoji: '😌', label: 'Tenang', value: 'calm' },
  { emoji: '🤩', label: 'Semangat', value: 'excited' },
  { emoji: '😐', label: 'Biasa', value: 'neutral' },
  { emoji: '🥱', label: 'Capek', value: 'tired' },
  { emoji: '😢', label: 'Sedih', value: 'sad' },
  { emoji: '😡', label: 'Kesal', value: 'angry' },
  { emoji: '😰', label: 'Cemas', value: 'anxious' },
  { emoji: '🤒', label: 'Kurang fit', value: 'sick' },
];

// Rough "how good is this mood" ordering, used only to plot the weekly
// trend line — not shown to the user directly.
export const MOOD_SCORE = {
  '😡': 1,
  '😰': 2,
  '😢': 3,
  '🤒': 3.5,
  '🥱': 4,
  '😐': 5,
  '😌': 6.5,
  '🥰': 7.5,
  '😄': 8.5,
  '🤩': 9,
};

export function findMood(emoji) {
  return MOODS.find((m) => m.emoji === emoji) || null;
}
