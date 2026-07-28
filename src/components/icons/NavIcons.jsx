export function HomeIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <path
        d="M5 13.5L14 5l9 8.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11.5V22a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V11.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11.5 23.2v-6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <rect x="4.5" y="7" width="19" height="17" rx="3" stroke="currentColor" strokeWidth="2.3" />
      <path d="M4.5 12.2h19" stroke="currentColor" strokeWidth="2.3" />
      <path d="M9.5 4.5v5M18.5 4.5v5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="9.7" cy="17.2" r="1.3" fill="currentColor" />
      <circle cx="14" cy="17.2" r="1.3" fill="currentColor" />
      <circle cx="18.3" cy="17.2" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function HabitIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <rect x="5.5" y="5.5" width="17" height="18.5" rx="3" stroke="currentColor" strokeWidth="2.3" />
      <path
        d="M10.3 4.2h7.4a1 1 0 0 1 1 1v1.4a1 1 0 0 1-1 1h-7.4a1 1 0 0 1-1-1V5.2a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9.5 15l2.1 2.1 4.9-4.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20.2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function WalletIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <path
        d="M6 8.5A2.5 2.5 0 0 1 8.5 6h11A2.5 2.5 0 0 1 22 8.5v1"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <rect x="4" y="9.5" width="20" height="13.5" rx="3.2" stroke="currentColor" strokeWidth="2.3" />
      <circle cx="17.8" cy="16.2" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function GameIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <path
        d="M8 9.5h12a5 5 0 0 1 5 5.7l-.7 4.3a3 3 0 0 1-5.3 1.4l-1.6-2.1a2 2 0 0 0-1.6-.8h-2.6a2 2 0 0 0-1.6.8l-1.6 2.1a3 3 0 0 1-5.3-1.4l-.7-4.3a5 5 0 0 1 5-5.7Z"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M10.8 14.5v3M9.3 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="19" cy="14" r="1.15" fill="currentColor" />
      <circle cx="21.3" cy="16.3" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function ProfileIcon({ className, style }) {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" className={className} style={style} fill="none">
      <circle cx="14" cy="9.5" r="4.7" stroke="currentColor" strokeWidth="2.3" />
      <path
        d="M4.5 23.5c0-5.6 4.5-8.3 9.5-8.3s9.5 2.7 9.5 8.3"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path d="M11 9.2c.5.8 1.5 1.3 3 .3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
