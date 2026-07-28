function shiftDateKey(dateKey, deltaDays) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

/**
 * Streak = consecutive days with an entry, ending today or yesterday.
 * If today has no entry yet, the streak still counts (so a user who
 * hasn't logged today, but logged every day up to yesterday, isn't
 * shown a "broken" streak until the day actually ends).
 */
function computeStreak(datesDesc, todayKey) {
  const dateSet = new Set(datesDesc);
  let cursor = dateSet.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1);
  let streak = 0;

  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

/** Longest run of consecutive-day entries the user has ever had, not just
 * the current one — so a badge earned by a past 7-day streak stays earned
 * even after the streak later breaks. */
function computeLongestStreak(dates) {
  if (!dates.length) return 0;

  const sorted = [...new Set(dates)].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    current = shiftDateKey(sorted[i - 1], 1) === sorted[i] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}

/** `entries` each carry a `mood_emojis` array (a day can have more than one
 * mood) — counts every emoji across every entry, not one per day. */
function computeMostFrequent(entries) {
  const counts = new Map();
  for (const entry of entries) {
    for (const emoji of entry.mood_emojis || []) {
      counts.set(emoji, (counts.get(emoji) || 0) + 1);
    }
  }

  let best = null;
  for (const [emoji, count] of counts) {
    if (!best || count > best.count) {
      best = { emoji, count };
    }
  }
  return best;
}

module.exports = { computeStreak, computeLongestStreak, computeMostFrequent, shiftDateKey };
