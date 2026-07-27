import { motion } from 'framer-motion';
import { HomeIcon, ProfileIcon } from './icons/NavIcons';

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'profile', label: 'Profil', Icon: ProfileIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed left-0 right-0 z-40 flex justify-center px-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex gap-1 p-1.5 rounded-full shadow-soft bg-surface border border-border"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-full"
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
              <span
                className="relative text-xs font-heading font-semibold"
                style={{ color: isActive ? '#fff' : 'var(--color-muted)' }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
