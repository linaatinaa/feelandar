import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameShell from './GameShell';
import { EYES_OPTIONS, BROWS_OPTIONS, MOUTH_OPTIONS, EXPRESSIONS } from './faceParts';

function findNode(options, id) {
  return options.find((o) => o.id === id)?.node ?? null;
}

function PartPicker({ title, options, selectedId, onPick }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-muted mb-1.5">{title}</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => onPick(opt.id)}
              aria-label={opt.label}
              className="shrink-0 rounded-xl p-1"
              style={{
                background: isSelected ? 'var(--color-surface-alt)' : 'transparent',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <svg viewBox="0 0 100 100" width="44" height="44">
                {opt.node}
              </svg>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function MirrorFaceOff({ onBack }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState({ eyes: null, brows: null, mouth: null });
  const [solved, setSolved] = useState(0);
  const [shake, setShake] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
  const [status, setStatus] = useState('playing'); // playing | done

  const target = EXPRESSIONS[index];
  const allFilled = Boolean(selected.eyes && selected.brows && selected.mouth);

  useEffect(() => {
    if (!allFilled || status !== 'playing') return undefined;

    const isMatch =
      selected.eyes === target.eyes && selected.brows === target.brows && selected.mouth === target.mouth;

    if (isMatch) {
      setJustSolved(true);
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.45 } });
      const t = setTimeout(() => {
        setJustSolved(false);
        setSolved((s) => s + 1);
        if (index + 1 >= EXPRESSIONS.length) {
          setStatus('done');
        } else {
          setIndex((i) => i + 1);
          setSelected({ eyes: null, brows: null, mouth: null });
        }
      }, 900);
      return () => clearTimeout(t);
    }

    setShake(true);
    const t = setTimeout(() => setShake(false), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, allFilled, status]);

  function pick(category, id) {
    if (status !== 'playing' || justSolved) return;
    setSelected((s) => ({ ...s, [category]: id }));
  }

  function reset() {
    setIndex(0);
    setSelected({ eyes: null, brows: null, mouth: null });
    setSolved(0);
    setStatus('playing');
    setJustSolved(false);
  }

  return (
    <GameShell title="Mirror Face-Off" onBack={onBack}>
      <div className="rounded-3xl p-4 shadow-soft bg-surface border border-border">
        {status === 'done' ? (
          <div className="text-center py-8">
            <p className="font-heading text-base text-ink mb-1">Semua ekspresi selesai! 🎉</p>
            <p className="text-sm text-muted mb-4">Kamu berhasil menyusun {solved} ekspresi</p>
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
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-muted">
              <span>
                Ekspresi {index + 1}/{EXPRESSIONS.length}
              </span>
              <span>Berhasil: {solved}</span>
            </div>
            <p className="text-center font-heading text-base text-ink mb-4">
              Buat ekspresi: {target.emoji} {target.label}
            </p>

            <motion.div
              className="mx-auto mb-5"
              style={{ width: 120, height: 120 }}
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : justSolved ? { scale: [1, 1.15, 1] } : { x: 0 }}
              transition={{ duration: shake ? 0.4 : 0.5 }}
            >
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="44" fill="var(--color-surface-alt)" />
                {selected.brows && findNode(BROWS_OPTIONS, selected.brows)}
                {selected.eyes && findNode(EYES_OPTIONS, selected.eyes)}
                {selected.mouth && findNode(MOUTH_OPTIONS, selected.mouth)}
              </svg>
            </motion.div>

            <PartPicker title="Mata" options={EYES_OPTIONS} selectedId={selected.eyes} onPick={(id) => pick('eyes', id)} />
            <PartPicker title="Alis" options={BROWS_OPTIONS} selectedId={selected.brows} onPick={(id) => pick('brows', id)} />
            <PartPicker title="Mulut" options={MOUTH_OPTIONS} selectedId={selected.mouth} onPick={(id) => pick('mouth', id)} />
          </>
        )}
      </div>
    </GameShell>
  );
}
