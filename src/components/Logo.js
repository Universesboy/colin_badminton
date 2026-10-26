import React from 'react';

// Brand mark: a shuttlecock seen from above, cork in smash red.
export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 3 L25 21 L7 21 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 3 L16 21 M11.5 12 L20.5 12 M9.3 16.5 L22.7 16.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <circle cx="16" cy="25" r="4" fill="#e8452c" />
    </svg>
  );
}

function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__word">
        Colin{' '}<span className="logo__sub">Badminton</span>
      </span>
    </span>
  );
}

export default Logo;
