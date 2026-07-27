import { motion } from 'framer-motion';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function BadgeGrid({ badges }) {
  if (!badges?.length) return null;
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-sm text-ink">Badge</h2>
        <span className="text-[11px] text-muted">
          {unlockedCount}/{badges.length} terbuka
        </span>
      </div>

      <motion.div className="grid grid-cols-3 gap-3" variants={gridVariants} initial="hidden" animate="show">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={badgeVariants}
            className="flex flex-col items-center text-center gap-1 rounded-2xl p-2.5"
            style={{ background: 'var(--color-surface-alt)' }}
          >
            <span
              className="text-2xl w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: badge.unlocked ? 'var(--color-bg)' : 'transparent',
                filter: badge.unlocked ? 'none' : 'grayscale(1)',
                opacity: badge.unlocked ? 1 : 0.35,
                boxShadow: badge.unlocked ? 'var(--shadow-soft)' : 'none',
              }}
            >
              {badge.icon}
            </span>
            <span
              className="text-[11px] font-medium leading-tight"
              style={{ color: badge.unlocked ? 'var(--color-ink)' : 'var(--color-muted)' }}
            >
              {badge.label}
            </span>
            <span className="text-[9px] text-muted leading-tight">
              {badge.unlocked ? badge.description : 'Belum terbuka'}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
