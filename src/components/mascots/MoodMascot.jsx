const BLOB_PATH =
  'M50 8C68 8 90 22 92 46C94 68 76 92 50 92C24 92 6 68 8 46C10 22 32 8 50 8Z';

const FACE = 'rgba(28, 20, 40, 0.72)';

function Face({ mood }) {
  switch (mood) {
    case 'happy':
      return (
        <g>
          <circle cx="35" cy="45" r="5" fill={FACE} />
          <circle cx="65" cy="45" r="5" fill={FACE} />
          <circle cx="33" cy="43" r="1.5" fill="#fff" />
          <circle cx="63" cy="43" r="1.5" fill="#fff" />
          <circle cx="27" cy="58" r="5" fill="#ff9db3" opacity="0.5" />
          <circle cx="73" cy="58" r="5" fill="#ff9db3" opacity="0.5" />
          <path d="M32 58 Q50 80 68 58" stroke={FACE} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'neutral':
      return (
        <g>
          <ellipse cx="35" cy="46" rx="5" ry="3.5" fill={FACE} />
          <ellipse cx="65" cy="46" rx="5" ry="3.5" fill={FACE} />
          <line x1="38" y1="64" x2="62" y2="64" stroke={FACE} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'tired':
      return (
        <g>
          <path d="M29 46 Q35 40 41 46" stroke={FACE} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M59 46 Q65 40 71 46" stroke={FACE} strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="66" r="6" fill={FACE} opacity="0.85" />
          <text x="74" y="24" fontSize="11" fill={FACE} fontFamily="sans-serif" opacity="0.6">Z</text>
          <text x="82" y="16" fontSize="8" fill={FACE} fontFamily="sans-serif" opacity="0.5">z</text>
        </g>
      );
    case 'sad':
      return (
        <g>
          <path d="M28 42 L44 34" stroke={FACE} strokeWidth="4" strokeLinecap="round" />
          <path d="M72 42 L56 34" stroke={FACE} strokeWidth="4" strokeLinecap="round" />
          <circle cx="35" cy="48" r="4.5" fill={FACE} />
          <circle cx="65" cy="48" r="4.5" fill={FACE} />
          <path d="M28 47 Q23 55 27 62" stroke="#7fb8ef" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M35 68 Q50 54 65 68" stroke={FACE} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'angry':
      return (
        <g>
          <path d="M28 34 L44 42" stroke={FACE} strokeWidth="4" strokeLinecap="round" />
          <path d="M72 34 L56 42" stroke={FACE} strokeWidth="4" strokeLinecap="round" />
          <circle cx="35" cy="49" r="4" fill={FACE} />
          <circle cx="65" cy="49" r="4" fill={FACE} />
          <path d="M36 66 L44 61 L52 66 L60 61 L64 64" stroke={FACE} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 20 L20 26" stroke={FACE} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <path d="M86 20 L80 26" stroke={FACE} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Simple hand-drawn blob "character" for one mood value, colored via the
 * --mood-{value} CSS variable so it automatically follows the active skin
 * (dreamy pastel vs bold vibrant). Purely presentational — animation
 * (wiggle/bounce/scale) is handled by the parent via className/motion.
 */
export default function MoodMascot({ mood, size = 64, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={mood}
    >
      <path d={BLOB_PATH} fill={`var(--mood-${mood})`} />
      <Face mood={mood} />
    </svg>
  );
}
