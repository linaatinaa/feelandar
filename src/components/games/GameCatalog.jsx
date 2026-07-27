import { motion } from 'framer-motion';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const GAMES = [
  {
    id: 'bubble',
    title: 'Bubble Pop Mood',
    tagline: 'Pop gelembung warna-warni sebelum melayang hilang',
    icon: '🫧',
  },
  {
    id: 'memory',
    title: 'Cocokkan Kartu',
    tagline: 'Ingat posisi & pasangkan kartu mood',
    icon: '🧠',
  },
  {
    id: 'math',
    title: 'Adu Cepat Hitung',
    tagline: 'Jawab soal matematika sebelum waktu habis',
    icon: '⏱️',
  },
  {
    id: 'colormatch',
    title: 'Color Match Reflex',
    tagline: 'Tap warna tampilan teks, bukan artinya',
    icon: '🎨',
  },
  {
    id: 'simon',
    title: 'Emoji Memory Sequence',
    tagline: 'Ingat & ulangi urutan mood yang makin panjang',
    icon: '🔁',
  },
  {
    id: 'whack',
    title: 'Whack-a-Worry',
    tagline: 'Pukul kekhawatiran sebelum ilang duluan',
    icon: '🔨',
  },
  {
    id: 'rhythm',
    title: 'Tap the Rhythm',
    tagline: 'Tap pas lingkaran paling besar, rasakan ritmenya',
    icon: '🎵',
  },
  {
    id: 'mirror',
    title: 'Mirror Face-Off',
    tagline: 'Susun ekspresi wajah sesuai target',
    icon: '🪞',
  },
];

export default function GameCatalog({ onSelectGame }) {
  return (
    <div>
      <h1 className="font-heading text-lg text-ink mb-1">Main Yuk 🎮</h1>
      <p className="text-sm text-muted mb-4">Istirahat sejenak, main game ringan sambil santai.</p>

      <motion.div className="flex flex-col gap-3" variants={gridVariants} initial="hidden" animate="show">
        {GAMES.map((game) => (
          <motion.button
            key={game.id}
            type="button"
            variants={cardVariants}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectGame(game.id)}
            className="flex items-center gap-4 rounded-3xl p-4 text-left shadow-soft bg-surface border border-border"
          >
            <span
              className="text-3xl w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-surface-alt)' }}
            >
              {game.icon}
            </span>
            <div className="min-w-0">
              <div className="font-heading text-sm text-ink">{game.title}</div>
              <div className="text-xs text-muted leading-snug">{game.tagline}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
