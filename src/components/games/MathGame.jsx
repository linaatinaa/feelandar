import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';

const GAME_SECONDS = 30;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const op = ['+', '-', '×'][randInt(0, 2)];
  let a, b, answer;
  if (op === '+') {
    a = randInt(1, 50);
    b = randInt(1, 50);
    answer = a + b;
  } else if (op === '-') {
    a = randInt(10, 50);
    b = randInt(1, a);
    answer = a - b;
  } else {
    a = randInt(2, 12);
    b = randInt(2, 12);
    answer = a * b;
  }

  // Build wrong choices from a fixed, shuffled pool of offsets — bounded by
  // construction (unlike a "keep sampling until we have 4 uniques" loop,
  // which can spin forever if the RNG repeats a value already in the set).
  const offsetPool = [-10, -7, -5, -3, -2, -1, 1, 2, 3, 5, 7, 10];
  for (let i = offsetPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [offsetPool[i], offsetPool[j]] = [offsetPool[j], offsetPool[i]];
  }

  const choices = new Set([answer]);
  for (const offset of offsetPool) {
    if (choices.size >= 4) break;
    const candidate = answer + offset;
    if (candidate >= 0) choices.add(candidate);
  }
  // Edge case (e.g. answer near 0 filters out several negatives): pad with
  // a strictly increasing filler so this loop is guaranteed to terminate.
  let filler = 1;
  while (choices.size < 4) {
    choices.add(answer + filler);
    filler += 1;
  }

  return { a, b, op, answer, choices: [...choices].sort(() => Math.random() - 0.5) };
}

export default function MathGame({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(generateQuestion);
  const [feedback, setFeedback] = useState(null); // { choice, correct }
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
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    }
  }, [timeLeft, status]);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const handleAnswer = useCallback(
    (choice) => {
      if (status !== 'playing' || feedback) return;
      const isCorrect = choice === question.answer;
      setFeedback({ choice, correct: isCorrect });
      if (isCorrect) setScore((s) => s + 1);

      advanceTimeout.current = setTimeout(() => {
        setFeedback(null);
        setQuestion(generateQuestion());
      }, 500);
    },
    [status, feedback, question]
  );

  const reset = useCallback(() => {
    clearTimeout(advanceTimeout.current);
    setTimeLeft(GAME_SECONDS);
    setScore(0);
    setQuestion(generateQuestion());
    setFeedback(null);
    setStatus('playing');
  }, []);

  const progress = (timeLeft / GAME_SECONDS) * 100;

  return (
    <GameShell title="Adu Cepat Hitung" onBack={onBack}>
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
            <div className="text-center font-heading text-3xl text-ink mb-6">
              {question.a} {question.op} {question.b}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.choices.map((choice) => {
                const isSelected = feedback?.choice === choice;
                const showCorrect = feedback && choice === question.answer;
                let bg = 'var(--color-surface-alt)';
                let color = 'var(--color-ink)';
                if (showCorrect) {
                  bg = '#4ADE80';
                  color = '#0f2e1a';
                } else if (isSelected && !feedback.correct) {
                  bg = '#F87171';
                  color = '#3a0d0d';
                }
                return (
                  <motion.button
                    key={choice}
                    type="button"
                    disabled={Boolean(feedback)}
                    whileTap={!feedback ? { scale: 0.94 } : undefined}
                    onClick={() => handleAnswer(choice)}
                    className="rounded-2xl py-4 text-xl font-heading font-bold"
                    style={{ background: bg, color }}
                  >
                    {choice}
                  </motion.button>
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
