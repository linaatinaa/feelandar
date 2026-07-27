const FACE = 'rgba(28, 20, 40, 0.75)';

export const EYES_OPTIONS = [
  {
    id: 'normal',
    label: 'Biasa',
    node: (
      <g>
        <circle cx="36" cy="46" r="4.5" fill={FACE} />
        <circle cx="64" cy="46" r="4.5" fill={FACE} />
      </g>
    ),
  },
  {
    id: 'wide',
    label: 'Melotot',
    node: (
      <g>
        <circle cx="36" cy="46" r="7.5" fill={FACE} />
        <circle cx="64" cy="46" r="7.5" fill={FACE} />
        <circle cx="33.5" cy="43.5" r="2" fill="#fff" />
        <circle cx="61.5" cy="43.5" r="2" fill="#fff" />
      </g>
    ),
  },
  {
    id: 'closed',
    label: 'Merem',
    node: (
      <g>
        <path d="M29 46 Q36 40 43 46" stroke={FACE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M57 46 Q64 40 71 46" stroke={FACE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'sleepy',
    label: 'Ngantuk',
    node: (
      <g>
        <path d="M29 44 Q36 48 43 44" stroke={FACE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M57 44 Q64 48 71 44" stroke={FACE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
];

export const BROWS_OPTIONS = [
  {
    id: 'normal',
    label: 'Biasa',
    node: (
      <g>
        <line x1="30" y1="36" x2="42" y2="36" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="36" x2="70" y2="36" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'raised',
    label: 'Terangkat',
    node: (
      <g>
        <line x1="29" y1="30" x2="43" y2="33" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
        <line x1="71" y1="30" x2="57" y2="33" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'furrowed',
    label: 'Mengerut',
    node: (
      <g>
        <line x1="29" y1="32" x2="43" y2="38" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
        <line x1="71" y1="32" x2="57" y2="38" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'oneUp',
    label: 'Sebelah Naik',
    node: (
      <g>
        <line x1="30" y1="36" x2="42" y2="36" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
        <line x1="71" y1="27" x2="57" y2="31" stroke={FACE} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
];

export const MOUTH_OPTIONS = [
  {
    id: 'smile',
    label: 'Senyum',
    node: <path d="M35 60 Q50 74 65 60" stroke={FACE} strokeWidth="4" fill="none" strokeLinecap="round" />,
  },
  {
    id: 'open',
    label: 'Terbuka',
    node: <ellipse cx="50" cy="66" rx="8" ry="9" fill={FACE} />,
  },
  {
    id: 'frown',
    label: 'Cemberut',
    node: <path d="M35 70 Q50 58 65 70" stroke={FACE} strokeWidth="4" fill="none" strokeLinecap="round" />,
  },
  {
    id: 'flat',
    label: 'Datar',
    node: <line x1="38" y1="65" x2="62" y2="65" stroke={FACE} strokeWidth="4" strokeLinecap="round" />,
  },
  {
    id: 'smirk',
    label: 'Sinis',
    node: <path d="M40 63 Q50 68 60 60" stroke={FACE} strokeWidth="4" fill="none" strokeLinecap="round" />,
  },
];

export const EXPRESSIONS = [
  { id: 'kaget', label: 'Kaget Banget', emoji: '😲', eyes: 'wide', brows: 'raised', mouth: 'open' },
  { id: 'marah', label: 'Marah', emoji: '😠', eyes: 'normal', brows: 'furrowed', mouth: 'frown' },
  { id: 'ngantuk', label: 'Ngantuk', emoji: '😴', eyes: 'sleepy', brows: 'normal', mouth: 'flat' },
  { id: 'ketawa', label: 'Ketawa Lepas', emoji: '😆', eyes: 'closed', brows: 'raised', mouth: 'open' },
  { id: 'skeptis', label: 'Skeptis', emoji: '🤨', eyes: 'normal', brows: 'oneUp', mouth: 'smirk' },
];
