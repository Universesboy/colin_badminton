import React, { useState } from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import VideoGallery from '../VideoGallery';
import Icon from '../Icon';
import { careerStats, highlightVideos, honours, videoCategories } from '../../data/site';
import './Highlights.css';

const featured = highlightVideos.filter((v) => v.featured);

function Highlights() {
  usePageMeta('Career Highlights', 'Match and tournament highlights of Colin Zhou: CCAA National Championships, OCAA Finals, Ontario Provincial Championships and more.');
  const [category, setCategory] = useState('all');
  const filtered = category === 'all' ? highlightVideos : highlightVideos.filter((v) => v.category === category);

  return (
    <>
      <PageHeader eyebrow="Highlights" title="Career Highlights" lead="Championship moments and competitive excellence">
        <ul className="chip-row highlights-honours" aria-label="Honours">
          {honours.map((h) => (
            <li key={h.label} className="chip">
              <Icon name={h.icon} /> {h.label}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="section section--stage highlights-featured" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Featured</p>
              <h2 id="featured-title" className="h2">
                Championship moments
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Relive the most exciting moments from national and provincial championships. These highlights showcase
              the technical skills, strategic gameplay, and competitive spirit that define my approach to badminton.
            </AnimatedSection>
          </div>
          <VideoGallery videos={featured} size="lg" className="highlights-featured__grid" />
        </div>
      </section>

      <section className="section" aria-labelledby="all-title">
        <div className="container">
          <div className="highlights-toolbar">
            <h2 id="all-title" className="h2">
              Match Highlights
            </h2>
            <div className="chip-row" role="group" aria-label="Filter videos">
              {videoCategories.map((c) => (
                <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} videos
          </p>
          <VideoGallery key={category} videos={filtered} showCategory />
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="stats-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">By the numbers</p>
            <h2 id="stats-title" className="h2">
              Career Statistics
            </h2>
          </AnimatedSection>
          <div className="stats">
            {careerStats.map((s, i) => (
              <AnimatedSection key={s.label} className="stat" delay={i * 90}>
                <span className="stat__value accent-text">{s.value}</span>
                <span className="stat__label">{s.label}</span>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Highlights;
