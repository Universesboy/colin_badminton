import React from 'react';

// Inline line icons (24px grid, currentColor). Replaces the two Font Awesome
// stylesheets the site used to load for a handful of glyphs.
const PATHS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  play: <path d="M8 5.5v13l10.5-6.5L8 5.5z" fill="currentColor" stroke="none" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 8h16M4 16h16" />,
  prev: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" />
      <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5" />
      <path d="M8.5 11.5L6 3h4l2 5 2-5h4l-2.5 8.5" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z" />,
  whistle: (
    <>
      <circle cx="9" cy="14" r="5" />
      <path d="M13 11l8-4v4l-5 2M9 14h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </>
  ),
  phone: <path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 006 6l1.5-2 4.5 1.5V19a1.5 1.5 0 01-1.5 1.5A16.5 16.5 0 013.5 5.5 1.5 1.5 0 015 4z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8L10 9.2z" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M4.5 4h4.2l10.8 16h-4.2L4.5 4zM19 4l-5.9 6.7M5 20l5.9-6.7" />,
  whatsapp: (
    <>
      <path d="M4 20l1.2-4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1L4 20z" />
      <path d="M9.2 8.6c.2-.4.6-.4.9 0l.8 1.4c.1.3 0 .6-.2.8l-.5.5a5.6 5.6 0 002.8 2.8l.5-.5c.2-.2.5-.3.8-.2l1.4.8c.4.3.4.7 0 .9-.9.7-2 .9-3 .4a8 8 0 01-3.9-3.9c-.5-1-.3-2.1.4-3z" fill="currentColor" stroke="none" />
    </>
  ),
  wechat: (
    <>
      <path d="M15.5 9.2C15 6.3 12.2 4 8.8 4 5 4 2 6.7 2 10c0 1.9 1 3.6 2.6 4.7L4 17l2.6-1.3c.7.2 1.4.3 2.2.3h.4" />
      <path d="M22 14.3c0-2.7-2.6-4.8-5.7-4.8s-5.7 2.1-5.7 4.8 2.6 4.8 5.7 4.8c.6 0 1.2-.1 1.8-.3l2.1 1.1-.5-1.9c1.4-.9 2.3-2.2 2.3-3.7z" />
    </>
  ),
  shuttle: (
    <>
      <circle cx="17.5" cy="17.5" r="3" />
      <path d="M15.4 15.4L5 5M15.4 15.4L8.5 3.5M15.4 15.4L3.5 8.5M5 5l3.5-1.5M5 5L3.5 8.5" />
    </>
  ),
};

function Icon({ name, size, className, title }) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {content}
    </svg>
  );
}

export default Icon;
