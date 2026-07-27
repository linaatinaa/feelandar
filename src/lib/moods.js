// Keep in sync with api/_lib/moods.js and supabase/schema.sql's check constraint.
export const MOODS = [
  { emoji: '😄', label: 'Senang', value: 'happy', color: '#FDE9B8' },
  { emoji: '😐', label: 'Biasa', value: 'neutral', color: '#DCE3EA' },
  { emoji: '🥱', label: 'Lelah', value: 'tired', color: '#E3D9F2' },
  { emoji: '😢', label: 'Sedih', value: 'sad', color: '#C9DCF0' },
  { emoji: '😡', label: 'Marah', value: 'angry', color: '#F3D0CE' },
];

// Rough "how good is this mood" ordering, used only to plot the weekly
// trend line — not shown to the user directly.
export const MOOD_SCORE = {
  '😡': 1,
  '😢': 2,
  '🥱': 3,
  '😐': 4,
  '😄': 5,
};

export function findMood(emoji) {
  return MOODS.find((m) => m.emoji === emoji) || null;
}
