import React from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import VideoGallery from '../VideoGallery';
import { methodology, trainingVideos } from '../../data/site';
import './Training.css';

function Training() {
  usePageMeta('Training Programs', 'Badminton training videos and methodology from coach Colin Zhou: footwork, smash technique, defence, net play and conditioning.');

  return (
    <>
      <PageHeader eyebrow="Training" title="Training Programs" lead="Professional techniques and drills to elevate your game" />

      <section className="section" aria-labelledby="philosophy-title">
        <div className="container training-intro">
          <AnimatedSection>
            <p className="eyebrow">Philosophy</p>
            <h2 id="philosophy-title" className="h2">
              My Training Philosophy
            </h2>
          </AnimatedSection>
          <AnimatedSection className="training-intro__text" delay={100}>
            <p className="lead">
              My approach to badminton training combines technical precision, tactical awareness, and physical
              conditioning. Each session is designed to develop specific skills while building overall game
              understanding and court presence.
            </p>
            <p>
              Whether you're a beginner looking to master the basics or an advanced player refining your competitive
              edge, these training videos demonstrate the techniques and drills I use with students at all levels.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section section--stage" aria-labelledby="videos-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Watch</p>
            <h2 id="videos-title" className="h2">
              Training Videos
            </h2>
          </AnimatedSection>
          <VideoGallery videos={trainingVideos} />
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="method-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Method</p>
            <h2 id="method-title" className="h2">
              Training Methodology
            </h2>
          </AnimatedSection>
          <div className="grid grid--4">
            {methodology.map((m, i) => (
              <AnimatedSection key={m.title} className="tile" delay={i * 90}>
                <span className="tile__index">0{i + 1}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Training;
