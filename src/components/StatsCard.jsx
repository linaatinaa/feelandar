import { findMood } from '../lib/moods';

export default function StatsCard({ stats }) {
  const mostFrequentMood = stats?.mostFrequent ? findMood(stats.mostFrequent.emoji) : null;
  const streak = stats?.streak ?? 0;

  return (
    <section className="grid grid-cols-2 gap-3 mb-4">
      <div className="rounded-3xl p-4 text-center shadow-soft bg-surface border border-border">
        <div className="text-2xl mb-1">{mostFrequentMood?.emoji || '—'}</div>
        <div className="text-[11px] text-muted leading-tight">
          Mood terbanyak
          <br />
          bulan ini
          {mostFrequentMood && <span className="block text-ink opacity-80 mt-0.5">{mostFrequentMood.label}</span>}
        </div>
      </div>
      <div className="rounded-3xl p-4 text-center shadow-soft bg-surface border border-border">
        <div className="text-2xl mb-1 font-heading font-semibold text-ink">
          <span className={streak > 0 ? 'inline-block animate-flame-flicker drop-shadow' : 'inline-block opacity-40'}>
            🔥
          </span>{' '}
          {streak}
        </div>
        <div className="text-[11px] text-muted leading-tight">
          Hari beruntun
          <br />
          mengisi mood
        </div>
      </div>
    </section>
  );
}
