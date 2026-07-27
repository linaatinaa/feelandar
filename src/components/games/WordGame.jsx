import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';
import { WORD_SET, pickRandomWord } from '../../lib/wordList';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const STATUS_COLOR = {
  correct: { bg: '#4ADE80', text: '#0f2e1a' },
  present: { bg: '#FBBF24', text: '#3a2a03' },
  absent: { bg: 'var(--color-border)', text: 'var(--color-muted)' },
  empty: { bg: 'var(--color-surface-alt)', text: 'var(--color-ink)' },
};

/** Classic Wordle letter-status algorithm, handling duplicate letters correctly. */
function scoreGuess(guess, answer) {
  const result = new Array(WORD_LENGTH).fill('absent');
  const answerLetters = answer.split('');
  const used = new Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    const idx = answerLetters.findIndex((letter, j) => letter === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = 'present';
      used[idx] = true;
    }
  }
  return result;
}

function mergeKeyboardStatus(prev, guess, scores) {
  const next = { ...prev };
  const rank = { absent: 0, present: 1, correct: 2 };
  guess.split('').forEach((letter, i) => {
    const status = scores[i];
    if (!next[letter] || rank[status] > rank[next[letter]]) {
      next[letter] = status;
    }
  });
  return next;
}

export default function WordGame({ onBack }) {
  const [answer, setAnswer] = useState(pickRandomWord);
  const [guesses, setGuesses] = useState([]); // [{ word, scores }]
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState('playing'); // playing | won | lost
  const [message, setMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState({});

  const resetGame = useCallback(() => {
    setAnswer(pickRandomWord());
    setGuesses([]);
    setCurrent('');
    setStatus('playing');
    setMessage('');
    setKeyboardStatus({});
  }, []);

  const submitGuess = useCallback(() => {
    if (status !== 'playing') return;
    if (current.length !== WORD_LENGTH) {
      setMessage('Kurang huruf');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    if (!WORD_SET.has(current)) {
      setMessage('Kata tidak dikenal');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const scores = scoreGuess(current, answer);
    const nextGuesses = [...guesses, { word: current, scores }];
    setGuesses(nextGuesses);
    setKeyboardStatus((prev) => mergeKeyboardStatus(prev, current, scores));
    setMessage('');

    if (current === answer) {
      setStatus('won');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
    }
    setCurrent('');
  }, [current, answer, guesses, status]);

  const handleKey = useCallback(
    (key) => {
      if (status !== 'playing') return;
      if (key === 'ENTER') return submitGuess();
      if (key === 'BACK') return setCurrent((c) => c.slice(0, -1));
      if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
        setCurrent((c) => c + key);
      }
    },
    [status, current, submitGuess]
  );

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKey('ENTER');
      else if (key === 'BACKSPACE') handleKey('BACK');
      else if (/^[A-Z]$/.test(key)) handleKey(key);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  const rows = useMemo(() => {
    const filled = guesses.map((g) => ({ letters: g.word.split(''), scores: g.scores }));
    const activeRow =
      status === 'playing' && filled.length < MAX_GUESSES
        ? { letters: current.split(''), scores: null }
        : null;
    const blanks = MAX_GUESSES - filled.length - (activeRow ? 1 : 0);
    return [...filled, ...(activeRow ? [activeRow] : []), ...Array(Math.max(0, blanks)).fill(null)];
  }, [guesses, current, status]);

  return (
    <GameShell title="Tebak Kata" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex flex-col items-center gap-1.5 mb-4">
          {rows.map((row, ri) => (
            <motion.div
              key={ri}
              className="flex gap-1.5"
              animate={shake && ri === guesses.length ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.35 }}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, ci) => {
                const letter = row?.letters[ci] || '';
                const scoreStatus = row?.scores?.[ci] || 'empty';
                const colors = STATUS_COLOR[scoreStatus];
                return (
                  <motion.div
                    key={ci}
                    initial={row?.scores ? { rotateX: 90 } : false}
                    animate={{ rotateX: 0 }}
                    transition={{ delay: row?.scores ? ci * 0.08 : 0, duration: 0.3 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg font-heading font-bold border"
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      borderColor: letter && !row?.scores ? 'var(--color-primary)' : 'transparent',
                    }}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>

        <div className="text-center text-xs h-4 mb-2" style={{ color: 'var(--color-secondary)' }}>
          {message}
        </div>

        {status !== 'playing' && (
          <div className="text-center mb-3">
            <p className="font-heading text-sm text-ink mb-1">
              {status === 'won' ? 'Kamu menang! 🎉' : `Jawabannya: ${answer}`}
            </p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="rounded-2xl px-4 py-2 text-sm font-heading font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              Main Lagi
            </motion.button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => {
                const st = keyboardStatus[key];
                const colors = st ? STATUS_COLOR[st] : STATUS_COLOR.empty;
                const isWide = key === 'ENTER' || key === 'BACK';
                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKey(key)}
                    className={`h-10 rounded-lg text-[11px] font-heading font-semibold flex items-center justify-center ${
                      isWide ? 'px-2 min-w-[2.6rem]' : 'w-7 sm:w-8'
                    }`}
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {key === 'BACK' ? '⌫' : key === 'ENTER' ? 'OK' : key}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
