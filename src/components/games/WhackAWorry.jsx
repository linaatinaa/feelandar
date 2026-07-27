import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';

const GRID_SIZE = 9;
const ROUND_SECONDS = 30;
const WORRY_ICONS = ['⛈️', '❗', '⏰', '😖', '💢'];
const MIN_LIFESPAN = 700;
const MAX_LIFESPAN = 1100;
const MIN_GAP = 400;
const MAX_GAP = 750;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function flavorText(score) {
  if (score === 0) return 'Belum ada yang kena, coba lagi yuk!';
  if (score < 8) return `Kamu berhasil ngatasin ${score} worry hari ini!`;
  if (score < 16) return `Mantap! ${score} worry berhasil kamu taklukkan!`;
  return `Luar biasa! ${score} worry lenyap kena tanganmu! 🔥`;
}

export default function WhackAWorry({ onBack }) {
  const [active, setActive] = useState(null); // { slot, icon, id }
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [status, setStatus] = useState('playing'); // playing | ended

  const statusRef = useRef('playing');
  const spawnTimeoutRef = useRef(null);
  const missTimeoutRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const scheduleNextSpawn = useCallback((delay) => {
    spawnTimeoutRef.current = setTimeout(() => {
      if (statusRef.current !== 'playing') return;
      const slot = randInt(0, GRID_SIZE - 1);
      const icon = WORRY_ICONS[randInt(0, WORRY_ICONS.length - 1)];
      const id = idRef.current++;
      const lifespan = randInt(MIN_LIFESPAN, MAX_LIFESPAN);

      setActive({ slot, icon, id });
      missTimeoutRef.current = setTimeout(() => {
        if (statusRef.current !== 'playing') return;
        setActive((cur) => (cur?.id === id ? null : cur));
        scheduleNextSpawn(randInt(MIN_GAP, MAX_GAP));
      }, lifespan);
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNextSpawn(600);
    return () => {
      clearTimeout(spawnTimeoutRef.current);
      clearTimeout(missTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing') {
      setStatus('ended');
      clearTimeout(spawnTimeoutRef.current);
      clearTimeout(missTimeoutRef.current);
      setActive(null);
      if (score > 0) confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    }
  }, [timeLeft, status, score]);

  function handleWhack(slot) {
    if (!active || active.slot !== slot || status !== 'playing') return;
    clearTimeout(missTimeoutRef.current);
    setActive(null);
    setScore((s) => s + 1);
    scheduleNextSpawn(randInt(MIN_GAP, MAX_GAP));
  }

  function reset() {
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setActive(null);
    setStatus('playing');
    scheduleNextSpawn(500);
  }

  const progress = (timeLeft / ROUND_SECONDS) * 100;

  return (
    <GameShell title="Whack-a-Worry" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-2 text-xs text-muted">
          <span>Skor: {score}</span>
          <span>{timeLeft}s</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-surface-alt mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {status === 'playing' ? (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: GRID_SIZE }).map((_, slot) => {
              const isActive = active?.slot === slot;
              return (
                <motion.button
                  key={slot}
                  type="button"
                  onClick={() => handleWhack(slot)}
                  whileTap={isActive ? { scale: 0.82 } : undefined}
                  className="aspect-square rounded-2xl flex items-center justify-center text-3xl overflow-hidden"
                  style={{ background: 'var(--color-surface-alt)' }}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        key={active.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {active.icon}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="font-heading text-base text-ink mb-2">Waktu habis! ⏱️</p>
            <p className="text-sm text-muted mb-4">{flavorText(score)}</p>
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
