import { motion } from 'framer-motion';
import { SKINS } from '../lib/theme';

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
          Pilih vibe Seavy-mu
        </h1>
        <p className="text-sm max-w-xs" style={{ color: '#7a6f88' }}>
          Kamu bisa ganti kapan saja lewat halaman profil.
        </p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {Object.values(SKINS).map((skin, i) => (
          <motion.button
            key={skin.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(skin.id)}
            className="relative overflow-hidden rounded-3xl p-4 text-left shadow-lg flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${skin.swatches[0]} 0%, ${skin.swatches[3]} 100%)`,
              border: `1px solid ${skin.dark ? '#3a3550' : '#00000014'}`,
            }}
          >
            <span className="text-2xl shrink-0">{skin.emoji}</span>
            <div className="min-w-0 flex-1">
              <div
                className="font-heading text-base leading-tight"
                style={{ color: skin.dark ? '#f4f6ff' : '#3a2f45', fontWeight: 700 }}
              >
                {skin.label}
              </div>
              <div className="text-xs leading-tight" style={{ color: skin.dark ? '#a7aede' : '#7a6f88' }}>
                {skin.tagline}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {skin.swatches.map((c) => (
                <span
                  key={c}
                  className="w-4 h-4 rounded-full"
                  style={{ background: c, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                />
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
