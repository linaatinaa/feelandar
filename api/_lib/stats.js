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

function computeMostFrequent(entries) {
  if (!entries.length) return null;

  const counts = new Map();
  for (const entry of entries) {
    counts.set(entry.mood_emoji, (counts.get(entry.mood_emoji) || 0) + 1);
  }

  let best = null;
  for (const [emoji, count] of counts) {
    if (!best || count > best.count) {
      best = { emoji, count };
    }
  }
  return best;
}

module.exports = { computeStreak, computeMostFrequent, shiftDateKey };
