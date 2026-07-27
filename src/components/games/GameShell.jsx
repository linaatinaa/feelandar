import { motion } from 'framer-motion';

export default function GameShell({ title, onBack, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Kembali ke daftar game"
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-soft bg-surface border border-border text-ink"
        >
          ‹
        </motion.button>
        <h1 className="font-heading text-base text-ink">{title}</h1>
      </div>
      {children}
    </div>
  );
}
