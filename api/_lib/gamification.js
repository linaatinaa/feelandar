// Every quantity here (XP, level, badges) is derived from mood_entries on
// each request rather than stored on its own column — with at most one row
// per user per day this stays cheap to compute, and there's no separate
// "progress" state that can ever drift out of sync with the actual entries.

const XP_PER_ENTRY = 20;
const XP_PER_LEVEL = 100; // 5 entries per level

function computeLevel(totalEntries) {
  const xp = totalEntries * XP_PER_ENTRY;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { xp, level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL };
}

function hourInRange(isoTimestamp, startHour, endHour) {
  const hour = new Date(isoTimestamp).getUTCHours();
  return hour >= startHour && hour < endHour;
}

const BADGE_DEFS = [
  {
    id: 'first_step',
    label: 'First Step',
    icon: '🌱',
    description: 'Isi mood pertama kalimu',
    check: ({ totalEntries }) => totalEntries >= 1,
  },
  {
    id: 'week_warrior',
    label: 'Week Warrior',
    icon: '🔥',
    description: 'Streak 7 hari berturut-turut',
    check: ({ longestStreak }) => longestStreak >= 7,
  },
  {
    id: 'rainbow_collector',
    label: 'Rainbow Collector',
    icon: '🌈',
    description: 'Pernah isi kelima jenis mood',
    check: ({ distinctMoodCount }) => distinctMoodCount >= 5,
  },
  {
    id: 'night_owl',
    label: 'Night Owl',
    icon: '🦉',
    description: 'Isi mood tengah malam (00:00–03:59)',
    check: ({ hasNightOwlEntry }) => hasNightOwlEntry,
  },
  {
    id: 'early_bird',
    label: 'Early Bird',
    icon: '🐤',
    description: 'Isi mood pagi-pagi (05:00–07:59)',
    check: ({ hasEarlyBirdEntry }) => hasEarlyBirdEntry,
  },
  {
    id: 'consistent',
    label: 'Konsisten',
    icon: '💯',
    description: 'Total 30 entry mood',
    check: ({ totalEntries }) => totalEntries >= 30,
  },
];

/**
 * @param {{date: string, mood_emoji: string, created_at: string}[]} entries full history, any order
 * @param {number} currentStreak from computeStreak()
 * @param {number} longestStreak from computeLongestStreak()
 */
function computeGamification(entries, currentStreak, longestStreak) {
  const totalEntries = entries.length;
  const distinctMoodCount = new Set(entries.map((e) => e.mood_emoji)).size;
  const hasNightOwlEntry = entries.some((e) => hourInRange(e.created_at, 0, 4));
  const hasEarlyBirdEntry = entries.some((e) => hourInRange(e.created_at, 5, 8));

  const ctx = { totalEntries, longestStreak, currentStreak, distinctMoodCount, hasNightOwlEntry, hasEarlyBirdEntry };

  const badges = BADGE_DEFS.map(({ check, ...badge }) => ({
    ...badge,
    unlocked: check(ctx),
  }));

  return {
    ...computeLevel(totalEntries),
    totalEntries,
    longestStreak,
    badges,
  };
}

module.exports = { computeGamification, XP_PER_ENTRY, XP_PER_LEVEL };
