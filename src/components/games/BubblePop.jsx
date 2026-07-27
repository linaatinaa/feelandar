import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';

const ROUND_SECONDS = 30;
const CONTAINER_HEIGHT = 380;
const SPAWN_MS = 650;
const COMBO_WINDOW_MS = 900;
const GOOD_BUBBLE_CHANCE = 0.42;

// Bad (pop these!) vs good (leave them be) mood bubbles — distinguished by
// both color and emoji so the choice reads instantly under time pressure.
const BAD_EMOJIS = ['😠', '😣', '😢', '😤'];
const GOOD_EMOJIS = ['😄', '🥰', '😊', '😌'];
const BAD_COLOR = '#F87171';
const GOOD_COLOR = '#4ADE80';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function BubblePop({ onBack }) {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [status, setStatus] = useState('playing'); // playing | ended
  const [mistakeFlash, setMistakeFlash] = useState(false);

  const lastPopRef = useRef(0);
  const idRef = useRef(0);
  const missTimeoutsRef = useRef(new Map());
  const spawnIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const flashTimeoutRef = useRef(null);

  const missBubble = useCallback((id, kind) => {
    missTimeoutsRef.current.delete(id);
    setBubbles((b) => b.filter((bub) => bub.id !== id));
    // Letting a "good" bubble float away is the correct move — only a
    // missed "bad" bubble should break the combo.
    if (kind === 'bad') setCombo(0);
  }, []);

  const popBubble = useCallback((bubble) => {
    const timeoutId = missTimeoutsRef.current.get(bubble.id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      missTimeoutsRef.current.delete(bubble.id);
    }
    setBubbles((b) => b.filter((bub) => bub.id !== bubble.id));

    if (bubble.kind === 'good') {
      setCombo(0);
      setMistakeFlash(true);
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setMistakeFlash(false), 300);
      return;
    }

    const now = Date.now();
    setCombo((c) => {
      const next = now - lastPopRef.current < COMBO_WINDOW_MS ? c + 1 : 1;
      setMaxCombo((m) => Math.max(m, next));
      setScore((s) => s + next);
      return next;
    });
    lastPopRef.current = now;
  }, []);

  // Spawn loop
  useEffect(() => {
    if (status !== 'playing') return undefined;
    spawnIntervalRef.current = setInterval(() => {
      const id = idRef.current++;
      const duration = randInt(28, 42) / 10; // seconds
      const isGood = Math.random() < GOOD_BUBBLE_CHANCE;
      const kind = isGood ? 'good' : 'bad';
      const emojiPool = isGood ? GOOD_EMOJIS : BAD_EMOJIS;
      const bubble = {
        id,
        x: randInt(6, 86),
        size: randInt(42, 68),
        color: isGood ? GOOD_COLOR : BAD_COLOR,
        emoji: emojiPool[randInt(0, emojiPool.length - 1)],
        kind,
        duration,
      };
      setBubbles((b) => [...b, bubble]);
      const timeoutId = setTimeout(() => missBubble(id, kind), duration * 1000);
      missTimeoutsRef.current.set(id, timeoutId);
    }, SPAWN_MS);
    return () => clearInterval(spawnIntervalRef.current);
  }, [status, missBubble]);

  // Countdown
  useEffect(() => {
    if (status !== 'playing') return undefined;
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [status]);

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing') {
      setStatus('ended');
      clearInterval(spawnIntervalRef.current);
      missTimeoutsRef.current.forEach((t) => clearTimeout(t));
      missTimeoutsRef.current.clear();
      setBubbles([]);
      if (score > 0) confetti({ particleCount: 70, spread: 75, origin: { y: 0.5 } });
    }
  }, [timeLeft, status, score]);

  useEffect(
    () => () => {
      clearInterval(spawnIntervalRef.current);
      clearInterval(countdownRef.current);
      clearTimeout(flashTimeoutRef.current);
      missTimeoutsRef.current.forEach((t) => clearTimeout(t));
    },
    []
  );

  function reset() {
    setBubbles([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(ROUND_SECONDS);
    lastPopRef.current = 0;
    setMistakeFlash(false);
    setStatus('playing');
  }

  return (
    <GameShell title="Bubble Pop Mood" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-1 text-xs text-muted">
          <span className="flex items-center gap-2">
            Skor: {score}
            {combo > 1 && (
              <span className="font-heading font-semibold" style={{ color: 'var(--color-accent)' }}>
                Combo ×{combo}!
              </span>
            )}
          </span>
          <span>{timeLeft}s</span>
        </div>
        <p className="text-[11px] text-muted mb-2">🔴 Pop mood negatif · 🟢 Biarin mood positif lewat</p>

        {status === 'playing' ? (
          <div
            className="relative rounded-2xl overflow-hidden touch-none"
            style={{
              height: CONTAINER_HEIGHT,
              background: 'var(--color-surface-alt)',
              boxShadow: mistakeFlash ? 'inset 0 0 0 3px #F87171' : 'inset 0 0 0 0px transparent',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            <AnimatePresence>
              {bubbles.map((b) => (
                <motion.button
                  key={b.id}
                  type="button"
                  onClick={() => popBubble(b)}
                  aria-label={b.kind === 'bad' ? 'Gelembung mood negatif' : 'Gelembung mood positif'}
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    left: `${b.x}%`,
                    bottom: 0,
                    width: b.size,
                    height: b.size,
                    background: b.color,
                    fontSize: b.size * 0.5,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  }}
                  initial={{ y: 0, opacity: 0.9, scale: 1 }}
                  animate={{ y: -(CONTAINER_HEIGHT + b.size), transition: { duration: b.duration, ease: 'linear' } }}
                  exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.22 } }}
                  whileTap={{ scale: 0.85 }}
                >
                  {b.emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="font-heading text-base text-ink mb-1">Waktu habis! 🫧</p>
            <p className="text-sm text-muted mb-1">Skor akhir: {score}</p>
            <p className="text-sm text-muted mb-4">Combo terbaik: ×{maxCombo}</p>
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
