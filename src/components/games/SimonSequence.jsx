import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';
import MoodMascot from '../mascots/MoodMascot';

const MOODS = ['happy', 'neutral', 'tired', 'sad', 'angry'];
const STEP_MS = 600;
const ON_MS = 400;

function randomMood() {
  return MOODS[Math.floor(Math.random() * MOODS.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function SimonSequence({ onBack }) {
  const [sequence, setSequence] = useState([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeMood, setActiveMood] = useState(null);
  const [wrongMood, setWrongMood] = useState(null);
  const [phase, setPhase] = useState('playing'); // playing | input | advancing | lost
  const playbackToken = useRef(0);

  const startGame = useCallback(() => {
    playbackToken.current += 1;
    setSequence([randomMood()]);
    setInputIndex(0);
    setWrongMood(null);
    setPhase('playing');
  }, []);

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || sequence.length === 0) return undefined;
    const token = playbackToken.current;
    let cancelled = false;

    (async () => {
      await sleep(500);
      for (const mood of sequence) {
        if (cancelled || playbackToken.current !== token) return;
        setActiveMood(mood);
        await sleep(ON_MS);
        if (cancelled || playbackToken.current !== token) return;
        setActiveMood(null);
        await sleep(STEP_MS - ON_MS);
      }
      if (!cancelled && playbackToken.current === token) setPhase('input');
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, sequence]);

  function handleTap(mood) {
    if (phase !== 'input') return;

    if (mood !== sequence[inputIndex]) {
      setWrongMood(mood);
      playbackToken.current += 1;
      setTimeout(() => setPhase('lost'), 450);
      return;
    }

    const nextIndex = inputIndex + 1;
    if (nextIndex === sequence.length) {
      setPhase('advancing');
      confetti({ particleCount: 22, spread: 55, origin: { y: 0.4 }, scalar: 0.65 });
      setTimeout(() => {
        setSequence((seq) => [...seq, randomMood()]);
        setInputIndex(0);
        setPhase('playing');
      }, 650);
    } else {
      setInputIndex(nextIndex);
    }
  }

  const bestRound = Math.max(0, sequence.length - 1);
  const phaseLabel =
    phase === 'playing' ? 'Perhatikan urutannya…' : phase === 'input' ? 'Giliranmu! Ulangi urutannya' : phase === 'advancing' ? 'Mantap! Lanjut ronde berikutnya…' : '';

  return (
    <GameShell title="Emoji Memory Sequence" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between mb-3 text-xs text-muted">
          <span>Ronde: {bestRound}</span>
          <span>Panjang urutan: {sequence.length}</span>
        </div>

        {phase !== 'lost' ? (
          <>
            <p className="text-center text-sm text-ink font-heading mb-5 h-5">{phaseLabel}</p>
            <div className="flex justify-center gap-3 flex-wrap mb-2">
              {MOODS.map((mood) => {
                const isActive = activeMood === mood;
                const isWrong = wrongMood === mood;
                return (
                  <motion.button
                    key={mood}
                    type="button"
                    disabled={phase !== 'input'}
                    onClick={() => handleTap(mood)}
                    whileTap={phase === 'input' ? { scale: 0.88 } : undefined}
                    animate={isActive ? { scale: 1.18 } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-2xl p-2"
                    style={{
                      background: isWrong
                        ? '#F87171'
                        : isActive
                        ? 'var(--color-surface-alt)'
                        : 'transparent',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                    }}
                  >
                    <MoodMascot mood={mood} size={56} />
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="font-heading text-base text-ink mb-1">Urutannya salah 😅</p>
            <p className="text-sm text-muted mb-4">Kamu berhasil sampai ronde ke-{bestRound}</p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
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
