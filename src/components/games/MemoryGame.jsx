import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';
import MoodMascot from '../mascots/MoodMascot';

const MOOD_SYMBOLS = ['happy', 'neutral', 'tired', 'sad', 'angry'];
const EMOJI_SYMBOLS = ['🌈', '✨', '🔥'];
const ALL_SYMBOLS = [...MOOD_SYMBOLS, ...EMOJI_SYMBOLS];

function shuffledDeck() {
  const pairs = ALL_SYMBOLS.flatMap((symbol, i) => [
    { id: `${symbol}-a`, symbol },
    { id: `${symbol}-b`, symbol },
  ]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((card, index) => ({ ...card, index }));
}

function CardFace({ symbol }) {
  return MOOD_SYMBOLS.includes(symbol) ? (
    <MoodMascot mood={symbol} size={36} />
  ) : (
    <span className="text-2xl">{symbol}</span>
  );
}

export default function MemoryGame({ onBack }) {
  const [deck, setDeck] = useState(shuffledDeck);
  const [flipped, setFlipped] = useState([]); // indices currently face-up, not yet matched
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const won = matched.size === ALL_SYMBOLS.length;

  const reset = useCallback(() => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
  }, []);

  const handleFlip = useCallback(
    (card) => {
      if (locked || flipped.includes(card.index) || matched.has(card.symbol)) return;
      if (flipped.length === 0) {
        setFlipped([card.index]);
        return;
      }

      const firstIndex = flipped[0];
      const firstCard = deck[firstIndex];
      const nextFlipped = [firstIndex, card.index];
      setFlipped(nextFlipped);
      setMoves((m) => m + 1);

      if (firstCard.symbol === card.symbol) {
        const nextMatched = new Set(matched).add(card.symbol);
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.size === ALL_SYMBOLS.length) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        }
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    },
    [deck, flipped, matched, locked]
  );

  const gridVariants = useMemo(
    () => ({ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }),
    []
  );
  const cardVariants = { hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1 } };

  return (
    <GameShell title="Cocokkan Kartu" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-3 text-xs text-muted">
          <span>Langkah: {moves}</span>
          <span>
            {matched.size}/{ALL_SYMBOLS.length} pasang
          </span>
        </div>

        <motion.div
          className="grid grid-cols-4 gap-2 mb-3"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {deck.map((card) => {
            const isFaceUp = flipped.includes(card.index) || matched.has(card.symbol);
            const isMatched = matched.has(card.symbol);
            return (
              <motion.button
                key={card.id}
                type="button"
                variants={cardVariants}
                onClick={() => handleFlip(card)}
                whileTap={!isFaceUp ? { scale: 0.9 } : undefined}
                className="aspect-square"
                style={{ perspective: 600 }}
              >
                <motion.div
                  className="relative w-full h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFaceUp ? 180 : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center text-lg font-heading font-bold"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      color: '#fff',
                    }}
                  >
                    ?
                  </div>
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: isMatched ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                      opacity: isMatched ? 0.7 : 1,
                    }}
                  >
                    <CardFace symbol={card.symbol} />
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>

        {won && (
          <div className="text-center">
            <p className="font-heading text-sm text-ink mb-2">Semua pasangan ketemu dalam {moves} langkah! 🎉</p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="rounded-2xl px-4 py-2 text-sm font-heading font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              Main Lagi
            </motion.button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
