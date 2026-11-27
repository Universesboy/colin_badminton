import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import HeroStage from './HeroStage';
import useParallax from './useParallax';
import { credentials, profile } from '../data/site';
import './HeroSection.css';

function HeroSection() {
  const ref = useRef(null);
  useParallax(ref);

  return (
    <section ref={ref} className="hero section--stage" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="court-grid" />
        <HeroStage className="hero__canvas" />
        <div className="hero__vignette" />
      </div>

      <div className="hero__inner container">
        <div className="hero__figure" aria-hidden="true">
          <span className="hero__halo" />
          <span className="hero__year">2023</span>
          <img
            className="hero__athlete"
            src="/media/athlete-cutout.webp"
            width="596"
            height="1086"
            alt=""
            fetchpriority="high"
            decoding="async"
          />
          <span className="hero__badge">
            <Icon name="trophy" size={18} />
            <span>
              <strong>National Champion</strong>
              <small>CCAA Men's Singles · 2023</small>
            </span>
          </span>
        </div>

        <div className="hero__copy">
          <p className="pill hero__pill">
            <span className="pill__dot" aria-hidden="true" />
            {profile.brand} · Athlete &amp; Coach
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Colin</span>
            </span>
            <span className="hero__line hero__line--outline">
              <span>Zhou</span>
            </span>
            <span className="sr-only"> — badminton athlete and professional coach</span>
          </h1>
          <p className="hero__lead">
            <strong>2023 CCAA Men's Singles National Champion.</strong> Former Sichuan Provincial Team men's singles
            player, now a senior coach in Canada teaching in English and Chinese.
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="btn">
              Train with Colin <Icon name="arrow" />
            </Link>
            <Link to="/highlights" className="btn btn--ghost">
              <Icon name="play" /> Watch highlights
            </Link>
          </div>
        </div>
      </div>

      <div className="container hero__rail-wrap">
        <ul className="hero__rail" aria-label="Career credentials">
          {credentials.map((c, i) => (
            <li key={c.label} style={{ '--i': i }}>
              <span className="hero__rail-value">{c.value}</span>
              <span className="hero__rail-label">{c.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default HeroSection;
