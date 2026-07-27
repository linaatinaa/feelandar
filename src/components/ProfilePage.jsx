import { motion } from 'framer-motion';
import XPBar from './XPBar';
import BadgeGrid from './BadgeGrid';
import { SKINS } from '../lib/theme';
import { getTelegramUser } from '../lib/telegram';

export default function ProfilePage({ stats, skin, onChangeSkin }) {
  const user = getTelegramUser();
  const displayName = user?.first_name || user?.username || 'Teman Feelandar';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div>
      <section className="rounded-3xl p-5 mb-4 shadow-soft bg-surface border border-border flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-heading font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
        >
          {initial}
        </div>
        <div>
          <div className="font-heading text-base text-ink">{displayName}</div>
          <div className="text-xs text-muted">Level {stats?.level ?? 1} · {stats?.totalEntries ?? 0} mood tercatat</div>
        </div>
      </section>

      <XPBar stats={stats} />
      <BadgeGrid badges={stats?.badges} />

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">Tampilan</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(SKINS).map((s) => {
            const isActive = skin === s.id;
            return (
              <motion.button
                key={s.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onChangeSkin(s.id)}
                className="rounded-2xl p-3 text-left border-2"
                style={{
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  background: 'var(--color-surface-alt)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-heading font-semibold text-ink">{s.label}</span>
                  {isActive && <span className="text-xs">✓</span>}
                </div>
                <div className="flex gap-1.5">
                  {s.swatches.map((c) => (
                    <span key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
