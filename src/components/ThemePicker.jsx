import { motion } from 'framer-motion';
import { SKINS } from '../lib/theme';

const CARD_DECOR = {
  dreamy: ['✨', '☁️', '⭐️'],
  bold: ['⚡️', '▲', '●'],
};

export default function ThemePicker({ onSelect }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{
        background: 'linear-gradient(135deg, #ffe3ec 0%, #f3e1ff 35%, #e1eeff 70%, #fff3e0 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-2">🌈</div>
        <h1 className="font-heading text-2xl mb-1" style={{ color: '#423a4d', fontWeight: 700 }}>
          Pilih vibe Feelandar-mu
        </h1>
        <p className="text-sm max-w-xs" style={{ color: '#7a6f88' }}>
          Kamu bisa ganti kapan saja lewat halaman profil.
        </p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {Object.values(SKINS).map((skin, i) => (
          <motion.button
            key={skin.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(skin.id)}
            className="relative overflow-hidden rounded-3xl p-5 text-left shadow-lg"
            style={{
              background:
                skin.id === 'dreamy'
                  ? 'linear-gradient(135deg, #fff0f6 0%, #f2e6ff 100%)'
                  : 'linear-gradient(135deg, #12142b 0%, #1c1548 100%)',
              border: skin.id === 'dreamy' ? '1px solid #f3ddef' : '1px solid #33356b',
            }}
          >
            <div className="absolute top-3 right-4 text-lg opacity-40 flex gap-1">
              {CARD_DECOR[skin.id].map((d, idx) => (
                <span key={idx}>{d}</span>
              ))}
            </div>
            <div
              className="font-heading text-xl mb-1"
              style={{ color: skin.id === 'dreamy' ? '#423a4d' : '#f4f6ff', fontWeight: 700 }}
            >
              {skin.label}
            </div>
            <div className="text-xs mb-3" style={{ color: skin.id === 'dreamy' ? '#8b7f9c' : '#9aa0c9' }}>
              {skin.tagline}
            </div>
            <div className="flex gap-2">
              {skin.swatches.map((c) => (
                <span
                  key={c}
                  className="w-6 h-6 rounded-full"
                  style={{ background: c, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                />
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
