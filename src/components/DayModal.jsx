import { motion, AnimatePresence } from 'framer-motion';
import MoodMascot from './mascots/MoodMascot';
import { findMood } from '../lib/moods';

export default function DayModal({ entry, onClose }) {
  const moods = (entry?.mood_emojis || []).map(findMood).filter(Boolean);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="w-full sm:w-80 rounded-t-3xl sm:rounded-3xl p-5 pb-6 shadow-soft bg-surface text-ink max-h-[85vh] overflow-y-auto"
          >
            <div className="text-center mb-4">
              <div className="flex justify-center gap-1 flex-wrap">
                {moods.map((mood) => (
                  <MoodMascot key={mood.value} mood={mood.value} size={moods.length > 3 ? 52 : 68} />
                ))}
              </div>
              <div className="text-sm text-muted mt-2">{moods.map((m) => m.label).join(' · ')}</div>
              <div className="text-xs text-muted opacity-70 mt-1">{entry.date}</div>
            </div>

            {entry.doing && (
              <p className="text-sm mb-2">
                <span className="text-muted">Lagi: </span>
                {entry.doing}
              </p>
            )}

            {entry.story ? (
              <p className="text-sm rounded-2xl p-3 whitespace-pre-wrap break-words bg-surface-alt">
                {entry.story}
              </p>
            ) : (
              <p className="text-sm text-center text-muted">Tidak ada cerita</p>
            )}

            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-5 rounded-2xl py-2.5 text-sm font-heading font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              Tutup
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
