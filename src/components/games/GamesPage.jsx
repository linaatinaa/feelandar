import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameCatalog from './GameCatalog';
import WordGame from './WordGame';
import MemoryGame from './MemoryGame';
import MathGame from './MathGame';

const GAME_COMPONENTS = {
  word: WordGame,
  memory: MemoryGame,
  math: MathGame,
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
