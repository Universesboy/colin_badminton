import React from 'react';

/*
 * Brand mark. Shares Coach Chalk's tile (8px-radius square in Chalk forest
 * green, white glyph, lime dot) so the two products read as one family;
 * Colin's glyph is a shuttlecock whose cork is the lime "chalk" dot.
 */
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#1F5C45" />
      <path d="M16 6.5 L22.6 19.5 L9.4 19.5 Z" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 6.5V19.5M12.3 13.5h7.4" stroke="#FFFFFF" strokeWidth="1.3" opacity="0.6" />
      <circle cx="16" cy="23.6" r="3.2" fill="#C8E86B" />
    </svg>
  );
}

function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__word">
        Colin <span className="logo__sub">Badminton</span>
      </span>
    </span>
  );
}

export default Logo;
