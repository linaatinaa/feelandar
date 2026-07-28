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
    case 'loved':
      return (
        <g>
          <path
            d="M35 40 C31 36 25 38 25 43 C25 47 30 50 35 55 C40 50 45 47 45 43 C45 38 39 36 35 40 Z"
            fill="#ff6f91"
          />
          <path
            d="M65 40 C61 36 55 38 55 43 C55 47 60 50 65 55 C70 50 75 47 75 43 C75 38 69 36 65 40 Z"
            fill="#ff6f91"
          />
          <circle cx="27" cy="60" r="5" fill="#ff9db3" opacity="0.5" />
          <circle cx="73" cy="60" r="5" fill="#ff9db3" opacity="0.5" />
          <path d="M32 62 Q50 82 68 62" stroke={FACE} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'calm':
      return (
        <g>
          <path d="M29 44 Q35 47 41 44" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M59 44 Q65 47 71 44" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M41 63 Q50 67 59 63" stroke={FACE} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M18 30 Q22 26 18 22" stroke={FACE} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M82 30 Q78 26 82 22" stroke={FACE} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>
      );
    case 'excited':
      return (
        <g>
          <path d="M35 39 L37 43 L41 45 L37 47 L35 51 L33 47 L29 45 L33 43 Z" fill={FACE} />
          <path d="M65 39 L67 43 L71 45 L67 47 L65 51 L63 47 L59 45 L63 43 Z" fill={FACE} />
          <ellipse cx="50" cy="65" rx="9" ry="8" fill={FACE} />
          <path d="M15 24 L16.5 27 L19.5 28 L16.5 29 L15 32 L13.5 29 L10.5 28 L13.5 27 Z" fill={FACE} opacity="0.5" />
          <path d="M85 24 L86.5 27 L89.5 28 L86.5 29 L85 32 L83.5 29 L80.5 28 L83.5 27 Z" fill={FACE} opacity="0.5" />
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
    case 'anxious':
      return (
        <g>
          <path d="M28 42 L42 36" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M72 42 L58 36" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="35" cy="47" r="3.5" fill={FACE} />
          <circle cx="65" cy="47" r="3.5" fill={FACE} />
          <path d="M78 30 Q82 36 78 41 Q74 36 78 30 Z" fill="#7fb8ef" opacity="0.85" />
          <path d="M38 65 Q42 61 46 65 Q50 69 54 65 Q58 61 62 65" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'sick':
      return (
        <g>
          <path d="M30 42 L40 50 M40 42 L30 50" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 42 L70 50 M70 42 L60 50" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M38 66 Q44 63 50 66 Q56 69 62 66" stroke={FACE} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <g transform="rotate(-12 50 22)">
            <rect x="41" y="18" width="18" height="8" rx="3.5" fill="#fdf6f0" stroke={FACE} strokeWidth="1.4" />
            <line x1="50" y1="18" x2="50" y2="26" stroke={FACE} strokeWidth="1.2" opacity="0.6" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/**
 * Simple hand-drawn blob "character" for one mood value, colored via the
 * --mood-{value} CSS variable so it automatically follows the active skin.
 * Purely presentational — animation (wiggle/bounce/scale) is handled by the
 * parent via className/motion.
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
