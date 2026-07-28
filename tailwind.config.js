/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        mood: {
          happy: 'var(--mood-happy)',
          loved: 'var(--mood-loved)',
          calm: 'var(--mood-calm)',
          excited: 'var(--mood-excited)',
          neutral: 'var(--mood-neutral)',
          tired: 'var(--mood-tired)',
          sad: 'var(--mood-sad)',
          angry: 'var(--mood-angry)',
          anxious: 'var(--mood-anxious)',
          sick: 'var(--mood-sick)',
        },
      },
      backgroundImage: {
        'app-gradient': 'var(--gradient-app)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 0px var(--color-accent))' },
          '50%': { opacity: 0.85, filter: 'drop-shadow(0 0 8px var(--color-accent))' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.5 },
          '40%': { transform: 'scale(1)', opacity: 1 },
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)' },
          '25%': { transform: 'scale(1.08) rotate(2deg)' },
          '50%': { transform: 'scale(0.96) rotate(-2deg)' },
          '75%': { transform: 'scale(1.05) rotate(3deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 1.6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        sparkle: 'sparkle 2.4s ease-in-out infinite',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
        'flame-flicker': 'flame-flicker 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
