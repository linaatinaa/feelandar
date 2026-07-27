import { motion } from 'framer-motion';

export default function XPBar({ stats }) {
  const level = stats?.level ?? 1;
  const xpIntoLevel = stats?.xpIntoLevel ?? 0;
  const xpForNextLevel = stats?.xpForNextLevel ?? 100;
  const progress = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="font-heading text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            {level}
          </span>
          <div>
            <div className="font-heading text-sm text-ink leading-tight">Level {level}</div>
            <div className="text-[11px] text-muted leading-tight">{stats?.totalEntries ?? 0} mood tercatat</div>
          </div>
        </div>
        <span className="text-[11px] text-muted">
          {xpIntoLevel}/{xpForNextLevel} XP
        </span>
      </div>

      <div className="h-2.5 rounded-full overflow-hidden bg-surface-alt">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
    </section>
  );
}
