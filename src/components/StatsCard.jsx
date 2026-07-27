import { findMood } from '../lib/moods';

export default function StatsCard({ stats }) {
  const mostFrequentMood = stats?.mostFrequent ? findMood(stats.mostFrequent.emoji) : null;

  return (
    <section className="grid grid-cols-2 gap-3 mb-4">
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'var(--tg-secondary-bg-color)' }}
      >
        <div className="text-2xl mb-1">{mostFrequentMood?.emoji || '—'}</div>
        <div className="text-[11px] opacity-60 leading-tight">
          Mood terbanyak
          <br />
          bulan ini
          {mostFrequentMood && <span className="block opacity-80 mt-0.5">{mostFrequentMood.label}</span>}
        </div>
      </div>
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'var(--tg-secondary-bg-color)' }}
      >
        <div className="text-2xl mb-1 font-semibold">🔥 {stats?.streak ?? 0}</div>
        <div className="text-[11px] opacity-60 leading-tight">
          Hari beruntun
          <br />
          mengisi mood
        </div>
      </div>
    </section>
  );
}
