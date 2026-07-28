import { motion } from 'framer-motion';
import { HomeIcon, CalendarIcon, HabitIcon, WalletIcon, GameIcon, ProfileIcon } from './icons/NavIcons';

const TABS = [
  { id: 'today', label: 'Hari Ini', Icon: HomeIcon },
  { id: 'calendar', label: 'Kalender', Icon: CalendarIcon },
  { id: 'habit', label: 'Habit', Icon: HabitIcon },
  { id: 'expense', label: 'Uang', Icon: WalletIcon },
  { id: 'games', label: 'Main', Icon: GameIcon },
  { id: 'profile', label: 'Profil', Icon: ProfileIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed left-0 right-0 z-40 flex justify-center px-2"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex gap-0.5 p-1.5 rounded-full shadow-soft bg-surface border border-border max-w-full overflow-x-auto no-scrollbar"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              layout
              type="button"
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.92 }}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex items-center gap-1 px-2.5 py-2.5 rounded-full shrink-0"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative" style={{ color: isActive ? '#fff' : 'var(--color-muted)' }} />
              {isActive && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative text-xs font-heading font-semibold whitespace-nowrap"
                  style={{ color: '#fff' }}
                >
                  {label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
