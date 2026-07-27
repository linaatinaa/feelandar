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
