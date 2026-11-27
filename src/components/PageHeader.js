import React, { useEffect } from 'react';

const SITE = 'Colin Badminton';

// Sets the document title and meta description for the current route.
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `Colin Zhou — Badminton Athlete & Coach | ${SITE}`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
    // Drop trailing slashes so /contact/ and /contact share one canonical URL
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://colinbadminton.com${path}`);
  }, [title, description]);
}

// Half-court plan drawn in court-line hairlines, used as a quiet backdrop.
export function CourtLines() {
  return (
    <svg viewBox="0 0 610 670" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="608" height="668" />
      <line x1="47" y1="1" x2="47" y2="669" />
      <line x1="563" y1="1" x2="563" y2="669" />
      <line x1="1" y1="77" x2="609" y2="77" />
      <line x1="1" y1="472" x2="609" y2="472" />
      <line x1="305" y1="1" x2="305" y2="472" />
      <line x1="1" y1="669" x2="609" y2="669" strokeWidth="6" />
    </svg>
  );
}

function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <section className="page-header section--stage">
      <div className="page-header__lines">
        <CourtLines />
      </div>
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children && <div className="page-header__extra">{children}</div>}
      </div>
    </section>
  );
}

export default PageHeader;
