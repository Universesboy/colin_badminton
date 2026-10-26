import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { profile } from '../data/site';
import './HeroSection.css';

const CourtScene = lazy(() => import('./CourtScene'));

function HeroSection() {
  return (
    <section className="hero section--stage" aria-labelledby="hero-title">
      <div className="hero__scene" aria-hidden="true">
        <Suspense fallback={null}>
          <CourtScene className="hero__canvas" />
        </Suspense>
        <div className="hero__vignette" />
      </div>

      <div className="hero__inner container">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">{profile.brand} · Athlete &amp; Coach</p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Colin</span>
            </span>
            <span className="hero__line">
              <span>Zhou</span>
            </span>
          </h1>
          <p className="hero__lead">
            <strong>2023 CCAA Men's Singles National Champion.</strong> Former Sichuan Provincial Team player and
            senior badminton coach.
          </p>
          <div className="hero__actions">
            <Link to="/highlights" className="btn">
              <Icon name="play" /> Watch highlights
            </Link>
            <Link to="/contact" className="btn btn--ghost hero__ghost">
              Train with Colin <Icon name="arrow" />
            </Link>
          </div>
        </div>

        <figure className="hero__photo">
          <img
            src="/media/jump-smash.webp"
            width="1170"
            height="775"
            alt="Colin Zhou mid-air in a jump smash at the National Championships"
            fetchpriority="high"
            decoding="async"
          />
          <figcaption>Jump smash · National Championships</figcaption>
        </figure>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

export default HeroSection;
