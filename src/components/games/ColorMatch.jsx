import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';

const GAME_SECONDS = 30;

const COLORS = [
  { id: 'merah', label: 'MERAH', hex: '#EF4444' },
  { id: 'biru', label: 'BIRU', hex: '#3B82F6' },
  { id: 'hijau', label: 'HIJAU', hex: '#22C55E' },
  { id: 'kuning', label: 'KUNING', hex: '#EAB308' },
  { id: 'ungu', label: 'UNGU', hex: '#A855F7' },
  { id: 'oranye', label: 'ORANYE', hex: '#F97316' },
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateRound() {
  const word = randomColor();
  const display = randomColor();
  return { label: word.label, displayId: display.id, displayHex: display.hex };
}

export default function ColorMatch({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(generateRound);
  const [feedback, setFeedback] = useState(null); // { choiceId, correct }
  const [status, setStatus] = useState('playing'); // playing | ended
  const advanceTimeout = useRef(null);

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

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const handleAnswer = useCallback(
    (choiceId) => {
      if (status !== 'playing' || feedback) return;
      const isCorrect = choiceId === round.displayId;
      setFeedback({ choiceId, correct: isCorrect });
      if (isCorrect) setScore((s) => s + 1);

      advanceTimeout.current = setTimeout(() => {
        setFeedback(null);
        setRound(generateRound());
      }, 400);
    },
    [status, feedback, round]
  );

  const reset = useCallback(() => {
    clearTimeout(advanceTimeout.current);
    setTimeLeft(GAME_SECONDS);
    setScore(0);
    setRound(generateRound());
    setFeedback(null);
    setStatus('playing');
  }, []);

  const progress = (timeLeft / GAME_SECONDS) * 100;

  return (
    <GameShell title="Color Match Reflex" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-2 text-xs text-muted">
          <span>Skor: {score}</span>
          <span>{timeLeft}s</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-surface-alt mb-5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {status === 'playing' ? (
          <>
            <p className="text-center text-xs text-muted mb-2">Tap warna sesuai TAMPILAN teks, bukan artinya</p>
            <div
              className="text-center font-heading text-4xl font-extrabold mb-6"
              style={{ color: round.displayHex }}
            >
              {round.label}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map((c) => {
                const isSelected = feedback?.choiceId === c.id;
                const showRing = isSelected && feedback.correct;
                const showWrong = isSelected && !feedback.correct;
                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    disabled={Boolean(feedback)}
                    whileTap={!feedback ? { scale: 0.88 } : undefined}
                    onClick={() => handleAnswer(c.id)}
                    className="aspect-square rounded-2xl"
                    style={{
                      background: c.hex,
                      outline: showRing ? '3px solid #4ADE80' : showWrong ? '3px solid #F87171' : 'none',
                      outlineOffset: '2px',
                      opacity: feedback && !isSelected ? 0.5 : 1,
                    }}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="font-heading text-base text-ink mb-1">Waktu habis! ⏱️</p>
            <p className="text-sm text-muted mb-4">Skor akhir kamu: {score}</p>
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
