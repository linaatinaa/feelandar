import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';

const ROUND_SECONDS = 30;
const START_CYCLE_MS = 1400;
const MIN_CYCLE_MS = 750;
const SPEEDUP_INTERVAL_MS = 8000;
const SPEEDUP_FACTOR = 0.88;
const PERFECT_WINDOW_MS = 80;
const GOOD_WINDOW_MS = 200;

/** Shortest distance from `t` to the nearest occurrence of `target`, wrapping around `cycle`. */
function circularDistance(t, target, cycle) {
  let diff = (t - target) % cycle;
  if (diff < -cycle / 2) diff += cycle;
  if (diff > cycle / 2) diff -= cycle;
  return Math.abs(diff);
}

const RATING_STYLE = {
  perfect: { text: 'Perfect!', color: '#4ADE80' },
  good: { text: 'Good', color: '#FBBF24' },
  miss: { text: 'Miss', color: '#F87171' },
};

export default function TapRhythm({ onBack }) {
  const [score, setScore] = useState(0);
  const [counts, setCounts] = useState({ perfect: 0, good: 0, miss: 0 });
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [status, setStatus] = useState('playing'); // playing | ended
  const [feedback, setFeedback] = useState(null); // { rating, id }

  const scale = useMotionValue(1);
  const statusRef = useRef('playing');
  const cycleRef = useRef(START_CYCLE_MS);
  const phaseStartRef = useRef(performance.now());
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useAnimationFrame((t) => {
    if (statusRef.current !== 'playing') return;
    const cycle = cycleRef.current;
    const elapsed = t - phaseStartRef.current;
    const s = 1 + 0.32 * Math.sin((2 * Math.PI * elapsed) / cycle);
    scale.set(s);
  });

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const speedup = setInterval(() => {
      cycleRef.current = Math.max(MIN_CYCLE_MS, Math.round(cycleRef.current * SPEEDUP_FACTOR));
      phaseStartRef.current = performance.now();
    }, SPEEDUP_INTERVAL_MS);
    return () => clearInterval(speedup);
  }, [status]);

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
      if (score > 0) confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    }
  }, [timeLeft, status, score]);

  useEffect(() => () => clearTimeout(feedbackTimeoutRef.current), []);

  function handleTap() {
    if (status !== 'playing') return;
    const cycle = cycleRef.current;
    const now = performance.now();
    const elapsed = now - phaseStartRef.current;
    const phaseTime = ((elapsed % cycle) + cycle) % cycle;
    const dist = circularDistance(phaseTime, cycle / 4, cycle);

    let rating;
    if (dist <= PERFECT_WINDOW_MS) rating = 'perfect';
    else if (dist <= GOOD_WINDOW_MS) rating = 'good';
    else rating = 'miss';

    const points = rating === 'perfect' ? 3 : rating === 'good' ? 1 : 0;
    setScore((s) => s + points);
    setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }));
    setFeedback({ rating, id: now });
    clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 350);
  }

  function reset() {
    setScore(0);
    setCounts({ perfect: 0, good: 0, miss: 0 });
    setTimeLeft(ROUND_SECONDS);
    setFeedback(null);
    cycleRef.current = START_CYCLE_MS;
    phaseStartRef.current = performance.now();
    setStatus('playing');
  }

  return (
    <GameShell title="Tap the Rhythm" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-2 text-xs text-muted">
          <span>Skor: {score}</span>
          <span>{timeLeft}s</span>
        </div>

        {status === 'playing' ? (
          <>
            <p className="text-center text-xs text-muted mb-4">Tap tombol pas lingkaran paling besar!</p>
            <button
              type="button"
              onClick={handleTap}
              className="relative w-full flex items-center justify-center py-8"
              style={{ touchAction: 'manipulation' }}
            >
              <motion.div
                style={{
                  scale,
                  width: 100,
                  height: 100,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                }}
              />
              {feedback && (
                <motion.span
                  key={feedback.id}
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -16, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute font-heading font-bold text-lg"
                  style={{ color: RATING_STYLE[feedback.rating].color, top: -4 }}
                >
                  {RATING_STYLE[feedback.rating].text}
                </motion.span>
              )}
            </button>
            <div className="flex justify-center gap-4 mt-4 text-[11px] text-muted">
              <span>Perfect: {counts.perfect}</span>
              <span>Good: {counts.good}</span>
              <span>Miss: {counts.miss}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="font-heading text-base text-ink mb-1">Waktu habis! 🎵</p>
            <p className="text-sm text-muted mb-1">Skor akhir: {score}</p>
            <p className="text-xs text-muted mb-4">
              Perfect {counts.perfect} · Good {counts.good} · Miss {counts.miss}
            </p>
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
