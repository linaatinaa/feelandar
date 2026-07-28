import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameCatalog from './GameCatalog';
import BubblePop from './BubblePop';
import MemoryGame from './MemoryGame';
import MathGame from './MathGame';
import ColorMatch from './ColorMatch';
import SimonSequence from './SimonSequence';
import MirrorFaceOff from './MirrorFaceOff';

const GAME_COMPONENTS = {
  bubble: BubblePop,
  memory: MemoryGame,
  math: MathGame,
  colormatch: ColorMatch,
  simon: SimonSequence,
  mirror: MirrorFaceOff,
};

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(null);
  const ActiveComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

  return (
    <AnimatePresence mode="wait">
      {ActiveComponent ? (
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.2 }}
        >
          <ActiveComponent onBack={() => setActiveGame(null)} />
        </motion.div>
      ) : (
        <motion.div
          key="catalog"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          <GameCatalog onSelectGame={setActiveGame} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
